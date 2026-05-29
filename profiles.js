// ═══════════════════════════════════════════════════
//  ÁLBUM MUNDIAL 2026 — profiles.js
//  Sistema de perfiles futboleros
// ═══════════════════════════════════════════════════
import { supabase } from './supabase.js'

// ── Estado interno ────────────────────────────────
let _currentUser = null
let _currentProfile = null
let _usernameTimer = null
let _listenersSet = false
let _editMode = false

// ── Helpers de BD ────────────────────────────────

/** Obtiene el perfil del usuario por su UUID */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error && error.code !== 'PGRST116') console.error('[profiles] getProfile:', error)
  return data || null
}

/** Obtiene un perfil público por username */
export async function getProfileByUsername(username) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username.toLowerCase())
    .single()
  if (error && error.code !== 'PGRST116') console.error('[profiles] getProfileByUsername:', error)
  return data || null
}

/** Verifica si un username está disponible */
export async function checkUsernameAvailable(username) {
  const { data } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username.toLowerCase())
    .maybeSingle()
  return !data
}

/** Guarda (crea o actualiza) el perfil */
export async function saveProfile(profileData) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profileData, { onConflict: 'id' })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Accessor ─────────────────────────────────────
export function getCurrentProfile() { return _currentProfile }

// ── Flujo principal tras login ────────────────────

/**
 * Llama tras login con Google.
 * Si el usuario no tiene perfil → muestra modal de setup.
 * Si ya tiene perfil → actualiza el header.
 */
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

// ── Modal de Setup (primera vez / edición) ────────

export function showProfileSetupModal(user, isEdit = false) {
  _currentUser = user
  _editMode = isEdit
  const modal = document.getElementById('profile-setup-modal')
  if (!modal) return

  resetSetupForm()

  if (isEdit && _currentProfile) {
    // Poblamos el formulario con datos existentes
    setVal('psetup-fullname', _currentProfile.full_name || '')
    setVal('psetup-username', _currentProfile.username || '')
    setVal('psetup-team', _currentProfile.favorite_team || '')
    setVal('psetup-position', _currentProfile.favorite_position || '')
    setVal('psetup-bio', _currentProfile.bio || '')
    const bioCount = document.getElementById('psetup-bio-count')
    if (bioCount) bioCount.textContent = (_currentProfile.bio || '').length
    // Username válido ya existe → habilitamos save
    const saveBtn = document.getElementById('psetup-save')
    if (saveBtn) saveBtn.disabled = false
    const hint = document.getElementById('psetup-user-hint')
    if (hint) { hint.textContent = 'Username actual · cambia si deseas otro'; hint.className = 'psetup-hint ok' }
    const check = document.getElementById('psetup-user-check')
    if (check) { check.textContent = '✓'; check.className = 'psetup-check ok' }
  } else {
    // Primera vez: pre-llenar nombre desde Google
    const gName = user?.user_metadata?.name || user?.user_metadata?.full_name || ''
    if (gName) setVal('psetup-fullname', gName)
  }

  const title = modal.querySelector('.psetup-title')
  const eyebrow = modal.querySelector('.psetup-eyebrow')
  const saveBtn = document.getElementById('psetup-save')
  if (title)   title.textContent   = isEdit ? 'EDITAR PERFIL' : 'COMPLETA TU PERFIL FUTBOLERO'
  if (eyebrow) eyebrow.textContent = isEdit ? '✏️ Editar perfil' : '⚽ Primera vez · Álbum Mundial 2026'
  if (saveBtn) saveBtn.textContent = isEdit ? 'Guardar cambios →' : 'Crear perfil →'

  modal.classList.add('visible')
  setTimeout(() => {
    if (!isEdit) document.getElementById('psetup-username')?.focus()
  }, 120)

  if (!_listenersSet) {
    setupSetupListeners()
    _listenersSet = true
  }
}

function hideProfileSetupModal() {
  document.getElementById('profile-setup-modal')?.classList.remove('visible')
}

function resetSetupForm() {
  const form = document.getElementById('psetup-form')
  if (!form) return
  ;['psetup-fullname','psetup-username','psetup-team','psetup-bio'].forEach(id => setVal(id, ''))
  setVal('psetup-position', '')
  const bioCount = document.getElementById('psetup-bio-count')
  if (bioCount) bioCount.textContent = '0'
  const hint = document.getElementById('psetup-user-hint')
  if (hint) { hint.textContent = 'Solo letras, números y _ · 3–30 caracteres'; hint.className = 'psetup-hint' }
  const check = document.getElementById('psetup-user-check')
  if (check) { check.textContent = ''; check.className = 'psetup-check' }
  const saveBtn = document.getElementById('psetup-save')
  if (saveBtn) saveBtn.disabled = true
}

function setupSetupListeners() {
  const form        = document.getElementById('psetup-form')
  const usernameInput = document.getElementById('psetup-username')
  const saveBtn     = document.getElementById('psetup-save')
  const skipBtn     = document.getElementById('psetup-skip')
  const bioTextarea = document.getElementById('psetup-bio')
  const bioCount    = document.getElementById('psetup-bio-count')
  const userHint    = document.getElementById('psetup-user-hint')
  const userCheck   = document.getElementById('psetup-user-check')
  const backdrop    = document.getElementById('profile-setup-modal')

  // Bio counter
  bioTextarea?.addEventListener('input', () => {
    if (bioCount) bioCount.textContent = bioTextarea.value.length
  })

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

    // Si es edición y el username no cambió
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

  // Skip / cerrar backdrop
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
      const avatarUrl = _currentProfile?.avatar_url
        || _currentUser?.user_metadata?.avatar_url
        || _currentUser?.user_metadata?.picture
        || ''

      const profileData = {
        id:                _currentUser.id,
        username,
        full_name:         getVal('psetup-fullname'),
        favorite_team:     getVal('psetup-team'),
        favorite_position: getVal('psetup-position'),
        bio:               getVal('psetup-bio'),
        avatar_url:        avatarUrl,
      }

      const saved = await saveProfile(profileData)
      _currentProfile = saved
      updateHeaderProfile(saved)
      hideProfileSetupModal()
      if (_editMode) closeProfileViewModal()
      showProfileToast(_editMode ? '✅ Perfil actualizado' : '🎉 ¡Perfil creado con éxito!')
      // Reabre el modal de vista tras editar
      if (_editMode) setTimeout(openProfileViewModal, 600)
    } catch (err) {
      console.error('[profiles] saveProfile:', err)
      saveBtn.textContent = 'Error. Reintentar'
      saveBtn.disabled = false
      setHint(userHint, '⚠ Error al guardar. ¿Username ya en uso?', 'error')
    }
  })
}

// ── Actualizar header con perfil ──────────────────

export function updateHeaderProfile(profile) {
  if (!profile) return
  const usernameEl = document.getElementById('profile-username')
  if (usernameEl) usernameEl.textContent = '@' + profile.username

  const link = document.getElementById('profile-public-link')
  if (link) {
    link.href = `https://albumpanini26digital.vercel.app/perfil/${profile.username}`
    link.hidden = false
  }

  const viewBtn = document.getElementById('profile-view-btn')
  if (viewBtn) viewBtn.hidden = false

  // Si el header mostraba el nombre de Google, ahora usamos full_name del perfil
  if (profile.full_name) {
    const nameEl = document.getElementById('profile-name')
    if (nameEl) nameEl.textContent = profile.full_name
    const fallback = document.getElementById('profile-avatar-fallback')
    if (fallback) fallback.textContent = profile.full_name.trim().split(/\s+/).slice(0,2).map(p=>p[0]).join('').toUpperCase() || 'FC'
  }
}

// ── Modal de vista de perfil ─────────────────────

export function openProfileViewModal() {
  const modal = document.getElementById('profile-view-modal')
  if (!modal || !_currentProfile) return

  const p = _currentProfile

  // Avatar
  const img = document.getElementById('pview-avatar-img')
  const fb  = document.getElementById('pview-avatar-fb')
  if (p.avatar_url) {
    img.src = p.avatar_url; img.hidden = false; fb.hidden = true
  } else {
    img.hidden = true; fb.hidden = false
    fb.textContent = (p.full_name || p.username || 'FC').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase() || 'FC'
  }

  setText('pview-fullname', p.full_name || p.username)
  setText('pview-username', '@' + p.username)
  setText('pview-bio', p.bio || 'Sin bio todavía. ✏️')
  setText('pview-team', p.favorite_team || '—')
  setText('pview-position', p.favorite_position || '—')

  const pubUrl = `https://albumpanini26digital.vercel.app/perfil/${p.username}`
  const linkEl = document.getElementById('pview-public-link')
  if (linkEl) { linkEl.href = pubUrl; linkEl.textContent = pubUrl }

  // Copy link button
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

// ── Botón de perfil en el header ─────────────────

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
function setVal(id, v) { const el = document.getElementById(id); if (el) el.value = v }
function getVal(id)    { return document.getElementById(id)?.value.trim() || '' }
function setText(id, v){ const el = document.getElementById(id); if (el) el.textContent = v }
function setHint(el, txt, cls) { if (!el) return; el.textContent = txt; el.className = 'psetup-hint' + (cls ? ' ' + cls : '') }
function setCheck(el, txt, cls){ if (!el) return; el.textContent = txt; el.className = 'psetup-check' + (cls ? ' ' + cls : '') }
