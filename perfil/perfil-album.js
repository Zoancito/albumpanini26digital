// ══════════════════════════════════════════════════════
//  perfil-album.js — Renderizado del álbum en el perfil
// ══════════════════════════════════════════════════════
import { supabase }                                       from '../supabase.js'
import { esc, INTRO_DATA, albumData, GROUPS, GROUP_COLORS } from './perfil-data.js'

let _albumFilter   = 'all'
let _albumProgress = {}

// ── Porcentaje público ────────────────────────────────
export async function getPublicPct(userId) {
  try {
    const { data } = await supabase
      .from('album_progress').select('progress')
      .eq('user_id', userId).eq('album_id', 'wc2026').maybeSingle()
    if (!data?.progress) return '0%'
    let tengo = 0, total = 0
    INTRO_DATA.forEach((_, i) => { total++; const s = data.progress['INTRO::' + i]; if (s === 'tengo') tengo++ })
    Object.entries(albumData).forEach(([c, players]) => {
      players.forEach((_, i) => { total++; const s = data.progress[c + '::' + i]; if (s === 'tengo') tengo++ })
    })
    return Math.round((tengo / total) * 100) + '%'
  } catch { return '—' }
}

// ── Álbum bloqueado ───────────────────────────────────
export function renderLockedAlbumSection(section, profile, level, pct) {
  const msg = level === 0
    ? 'Iniciá sesión y agregalo como amigo para ver su álbum completo.'
    : 'Agregalo como amigo para desbloquear su álbum completo.'
  const cta = level === 0
    ? `<a href="https://albumpanini26digital.vercel.app" class="friend-btn primary" style="display:inline-flex;margin-top:8px">🔑 Iniciar sesión</a>`
    : ''
  section.innerHTML = `
    <div class="album-section" style="margin-top:20px">
      <div class="album-section-header">
        <div class="album-section-eyebrow">Colección · Mundial 2026</div>
        <div class="album-section-title">ÁLBUM DE ${esc((profile.full_name || profile.username).toUpperCase().split(' ')[0])}</div>
      </div>
      <div class="album-locked">
        <div class="album-locked-icon">🔒</div>
        <div class="album-locked-title">Álbum privado</div>
        <div class="album-locked-sub">${msg}</div>
        ${pct ? `<div class="album-locked-pct">${pct} completado</div>` : ''}
        ${cta}
      </div>
    </div>`
}

// ── Álbum completo (colapsable) ───────────────────────
export function renderFullAlbumSection(section, profile, progress) {
  _albumProgress = progress || {}
  _albumFilter   = 'all'

  // Calcular stats (mismo formato de keys que script.js: 'COUNTRY::idx' + '::sub')
  let total = 0, tengo = 0, falta = 0, rep = 0, res = 0
  INTRO_DATA.forEach((_, i) => {
    total++
    const st  = _albumProgress['INTRO::' + i] || 'none'
    const sub = _albumProgress['INTRO::' + i + '::sub'] || null
    if (st === 'tengo') tengo++; else if (st === 'falta') falta++
    if (sub === 'repetida') rep++; if (sub === 'reserva') res++
  })
  Object.entries(albumData).forEach(([c, players]) => {
    players.forEach((_, i) => {
      total++
      const st  = _albumProgress[c + '::' + i] || 'none'
      const sub = _albumProgress[c + '::' + i + '::sub'] || null
      if (st === 'tengo') tengo++; else if (st === 'falta') falta++
      if (sub === 'repetida') rep++; if (sub === 'reserva') res++
    })
  })
  const pct    = total > 0 ? Math.round((tengo / total) * 100) + '%' : '0%'
  const nombre = (profile.full_name || profile.username).toUpperCase().split(' ')[0]

  section.innerHTML = `
    <div class="album-section" style="margin-top:20px">
      <div class="album-section-header-row" id="album-toggle-header" style="cursor:pointer" tabindex="0" role="button" aria-expanded="false">
        <div>
          <div class="album-section-eyebrow">Colección · Mundial 2026</div>
          <div class="album-section-title">ÁLBUM DE ${esc(nombre)}</div>
        </div>
        <button class="album-toggle-btn" id="album-toggle-btn" aria-expanded="false">📋 Ver álbum</button>
      </div>
      <div id="album-collapsible" style="display:none">
        <div class="album-stats">
          <div class="album-stat" style="--a-accent:#f5c518"><span class="album-stat-v">${total}</span><span class="album-stat-l">Total</span></div>
          <div class="album-stat" style="--a-accent:#22c55e"><span class="album-stat-v">${tengo}</span><span class="album-stat-l">Tengo</span></div>
          <div class="album-stat" style="--a-accent:#f43f5e"><span class="album-stat-v">${falta}</span><span class="album-stat-l">Faltan</span></div>
          <div class="album-stat" style="--a-accent:#f59e0b"><span class="album-stat-v">${rep}</span><span class="album-stat-l">🔄 Repet.</span></div>
          <div class="album-stat" style="--a-accent:#818cf8"><span class="album-stat-v">${res}</span><span class="album-stat-l">📌 Reserv.</span></div>
        </div>
        <div class="album-tabs">
          <button class="atab active" data-filter="all">Todos · ${pct}</button>
          <button class="atab" data-filter="tengo">✅ Tengo</button>
          <button class="atab" data-filter="falta">❌ Faltan</button>
          <button class="atab" data-filter="repetida">🔄 Repetidas</button>
          <button class="atab" data-filter="reserva">📌 Reservadas</button>
        </div>
        <div class="album-body" id="album-body"></div>
      </div>
    </div>`

  // Toggle accordion
  const header      = section.querySelector('#album-toggle-header')
  const toggleBtn   = section.querySelector('#album-toggle-btn')
  const collapsible = section.querySelector('#album-collapsible')
  function toggleAlbum(e) {
    if (e.target.closest && e.target.closest('#album-collapsible')) return
    const open = collapsible.style.display !== 'none'
    collapsible.style.display = open ? 'none' : ''
    toggleBtn.textContent = open ? '📋 Ver álbum' : '📋 Cerrar álbum'
    toggleBtn.setAttribute('aria-expanded', String(!open))
    header.setAttribute('aria-expanded', String(!open))
  }
  header.addEventListener('click', toggleAlbum)
  header.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAlbum(e) }
  })

  // Tabs
  section.querySelectorAll('.atab').forEach(btn => {
    btn.addEventListener('click', () => {
      section.querySelectorAll('.atab').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      _albumFilter = btn.dataset.filter
      _renderGroups(section)
    })
  })

  _renderGroups(section)
}

// ── Render interno de grupos ──────────────────────────
function _renderGroups(section) {
  const body = section.querySelector('#album-body')
  if (!body) return

  function stickerEl(name, key) {
    const st  = _albumProgress[key] || 'falta'
    const sub = _albumProgress[key + '::sub'] || null
    const state = sub === 'repetida' ? 'repetida' : sub === 'reserva' ? 'reserva' : st === 'tengo' ? 'tengo' : 'falta'
    if (_albumFilter !== 'all' && state !== _albumFilter) return ''
    const labels = { tengo:'TENGO', falta:'FALTA', repetida:'REPET.', reserva:'RESERV.' }
    return `<div class="sc s-${state}">
      <span class="sc-dot"></span>
      <span class="sc-name">${esc(name)}</span>
      <span class="sc-badge">${labels[state]}</span>
    </div>`
  }

  // Introducción
  const introHtml = INTRO_DATA.map((name, i) => stickerEl(name, 'INTRO::' + i)).filter(Boolean).join('')
  let html = introHtml ? `
    <div class="sgroup open">
      <div class="sgroup-header">
        <span class="sgroup-flag" style="color:#f5c518">🌍</span>
        <span class="sgroup-label">INTRODUCCIÓN PANINI</span>
        <span class="sgroup-chev">▲</span>
      </div>
      <div class="sgroup-body"><div class="sticker-grid">${introHtml}</div></div>
    </div>` : ''

  // Grupos A–L
  for (const [grp, teams] of Object.entries(GROUPS)) {
    const color = GROUP_COLORS[grp] || '#888'
    let grpBody = ''
    for (const teamName of teams) {
      const players = albumData[teamName] || []
      const teamHtml = players.map((name, i) => stickerEl(name, teamName + '::' + i)).filter(Boolean).join('')
      if (teamHtml) {
        const code = teamName.replace(/^[\p{Emoji}\s]+/u,'').trim().slice(0,3).toUpperCase()
        grpBody += `<div class="sgroup-team-label"><span class="sgroup-code">${code}</span> ${esc(teamName.replace(/^[\p{Emoji}\s]+/u,''))}</div>
          <div class="sticker-grid">${teamHtml}</div>`
      }
    }
    if (grpBody) html += `
      <div class="sgroup open">
        <div class="sgroup-header" style="--grp:${color}">
          <span class="sgroup-flag" style="background:${color};color:#fff;border-radius:4px;padding:0 5px;font-family:'Bebas Neue',sans-serif">${grp}</span>
          <span class="sgroup-label">Grupo ${grp}</span>
          <span class="sgroup-chev">▲</span>
        </div>
        <div class="sgroup-body">${grpBody}</div>
      </div>`
  }

  body.innerHTML = html || `<div class="album-empty">
    <div class="album-empty-icon">📭</div>
    <div class="album-empty-title">Sin resultados para este filtro</div>
  </div>`

  body.querySelectorAll('.sgroup-header').forEach(h => {
    h.addEventListener('click', () => h.parentElement.classList.toggle('open'))
  })
}
