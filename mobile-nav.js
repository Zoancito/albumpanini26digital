/**
 * mobile-nav.js
 * Lógica de navegación móvil para Grada.
 * Depende de responsive.css — cargar después de todos los módulos ES.
 * NO usar type="module" para que los IDs del DOM ya existan al ejecutarse.
 *
 * En index.html, justo antes de </body>:
 *   <script src="mobile-nav.js"></script>
 */

(function () {
  'use strict';

  // Solo activo en móvil
  const BREAKPOINT = 860;
  if (window.innerWidth > BREAKPOINT) return;

  /* ─── Referencias al DOM existente ─── */
  const socialPanel = document.querySelector('.social-panel.friends-panel');
  const chatPanel   = document.querySelector('.social-panel.chat-panel');

  if (!socialPanel || !chatPanel) return; // seguridad

  /* ─── 1. Crear backdrop ─── */
  const backdrop = document.createElement('div');
  backdrop.id = 'mob-backdrop';
  document.body.appendChild(backdrop);

  /* ─── 2. Crear barra de tabs ─── */
  const tabBar = document.createElement('nav');
  tabBar.id = 'mob-tab-bar';
  tabBar.setAttribute('aria-label', 'Navegación principal');
  tabBar.innerHTML = `
    <button class="mob-tab active" data-tab="feed" aria-label="Feed">
      <span class="mob-tab-icon" aria-hidden="true">⚽</span>
      Feed
    </button>
    <button class="mob-tab" data-tab="amigos" aria-label="Amigos">
      <span class="mob-tab-icon" aria-hidden="true">👥</span>
      Amigos
    </button>
    <button class="mob-tab" data-tab="chat" aria-label="Chat">
      <span class="mob-tab-icon" aria-hidden="true">💬</span>
      <span class="mob-tab-badge" id="mob-chat-badge" aria-label="mensajes no leídos"></span>
      Chat
    </button>
    <button class="mob-tab" data-tab="coleccion" aria-label="Álbum">
      <span class="mob-tab-icon" aria-hidden="true">📋</span>
      Álbum
    </button>
    <button class="mob-tab" data-tab="historia" aria-label="Historia">
      <span class="mob-tab-icon" aria-hidden="true">📜</span>
      Historia
    </button>
  `;
  document.body.appendChild(tabBar);

  /* ─── 3. Helpers ─── */
  const allTabs = () => tabBar.querySelectorAll('.mob-tab');

  function setActiveTab(tabName) {
    allTabs().forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
  }

  function closeAll() {
    socialPanel.classList.remove('mob-open');
    chatPanel.classList.remove('mob-chat-open');
    backdrop.classList.remove('mob-backdrop-visible');
  }

  function openAmigos() {
    closeAll();
    socialPanel.classList.add('mob-open');
    backdrop.classList.add('mob-backdrop-visible');
    setActiveTab('amigos');
  }

  function openChat() {
    closeAll();
    chatPanel.classList.add('mob-chat-open');
    backdrop.classList.add('mob-backdrop-visible');
    setActiveTab('chat');
    // Scroll al último mensaje con un pequeño delay para la animación CSS
    setTimeout(() => {
      const msgs = chatPanel.querySelector('.chat-messages');
      if (msgs) msgs.scrollTo({ top: msgs.scrollHeight, behavior: 'smooth' });
    }, 340);
  }

  function goToFeed() {
    closeAll();
    setActiveTab('feed');
    // Scroll suave al inicio del feed
    const feed = document.querySelector('.album-main');
    if (feed) feed.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ─── 4. Click en tabs ─── */
  tabBar.addEventListener('click', e => {
    const btn = e.target.closest('.mob-tab');
    if (!btn) return;
    const tab = btn.dataset.tab;

    switch (tab) {
      case 'feed':
        goToFeed();
        break;

      case 'amigos':
        openAmigos();
        break;

      case 'chat':
        openChat();
        break;

      case 'coleccion':
        closeAll();
        setActiveTab('coleccion');
        // Abre el overlay de coleccionismo existente
        const colOverlay = document.getElementById('coleccionismo-overlay');
        if (colOverlay) colOverlay.classList.add('visible');
        break;

      case 'historia':
        closeAll();
        setActiveTab('historia');
        // Llama la función global openMundiales() si existe
        if (typeof window.openMundiales === 'function') {
          window.openMundiales();
        }
        break;
    }
  });

  /* ─── 5. Cerrar al tocar backdrop ─── */
  backdrop.addEventListener('click', () => {
    goToFeed();
  });

  /* ─── 6. Escuchar evento del chat (disparado desde amigos.js) ─── */
  document.addEventListener('gradaChatOpened', () => {
    if (window.innerWidth > BREAKPOINT) return;
    openChat();
  });

  /* ─── 6b. Escuchar goHome desde script.js — resetea tab a "feed" ─── */
  document.addEventListener('gradaGoHome', () => {
    if (window.innerWidth > BREAKPOINT) return;
    closeAll();
    setActiveTab('feed');
  });

  /* ─── 7. El botón Amigos del header-nav existente también abre el drawer ─── */
  const btnAmigos = document.getElementById('btn-amigos');
  if (btnAmigos) {
    btnAmigos.addEventListener('click', () => {
      if (window.innerWidth <= BREAKPOINT) openAmigos();
    });
  }

  /* ─── 8. Sincronizar badge de mensajes no leídos ───
     El sistema de notificaciones existente actualiza #notif-badge.
     Aquí miramos ese elemento y replicamos el número en el tab de Chat.
  ── */
  const mobChatBadge = document.getElementById('mob-chat-badge');
  const notifBadge   = document.getElementById('notif-badge');

  function syncChatBadge() {
    if (!mobChatBadge) return;
    // Revisa el badge de mensajes no leídos del chat (ajusta el selector
    // al elemento que tu JS ya actualiza cuando llegan mensajes nuevos)
    const chatUnread = document.querySelector('.chat-unread-badge');
    const count = chatUnread
      ? parseInt(chatUnread.textContent || '0', 10)
      : 0;
    if (count > 0) {
      mobChatBadge.textContent = count > 9 ? '9+' : count;
      mobChatBadge.classList.add('has-badge');
    } else {
      mobChatBadge.textContent = '';
      mobChatBadge.classList.remove('has-badge');
    }
  }

  // Observar cambios en el badge existente para sincronizar
  if (notifBadge || document.querySelector('.chat-unread-badge')) {
    const observer = new MutationObserver(syncChatBadge);
    const target = document.querySelector('.chat-unread-badge') || notifBadge;
    if (target) observer.observe(target, { childList: true, characterData: true, subtree: true });
  }

  /* ─── 9. Cerrar drawers con Escape ─── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') goToFeed();
  });

  /* ─── 10. Restaurar layout en resize a escritorio ─── */
  window.addEventListener('resize', () => {
    if (window.innerWidth > BREAKPOINT) {
      closeAll();
      tabBar.style.display = 'none';
    } else {
      tabBar.style.display = '';
    }
  });

  /* ─── 11. Cuando los overlays del coleccionismo/historia se cierran,
      volvemos al tab de feed automáticamente ─── */
  const colClose = document.getElementById('coleccionismo-close');
  const munClose = document.getElementById('mun-close');

  if (colClose) colClose.addEventListener('click', () => setActiveTab('feed'));
  if (munClose) munClose.addEventListener('click', () => setActiveTab('feed'));

})();
