/**
 * mobile-nav.js  (v4)
 * Tab bar + drawers + menú "Más" para Grada en móvil.
 * Cargar SIN type="module", al final del <body>.
 */

(function () {
  'use strict';

  const BREAKPOINT = 860;
  if (window.innerWidth > BREAKPOINT) return;

  const friendsPanel = document.querySelector('.social-panel.friends-panel');
  const chatPanel    = document.querySelector('.social-panel.chat-panel');
  const radioBar     = document.getElementById('radio-bar');
  if (!friendsPanel || !chatPanel) return;

  /* ═══════════════════════════════════════════
     1. BACKDROP
  ═══════════════════════════════════════════ */
  const backdrop = document.createElement('div');
  backdrop.id = 'mob-backdrop';
  document.body.appendChild(backdrop);

  /* ═══════════════════════════════════════════
     2. MENÚ "MÁS" (sheet desde abajo)
  ═══════════════════════════════════════════ */
  const moreSheet = document.createElement('div');
  moreSheet.id = 'mob-more-sheet';
  moreSheet.innerHTML = `
    <div id="mob-more-handle"></div>
    <div id="mob-more-grid">
      <button class="mob-more-item" data-more="album">
        <span class="mob-more-icon">🗂️</span>
        <span>Álbum</span>
      </button>
      <button class="mob-more-item" data-more="historia">
        <span class="mob-more-icon">📜</span>
        <span>Historia</span>
      </button>
      <button class="mob-more-item" data-more="calendario">
        <span class="mob-more-icon">📅</span>
        <span>Calendario</span>
      </button>
      <button class="mob-more-item" data-more="talentos">
        <span class="mob-more-icon">🌟</span>
        <span>Talentos</span>
      </button>
      <button class="mob-more-item" data-more="codigos">
        <span class="mob-more-icon">🎫</span>
        <span>Códigos</span>
      </button>
      <button class="mob-more-item" data-more="intercambios">
        <span class="mob-more-icon">🔄</span>
        <span>Intercambios</span>
      </button>
    </div>
  `;
  document.body.appendChild(moreSheet);

  /* ═══════════════════════════════════════════
     3. TAB BAR
  ═══════════════════════════════════════════ */
  const tabBar = document.createElement('nav');
  tabBar.id = 'mob-tab-bar';
  tabBar.setAttribute('aria-label', 'Navegación principal');
  tabBar.innerHTML = `
    <button class="mob-tab active" data-tab="feed"   aria-label="Feed">
      <span class="mob-tab-icon">⚽</span>Feed
    </button>
    <button class="mob-tab" data-tab="amigos" aria-label="Amigos">
      <span class="mob-tab-icon">👥</span>Amigos
    </button>
    <button class="mob-tab" data-tab="chat"   aria-label="Chat">
      <span class="mob-tab-icon">💬</span>
      <span class="mob-tab-badge" id="mob-chat-badge"></span>Chat
    </button>
    <button class="mob-tab" data-tab="radio"  aria-label="Radio">
      <span class="mob-tab-icon">📻</span>Radio
    </button>
    <button class="mob-tab" data-tab="mas"    aria-label="Más opciones">
      <span class="mob-tab-icon">···</span>Más
    </button>
  `;
  document.body.appendChild(tabBar);

  /* ═══════════════════════════════════════════
     4. ESTADO
  ═══════════════════════════════════════════ */
  let activeTab  = 'feed';
  let radioOpen  = false;
  let moreOpen   = false;

  /* ═══════════════════════════════════════════
     5. HELPERS
  ═══════════════════════════════════════════ */
  function setTab(name) {
    activeTab = name;
    tabBar.querySelectorAll('.mob-tab').forEach(t =>
      t.classList.toggle('active', t.dataset.tab === name)
    );
  }

  function closePanels() {
    friendsPanel.classList.remove('mob-open');
    chatPanel.classList.remove('mob-chat-open');
    backdrop.classList.remove('mob-backdrop-visible');
  }

  function closeMore() {
    moreOpen = false;
    moreSheet.classList.remove('mob-more-open');
  }

  function closeRadio() {
    if (!radioOpen) return;
    radioOpen = false;
    document.body.classList.remove('mob-radio-open');
    if (radioBar) radioBar.classList.remove('visible');
  }

  function closeAll() {
    closePanels();
    closeMore();
    // No cerramos radio al navegar — la música sigue
  }

  /* ── Acciones de cada tab ── */
  function goFeed() {
    closeAll();
    setTab('feed');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goAmigos() {
    closeAll();
    friendsPanel.classList.add('mob-open');
    backdrop.classList.add('mob-backdrop-visible');
    setTab('amigos');
  }

  function goChat() {
    closeAll();
    chatPanel.classList.add('mob-chat-open');
    backdrop.classList.add('mob-backdrop-visible');
    setTab('chat');
    setTimeout(() => {
      const msgs = chatPanel.querySelector('.chat-messages, #chat-messages');
      if (msgs) msgs.scrollTo({ top: msgs.scrollHeight, behavior: 'smooth' });
    }, 320);
  }

  function goRadio() {
    if (radioOpen) {
      // Toggle off — oculta el panel pero la música sigue
      closeRadio();
      setTab('feed');
      return;
    }
    closeAll();
    radioOpen = true;
    document.body.classList.add('mob-radio-open');
    if (radioBar) radioBar.classList.add('visible');
    // Si la radio no estaba iniciada, arranca
    const btnRadio = document.getElementById('btn-radio');
    if (btnRadio && !radioBar?.classList.contains('playing')) btnRadio.click();
    setTab('radio');
  }

  function goMas() {
    if (moreOpen) { closeMore(); setTab(activeTab === 'mas' ? 'feed' : activeTab); return; }
    closePanels();
    moreOpen = true;
    moreSheet.classList.add('mob-more-open');
    backdrop.classList.add('mob-backdrop-visible');
    setTab('mas');
  }

  /* ── Acciones del menú Más ── */
  function handleMore(action) {
    closeMore();
    backdrop.classList.remove('mob-backdrop-visible');
    // Cierra toda sección abierta antes de abrir la nueva
    window.closeAllOverlays?.();

    switch (action) {
      case 'album':
        setTab('mas');
        document.getElementById('coleccionismo-overlay')?.classList.add('visible');
        break;
      case 'historia':
        setTab('mas');
        if (typeof window.openMundiales === 'function') window.openMundiales();
        else document.getElementById('btn-mundiales-header')?.click();
        break;
      case 'calendario':
        setTab('mas');
        if (typeof window.openCalendar === 'function') window.openCalendar();
        else document.getElementById('btn-calendario-header')?.click();
        break;
      case 'talentos':
        setTab('mas');
        document.getElementById('btn-talentos')?.click();
        break;
      case 'codigos':
        setTab('mas');
        document.getElementById('btn-codes')?.click();
        break;
      case 'intercambios':
        setTab('mas');
        document.getElementById('btn-intercambios')?.click();
        break;
    }
  }

  /* ═══════════════════════════════════════════
     6. EVENTOS
  ═══════════════════════════════════════════ */

  // Tab bar
  tabBar.addEventListener('click', e => {
    const btn = e.target.closest('.mob-tab');
    if (!btn) return;
    switch (btn.dataset.tab) {
      case 'feed':   goFeed();   break;
      case 'amigos': goAmigos(); break;
      case 'chat':   goChat();   break;
      case 'radio':  goRadio();  break;
      case 'mas':    goMas();    break;
    }
  });

  // Menú Más
  moreSheet.addEventListener('click', e => {
    const item = e.target.closest('.mob-more-item');
    if (item) handleMore(item.dataset.more);
  });

  // Backdrop
  backdrop.addEventListener('click', () => {
    closeAll();
    setTab('feed');
  });

  // Desde amigos.js — pulsar "Chat" en una tarjeta
  document.addEventListener('gradaChatOpened', () => {
    if (window.innerWidth > BREAKPOINT) return;
    goChat();
  });

  // Desde script.js — goHome()
  document.addEventListener('gradaGoHome', () => {
    if (window.innerWidth > BREAKPOINT) return;
    closeAll();
    closeRadio();
    setTab('feed');
  });

  // Cerrar overlays secundarios → volver a Más activo
  document.getElementById('coleccionismo-close')?.addEventListener('click', () => setTab('feed'));
  document.getElementById('mun-close')?.addEventListener('click',           () => setTab('feed'));

  // Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeAll(); setTab('feed'); }
  });

  // Botón atrás
  window.addEventListener('popstate', () => {
    if (window.innerWidth > BREAKPOINT) return;
    if (moreOpen || friendsPanel.classList.contains('mob-open') ||
        chatPanel.classList.contains('mob-chat-open')) {
      closeAll();
      setTab('feed');
    }
  });

  /* ═══════════════════════════════════════════
     7. BADGE DE MENSAJES NO LEÍDOS
  ═══════════════════════════════════════════ */
  const mobBadge = document.getElementById('mob-chat-badge');

  function syncBadge() {
    if (!mobBadge) return;
    let total = 0;
    document.querySelectorAll('.chat-unread-badge').forEach(el => {
      total += parseInt(el.textContent || '0', 10) || 0;
    });
    mobBadge.textContent = total > 9 ? '9+' : (total || '');
    mobBadge.classList.toggle('has-badge', total > 0);
  }

  const panelBody = document.getElementById('friends-panel-body');
  if (panelBody) {
    new MutationObserver(syncBadge).observe(panelBody, {
      childList: true, subtree: true, characterData: true
    });
  }

  /* ═══════════════════════════════════════════
     8. RESIZE
  ═══════════════════════════════════════════ */
  window.addEventListener('resize', () => {
    if (window.innerWidth > BREAKPOINT) {
      closeAll(); closeRadio();
      tabBar.hidden = true;
      moreSheet.hidden = true;
    } else {
      tabBar.hidden = false;
      moreSheet.hidden = false;
    }
  });

})();
