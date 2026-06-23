import {
  checkAndHandleFirstLogin,
  setupProfileViewButton,
} from './profiles.js'
import { initAmigos, refreshFriendsPanel } from './amigos.js'
import { supabase } from './supabase.js'
import { openIntercambiosModal } from './intercambios.js'
import { initNotificaciones, destroyNotificaciones, getAllNotifs, markRead, markAllRead, deleteNotificacion, renderNotifPanel } from './notificaciones.js'
import { initFeed, openComposeModal } from './feed.js'
import { openTalentosOcultosModal } from './creadores.js'
import {
  initAlbum, syncCloudState, scheduleExchangeSync,
  flushPendingCloudSync, cancelPendingCloudSync,
  closeOverlay, hidePdfModal, setAnthemVolume, hasActiveAnthem,
} from './album.js'
import { initRadio, setRadioVolume, isRadioPlaying, isRadioVisible, getCurrentTrackTitle } from './radio.js'
console.log('Supabase conectado:', supabase)

const authScreen = document.getElementById('auth-screen');
const loginButton = document.getElementById('google-login');
const guestButton = document.getElementById('guest-login');
const userProfile = document.getElementById('user-profile');
const profileName = document.getElementById('profile-name');
const profileAvatarImg = document.getElementById('profile-avatar-img');
const profileAvatarFallback = document.getElementById('profile-avatar-fallback');
const logoutButton = document.getElementById('logout-btn');

// ── Floating profile fab toggle ──
(function initProfileFab() {
  const fab = document.getElementById('profile-fab');
  const popover = document.getElementById('profile-popover');
  if (!fab || !popover) return;

  fab.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !popover.hidden;
    popover.hidden = isOpen;
    fab.setAttribute('aria-expanded', String(!isOpen));
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!popover.hidden && !userProfile?.contains(e.target)) {
      popover.hidden = true;
      fab.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !popover.hidden) {
      popover.hidden = true;
      fab.setAttribute('aria-expanded', 'false');
    }
  });
})();

let accessMode = null;
let currentUser = null;
const _profilesCache = {};   // { [userId]: profile } — cache para el modal de intercambios
function showAuthScreen() {
  accessMode = null;
  currentUser = null;
  cancelPendingCloudSync();
  authScreen?.classList.remove('off');
  renderUserProfile(null);
}

function enterAlbumShell(mode, user = null) {
  accessMode = mode;
  currentUser = mode === 'google' ? user : null;
  window._currentUserId = currentUser?.id || null;
  authScreen?.classList.add('off');
  renderUserProfile(user);

  // Feed social — Grada es la página principal, así que el feed se inicializa
  // siempre. En modo invitado, initFeed(null) entra en solo lectura (apoyar,
  // comentar y silenciar categorías quedan bloqueados desde feed.js).
  initFeed(currentUser?.id || null).catch(console.error);

  if (currentUser) {
    syncCloudState(currentUser);
    refreshFriendsPanel(currentUser).catch(console.error);
    checkAndHandleFirstLogin(currentUser).catch(console.error);

    // Notificaciones + intercambios
    initNotificaciones(currentUser.id, (notifs) => updateNotifBell(notifs)).catch(console.error);
    document.getElementById('compose-fab')?.style.removeProperty('display');
    // Sync inicial de ofertas de intercambio
    setTimeout(() => scheduleExchangeSync(), 3000);
  } else {
    destroyNotificaciones();
  }
}

// Inicializar botón de perfil y amigos al cargar
setupProfileViewButton();
initAmigos();

// Convertir amigos-overlay en panel flotante: envolver contenido en .amigos-shell
// y cerrar al hacer click en el backdrop
(function wrapAmigosShell() {
  function setupShellWrapper(overlay) {
    // Close on backdrop click (click outside the inner card)
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) goHome();
    });

    function doWrap() {
      if (overlay.children.length && !overlay.querySelector('.amigos-shell')) {
        const shell = document.createElement('div');
        shell.className = 'amigos-shell';
        while (overlay.firstChild) shell.appendChild(overlay.firstChild);
        overlay.appendChild(shell);
      }
    }
    doWrap();

    // Re-wrap if amigos.js re-renders the content
    new MutationObserver(doWrap).observe(overlay, { childList: true });
  }

  const existing = document.getElementById('amigos-overlay');
  if (existing) {
    setupShellWrapper(existing);
  } else {
    // amigos-overlay is created dynamically — wait for it
    new MutationObserver(function(_, obs) {
      const overlay = document.getElementById('amigos-overlay');
      if (overlay) {
        obs.disconnect();
        setupShellWrapper(overlay);
      }
    }).observe(document.body, { childList: true, subtree: true });
  }
})();

function getUserDisplayName(user) {
  const metadata = user?.user_metadata || {};
  return metadata.name || metadata.full_name || user?.email || 'Coleccionista';
}

function getUserAvatarUrl(user) {
  const metadata = user?.user_metadata || {};
  return metadata.avatar_url || metadata.picture || '';
}

function getInitials(name) {
  return String(name || 'FC')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase() || 'FC';
}

function renderUserProfile(user) {
  if (!userProfile) return;
  if (!user) {
    userProfile.hidden = true;
    const usernameEl = document.getElementById('profile-username');
    if (usernameEl) usernameEl.textContent = '';
    const viewBtn = document.getElementById('profile-view-btn');
    if (viewBtn) viewBtn.hidden = true;
    return;
  }

  const name = getUserDisplayName(user);
  const avatarUrl = getUserAvatarUrl(user);

  profileName.textContent = name;
  profileAvatarFallback.textContent = getInitials(name);

  if (avatarUrl) {
    profileAvatarImg.src = avatarUrl;
    profileAvatarImg.hidden = false;
    profileAvatarFallback.hidden = true;
  } else {
    profileAvatarImg.removeAttribute('src');
    profileAvatarImg.hidden = true;
    profileAvatarFallback.hidden = false;
  }

  userProfile.hidden = false;
  setProfileStatus('Conectado');
}

function setProfileStatus(text) {
  const status = userProfile?.querySelector('.profile-status');
  if (status) status.textContent = text;
}
function getProfileStatus() {
  return userProfile?.querySelector('.profile-status')?.textContent || '';
}

loginButton?.addEventListener('click', async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.href }
  });

  if (error) {
    console.error('Error login:', error);
  }
});

guestButton?.addEventListener('click', () => {
  enterAlbumShell('guest');
});

logoutButton?.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error logout:', error);
    return;
  }
  showAuthScreen();
});

supabase.auth.getSession().then(({ data }) => {
  const user = data?.session?.user || null;
  if (user) enterAlbumShell('google', user);
  else showAuthScreen();
});

supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) enterAlbumShell('google', session.user);
  else if (event === 'SIGNED_OUT') showAuthScreen();
});

// ════════════ MÓDULO: conexión con album.js / radio.js ════════════
// Estas funciones quedan disponibles por hoisting aunque se definan más
// abajo en este mismo archivo (getEffectiveVolume, applyMasterVolume,
// pushUiState); los closures () => currentUser / () => accessMode
// siempre leen el valor más reciente al momento en que se invoquen.
initAlbum({
  getEffectiveVolume: () => getEffectiveVolume(),
  setProfileStatus: (t) => setProfileStatus(t),
  getProfileStatus: () => getProfileStatus(),
  getCurrentUser: () => currentUser,
  getAccessMode: () => accessMode,
  applyMasterVolume: () => applyMasterVolume(),
  pushUiState: (k) => pushUiState(k),
});
initRadio({
  getEffectiveVolume: () => getEffectiveVolume(),
  pushUiState: (k) => pushUiState(k),
  onStateChange: () => updateRadioVisualState(),
});

// ── MASTER VOLUME ──
let masterVolume = 0.6;
let masterMuted  = false;

function getEffectiveVolume() { return masterMuted ? 0 : masterVolume; }

function applyMasterVolume() {
  const v = getEffectiveVolume();
  const bg = document.getElementById('bg-video');
  // Only update bg if no anthem/radio override is active
  if (bg && !hasActiveAnthem() && !isRadioPlaying()) bg.volume = v;
  setAnthemVolume(v);
  setRadioVolume(v);
  // Update slider visual
  const sl = document.getElementById('vol-slider');
  if (sl) {
    sl.value = Math.round(masterVolume * 100);
    sl.style.setProperty('--pct', Math.round(masterVolume*100) + '%');
  }
  const lbl = document.getElementById('vol-label');
  if (lbl) lbl.textContent = masterMuted ? '🔇' : Math.round(masterVolume*100) + '%';
  const icon = document.getElementById('vol-mute-btn');
  if (icon) icon.textContent = masterMuted ? '🔇' : masterVolume > 0.5 ? '🔊' : masterVolume > 0 ? '🔉' : '🔈';
}

window.addEventListener('beforeunload', () => {
  flushPendingCloudSync();
});
(function initVolume() {
  const slider = document.getElementById('vol-slider');
  const muteBtn = document.getElementById('vol-mute-btn');

  slider.addEventListener('input', () => {
    masterVolume = parseInt(slider.value) / 100;
    masterMuted  = false;
    applyMasterVolume();
  });

  muteBtn.addEventListener('click', () => {
    masterMuted = !masterMuted;
    applyMasterVolume();
  });
})();
// ════════════ ACCESSIBILITY + RADIO UX PATCH ════════════
const A11Y_KEY = 'album_panini_2026_accessibility';
let a11yPrefs = {
  textSize: 'normal',
  theme: 'dark',
  touchUI: false,
  labels: true,
  visualRadio: false,
  reduceMotion: false,
  keyboardNav: false
};

function loadA11yPrefs(){
  try{
    const raw = localStorage.getItem(A11Y_KEY);
    if(raw) a11yPrefs = {...a11yPrefs, ...JSON.parse(raw)};
  }catch(e){}
}
function saveA11yPrefs(){
  try{ localStorage.setItem(A11Y_KEY, JSON.stringify(a11yPrefs)); }catch(e){}
}
function applyA11yPrefs(){
  const html = document.documentElement;
  const scaleMap = { small: .94, normal: 1, large: 1.1, xlarge: 1.2 };
  html.style.setProperty('--font-scale', scaleMap[a11yPrefs.textSize] || 1);
  html.setAttribute('data-theme', a11yPrefs.theme || 'dark');
  html.classList.toggle('touch-ui', !!a11yPrefs.touchUI);
  html.classList.toggle('labels-on', !!a11yPrefs.labels);
  html.classList.toggle('reduce-motion', !!a11yPrefs.reduceMotion);
  html.classList.toggle('keyboard-nav', !!a11yPrefs.keyboardNav);

  document.querySelectorAll('.a11y-font-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.size === a11yPrefs.textSize));
  document.querySelectorAll('.a11y-mode-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === a11yPrefs.theme));

  // El tamaño de letra y las etiquetas de texto pueden cambiar la altura del
  // header sticky; se reajusta tras el repintado.
  requestAnimationFrame(() => { if (typeof syncHeaderHeightVar === 'function') syncHeaderHeightVar(); });

  const setChecked = (id,val) => {
    const el = document.getElementById(id);
    if(el){ el.checked = !!val; el.setAttribute('aria-checked', !!val ? 'true' : 'false'); }
  };
  setChecked('toggle-touch', a11yPrefs.touchUI);
  setChecked('toggle-labels', a11yPrefs.labels);
  setChecked('toggle-visual-radio', a11yPrefs.visualRadio);
  setChecked('toggle-motion', a11yPrefs.reduceMotion);
  setChecked('toggle-keyboard', a11yPrefs.keyboardNav);

  const panel = document.getElementById('a11y-panel');
  if(panel) panel.setAttribute('aria-hidden', panel.classList.contains('open') ? 'false' : 'true');

  updateRadioVisualState();
}
function setupA11yUI(){
  const fab = document.getElementById('a11y-fab');
  const panel = document.getElementById('a11y-panel');
  const close = document.getElementById('a11y-close');
  if(fab && panel){
    fab.addEventListener('click', () => {
      panel.classList.add('open');
      panel.setAttribute('aria-hidden','false');
    });
  }
  if(close && panel){
    close.addEventListener('click', () => {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden','true');
    });
  }
  document.querySelectorAll('.a11y-font-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      a11yPrefs.textSize = btn.dataset.size;
      saveA11yPrefs(); applyA11yPrefs();
    });
  });
  document.querySelectorAll('.a11y-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      a11yPrefs.theme = btn.dataset.mode;
      saveA11yPrefs(); applyA11yPrefs();
    });
  });
  const bindToggle = (id, key) => {
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener('change', () => {
      a11yPrefs[key] = el.checked;
      saveA11yPrefs(); applyA11yPrefs();
    });
  };
  bindToggle('toggle-touch', 'touchUI');
  bindToggle('toggle-labels', 'labels');
  bindToggle('toggle-visual-radio', 'visualRadio');
  bindToggle('toggle-motion', 'reduceMotion');
  bindToggle('toggle-keyboard', 'keyboardNav');
}
function updateRadioVisualState(){
  const banner = document.getElementById('radio-visual-banner');
  const txt = document.getElementById('rvb-text');
  if(!banner) return;
  const visible = !!a11yPrefs.visualRadio && isRadioVisible() && isRadioPlaying();
  banner.classList.toggle('visible', visible);
  if(txt) txt.textContent = `Reproduciendo: ${getCurrentTrackTitle()}`;
  document.body.classList.toggle('radio-active', isRadioVisible() && isRadioPlaying());
}
// History UX for mobile back gesture
let _uiHistoryDepth = 0;
function pushUiState(kind){
  try{
    history.pushState({albumUI:true, kind}, '');
    _uiHistoryDepth++;
  }catch(e){}
}
window.addEventListener('popstate', (e) => {
  const overlay = document.getElementById('country-overlay');
  const pdf = document.getElementById('pdf-modal');
  const reset = document.getElementById('reset-modal');
  const a11y = document.getElementById('a11y-panel');
  if(overlay && overlay.classList.contains('open')){ closeOverlay(); return; }
  if(pdf && pdf.classList.contains('visible')){ hidePdfModal(); return; }
  if(reset && reset.classList.contains('visible')){ reset.classList.remove('visible'); return; }
  if(a11y && a11y.classList.contains('open')){ a11y.classList.remove('open'); a11y.setAttribute('aria-hidden','true'); return; }
  // Cierra drawers móviles (drawer de amigos o bottom sheet de chat) con el botón atrás
  const mobSocial  = document.querySelector('.social-panel.friends-panel');
  const mobChat    = document.querySelector('.social-panel.chat-panel');
  const mobBackdrop = document.getElementById('mob-backdrop');
  if (mobSocial?.classList.contains('mob-open') || mobChat?.classList.contains('mob-chat-open')) {
    mobSocial?.classList.remove('mob-open');
    mobChat?.classList.remove('mob-chat-open');
    mobBackdrop?.classList.remove('mob-backdrop-visible');
    return;
  }
});
loadA11yPrefs();
setupA11yUI();
applyA11yPrefs();
saveA11yPrefs();

// ── Campana de notificaciones ──────────────────────
function updateNotifBell(notifs) {
  const count = notifs.filter(n => !n.read).length;
  const bell  = document.getElementById('notif-bell');
  const badge = document.getElementById('notif-badge');
  const panel = document.getElementById('notif-panel-body');
  if (badge) {
    badge.textContent = count > 9 ? '9+' : count;
    badge.style.display = count > 0 ? '' : 'none';
  }
  if (panel && document.getElementById('notif-panel')?.classList.contains('open')) {
    renderNotifPanel(panel, notifs);
    bindNotifPanel(panel);
  }
}

// Navega al post referenciado en una notificación:
// cierra el panel, cierra overlays, hace scroll al post y abre comentarios.
function navigateToPost(postId) {
  // 1. Cerrar panel de notificaciones
  document.getElementById('notif-panel')?.classList.remove('open');

  // 2. Cerrar cualquier sección abierta
  window.closeAllOverlays();

  // 3. Buscar el post en el DOM
  const postEl = document.querySelector(`.feed-post[data-post-id="${postId}"]`);
  if (!postEl) {
    // El post no está en el feed visible — mostrar aviso
    const toast = document.createElement('div');
    toast.className = 'feed-toast';
    toast.textContent = 'El post no está visible en el feed actual';
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
    return;
  }

  // 4. Scroll al post con offset del header
  const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 120;
  const top = postEl.getBoundingClientRect().top + window.scrollY - headerH - 12;
  window.scrollTo({ top, behavior: 'smooth' });

  // 5. Resaltar el post brevemente
  postEl.classList.add('post-highlight');
  setTimeout(() => postEl.classList.remove('post-highlight'), 2200);

  // 6. Abrir la sección de comentarios si no está abierta
  setTimeout(() => {
    const commentsSection = document.getElementById('feed-comments-' + postId);
    if (commentsSection && commentsSection.style.display === 'none') {
      postEl.querySelector('.comment-toggle-btn')?.click();
    }
  }, 600);
}

function bindNotifPanel(panel) {
  // Marcar leída al hacer clic — y navegar al post si aplica
  panel.querySelectorAll('.notif-item').forEach(el => {
    el.addEventListener('click', () => {
      markRead(el.dataset.notifId);
      const postId = el.dataset.postId;
      if (postId) navigateToPost(postId);
    });
  });
  // Eliminar
  panel.querySelectorAll('.notif-item-del').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      deleteNotificacion(btn.dataset.del);
    });
  });
  // Aceptar/rechazar intercambio
  panel.querySelectorAll('.notif-action-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const accept = btn.dataset.action === 'accept';
      btn.disabled = true;
      const { respondExchangeRequest } = await import('./intercambios.js');
      await respondExchangeRequest(btn.dataset.id, accept, currentUser?.id);
      btn.closest('.notif-item-actions').innerHTML = accept ? '✅ Aceptado' : '❌ Rechazado';
    });
  });
}

// Bell toggle
document.getElementById('notif-bell')?.addEventListener('click', () => {
  const panel = document.getElementById('notif-panel');
  if (!panel) return;
  const isOpen = panel.classList.toggle('open');
  if (isOpen) {
    markAllRead();
    const body = panel.querySelector('#notif-panel-body');
    renderNotifPanel(body, getAllNotifs());
    bindNotifPanel(body);
  }
});
document.addEventListener('click', e => {
  const panel = document.getElementById('notif-panel');
  const bell  = document.getElementById('notif-bell');
  if (panel?.classList.contains('open') && !panel.contains(e.target) && e.target !== bell) {
    panel.classList.remove('open');
  }
});


// ── Navegación: header siempre visible ─────────────
// Cierra TODOS los overlays de sección. Llamar antes de abrir cualquier sección.
window.closeAllOverlays = function closeAllOverlays() {
  document.getElementById('coleccionismo-overlay')?.classList.remove('visible');
  document.getElementById('amigos-overlay')?.classList.remove('visible');
  document.getElementById('calendar-overlay')?.classList.remove('visible');
  // Mundiales: usar closeMundiales si existe (limpia audio y estado interno)
  if (typeof window.closeMundiales === 'function') {
    window.closeMundiales();
  } else {
    document.getElementById('mundiales-overlay')?.classList.remove('visible');
  }
  document.body.style.overflow = '';
};

// Vuelve a Grada (feed) cerrando todo
function goHome() {
  window.closeAllOverlays();
  window.scrollTo({ top: 0, behavior: a11yPrefs.reduceMotion ? 'auto' : 'smooth' });
  document.dispatchEvent(new CustomEvent('gradaGoHome'));
}
window.goHome = goHome;
document.getElementById('btn-home')?.addEventListener('click', goHome);

// Intercepción de cada botón de sección en fase CAPTURA (antes del onclick).
// Garantiza que closeAllOverlays se ejecute en TODOS los navegadores de escritorio
// y móvil, sin depender de optional chaining en atributos HTML.
[
  'btn-coleccionismo',
  'btn-mundiales-header',
  'btn-calendario-header',
  'btn-talentos',
  'btn-amigos',
].forEach(function(id) {
  document.getElementById(id)?.addEventListener('click', function() {
    window.closeAllOverlays();
  }, true /* capture: se ejecuta antes del onclick nativo */);
});

// El header es sticky; los overlays necesitan saber su altura real (varía por
// viewport vía clamp()) para no quedar tapados debajo de él.
function syncHeaderHeightVar() {
  const header = document.getElementById('app-header');
  if (!header) return;
  document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
}
syncHeaderHeightVar();
window.addEventListener('resize', () => {
  clearTimeout(window._headerHResizeT);
  window._headerHResizeT = setTimeout(syncHeaderHeightVar, 150);
});

document.getElementById('compose-fab')?.addEventListener('click', () => {
  openComposeModal(currentUser?.id || null);
});

// Botón intercambios
document.getElementById('btn-intercambios')?.addEventListener('click', () => {
  if (!currentUser) return;
  openIntercambiosModal(currentUser.id, _profilesCache);
});

// Botón Talentos Ocultos
document.getElementById('btn-talentos')?.addEventListener('click', () => {
  openTalentosOcultosModal();
});

// COUNTDOWN INAUGURAL eliminado — evento pasado (11 Jun 2026)

// ════════════ CÓDIGOS PANINI ════════════
(function initPaniniCodes() {
  const CODES = [
    'COKEFWC26','MAILWC26GIFT','ALLTHEFEELS26','FEELITALL26',
    'PANINIFWC26','COKEPANINI26','GIFTWC26PACK','PLAYWC26NOW',
    'ALBUMPANINI26','COCACOLAFANS','PANINICOLLECT','FIFA2026PLAY',
    'ALLTHEFEELS','WC26PANIAPP'
  ];

  // ── Inject trigger button into #controls ──
  const controls = document.getElementById('controls');
  if (controls) {
    const triggerBtn = document.createElement('button');
    triggerBtn.className = 'action-btn';
    triggerBtn.id = 'btn-codes';
    triggerBtn.setAttribute('aria-label', 'Ver códigos Panini');
    triggerBtn.innerHTML = '🎫 <span class="btn-label">Códigos</span>';
    // Insert before #btn-reset
    const resetBtn = document.getElementById('btn-reset');
    if (resetBtn) controls.insertBefore(triggerBtn, resetBtn);
    else controls.appendChild(triggerBtn);
  }

  // ── Build modal ──
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'codes-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Códigos promocionales Panini');

  modal.innerHTML = `
    <div class="modal-box">
      <div class="codes-mhead">
        <div>
          <h2>🎫 CÓDIGOS PANINI</h2>
          <p class="codes-msub" style="padding:4px 0 0;margin:0">Panini &amp; FIFA · ${CODES.length} códigos disponibles</p>
        </div>
        <button class="codes-mclose" id="codes-close" aria-label="Cerrar">✕</button>
      </div>
      <div class="codes-warn">
        <span class="codes-warn-icon">⚠ï¸</span>
        <span><strong>Un solo uso por cuenta.</strong> Una vez canjeado, el código queda desactivado para esa cuenta. Úsalos en la app oficial de Panini o FIFA.</span>
      </div>
      <div class="codes-scroll">
        <div class="codes-grid">
          ${CODES.map(c => `
            <div class="code-card">
              <span class="code-txt">${c}</span>
              <button class="code-copy" data-code="${c}" aria-label="Copiar código ${c}">📋 Copiar</button>
            </div>`).join('')}
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // ── Open / Close ──
  const open  = () => modal.classList.add('visible');
  const close = () => modal.classList.remove('visible');

  document.getElementById('btn-codes')?.addEventListener('click', open);
  document.getElementById('codes-close').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('visible')) close(); });

  // ── Copy buttons ──
  modal.querySelectorAll('.code-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.dataset.code;
      const restore = () => { btn.textContent = '📋 Copiar'; btn.classList.remove('copied'); };
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = '✅ Copiado'; btn.classList.add('copied');
        setTimeout(restore, 2200);
      }).catch(() => {
        const ta = Object.assign(document.createElement('textarea'), {value: code});
        Object.assign(ta.style, {position:'fixed', opacity:'0'});
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
        btn.textContent = '✅ Copiado'; btn.classList.add('copied');
        setTimeout(restore, 2200);
      });
    });
  });
})();
