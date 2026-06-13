// ═══════════════════════════════════════════════════
//  ÁLBUM MUNDIAL 2026 — feed.js
//  Sistema de feed social con filtros por categoría
// ═══════════════════════════════════════════════════
import { supabase } from './supabase.js'
import { getCatDef as getCreatorCatDef } from './creadores.js'

// ── Categorías disponibles ────────────────────────
export const FEED_CATEGORIES = [
  { id: 'album',    label: 'Álbum',             icon: '📘', color: '#f5c518' },
  { id: 'mundial',  label: 'Mundial 2026',       icon: '🌍', color: '#34d399' },
  { id: 'fichajes', label: 'Mercado de Fichajes',icon: '💸', color: '#60a5fa' },
]

const CAT_MAP = Object.fromEntries(FEED_CATEGORIES.map(c => [c.id, c]))

// ── Estado del feed ───────────────────────────────
let _userId        = null
let _activeFilters = []      // hasta 3 categorías activas
let _mutes         = {}      // { category: mutedUntil|null }
let _posts         = []
let _profilesCache   = {}   // { userId: {username, avatar_url, full_name} }
let _creatorCache    = {}   // { userId: true/false }
let _page          = 0
const PAGE_SIZE    = 15

// ── Init ──────────────────────────────────────────
export async function initFeed(userId) {
  _userId = userId
  await Promise.all([loadPreferences(), loadMutes()])
  renderCategorySelector()
  await loadFeed()
  subscribeReactions()
}

// ── Suscripción realtime a reacciones ─────────────
let _reactionSub = null
function subscribeReactions() {
  _reactionSub?.unsubscribe()
  _reactionSub = supabase
    .channel('feed_reactions')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'post_reactions',
    }, payload => {
      const postId = payload.new?.post_id || payload.old?.post_id
      if (!postId) return
      updatePostReactionCount(postId)
    })
    .subscribe()
}

async function updatePostReactionCount(postId) {
  try {
    const { count } = await supabase
      .from('post_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)

    // Actualizar todos los elementos del feed con ese post_id
    document.querySelectorAll(`.feed-post[data-post-id="${postId}"] .fp-apoyo-count`)
      .forEach(el => { el.textContent = count ?? 0 })
  } catch (e) { console.warn('[feed] updateReactionCount:', e) }
}

// ── Preferencias ──────────────────────────────────
async function loadPreferences() {
  if (!_userId) return
  try {
    const { data } = await supabase
      .from('feed_preferences')
      .select('active_filters')
      .eq('user_id', _userId)
      .maybeSingle()
    _activeFilters = data?.active_filters || []
  } catch (e) { _activeFilters = [] }
}

async function savePreferences() {
  if (!_userId) return
  try {
    await supabase.from('feed_preferences').upsert(
      { user_id: _userId, active_filters: _activeFilters, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
  } catch (e) { console.warn('[feed] savePreferences:', e) }
}

// ── Silenciar categoría temporalmente ─────────────
async function loadMutes() {
  if (!_userId) return
  try {
    const { data } = await supabase
      .from('content_mutes')
      .select('category, muted_until')
      .eq('user_id', _userId)
    _mutes = {}
    const now = new Date().toISOString()
    ;(data || []).forEach(m => {
      if (!m.muted_until || m.muted_until > now) {
        _mutes[m.category] = m.muted_until
      }
    })
  } catch (e) { _mutes = {} }
}

export async function muteCategory(category, hours = 24) {
  if (!_userId) return
  const until = new Date(Date.now() + hours * 3600000).toISOString()
  _mutes[category] = until
  // Quitar del filtro activo si estaba
  _activeFilters = _activeFilters.filter(f => f !== category)
  renderCategorySelector()
  await supabase.from('content_mutes').upsert(
    { user_id: _userId, category, muted_until: until },
    { onConflict: 'user_id,category' }
  )
  await loadFeed()
}

// ── Cargar posts ──────────────────────────────────
export async function loadFeed(append = false) {
  const container = document.getElementById('feed-posts')
  if (!container) return

  if (!append) {
    _page = 0
    _posts = []
    container.innerHTML = '<div class="feed-loading">Cargando…</div>'
  }

  try {
    // Categorías efectivas: filtros activos sin silenciados
    const effectiveCats = _activeFilters.length
      ? _activeFilters.filter(f => !_mutes[f])
      : FEED_CATEGORIES.map(c => c.id).filter(id => !_mutes[id])

    let query = supabase
      .from('posts')
      .select(`
        id, content, category, media_url, created_at, user_id,
        post_reactions(count)
      `)
      .order('created_at', { ascending: false })
      .range(_page * PAGE_SIZE, (_page + 1) * PAGE_SIZE - 1)

    if (effectiveCats.length) {
      query = query.in('category', effectiveCats)
    }

    const { data, error } = await query
    if (error) throw error

    // Cargar perfiles de autores no cacheados
    const unknownIds = [...new Set((data || []).map(p => p.user_id))]
      .filter(id => !_profilesCache[id])
    if (unknownIds.length) {
      const [{ data: profiles }, { data: creators }] = await Promise.all([
        supabase.from('profiles').select('id, username, full_name, avatar_url').in('id', unknownIds),
        supabase.from('creator_profiles').select('user_id').eq('is_active', true).in('user_id', unknownIds),
      ])
      ;(profiles || []).forEach(p => { _profilesCache[p.id] = p })
      ;(creators || []).forEach(c => { _creatorCache[c.user_id] = true })
    }

    // Cargar mis reacciones en este lote
    let myReactions = new Set()
    if (_userId && data?.length) {
      const ids = data.map(p => p.id)
      const { data: rcts } = await supabase
        .from('post_reactions')
        .select('post_id')
        .eq('user_id', _userId)
        .in('post_id', ids)
      myReactions = new Set((rcts || []).map(r => r.post_id))
    }

    const newPosts = (data || []).map(p => ({
      ...p,
      reactCount: p.post_reactions?.[0]?.count || 0,
      iApoyé: myReactions.has(p.id),
    }))

    if (!append) {
      _posts = newPosts
      container.innerHTML = ''
    } else {
      _posts = [..._posts, ...newPosts]
    }

    if (!_posts.length) {
      container.innerHTML = renderEmptyState()
      return
    }

    if (append) {
      newPosts.forEach(p => {
        const el = document.createElement('div')
        el.innerHTML = renderPost(p)
        const card = el.firstElementChild
        container.appendChild(card)
        bindPost(card, p)
      })
    } else {
      newPosts.forEach(p => {
        const el = document.createElement('div')
        el.innerHTML = renderPost(p)
        const card = el.firstElementChild
        container.appendChild(card)
        bindPost(card, p)
      })
    }

    // Botón de más
    document.getElementById('feed-load-more')?.remove()
    if ((data?.length || 0) === PAGE_SIZE) {
      const btn = document.createElement('button')
      btn.id = 'feed-load-more'
      btn.className = 'feed-load-more-btn'
      btn.textContent = 'Ver más'
      btn.addEventListener('click', () => { _page++; loadFeed(true) })
      container.appendChild(btn)
    }
  } catch (e) {
    console.error('[feed] loadFeed error:', e)
    container.innerHTML = '<div class="feed-error">Error cargando el feed. Intenta de nuevo.</div>'
  }
}

// ── Renderizar post ───────────────────────────────
function renderPost(p) {
  const profile = _profilesCache[p.user_id] || {}
  const cat     = CAT_MAP[p.category] || {}
  const initials = (profile.full_name || profile.username || '?')
    .trim().split(/\s+/).slice(0,2).map(x => x[0]).join('').toUpperCase()
  const timeAgo = formatRelTime(p.created_at)

  return `
    <article class="feed-post" data-post-id="${p.id}">
      <div class="fp-header">
        <div class="fp-avatar">
          ${profile.avatar_url
            ? `<img src="${profile.avatar_url}" alt="" class="fp-avatar-img">`
            : `<span class="fp-avatar-fb">${initials}</span>`}
        </div>
        <div class="fp-meta">
          <div class="fp-author">
          ${esc(profile.full_name || profile.username || 'Usuario')}
          ${_creatorCache[p.user_id] ? '<span class="fp-creator-badge">🎙️</span>' : ''}
        </div>
          <div class="fp-sub">
            <a class="fp-username" href="/perfil/${encodeURIComponent(profile.username || '')}">@${esc(profile.username || '?')}</a>
            <span class="fp-dot">·</span>
            <span class="fp-time">${timeAgo}</span>
          </div>
        </div>
        <span class="fp-cat-badge" style="--cat-color:${cat.color||'var(--gold)'}">
          ${cat.icon || '⚽'} ${cat.label || p.category}
        </span>
        <div class="fp-menu-wrap">
          <button class="fp-menu-btn" aria-label="Opciones" data-post="${p.id}">⋯</button>
          <div class="fp-menu" id="menu-${p.id}" style="display:none">
            <button class="fp-menu-item fp-mute-btn" data-cat="${p.category}">
              ⏳ No quiero ver ${cat.label || p.category} ahora
            </button>
            ${p.user_id === _userId
              ? `<button class="fp-menu-item fp-edit-btn" data-post="${p.id}">✏️ Editar</button>
               <button class="fp-menu-item fp-delete-btn" data-post="${p.id}">🗑️ Eliminar</button>`
              : ''}
          </div>
        </div>
      </div>

      <div class="fp-content">${esc(p.content)}</div>

      ${p.media_url ? `<div class="fp-media">
        <img src="${p.media_url}" alt="Imagen del post" class="fp-img" loading="lazy"
          onerror="this.parentElement.style.display='none'">
      </div>` : ''}

      <div class="fp-actions">
        <button class="fp-apoyo-btn${p.iApoyé ? ' active' : ''}" data-post="${p.id}" aria-label="Apoyar">
          <span class="fp-apoyo-icon">🏆</span>
          <span class="fp-apoyo-count">${p.reactCount}</span>
        </button>
        <button class="fp-share-btn" data-post="${p.id}" aria-label="Compartir">
          <span>🔗</span> Compartir
        </button>
      </div>
    </article>`
}

function renderEmptyState() {
  const filtered = _activeFilters.length > 0
  return `
    <div class="feed-empty">
      <div class="feed-empty-icon">⚽</div>
      <div class="feed-empty-title">${filtered ? 'Sin posts en estas categorías' : 'El feed está vacío'}</div>
      <div class="feed-empty-sub">${filtered
        ? 'Prueba seleccionando otras categorías o sé el primero en publicar.'
        : 'Sé el primero en publicar algo.'}</div>
    </div>`
}

// ── Bind eventos en cada post ─────────────────────
function bindPost(card, p) {
  // Apoyo
  card.querySelector('.fp-apoyo-btn')?.addEventListener('click', async () => {
    if (!_userId) { showFeedToast('Inicia sesión para apoyar'); return }
    await toggleApoyo(p, card)
  })

  // Menú
  const menuBtn = card.querySelector('.fp-menu-btn')
  const menu    = card.querySelector(`#menu-${p.id}`)
  menuBtn?.addEventListener('click', e => {
    e.stopPropagation()
    menu.style.display = menu.style.display === 'none' ? '' : 'none'
  })
  document.addEventListener('click', () => { if (menu) menu.style.display = 'none' }, { once: false })

  // No ahora
  card.querySelector('.fp-mute-btn')?.addEventListener('click', async () => {
    const cat = card.querySelector('.fp-mute-btn').dataset.cat
    await muteCategory(cat, 24)
    card.classList.add('fp-fade-out')
    setTimeout(() => card.remove(), 350)
    showFeedToast(`⏳ No verás más "${CAT_MAP[cat]?.label || cat}" por 24 horas`)
  })

  // Editar
  card.querySelector('.fp-edit-btn')?.addEventListener('click', () => {
    openEditModal(p, card)
  })

  // Eliminar
  card.querySelector('.fp-delete-btn')?.addEventListener('click', async () => {
    if (!confirm('¿Eliminar este post?')) return
    await supabase.from('posts').delete().eq('id', p.id)
    card.classList.add('fp-fade-out')
    setTimeout(() => card.remove(), 350)
  })

  // Compartir
  card.querySelector('.fp-share-btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.origin + '/?post=' + p.id)
      .then(() => showFeedToast('🔗 Enlace copiado'))
      .catch(() => {})
  })
}

// ── Apoyo en posts ────────────────────────────────
async function toggleApoyo(p, card) {
  const btn   = card.querySelector('.fp-apoyo-btn')
  const count = card.querySelector('.fp-apoyo-count')
  const wasActive = btn.classList.contains('active')

  // Optimistic UI
  btn.classList.toggle('active', !wasActive)
  count.textContent = parseInt(count.textContent) + (wasActive ? -1 : 1)
  btn.disabled = true

  try {
    if (wasActive) {
      await supabase.from('post_reactions')
        .delete().eq('post_id', p.id).eq('user_id', _userId)
    } else {
      await supabase.from('post_reactions')
        .upsert({ post_id: p.id, user_id: _userId }, { onConflict: 'post_id,user_id' })
    }
  } catch (e) {
    // Revert
    btn.classList.toggle('active', wasActive)
    count.textContent = parseInt(count.textContent) + (wasActive ? 1 : -1)
  } finally {
    btn.disabled = false
  }
}

// ── Selector de categorías ────────────────────────
function renderCategorySelector() {
  const sel = document.getElementById('feed-cat-selector')
  if (!sel) return

  sel.innerHTML = FEED_CATEGORIES.map(cat => {
    const isActive  = _activeFilters.includes(cat.id)
    const isMuted   = !!_mutes[cat.id]
    return `
      <button class="feed-cat-btn${isActive ? ' active' : ''}${isMuted ? ' muted' : ''}"
        data-cat="${cat.id}" style="--cat-color:${cat.color}"
        title="${isMuted ? 'Silenciada temporalmente' : ''}">
        <span class="feed-cat-icon">${cat.icon}</span>
        <span class="feed-cat-label">${cat.label}</span>
        ${isMuted ? '<span class="feed-cat-muted-icon">⏳</span>' : ''}
      </button>`
  }).join('')

  sel.querySelectorAll('.feed-cat-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const cat = btn.dataset.cat
      if (_mutes[cat]) {
        // Dessilenciar si hace clic en una silenciada
        delete _mutes[cat]
        await supabase.from('content_mutes')
          .delete().eq('user_id', _userId).eq('category', cat)
        renderCategorySelector()
        return
      }

      if (_activeFilters.includes(cat)) {
        _activeFilters = _activeFilters.filter(f => f !== cat)
      } else {
        if (_activeFilters.length >= 3) {
          showFeedToast('Máximo 3 categorías activas')
          return
        }
        _activeFilters.push(cat)
      }

      renderCategorySelector()
      await savePreferences()
      await loadFeed()
    })
  })

  // Sorpréndeme
  const srp = document.getElementById('feed-surprise-btn')
  if (srp) {
    srp.onclick = async () => {
      _activeFilters = []
      renderCategorySelector()
      await savePreferences()
      await loadFeed()
      showFeedToast('🎲 ¡Sorpréndeme activado!')
    }
  }
}

// ── Editar post propio ────────────────────────────
function openEditModal(post, card) {
  document.getElementById('edit-modal')?.remove()

  const cat = CAT_MAP[post.category] || {}
  const modal = document.createElement('div')
  modal.id = 'edit-modal'
  modal.className = 'compose-backdrop'
  modal.innerHTML = `
    <div class="compose-box">
      <div class="compose-header">
        <div class="compose-title">✏️ Editar post</div>
        <button class="compose-close" id="edit-close" aria-label="Cerrar">✕</button>
      </div>
      <div class="compose-cats">
        <span class="compose-cats-label">Categoría</span>
        <div class="compose-cat-btns">
          <span class="compose-cat-btn active" style="--cat-color:${cat.color||'var(--gold)'}">
            ${cat.icon || '⚽'} ${cat.label || post.category}
          </span>
        </div>
      </div>
      <textarea class="compose-textarea" id="edit-text"
        maxlength="500">${esc(post.content)}</textarea>
      <div class="compose-footer">
        <div class="compose-char-count"><span id="edit-chars">${post.content.length}</span>/500</div>
        <div class="compose-actions">
          <input type="url" class="compose-img-url" id="edit-img-url"
            placeholder="URL de imagen (opcional)"
            value="${post.media_url || ''}">
          <button class="compose-submit" id="edit-submit">Guardar cambios</button>
        </div>
      </div>
    </div>`

  const closeModal = () => {
    modal.classList.add('compose-hiding')
    setTimeout(() => modal.remove(), 300)
  }

  modal.querySelector('#edit-close').addEventListener('click', closeModal)
  modal.addEventListener('click', e => { if (e.target === modal) closeModal() })
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', esc) }
  })

  modal.querySelector('#edit-text').addEventListener('input', function() {
    modal.querySelector('#edit-chars').textContent = this.value.length
  })

  modal.querySelector('#edit-submit').addEventListener('click', async () => {
    const content   = modal.querySelector('#edit-text').value.trim()
    const media_url = modal.querySelector('#edit-img-url').value.trim() || null
    if (!content) return

    const btn = modal.querySelector('#edit-submit')
    btn.disabled = true; btn.textContent = 'Guardando…'

    try {
      const { error } = await supabase
        .from('posts')
        .update({ content, media_url })
        .eq('id', post.id)
        .eq('user_id', _userId)

      if (error) throw error

      // Actualizar el DOM del post sin recargar el feed
      const contentEl = card.querySelector('.fp-content')
      if (contentEl) contentEl.textContent = content

      const mediaEl = card.querySelector('.fp-media')
      if (media_url && mediaEl) {
        mediaEl.innerHTML = `<img src="${media_url}" alt="Imagen del post" class="fp-img" loading="lazy"
          onerror="this.parentElement.style.display='none'">`
        mediaEl.style.display = ''
      } else if (!media_url && mediaEl) {
        mediaEl.style.display = 'none'
      }

      // Actualizar el objeto en memoria
      post.content   = content
      post.media_url = media_url

      closeModal()
      showFeedToast('✅ Post actualizado')
    } catch (e) {
      console.error('[feed] edit error:', e)
      btn.disabled = false; btn.textContent = 'Error, reintentar'
    }
  })

  document.body.appendChild(modal)
  requestAnimationFrame(() => modal.classList.add('compose-visible'))
  const textarea = modal.querySelector('#edit-text')
  textarea.focus()
  textarea.setSelectionRange(textarea.value.length, textarea.value.length)
}

// ── Crear post ────────────────────────────────────
export async function openComposeModal(userId) {
  if (!userId) { showFeedToast('Inicia sesión para publicar'); return }

  // Si el usuario es creador, mostrar SUS categorías propuestas
  let composeCats = FEED_CATEGORIES
  try {
    const { data: cp } = await supabase
      .from('creator_profiles')
      .select('proposed_categories')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle()
    if (cp?.proposed_categories?.length) {
      composeCats = cp.proposed_categories.map(id => getCreatorCatDef(id))
    }
  } catch (e) { /* fallback a FEED_CATEGORIES */ }

  document.getElementById('compose-modal')?.remove()

  const modal = document.createElement('div')
  modal.id = 'compose-modal'
  modal.className = 'compose-backdrop'
  modal.innerHTML = `
    <div class="compose-box">
      <div class="compose-header">
        <div class="compose-title">✍️ Nuevo post</div>
        <button class="compose-close" id="compose-close" aria-label="Cerrar">✕</button>
      </div>
      <div class="compose-cats">
        <span class="compose-cats-label">Categoría</span>
        <div class="compose-cat-btns">
          ${composeCats.map(c => `
            <button class="compose-cat-btn" data-cat="${c.id}" style="--cat-color:${c.color}">
              ${c.icon} ${c.label}
            </button>`).join('')}
        </div>
      </div>
      <textarea class="compose-textarea" id="compose-text"
        placeholder="¿Qué está pasando en el fútbol?" maxlength="500"></textarea>
      <div class="compose-footer">
        <div class="compose-char-count"><span id="compose-chars">0</span>/500</div>
        <div class="compose-actions">
          <input type="url" class="compose-img-url" id="compose-img-url"
            placeholder="URL de imagen (opcional)">
          <button class="compose-submit" id="compose-submit" disabled>Publicar</button>
        </div>
      </div>
    </div>`

  let selectedCat = _activeFilters[0] || null

  // Select first cat if prefiltered
  const updateSubmit = () => {
    const text = modal.querySelector('#compose-text').value.trim()
    modal.querySelector('#compose-submit').disabled = !text || !selectedCat
  }

  modal.querySelectorAll('.compose-cat-btn').forEach(btn => {
    if (btn.dataset.cat === selectedCat) btn.classList.add('active')
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.compose-cat-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      selectedCat = btn.dataset.cat
      updateSubmit()
    })
  })

  modal.querySelector('#compose-text').addEventListener('input', function() {
    modal.querySelector('#compose-chars').textContent = this.value.length
    updateSubmit()
  })

  modal.querySelector('#compose-submit').addEventListener('click', async () => {
    const content   = modal.querySelector('#compose-text').value.trim()
    const media_url = modal.querySelector('#compose-img-url').value.trim() || null
    if (!content || !selectedCat) return

    const btn = modal.querySelector('#compose-submit')
    btn.disabled = true; btn.textContent = 'Publicando…'

    try {
      const { data, error } = await supabase.from('posts')
        .insert({ user_id: userId, content, category: selectedCat, media_url })
        .select().single()
      if (error) throw error

      closeModal()
      showFeedToast('✅ Post publicado')
      // Insertar al inicio del feed
      const container = document.getElementById('feed-posts')
      if (container) {
        const profile = _profilesCache[userId]
        const newP = { ...data, reactCount: 0, iApoyé: false }
        const el = document.createElement('div')
        el.innerHTML = renderPost(newP)
        const card = el.firstElementChild
        container.prepend(card)
        bindPost(card, newP)
        card.classList.add('fp-new')
      }
    } catch (e) {
      console.error('[feed] publish error:', e)
      btn.disabled = false; btn.textContent = 'Error, reintentar'
    }
  })

  const closeModal = () => {
    modal.classList.add('compose-hiding')
    setTimeout(() => modal.remove(), 300)
  }
  modal.querySelector('#compose-close').addEventListener('click', closeModal)
  modal.addEventListener('click', e => { if (e.target === modal) closeModal() })
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', esc) }
  })

  document.body.appendChild(modal)
  requestAnimationFrame(() => modal.classList.add('compose-visible'))
  modal.querySelector('#compose-text').focus()
}

// ── Utils ─────────────────────────────────────────
function esc(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function formatRelTime(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'ahora'
  if (m < 60) return `hace ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h/24)}d`
}

export function showFeedToast(msg) {
  const t = document.createElement('div')
  t.className = 'feed-toast'
  t.textContent = msg
  document.body.appendChild(t)
  requestAnimationFrame(() => t.classList.add('feed-toast-in'))
  setTimeout(() => {
    t.classList.remove('feed-toast-in')
    setTimeout(() => t.remove(), 350)
  }, 2800)
}
