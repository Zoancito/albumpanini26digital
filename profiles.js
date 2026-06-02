// ═══════════════════════════════════════════════════
//  ÁLBUM MUNDIAL 2026 — profiles.js
//  Sistema de perfiles futboleros
// ═══════════════════════════════════════════════════
import { supabase } from './supabase.js'

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

// ── Apoyar perfil ────────────────────────────────

export async function apoyarPerfil(profileId) {
  // Usa un RPC para incrementar de forma segura
  const { data, error } = await supabase.rpc('increment_apoyo', { profile_id: profileId })
  if (error) throw error
  return data   // devuelve el nuevo total
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
  if (eyebrow) eyebrow.textContent = isEdit ? '✏️ Editar perfil' : '⚽ Primera vez · Álbum Mundial 2026'
  if (saveBtn) saveBtn.textContent = isEdit ? 'Guardar cambios →' : 'Crear perfil →'

  modal.classList.add('visible')
  setTimeout(() => { if (!isEdit) document.getElementById('psetup-username')?.focus() }, 120)

  if (!_listenersSet) { setupSetupListeners(); _listenersSet = true }
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

// Lista curada de jugadores destacados del Mundial 2026
export const MUNDIAL_PLAYERS = [
  // Argentina
  'Lionel Messi 🇦🇷','Julián Álvarez 🇦🇷','Rodrigo De Paul 🇦🇷','Enzo Fernández 🇦🇷','Emiliano Martínez 🇦🇷',
  // Brasil
  'Vinicius Jr. 🇧🇷','Rodrygo 🇧🇷','Raphinha 🇧🇷','Endrick 🇧🇷','Alisson 🇧🇷',
  // Francia
  'Kylian Mbappé 🇫🇷','Antoine Griezmann 🇫🇷','Aurélien Tchouaméni 🇫🇷','Marcus Thuram 🇫🇷',
  // Inglaterra
  'Jude Bellingham 🏴󠁧󠁢󠁥󠁮󠁧󠁿','Harry Kane 🏴󠁧󠁢󠁥󠁮󠁧󠁿','Phil Foden 🏴󠁧󠁢󠁥󠁮󠁧󠁿','Bukayo Saka 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  // España
  'Pedri 🇪🇸','Lamine Yamal 🇪🇸','Ferran Torres 🇪🇸','Dani Olmo 🇪🇸','Alejandro Grimaldo 🇪🇸',
  // Alemania
  'Florian Wirtz 🇩🇪','Jamal Musiala 🇩🇪','Kai Havertz 🇩🇪','Manuel Neuer 🇩🇪',
  // Portugal
  'Cristiano Ronaldo 🇵🇹','Bruno Fernandes 🇵🇹','Rafael Leão 🇵🇹','Bernardo Silva 🇵🇹',
  // Países Bajos
  'Virgil van Dijk 🇳🇱','Xavi Simons 🇳🇱','Cody Gakpo 🇳🇱',
  // Bélgica
  'Kevin De Bruyne 🇧🇪','Romelu Lukaku 🇧🇪','Lois Openda 🇧🇪',
  // Colombia
  'James Rodríguez 🇨🇴','Luis Díaz 🇨🇴','Rafael Santos Borré 🇨🇴',
  // Uruguay
  'Federico Valverde 🇺🇾','Darwin Núñez 🇺🇾','Ronald Araújo 🇺🇾',
  // México
  'Hirving Lozano 🇲🇽','Edson Álvarez 🇲🇽','Raúl Jiménez 🇲🇽',
  // Canadá
  'Alphonso Davies 🇨🇦','Jonathan David 🇨🇦',
  // Estados Unidos
  'Christian Pulisic 🇺🇸','Folarin Balogun 🇺🇸','Gio Reyna 🇺🇸',
  // Marruecos
  'Hakim Ziyech 🇲🇦','Achraf Hakimi 🇲🇦','Youssef En-Nesyri 🇲🇦',
  // Senegal
  'Sadio Mané 🇸🇳','Idrissa Gueye 🇸🇳',
  // Japón
  'Takefusa Kubo 🇯🇵','Kaoru Mitoma 🇯🇵','Daichi Kamada 🇯🇵',
  // Corea del Sur
  'Heung-min Son 🇰🇷','Min-jae Kim 🇰🇷',
  // Australia
  'Mathew Ryan 🇦🇺','Awer Mabil 🇦🇺',
  // Turquía
  'Arda Güler 🇹🇷','Hakan Çalhanoğlu 🇹🇷',
  // Croacia
  'Luka Modrić 🇭🇷','Ivan Perišić 🇭🇷',
  // Serbia
  'Dušan Vlahović 🇷🇸','Aleksandar Mitrović 🇷🇸',
  // Chile
  'Alexis Sánchez 🇨🇱',
  // Ecuador
  'Moisés Caicedo 🇪🇨','Enner Valencia 🇪🇨',
]

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

function _filterPlayers(query) {
  const list = document.getElementById('psetup-players-list')
  if (!list) return
  const q = query.toLowerCase()
  const filtered = MUNDIAL_PLAYERS.filter(p =>
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
  if (link) { link.href = `https://albumpanini26digital.vercel.app/perfil/${profile.username}`; link.hidden = false }

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

  const pubUrl = `https://albumpanini26digital.vercel.app/perfil/${p.username}`
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
