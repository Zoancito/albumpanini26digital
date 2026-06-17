// ══════════════════════════════════════════════════════
//  perfil.js — Lógica principal del perfil de usuario
// ══════════════════════════════════════════════════════
import { supabase }                                            from '../supabase.js'
import { renderMedallero, computeMedalsFromProgress }          from '../medals.js'
import { renderCreatorSection }                                from '../creadores.js'
import { getFriendshipStatus, sendFriendRequest,
         acceptFriendRequest, removeFriendship }               from '../friendships.js'
import { esc, INTRO_DATA, albumData }                         from './perfil-data.js'
import { getPublicPct, renderFullAlbumSection,
         renderLockedAlbumSection }                            from './perfil-album.js'

// ══ Estado del módulo ═════════════════════════════════
let _currentUser   = null
let _profileData   = null
let _friendship    = null
let _isOwnProfile  = false

// Mapa de categorías para posts
const PERFIL_CAT_MAP = {
  album:    { icon:'📘', label:'Álbum',               color:'#f5c518' },
  mundial:  { icon:'🌍', label:'Mundial 2026',        color:'#34d399' },
  fichajes: { icon:'💸', label:'Mercado de Fichajes', color:'#60a5fa' },
  tactica:  { icon:'🧠', label:'Análisis táctico',    color:'#a78bfa' },
  humor:    { icon:'😂', label:'Humor futbolero',     color:'#fb923c' },
  noticias: { icon:'📰', label:'Noticias',            color:'#94a3b8' },
  equipo:   { icon:'🏟️', label:'Mi equipo',           color:'#f472b6' },
  femenino: { icon:'⚽', label:'Fútbol femenino',     color:'#e879f9' },
}

// ══ Entrada principal ════════════════════════════════
document.addEventListener('DOMContentLoaded', loadPage)

async function loadPage() {
  try {
    // Leer username: ?u=zoancito98 (via 404.html redirect) o /perfil/zoancito98 directo
  const params           = new URLSearchParams(location.search)
  const usernameFromQuery = params.get('u')
  const usernameFromPath  = location.pathname.replace(/\/$/, '').split('/').pop()
  const slug = usernameFromQuery
    || (usernameFromPath && usernameFromPath !== 'index.html' ? usernameFromPath : null)

  if (!slug || slug === 'perfil') { showError('No se especificó ningún usuario'); return }

  // Sesión actual
  const { data: { user } } = await supabase.auth.getUser()
  _currentUser = user

  // Cargar perfil
  const { data: profile, error } = await supabase
    .from('profiles').select('*').eq('username', slug.toLowerCase()).maybeSingle()
  if (error || !profile) { showError('Perfil no encontrado'); return }

  _profileData  = profile
  _isOwnProfile = _currentUser?.id === profile.id

  // Determinar nivel de acceso al álbum
  let level = 0 // 0=anónimo, 1=logueado sin amistad, 2=amigo/propio
  if (_currentUser) {
    if (_isOwnProfile) {
      level = 'own'
    } else {
      _friendship = await getFriendshipStatus(profile.id)
      level = _friendship?.status === 'accepted' ? 2 : 1
    }
  }

  // Mostrar página
  document.getElementById('state-loading').style.display = 'none'
  document.getElementById('state-content').style.display = 'block'

  renderProfile(profile)
  renderFriendZone(level)

  // Cargar medallero
  if (level === 'own') {
    const { data: albumRow } = await supabase
      .from('album_progress').select('progress')
      .eq('user_id', profile.id).eq('album_id', 'wc2026').maybeSingle()
    const progress = albumRow?.progress || {}
    await syncMedalsFromProgress(profile, progress)
    renderFullAlbumSection(document.getElementById('album-section'), profile, progress)
  } else if (level === 2) {
    const { data: albumRow } = await supabase
      .from('album_progress').select('progress')
      .eq('user_id', profile.id).eq('album_id', 'wc2026').maybeSingle()
    await renderMedalleroSection(profile, level)
    renderFullAlbumSection(document.getElementById('album-section'), profile, albumRow?.progress || {})
  } else {
    await renderMedalleroSection(profile, level)
    const pct = await getPublicPct(profile.id)
    renderLockedAlbumSection(document.getElementById('album-section'), profile, level, pct)
  }

  // Sección creador
  const creatorContainer = document.getElementById('creator-section')
  if (creatorContainer) {
    creatorContainer.style.display = ''
    renderCreatorSection(creatorContainer, profile.id, _currentUser?.id || null)
  }

  // Posts del creador (fuera del card)
  renderCreatorPosts(profile.id)

  // Historial de apoyos (solo perfil propio)
  if (_isOwnProfile) renderHistorialApoyos()

  // A11y panel
  initA11y()

  } catch (err) {
    console.error('[perfil] Error en loadPage:', err)
    showError('Error al cargar el perfil. Intenta recargar la página.')
  }
}

// ══ Render principal del perfil ═══════════════════════
function renderProfile(p) {
  document.title = `${p.full_name || p.username} · Panini Digital`

  const ini = (p.full_name || p.username || '?').trim()
    .split(/\s+/).slice(0,2).map(x => x[0]).join('').toUpperCase()

  const avatarEl = document.getElementById('pc-avatar-img')
  const avatarFb = document.getElementById('pc-avatar-fb')
  if (p.avatar_url && avatarEl) { avatarEl.src = p.avatar_url; avatarEl.hidden = false; avatarFb.hidden = true }
  else if (avatarFb) { avatarFb.textContent = ini }

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '' }
  set('pc-fullname',  p.full_name || p.username)
  set('pc-username',  '@' + (p.username || ''))
  set('pc-bio',       p.bio || '')
  set('pc-team',      p.favorite_team || '—')
  set('pc-position',  p.favorite_position || '—')
  set('pc-stadium',   p.estadio_favorito || '—')
  set('pc-apoyo-count', p.apoyo_count || 0)

  // Jugadores favoritos
  const favSection = document.getElementById('fav-players-section')
  const favList    = document.getElementById('fav-players-list')
  const players    = Array.isArray(p.jugadores_favoritos) ? p.jugadores_favoritos : []
  if (players.length && favSection && favList) {
    favSection.style.display = ''
    favList.innerHTML = players.map(player => {
      const name    = typeof player === 'object' ? player.name : String(player)
      const country = typeof player === 'object' ? (player.country || '') : ''
      const flag    = typeof player === 'object' ? (player.flag || '') : ''
      return `<span class="fp-chip">
        ${flag ? `<span class="fp-chip-flag">${flag}</span>` : ''}
        ${esc(name)}
        ${country ? `<span class="fp-chip-country">${esc(country)}</span>` : ''}
      </span>`
    }).join('')
  }

  // Botón apoyo
  renderApoyoBtn(p)
  renderOjeadorZone(p)
}

// ══ Botón Apoyar ═════════════════════════════════════
async function renderApoyoBtn(p) {
  const zone    = document.getElementById('apoyo-zone')
  const btn     = document.getElementById('apoyo-btn')
  const countEl = document.getElementById('apoyo-count')
  const hintEl  = document.getElementById('apoyo-hint')
  if (!zone || !btn) return

  if (countEl) countEl.textContent = p.apoyo_count || 0

  // Perfil propio
  if (_isOwnProfile) {
    btn.disabled = true; btn.classList.add('apoyo-own')
    const t = p.apoyo_count || 0
    if (hintEl) hintEl.textContent = `${t} apoyo${t !== 1 ? 's' : ''} recibido${t !== 1 ? 's' : ''}`
    return
  }

  // Sin sesión → botón deshabilitado visualmente con mensaje claro
  if (!_currentUser) {
    btn.disabled = true
    btn.classList.add('apoyo-anon')
    const label = btn.querySelector('.apoyo-label')
    if (label) label.textContent = 'Apoyar'
    if (hintEl) hintEl.innerHTML = `<a href="https://albumpanini26digital.vercel.app" style="color:var(--gold)">Inicia sesión</a> para apoyar`
    return
  }

  // Consultar estado real desde DB
  const [{ data: apoyoRow }, { data: earlyRow }] = await Promise.all([
    supabase.from('profile_apoyos').select('created_at')
      .eq('supporter_id', _currentUser.id).eq('supported_id', p.id).maybeSingle(),
    supabase.from('early_supporters').select('apoyo_number')
      .eq('creator_id', p.id).eq('supporter_id', _currentUser.id).maybeSingle(),
  ])

  let yaApoyé = !!apoyoRow
  let currentEarly = earlyRow
  _updateApoyoUI(btn, countEl, hintEl, yaApoyé, p.apoyo_count || 0, currentEarly)

  btn.addEventListener('click', async () => {
    btn.disabled = true
    const labelEl = btn.querySelector('.apoyo-label')
    if (labelEl) labelEl.textContent = yaApoyé ? 'Quitando...' : 'Apoyando...'
    try {
      const { error } = await supabase.rpc('increment_apoyo', { target_profile_id: p.id })
      if (error) throw error
      yaApoyé = !yaApoyé
      const delta    = yaApoyé ? 1 : -1
      const newTotal = Math.max(0, parseInt(countEl?.textContent || 0) + delta)
      if (countEl) countEl.textContent = newTotal
      if (yaApoyé && !currentEarly) {
        const { data } = await supabase.from('early_supporters').select('apoyo_number')
          .eq('creator_id', p.id).eq('supporter_id', _currentUser.id).maybeSingle()
        currentEarly = data
      }
      _updateApoyoUI(btn, countEl, hintEl, yaApoyé, newTotal, currentEarly)
      btn.classList.add('apoyo-burst')
      setTimeout(() => btn.classList.remove('apoyo-burst'), 600)
    } catch (err) {
      console.error('apoyo error:', err)
      if (hintEl) hintEl.textContent = err.message || 'Error al apoyar'
    } finally { btn.disabled = false }
  })
}

function _updateApoyoUI(btn, countEl, hintEl, yaApoyé, total, earlyRow) {
  const label = btn.querySelector('.apoyo-label')
  btn.classList.toggle('apoyo-done', yaApoyé)
  btn.classList.remove('apoyo-own', 'apoyo-anon')
  if (label) label.textContent = yaApoyé ? '¡Apoyado!' : 'Apoyar'
  if (hintEl) {
    if (earlyRow) {
      hintEl.innerHTML = `🔭 Ojeador #${earlyRow.apoyo_number} de los primeros 1.000`
    } else if (yaApoyé) {
      hintEl.textContent = 'Ya apoyaste este perfil 🏆'
    } else {
      const faltan = Math.max(0, 1000 - total)
      hintEl.textContent = total < 1000
        ? `¡Quedan ${faltan} lugares de Ojeador de Talento!`
        : `${total.toLocaleString('es-CL')} apoyos`
    }
  }
}

// ══ Badge Ojeador ════════════════════════════════════
function renderOjeadorZone(p) {
  const zone      = document.getElementById('ojeador-zone')
  const countText = document.getElementById('ojeador-count-text')
  if (!zone) return
  const n = p.ojeador_count || 0
  if (_isOwnProfile && n > 0) {
    if (countText) countText.textContent = `Has sido Ojeador de ${n} creador${n !== 1 ? 'es' : ''}`
    zone.style.display = ''
  } else {
    zone.style.display = 'none'
  }
}

// ══ Posts del creador (tarjetas estilo feed + filtro + paginación) ════════
const POSTS_PER_PAGE = 10

function _timeAgo(iso) {
  const d = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (d < 60)     return 'hace un momento'
  if (d < 3600)   return `hace ${Math.floor(d/60)}m`
  if (d < 86400)  return `hace ${Math.floor(d/3600)}h`
  if (d < 604800) return `hace ${Math.floor(d/86400)}d`
  return new Date(iso).toLocaleDateString('es-CL', { day:'numeric', month:'short' })
}

async function renderCreatorPosts(profileId) {
  const section = document.getElementById('creator-posts-section')
  if (!section) return

  const { data: cp } = await supabase
    .from('creator_profiles')
    .select('is_active, validated_categories, proposed_categories')
    .eq('user_id', profileId).maybeSingle()
  if (!cp?.is_active) return

  const cats = cp.validated_categories?.length
    ? cp.validated_categories
    : (cp.proposed_categories || [])

  const { data: allPosts } = await supabase
    .from('posts').select('id, content, category, created_at, media_url, media_position')
    .eq('user_id', profileId)
    .order('created_at', { ascending: false })
    .limit(200)
  if (!allPosts?.length) return

  section.style.display = ''

  let _activeCat = 'all'
  let _page      = 0

  const profile  = _profileData
  const initials = (profile.full_name || profile.username || '?')
    .trim().split(/\s+/).slice(0,2).map(x => x[0]).join('').toUpperCase()

  async function renderSection() {
    const filtered   = _activeCat === 'all' ? allPosts : allPosts.filter(p => p.category === _activeCat)
    const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE))
    if (_page >= totalPages) _page = 0
    const pagePosts  = filtered.slice(_page * POSTS_PER_PAGE, (_page + 1) * POSTS_PER_PAGE)

    // Reacciones del usuario en esta página
    let myReacts = new Set()
    if (_currentUser && pagePosts.length) {
      const { data: rr } = await supabase.from('post_reactions').select('post_id')
        .eq('user_id', _currentUser.id).in('post_id', pagePosts.map(p => p.id))
      ;(rr || []).forEach(r => myReacts.add(r.post_id))
    }

    // Conteos de reacciones y comentarios
    const counts = {}, commentCounts = {}
    await Promise.all(pagePosts.map(async p => {
      try {
        const { count: rc } = await supabase.from('post_reactions')
          .select('*', { count:'exact', head:true }).eq('post_id', p.id)
        counts[p.id] = rc || 0
      } catch (e) { counts[p.id] = 0 }
      try {
        const { count: cc } = await supabase.from('post_comments')
          .select('*', { count:'exact', head:true }).eq('post_id', p.id)
        commentCounts[p.id] = cc || 0
      } catch (e) { commentCounts[p.id] = 0 } // tabla puede no existir aún
    }))

    // ── Barra de filtros ──
    const filterBar = `
      <div class="creator-filter-bar">
        <button class="creator-filter-btn ${_activeCat === 'all' ? 'active' : ''}" data-cat="all">
          📋 Todos <span class="creator-filter-count">${allPosts.length}</span>
        </button>
        ${cats.map(catId => {
          const cat = PERFIL_CAT_MAP[catId] || { icon: '📌', label: catId, color: '#888' }
          const n   = allPosts.filter(p => p.category === catId).length
          if (!n) return ''
          return `<button class="creator-filter-btn ${_activeCat === catId ? 'active' : ''}"
            data-cat="${catId}" style="--cat-color:${cat.color}">
            ${cat.icon} ${cat.label} <span class="creator-filter-count">${n}</span>
          </button>`
        }).join('')}
      </div>`

    // ── Tarjetas de posts ──
    const postCards = pagePosts.map(p => {
      const cat     = PERFIL_CAT_MAP[p.category] || { icon:'📌', label:p.category, color:'#888' }
      const reacted = myReacts.has(p.id)
      const nCom    = commentCounts[p.id] || 0
      const avatarHtml = profile.avatar_url
        ? `<img src="${profile.avatar_url}" alt="" class="fp-avatar-img">`
        : `<span class="fp-avatar-fb">${initials}</span>`
      const mediaHtml = p.media_url
        ? `<div class="fp-media"><img src="${p.media_url}" alt="" class="fp-img" loading="lazy" style="object-position:${p.media_position === 'top' ? 'center top' : p.media_position === 'bottom' ? 'center bottom' : 'center center'}" onerror="this.parentElement.style.display='none'"></div>`
        : ''
      return `
        <article class="feed-post" data-post-id="${p.id}">
          <div class="fp-header">
            <div class="fp-avatar">${avatarHtml}</div>
            <div class="fp-meta">
              <div class="fp-author">${esc(profile.full_name || profile.username || 'Usuario')} <span class="fp-creator-badge">🎙️</span></div>
              <div class="fp-sub">
                <span class="fp-username">@${esc(profile.username || '?')}</span>
                <span class="fp-dot">·</span>
                <span class="fp-time">${_timeAgo(p.created_at)}</span>
              </div>
            </div>
            <span class="fp-cat-badge" style="--cat-color:${cat.color}">${cat.icon} ${cat.label}</span>
          </div>
          <div class="fp-content">${esc(p.content)}</div>
          ${mediaHtml}
          <div class="fp-actions">
            <button class="fp-apoyo-btn ${reacted ? 'active' : ''} perfil-react-btn"
              data-post="${p.id}" ${!_currentUser ? 'disabled' : ''}>
              <span class="fp-apoyo-icon">🏆</span>
              <span class="fp-apoyo-count">${counts[p.id]}</span>
            </button>
            <button class="comment-toggle-btn" data-post="${p.id}">
              💬 ${nCom > 0 ? nCom + ' ' : ''}Comentar
            </button>
            <button class="fp-share-btn perfil-share-btn" data-post="${p.id}">🔗 Compartir</button>
          </div>
          <div class="post-comments-section" id="comments-${p.id}" style="display:none"></div>
        </article>`
    }).join('')

    // ── Paginación ──
    const pagination = totalPages > 1 ? `
      <div class="creator-posts-pagination">
        <button class="cpag-btn" id="cpag-prev" ${_page === 0 ? 'disabled' : ''}>← Anteriores</button>
        <span class="cpag-info">Página ${_page + 1} de ${totalPages} · ${filtered.length} posts</span>
        <button class="cpag-btn" id="cpag-next" ${_page >= totalPages - 1 ? 'disabled' : ''}>Más recientes →</button>
      </div>` : ''

    section.innerHTML = filterBar + postCards + pagination

    // ── Event listeners ──
    section.querySelectorAll('.creator-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        _activeCat = btn.dataset.cat
        _page = 0
        renderSection()
      })
    })

    section.querySelector('#cpag-prev')?.addEventListener('click', () => { _page--; renderSection() })
    section.querySelector('#cpag-next')?.addEventListener('click', () => { _page++; renderSection() })

    section.querySelectorAll('.perfil-react-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!_currentUser) { showToast('Inicia sesión para reaccionar'); return }
        const postId  = btn.dataset.post
        const reacted = btn.classList.contains('active')
        const countEl = btn.querySelector('.fp-apoyo-count')
        btn.disabled = true
        try {
          if (reacted) {
            await supabase.from('post_reactions').delete().eq('post_id', postId).eq('user_id', _currentUser.id)
            btn.classList.remove('active')
            if (countEl) countEl.textContent = Math.max(0, parseInt(countEl.textContent) - 1)
          } else {
            await supabase.from('post_reactions').insert({ post_id: postId, user_id: _currentUser.id })
            btn.classList.add('active')
            if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1
          }
        } catch (e) { console.error('[react]', e) }
        finally { btn.disabled = false }
      })
    })

    section.querySelectorAll('.perfil-share-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = `${location.origin}/perfil/${encodeURIComponent(profile.username || '')}`
        navigator.clipboard?.writeText(url).then(() => {
          btn.textContent = '✅ Copiado'
          setTimeout(() => { btn.innerHTML = '🔗 Compartir' }, 2000)
        })
      })
    })

    section.querySelectorAll('.comment-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => toggleComments(btn.dataset.post))
    })
  }

  await renderSection()
}


// ══ Comentarios ═══════════════════════════════════════
async function toggleComments(postId) {
  const section = document.getElementById('comments-' + postId)
  if (!section) return
  if (section.style.display !== 'none') { section.style.display = 'none'; return }
  section.style.display = ''
  section.innerHTML = `<div style="padding:10px 16px;color:var(--dim);font-size:.85rem">Cargando comentarios…</div>`
  await loadComments(postId, section)
}

async function loadComments(postId, section) {
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
      const isOwn = _currentUser?.id === c.user_id
      return `<div class="comment-item" data-comment-id="${c.id}">
        ${u.avatar_url
          ? `<img src="${u.avatar_url}" class="comment-avatar" alt="">`
          : `<div class="comment-avatar-fb">${ini}</div>`}
        <div class="comment-body">
          <div class="comment-author">${esc(u.full_name || u.username || 'Usuario')}${isOwn ? ` <button class="comment-delete-btn" data-id="${c.id}" data-post="${postId}" style="float:right;font-size:.68rem;background:none;border:none;color:var(--muted);cursor:pointer" title="Eliminar">✕</button>` : ''}</div>
          <div class="comment-text">${esc(c.content)}</div>
          <div class="comment-time">${_timeAgo(c.created_at)}</div>
        </div>
      </div>`
    }).join('')

    const canComment = !!_currentUser
    section.innerHTML = `
      <div class="comment-list" id="comment-list-${postId}">${listHtml || '<div style="color:var(--dim);font-size:.82rem;padding:4px 0">Sé el primero en comentar</div>'}</div>
      ${canComment ? `
        <div class="comment-form">
          <input class="comment-input" id="comment-input-${postId}" placeholder="Escribe un comentario…" maxlength="300">
          <button class="comment-submit" id="comment-submit-${postId}">Publicar</button>
        </div>` : `<div style="font-size:.8rem;color:var(--dim);padding:6px 0"><a href="https://albumpanini26digital.vercel.app" style="color:var(--gold)">Inicia sesión</a> para comentar</div>`}`

    // Submit comentario
    if (canComment) {
      const input  = document.getElementById('comment-input-' + postId)
      const submit = document.getElementById('comment-submit-' + postId)
      submit.addEventListener('click', () => submitComment(postId, input, section))
      input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(postId, input, section) } })
    }

    // Eliminar comentario propio
    section.querySelectorAll('.comment-delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!_currentUser) return
        const cid = btn.dataset.id
        await supabase.from('post_comments').delete().eq('id', cid).eq('user_id', _currentUser.id)
        btn.closest('.comment-item')?.remove()
      })
    })
  } catch (e) {
    section.innerHTML = `<div style="padding:10px 16px;color:var(--dim);font-size:.82rem">Comentarios no disponibles aún.</div>`
  }
}

async function submitComment(postId, input, section) {
  const content = input.value.trim()
  if (!content || !_currentUser) return
  input.disabled = true
  try {
    const { data: comment, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, user_id: _currentUser.id, content })
      .select('id, content, created_at, user_id, profiles:user_id(username, full_name, avatar_url)')
      .single()
    if (error) throw error
    input.value = ''
    const list = document.getElementById('comment-list-' + postId)
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
            <button class="comment-delete-btn" data-id="${comment.id}" data-post="${postId}" style="float:right;font-size:.68rem;background:none;border:none;color:var(--muted);cursor:pointer" title="Eliminar">✕</button>
          </div>
          <div class="comment-text">${esc(comment.content)}</div>
          <div class="comment-time">hace un momento</div>
        </div>`
      el.querySelector('.comment-delete-btn').addEventListener('click', async () => {
        await supabase.from('post_comments').delete().eq('id', comment.id).eq('user_id', _currentUser.id)
        el.remove()
      })
      list.appendChild(el)
      list.scrollTop = list.scrollHeight
    }
  } catch (e) {
    console.error('[comment]', e)
    showToast('Error al publicar comentario')
  } finally { input.disabled = false; input.focus() }
}

// ══ Historial de apoyos (perfil propio) ══════════════
async function renderHistorialApoyos() {
  const section = document.getElementById('apoyo-hist-section')
  if (!section || !_currentUser) return
  section.style.display = ''
  section.innerHTML = `
    <div class="apoyo-hist-outer">
      <div class="apoyo-hist-section">
        <div class="apoyo-hist-title">🏆 Creadores que has apoyado</div>
        <div class="apoyo-hist-list" id="apoyo-hist-list"><div class="apoyo-hist-empty">Cargando…</div></div>
      </div>
    </div>`

  try {
    const { data: rows } = await supabase
      .from('profile_apoyos').select('supported_id, created_at')
      .eq('supporter_id', _currentUser.id).order('created_at', { ascending: false }).limit(20)
    const list = section.querySelector('#apoyo-hist-list')
    if (!rows?.length) { list.innerHTML = `<div class="apoyo-hist-empty">Aún no has apoyado ningún creador</div>`; return }
    const ids = rows.map(r => r.supported_id)
    const [{ data: profiles }, { data: earlyRows }] = await Promise.all([
      supabase.from('profiles').select('id, username, full_name, avatar_url').in('id', ids),
      supabase.from('early_supporters').select('creator_id, apoyo_number').eq('supporter_id', _currentUser.id).in('creator_id', ids),
    ])
    const pMap = Object.fromEntries((profiles || []).map(p => [p.id, p]))
    const eMap = Object.fromEntries((earlyRows || []).map(e => [e.creator_id, e]))
    list.innerHTML = rows.map(r => {
      const p    = pMap[r.supported_id] || {}
      const earl = eMap[r.supported_id]
      const ini  = (p.full_name || p.username || '?').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()
      const fecha = new Date(r.created_at).toLocaleDateString('es-CL', { day:'numeric', month:'short', year:'2-digit' })
      return `<a class="apoyo-hist-item" href="/perfil/${encodeURIComponent(p.username || '')}">
        ${p.avatar_url ? `<img src="${p.avatar_url}" class="apoyo-hist-avatar" alt="">` : `<div class="apoyo-hist-avatar-fb">${ini}</div>`}
        <div class="apoyo-hist-info">
          <div class="apoyo-hist-name">${esc(p.full_name || p.username || 'Perfil desconocido')}</div>
          <div class="apoyo-hist-user">@${esc(p.username || '?')}</div>
          ${earl ? `<div class="apoyo-hist-ojeador">🔭 Ojeador #${earl.apoyo_number}</div>` : ''}
        </div>
        <div class="apoyo-hist-date">${fecha}</div>
      </a>`
    }).join('')
  } catch (e) {
    const list = section.querySelector('#apoyo-hist-list')
    if (list) list.innerHTML = `<div class="apoyo-hist-empty">Error al cargar</div>`
  }
}

// ══ Medallero ════════════════════════════════════════
async function syncMedalsFromProgress(profile, progress) {
  try {
    const stored     = Array.isArray(profile.medallas) ? profile.medallas : []
    const musicMedal = stored.includes('music_note') ? ['music_note'] : []
    const computed   = computeMedalsFromProgress(progress, albumData, INTRO_DATA)
    const newSet     = [...new Set([...computed, ...musicMedal])]
    const storedSet  = new Set(stored)
    const newSetSet  = new Set(newSet)
    const changed    = newSet.some(id => !storedSet.has(id)) || stored.some(id => id !== 'music_note' && !newSetSet.has(id))
    if (changed) {
      await supabase.from('profiles').update({ medallas: newSet }).eq('id', profile.id)
      profile.medallas = newSet
    }
  } catch (e) { console.error('[medals]', e) }
  await renderMedalleroSection(profile, _isOwnProfile ? 'own' : 2)
}

async function renderMedalleroSection(profile, level) {
  const section   = document.getElementById('medallero-section')
  const container = document.getElementById('medallero-container')
  const subtitle  = document.getElementById('medallero-subtitle')
  const toggle    = document.getElementById('medallero-toggle')
  const body      = document.getElementById('medallero-body')
  if (!section || !container) return
  const medals     = Array.isArray(profile.medallas) ? profile.medallas : []
  const showLocked = level === 'own'
  if (subtitle) {
    subtitle.textContent = medals.length > 0
      ? `${medals.length} medalla${medals.length !== 1 ? 's' : ''} obtenida${medals.length !== 1 ? 's' : ''}`
      : (showLocked ? 'Completa selecciones para ganar medallas' : 'Sin medallas aún')
  }
  renderMedallero(container, medals, showLocked)
  if (toggle && body) {
    toggle.addEventListener('click', () => {
      const open = body.style.display !== 'none'
      body.style.display = open ? 'none' : ''
      toggle.textContent = open ? '▼' : '▲'
      toggle.setAttribute('aria-expanded', !open)
    })
  }
  section.style.display = ''
}

// ══ Zona de amistad ═══════════════════════════════════
function renderFriendZone(level) {
  const zone = document.getElementById('friend-zone')
  if (!zone) return
  if (level === 'own' || level === 0) { zone.style.display = 'none'; return }
  zone.style.display = 'flex'
  const f = _friendship
  if (!f) {
    zone.innerHTML = `<span class="friend-status-label">Coleccionista</span><button class="friend-btn primary" id="btn-add">➕ Agregar amigo</button>`
    document.getElementById('btn-add').addEventListener('click', handleAdd)
    return
  }
  if (f.status === 'pending' && f.sender_id === _currentUser.id) {
    zone.innerHTML = `<span class="friend-status-label">Solicitud enviada</span><button class="friend-btn secondary" id="btn-cancel">⏳ Pendiente · Cancelar</button>`
    document.getElementById('btn-cancel').addEventListener('click', handleRemove)
    return
  }
  if (f.status === 'pending' && f.receiver_id === _currentUser.id) {
    zone.innerHTML = `<span class="friend-status-label">Te envió una solicitud</span>
      <div style="display:flex;gap:8px">
        <button class="friend-btn primary" id="btn-accept">✅ Aceptar</button>
        <button class="friend-btn danger"   id="btn-reject">✗ Rechazar</button>
      </div>`
    document.getElementById('btn-accept').addEventListener('click', handleAccept)
    document.getElementById('btn-reject').addEventListener('click', handleRemove)
    return
  }
  if (f.status === 'accepted') {
    zone.innerHTML = `<span class="friend-status-label">✓ Son amigos</span>
      <a href="/chat/${encodeURIComponent(_profileData.username || '')}" class="chat-btn-link">💬 Chat</a>
      <button class="friend-btn secondary" id="btn-remove">✗ Eliminar amigo</button>`
    document.getElementById('btn-remove').addEventListener('click', handleRemove)
  }
}

async function handleAdd() {
  const btn = document.getElementById('btn-add')
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando...' }
  try {
    _friendship = await sendFriendRequest(_profileData.id)
    showToast('✅ Solicitud enviada')
    renderFriendZone(1)
  } catch { showToast('⚠️ Error al enviar'); if (btn) { btn.disabled = false; btn.textContent = '➕ Agregar amigo' } }
}

async function handleAccept() {
  const btn = document.getElementById('btn-accept')
  if (btn) { btn.disabled = true; btn.textContent = 'Aceptando...' }
  try {
    _friendship = await acceptFriendRequest(_friendship.id)
    showToast('🎉 ¡Ahora son amigos!')
    renderFriendZone(2)
    const { data: albumRow } = await supabase.from('album_progress').select('progress')
      .eq('user_id', _profileData.id).eq('album_id', 'wc2026').maybeSingle()
    renderFullAlbumSection(document.getElementById('album-section'), _profileData, albumRow?.progress || {})
  } catch { showToast('⚠️ Error al aceptar') }
}

async function handleRemove() {
  if (!_friendship) return
  if (!window.confirm('¿Confirmar? Se eliminará la solicitud o amistad.')) return
  try {
    await removeFriendship(_friendship.id)
    _friendship = null
    showToast('Amistad eliminada')
    renderFriendZone(1)
    const pct = await getPublicPct(_profileData.id)
    renderLockedAlbumSection(document.getElementById('album-section'), _profileData, 1, pct)
  } catch { showToast('⚠️ Error al eliminar') }
}

// ══ Utilidades ════════════════════════════════════════
function showError(msg) {
  document.getElementById('state-loading').style.display = 'none'
  const errEl = document.getElementById('state-error')
  if (errEl) {
    errEl.style.display = 'block'
    const msgEl = errEl.querySelector('.state-sub')
    if (msgEl) msgEl.textContent = msg
  }
}

function showToast(msg, ms = 2800) {
  let t = document.getElementById('pf-toast')
  if (!t) { t = document.createElement('div'); t.id = 'pf-toast'; document.body.appendChild(t) }
  t.textContent = msg; t.classList.add('visible')
  setTimeout(() => t.classList.remove('visible'), ms)
}

// ══ Panel de accesibilidad ════════════════════════════
function initA11y() {
  const fab   = document.getElementById('a11y-fab')
  const panel = document.getElementById('a11y-panel')
  const close = document.getElementById('a11y-close')
  if (!fab || !panel) return
  fab.addEventListener('click', () => panel.classList.toggle('open'))
  close?.addEventListener('click', () => panel.classList.remove('open'))

  // Tema
  const savedTheme = localStorage.getItem('pf-theme') || 'dark'
  document.documentElement.setAttribute('data-theme', savedTheme)
  document.querySelectorAll('.a11y-mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === savedTheme)
    btn.addEventListener('click', () => {
      const t = btn.dataset.theme
      document.documentElement.setAttribute('data-theme', t)
      localStorage.setItem('pf-theme', t)
      document.querySelectorAll('.a11y-mode-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === t))
    })
  })

  // Tamaño de fuente
  const savedSize = localStorage.getItem('pf-font') || 'normal'
  applyFont(savedSize)
  document.querySelectorAll('.a11y-font-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.size === savedSize)
    btn.addEventListener('click', () => {
      applyFont(btn.dataset.size)
      localStorage.setItem('pf-font', btn.dataset.size)
      document.querySelectorAll('.a11y-font-btn').forEach(b => b.classList.toggle('active', b.dataset.size === btn.dataset.size))
    })
  })

  // Reducir animaciones
  const reduceCheck = document.getElementById('reduce-motion')
  if (reduceCheck) {
    reduceCheck.checked = localStorage.getItem('pf-reduce') === '1'
    if (reduceCheck.checked) document.documentElement.classList.add('reduce-motion')
    reduceCheck.addEventListener('change', () => {
      document.documentElement.classList.toggle('reduce-motion', reduceCheck.checked)
      localStorage.setItem('pf-reduce', reduceCheck.checked ? '1' : '0')
    })
  }
}

function applyFont(size) {
  const map = { small:'.9rem', normal:'1rem', large:'1.1rem', xlarge:'1.2rem' }
  document.documentElement.style.fontSize = map[size] || '1rem'
}
