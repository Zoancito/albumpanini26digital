// ═══════════════════════════════════════════════════
//  ÁLBUM MUNDIAL 2026 — intercambios.js
//  Matchmaking de cromos entre usuarios
// ═══════════════════════════════════════════════════
import { supabase } from './supabase.js'
import { createNotificacion, NOTIF_TYPES } from './notificaciones.js'

// ── Sincronizar ofertas del usuario actual ────────
// Llamar tras cada cambio de estado de cromos (debounced en script.js)
export async function syncExchangeOffers(userId, albumData, INTRO_DATA, getStickerState, getRepetidaCount, hasReserva) {
  if (!userId) return

  const repetidas = []   // cromos con repetida ≥ 1
  const buscadas  = []   // cromos en estado 'falta' SIN reserva

  // INTRO
  INTRO_DATA.forEach((name, i) => {
    const reps = getRepetidaCount('INTRO', i)
    const st   = getStickerState('INTRO', i)
    const res  = hasReserva('INTRO', i)
    if (reps > 0)                     repetidas.push({ country: 'INTRO', idx: i, name, count: reps })
    if (st === 'falta' && !res)       buscadas.push({ country: 'INTRO', idx: i, name })
  })

  // Selecciones
  Object.entries(albumData).forEach(([country, stickers]) => {
    stickers.forEach((name, i) => {
      const reps = getRepetidaCount(country, i)
      const st   = getStickerState(country, i)
      const res  = hasReserva(country, i)
      if (reps > 0)                   repetidas.push({ country, idx: i, name, count: reps })
      if (st === 'falta' && !res)     buscadas.push({ country, idx: i, name })
    })
  })

  try {
    await supabase.from('exchange_offers').upsert(
      { user_id: userId, repetidas, buscadas, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
  } catch (e) { console.warn('[intercambios] syncOffers error:', e) }
}

// ── Buscar matches para el usuario actual ─────────
export async function findMatches(userId) {
  if (!userId) return []

  try {
    // Obtener mi oferta
    const { data: myOffer } = await supabase
      .from('exchange_offers')
      .select('repetidas, buscadas')
      .eq('user_id', userId)
      .single()

    if (!myOffer) return []

    const myReps    = new Set(myOffer.repetidas.map(s => `${s.country}::${s.idx}`))
    const myWanted  = new Set(myOffer.buscadas.map(s => `${s.country}::${s.idx}`))

    // Obtener todas las demás ofertas (excluir la propia)
    const { data: others } = await supabase
      .from('exchange_offers')
      .select('user_id, repetidas, buscadas')
      .neq('user_id', userId)

    if (!others?.length) return []

    // Buscar coincidencias mutuas
    const matches = []
    for (const other of others) {
      const theirReps   = new Set(other.repetidas.map(s => `${s.country}::${s.idx}`))
      const theirWanted = new Set(other.buscadas.map(s => `${s.country}::${s.idx}`))

      // Yo tengo repetidas que él busca
      const iGiveHim = myOffer.repetidas.filter(s => theirWanted.has(`${s.country}::${s.idx}`))
      // Él tiene repetidas que yo busco
      const heGivesMe = other.repetidas.filter(s => myWanted.has(`${s.country}::${s.idx}`))

      if (iGiveHim.length > 0 && heGivesMe.length > 0) {
        matches.push({
          userId:      other.user_id,
          iGiveHim,
          heGivesMe,
          score: iGiveHim.length + heGivesMe.length,
        })
      }
    }

    // Ordenar por score (más intercambios posibles primero)
    return matches.sort((a, b) => b.score - a.score)
  } catch (e) { console.warn('[intercambios] findMatches error:', e); return [] }
}

// ── Notificar matches nuevos ──────────────────────
// Llama tras syncOffers para notificar si hay matches nuevos
export async function notifyNewMatches(userId, matches, profilesCache = {}) {
  if (!matches.length) return
  // Solo notificar si hay matches significativos (evitar spam)
  const top = matches.slice(0, 3)
  for (const m of top) {
    const otherName = profilesCache[m.userId]?.username || 'otro usuario'
    await createNotificacion(userId, NOTIF_TYPES.EXCHANGE_MATCH, {
      msg: `Intercambio posible con @${otherName}: tú das ${m.iGiveHim.length} y recibes ${m.heGivesMe.length} cromo(s)`,
      with_user: m.userId,
      i_give: m.iGiveHim.length,
      they_give: m.heGivesMe.length,
    })
  }
}

// ── Enviar solicitud de intercambio ──────────────
export async function sendExchangeRequest(fromUserId, toUserId, stickersOffered, stickersWanted, toUsername) {
  try {
    const { data: req } = await supabase
      .from('exchange_requests')
      .insert({
        from_user:        fromUserId,
        to_user:          toUserId,
        stickers_offered: stickersOffered,
        stickers_wanted:  stickersWanted,
        status:           'pending',
      })
      .select()
      .single()

    await createNotificacion(toUserId, NOTIF_TYPES.EXCHANGE_REQUEST, {
      msg:       `Solicitud de intercambio recibida`,
      from_user: fromUserId,
      action_id: req.id,
      offered:   stickersOffered.length,
      wanted:    stickersWanted.length,
    })
    return req
  } catch (e) { console.warn('[intercambios] sendRequest error:', e); return null }
}

// ── Aceptar / Rechazar solicitud ──────────────────
export async function respondExchangeRequest(requestId, accept, currentUserId) {
  const status = accept ? 'accepted' : 'rejected'
  try {
    const { data: req } = await supabase
      .from('exchange_requests')
      .update({ status })
      .eq('id', requestId)
      .select()
      .single()

    const type = accept ? NOTIF_TYPES.EXCHANGE_ACCEPTED : NOTIF_TYPES.EXCHANGE_REJECTED
    await createNotificacion(req.from_user, type, {
      msg: accept
        ? '¡Tu solicitud de intercambio fue aceptada! Coordina con tu amigo.'
        : 'Tu solicitud de intercambio fue rechazada.',
      request_id: requestId,
    })
    return req
  } catch (e) { console.warn('[intercambios] respond error:', e); return null }
}

// ── Abrir modal de intercambios ───────────────────
export async function openIntercambiosModal(currentUserId, profilesMap) {
  document.getElementById('intercambios-modal')?.remove()

  const modal = document.createElement('div')
  modal.id = 'intercambios-modal'
  modal.className = 'intercambios-backdrop'
  modal.setAttribute('role', 'dialog')
  modal.setAttribute('aria-modal', 'true')

  modal.innerHTML = `
    <div class="intercambios-box">
      <div class="intercambios-header">
        <div class="intercambios-title">🔄 Intercambios</div>
        <button class="intercambios-close" id="int-close" aria-label="Cerrar">✕</button>
      </div>
      <div class="intercambios-loading" id="int-body">
        <div class="int-spinner">Buscando intercambios posibles…</div>
      </div>
    </div>`

  function closeModal() {
    modal.classList.add('intercambios-hiding')
    setTimeout(() => modal.remove(), 350)
  }
  modal.addEventListener('click', e => { if (e.target === modal) closeModal() })
  modal.querySelector('#int-close').addEventListener('click', closeModal)
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', esc) }
  })
  document.body.appendChild(modal)
  requestAnimationFrame(() => modal.classList.add('intercambios-visible'))

  // Cargar matches
  const matches = await findMatches(currentUserId)
  const body = modal.querySelector('#int-body')

  // Cargar perfiles de usuarios con match
  const userIds = matches.map(m => m.userId)
  if (userIds.length) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', userIds)
    ;(profiles || []).forEach(p => { profilesMap[p.id] = p })
  }

  // Cargar solicitudes pendientes (enviadas a mí)
  const { data: pendingReqs } = await supabase
    .from('exchange_requests')
    .select('*, from_profile:profiles!from_user(username, full_name, avatar_url)')
    .eq('to_user', currentUserId)
    .eq('status', 'pending')

  if (!matches.length && !pendingReqs?.length) {
    body.innerHTML = `<div class="int-empty">
      <div class="int-empty-icon">🔄</div>
      <div>No hay intercambios posibles por ahora.</div>
      <small>Asegúrate de tener cromos marcados como <strong>repetidos</strong> y otros como <strong>falta</strong> (sin reserva).</small>
    </div>`
    return
  }

  let html = ''

  // Solicitudes pendientes recibidas
  if (pendingReqs?.length) {
    html += `<div class="int-section-label">📩 Solicitudes recibidas</div>`
    pendingReqs.forEach(req => {
      const p = req.from_profile || {}
      html += `
        <div class="int-request-card" data-req-id="${req.id}">
          <div class="int-req-avatar">${p.username?.[0]?.toUpperCase()||'?'}</div>
          <div class="int-req-body">
            <div class="int-req-user">@${p.username || '?'}</div>
            <div class="int-req-detail">
              Te da <strong>${req.stickers_offered?.length || 0}</strong> cromo(s) y pide <strong>${req.stickers_wanted?.length || 0}</strong>
            </div>
            <div class="int-req-stickers">
              ${(req.stickers_offered||[]).slice(0,3).map(s=>`<span class="int-chip">${s.name}</span>`).join('')}
              ${req.stickers_offered?.length > 3 ? `<span class="int-chip-more">+${req.stickers_offered.length-3}</span>` : ''}
            </div>
          </div>
          <div class="int-req-actions">
            <button class="int-btn-accept" data-req="${req.id}" type="button">✅ Aceptar</button>
            <button class="int-btn-reject" data-req="${req.id}" type="button">❌ Rechazar</button>
          </div>
        </div>`
    })
  }

  // Matches encontrados
  if (matches.length) {
    html += `<div class="int-section-label">✨ Intercambios posibles (${matches.length})</div>`
    matches.forEach(m => {
      const p = profilesMap[m.userId] || {}
      html += `
        <div class="int-match-card">
          <div class="int-match-top">
            <div class="int-match-user">
              <div class="int-req-avatar">${p.username?.[0]?.toUpperCase()||'?'}</div>
              <div>
                <div class="int-match-username">@${p.username || p.full_name || '?'}</div>
                <div class="int-match-score">${m.iGiveHim.length} das · ${m.heGivesMe.length} recibes</div>
              </div>
            </div>
            <button class="int-btn-request" data-user="${m.userId}" type="button">📩 Solicitar</button>
          </div>
          <div class="int-match-cols">
            <div class="int-match-col">
              <div class="int-col-label">Tú das</div>
              ${m.iGiveHim.slice(0,4).map(s=>`<span class="int-chip">${s.name}</span>`).join('')}
              ${m.iGiveHim.length > 4 ? `<span class="int-chip-more">+${m.iGiveHim.length-4}</span>` : ''}
            </div>
            <div class="int-match-col">
              <div class="int-col-label">Tú recibes</div>
              ${m.heGivesMe.slice(0,4).map(s=>`<span class="int-chip">${s.name}</span>`).join('')}
              ${m.heGivesMe.length > 4 ? `<span class="int-chip-more">+${m.heGivesMe.length-4}</span>` : ''}
            </div>
          </div>
        </div>`
    })
  }

  body.innerHTML = html

  // Bind: aceptar/rechazar solicitudes
  body.querySelectorAll('.int-btn-accept, .int-btn-reject').forEach(btn => {
    btn.addEventListener('click', async () => {
      const reqId = btn.dataset.req
      const accept = btn.classList.contains('int-btn-accept')
      btn.disabled = true
      btn.textContent = accept ? 'Aceptando…' : 'Rechazando…'
      await respondExchangeRequest(reqId, accept, currentUserId)
      // Quitar card
      btn.closest('.int-request-card')?.remove()
    })
  })

  // Bind: enviar solicitud de intercambio
  body.querySelectorAll('.int-btn-request').forEach(btn => {
    btn.addEventListener('click', async () => {
      const toUserId = btn.dataset.user
      const match = matches.find(m => m.userId === toUserId)
      if (!match) return
      btn.disabled = true; btn.textContent = 'Enviando…'
      await sendExchangeRequest(
        currentUserId, toUserId,
        match.iGiveHim, match.heGivesMe,
        profilesMap[toUserId]?.username || '?'
      )
      btn.textContent = '✅ Enviada'
    })
  })
}
