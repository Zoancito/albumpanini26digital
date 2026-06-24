// ═══════════════════════════════════════════════════
//  ÁLBUM MUNDIAL 2026 — profiles.js
//  Sistema de perfiles futboleros
// ═══════════════════════════════════════════════════
import { supabase } from './supabase.js'
import { getCreatorProfile, activateCreator, deactivateCreator, openManageCategoriesModal } from './creadores.js'
import { createNotificacion } from './notificaciones.js'

// ── Estado interno ────────────────────────────────
let _currentUser    = null
let _currentProfile = null
let _usernameTimer  = null
let _listenersSet   = false
let _editMode       = false
let _selectedPlayers = []   // jugadores favoritos del mundial (3-5)

// Límites para subida de foto
const MAX_AVATAR_BYTES = 2 * 1024 * 1024   // 2 MB
const ALLOWED_MIME     = ['image/jpeg','image/png','image/webp','image/gif']

// ── Cargar medallas de un perfil público ──────────
export async function loadMedals(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('medallas')
    .eq('id', userId)
    .single()
  return Array.isArray(data?.medallas) ? data.medallas : []
}

// ── Helpers de BD ────────────────────────────────

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error && error.code !== 'PGRST116') console.error('[profiles] getProfile:', error)
  return data || null
}

export async function getProfileByUsername(username) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username.toLowerCase())
    .single()
  if (error && error.code !== 'PGRST116') console.error('[profiles] getProfileByUsername:', error)
  return data || null
}

export async function checkUsernameAvailable(username) {
  const { data } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username.toLowerCase())
    .maybeSingle()
  return !data
}

export async function saveProfile(profileData) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profileData, { onConflict: 'id' })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Subir foto de perfil ─────────────────────────

export async function uploadAvatar(userId, file) {
  // Validar tipo
  if (!ALLOWED_MIME.includes(file.type)) {
    throw new Error('Formato no permitido. Usa JPG, PNG, WebP o GIF.')
  }
  // Validar tamaño
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error('La imagen supera los 2 MB. Reduce su tamaño.')
  }
  const ext  = file.name.split('.').pop().toLowerCase()
  const path = `avatars/${userId}.${ext}`
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw error
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  // Forzar cache-bust
  return data.publicUrl + '?t=' + Date.now()
}

// ── Apoyar / desapoyar perfil ─────────────────────
// Usa profile_apoyos (toggle). El trigger en Supabase actualiza apoyo_count.
export async function apoyarPerfil(profileId) {
  if (!_currentUser) throw new Error('No autenticado')
  const supporterId = _currentUser.id

  // ¿Ya apoyé a este perfil?
  const { data: existing } = await supabase
    .from('profile_apoyos')
    .select('supporter_id')
    .eq('supporter_id', supporterId)
    .eq('supported_id', profileId)
    .maybeSingle()

  if (existing) {
    // Toggle off — quitar apoyo
    const { error } = await supabase
      .from('profile_apoyos')
      .delete()
      .eq('supporter_id', supporterId)
      .eq('supported_id', profileId)
    if (error) throw error
    return { action: 'removed' }
  } else {
    // Toggle on — agregar apoyo
    const { error } = await supabase
      .from('profile_apoyos')
      .insert({ supporter_id: supporterId, supported_id: profileId })
    if (error) throw error

    // Notificar al dueño del perfil (solo si no se apoya a sí mismo)
    if (supporterId !== profileId) {
      const senderName = _currentProfile?.full_name
        || _currentUser.user_metadata?.full_name
        || _currentUser.user_metadata?.name
        || _currentUser.email?.split('@')[0]
        || 'Alguien'
      createNotificacion(profileId, 'profile_apoyo', {
        msg: `${senderName} apoyó tu perfil`,
        sender_id: supporterId,
      }).catch(() => {})
    }
    return { action: 'added' }
  }
}

// Chequea si el usuario actual ya apoyó un perfil
export async function hasApoyado(profileId) {
  if (!_currentUser) return false
  const { data } = await supabase
    .from('profile_apoyos')
    .select('supporter_id')
    .eq('supporter_id', _currentUser.id)
    .eq('supported_id', profileId)
    .maybeSingle()
  return !!data
}

// ── Accessor ─────────────────────────────────────
export function getCurrentProfile() { return _currentProfile }

// ── Flujo principal tras login ────────────────────

export async function checkAndHandleFirstLogin(user) {
  _currentUser = user
  const profile = await getProfile(user.id)
  _currentProfile = profile
  if (!profile) {
    showProfileSetupModal(user, false)
  } else {
    updateHeaderProfile(profile)
    // Si el perfil existe pero no tiene rol → mostrar selector de rol una sola vez
    if (!profile.grad_role) {
      showRolePickerModal()
    }
  }
  return profile
}

// ── Modal de Setup ────────────────────────────────

export function showProfileSetupModal(user, isEdit = false) {
  _currentUser = user
  _editMode    = isEdit
  const modal  = document.getElementById('profile-setup-modal')
  if (!modal) return

  resetSetupForm()

  if (isEdit && _currentProfile) {
    const p = _currentProfile
    setVal('psetup-fullname',  p.full_name        || '')
    setVal('psetup-username',  p.username         || '')
    setVal('psetup-team',      p.favorite_team    || '')
    setVal('psetup-position',  p.favorite_position|| '')
    setVal('psetup-bio',       p.bio              || '')
    setVal('psetup-estadio',   p.estadio_favorito || '')
    setVal('psetup-frase',     p.frase_futbolera  || '')

    const bioCount = document.getElementById('psetup-bio-count')
    if (bioCount) bioCount.textContent = (p.bio || '').length
    const fraseCount = document.getElementById('psetup-frase-count')
    if (fraseCount) fraseCount.textContent = (p.frase_futbolera || '').length

    // Restaurar jugadores favoritos seleccionados
    _selectedPlayers = Array.isArray(p.jugadores_favoritos) ? [...p.jugadores_favoritos] : []
    renderSelectedPlayers()

    // Mostrar avatar actual
    _renderCurrentAvatar(p.avatar_url)

    const saveBtn = document.getElementById('psetup-save')
    if (saveBtn) saveBtn.disabled = false
    const hint  = document.getElementById('psetup-user-hint')
    const check = document.getElementById('psetup-user-check')
    if (hint)  { hint.textContent = 'Username actual · cambia si deseas otro'; hint.className = 'psetup-hint ok' }
    if (check) { check.textContent = '✓'; check.className = 'psetup-check ok' }
  } else {
    _selectedPlayers = []
    const gName = user?.user_metadata?.name || user?.user_metadata?.full_name || ''
    if (gName) setVal('psetup-fullname', gName)
  }

  const title   = modal.querySelector('.psetup-title')
  const eyebrow = modal.querySelector('.psetup-eyebrow')
  const saveBtn = document.getElementById('psetup-save')
  if (title)   title.textContent   = isEdit ? 'EDITAR PERFIL' : 'COMPLETA TU PERFIL FUTBOLERO'
  if (eyebrow) eyebrow.textContent = isEdit ? '✏️ Editar perfil' : '⚽ Bienvenido/a a La Grada'
  if (saveBtn) saveBtn.textContent = isEdit ? 'Guardar cambios →' : 'Crear perfil →'

  // Inyectar selector de rol si no existe en el modal
  _injectRoleField(isEdit ? _currentProfile?.grad_role : null)

  modal.classList.add('visible')
  setTimeout(() => { if (!isEdit) document.getElementById('psetup-username')?.focus() }, 120)

  if (!_listenersSet) { setupSetupListeners(); _listenersSet = true }
}

function _injectRoleField(currentRole) {
  if (document.getElementById('psetup-grad-role')) {
    if (currentRole) document.getElementById('psetup-grad-role').value = currentRole
    return
  }
  const modal = document.getElementById('profile-setup-modal')
  if (!modal) return
  // Insertar antes del botón guardar
  const saveBtn = modal.querySelector('#psetup-save, .psetup-save-btn, button[type="submit"]')
  const wrap = document.createElement('div')
  wrap.className = 'psetup-field'
  wrap.innerHTML = `
    <label class="psetup-label" for="psetup-grad-role">⭐ Tu rol en La Grada</label>
    <select id="psetup-grad-role" class="psetup-input" style="cursor:pointer">
      <option value="">— Elige tu rol —</option>
      <option value="hincha" ${currentRole==='hincha'?'selected':''}>📣 Hincha</option>
      <option value="jugador" ${currentRole==='jugador'?'selected':''}>⚽ Jugador</option>
      <option value="dt" ${currentRole==='dt'?'selected':''}>📋 DT</option>
      <option value="club" ${currentRole==='club'?'selected':''}>🏟️ Club</option>
      <option value="ojeador" ${currentRole==='ojeador'?'selected':''}>🔭 Ojeador</option>
    </select>`
  if (saveBtn) saveBtn.parentElement.insertBefore(wrap, saveBtn)
}

function _renderCurrentAvatar(url) {
  const preview = document.getElementById('psetup-avatar-preview')
  if (!preview) return
  if (url) {
    preview.innerHTML = `<img src="${url}" alt="Avatar actual" style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid var(--gold)">`
  } else {
    preview.innerHTML = `<span style="width:64px;height:64px;border-radius:50%;background:var(--card2);border:2px dashed var(--border);display:flex;align-items:center;justify-content:center;font-size:1.6rem">🧑</span>`
  }
}

function hideProfileSetupModal() {
  document.getElementById('profile-setup-modal')?.classList.remove('visible')
}

// ── Selector de rol (aparece una sola vez si el perfil no tiene rol) ────────
function showRolePickerModal() {
  if (document.getElementById('role-picker-modal')) return // ya existe

  const ROLES = [
    { value: 'hincha',  icon: '📣', label: 'Hincha',  desc: 'Apasionado del fútbol' },
    { value: 'jugador', icon: '⚽', label: 'Jugador', desc: 'Juegas fútbol activamente' },
    { value: 'dt',      icon: '📋', label: 'DT',      desc: 'Diriges o analizas táctica' },
    { value: 'club',    icon: '🏟️', label: 'Club',    desc: 'Representas a un club' },
    { value: 'ojeador', icon: '🔭', label: 'Ojeador', desc: 'Descubres talentos' },
  ]

  const modal = document.createElement('div')
  modal.id = 'role-picker-modal'
  modal.className = 'role-picker-overlay'
  modal.style.cssText = `position:fixed;inset:0;z-index:10700;
    display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)`
  modal.innerHTML = `
    <div style="background:var(--card);border:1px solid var(--border);border-radius:20px;
      padding:28px 24px;max-width:420px;width:100%;box-shadow:0 24px 60px rgba(0,0,0,.5)">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:1.6rem;color:var(--text);
        letter-spacing:.05em;margin-bottom:4px">¿CUÁL ES TU ROL EN LA GRADA?</div>
      <div style="color:var(--dim);font-size:.85rem;margin-bottom:20px">
        Esto aparecerá en tu perfil. Puedes cambiarlo después.
      </div>
      <div id="role-picker-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px">
        ${ROLES.map(r => `
          <button class="role-pick-item" data-role="${r.value}"
            style="display:flex;align-items:center;gap:10px;padding:12px 14px;
            border-radius:12px;border:1.5px solid var(--border);background:var(--bg2);
            cursor:pointer;text-align:left;transition:all .15s;-webkit-tap-highlight-color:transparent">
            <span style="font-size:1.4rem;flex-shrink:0">${r.icon}</span>
            <div>
              <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;
                font-size:.95rem;color:var(--text)">${r.label}</div>
              <div style="font-size:.72rem;color:var(--dim);margin-top:1px">${r.desc}</div>
            </div>
          </button>`).join('')}
      </div>
      <button id="role-picker-save" disabled
        style="width:100%;padding:12px;border-radius:12px;border:none;
        background:var(--gold);color:#111;font-family:'Barlow Condensed',sans-serif;
        font-weight:700;font-size:1rem;letter-spacing:.06em;cursor:pointer;
        opacity:.5;transition:opacity .2s">
        Confirmar rol →
      </button>
    </div>`

  document.body.appendChild(modal)

  let selectedRole = null
  modal.querySelectorAll('.role-pick-item').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.role-pick-item').forEach(b => {
        b.style.borderColor = 'var(--border)'
        b.style.background  = 'var(--bg2)'
      })
      btn.style.borderColor = 'var(--gold)'
      btn.style.background  = 'rgba(245,197,24,.08)'
      selectedRole = btn.dataset.role
      const saveBtn = document.getElementById('role-picker-save')
      if (saveBtn) { saveBtn.disabled = false; saveBtn.style.opacity = '1' }
    })
  })

  document.getElementById('role-picker-save').addEventListener('click', async () => {
    if (!selectedRole || !_currentUser) return
    const saveBtn = document.getElementById('role-picker-save')
    saveBtn.textContent = 'Guardando…'; saveBtn.disabled = true
    try {
      const { data, error } = await supabase.from('profiles')
        .update({ grad_role: selectedRole })
        .eq('id', _currentUser.id)
        .select().single()
      if (error) throw error
      _currentProfile = { ..._currentProfile, grad_role: selectedRole }
      modal.remove()
    } catch (e) {
      console.error('[role picker]', e)
      saveBtn.textContent = '⚠ Error. Reintentar'; saveBtn.disabled = false
    }
  })
}

function resetSetupForm() {
  ;['psetup-fullname','psetup-username','psetup-team','psetup-bio','psetup-estadio','psetup-frase'].forEach(id => setVal(id, ''))
  setVal('psetup-position','')
  const bioCount   = document.getElementById('psetup-bio-count')
  const fraseCount = document.getElementById('psetup-frase-count')
  if (bioCount)   bioCount.textContent   = '0'
  if (fraseCount) fraseCount.textContent = '0'
  const hint  = document.getElementById('psetup-user-hint')
  const check = document.getElementById('psetup-user-check')
  if (hint)  { hint.textContent = 'Solo letras, números y _ · 3–30 caracteres'; hint.className = 'psetup-hint' }
  if (check) { check.textContent = ''; check.className = 'psetup-check' }
  const saveBtn = document.getElementById('psetup-save')
  if (saveBtn) saveBtn.disabled = true
  _selectedPlayers = []
  renderSelectedPlayers()
  _renderCurrentAvatar(null)
  // Reset file input
  const fileInput = document.getElementById('psetup-avatar-file')
  if (fileInput) fileInput.value = ''
}

// ── Jugadores favoritos ───────────────────────────

function renderSelectedPlayers() {
  const container = document.getElementById('psetup-players-selected')
  if (!container) return
  container.innerHTML = _selectedPlayers.map(p =>
    `<span class="player-chip">${p} <button type="button" class="player-chip-remove" data-player="${p}" aria-label="Quitar">×</button></span>`
  ).join('')
  container.querySelectorAll('.player-chip-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      _selectedPlayers = _selectedPlayers.filter(x => x !== btn.dataset.player)
      renderSelectedPlayers()
      _updatePlayerSearch()
    })
  })
  // Actualizar contador
  const counter = document.getElementById('psetup-players-count')
  if (counter) counter.textContent = `${_selectedPlayers.length}/5`
}

function _updatePlayerSearch() {
  const input = document.getElementById('psetup-player-search')
  if (input) _filterPlayers(input.value)
}

// ── Lista de jugadores del mundial ────────────────
// Usa los jugadores reales del álbum si están disponibles (cargados por script.js)
// Si no, lista de respaldo con los más conocidos
function getAllMundialPlayers() {
  if (window._albumPlayers && Object.keys(window._albumPlayers).length > 0) {
    // Extraer todos los jugadores de todas las selecciones con el formato "Nombre (Selección)"
    const players = []
    Object.entries(window._albumPlayers).forEach(([country, names]) => {
      const countryShort = country.split(' ').slice(1).join(' ')  // quitar emoji
      names.forEach(name => players.push(`${name} (${countryShort})`))
    })
    return players
  }
  // Fallback: lista curada
  return [
    'Lionel Messi (Argentina)','Julián Álvarez (Argentina)','Emiliano Martínez (Argentina)',
    'Vinicius Jr. (Brasil)','Rodrygo (Brasil)','Endrick (Brasil)','Alisson (Brasil)',
    'Kylian Mbappé (Francia)','Antoine Griezmann (Francia)','Mike Maignan (Francia)',
    'Jude Bellingham (Inglaterra)','Harry Kane (Inglaterra)','Phil Foden (Inglaterra)',
    'Lamine Yamal (España)','Pedri (España)','Álvaro Morata (España)',
    'Florian Wirtz (Alemania)','Jamal Musiala (Alemania)','Manuel Neuer (Alemania)',
    'Cristiano Ronaldo (Portugal)','Bruno Fernandes (Portugal)','Rúben Dias (Portugal)',
    'Kevin De Bruyne (Bélgica)','Romelu Lukaku (Bélgica)','Lois Openda (Bélgica)',
    'Erling Haaland (Noruega)','Martin Ødegaard (Noruega)',
    'Heung-min Son (Corea del Sur)','Min-jae Kim (Corea del Sur)',
    'Achraf Hakimi (Marruecos)','Hakim Ziyech (Marruecos)','Youssef En-Nesyri (Marruecos)',
    'Mohamed Salah (Egipto)','Sadio Mané (Senegal)','Alphonso Davies (Canadá)',
    'Jonathan David (Canadá)','Christian Pulisic (EE. UU.)','Hirving Lozano (México)',
    'James Rodríguez (Colombia)','Luis Díaz (Colombia)','Federico Valverde (Uruguay)',
    'Darwin Núñez (Uruguay)','Takefusa Kubo (Japón)','Arda Güler (Turquía)',
  ]
}

function _filterPlayers(query) {
  const list = document.getElementById('psetup-players-list')
  if (!list) return
  const q = query.toLowerCase()
  const filtered = getAllMundialPlayers().filter(p =>
    p.toLowerCase().includes(q) && !_selectedPlayers.includes(p)
  ).slice(0, 12)
  list.innerHTML = filtered.map(p =>
    `<button type="button" class="player-option" data-player="${p}">${p}</button>`
  ).join('')
  list.querySelectorAll('.player-option').forEach(btn => {
    btn.addEventListener('click', () => {
      if (_selectedPlayers.length >= 5) return
      _selectedPlayers.push(btn.dataset.player)
      renderSelectedPlayers()
      _filterPlayers(document.getElementById('psetup-player-search')?.value || '')
    })
  })
  list.style.display = filtered.length ? 'flex' : 'none'
}

// ── Listeners del setup ───────────────────────────

function setupSetupListeners() {
  const form          = document.getElementById('psetup-form')
  const usernameInput = document.getElementById('psetup-username')
  const saveBtn       = document.getElementById('psetup-save')
  const skipBtn       = document.getElementById('psetup-skip')
  const bioTextarea   = document.getElementById('psetup-bio')
  const bioCount      = document.getElementById('psetup-bio-count')
  const fraseTextarea = document.getElementById('psetup-frase')
  const fraseCount    = document.getElementById('psetup-frase-count')
  const userHint      = document.getElementById('psetup-user-hint')
  const userCheck     = document.getElementById('psetup-user-check')
  const backdrop      = document.getElementById('profile-setup-modal')
  const fileInput     = document.getElementById('psetup-avatar-file')
  const playerSearch  = document.getElementById('psetup-player-search')

  // Bio counter
  bioTextarea?.addEventListener('input', () => {
    if (bioCount) bioCount.textContent = bioTextarea.value.length
  })

  // Frase counter
  fraseTextarea?.addEventListener('input', () => {
    if (fraseCount) fraseCount.textContent = fraseTextarea.value.length
  })

  // Avatar file input preview
  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0]
    if (!file) return
    if (!ALLOWED_MIME.includes(file.type)) {
      showProfileToast('⚠ Formato no válido. Usa JPG, PNG o WebP.')
      fileInput.value = ''; return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      showProfileToast('⚠ Imagen demasiado grande. Máximo 2 MB.')
      fileInput.value = ''; return
    }
    const reader = new FileReader()
    reader.onload = e => _renderCurrentAvatar(e.target.result)
    reader.readAsDataURL(file)
  })

  // Búsqueda de jugadores
  playerSearch?.addEventListener('input', () => _filterPlayers(playerSearch.value))
  playerSearch?.addEventListener('focus',  () => _filterPlayers(playerSearch.value))

  // Username — validación + disponibilidad
  usernameInput?.addEventListener('input', () => {
    clearTimeout(_usernameTimer)
    const val = usernameInput.value.trim().toLowerCase()
    if (!val) {
      setHint(userHint, 'Solo letras, números y _ · 3–30 caracteres', '')
      setCheck(userCheck, '', '')
      saveBtn.disabled = true; return
    }
    if (!/^[a-z0-9_]{3,30}$/.test(val)) {
      setHint(userHint, '⚠ Solo letras minúsculas, números y _ · Entre 3 y 30 caracteres', 'error')
      setCheck(userCheck, '✗', 'bad')
      saveBtn.disabled = true; return
    }
    if (_editMode && _currentProfile && val === _currentProfile.username) {
      setHint(userHint, '✓ Tu username actual', 'ok')
      setCheck(userCheck, '✓', 'ok')
      saveBtn.disabled = false; return
    }
    setHint(userHint, 'Verificando disponibilidad...', '')
    setCheck(userCheck, '⏳', '')
    saveBtn.disabled = true
    _usernameTimer = setTimeout(async () => {
      const available = await checkUsernameAvailable(val)
      if (available) {
        setHint(userHint, '✓ Username disponible', 'ok')
        setCheck(userCheck, '✓', 'ok')
        saveBtn.disabled = false
      } else {
        setHint(userHint, '✗ Username en uso. Prueba otro.', 'error')
        setCheck(userCheck, '✗', 'bad')
        saveBtn.disabled = true
      }
    }, 500)
  })

  skipBtn?.addEventListener('click', hideProfileSetupModal)
  backdrop?.addEventListener('click', e => { if (e.target === backdrop) hideProfileSetupModal() })
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && backdrop?.classList.contains('visible')) hideProfileSetupModal()
  })

  // Submit
  form?.addEventListener('submit', async e => {
    e.preventDefault()
    const username = usernameInput.value.trim().toLowerCase()
    if (!username || saveBtn.disabled) return

    saveBtn.disabled = true
    const origText = saveBtn.textContent
    saveBtn.textContent = 'Guardando...'

    try {
      let avatarUrl = _currentProfile?.avatar_url
        || _currentUser?.user_metadata?.avatar_url
        || _currentUser?.user_metadata?.picture
        || ''

      // Si hay archivo nuevo, subirlo
      const fileInput = document.getElementById('psetup-avatar-file')
      if (fileInput?.files?.[0]) {
        saveBtn.textContent = 'Subiendo foto...'
        avatarUrl = await uploadAvatar(_currentUser.id, fileInput.files[0])
      }

      const profileData = {
        id:                   _currentUser.id,
        username,
        full_name:            getVal('psetup-fullname'),
        favorite_team:        getVal('psetup-team'),
        favorite_position:    getVal('psetup-position'),
        bio:                  getVal('psetup-bio'),
        estadio_favorito:     getVal('psetup-estadio'),
        frase_futbolera:      getVal('psetup-frase'),
        jugadores_favoritos:  _selectedPlayers,
        avatar_url:           avatarUrl,
        grad_role:            getVal('psetup-grad-role') || _currentProfile?.grad_role || null,
      }

      const saved = await saveProfile(profileData)
      _currentProfile = saved
      updateHeaderProfile(saved)
      hideProfileSetupModal()
      if (_editMode) closeProfileViewModal()
      showProfileToast(_editMode ? '✅ Perfil actualizado' : '🎉 ¡Perfil creado con éxito!')
      if (_editMode) setTimeout(openProfileViewModal, 600)
    } catch (err) {
      console.error('[profiles] saveProfile:', err)
      saveBtn.textContent = '⚠ Error. Reintentar'
      saveBtn.disabled = false
      setHint(userHint, '⚠ Error al guardar. Intenta de nuevo.', 'error')
    }
  })
}

// ── Actualizar header con perfil ──────────────────

export function updateHeaderProfile(profile) {
  if (!profile) return
  const usernameEl = document.getElementById('profile-username')
  if (usernameEl) usernameEl.textContent = '@' + profile.username

  const link = document.getElementById('profile-public-link')
  if (link) { link.href = `https://lagrada.vercel.app/perfil/${profile.username}`; link.hidden = false }

  const viewBtn = document.getElementById('profile-view-btn')
  if (viewBtn) viewBtn.hidden = false

  if (profile.full_name) {
    const nameEl = document.getElementById('profile-name')
    if (nameEl) nameEl.textContent = profile.full_name
    const fallback = document.getElementById('profile-avatar-fallback')
    if (fallback) fallback.textContent = profile.full_name.trim().split(/\s+/).slice(0,2).map(p=>p[0]).join('').toUpperCase() || 'FC'
  }

  // Actualizar avatar del header si existe
  const headerImg = document.getElementById('profile-avatar-img')
  if (headerImg && profile.avatar_url) {
    headerImg.src     = profile.avatar_url
    headerImg.hidden  = false
    const fb = document.getElementById('profile-avatar-fallback')
    if (fb) fb.hidden = true
  }
}

// ── Modal de vista de perfil ─────────────────────

export function openProfileViewModal() {
  const modal = document.getElementById('profile-view-modal')
  if (!modal || !_currentProfile) return
  const p = _currentProfile

  const img = document.getElementById('pview-avatar-img')
  const fb  = document.getElementById('pview-avatar-fb')
  if (p.avatar_url) {
    img.src = p.avatar_url; img.hidden = false; fb.hidden = true
  } else {
    img.hidden = true; fb.hidden = false
    fb.textContent = (p.full_name||p.username||'FC').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'FC'
  }

  setText('pview-fullname',  p.full_name || p.username)
  setText('pview-username',  '@' + p.username)
  setText('pview-bio',       p.bio              || 'Sin bio todavía. ✏️')
  setText('pview-team',      p.favorite_team    || '—')
  setText('pview-position',  p.favorite_position|| '—')
  setText('pview-estadio',   p.estadio_favorito || '—')
  setText('pview-frase',     p.frase_futbolera  || '—')

  // Jugadores favoritos
  const jugsEl = document.getElementById('pview-jugadores')
  if (jugsEl) {
    const jugs = Array.isArray(p.jugadores_favoritos) ? p.jugadores_favoritos : []
    jugsEl.innerHTML = jugs.length
      ? jugs.map(j => `<span class="player-chip-view">${j}</span>`).join('')
      : '<span class="pview-empty">No seleccionados aún</span>'
  }

  const pubUrl = `https://lagrada.vercel.app/perfil/${p.username}`
  const linkEl = document.getElementById('pview-public-link')
  if (linkEl) { linkEl.href = pubUrl; linkEl.textContent = pubUrl }

  const copyBtn = document.getElementById('pview-copy-link')
  if (copyBtn) {
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(pubUrl).then(() => {
        copyBtn.textContent = '✅ ¡Copiado!'
        setTimeout(() => { copyBtn.textContent = '📋 Copiar enlace' }, 2000)
      })
    }
  }

  // Botón modo creador (solo perfil propio)
  const creatorBtn = document.getElementById('pview-creator-btn')
  if (creatorBtn && _currentUser) {
    getCreatorProfile(_currentUser.id).then(creator => {
      const isCreator = creator?.is_active
      creatorBtn.textContent     = isCreator ? '🎙️ Gestionar mis categorías' : '🎙️ Activar modo creador'
      creatorBtn.dataset.active  = isCreator ? 'true' : 'false'
      creatorBtn.style.display   = ''
      creatorBtn.onclick = async () => {
        if (isCreator) {
          openManageCategoriesModal(_currentUser.id, creator.proposed_categories || [])
        } else {
          // Activar directamente abriendo el modal de categorías
          openManageCategoriesModal(_currentUser.id, [])
        }
      }
    })
  }

  modal.classList.add('visible')
  setupViewModalListeners()
}

export function closeProfileViewModal() {
  document.getElementById('profile-view-modal')?.classList.remove('visible')
}

let _viewListenersSet = false
function setupViewModalListeners() {
  if (_viewListenersSet) return
  _viewListenersSet = true
  const modal   = document.getElementById('profile-view-modal')
  const closeEl = document.getElementById('pview-close')
  const closeBt = document.getElementById('pview-close-btn')
  const editBtn = document.getElementById('pview-edit-btn')
  closeEl?.addEventListener('click', closeProfileViewModal)
  closeBt?.addEventListener('click', closeProfileViewModal)
  modal?.addEventListener('click', e => { if (e.target === modal) closeProfileViewModal() })
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal?.classList.contains('visible')) closeProfileViewModal()
  })
  editBtn?.addEventListener('click', () => {
    closeProfileViewModal()
    setTimeout(() => showProfileSetupModal(_currentUser, true), 200)
  })
}

export function setupProfileViewButton() {
  document.getElementById('profile-view-btn')?.addEventListener('click', openProfileViewModal)
}

// ── Toast ─────────────────────────────────────────

export function showProfileToast(msg) {
  let toast = document.getElementById('profile-toast')
  if (!toast) {
    toast = document.createElement('div')
    toast.id = 'profile-toast'
    document.body.appendChild(toast)
  }
  toast.textContent = msg
  toast.classList.add('visible')
  clearTimeout(toast._timer)
  toast._timer = setTimeout(() => toast.classList.remove('visible'), 3200)
}

// ── Utils ─────────────────────────────────────────
function setVal(id, v)  { const el = document.getElementById(id); if (el) el.value = v }
function getVal(id)     { return document.getElementById(id)?.value.trim() || '' }
function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v }
function setHint(el, txt, cls) { if (!el) return; el.textContent = txt; el.className = 'psetup-hint' + (cls ? ' ' + cls : '') }
function setCheck(el, txt, cls){ if (!el) return; el.textContent = txt; el.className = 'psetup-check' + (cls ? ' ' + cls : '') }
