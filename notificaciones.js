// ═══════════════════════════════════════════════════
//  ÁLBUM MUNDIAL 2026 — notificaciones.js
//  Centro de notificaciones en tiempo real
// ═══════════════════════════════════════════════════
import { supabase } from './supabase.js'

let _userId    = null
let _notifs    = []
let _onUpdate  = null   // callback al cambiar notificaciones
let _sub       = null   // suscripción realtime

export const NOTIF_TYPES = {
  EXCHANGE_MATCH:    'exchange_match',
  EXCHANGE_REQUEST:  'exchange_request',
  EXCHANGE_ACCEPTED: 'exchange_accepted',
  EXCHANGE_REJECTED: 'exchange_rejected',
}

// ── Inicializar (llamar tras login) ───────────────
export async function initNotificaciones(userId, onUpdate) {
  _userId   = userId
  _onUpdate = onUpdate
  await loadNotificaciones()
  subscribeRealtime()
}

export function destroyNotificaciones() {
  _sub?.unsubscribe()
  _sub = null
}

// ── Cargar notificaciones ─────────────────────────
export async function loadNotificaciones() {
  if (!_userId) return
  try {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', _userId)
      .order('created_at', { ascending: false })
      .limit(40)
    _notifs = data || []
    _onUpdate?.(_notifs)
  } catch (e) { console.warn('[notif] load error:', e) }
}

// ── Crear notificación ────────────────────────────
export async function createNotificacion(userId, type, data = {}) {
  try {
    await supabase.from('notifications').insert({ user_id: userId, type, data })
  } catch (e) { console.warn('[notif] create error:', e) }
}

// ── Marcar como leída ─────────────────────────────
export async function markRead(notifId) {
  _notifs = _notifs.map(n => n.id === notifId ? { ...n, read: true } : n)
  _onUpdate?.(_notifs)
  try {
    await supabase.from('notifications').update({ read: true }).eq('id', notifId)
  } catch (e) { console.warn('[notif] markRead error:', e) }
}

export async function markAllRead() {
  _notifs = _notifs.map(n => ({ ...n, read: true }))
  _onUpdate?.(_notifs)
  try {
    await supabase.from('notifications').update({ read: true })
      .eq('user_id', _userId).eq('read', false)
  } catch (e) { console.warn('[notif] markAllRead error:', e) }
}

// ── Eliminar notificación ─────────────────────────
export async function deleteNotificacion(notifId) {
  _notifs = _notifs.filter(n => n.id !== notifId)
  _onUpdate?.(_notifs)
  try {
    await supabase.from('notifications').delete().eq('id', notifId)
  } catch (e) { console.warn('[notif] delete error:', e) }
}

// ── Getters ───────────────────────────────────────
export function getUnreadCount() { return _notifs.filter(n => !n.read).length }
export function getAllNotifs()    { return _notifs }

// ── Realtime ──────────────────────────────────────
function subscribeRealtime() {
  if (!_userId) return
  if (_sub) return;
  _sub = supabase
    .channel(`notifs_${_userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${_userId}`,
    }, payload => {
      _notifs = [payload.new, ..._notifs]
      _onUpdate?.(_notifs)
      showToastNotif(payload.new)
    })
    .subscribe()
}

// ── Toast de notificación nueva ───────────────────
const NOTIF_ICONS = {
  exchange_match:    '🔄',
  exchange_request:  '📩',
  exchange_accepted: '✅',
  exchange_rejected: '❌',
}
const NOTIF_LABELS = {
  exchange_match:    'Intercambio posible',
  exchange_request:  'Solicitud de intercambio',
  exchange_accepted: 'Intercambio aceptado',
  exchange_rejected: 'Intercambio rechazado',
}

function showToastNotif(notif) {
  const toast = document.createElement('div')
  toast.className = 'notif-toast'
  toast.innerHTML = `
    <span class="notif-toast-icon">${NOTIF_ICONS[notif.type] || '🔔'}</span>
    <div class="notif-toast-body">
      <div class="notif-toast-title">${NOTIF_LABELS[notif.type] || 'Notificación'}</div>
      <div class="notif-toast-msg">${notif.data?.msg || ''}</div>
    </div>
    <button class="notif-toast-close" type="button">✕</button>`
  document.body.appendChild(toast)
  requestAnimationFrame(() => toast.classList.add('notif-toast-in'))
  const close = () => {
    toast.classList.remove('notif-toast-in')
    setTimeout(() => toast.remove(), 350)
  }
  toast.querySelector('.notif-toast-close').addEventListener('click', close)
  setTimeout(close, 5000)
}

// ── Renderizar panel de notificaciones ────────────
export function renderNotifPanel(container, notifs) {
  if (!container) return
  if (!notifs.length) {
    container.innerHTML = '<div class="notif-empty">Sin notificaciones</div>'
    return
  }
  container.innerHTML = notifs.map(n => `
    <div class="notif-item${n.read ? '' : ' unread'}" data-notif-id="${n.id}">
      <span class="notif-item-icon">${NOTIF_ICONS[n.type] || '🔔'}</span>
      <div class="notif-item-body">
        <div class="notif-item-title">${NOTIF_LABELS[n.type] || 'Notificación'}</div>
        <div class="notif-item-msg">${n.data?.msg || ''}</div>
        <div class="notif-item-time">${formatRelTime(n.created_at)}</div>
      </div>
      ${n.data?.action_id ? `
        <div class="notif-item-actions">
          <button class="notif-action-btn accept" data-action="accept" data-id="${n.data.action_id}">✅</button>
          <button class="notif-action-btn reject" data-action="reject" data-id="${n.data.action_id}">❌</button>
        </div>` : ''}
      <button class="notif-item-del" data-del="${n.id}" title="Eliminar">✕</button>
    </div>`).join('')
}

function formatRelTime(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'ahora'
  if (m < 60) return `hace ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}
