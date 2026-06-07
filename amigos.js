// ═══════════════════════════════════════════════════
//  ÁLBUM MUNDIAL 2026 — amigos.js
//  Sistema de búsqueda de amigos y coleccionistas
// ═══════════════════════════════════════════════════
import { supabase } from './supabase.js'
import {
  acceptFriendRequest,
  getFriendshipStatus,
  removeFriendship,
  sendFriendRequest
} from './friendships.js'

let _searchTimer = null
let _currentUser = null
let _friends = []
let _activeChatFriend = null
let _chatRefreshTimer = null
let _lastChatSignature = ''
let _unreadCounts = {}   // { [friendId]: number }

// ── Unread message tracking via Supabase chat_receipts ──
async function markChatRead(userId, friendId) {
  try {
    await supabase.from('chat_receipts').upsert(
      { user_id: userId, friend_id: friendId, last_read_at: new Date().toISOString() },
      { onConflict: 'user_id,friend_id' }
    )
    _unreadCounts[friendId] = 0
  } catch (e) { console.warn('[chat] markChatRead error:', e) }
}

async function fetchUnreadCounts(userId, friendIds) {
  if (!friendIds.length) return {}
  try {
    // Traer receipts del usuario actual
    const { data: receipts } = await withTimeout(
      supabase.from('chat_receipts')
        .select('friend_id, last_read_at')
        .eq('user_id', userId)
        .in('friend_id', friendIds)
    )
    const readMap = {}
    ;(receipts || []).forEach(r => { readMap[r.friend_id] = r.last_read_at })

    // Traer mensajes recientes
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data: msgs } = await withTimeout(
      supabase.from('friend_messages')
        .select('sender_id, created_at')
        .eq('receiver_id', userId)
        .in('sender_id', friendIds)
        .gte('created_at', since)
    )

    const counts = {}
    ;(msgs || []).forEach(msg => {
      const lastRead = readMap[msg.sender_id]
      // Sin receipt (nunca abrió el chat) → todo no leído
      // Con receipt → contar solo mensajes posteriores al receipt
      if (!lastRead || msg.created_at > lastRead) {
        counts[msg.sender_id] = (counts[msg.sender_id] || 0) + 1
      }
    })
    return counts
  } catch (e) { console.warn('[chat] fetchUnreadCounts error:', e); return {} }
}

// ── FIX: debounce + guard para evitar refreshes superpuestos ─────
let _friendsRefreshing = false
let _friendsDebounceTimer = null

function debouncedFriendsRefresh(userOverride) {
  clearTimeout(_friendsDebounceTimer)
  _friendsDebounceTimer = setTimeout(async () => {
    if (_friendsRefreshing) return
    _friendsRefreshing = true
    try { await refreshFriendsPanel(userOverride) }
    finally { _friendsRefreshing = false }
  }, 350)
}

// ── FIX: getSessionUser con timeout propio ───────────────────────
// supabase.auth.getSession() puede colgar indefinidamente si la
// conexión se enfrió. Le damos 6 s y como fallback usamos getUser().
async function getSessionUser() {
  try {
    const result = await Promise.race([
      supabase.auth.getSession(),
      new Promise((_, rej) =>
        setTimeout(() => rej(new Error('auth-timeout')), 6000)
      )
    ])
    return result?.data?.session?.user || null
  } catch {
    try {
      const { data } = await supabase.auth.getUser()
      return data?.user || null
    } catch {
      return null
    }
  }
}

function withTimeout(promise, ms = 12000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => {
      const error = new Error('Tiempo de espera agotado')
      error.name = 'SocialTimeoutError'
      reject(error)
    }, ms))
  ])
}

function getSupabaseErrorKind(error) {
  const status = error?.status
  const code = String(error?.code || '')
  const msg = String(error?.message || error?.details || '').toLowerCase()
  if (error?.name === 'SocialTimeoutError') return 'timeout'
  if (status === 401 || msg.includes('jwt') || msg.includes('session') || msg.includes('auth')) return 'auth'
  if (status === 403 || code === '42501' || msg.includes('permission') || msg.includes('rls')) return 'permission'
  if (code === '42P01' || msg.includes('does not exist') || msg.includes('schema cache')) return 'missing-table'
  return 'unknown'
}

function renderSocialError(error, area = 'friends') {
  const kind = getSupabaseErrorKind(error)
  if (kind === 'timeout') return 'Supabase tardó demasiado. Pulsa ↻ para reintentar.'
  if (kind === 'auth') return 'Tu sesión expiró. Cierra sesión y volvé a entrar con Google.'
  if (kind === 'permission') return area === 'chat'
    ? 'No tienes permiso para ver este chat. Confirmá que siguen siendo amigos.'
    : 'No tienes permiso para cargar amigos. Revisá las policies de friendships/profiles.'
  if (kind === 'missing-table') return area === 'chat'
    ? 'Falta ejecutar el SQL del chat en Supabase.'
    : 'Falta una tabla necesaria en Supabase.'
  return area === 'chat'
    ? 'No se pudo cargar el chat. Intentá nuevamente.'
    : 'No se pudieron cargar tus amigos. Pulsá ↻ para reintentar.'
}

// ── Inicializar ───────────────────────────────────
export function initAmigos() {
  injectButton()
  injectOverlay()
  setupListeners()
  debouncedFriendsRefresh()

  // ── FIX: solo reaccionar a login/logout real, NO a TOKEN_REFRESHED ───
  // TOKEN_REFRESHED dispara cada hora y getSession() puede colgar en ese momento
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
      _currentUser = session?.user || null
      debouncedFriendsRefresh(_currentUser)
    }
  })

  // ── FIX: refrescar al volver a la pestaña tras inactividad ──────────
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') debouncedFriendsRefresh()
  })
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

// ── Inyectar overlay ──────────────────────────────
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
        <input type="text" id="amigos-input" class="amigos-input"
          placeholder="Buscar por username o nombre..."
          maxlength="30" autocomplete="off" spellcheck="false">
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
    </div>`
  document.body.appendChild(overlay)
}

// ── Event listeners ───────────────────────────────
function setupListeners() {
  document.getElementById('btn-amigos')?.addEventListener('click', openAmigos)

  // ── FIX: botón ↻ usa debouncedFriendsRefresh ────────────────────
  document.getElementById('friends-refresh')?.addEventListener('click', () => debouncedFriendsRefresh())

  document.addEventListener('click', e => {
    if (e.target?.id === 'amigos-close') closeAmigos()
  })
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('amigos-overlay')?.classList.contains('visible')) closeAmigos()
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
  document.addEventListener('click', handleFriendsPanelClick)
}

async function openAmigos() {
  const user = await getSessionUser()
  _currentUser = user
  document.getElementById('amigos-overlay')?.classList.add('visible')
  setTimeout(() => document.getElementById('amigos-input')?.focus(), 180)
}

function closeAmigos() {
  document.getElementById('amigos-overlay')?.classList.remove('visible')
}

// ── Refresh del panel de amigos ───────────────────
export async function refreshFriendsPanel(userOverride) {
  const body = document.getElementById('friends-panel-body')
  if (!body) return

  const user = userOverride !== undefined ? userOverride : await getSessionUser()
  _currentUser = user

  if (!user) {
    body.innerHTML = '<div class="social-empty">Entra con Google para ver tus amigos.</div>'
    _friends = []
    closeChat()
    return
  }

  body.innerHTML = '<div class="social-empty">Actualizando amigos...</div>'

  try {
    const [friends, pending] = await Promise.all([
      loadAcceptedFriends(user.id),
      loadPendingRequestsForPanel(user.id)
    ])
    _friends = friends

    // Obtener mensajes no leídos de cada amigo
    _unreadCounts = await fetchUnreadCounts(user.id, friends.map(f => f.id))

    const pendingHtml = pending.length
      ? `<section>
          <div class="social-section-title">Solicitudes</div>
          <div class="social-list">${pending.map(renderPendingRequest).join('')}</div>
        </section>`
      : ''

    const friendsHtml = friends.length
      ? `<section>
          <div class="social-section-title">Mis amigos</div>
          <div class="social-list">${friends.map(renderFriendPanelCard).join('')}</div>
        </section>`
      : '<div class="social-empty">Todavía no tenés amigos aceptados. Usá el buscador para encontrar coleccionistas.</div>'

    body.innerHTML = pendingHtml + friendsHtml

    if (_activeChatFriend && !friends.some(f => f.id === _activeChatFriend.id)) {
      closeChat()
    } else if (_activeChatFriend) {
      markActiveFriend()
    }
  } catch (err) {
    console.error('[amigos] refreshFriendsPanel:', err)
    body.innerHTML = `<div class="social-empty">
      ${renderSocialError(err, 'friends')}
      <br><button onclick="window.debouncedFriendsRefresh?.()" class="social-retry-btn" style="margin-top:10px">↻ Reintentar</button>
    </div>`
  }
}

// Exponer para el botón inline de error
window.debouncedFriendsRefresh = () => debouncedFriendsRefresh()

async function loadAcceptedFriends(userId) {
  const { data, error } = await withTimeout(
    supabase
      .from('friendships')
      .select('id, sender_id, receiver_id, status')
      .eq('status', 'accepted')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
  )
  if (error) throw error
  const rows = data || []
  const friendIds = rows.map(f => f.sender_id === userId ? f.receiver_id : f.sender_id)
  const profiles = await loadProfilesByIds(friendIds)
  return rows
    .map(f => {
      const friendId = f.sender_id === userId ? f.receiver_id : f.sender_id
      const profile = profiles[friendId]
      return profile ? { friendshipId: f.id, ...profile } : null
    })
    .filter(Boolean)
    .sort((a, b) => String(a.username).localeCompare(String(b.username)))
}

async function loadPendingRequestsForPanel(userId) {
  const { data, error } = await withTimeout(
    supabase
      .from('friendships')
      .select('id, sender_id, created_at')
      .eq('receiver_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
  )
  if (error) throw error
  const rows = data || []
  const profiles = await loadProfilesByIds(rows.map(f => f.sender_id))
  return rows
    .map(f => {
      const profile = profiles[f.sender_id]
      return profile ? { friendshipId: f.id, ...profile } : null
    })
    .filter(Boolean)
}

async function loadProfilesByIds(ids) {
  const cleanIds = [...new Set((ids || []).filter(Boolean))]
  if (cleanIds.length === 0) return {}
  const { data, error } = await withTimeout(
    supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, favorite_team')
      .in('id', cleanIds)
  )
  if (error) throw error
  const map = {}
  ;(data || []).forEach(p => { map[p.id] = p })
  return map
}

function renderFriendPanelCard(p) {
  const unread = _unreadCounts[p.id] || 0
  const badge  = unread > 0
    ? `<span class="chat-unread-badge" aria-label="${unread} mensajes nuevos">${unread > 9 ? '9+' : unread}</span>`
    : ''
  return `
    <div class="social-card" data-friend-id="${escHtml(p.id)}">
      ${renderSocialAvatar(p)}
      <span class="social-card-copy">
        <span class="social-name">${escHtml(p.full_name || p.username)}</span>
        <span class="social-user">@${escHtml(p.username)}${p.favorite_team ? ' · ' + escHtml(p.favorite_team) : ''}</span>
        <span class="social-card-actions">
          <button class="social-mini-btn primary chat-btn-with-badge" data-chat-friend="${escHtml(p.id)}" type="button">
            Chat${badge}
          </button>
          <a class="social-mini-link" href="/perfil/?u=${encodeURIComponent(p.username)}">Perfil</a>
        </span>
      </span>
    </div>`
}

function renderPendingRequest(p) {
  return `
    <div class="social-card" data-friendship-id="${escHtml(p.friendshipId)}">
      ${renderSocialAvatar(p)}
      <span class="social-card-copy">
        <span class="social-name">${escHtml(p.full_name || p.username)}</span>
        <span class="social-user">@${escHtml(p.username)} quiere ser tu amigo</span>
        <span class="social-actions">
          <button class="social-mini-btn primary" data-friend-action="accept" type="button">Aceptar</button>
          <button class="social-mini-btn" data-friend-action="reject" type="button">Rechazar</button>
        </span>
      </span>
    </div>`
}

function renderSocialAvatar(p) {
  const initials = (p.full_name || p.username || 'FC')
    .trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase() || 'FC'
  return p.avatar_url
    ? `<span class="social-avatar"><img src="${escHtml(p.avatar_url)}" alt=""></span>`
    : `<span class="social-avatar">${escHtml(initials)}</span>`
}

async function handleFriendsPanelClick(e) {
  const chatBtn = e.target.closest('[data-chat-friend]')
  if (chatBtn) {
    const friend = _friends.find(f => f.id === chatBtn.dataset.chatFriend)
    if (friend) openChat(friend)
    return
  }
  const actionBtn = e.target.closest('[data-friend-action]')
  if (!actionBtn) return
  const card = actionBtn.closest('[data-friendship-id]')
  const friendshipId = card?.dataset.friendshipId
  if (!friendshipId) return
  actionBtn.disabled = true
  try {
    if (actionBtn.dataset.friendAction === 'accept') {
      await acceptFriendRequest(friendshipId)
    } else {
      await removeFriendship(friendshipId)
    }
    await refreshFriendsPanel()
  } catch (err) {
    console.error('[amigos] handleFriendsPanelClick:', err)
    actionBtn.disabled = false
  }
}

function openChat(friend) {
  if (_currentUser) markChatRead(_currentUser.id, friend.id)
  _unreadCounts[friend.id] = 0
  const card = document.querySelector(`.social-card[data-friend-id="${friend.id}"]`)
  card?.querySelector('.chat-unread-badge')?.remove()
  if (!_currentUser) return
  _activeChatFriend = friend
  _lastChatSignature = ''
  markActiveFriend()
  renderChatShell(friend)
  loadChatMessages({ scroll: true })
  clearInterval(_chatRefreshTimer)
  _chatRefreshTimer = setInterval(() => loadChatMessages(), 5000)
}

function closeChat() {
  clearInterval(_chatRefreshTimer)
  _chatRefreshTimer = null
  _activeChatFriend = null
  _lastChatSignature = ''
  const body = document.getElementById('chat-panel-body')
  if (!body) return
  body.innerHTML = `
    <div class="chat-placeholder">
      <div class="chat-placeholder-icon">💬</div>
      <strong>Elige un amigo</strong>
      <span>Selecciona Chat en tu lista de amigos para iniciar una conversación privada.</span>
    </div>`
  markActiveFriend()
}

function markActiveFriend() {
  document.querySelectorAll('[data-friend-id]').forEach(card => {
    card.classList.toggle('is-active', !!_activeChatFriend && card.dataset.friendId === _activeChatFriend.id)
  })
}

function renderChatShell(friend) {
  const body = document.getElementById('chat-panel-body')
  if (!body) return
  body.innerHTML = `
    <div class="chat-thread">
      <div class="chat-peer">
        ${renderSocialAvatar(friend)}
        <span class="chat-peer-copy">
          <span class="chat-peer-name">${escHtml(friend.full_name || friend.username)}</span>
          <span class="chat-peer-user">@${escHtml(friend.username)}</span>
        </span>
      </div>
      <div class="chat-messages" id="chat-messages">
        <div class="social-empty">Cargando mensajes...</div>
      </div>
      <form class="chat-form" id="chat-form">
        <textarea class="chat-input" id="chat-input" maxlength="500" rows="1"
          placeholder="Escribe un mensaje..."
          aria-label="Mensaje para ${escHtml(friend.username)}"></textarea>
        <button class="chat-send" type="submit" aria-label="Enviar mensaje">➤</button>
      </form>
      <div class="chat-note">Solo tú y este amigo pueden ver esta conversación.</div>
    </div>`
  document.getElementById('chat-form')?.addEventListener('submit', sendChatMessage)
}

async function loadChatMessages(opts = {}) {
  if (!_currentUser || !_activeChatFriend) return
  const box = document.getElementById('chat-messages')
  if (!box) return
  let result
  try {
    result = await withTimeout(
      supabase
        .from('friend_messages')
        .select('id, sender_id, receiver_id, body, created_at')
        .or(
          `and(sender_id.eq.${_currentUser.id},receiver_id.eq.${_activeChatFriend.id}),` +
          `and(sender_id.eq.${_activeChatFriend.id},receiver_id.eq.${_currentUser.id})`
        )
        .order('created_at', { ascending: false })
        .limit(80)
    )
  } catch (err) {
    console.error('[amigos] loadChatMessages timeout:', err)
    if (opts.scroll) box.innerHTML = '<div class="social-empty">Supabase tardó demasiado cargando el chat.</div>'
    return
  }
  const { data, error } = result
  if (error) {
    console.error('[amigos] loadChatMessages:', error)
    if (opts.scroll) box.innerHTML = `<div class="social-empty">${renderSocialError(error, 'chat')}</div>`
    return
  }
  const messages = (data || []).slice().reverse()
  const signature = messages.map(m => m.id).join(',')
  if (!opts.scroll && signature === _lastChatSignature) return
  _lastChatSignature = signature
  box.innerHTML = messages.length
    ? messages.map(renderChatMessage).join('')
    : '<div class="social-empty">Aún no hay mensajes. Mandá el primero.</div>'
  if (opts.scroll || isChatNearBottom(box)) box.scrollTop = box.scrollHeight
}

function renderChatMessage(msg) {
  const mine = msg.sender_id === _currentUser?.id
  return `
    <div class="chat-msg${mine ? ' mine' : ''}">
      <div class="chat-msg-body">${escHtml(msg.body)}</div>
      <span class="chat-msg-time">${formatChatTime(msg.created_at)}</span>
    </div>`
}

async function sendChatMessage(e) {
  e.preventDefault()
  if (!_currentUser || !_activeChatFriend) return
  const input = document.getElementById('chat-input')
  const button = e.currentTarget.querySelector('.chat-send')
  const body = input?.value.trim()
  if (!body) return
  input.disabled = true
  if (button) button.disabled = true
  let result
  try {
    result = await withTimeout(
      supabase.from('friend_messages').insert({
        sender_id: _currentUser.id,
        receiver_id: _activeChatFriend.id,
        body
      })
    )
  } catch (err) {
    console.error('[amigos] sendChatMessage timeout:', err)
    input.disabled = false
    if (button) button.disabled = false
    return
  }
  const { error } = result
  input.disabled = false
  if (button) button.disabled = false
  if (error) { console.error('[amigos] sendChatMessage:', error); return }
  input.value = ''
  input.focus()
  await loadChatMessages({ scroll: true })
}

function isChatNearBottom(el) {
  return el.scrollHeight - el.scrollTop - el.clientHeight < 80
}

function formatChatTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// ── Búsqueda ──────────────────────────────────────
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
    if (!data || data.length === 0) { showMsg(`No hay coleccionistas con "${query}"`, '😕'); return }
    let friendships = {}
    if (_currentUser) friendships = await batchFriendshipStatus(data.map(p => p.id))
    renderResults(data, friendships)
  } catch (err) {
    console.error('[amigos] doSearch:', err)
    showMsg('Error al buscar. Intentá de nuevo.', '⚠️')
  }
}

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
  } catch { return {} }
}

function renderResults(profiles, friendships = {}) {
  const container = document.getElementById('amigos-results')
  if (!container) return
  const filtered = _currentUser ? profiles.filter(p => p.id !== _currentUser.id) : profiles
  if (filtered.length === 0) { showMsg('No hay otros coleccionistas con ese nombre', '😕'); return }
  container.innerHTML = `
    <div class="amigos-count">${filtered.length} coleccionista${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}</div>
    <div class="amigos-grid">${filtered.map(p => renderCard(p, friendships[p.id])).join('')}</div>`
  container.addEventListener('click', handleCardClick)
}

async function handleCardClick(e) {
  const addBtn = e.target.closest('.amigos-add-btn')
  if (addBtn) {
    e.stopPropagation()
    if (!_currentUser) { window.location.href = 'https://albumpanini26digital.vercel.app'; return }
    const profileId = addBtn.dataset.profileId
    if (!profileId) return
    addBtn.disabled = true; addBtn.textContent = '⏳'
    try {
      await sendFriendRequest(profileId)
      addBtn.textContent = '✓ Enviado'
      addBtn.classList.replace('amigos-add-btn', 'amigos-sent-btn')
      debouncedFriendsRefresh()
    } catch (err) {
      console.error('[amigos] sendFriendRequest:', err)
      addBtn.disabled = false; addBtn.textContent = '➕'
    }
    return
  }
  const card = e.target.closest('.amigos-card')
  if (card) {
    const username = card.dataset.username
    if (username) window.open(`/perfil/?u=${encodeURIComponent(username)}`, '_blank')
  }
}

function renderCard(p, friendship) {
  const initials = (p.full_name || p.username || 'FC')
    .trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase() || 'FC'
  const avatarHtml = p.avatar_url
    ? `<img src="${escHtml(p.avatar_url)}" alt="" class="amigos-card-avatar-img">`
    : `<span class="amigos-card-avatar-fb">${escHtml(initials)}</span>`
  const team     = p.favorite_team     ? `<span class="amigos-card-tag">⚽ ${escHtml(p.favorite_team)}</span>` : ''
  const position = p.favorite_position ? `<span class="amigos-card-tag">🧤 ${escHtml(p.favorite_position)}</span>` : ''
  const bio      = p.bio ? `<div class="amigos-card-bio">${escHtml(p.bio)}</div>` : ''
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
    </div>`
}

function renderFriendBadge(p, friendship) {
  if (!_currentUser) return `<div class="amigos-card-arrow">→</div>`
  if (!friendship) return `<button class="amigos-add-btn" data-profile-id="${escHtml(p.id)}"
    title="Agregar amigo" aria-label="Agregar a @${escHtml(p.username)}">➕</button>`
  if (friendship.status === 'accepted')
    return `<span class="amigos-friend-badge accepted" title="Son amigos">✓</span>`
  if (friendship.status === 'pending') {
    const isSender = friendship.sender_id === _currentUser.id
    return `<span class="amigos-friend-badge pending" title="${isSender ? 'Solicitud enviada' : 'Te envió una solicitud'}">
      ${isSender ? '⏳' : '📩'}</span>`
  }
  return `<div class="amigos-card-arrow">→</div>`
}

function showInitial() {
  const container = document.getElementById('amigos-results')
  if (!container) return
  container.innerHTML = `
    <div class="amigos-empty">
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
