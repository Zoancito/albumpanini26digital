// ═══════════════════════════════════════════════════
//  ÁLBUM MUNDIAL 2026 — creadores.js
//  Sistema de creadores validados por la comunidad
// ═══════════════════════════════════════════════════
import { supabase } from './supabase.js'

// ── Categorías disponibles para creadores ─────────
export const CREATOR_CATEGORIES = [
  { id: 'album',       label: 'Coleccionismo',     icon: '📘', color: '#f5c518' },
  { id: 'mundial',     label: 'Mundial 2026',       icon: '🌍', color: '#34d399' },
  { id: 'fichajes',    label: 'Mercado de Fichajes',icon: '💸', color: '#60a5fa' },
  { id: 'tactica',     label: 'Análisis táctico',   icon: '🧠', color: '#a78bfa' },
  { id: 'humor',       label: 'Humor futbolero',    icon: '😂', color: '#fb923c' },
  { id: 'noticias',    label: 'Noticias',           icon: '📰', color: '#94a3b8' },
  { id: 'equipo',      label: 'Mi equipo',          icon: '🏟️', color: '#f472b6' },
  { id: 'femenino',    label: 'Fútbol femenino',    icon: '⚽', color: '#e879f9' },
]

const CAT_MAP = Object.fromEntries(CREATOR_CATEGORIES.map(c => [c.id, c]))
export const getCatDef = id => CAT_MAP[id] || { id, label: id, icon: '⚽', color: 'var(--gold)' }

// ── Obtener perfil de creador ─────────────────────
export async function getCreatorProfile(userId) {
  try {
    const { data } = await supabase
      .from('creator_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    return data || null
  } catch (e) { return null }
}

// ── Activar modo creador ──────────────────────────
export async function activateCreator(userId, proposedCategories) {
  if (!userId || !proposedCategories.length) return null
  const { data, error } = await supabase
    .from('creator_profiles')
    .upsert({
      user_id: userId,
      proposed_categories: proposedCategories.slice(0, 5),
      is_active: true,
      activated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select().single()
  if (error) throw error
  return data
}

// ── Desactivar modo creador ───────────────────────
export async function deactivateCreator(userId) {
  await supabase
    .from('creator_profiles')
    .update({ is_active: false })
    .eq('user_id', userId)
}

// ── Votar por categoría de un creador ────────────
export async function voteCreatorCategory(creatorId, voterId, category) {
  const { error } = await supabase
    .from('creator_category_votes')
    .upsert({ creator_id: creatorId, voter_id: voterId, category },
      { onConflict: 'creator_id,voter_id,category' })
  if (error) throw error
  await recalcValidatedCategories(creatorId)
}

// ── Quitar voto ───────────────────────────────────
export async function unvoteCreatorCategory(creatorId, voterId, category) {
  await supabase
    .from('creator_category_votes')
    .delete()
    .eq('creator_id', creatorId)
    .eq('voter_id', voterId)
    .eq('category', category)
  await recalcValidatedCategories(creatorId)
}

// ── Recalcular categorías validadas ───────────────
// Una categoría se valida cuando ≥3 votos distintos (o propuesta con ≥1 voto si < 10 apoyos)
async function recalcValidatedCategories(creatorId) {
  try {
    const [{ data: votes }, { data: profile }] = await Promise.all([
      supabase.from('creator_category_votes')
        .select('category').eq('creator_id', creatorId),
      supabase.from('profiles')
        .select('apoyo_count').eq('id', creatorId).single(),
    ])

    const threshold = (profile?.apoyo_count || 0) < 50 ? 1 : 3
    const counts = {}
    ;(votes || []).forEach(v => { counts[v.category] = (counts[v.category] || 0) + 1 })
    const validated = Object.entries(counts)
      .filter(([, n]) => n >= threshold)
      .map(([cat]) => cat)

    await supabase.from('creator_profiles')
      .update({ validated_categories: validated })
      .eq('user_id', creatorId)
    return validated
  } catch (e) { console.warn('[creadores] recalc error:', e); return [] }
}

// ── Obtener votos de un creador (para UI) ─────────
export async function getCreatorVotes(creatorId, myUserId = null) {
  try {
    const { data } = await supabase
      .from('creator_category_votes')
      .select('category, voter_id')
      .eq('creator_id', creatorId)

    const counts = {}; const myVotes = new Set()
    ;(data || []).forEach(v => {
      counts[v.category] = (counts[v.category] || 0) + 1
      if (v.voter_id === myUserId) myVotes.add(v.category)
    })
    return { counts, myVotes }
  } catch (e) { return { counts: {}, myVotes: new Set() } }
}

// ── Feed Talentos Ocultos (<1000 apoyos) ──────────
export async function loadTalentosOcultos(limit = 20) {
  try {
    const { data: creators } = await supabase
      .from('creator_profiles')
      .select('user_id, validated_categories, proposed_categories')
      .eq('is_active', true)
      .limit(100)

    if (!creators?.length) return []

    const ids = creators.map(c => c.user_id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, apoyo_count')
      .in('id', ids)
      .lt('apoyo_count', 1000)

    if (!profiles?.length) return []

    // Calcular calidad: reacciones / posts (promedio por post)
    const statsResults = await Promise.all(profiles.map(p => getCreatorStats(p.id)))

    const crMap = Object.fromEntries(creators.map(c => [c.user_id, c]))
    const enriched = profiles.map((p, i) => ({
      ...p,
      ...crMap[p.id],
      _stats: statsResults[i],
      _calidad: (statsResults[i]?.totalPosts > 0)
        ? statsResults[i].totalApoyos / statsResults[i].totalPosts
        : 0,
    }))

    // Ordenar: con posts primero, luego por calidad desc
    enriched.sort((a, b) => {
      const aP = a._stats?.totalPosts || 0
      const bP = b._stats?.totalPosts || 0
      if (aP > 0 && bP === 0) return -1
      if (aP === 0 && bP > 0) return 1
      return b._calidad - a._calidad
    })

    return enriched.slice(0, limit)
  } catch (e) { console.warn('[creadores] talentos error:', e); return [] }
}

// ── Estadísticas del creador ──────────────────────
export async function getCreatorStats(userId) {
  try {
    const [postsRes, reactionsRes] = await Promise.all([
      supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('post_reactions')
        .select('post_id, posts!inner(user_id)')
        .eq('posts.user_id', userId),
    ])
    const totalPosts   = postsRes.count || 0
    const totalApoyos  = reactionsRes.data?.length || 0
    return {
      totalPosts,
      totalApoyos,
      avgApoyosPerPost: totalPosts ? (totalApoyos / totalPosts).toFixed(1) : 0,
    }
  } catch (e) { return { totalPosts: 0, totalApoyos: 0, avgApoyosPerPost: 0 } }
}

// ── Serie de actividad (posts + reacciones por semana) ─
export async function getActivityTimeSeries(userId, weeks = 10) {
  const now   = new Date()
  const start = new Date(now)
  start.setDate(start.getDate() - weeks * 7)

  const [{ data: posts }, { data: reactions }] = await Promise.all([
    supabase.from('posts').select('created_at')
      .eq('user_id', userId).gte('created_at', start.toISOString()),
    supabase.from('post_reactions')
      .select('created_at, posts!inner(user_id)')
      .eq('posts.user_id', userId).gte('created_at', start.toISOString()),
  ])

  const buckets = []
  for (let i = weeks - 1; i >= 0; i--) {
    const bucketEnd   = new Date(now); bucketEnd.setDate(bucketEnd.getDate() - i * 7)
    const bucketStart = new Date(bucketEnd); bucketStart.setDate(bucketStart.getDate() - 7)
    buckets.push({ start: bucketStart, end: bucketEnd, posts: 0, reactions: 0 })
  }
  function findBucket(dateStr) {
    const d = new Date(dateStr)
    return buckets.find(b => d >= b.start && d < b.end)
  }
  ;(posts || []).forEach(p => { const b = findBucket(p.created_at); if (b) b.posts++ })
  ;(reactions || []).forEach(r => { const b = findBucket(r.created_at); if (b) b.reactions++ })

  return buckets
}

// ── Gráfica SVG de actividad ──────────────────────────
export function renderActivityChart(container, buckets) {
  if (!container) return
  const totalPosts = buckets.reduce((s,b) => s + b.posts, 0)
  const totalReact = buckets.reduce((s,b) => s + b.reactions, 0)
  const n = buckets.length

  if (totalPosts === 0 && totalReact === 0) {
    container.innerHTML = `
      <div class="creator-activity-section">
        <div class="creator-activity-header"><span class="creator-activity-title">📊 Actividad reciente</span></div>
        <div class="creator-activity-empty">Aún no hay actividad registrada en las últimas ${n} semanas.</div>
      </div>`
    return
  }

  const maxPosts = Math.max(1, ...buckets.map(b => b.posts))
  const maxReact = Math.max(1, ...buckets.map(b => b.reactions))
  const W = 600, H = 160, padBottom = 22, padTop = 10
  const gap  = W / n
  const barW = gap * 0.5

  const barsHtml = buckets.map((b, i) => {
    const x = i * gap + (gap - barW) / 2
    const barH = (b.posts / maxPosts) * (H - padTop - padBottom)
    const y = H - padBottom - barH
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(barH,0).toFixed(1)}"
      rx="3" fill="var(--gold)" opacity="0.85"><title>${b.posts} post${b.posts!==1?'s':''}</title></rect>`
  }).join('')

  const linePoints = buckets.map((b, i) => {
    const x = i * gap + gap / 2
    const y = H - padBottom - (b.reactions / maxReact) * (H - padTop - padBottom)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  const dotsHtml = buckets.map((b, i) => {
    const x = i * gap + gap / 2
    const y = H - padBottom - (b.reactions / maxReact) * (H - padTop - padBottom)
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="#818cf8"><title>${b.reactions} reacción${b.reactions!==1?'es':''}</title></circle>`
  }).join('')

  const labelEvery = Math.max(1, Math.ceil(n / 5))
  const labelsHtml = buckets.map((b, i) => {
    if (i % labelEvery !== 0 && i !== n - 1) return ''
    const x = i * gap + gap / 2
    const label = b.start.toLocaleDateString('es-CL', { day:'numeric', month:'short' })
    return `<text x="${x.toFixed(1)}" y="${H - 4}" font-size="9" fill="var(--dim)" text-anchor="middle" font-family="Barlow Condensed, sans-serif">${label}</text>`
  }).join('')

  container.innerHTML = `
    <div class="creator-activity-section">
      <div class="creator-activity-header">
        <span class="creator-activity-title">📊 Actividad reciente</span>
        <div class="creator-activity-legend">
          <span class="creator-activity-legend-item"><span class="creator-activity-dot" style="background:var(--gold)"></span> Posts</span>
          <span class="creator-activity-legend-item"><span class="creator-activity-dot" style="background:#818cf8"></span> Reacciones</span>
        </div>
      </div>
      <svg class="creator-activity-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
        ${barsHtml}
        <polyline points="${linePoints}" fill="none" stroke="#818cf8" stroke-width="2"/>
        ${dotsHtml}
        ${labelsHtml}
      </svg>
      <div class="creator-activity-stats">
        <div class="creator-activity-stat">
          <span class="creator-activity-stat-val">${totalPosts}</span>
          <span class="creator-activity-stat-label">Posts (${n}sem)</span>
        </div>
        <div class="creator-activity-stat">
          <span class="creator-activity-stat-val">${totalReact}</span>
          <span class="creator-activity-stat-label">Reacciones</span>
        </div>
        <div class="creator-activity-stat">
          <span class="creator-activity-stat-val">${totalPosts ? (totalReact/totalPosts).toFixed(1) : '0'}</span>
          <span class="creator-activity-stat-label">Reac./Post</span>
        </div>
      </div>
    </div>`
}

// ── Renderizar sección de creador en perfil público ─
export async function renderCreatorSection(container, profileId, currentUserId) {
  if (!container) return
  const [creator, { counts, myVotes }, profile] = await Promise.all([
    getCreatorProfile(profileId),
    getCreatorVotes(profileId, currentUserId),
    supabase.from('profiles').select('apoyo_count').eq('id', profileId).maybeSingle()
      .then(r => r.data),
  ])

  if (!creator?.is_active) {
    container.innerHTML = ''; container.style.display = 'none'; return
  }

  container.style.display = ''
  const isOwn = profileId === currentUserId

  const cats = creator.proposed_categories || []
  const validated = new Set(creator.validated_categories || [])

  container.innerHTML = `
    <div class="creator-section">
      <div class="creator-badge-row">
        <span class="creator-badge">🎙️ CREADOR</span>
        ${validated.size > 0
          ? `<span class="creator-validated-hint">✅ ${validated.size} categoría${validated.size > 1?'s':''} validada${validated.size > 1?'s':''} por la comunidad</span>`
          : `<span class="creator-validated-hint pending">⏳ Pendiente de validación</span>`}
      </div>

      <div class="creator-cats-label">
        ${isOwn ? 'Tus categorías propuestas' : 'Vota las categorías que mejor lo describen'}
      </div>
      <div class="creator-cats-list">
        ${cats.map(catId => {
          const cat    = getCatDef(catId)
          const count  = counts[catId] || 0
          const voted  = myVotes.has(catId)
          const isVal  = validated.has(catId)
          return `
            <div class="creator-cat-item${isVal?' validated':''}">
              <span class="creator-cat-icon">${cat.icon}</span>
              <span class="creator-cat-name">${cat.label}</span>
              ${isVal ? '<span class="creator-cat-check">✅</span>' : ''}
              <span class="creator-cat-votes">${count} voto${count !== 1?'s':''}</span>
              ${!isOwn && currentUserId ? `
                <button class="creator-vote-btn${voted?' voted':''}"
                  data-creator="${profileId}" data-cat="${catId}" data-voted="${voted}">
                  ${voted ? '👍 Votado' : '👍 Votar'}
                </button>` : ''}
            </div>`
        }).join('')}
      </div>
      ${isOwn ? `
        <button class="creator-manage-btn" id="creator-manage-btn">
          ⚙️ Gestionar categorías
        </button>` : ''}
    </div>
    <div id="activity-chart-slot"></div>
    <div id="early-sup-slot"></div>`

  // Gráfica de actividad — solo visible en tu propio perfil de creador
  if (isOwn) {
    const chartSlot = container.querySelector('#activity-chart-slot')
    if (chartSlot) {
      const series = await getActivityTimeSeries(profileId, 10)
      renderActivityChart(chartSlot, series)
    }
  }

  // Cargar primeros 10 Ojeadores si el creador ya cruzó 1.000
  const apoyo_count = profile?.apoyo_count || 0
  if (apoyo_count >= 1000) {
    const { data: earlyRows } = await supabase
      .from('early_supporters')
      .select('supporter_id, apoyo_number, profiles:supporter_id(username, full_name, avatar_url)')
      .eq('creator_id', profileId)
      .order('apoyo_number', { ascending: true })
      .limit(10)

    const slot = container.querySelector('#early-sup-slot')
    if (slot && earlyRows?.length) {
      slot.innerHTML = `
        <div class="early-sup-section">
          <div class="early-sup-title">🔭 Primeros Ojeadores de Talento</div>
          <div class="early-sup-list">
            ${earlyRows.map(r => {
              const p = r.profiles || {}
              const ini = (p.full_name || p.username || '?').trim()
                .split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()
              return `
                <a class="early-sup-item" href="/perfil/${encodeURIComponent(p.username || '')}" title="Ojeador #${r.apoyo_number}">
                  ${p.avatar_url
                    ? `<img src="${p.avatar_url}" class="early-sup-avatar" alt="">`
                    : `<div class="early-sup-avatar-fb">${ini}</div>`}
                  <span class="early-sup-name">${p.full_name || p.username || '?'}</span>
                  <span class="early-sup-num">#${r.apoyo_number}</span>
                </a>`
            }).join('')}
          </div>
        </div>`
    }
  }

  // Bind votos
  container.querySelectorAll('.creator-vote-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const creatorId = btn.dataset.creator
      const cat       = btn.dataset.cat
      const wasVoted  = btn.dataset.voted === 'true'
      btn.disabled = true
      try {
        if (wasVoted) {
          await unvoteCreatorCategory(creatorId, currentUserId, cat)
        } else {
          await voteCreatorCategory(creatorId, currentUserId, cat)
        }
        // Re-render
        await renderCreatorSection(container, profileId, currentUserId)
      } catch (e) {
        btn.disabled = false
        console.error('[creadores] vote error:', e)
      }
    })
  })

  // Gestionar categorías (solo propio)
  container.querySelector('#creator-manage-btn')?.addEventListener('click', () => {
    openManageCategoriesModal(profileId, cats)
  })
}

// ── Modal de gestión de categorías ───────────────
export function openManageCategoriesModal(userId, currentCats) {
  document.getElementById('creator-manage-modal')?.remove()
  let selected = [...currentCats]

  const modal = document.createElement('div')
  modal.id = 'creator-manage-modal'
  modal.className = 'compose-backdrop'
  modal.innerHTML = `
    <div class="compose-box">
      <div class="compose-header">
        <div class="compose-title">🎙️ Mis categorías como creador</div>
        <button class="compose-close" id="cm-close">✕</button>
      </div>
      <p class="creator-manage-hint">Elige hasta 5 categorías que representen tu contenido. La comunidad votará cuáles son reales.</p>
      <div class="creator-manage-cats" id="cm-cats">
        ${CREATOR_CATEGORIES.map(c => `
          <button class="creator-manage-cat-btn${selected.includes(c.id)?' active':''}"
            data-cat="${c.id}" style="--cat-color:${c.color}">
            ${c.icon} ${c.label}
          </button>`).join('')}
      </div>
      <div class="compose-footer">
        <div class="compose-char-count"><span id="cm-count">${selected.length}</span>/5 seleccionadas</div>
        <div class="compose-actions">
          <button class="compose-submit" id="cm-save">Guardar</button>
        </div>
      </div>
    </div>`

  const closeModal = () => {
    modal.classList.add('compose-hiding')
    setTimeout(() => modal.remove(), 300)
  }
  modal.querySelector('#cm-close').addEventListener('click', closeModal)
  modal.addEventListener('click', e => { if (e.target === modal) closeModal() })

  modal.querySelectorAll('.creator-manage-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat
      if (selected.includes(cat)) {
        selected = selected.filter(c => c !== cat)
        btn.classList.remove('active')
      } else {
        if (selected.length >= 5) return
        selected.push(cat)
        btn.classList.add('active')
      }
      modal.querySelector('#cm-count').textContent = selected.length
    })
  })

  modal.querySelector('#cm-save').addEventListener('click', async () => {
    const btn = modal.querySelector('#cm-save')
    btn.disabled = true; btn.textContent = 'Guardando…'
    try {
      await activateCreator(userId, selected)
      closeModal()
      // Recargar sección
      const container = document.getElementById('creator-section')
      if (container) await renderCreatorSection(container, userId, userId)
    } catch (e) {
      btn.disabled = false; btn.textContent = 'Error, reintentar'
    }
  })

  document.body.appendChild(modal)
  requestAnimationFrame(() => modal.classList.add('compose-visible'))
}

// ── Modal Talentos Ocultos ────────────────────────
export async function openTalentosOcultosModal() {
  document.getElementById('talentos-modal')?.remove()

  const modal = document.createElement('div')
  modal.id = 'talentos-modal'
  modal.className = 'intercambios-backdrop'
  modal.innerHTML = `
    <div class="intercambios-box">
      <div class="intercambios-header">
        <div class="intercambios-title">🌟 Talentos Ocultos</div>
        <button class="intercambios-close" id="talentos-close">✕</button>
      </div>
      <div class="talentos-subheader">
        Creadores con menos de 1.000 apoyos — descúbrelos antes que nadie
      </div>
      <div id="talentos-list" class="talentos-list">
        <div class="int-spinner">Buscando talentos…</div>
      </div>
    </div>`

  const closeModal = () => {
    modal.classList.add('intercambios-hiding')
    setTimeout(() => modal.remove(), 350)
  }
  modal.querySelector('#talentos-close').addEventListener('click', closeModal)
  modal.addEventListener('click', e => { if (e.target === modal) closeModal() })
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', esc) }
  })

  document.body.appendChild(modal)
  requestAnimationFrame(() => modal.classList.add('intercambios-visible'))

  const talentos = await loadTalentosOcultos(24)
  const list = modal.querySelector('#talentos-list')

  if (!talentos.length) {
    list.innerHTML = '<div class="int-empty"><div class="int-empty-icon">🌟</div>Aún no hay creadores registrados. ¡Sé el primero!</div>'
    return
  }

  list.innerHTML = talentos.map(t => {
    const cats = (t.validated_categories?.length ? t.validated_categories : t.proposed_categories) || []
    const initials = (t.full_name || t.username || '?').trim()
      .split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()
    const calidad  = typeof t._calidad === 'number' ? t._calidad.toFixed(1) : '—'
    const posts    = t._stats?.totalPosts || 0
    return `
      <a class="talento-card" href="/perfil/${encodeURIComponent(t.username || '')}" target="_blank">
        <div class="talento-avatar">
          ${t.avatar_url
            ? `<img src="${t.avatar_url}" alt="" class="talento-avatar-img">`
            : `<span class="talento-avatar-fb">${initials}</span>`}
        </div>
        <div class="talento-info">
          <div class="talento-name">${t.full_name || t.username || '?'}</div>
          <div class="talento-username">@${t.username || '?'}</div>
          <div class="talento-cats">
            ${cats.slice(0,3).map(c => {
              const cat = getCatDef(c)
              return `<span class="talento-cat" style="--cat-color:${cat.color}">${cat.icon} ${cat.label}</span>`
            }).join('')}
          </div>
        </div>
        <div class="talento-apoyos" title="${t.apoyo_count || 0} apoyos totales">
          <span class="talento-apoyo-count">${t.apoyo_count || 0}</span>
          <span class="talento-apoyo-label">apoyos</span>
        </div>
        <div class="talento-calidad" title="Reacciones promedio por post">
          <span class="talento-cal-val">${posts > 0 ? calidad : '—'}</span>
          <span class="talento-cal-label">reac/post</span>
        </div>
      </a>`
  }).join('')
}
