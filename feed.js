// ═══════════════════════════════════════════════════
//  ÁLBUM MUNDIAL 2026 — feed.js
//  Sistema de feed social con filtros por categoría
// ═══════════════════════════════════════════════════
import { supabase } from './supabase.js'
import { getCatDef as getCreatorCatDef, loadTalentosOcultos } from './creadores.js'

// ── Categorías disponibles ────────────────────────
export const FEED_CATEGORIES = [
  { id: 'album',    label: 'Álbum',             icon: '📘', color: '#f5c518' },
  { id: 'mundial',  label: 'Mundial 2026',       icon: '🌍', color: '#34d399' },
  { id: 'fichajes', label: 'Mercado de Fichajes',icon: '💸', color: '#60a5fa' },
  { id: 'tactica',     label: 'Análisis táctico',   icon: '🧠', color: '#a78bfa' },
  { id: 'humor',       label: 'Humor futbolero',    icon: '😂', color: '#fb923c' },
  { id: 'noticias',    label: 'Noticias',           icon: '📰', color: '#94a3b8' },
  { id: 'equipo',      label: 'Mi equipo',          icon: '🏟️', color: '#f472b6' },
  { id: 'femenino',    label: 'Fútbol femenino',    icon: '⚽', color: '#e879f9' },
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

// ── Anti-burbuja (mezcla creadores pequeños) ──────
// Cálculo en cliente: reutiliza loadTalentosOcultos() de creadores.js (ya trae
// la calidad reacciones/post). Se cachea con TTL para no recalcular en cada
// scroll/página — si el feed crece mucho, esto debería migrar a una vista
// materializada en Postgres recalculada por cron, pero hoy no hay backend
// propio más allá de Postgres+RLS, así que el cliente es la opción pragmática.
let _discoveryPool   = []
let _discoveryPoolAt = 0
const DISCOVERY_TTL   = 5 * 60000   // 5 min
const DISCOVERY_RATIO = 0.12        // ~12% del feed normal

// ── Modo "Sorpréndeme" ─────────────────────────────
let _surpriseMode    = false
let _surpriseReason  = null   // { topCategory, suggestedCategory }
let _surprisePool    = []
let _surprisePoolAt  = 0
const SURPRISE_TTL    = 5 * 60000
const SURPRISE_RATIO  = 0.25        // más notorio: el usuario lo activó a propósito

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

export async function muteCategory(category, duration = 'today') {
  if (!_userId) return
  const until = computeMuteUntil(duration)
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

// duration: 'today' (hasta medianoche local) | 'week' (7 días)
// Compat: también acepta un número (horas), como en la versión anterior de
// muteCategory, por si quedara algún otro archivo (notifications.js, etc.)
// invocándola con ese formato — si encuentras una llamada así, avísame para
// migrarla al nuevo formato.
function computeMuteUntil(duration) {
  const now = new Date()
  if (typeof duration === 'number') {
    return new Date(now.getTime() + duration * 3600000).toISOString()
  }
  if (duration === 'week') {
    return new Date(now.getTime() + 7 * 24 * 3600000).toISOString()
  }
  // 'today' → próxima medianoche local
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return midnight.toISOString()
}

// ── Cargar posts ──────────────────────────────────
// append=false puede significar dos cosas muy distintas:
//  - "carga en frío" (no hay nada renderizado todavía) → se muestra spinner y
//    se reconstruye el contenedor completo, no hay nada que preservar.
//  - "refresh por cambio de filtro/mute/sorpréndeme" (ya había posts visibles)
//    → se reconcilia el DOM existente (mover/insertar/quitar nodos puntuales)
//    en vez de vaciar el contenedor, así no hay parpadeo ni salto de scroll.
export async function loadFeed(append = false) {
  const container = document.getElementById('feed-posts')
  if (!container) return

  const isColdStart = !append && _posts.length === 0
  if (!append) {
    _page = 0
    if (isColdStart) {
      _posts = []
      container.innerHTML = '<div class="feed-loading">Cargando…</div>'
    }
  }

  try {
    // Categorías efectivas: filtros activos sin silenciados
    const effectiveCats = _activeFilters.length
      ? _activeFilters.filter(f => !_mutes[f])
      : FEED_CATEGORIES.map(c => c.id).filter(id => !_mutes[id])

    let query = supabase
      .from('posts')
      .select(`
        id, content, category, media_url, media_position, created_at, user_id,
        post_reactions(count)
      `)
      .order('created_at', { ascending: false })
      .range(_page * PAGE_SIZE, (_page + 1) * PAGE_SIZE - 1)

    if (effectiveCats.length) {
      query = query.in('category', effectiveCats)
    }

    const { data, error } = await query
    if (error) throw error

    // Cargar perfiles de autores no cacheados (de la consulta principal)
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

    let combined = (data || []).map(p => ({ ...p, reactCount: p.post_reactions?.[0]?.count || 0 }))

    // ── Mezcla anti-burbuja + Sorpréndeme — solo en cargas no paginadas.
    // (En "Ver más" no se mezcla: evita recomputar/repetir candidatos por
    // página y mantiene la paginación principal predecible).
    if (!append) {
      const excludeIds = new Set(combined.map(p => p.id))
      await getDiscoveryPool()
      combined = mixIntoFeed(combined, _discoveryPool, DISCOVERY_RATIO, excludeIds,
        p => ({ ...p, _discovery: true }))

      if (_surpriseMode) {
        await ensureSurprisePool()
        combined = mixIntoFeed(combined, _surprisePool, SURPRISE_RATIO, excludeIds,
          p => ({ ...p, _surpriseCategory: p.category, _surpriseFrom: _surpriseReason?.topCategory || null }))
      }
    }

    // Mis reacciones + conteo de comentarios para TODO el set ya combinado
    // (posts principales + mezclas), así no quedan desincronizados
    let myReactions = new Set()
    if (_userId && combined.length) {
      try {
        const ids = combined.map(p => p.id)
        const { data: rcts } = await supabase
          .from('post_reactions')
          .select('post_id')
          .eq('user_id', _userId)
          .in('post_id', ids)
        myReactions = new Set((rcts || []).map(r => r.post_id))
      } catch (e) { /* no bloquea el feed */ }
    }

    // Conteo de comentarios (consulta separada y protegida — la tabla post_comments
    // puede no existir aún en algunos despliegues, no debe romper el feed entero)
    let commentCounts = {}
    if (combined.length) {
      try {
        const ids = combined.map(p => p.id)
        const { data: cms } = await supabase
          .from('post_comments').select('post_id').in('post_id', ids)
        ;(cms || []).forEach(c => { commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1 })
      } catch (e) { /* tabla no disponible aún, counts quedan en 0 */ }
    }

    const newPosts = combined.map(p => ({
      ...p,
      iApoyé: myReactions.has(p.id),
      commentCount: commentCounts[p.id] || 0,
    }))

    if (append) {
      _posts = [..._posts, ...newPosts]
      newPosts.forEach(p => {
        const el = document.createElement('div')
        el.innerHTML = renderPost(p)
        const card = el.firstElementChild
        container.appendChild(card)
        bindPost(card, p)
      })
    } else if (isColdStart) {
      _posts = newPosts
      container.innerHTML = ''
      if (!_posts.length) { container.innerHTML = renderEmptyState(); return }
      newPosts.forEach(p => {
        const el = document.createElement('div')
        el.innerHTML = renderPost(p)
        const card = el.firstElementChild
        container.appendChild(card)
        bindPost(card, p)
      })
    } else {
      reconcileFeedDOM(container, newPosts)
      _posts = newPosts
    }

    // Botón de más — basado en el tamaño real de la consulta principal
    // (las mezclas no cuentan para decidir si hay más páginas)
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
    if (isColdStart) {
      container.innerHTML = '<div class="feed-error">Error cargando el feed. Intenta de nuevo.</div>'
    } else {
      showFeedToast('No se pudo actualizar el feed')
    }
  }
}

// ── Reconciliar DOM existente con el nuevo set de posts ───
// Mueve/inserta/quita nodos puntuales en vez de vaciar el contenedor:
// sin parpadeo y sin saltos de scroll bruscos al cambiar filtros.
function reconcileFeedDOM(container, newPosts) {
  document.getElementById('feed-load-more')?.remove()
  container.querySelector('.feed-empty, .feed-error, .feed-loading')?.remove()

  const existingNodes = {}
  container.querySelectorAll('.feed-post').forEach(node => {
    existingNodes[node.dataset.postId] = node
  })

  let cursor = null
  newPosts.forEach(p => {
    const id = String(p.id)
    let node = existingNodes[id]
    if (node) {
      delete existingNodes[id]
      const wantedNext = cursor ? cursor.nextSibling : container.firstChild
      if (wantedNext !== node) container.insertBefore(node, wantedNext)
    } else {
      const wrap = document.createElement('div')
      wrap.innerHTML = renderPost(p)
      node = wrap.firstElementChild
      container.insertBefore(node, cursor ? cursor.nextSibling : container.firstChild)
      bindPost(node, p)
      node.classList.add('fp-new')
    }
    cursor = node
  })

  // Lo que sobró ya no aplica a los filtros nuevos
  Object.values(existingNodes).forEach(node => {
    node.classList.add('fp-fade-out')
    setTimeout(() => node.remove(), 350)
  })

  if (!newPosts.length) container.innerHTML = renderEmptyState()
}

// ── Mezclar un pool extra dentro del feed principal ────────
function mixIntoFeed(basePosts, pool, ratio, excludeIds, decorate) {
  if (!pool.length || !basePosts.length) return basePosts
  const nSlots = Math.round(basePosts.length * ratio)
  if (!nSlots) return basePosts

  const candidates = pool.filter(p => !excludeIds.has(p.id))
  if (!candidates.length) return basePosts

  const picked = []
  const shuffled = [...candidates]
  while (picked.length < nSlots && shuffled.length) {
    const idx = Math.floor(Math.random() * shuffled.length)
    picked.push(shuffled.splice(idx, 1)[0])
  }
  picked.forEach(p => excludeIds.add(p.id))

  const result = [...basePosts]
  const gap = Math.max(2, Math.floor(result.length / (picked.length + 1)))
  picked.forEach((p, i) => {
    const pos = Math.min(result.length, gap * (i + 1) + i)
    result.splice(pos, 0, decorate(p))
  })
  return result
}

// ── Pool anti-burbuja: posts recientes de creadores pequeños ──
// Reutiliza loadTalentosOcultos() de creadores.js, que ya calcula la calidad
// (reacciones/post) de creadores activos con <1000 apoyos. Se cachea con TTL
// para no recalcular esa lista costosa en cada carga del feed.
async function getDiscoveryPool() {
  if (Date.now() - _discoveryPoolAt < DISCOVERY_TTL && _discoveryPool.length) return _discoveryPool
  try {
    const talentos = await loadTalentosOcultos(40)
    const ids = talentos.map(t => t.id).filter(Boolean)
    if (!ids.length) { _discoveryPool = []; _discoveryPoolAt = Date.now(); return _discoveryPool }

    const { data } = await supabase
      .from('posts')
      .select('id, content, category, media_url, media_position, created_at, user_id, post_reactions(count)')
      .in('user_id', ids)
      .order('created_at', { ascending: false })
      .limit(40)

    // Los perfiles ya vienen en loadTalentosOcultos, evitamos refetchearlos
    talentos.forEach(t => {
      _profilesCache[t.id] = { id: t.id, username: t.username, full_name: t.full_name, avatar_url: t.avatar_url }
      _creatorCache[t.id] = true
    })

    _discoveryPool = (data || []).map(p => ({ ...p, reactCount: p.post_reactions?.[0]?.count || 0 }))
    _discoveryPoolAt = Date.now()
  } catch (e) {
    console.warn('[feed] discoveryPool error:', e)
    _discoveryPool = []
  }
  return _discoveryPool
}

// ── Sorpréndeme: detectar afinidad y categoría sugerida ────
// Heurística simple (sin backend propio): mira las categorías que el usuario
// más apoyó (su "categoría top"), busca otros usuarios que también apoyaron
// esa categoría, y ve qué OTRAS categorías reaccionan esos usuarios afines.
// Es la categoría más sugerida la que se usa para "Sorpréndeme", y es la base
// de la etiqueta explicativa (no es caja negra: el usuario ve el motivo).
async function computeSurpriseRecommendation() {
  if (!_userId) return null
  try {
    const { data: mine } = await supabase
      .from('post_reactions')
      .select('posts(category)')
      .eq('user_id', _userId)
      .limit(200)

    const myCatCounts = {}
    ;(mine || []).forEach(r => {
      const c = r.posts?.category
      if (c) myCatCounts[c] = (myCatCounts[c] || 0) + 1
    })
    const topCategory = Object.entries(myCatCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null
    if (!topCategory) return { topCategory: null, suggestedCategory: null }

    const { data: peers } = await supabase
      .from('post_reactions')
      .select('user_id, posts!inner(category)')
      .eq('posts.category', topCategory)
      .neq('user_id', _userId)
      .limit(300)

    const peerIds = [...new Set((peers || []).map(p => p.user_id))].slice(0, 80)
    if (!peerIds.length) return { topCategory, suggestedCategory: null }

    const { data: peerReactions } = await supabase
      .from('post_reactions')
      .select('posts(category)')
      .in('user_id', peerIds)
      .limit(500)

    const otherCatCounts = {}
    ;(peerReactions || []).forEach(r => {
      const c = r.posts?.category
      if (c && c !== topCategory) otherCatCounts[c] = (otherCatCounts[c] || 0) + 1
    })
    const suggestedCategory = Object.entries(otherCatCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null
    return { topCategory, suggestedCategory }
  } catch (e) {
    console.warn('[feed] surprise recommendation error:', e)
    return null
  }
}

async function ensureSurprisePool(force = false) {
  if (!force && Date.now() - _surprisePoolAt < SURPRISE_TTL && _surprisePool.length) return
  _surpriseReason = await computeSurpriseRecommendation()

  let targetCat = _surpriseReason?.suggestedCategory
  if (!targetCat) {
    // Sin historial suficiente para personalizar: cualquier categoría fuera
    // de los filtros activos y no silenciada
    const candidates = FEED_CATEGORIES.map(c => c.id)
      .filter(id => !_activeFilters.includes(id) && !_mutes[id])
    targetCat = candidates[Math.floor(Math.random() * candidates.length)] || null
  }
  if (!targetCat) { _surprisePool = []; _surprisePoolAt = Date.now(); return }

  try {
    const { data } = await supabase
      .from('posts')
      .select('id, content, category, media_url, media_position, created_at, user_id, post_reactions(count)')
      .eq('category', targetCat)
      .order('created_at', { ascending: false })
      .limit(30)

    const unknownIds = [...new Set((data || []).map(p => p.user_id))].filter(id => !_profilesCache[id])
    if (unknownIds.length) {
      const { data: profiles } = await supabase
        .from('profiles').select('id, username, full_name, avatar_url').in('id', unknownIds)
      ;(profiles || []).forEach(p => { _profilesCache[p.id] = p })
    }

    _surprisePool = (data || []).map(p => ({ ...p, reactCount: p.post_reactions?.[0]?.count || 0 }))
    _surprisePoolAt = Date.now()
  } catch (e) {
    console.warn('[feed] surprisePool error:', e)
    _surprisePool = []
  }
}

export async function toggleSurpriseMode() {
  _surpriseMode = !_surpriseMode
  if (_surpriseMode) {
    await ensureSurprisePool(true)
    showFeedToast('🎲 ¡Sorpréndeme activado!')
  } else {
    showFeedToast('Modo Sorpréndeme desactivado')
  }
  renderCategorySelector()
  await loadFeed()
}

// ── Etiqueta explicativa (Sorpréndeme / anti-burbuja) ──
// El usuario debe entender por qué ve cada post fuera de sus filtros
// habituales — nunca es una caja negra.
function renderReasonBanner(p) {
  if (p._surpriseCategory) {
    const fromLabel = p._surpriseFrom ? (CAT_MAP[p._surpriseFrom]?.label || p._surpriseFrom) : null
    const text = fromLabel
      ? `Te mostramos esto porque sueles apoyar contenido de ${fromLabel}`
      : `Te mostramos esto fuera de tus categorías habituales`
    return `<div class="fp-reason-banner fp-reason-surprise">🎲 ${text}</div>`
  }
  if (p._discovery) {
    return `<div class="fp-reason-banner fp-reason-discovery">🌱 Creador emergente con buena calidad — pocos apoyos todavía</div>`
  }
  return ''
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
            <div class="fp-menu-item fp-mute-group">
              <span class="fp-mute-label">⏳ No quiero ver ${cat.label || p.category}</span>
              <div class="fp-mute-opts">
                <button class="fp-mute-btn" data-cat="${p.category}" data-dur="today">Hoy</button>
                <button class="fp-mute-btn" data-cat="${p.category}" data-dur="week">Esta semana</button>
              </div>
            </div>
            ${p.user_id === _userId
              ? `<button class="fp-menu-item fp-edit-btn" data-post="${p.id}">✏️ Editar</button>
               <button class="fp-menu-item fp-delete-btn" data-post="${p.id}">🗑️ Eliminar</button>`
              : ''}
          </div>
        </div>
      </div>

      ${renderReasonBanner(p)}
      <div class="fp-content">${esc(p.content)}</div>

      ${p.media_url ? `<div class="fp-media">
        <img src="${p.media_url}" alt="Imagen del post" class="fp-img" loading="lazy"
          style="object-position:${_posToCss(p.media_position)}"
          onerror="this.parentElement.style.display='none'">
      </div>` : ''}

      <div class="fp-actions">
        <button class="fp-apoyo-btn${p.iApoyé ? ' active' : ''}" data-post="${p.id}" aria-label="Apoyar">
          <span class="fp-apoyo-icon">🏆</span>
          <span class="fp-apoyo-count">${p.reactCount}</span>
        </button>
        <button class="comment-toggle-btn" data-post="${p.id}">
          💬 ${p.commentCount > 0 ? p.commentCount + ' ' : ''}Comentar
        </button>
        <button class="fp-share-btn" data-post="${p.id}" aria-label="Compartir">
          <span>🔗</span> Compartir
        </button>
      </div>
      <div class="post-comments-section" id="feed-comments-${p.id}" style="display:none"></div>
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

  // Comentarios
  card.querySelector('.comment-toggle-btn')?.addEventListener('click', () => {
    toggleFeedComments(p.id)
  })

  // Menú
  const menuBtn = card.querySelector('.fp-menu-btn')
  const menu    = card.querySelector(`#menu-${p.id}`)
  menuBtn?.addEventListener('click', e => {
    e.stopPropagation()
    menu.style.display = menu.style.display === 'none' ? '' : 'none'
  })
  document.addEventListener('click', () => { if (menu) menu.style.display = 'none' }, { once: false })

  // No ahora — con ventana configurable (Hoy / Esta semana)
  card.querySelectorAll('.fp-mute-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!_userId) { showFeedToast('Inicia sesión para personalizar tu feed'); return }
      const cat = btn.dataset.cat
      const dur = btn.dataset.dur // 'today' | 'week'
      await muteCategory(cat, dur)
      card.classList.add('fp-fade-out')
      setTimeout(() => card.remove(), 350)
      const label = dur === 'week' ? 'esta semana' : 'hoy'
      showFeedToast(`⏳ No verás más "${CAT_MAP[cat]?.label || cat}" ${label}`)
    })
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

// ── Comentarios ────────────────────────────────────
async function toggleFeedComments(postId) {
  const section = document.getElementById('feed-comments-' + postId)
  if (!section) return
  if (section.style.display !== 'none') { section.style.display = 'none'; return }
  section.style.display = ''
  section.innerHTML = `<div style="padding:10px 16px;color:var(--dim);font-size:.85rem">Cargando comentarios…</div>`
  await loadFeedComments(postId, section)
}

async function loadFeedComments(postId, section) {
  try {
    const { data: comments } = await supabase
      .from('post_comments')
      .select('id, content, created_at, user_id, profiles:user_id(username, full_name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .limit(50)

    const listHtml = (comments || []).map(c => {
      const u   = c.profiles || {}
      const ini = (u.full_name || u.username || '?').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()
      const isOwn = _userId === c.user_id
      return `<div class="comment-item" data-comment-id="${c.id}">
        ${u.avatar_url
          ? `<img src="${u.avatar_url}" class="comment-avatar" alt="">`
          : `<div class="comment-avatar-fb">${ini}</div>`}
        <div class="comment-body">
          <div class="comment-author">${esc(u.full_name || u.username || 'Usuario')}${isOwn ? ` <button class="comment-delete-btn" data-id="${c.id}" style="float:right;font-size:.68rem;background:none;border:none;color:var(--muted);cursor:pointer" title="Eliminar">✕</button>` : ''}</div>
          <div class="comment-text">${esc(c.content)}</div>
          <div class="comment-time">${formatRelTime(c.created_at)}</div>
        </div>
      </div>`
    }).join('')

    const canComment = !!_userId
    section.innerHTML = `
      <div class="comment-list" id="feed-comment-list-${postId}">${listHtml || '<div style="color:var(--dim);font-size:.82rem;padding:4px 0">Sé el primero en comentar</div>'}</div>
      ${canComment ? `
        <div class="comment-form">
          <input class="comment-input" id="feed-comment-input-${postId}" placeholder="Escribe un comentario…" maxlength="300">
          <button class="comment-submit" id="feed-comment-submit-${postId}">Publicar</button>
        </div>` : `<div style="font-size:.8rem;color:var(--dim);padding:6px 0">Inicia sesión para comentar</div>`}`

    if (canComment) {
      const input  = document.getElementById('feed-comment-input-' + postId)
      const submit = document.getElementById('feed-comment-submit-' + postId)
      submit.addEventListener('click', () => submitFeedComment(postId, input))
      input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitFeedComment(postId, input) } })
    }

    section.querySelectorAll('.comment-delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!_userId) return
        const cid = btn.dataset.id
        await supabase.from('post_comments').delete().eq('id', cid).eq('user_id', _userId)
        btn.closest('.comment-item')?.remove()
        _bumpCommentCount(postId, -1)
      })
    })
  } catch (e) {
    section.innerHTML = `<div style="padding:10px 16px;color:var(--dim);font-size:.82rem">Comentarios no disponibles aún.</div>`
  }
}

async function submitFeedComment(postId, input) {
  const content = input.value.trim()
  if (!content || !_userId) return
  input.disabled = true
  try {
    const { data: comment, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, user_id: _userId, content })
      .select('id, content, created_at, user_id, profiles:user_id(username, full_name, avatar_url)')
      .single()
    if (error) throw error
    input.value = ''
    const list = document.getElementById('feed-comment-list-' + postId)
    if (list) {
      const u   = comment.profiles || {}
      const ini = (u.full_name || u.username || '?').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()
      const el  = document.createElement('div')
      el.className = 'comment-item'
      el.dataset.commentId = comment.id
      el.innerHTML = `
        ${u.avatar_url ? `<img src="${u.avatar_url}" class="comment-avatar" alt="">` : `<div class="comment-avatar-fb">${ini}</div>`}
        <div class="comment-body">
          <div class="comment-author">${esc(u.full_name || u.username || 'Usuario')}
            <button class="comment-delete-btn" data-id="${comment.id}" style="float:right;font-size:.68rem;background:none;border:none;color:var(--muted);cursor:pointer" title="Eliminar">✕</button>
          </div>
          <div class="comment-text">${esc(comment.content)}</div>
          <div class="comment-time">hace un momento</div>
        </div>`
      el.querySelector('.comment-delete-btn').addEventListener('click', async () => {
        await supabase.from('post_comments').delete().eq('id', comment.id).eq('user_id', _userId)
        el.remove()
        _bumpCommentCount(postId, -1)
      })
      // Quitar el placeholder "Sé el primero…" si existía
      if (list.children.length === 1 && list.children[0].tagName === 'DIV' && !list.children[0].classList.contains('comment-item')) {
        list.innerHTML = ''
      }
      list.appendChild(el)
      list.scrollTop = list.scrollHeight
      _bumpCommentCount(postId, 1)
    }
  } catch (e) {
    console.error('[feed comment]', e)
    showFeedToast('Error al publicar comentario')
  } finally {
    input.disabled = false; input.focus()
  }
}

function _bumpCommentCount(postId, delta) {
  const btn = document.querySelector(`.feed-post[data-post-id="${postId}"] .comment-toggle-btn`)
  if (!btn) return
  const match = btn.textContent.match(/\d+/)
  const current = match ? parseInt(match[0]) : 0
  const next = Math.max(0, current + delta)
  btn.innerHTML = `💬 ${next > 0 ? next + ' ' : ''}Comentar`
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

  // Sorpréndeme — toggle real: mezcla contenido fuera de los filtros
  // habituales (no los reemplaza ni los limpia)
  const srp = document.getElementById('feed-surprise-btn')
  if (srp) {
    srp.classList.toggle('active', _surpriseMode)
    srp.textContent = _surpriseMode ? '🎲 Sorpréndeme ✓' : '🎲 Sorpréndeme'
    srp.onclick = toggleSurpriseMode
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
      <div class="compose-media-row" style="margin-top:6px">
        <input type="url" class="compose-img-url" id="edit-img-url"
          placeholder="URL de imagen (opcional)"
          value="${post.media_url || ''}">
      </div>
      <div class="compose-position-row">
        <span class="compose-position-label">Posición</span>
        <div class="compose-position-btns">
          <button class="compose-pos-btn${post.media_position === 'top' ? ' active' : ''}" data-pos="top" type="button">⬆️ Arriba</button>
          <button class="compose-pos-btn${!post.media_position || post.media_position === 'center' ? ' active' : ''}" data-pos="center" type="button">⏺️ Centro</button>
          <button class="compose-pos-btn${post.media_position === 'bottom' ? ' active' : ''}" data-pos="bottom" type="button">⬇️ Abajo</button>
        </div>
      </div>
      <div class="compose-footer">
        <div class="compose-char-count"><span id="edit-chars">${post.content.length}</span>/500</div>
        <div class="compose-actions">
          <button class="compose-submit" id="edit-submit">Guardar cambios</button>
        </div>
      </div>
    </div>`

  let editPosition = post.media_position || 'center'
  modal.querySelectorAll('.compose-pos-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.compose-pos-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      editPosition = btn.dataset.pos
    })
  })

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
    const media_position = editPosition
    if (!content) return

    const btn = modal.querySelector('#edit-submit')
    btn.disabled = true; btn.textContent = 'Guardando…'

    try {
      const { error } = await supabase
        .from('posts')
        .update({ content, media_url, media_position })
        .eq('id', post.id)
        .eq('user_id', _userId)

      if (error) throw error

      // Actualizar el DOM del post sin recargar el feed
      const contentEl = card.querySelector('.fp-content')
      if (contentEl) contentEl.textContent = content

      const mediaEl = card.querySelector('.fp-media')
      if (media_url && mediaEl) {
        mediaEl.innerHTML = `<img src="${media_url}" alt="Imagen del post" class="fp-img" loading="lazy"
          style="object-position:${_posToCss(media_position)}"
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

// ── Recortador de imagen (drag + zoom) ─────────────
const CROP_OUTPUT_W = 1280
const CROP_OUTPUT_H = 800 // 16:10

function openCropper(file) {
  return new Promise((resolve) => {
    document.getElementById('cropper-modal')?.remove()

    const objectUrl = URL.createObjectURL(file)
    const modal = document.createElement('div')
    modal.id = 'cropper-modal'
    modal.className = 'cropper-backdrop'
    modal.innerHTML = `
      <div class="cropper-box">
        <div class="cropper-title">✂️ Ajusta tu imagen</div>
        <div class="cropper-frame" id="cropper-frame">
          <img id="cropper-img" src="${objectUrl}" alt="">
        </div>
        <div class="cropper-controls">
          <span class="cropper-zoom-label">🔍</span>
          <input type="range" class="cropper-zoom-slider" id="cropper-zoom" min="100" max="250" value="100">
        </div>
        <div class="cropper-hint">Arrastra para mover · usa el control para acercar</div>
        <div class="cropper-actions">
          <button class="cropper-btn" id="cropper-cancel">Cancelar</button>
          <button class="cropper-btn primary" id="cropper-confirm">Usar esta imagen</button>
        </div>
      </div>`
    document.body.appendChild(modal)

    const frame = modal.querySelector('#cropper-frame')
    const img   = modal.querySelector('#cropper-img')
    const zoomSlider = modal.querySelector('#cropper-zoom')

    let naturalW = 0, naturalH = 0, frameW = 0, frameH = 0
    let minScale = 1, scale = 1
    let offsetX = 0, offsetY = 0
    let dragging = false, startX = 0, startY = 0, startOffX = 0, startOffY = 0

    function clampOffsets() {
      const dispW = naturalW * scale, dispH = naturalH * scale
      const minX = Math.min(0, frameW - dispW), maxX = 0
      const minY = Math.min(0, frameH - dispH), maxY = 0
      offsetX = Math.min(maxX, Math.max(minX, offsetX))
      offsetY = Math.min(maxY, Math.max(minY, offsetY))
    }

    function applyTransform() {
      const dispW = naturalW * scale, dispH = naturalH * scale
      img.style.width  = dispW + 'px'
      img.style.height = dispH + 'px'
      img.style.left   = offsetX + 'px'
      img.style.top    = offsetY + 'px'
    }

    function recompute(zoomPercent) {
      const rect = frame.getBoundingClientRect()
      frameW = rect.width; frameH = rect.height
      minScale = Math.max(frameW / naturalW, frameH / naturalH)
      scale = minScale * (zoomPercent / 100)
      clampOffsets()
      applyTransform()
    }

    img.onload = () => {
      naturalW = img.naturalWidth; naturalH = img.naturalHeight
      const rect = frame.getBoundingClientRect()
      frameW = rect.width; frameH = rect.height
      minScale = Math.max(frameW / naturalW, frameH / naturalH)
      scale = minScale
      offsetX = (frameW - naturalW * scale) / 2
      offsetY = (frameH - naturalH * scale) / 2
      clampOffsets()
      applyTransform()
    }

    zoomSlider.addEventListener('input', () => recompute(parseFloat(zoomSlider.value)))

    function startDrag(x, y) {
      dragging = true; startX = x; startY = y; startOffX = offsetX; startOffY = offsetY
    }
    function moveDrag(x, y) {
      if (!dragging) return
      offsetX = startOffX + (x - startX)
      offsetY = startOffY + (y - startY)
      clampOffsets()
      applyTransform()
    }
    function endDrag() { dragging = false }

    frame.addEventListener('mousedown', e => startDrag(e.clientX, e.clientY))
    window.addEventListener('mousemove', e => moveDrag(e.clientX, e.clientY))
    window.addEventListener('mouseup', endDrag)
    frame.addEventListener('touchstart', e => {
      const t = e.touches[0]; startDrag(t.clientX, t.clientY)
    }, { passive: true })
    frame.addEventListener('touchmove', e => {
      const t = e.touches[0]; moveDrag(t.clientX, t.clientY)
    }, { passive: true })
    frame.addEventListener('touchend', endDrag)

    function cleanup() {
      URL.revokeObjectURL(objectUrl)
      modal.remove()
    }

    modal.querySelector('#cropper-cancel').addEventListener('click', () => { cleanup(); resolve(null) })
    modal.addEventListener('click', e => { if (e.target === modal) { cleanup(); resolve(null) } })

    modal.querySelector('#cropper-confirm').addEventListener('click', () => {
      const canvas = document.createElement('canvas')
      canvas.width = CROP_OUTPUT_W; canvas.height = CROP_OUTPUT_H
      const ctx = canvas.getContext('2d')
      const outScale = CROP_OUTPUT_W / frameW
      const drawX = offsetX * outScale, drawY = offsetY * outScale
      const drawW = naturalW * scale * outScale, drawH = naturalH * scale * outScale
      ctx.drawImage(img, drawX, drawY, drawW, drawH)
      canvas.toBlob(blob => { cleanup(); resolve(blob) }, 'image/jpeg', 0.88)
    })
  })
}

async function uploadPostImage(userId, blob) {
  const filename = `${userId}/${Date.now()}.jpg`
  const { error } = await supabase.storage.from('post-images').upload(filename, blob, {
    contentType: 'image/jpeg', cacheControl: '3600', upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from('post-images').getPublicUrl(filename)
  return data.publicUrl
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

      <div class="compose-media-row">
        <div class="compose-media-tabs">
          <button class="compose-media-tab active" data-mediatab="file" type="button">📁 Subir foto</button>
          <button class="compose-media-tab" data-mediatab="url" type="button">🔗 URL</button>
        </div>
      </div>

      <div id="compose-media-file" class="compose-media-row" style="margin-top:6px">
        <label class="compose-file-btn">
          📷 Elegir imagen
          <input type="file" id="compose-file-input" class="compose-file-input" accept="image/*">
        </label>
        <span class="compose-media-preview-name" id="compose-file-name"></span>
        <button class="compose-media-clear" id="compose-file-clear" style="display:none" type="button">✕</button>
      </div>

      <div id="compose-media-url" class="compose-media-row" style="margin-top:6px;display:none">
        <input type="url" class="compose-img-url" id="compose-img-url"
          placeholder="URL de imagen (opcional)">
      </div>
      <div id="compose-position-row" class="compose-position-row" style="display:none">
        <span class="compose-position-label">Posición</span>
        <div class="compose-position-btns">
          <button class="compose-pos-btn" data-pos="top" type="button">⬆️ Arriba</button>
          <button class="compose-pos-btn active" data-pos="center" type="button">⏺️ Centro</button>
          <button class="compose-pos-btn" data-pos="bottom" type="button">⬇️ Abajo</button>
        </div>
      </div>

      <div class="compose-footer">
        <div class="compose-char-count"><span id="compose-chars">0</span>/500</div>
        <div class="compose-actions">
          <button class="compose-submit" id="compose-submit" disabled>Publicar</button>
        </div>
      </div>
    </div>`

  let selectedCat   = _activeFilters[0] || null
  let activeTab     = 'file'   // 'file' | 'url'
  let uploadedUrl   = null     // resultado del recorte ya subido a storage
  let mediaPosition = 'center'

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

  // ── Tabs subir foto / URL ──
  const fileSection = modal.querySelector('#compose-media-file')
  const urlSection  = modal.querySelector('#compose-media-url')
  const posRow      = modal.querySelector('#compose-position-row')
  modal.querySelectorAll('.compose-media-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      modal.querySelectorAll('.compose-media-tab').forEach(t => t.classList.remove('active'))
      tab.classList.add('active')
      activeTab = tab.dataset.mediatab
      fileSection.style.display = activeTab === 'file' ? '' : 'none'
      urlSection.style.display  = activeTab === 'url'  ? '' : 'none'
      posRow.style.display      = activeTab === 'url'  ? '' : 'none'
    })
  })

  // ── Selector de posición (solo aplica a imágenes por URL) ──
  modal.querySelectorAll('.compose-pos-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.compose-pos-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      mediaPosition = btn.dataset.pos
    })
  })

  // ── Subir imagen + recortar ──
  const fileInput  = modal.querySelector('#compose-file-input')
  const fileNameEl = modal.querySelector('#compose-file-name')
  const fileClear  = modal.querySelector('#compose-file-clear')

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { showFeedToast('Selecciona un archivo de imagen'); return }
    if (file.size > 12 * 1024 * 1024) { showFeedToast('La imagen es muy pesada (máx 12MB)'); return }

    const blob = await openCropper(file)
    fileInput.value = ''
    if (!blob) return

    fileNameEl.textContent = '⏳ Subiendo…'
    fileClear.style.display = ''
    try {
      uploadedUrl = await uploadPostImage(userId, blob)
      fileNameEl.textContent = '✅ Imagen lista'
    } catch (e) {
      console.error('[feed] upload error:', e)
      uploadedUrl = null
      fileNameEl.textContent = '❌ Error al subir'
    }
  })

  fileClear.addEventListener('click', () => {
    uploadedUrl = null
    fileNameEl.textContent = ''
    fileClear.style.display = 'none'
  })

  modal.querySelector('#compose-submit').addEventListener('click', async () => {
    const content = modal.querySelector('#compose-text').value.trim()
    if (!content || !selectedCat) return

    let media_url = null
    let media_position = 'center'
    if (activeTab === 'file' && uploadedUrl) {
      media_url = uploadedUrl
    } else if (activeTab === 'url') {
      const urlVal = modal.querySelector('#compose-img-url').value.trim()
      if (urlVal) { media_url = urlVal; media_position = mediaPosition }
    }

    const btn = modal.querySelector('#compose-submit')
    btn.disabled = true; btn.textContent = 'Publicando…'

    try {
      const { data, error } = await supabase.from('posts')
        .insert({ user_id: userId, content, category: selectedCat, media_url, media_position })
        .select().single()
      if (error) throw error

      closeModal()
      showFeedToast('✅ Post publicado')
      // Insertar al inicio del feed
      const container = document.getElementById('feed-posts')
      if (container) {
        const profile = _profilesCache[userId]
        const newP = { ...data, reactCount: 0, iApoyé: false, commentCount: 0 }
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
function _posToCss(pos) {
  return pos === 'top' ? 'center top' : pos === 'bottom' ? 'center bottom' : 'center center'
}

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
