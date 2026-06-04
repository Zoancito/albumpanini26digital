// ═══════════════════════════════════════════════════
//  ÁLBUM MUNDIAL 2026 — once-ideal.js
//  Armador del 11 ideal por grupo
// ═══════════════════════════════════════════════════
import { supabase } from './supabase.js'
import { GROUP_PLAYERS } from './trivia.js'

// Posiciones y slots por formación
const FORMATIONS = {
  '4-3-3': ['POR','DEF','DEF','DEF','DEF','MED','MED','MED','EXT','EXT','DEL'],
  '4-4-2': ['POR','DEF','DEF','DEF','DEF','MED','MED','MED','MED','DEL','DEL'],
  '3-5-2': ['POR','DEF','DEF','DEF','MED','MED','MED','MED','MED','DEL','DEL'],
  '4-2-3-1':['POR','DEF','DEF','DEF','DEF','MED','MED','EXT','EXT','MED','DEL'],
  '5-3-2': ['POR','DEF','DEF','DEF','DEF','DEF','MED','MED','MED','DEL','DEL'],
}

const SLOT_LABELS = {
  POR:'Portero', DEF:'Defensa', LAT:'Lateral', MED:'Centrocampista',
  EXT:'Extremo', DEL:'Delantero',
}

// ── Obtener o crear el 11 del usuario en Supabase ─
async function loadUserOnce(userId, grp) {
  if (!userId) return null
  const { data } = await supabase
    .from('once_ideal_votes')
    .select('players, formation')
    .eq('user_id', userId)
    .eq('grupo', grp)
    .maybeSingle()
  return data || null
}

async function saveUserOnce(userId, grp, players, formation) {
  if (!userId) return
  await supabase.from('once_ideal_votes').upsert({
    user_id: userId,
    grupo: grp,
    players,
    formation,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,grupo' })
}

// ── Obtener el 11 más elegido por la comunidad ────
async function loadCommunityOnce(grp) {
  const { data } = await supabase
    .from('once_ideal_votes')
    .select('players')
    .eq('grupo', grp)
  if (!data || data.length === 0) return {}
  // Contar votos por jugador
  const votes = {}
  data.forEach(row => {
    ;(row.players || []).forEach(p => {
      votes[p] = (votes[p] || 0) + 1
    })
  })
  return votes
}

// ── Abrir modal del 11 ideal ──────────────────────
export async function openOnceIdealModal(grp, gColor, countries, userId = null) {
  document.getElementById('once-modal')?.remove()

  const allPlayers = Object.values(GROUP_PLAYERS[grp] || {}).flat()
  const countryMap = {}
  Object.entries(GROUP_PLAYERS[grp] || {}).forEach(([country, players]) => {
    players.forEach(p => { countryMap[p] = country })
  })

  let formation  = '4-3-3'
  let selected   = []   // array de player strings en slots
  let communityVotes = {}
  let savedData  = null

  // Cargar datos
  ;[savedData, communityVotes] = await Promise.all([
    loadUserOnce(userId, grp),
    loadCommunityOnce(grp),
  ])

  if (savedData) {
    formation = savedData.formation || '4-3-3'
    selected  = savedData.players   || []
  }

  const modal = document.createElement('div')
  modal.id = 'once-modal'
  modal.className = 'once-modal-backdrop'

  function render() {
    const slots    = FORMATIONS[formation]
    const usedSet  = new Set(selected.filter(Boolean))
    const totalVotes = Object.values(communityVotes).reduce((a,b)=>a+b,0) || 1

    modal.innerHTML = `
      <div class="once-box" style="--once-color:${gColor}">
        <div class="once-header">
          <div class="once-eyebrow">👕 11 IDEAL · GRUPO ${grp}</div>
          <button class="once-close" id="once-close" aria-label="Cerrar">✕</button>
        </div>

        <div class="once-formation-wrap">
          <label class="once-label">Formación:</label>
          <div class="once-formation-btns">
            ${Object.keys(FORMATIONS).map(f =>
              `<button class="once-f-btn${f===formation?' active':''}" data-f="${f}">${f}</button>`
            ).join('')}
          </div>
        </div>

        <div class="once-pitch">
          ${slots.map((pos,i) => {
            const player = selected[i]
            const country = player ? countryMap[player] : null
            return `
              <div class="once-slot${player?' filled':''}" data-slot="${i}" data-pos="${pos}">
                <div class="once-slot-pos" style="background:${gColor}">${pos}</div>
                ${player
                  ? `<div class="once-slot-player">${player.split('(')[0].trim()}</div>
                     <div class="once-slot-country">${country?.split(' ').slice(1).join(' ')||''}</div>
                     <button class="once-slot-remove" data-slot="${i}" aria-label="Quitar">×</button>`
                  : `<div class="once-slot-empty">+ ${SLOT_LABELS[pos]||pos}</div>`
                }
              </div>`
          }).join('')}
        </div>

        <div class="once-players-panel">
          <div class="once-panel-label">Jugadores disponibles <span class="once-selected-count">${selected.filter(Boolean).length}/11</span></div>
          <div class="once-players-list">
            ${allPlayers.map(p => {
              const used = usedSet.has(p)
              const votes = communityVotes[p] || 0
              const votePct = Math.round((votes/totalVotes)*100)
              return `
                <button class="once-player-btn${used?' used':''}" data-player="${p}" ${used?'disabled':''}>
                  <span class="once-player-name">${p.split('(')[0].trim()}</span>
                  <span class="once-player-pos">${p.match(/\(([^)]+)\)/)?.[1]||''}</span>
                  ${votes>0?`<span class="once-player-votes" title="${votes} votos comunitarios">${votePct}%</span>`:''}
                </button>`
            }).join('')}
          </div>
        </div>

        <div class="once-actions">
          ${userId
            ? `<button class="once-save-btn" id="once-save" ${selected.filter(Boolean).length<11?'disabled':''}>
                 💾 ${selected.filter(Boolean).length<11?`Faltan ${11-selected.filter(Boolean).length}`:'Guardar mi 11'}
               </button>`
            : `<p class="once-login-hint">Inicia sesión para guardar tu 11 ideal</p>`
          }
        </div>
      </div>`

    // Formation change
    modal.querySelectorAll('.once-f-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        formation = btn.dataset.f
        selected  = []   // reset al cambiar formación
        render()
      })
    })

    // Slot click → abrir selector de jugador
    modal.querySelectorAll('.once-slot:not(.filled)').forEach(slot => {
      slot.addEventListener('click', () => {
        const slotIdx = parseInt(slot.dataset.slot)
        const pos     = slot.dataset.pos
        openPlayerPicker(slotIdx, pos)
      })
    })

    // Quitar jugador del slot
    modal.querySelectorAll('.once-slot-remove').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation()
        const slotIdx = parseInt(btn.dataset.slot)
        selected[slotIdx] = null
        render()
      })
    })

    // Click en jugador disponible → poner en primer slot libre
    modal.querySelectorAll('.once-player-btn:not(:disabled)').forEach(btn => {
      btn.addEventListener('click', () => {
        const firstEmpty = slots.findIndex((_,i) => !selected[i])
        if (firstEmpty === -1) return
        selected[firstEmpty] = btn.dataset.player
        render()
      })
    })

    // Guardar
    document.getElementById('once-save')?.addEventListener('click', async () => {
      const saveBtn = document.getElementById('once-save')
      saveBtn.textContent = 'Guardando...'
      saveBtn.disabled = true
      await saveUserOnce(userId, grp, selected.filter(Boolean), formation)
      saveBtn.textContent = '✅ ¡Guardado!'
      setTimeout(() => render(), 1200)
    })

    document.getElementById('once-close')?.addEventListener('click', closeModal)
  }

  function openPlayerPicker(slotIdx, pos) {
    const usedSet = new Set(selected.filter(Boolean))
    const available = allPlayers.filter(p => !usedSet.has(p))
    // Ordenar: mismo pos primero
    const sorted = [...available.filter(p => p.includes(`(${pos})`)),
                    ...available.filter(p => !p.includes(`(${pos})`))]

    const picker = document.createElement('div')
    picker.className = 'once-picker'
    picker.innerHTML = `
      <div class="once-picker-title">Seleccionar ${SLOT_LABELS[pos]||pos}</div>
      ${sorted.map(p => `
        <button class="once-pick-btn" data-player="${p}">
          ${p.split('(')[0].trim()}
          <span class="once-pick-pos">${p.match(/\(([^)]+)\)/)?.[1]||''}</span>
          <span class="once-pick-country">${countryMap[p]?.split(' ').slice(1).join(' ')||''}</span>
        </button>`).join('')}
      <button class="once-picker-cancel">Cancelar</button>`

    picker.querySelectorAll('.once-pick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selected[slotIdx] = btn.dataset.player
        picker.remove()
        render()
      })
    })
    picker.querySelector('.once-picker-cancel').addEventListener('click', () => picker.remove())
    modal.querySelector('.once-box').appendChild(picker)
  }

  function closeModal() {
    modal.classList.add('once-hiding')
    setTimeout(() => modal.remove(), 350)
  }

  modal.addEventListener('click', e => { if (e.target === modal) closeModal() })
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', esc) }
  })

  document.body.appendChild(modal)
  requestAnimationFrame(() => modal.classList.add('once-visible'))
  render()
}
