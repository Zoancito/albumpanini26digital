// ═══════════════════════════════════════════════════
//  ÁLBUM MUNDIAL 2026 — medals.js
//  Sistema de medallas desbloqueables
// ═══════════════════════════════════════════════════

// ── Definición de medallas por selección ──────────
export const COUNTRY_MEDALS = [
  { id:'country_mx', type:'country', name:'México',              flag:'🇲🇽', countryKey:'🇲🇽 México',                    desc:'Completaste todos los cromos de México' },
  { id:'country_za', type:'country', name:'Sudáfrica',           flag:'🇿🇦', countryKey:'🇿🇦 Sudáfrica',                 desc:'Completaste todos los cromos de Sudáfrica' },
  { id:'country_kr', type:'country', name:'Corea del Sur',       flag:'🇰🇷', countryKey:'🇰🇷 República de Corea',        desc:'Completaste todos los cromos de Corea del Sur' },
  { id:'country_cz', type:'country', name:'Rep. Checa',          flag:'🇨🇿', countryKey:'🇨🇿 República Checa',           desc:'Completaste todos los cromos de Rep. Checa' },
  { id:'country_ca', type:'country', name:'Canadá',              flag:'🇨🇦', countryKey:'🇨🇦 Canadá',                   desc:'Completaste todos los cromos de Canadá' },
  { id:'country_ba', type:'country', name:'Bosnia y Herz.',      flag:'🇧🇦', countryKey:'🇧🇦 Bosnia y Herzegovina',      desc:'Completaste todos los cromos de Bosnia y Herzegovina' },
  { id:'country_qa', type:'country', name:'Catar',               flag:'🇶🇦', countryKey:'🇶🇦 Catar',                    desc:'Completaste todos los cromos de Catar' },
  { id:'country_ch', type:'country', name:'Suiza',               flag:'🇨🇭', countryKey:'🇨🇭 Suiza',                    desc:'Completaste todos los cromos de Suiza' },
  { id:'country_br', type:'country', name:'Brasil',              flag:'🇧🇷', countryKey:'🇧🇷 Brasil',                   desc:'Completaste todos los cromos de Brasil' },
  { id:'country_ma', type:'country', name:'Marruecos',           flag:'🇲🇦', countryKey:'🇲🇦 Marruecos',                desc:'Completaste todos los cromos de Marruecos' },
  { id:'country_ht', type:'country', name:'Haití',               flag:'🇭🇹', countryKey:'🇭🇹 Haití',                    desc:'Completaste todos los cromos de Haití' },
  { id:'country_us', type:'country', name:'EE. UU.',             flag:'🇺🇸', countryKey:'🇺🇸 EE. UU.',                  desc:'Completaste todos los cromos de EE. UU.' },
  { id:'country_py', type:'country', name:'Paraguay',            flag:'🇵🇾', countryKey:'🇵🇾 Paraguay',                 desc:'Completaste todos los cromos de Paraguay' },
  { id:'country_au', type:'country', name:'Australia',           flag:'🇦🇺', countryKey:'🇦🇺 Australia',                desc:'Completaste todos los cromos de Australia' },
  { id:'country_tr', type:'country', name:'Turquía',             flag:'🇹🇷', countryKey:'🇹🇷 Turquía',                  desc:'Completaste todos los cromos de Turquía' },
  { id:'country_de', type:'country', name:'Alemania',            flag:'🇩🇪', countryKey:'🇩🇪 Alemania',                 desc:'Completaste todos los cromos de Alemania' },
  { id:'country_cw', type:'country', name:'Curaçao',             flag:'🇨🇼', countryKey:'🇨🇼 Curaçao',                  desc:'Completaste todos los cromos de Curaçao' },
  { id:'country_ci', type:'country', name:'Costa de Marfil',     flag:'🇨🇮', countryKey:'🇨🇮 Costa de Marfil',          desc:'Completaste todos los cromos de Costa de Marfil' },
  { id:'country_ec', type:'country', name:'Ecuador',             flag:'🇪🇨', countryKey:'🇪🇨 Ecuador',                  desc:'Completaste todos los cromos de Ecuador' },
  { id:'country_nl', type:'country', name:'Países Bajos',        flag:'🇳🇱', countryKey:'🇳🇱 Países Bajos',             desc:'Completaste todos los cromos de Países Bajos' },
  { id:'country_jp', type:'country', name:'Japón',               flag:'🇯🇵', countryKey:'🇯🇵 Japón',                    desc:'Completaste todos los cromos de Japón' },
  { id:'country_se', type:'country', name:'Suecia',              flag:'🇸🇪', countryKey:'🇸🇪 Suecia',                   desc:'Completaste todos los cromos de Suecia' },
  { id:'country_tn', type:'country', name:'Túnez',               flag:'🇹🇳', countryKey:'🇹🇳 Túnez',                    desc:'Completaste todos los cromos de Túnez' },
  { id:'country_be', type:'country', name:'Bélgica',             flag:'🇧🇪', countryKey:'🇧🇪 Bélgica',                  desc:'Completaste todos los cromos de Bélgica' },
  { id:'country_eg', type:'country', name:'Egipto',              flag:'🇪🇬', countryKey:'🇪🇬 Egipto',                   desc:'Completaste todos los cromos de Egipto' },
  { id:'country_ir', type:'country', name:'RI de Irán',          flag:'🇮🇷', countryKey:'🇮🇷 RI de Irán',               desc:'Completaste todos los cromos de RI de Irán' },
  { id:'country_nz', type:'country', name:'Nueva Zelanda',       flag:'🇳🇿', countryKey:'🇳🇿 Nueva Zelanda',            desc:'Completaste todos los cromos de Nueva Zelanda' },
  { id:'country_es', type:'country', name:'España',              flag:'🇪🇸', countryKey:'🇪🇸 España',                   desc:'Completaste todos los cromos de España' },
  { id:'country_cv', type:'country', name:'Cabo Verde',          flag:'🇨🇻', countryKey:'🇨🇻 Cabo Verde',               desc:'Completaste todos los cromos de Cabo Verde' },
  { id:'country_sa', type:'country', name:'Arabia Saudí',        flag:'🇸🇦', countryKey:'🇸🇦 Arabia Saudí',             desc:'Completaste todos los cromos de Arabia Saudí' },
  { id:'country_uy', type:'country', name:'Uruguay',             flag:'🇺🇾', countryKey:'🇺🇾 Uruguay',                  desc:'Completaste todos los cromos de Uruguay' },
  { id:'country_fr', type:'country', name:'Francia',             flag:'🇫🇷', countryKey:'🇫🇷 Francia',                  desc:'Completaste todos los cromos de Francia' },
  { id:'country_sn', type:'country', name:'Senegal',             flag:'🇸🇳', countryKey:'🇸🇳 Senegal',                  desc:'Completaste todos los cromos de Senegal' },
  { id:'country_iq', type:'country', name:'Irak',                flag:'🇮🇶', countryKey:'🇮🇶 Irak',                     desc:'Completaste todos los cromos de Irak' },
  { id:'country_no', type:'country', name:'Noruega',             flag:'🇳🇴', countryKey:'🇳🇴 Noruega',                  desc:'Completaste todos los cromos de Noruega' },
  { id:'country_ar', type:'country', name:'Argentina',           flag:'🇦🇷', countryKey:'🇦🇷 Argentina',                desc:'Completaste todos los cromos de Argentina' },
  { id:'country_dz', type:'country', name:'Argelia',             flag:'🇩🇿', countryKey:'🇩🇿 Argelia',                  desc:'Completaste todos los cromos de Argelia' },
  { id:'country_at', type:'country', name:'Austria',             flag:'🇦🇹', countryKey:'🇦🇹 Austria',                  desc:'Completaste todos los cromos de Austria' },
  { id:'country_jo', type:'country', name:'Jordania',            flag:'🇯🇴', countryKey:'🇯🇴 Jordania',                 desc:'Completaste todos los cromos de Jordania' },
  { id:'country_pt', type:'country', name:'Portugal',            flag:'🇵🇹', countryKey:'🇵🇹 Portugal',                 desc:'Completaste todos los cromos de Portugal' },
  { id:'country_cd', type:'country', name:'Rep. D. del Congo',   flag:'🇨🇩', countryKey:'🇨🇩 República Democrática del Congo', desc:'Completaste todos los cromos de Rep. D. del Congo' },
  { id:'country_uz', type:'country', name:'Uzbekistán',          flag:'🇺🇿', countryKey:'🇺🇿 Uzbekistán',               desc:'Completaste todos los cromos de Uzbekistán' },
  { id:'country_co', type:'country', name:'Colombia',            flag:'🇨🇴', countryKey:'🇨🇴 Colombia',                 desc:'Completaste todos los cromos de Colombia' },
  { id:'country_hr', type:'country', name:'Croacia',             flag:'🇭🇷', countryKey:'🇭🇷 Croacia',                  desc:'Completaste todos los cromos de Croacia' },
  { id:'country_gh', type:'country', name:'Ghana',               flag:'🇬🇭', countryKey:'🇬🇭 Ghana',                    desc:'Completaste todos los cromos de Ghana' },
  { id:'country_pa', type:'country', name:'Panamá',              flag:'🇵🇦', countryKey:'🇵🇦 Panamá',                   desc:'Completaste todos los cromos de Panamá' },
]

// ── Medallas especiales ───────────────────────────
export const SPECIAL_MEDALS = [
  {
    id: 'album_complete',
    type: 'special',
    name: 'Álbum Completo',
    flag: '🏆',
    desc: 'Completaste los 585 cromos del álbum',
    color: '#f5c518',
    glow: 'rgba(245,197,24,.5)',
    special: true,
  },
  {
    id: 'music_note',
    type: 'special',
    name: 'Fanático Musical',
    flag: '🎵',
    desc: 'Seguiste la playlist oficial del Mundial',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,.4)',
    special: true,
  },
]

// ── Todas las medallas ────────────────────────────
export const ALL_MEDALS = [...SPECIAL_MEDALS, ...COUNTRY_MEDALS]

// ── Lookup por ID ─────────────────────────────────
const _byId = Object.fromEntries(ALL_MEDALS.map(m => [m.id, m]))
export function getMedalDef(id) { return _byId[id] || null }

// ── Verificar qué medallas de país están ganadas ──
/**
 * Pasa getCountryStats y albumData del scope de script.js.
 * Devuelve array de IDs ganados.
 */
export function checkCountryMedals(getCountryStats, albumData) {
  const earned = []
  for (const m of COUNTRY_MEDALS) {
    const stats = getCountryStats(m.countryKey)
    if (stats && stats.total > 0 && stats.owned >= stats.total) {
      earned.push(m.id)
    }
  }
  return earned
}

// ── Verificar medalla álbum completo ─────────────
export function checkAlbumComplete(totalOwned, totalStickers) {
  return totalStickers > 0 && totalOwned >= totalStickers
}

// ── Renderizar medallero ──────────────────────────
/**
 * earnedIds: string[] de medal IDs ganados
 * showLocked: mostrar medallas bloqueadas o no
 */
export function renderMedallero(container, earnedIds, showLocked = true) {
  if (!container) return
  const earnedSet = new Set(earnedIds)
  const earned    = ALL_MEDALS.filter(m => earnedSet.has(m.id))
  const locked    = showLocked ? ALL_MEDALS.filter(m => !earnedSet.has(m.id)) : []

  container.innerHTML = ''

  if (earned.length === 0 && !showLocked) {
    container.innerHTML = '<p class="medallero-empty">Aún no tienes medallas. ¡Completa selecciones para ganarlas!</p>'
    return
  }

  // Medallas ganadas
  if (earned.length > 0) {
    const section = document.createElement('div')
    section.className = 'medallero-group'
    section.innerHTML = `<div class="medallero-group-label">🏅 Desbloqueadas <span class="medallero-count">${earned.length}</span></div>`
    const grid = document.createElement('div')
    grid.className = 'medallero-grid'
    earned.forEach(m => grid.appendChild(_buildMedalEl(m, true)))
    section.appendChild(grid)
    container.appendChild(section)
  }

  // Medallas bloqueadas
  if (showLocked && locked.length > 0) {
    const section = document.createElement('div')
    section.className = 'medallero-group medallero-locked-group'
    section.innerHTML = `
      <button class="medallero-toggle" aria-expanded="false">
        🔒 Bloqueadas <span class="medallero-count">${locked.length}</span>
        <span class="medallero-toggle-arrow">▼</span>
      </button>`
    const grid = document.createElement('div')
    grid.className = 'medallero-grid medallero-grid-locked'
    grid.style.display = 'none'
    locked.forEach(m => grid.appendChild(_buildMedalEl(m, false)))
    section.appendChild(grid)
    // Toggle
    section.querySelector('.medallero-toggle').addEventListener('click', function() {
      const open = grid.style.display !== 'none'
      grid.style.display = open ? 'none' : 'grid'
      this.setAttribute('aria-expanded', !open)
      this.querySelector('.medallero-toggle-arrow').textContent = open ? '▼' : '▲'
    })
    container.appendChild(section)
  }
}

function _buildMedalEl(m, unlocked) {
  const div = document.createElement('div')
  div.className = 'medal' + (unlocked ? ' medal-unlocked' : ' medal-locked')
  div.title = unlocked ? m.desc : `🔒 ${m.desc}`
  if (m.special) div.classList.add('medal-special')

  const style = unlocked && m.color
    ? `--medal-color:${m.color};--medal-glow:${m.glow||'transparent'};`
    : ''

  div.innerHTML = `
    <div class="medal-circle" style="${style}">
      <span class="medal-flag">${m.flag}</span>
      ${!unlocked ? '<span class="medal-lock">🔒</span>' : ''}
      ${unlocked && m.special ? '<span class="medal-shine"></span>' : ''}
    </div>
    <div class="medal-name">${m.name}</div>`

  // Tooltip al hover
  div.addEventListener('mouseenter', () => _showMedalTooltip(div, m, unlocked))
  div.addEventListener('mouseleave', _hideMedalTooltip)
  return div
}

// ── Tooltip de medalla ─────────────────────────────
let _tooltip = null
function _showMedalTooltip(el, m, unlocked) {
  _hideMedalTooltip()
  _tooltip = document.createElement('div')
  _tooltip.className = 'medal-tooltip'
  _tooltip.innerHTML = `
    <strong>${unlocked ? m.flag + ' ' + m.name : '🔒 ' + m.name}</strong>
    <span>${m.desc}</span>
    ${!unlocked ? '<em>Aún bloqueada</em>' : '<em>¡Desbloqueada!</em>'}`
  document.body.appendChild(_tooltip)
  const r = el.getBoundingClientRect()
  _tooltip.style.left = Math.min(r.left + r.width/2 - _tooltip.offsetWidth/2, window.innerWidth - _tooltip.offsetWidth - 8) + 'px'
  _tooltip.style.top  = (r.top - _tooltip.offsetHeight - 8 + window.scrollY) + 'px'
}
function _hideMedalTooltip() {
  _tooltip?.remove()
  _tooltip = null
}

// ── Mostrar notificación de medalla nueva ──────────
export function showMedalUnlockToast(medalId) {
  const m = getMedalDef(medalId)
  if (!m) return
  const toast = document.createElement('div')
  toast.className = 'medal-toast'
  toast.innerHTML = `
    <div class="medal-toast-icon">${m.flag}</div>
    <div class="medal-toast-body">
      <div class="medal-toast-title">🏅 ¡Nueva medalla!</div>
      <div class="medal-toast-name">${m.name}</div>
    </div>`
  document.body.appendChild(toast)
  requestAnimationFrame(() => toast.classList.add('medal-toast-in'))
  setTimeout(() => {
    toast.classList.remove('medal-toast-in')
    setTimeout(() => toast.remove(), 400)
  }, 3500)
}
