// ═══════════════════════════════════════════════════
//  ÁLBUM MUNDIAL 2026 — amigos.js
//  Sistema de búsqueda de amigos y coleccionistas
// ═══════════════════════════════════════════════════
import { supabase } from './supabase.js'

let _searchTimer = null

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

  // Insertar antes del botón de reset
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
  // Abrir
  document.getElementById('btn-amigos')?.addEventListener('click', openAmigos)

  // Cerrar
  document.addEventListener('click', e => {
    if (e.target?.id === 'amigos-close') closeAmigos()
  })
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const ov = document.getElementById('amigos-overlay')
      if (ov?.classList.contains('visible')) closeAmigos()
    }
  })

  // Búsqueda
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

  // Limpiar input
  document.addEventListener('click', e => {
    if (e.target?.id !== 'amigos-clear') return
    const input = document.getElementById('amigos-input')
    if (input) { input.value = ''; input.focus() }
    document.getElementById('amigos-clear').hidden = true
    showInitial()
  })
}

function openAmigos() {
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

    renderResults(data)
  } catch (err) {
    console.error('[amigos] doSearch:', err)
    showMsg('Error al buscar. Intenta de nuevo.', '⚠️')
  }
}

// ── Render resultados ─────────────────────────────
function renderResults(profiles) {
  const container = document.getElementById('amigos-results')
  if (!container) return

  container.innerHTML = `
    <div class="amigos-count">${profiles.length} coleccionista${profiles.length !== 1 ? 's' : ''} encontrado${profiles.length !== 1 ? 's' : ''}</div>
    <div class="amigos-grid">
      ${profiles.map(p => renderCard(p)).join('')}
    </div>
  `

  // Listeners en cards
  container.querySelectorAll('.amigos-card').forEach(card => {
    card.addEventListener('click', () => {
      const username = card.dataset.username
      if (username) window.open(`/perfil/${username}`, '_blank')
    })
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        card.click()
      }
    })
  })
}

function renderCard(p) {
  const initials = (p.full_name || p.username || 'FC')
    .trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase() || 'FC'

  const avatarHtml = p.avatar_url
    ? `<img src="${escHtml(p.avatar_url)}" alt="" class="amigos-card-avatar-img">`
    : `<span class="amigos-card-avatar-fb">${escHtml(initials)}</span>`

  const team     = p.favorite_team     ? `<span class="amigos-card-tag">⚽ ${escHtml(p.favorite_team)}</span>` : ''
  const position = p.favorite_position ? `<span class="amigos-card-tag">🧤 ${escHtml(p.favorite_position)}</span>` : ''
  const bio      = p.bio ? `<div class="amigos-card-bio">${escHtml(p.bio)}</div>` : ''

  return `
    <div class="amigos-card" data-username="${escHtml(p.username)}" role="button" tabindex="0"
         aria-label="Ver álbum de @${escHtml(p.username)}">
      <div class="amigos-card-avatar">${avatarHtml}</div>
      <div class="amigos-card-info">
        <div class="amigos-card-name">${escHtml(p.full_name || p.username)}</div>
        <div class="amigos-card-username">@${escHtml(p.username)}</div>
        ${bio}
        <div class="amigos-card-tags">${team}${position}</div>
      </div>
      <div class="amigos-card-arrow">→</div>
    </div>
  `
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
