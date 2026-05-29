// ═══════════════════════════════════════════════════
//  ÁLBUM MUNDIAL 2026 — amigos.js
//  Sistema de búsqueda de amigos y coleccionistas
// ═══════════════════════════════════════════════════
import { supabase } from './supabase.js'
import { getFriendshipStatus, sendFriendRequest } from './friendships.js'

let _searchTimer = null
let _currentUser = null  // se carga al abrir el panel

// ── Inicializar ───────────────────────────────────
export function initAmigos() {
  injectButton()
  injectOverlay()
  setupListeners()
}

// ── Inyectar botón en #controls ───────────────────
function injectButton() {
  const controls = document.getElementById('controls')
  if (!controls || document.getElementById('btn-amigos')) return

  const btn = document.createElement('button')
  btn.className = 'action-btn'
  btn.id = 'btn-amigos'
  btn.setAttribute('aria-label', 'Buscar amigos coleccionistas')
  btn.innerHTML = '🔎 <span class="btn-label">Amigos</span>'

  const resetBtn = document.getElementById('btn-reset')
  if (resetBtn) controls.insertBefore(btn, resetBtn)
  else controls.appendChild(btn)
}

// ── Inyectar overlay en el body ───────────────────
function injectOverlay() {
  if (document.getElementById('amigos-overlay')) return

  const overlay = document.createElement('div')
  overlay.id = 'amigos-overlay'
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-modal', 'true')
  overlay.setAttribute('aria-label', 'Buscar amigos coleccionistas')
  overlay.innerHTML = `
    <div class="amigos-header">
      <button class="amigos-back" id="amigos-close" aria-label="Cerrar">← Volver</button>
      <div class="amigos-header-titles">
        <div class="amigos-eyebrow">Panini · Coleccionistas</div>
        <h2 class="amigos-title">BUSCAR <span>AMIGOS</span></h2>
        <p class="amigos-sub">Encontrá otros coleccionistas · Hacé clic para ver su álbum</p>
      </div>
    </div>

    <div class="amigos-search-wrap">
      <div class="amigos-search-box">
        <span class="amigos-search-icon" aria-hidden="true">🔍</span>
        <input
          type="text"
          id="amigos-input"
          class="amigos-input"
          placeholder="Buscar por username o nombre..."
          maxlength="30"
          autocomplete="off"
          spellcheck="false"
        >
        <button class="amigos-clear" id="amigos-clear" aria-label="Limpiar búsqueda" hidden>✕</button>
      </div>
    </div>

    <div class="amigos-body">
      <div id="amigos-results" class="amigos-results">
        <div class="amigos-empty" id="amigos-initial">
          <div class="amigos-empty-icon">⚽</div>
          <div class="amigos-empty-title">Escribí un username o nombre</div>
          <div class="amigos-empty-sub">Encontrá coleccionistas y mirá su álbum</div>
        </div>
      </div>
    </div>
  `
  document.body.appendChild(overlay)
}

// ── Event listeners ───────────────────────────────
function setupListeners() {
  document.getElementById('btn-amigos')?.addEventListener('click', openAmigos)

  document.addEventListener('click', e => {
    if (e.target?.id === 'amigos-close') closeAmigos()
  })
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const ov = document.getElementById('amigos-overlay')
      if (ov?.classList.contains('visible')) closeAmigos()
    }
  })

  document.addEventListener('input', e => {
    if (e.target?.id !== 'amigos-input') return
    const val = e.target.value.trim()
    const clearBtn = document.getElementById('amigos-clear')
    if (clearBtn) clearBtn.hidden = !val

    clearTimeout(_searchTimer)
    if (!val) { showInitial(); return }
    if (val.length < 2) { showMsg('Escribe al menos 2 caracteres...', '⏳'); return }

    showMsg('Buscando...', '⏳')
    _searchTimer = setTimeout(() => doSearch(val), 380)
  })

  document.addEventListener('click', e => {
    if (e.target?.id !== 'amigos-clear') return
    const input = document.getElementById('amigos-input')
    if (input) { input.value = ''; input.focus() }
    document.getElementById('amigos-clear').hidden = true
    showInitial()
  })
}

async function openAmigos() {
  // Obtener sesión actual al abrir (puede haber cambiado)
  const { data: { user } } = await supabase.auth.getUser()
  _currentUser = user

  document.getElementById('amigos-overlay')?.classList.add('visible')
  setTimeout(() => document.getElementById('amigos-input')?.focus(), 180)
}

function closeAmigos() {
  document.getElementById('amigos-overlay')?.classList.remove('visible')
}

// ── Búsqueda en Supabase ──────────────────────────
async function doSearch(query) {
  try {
    const clean = query.toLowerCase().replace(/^@/, '')

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, favorite_team, favorite_position, bio, avatar_url')
      .or(`username.ilike.%${clean}%,full_name.ilike.%${clean}%`)
      .order('username', { ascending: true })
      .limit(24)

    if (error) throw error

    if (!data || data.length === 0) {
      showMsg(`No hay coleccionistas con "${query}"`, '😕')
      return
    }

    // Si el usuario está logueado, enriquecer con estado de amistad
    let friendships = {}
    if (_currentUser) {
      friendships = await batchFriendshipStatus(data.map(p => p.id))
    }

    renderResults(data, friendships)
  } catch (err) {
    console.error('[amigos] doSearch:', err)
    showMsg('Error al buscar. Intenta de nuevo.', '⚠️')
  }
}

// ── Batch de estados de amistad ───────────────────
// Una sola query para todos los resultados, evita N+1
async function batchFriendshipStatus(profileIds) {
  if (!_currentUser || profileIds.length === 0) return {}

  try {
    const { data } = await supabase
      .from('friendships')
      .select('id, status, sender_id, receiver_id')
      .or(
        profileIds.map(id =>
          `and(sender_id.eq.${_currentUser.id},receiver_id.eq.${id}),` +
          `and(sender_id.eq.${id},receiver_id.eq.${_currentUser.id})`
        ).join(',')
      )

    const map = {}
    ;(data || []).forEach(f => {
      const otherId = f.sender_id === _currentUser.id ? f.receiver_id : f.sender_id
      map[otherId] = f
    })
    return map
  } catch {
    return {}
  }
}

// ── Render resultados ─────────────────────────────
function renderResults(profiles, friendships = {}) {
  const container = document.getElementById('amigos-results')
  if (!container) return

  // Filtrar el propio usuario de los resultados
  const filtered = _currentUser
    ? profiles.filter(p => p.id !== _currentUser.id)
    : profiles

  if (filtered.length === 0) {
    showMsg('No hay otros coleccionistas con ese nombre', '😕')
    return
  }

  container.innerHTML = `
    <div class="amigos-count">${filtered.length} coleccionista${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}</div>
    <div class="amigos-grid">
      ${filtered.map(p => renderCard(p, friendships[p.id])).join('')}
    </div>
  `

  // Listener en botones de agregar (delegado)
  container.addEventListener('click', handleCardClick)
}

async function handleCardClick(e) {
  // Clic en botón agregar
  const addBtn = e.target.closest('.amigos-add-btn')
  if (addBtn) {
    e.stopPropagation()
    if (!_currentUser) {
      window.location.href = 'https://albumpanini26digital.vercel.app'
      return
    }
    const profileId = addBtn.dataset.profileId
    if (!profileId) return
    addBtn.disabled = true
    addBtn.textContent = '⏳'
    try {
      await sendFriendRequest(profileId)
      addBtn.textContent = '✓ Enviado'
      addBtn.classList.remove('amigos-add-btn')
      addBtn.classList.add('amigos-sent-btn')
    } catch (err) {
      console.error('[amigos] sendFriendRequest:', err)
      addBtn.disabled = false
      addBtn.textContent = '➕'
    }
    return
  }

  // Clic en la card → abrir perfil
  const card = e.target.closest('.amigos-card')
  if (card) {
    const username = card.dataset.username
    if (username) window.open(`/perfil/?u=${encodeURIComponent(username)}`, '_blank')
  }
}

// ── Render card individual ────────────────────────
function renderCard(p, friendship) {
  const initials = (p.full_name || p.username || 'FC')
    .trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase() || 'FC'

  const avatarHtml = p.avatar_url
    ? `<img src="${escHtml(p.avatar_url)}" alt="" class="amigos-card-avatar-img">`
    : `<span class="amigos-card-avatar-fb">${escHtml(initials)}</span>`

  const team     = p.favorite_team     ? `<span class="amigos-card-tag">⚽ ${escHtml(p.favorite_team)}</span>` : ''
  const position = p.favorite_position ? `<span class="amigos-card-tag">🧤 ${escHtml(p.favorite_position)}</span>` : ''
  const bio      = p.bio ? `<div class="amigos-card-bio">${escHtml(p.bio)}</div>` : ''

  // Badge / botón de amistad
  const friendBadge = renderFriendBadge(p, friendship)

  return `
    <div class="amigos-card" data-username="${escHtml(p.username)}" data-profile-id="${escHtml(p.id)}"
         role="button" tabindex="0" aria-label="Ver álbum de @${escHtml(p.username)}">
      <div class="amigos-card-avatar">${avatarHtml}</div>
      <div class="amigos-card-info">
        <div class="amigos-card-name">${escHtml(p.full_name || p.username)}</div>
        <div class="amigos-card-username">@${escHtml(p.username)}</div>
        ${bio}
        <div class="amigos-card-tags">${team}${position}</div>
      </div>
      ${friendBadge}
    </div>
  `
}

function renderFriendBadge(p, friendship) {
  // No logueado: solo flecha
  if (!_currentUser) {
    return `<div class="amigos-card-arrow">→</div>`
  }

  // Sin relación previa → botón agregar
  if (!friendship) {
    return `<button class="amigos-add-btn" data-profile-id="${escHtml(p.id)}"
              title="Agregar amigo" aria-label="Agregar a @${escHtml(p.username)}">➕</button>`
  }

  if (friendship.status === 'accepted') {
    return `<span class="amigos-friend-badge accepted" title="Son amigos">✓</span>`
  }

  if (friendship.status === 'pending') {
    const isSender = friendship.sender_id === _currentUser.id
    return `<span class="amigos-friend-badge pending" title="${isSender ? 'Solicitud enviada' : 'Te envió una solicitud'}">
              ${isSender ? '⏳' : '📩'}
            </span>`
  }

  return `<div class="amigos-card-arrow">→</div>`
}

// ── UI helpers ────────────────────────────────────
function showInitial() {
  const container = document.getElementById('amigos-results')
  if (!container) return
  container.innerHTML = `
    <div class="amigos-empty" id="amigos-initial">
      <div class="amigos-empty-icon">⚽</div>
      <div class="amigos-empty-title">Escribí un username o nombre</div>
      <div class="amigos-empty-sub">Encontrá coleccionistas y mirá su álbum</div>
    </div>`
}

function showMsg(msg, icon = '⏳') {
  const container = document.getElementById('amigos-results')
  if (!container) return
  container.innerHTML = `
    <div class="amigos-empty">
      <div class="amigos-empty-icon">${icon}</div>
      <div class="amigos-empty-title">${escHtml(msg)}</div>
    </div>`
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
