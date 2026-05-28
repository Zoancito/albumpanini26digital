// ════════════════════════════════════════════════════
//  PREDICCIONES.JS — Mis Predicciones · FIFA World Cup 2026
//  v9b-i · Resultados + Favoritos del Torneo
//  CORRECCIONES: nombres sincronizados con MATCHES,
//  botón por grupo en acordeón, CSS inyectado, picker robusto
// ════════════════════════════════════════════════════

// ── Selecciones: nombres EXACTOS de MATCHES/albumData ──
// Se derivan de MATCHES en runtime para evitar duplicación
function getPredTeams() {
  if (typeof MATCHES === 'undefined') return [];
  const seen = new Set();
  const teams = [];
  MATCHES.forEach(([grp,, hE, h, aE, a]) => {
    if (!seen.has(h)) { seen.add(h); teams.push({grp, e:hE, n:h}); }
    if (!seen.has(a)) { seen.add(a); teams.push({grp, e:aE, n:a}); }
  });
  return teams;
}

// ── Configuración de roles ─────────────────────────
const PRED_ROLES = [
  {id:'champion',       icon:'🏆', label:'Campeón',    color:'#f5c518',
   max:1, desc:'La selección que levantará la Copa'},
  {id:'candidates',     icon:'⭐', label:'Candidatas', color:'#60a5fa',
   max:3, desc:'Favoritas para llegar lejos (máx. 3)'},
  {id:'surprises',      icon:'🎯', label:'Sorpresas',  color:'#34d399',
   max:3, desc:'Equipos que irán más lejos de lo esperado (máx. 3)'},
  {id:'disappointments',icon:'💔', label:'Decepciones',color:'#f87171',
   max:3, desc:'Equipos que decepcionarán al mundo (máx. 3)'},
];

// ── Storage ───────────────────────────────────────
const SK_SC = 'wc2026_scores';
const SK_RL = 'wc2026_roles';

function loadSc() {
  try { return JSON.parse(localStorage.getItem(SK_SC)) || {}; } catch { return {}; }
}
function saveSc(d) { localStorage.setItem(SK_SC, JSON.stringify(d)); }
function loadRl() {
  const def = {champion:null, candidates:[], surprises:[], disappointments:[]};
  try { return Object.assign(def, JSON.parse(localStorage.getItem(SK_RL)) || {}); } catch { return def; }
}
function saveRl(d) { localStorage.setItem(SK_RL, JSON.stringify(d)); }

// ── State ─────────────────────────────────────────
let predGrp  = 'A';
let predTab  = 'matches';
let sc       = {};
let rl       = {};

// ── Helpers ───────────────────────────────────────
// ID estable para cada partido: usa índice en MATCHES
function mid(m) {
  // m = [grp, utcMs, hE, h, aE, a, venue]
  return `${m[0]}_${m[3].replace(/\s/g,'_')}_vs_${m[5].replace(/\s/g,'_')}`;
}
function countPred() {
  if (typeof MATCHES === 'undefined') return 0;
  return MATCHES.filter(m => {
    const s = sc[mid(m)];
    return s && s.h != null && s.a != null;
  }).length;
}
function getArr(obj, id) {
  const v = obj[id];
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

// ── Stats bar ─────────────────────────────────────
function updPredStats() {
  const n = countPred();
  const el = document.getElementById('pred-count');
  if (el) el.textContent = `${n} / 72 predichos`;
}

// ── Group tabs (matches) ───────────────────────────
function renderPredGrpTabs() {
  const wrap = document.getElementById('pred-grp-tabs');
  if (!wrap || typeof MATCHES === 'undefined') return;
  wrap.innerHTML = '';
  'ABCDEFGHIJKL'.split('').forEach(g => {
    const done = MATCHES.filter(m => m[0] === g)
      .filter(m => { const s = sc[mid(m)]; return s && s.h != null && s.a != null; }).length;
    const btn = document.createElement('button');
    btn.className = 'pred-grp-tab' + (g === predGrp ? ' active' : '');
    btn.setAttribute('aria-label', `Grupo ${g}`);
    btn.innerHTML = `<span class="pred-grp-letter">Grupo ${g}</span>
      <span class="pred-grp-pill${done === 6 ? ' done' : ''}">${done === 6 ? '✓' : `${done}/6`}</span>`;
    btn.addEventListener('click', () => { predGrp = g; renderPredGrpTabs(); renderPredMatchList(); });
    wrap.appendChild(btn);
  });
}

// ── Match list ────────────────────────────────────
function renderPredMatchList() {
  const list = document.getElementById('pred-match-list');
  if (!list || typeof MATCHES === 'undefined') return;
  list.innerHTML = '';
  const now = Date.now();

  MATCHES.filter(m => m[0] === predGrp).forEach(m => {
    const [g, utcMs, hE, h, aE, a, venue] = m;
    const id      = mid(m);
    const s       = sc[id] || {};
    const locked  = utcMs <= now;
    const bothSet = s.h != null && s.a != null;

    let resultTxt = '', resultClr = '';
    if (bothSet) {
      if (s.h > s.a)      { resultTxt = `Victoria ${hE} ${h}`;  resultClr = '#34d399'; }
      else if (s.h < s.a) { resultTxt = `Victoria ${aE} ${a}`;  resultClr = '#60a5fa'; }
      else                 { resultTxt = 'Empate';               resultClr = '#f5c518'; }
    }

    const card = document.createElement('div');
    card.className = `pred-match-card${locked?' locked':''}${bothSet?' predicted':''}`;
    card.innerHTML = `
      <div class="pred-match-venue">${venue.split(',')[0]}</div>
      <div class="pred-match-row">
        <div class="pred-team-blk pred-home">
          <span class="pred-flag">${hE}</span>
          <span class="pred-name">${h}</span>
        </div>
        <div class="pred-score-blk">
          ${locked
            ? `<div class="pred-locked">🔒<span class="pred-locked-lbl">Partido iniciado</span></div>`
            : `<div class="pred-counter">
                <button class="pred-cc minus" data-id="${id}" data-side="h" aria-label="Restar gol local">−</button>
                <span class="pred-cv" id="ph-${id}">${s.h != null ? s.h : '?'}</span>
                <button class="pred-cc plus"  data-id="${id}" data-side="h" aria-label="Sumar gol local">+</button>
              </div>
              <span class="pred-sep">:</span>
              <div class="pred-counter">
                <button class="pred-cc minus" data-id="${id}" data-side="a" aria-label="Restar gol visitante">−</button>
                <span class="pred-cv" id="pa-${id}">${s.a != null ? s.a : '?'}</span>
                <button class="pred-cc plus"  data-id="${id}" data-side="a" aria-label="Sumar gol visitante">+</button>
              </div>`
          }
        </div>
        <div class="pred-team-blk pred-away">
          <span class="pred-name">${a}</span>
          <span class="pred-flag">${aE}</span>
        </div>
      </div>
      ${bothSet && !locked ? `<div class="pred-result" style="color:${resultClr}">${resultTxt}</div>` : ''}
    `;

    if (!locked) {
      card.querySelectorAll('.pred-cc').forEach(btn => {
        btn.addEventListener('click', () => {
          const sid  = btn.dataset.id;
          const side = btn.dataset.side;
          const dir  = btn.classList.contains('plus') ? 1 : -1;
          if (!sc[sid]) sc[sid] = {};
          const curVal = sc[sid][side];
          if (curVal == null) {
            sc[sid][side] = dir > 0 ? 0 : null;
          } else if (curVal === 0 && dir < 0) {
            sc[sid][side] = null; // vuelve a ?
          } else {
            sc[sid][side] = Math.max(0, Math.min(20, curVal + dir));
          }
          saveSc(sc);

          const vEl = card.querySelector(`#p${side}-${sid}`);
          if (vEl) vEl.textContent = sc[sid][side] != null ? sc[sid][side] : '?';

          const both = sc[sid].h != null && sc[sid].a != null;
          card.classList.toggle('predicted', both);

          let rb = card.querySelector('.pred-result');
          if (both) {
            const sv = sc[sid];
            let rt = '', rc = '';
            if (sv.h > sv.a)      { rt = `Victoria ${hE} ${h}`; rc = '#34d399'; }
            else if (sv.h < sv.a) { rt = `Victoria ${aE} ${a}`; rc = '#60a5fa'; }
            else                   { rt = 'Empate';              rc = '#f5c518'; }
            if (rb) { rb.textContent = rt; rb.style.color = rc; }
            else {
              rb = document.createElement('div');
              rb.className = 'pred-result'; rb.style.color = rc; rb.textContent = rt;
              card.appendChild(rb);
            }
          } else if (rb) rb.remove();

          updPredStats(); renderPredGrpTabs();
        });
      });
    }
    list.appendChild(card);
  });
}

// ── Tournament tab ────────────────────────────────
function renderPredTournament() {
  const view = document.getElementById('pred-tournament-view');
  if (!view) return;
  rl = loadRl();
  view.innerHTML = '';

  PRED_ROLES.forEach(role => {
    const cur  = getArr(rl, role.id);
    const full = cur.length >= role.max;
    const card = document.createElement('div');
    card.className = 'pred-role-card';
    card.style.setProperty('--rc', role.color);

    const PRED_TEAMS = getPredTeams();
    const chips = cur.map(name => {
      const t = PRED_TEAMS.find(t => t.n === name);
      return `<div class="pred-chip">
        <span class="pred-chip-flag">${t ? t.e : '🏳'}</span>
        <span class="pred-chip-name">${name}</span>
        <button class="pred-chip-rm" data-role="${role.id}" data-team="${name}" aria-label="Quitar ${name}">✕</button>
      </div>`;
    }).join('');

    card.innerHTML = `
      <div class="pred-role-hd">
        <span class="pred-role-ico">${role.icon}</span>
        <div class="pred-role-info">
          <div class="pred-role-lbl">${role.label}</div>
          <div class="pred-role-dsc">${role.desc}</div>
        </div>
        <div class="pred-role-cnt" style="color:${role.color}">${cur.length}/${role.max}</div>
      </div>
      <div class="pred-chips">${chips || `<span class="pred-chips-empty">Sin selección aún</span>`}</div>
      ${!full
        ? `<button class="pred-role-add" data-role="${role.id}" style="border-color:${role.color};color:${role.color}">
            + Añadir selección
           </button>`
        : ''}
    `;

    card.querySelectorAll('.pred-chip-rm').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const rid = btn.dataset.role;
        const tm  = btn.dataset.team;
        if (PRED_ROLES.find(r => r.id === rid)?.max === 1) rl[rid] = null;
        else rl[rid] = getArr(rl, rid).filter(t => t !== tm);
        saveRl(rl); renderPredTournament();
      });
    });

    const addBtn = card.querySelector('.pred-role-add');
    if (addBtn) addBtn.addEventListener('click', () => openPicker(role.id));

    view.appendChild(card);
  });
}

// ── Team picker ───────────────────────────────────
function openPicker(roleId) {
  const role = PRED_ROLES.find(r => r.id === roleId);
  const picker = document.getElementById('pred-picker');
  if (!picker || !role) return;
  rl = loadRl();
  const cur = getArr(rl, roleId);
  const PRED_TEAMS = getPredTeams();

  // Agrupar por grupo
  const byGrp = {};
  PRED_TEAMS.forEach(t => {
    if (!byGrp[t.grp]) byGrp[t.grp] = [];
    byGrp[t.grp].push(t);
  });

  let inner = `
    <div class="pkr-header">
      <button class="pkr-close" id="pkr-close" aria-label="Cerrar selector">✕</button>
      <div class="pkr-title">${role.icon} ${role.label}</div>
      <div class="pkr-sub" style="color:${role.color}">${cur.length} / ${role.max} seleccionados</div>
    </div>
    <div class="pkr-body">
  `;

  'ABCDEFGHIJKL'.split('').forEach(grp => {
    const teams = byGrp[grp];
    if (!teams) return;
    inner += `<div class="pkr-grp"><div class="pkr-grp-lbl">Grupo ${grp}</div><div class="pkr-grp-teams">`;
    teams.forEach(t => {
      const sel = cur.includes(t.n);
      const dis = !sel && cur.length >= role.max;
      inner += `<button class="pkr-team${sel?' sel':''}${dis?' dis':''}"
        data-team="${t.n}" data-role="${roleId}"
        aria-label="${t.n}" aria-pressed="${sel}" ${dis?'disabled':''}>
        <span class="pkr-flag">${t.e}</span>
        <span class="pkr-name">${t.n}</span>
        ${sel?'<span class="pkr-check" aria-hidden="true">✓</span>':''}
      </button>`;
    });
    inner += `</div></div>`;
  });

  inner += '</div>';
  // Wrapper necesario para que max-height + flex funcionen y pkr-body pueda hacer scroll
  picker.innerHTML = `<div class="pkr-sheet">${inner}</div>`;
  picker.classList.add('visible');

  document.getElementById('pkr-close').addEventListener('click', closePicker);

  picker.querySelectorAll('.pkr-team:not(.dis)').forEach(btn => {
    btn.addEventListener('click', () => {
      const tm   = btn.dataset.team;
      const rid  = btn.dataset.role;
      const rdef = PRED_ROLES.find(r => r.id === rid);
      const c2   = getArr(rl, rid);
      if (rdef.max === 1) {
        rl[rid] = c2.includes(tm) ? null : tm;
      } else {
        rl[rid] = c2.includes(tm)
          ? c2.filter(x => x !== tm)
          : (c2.length < rdef.max ? [...c2, tm] : c2);
      }
      saveRl(rl);
      closePicker();
      renderPredTournament();
    });
  });
}

function closePicker() {
  document.getElementById('pred-picker')?.classList.remove('visible');
}

// ── Tab switching ─────────────────────────────────
function switchPredTab(tab) {
  predTab = tab;
  document.querySelectorAll('#pred-overlay .pred-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab));
  const mv = document.getElementById('pred-matches-view');
  const tv = document.getElementById('pred-tournament-view');
  if (tab === 'matches') {
    mv && (mv.hidden = false);
    tv && (tv.hidden = true);
    renderPredGrpTabs(); renderPredMatchList();
  } else {
    mv && (mv.hidden = true);
    tv && (tv.hidden = false);
    renderPredTournament();
  }
}

// ── Inject HTML ───────────────────────────────────
function injectPredHTML() {
  // ① Botón en #controls (antes de btn-reset)
  const controls = document.getElementById('controls');
  if (controls && !document.getElementById('btn-pred')) {
    const btn = document.createElement('button');
    btn.className = 'action-btn'; btn.id = 'btn-pred';
    btn.setAttribute('aria-label', 'Mis predicciones');
    btn.innerHTML = '🎯 <span class="btn-label">Predicciones</span>';
    btn.addEventListener('click', () => openPredicciones());
    const reset = document.getElementById('btn-reset');
    reset ? controls.insertBefore(btn, reset) : controls.appendChild(btn);
  }

  // ② Overlay principal
  if (!document.getElementById('pred-overlay')) {
    const ov = document.createElement('div');
    ov.id = 'pred-overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'Mis Predicciones Mundial 2026');
    ov.innerHTML = `
      <div class="pred-header">
        <button class="pred-back" id="pred-close" aria-label="Volver">← Volver</button>
        <div class="pred-header-titles">
          <div class="pred-eyebrow">Panini · Tus Predicciones</div>
          <h2 class="pred-title">MIS <span>PREDICCIONES</span></h2>
        </div>
        <div class="pred-header-stat" id="pred-count">0 / 72 predichos</div>
      </div>
      <div class="pred-tabs-row">
        <button class="pred-tab active" data-tab="matches">⚽ Resultados</button>
        <button class="pred-tab" data-tab="tournament">🏆 Favoritos del Torneo</button>
      </div>
      <div class="pred-body">
        <div id="pred-matches-view">
          <div class="pred-grp-tabs" id="pred-grp-tabs"></div>
          <div id="pred-match-list"></div>
        </div>
        <div id="pred-tournament-view" hidden></div>
      </div>
    `;
    document.body.appendChild(ov);
  }

  // ③ Picker (capa sobre overlay)
  if (!document.getElementById('pred-picker')) {
    const pk = document.createElement('div');
    pk.id = 'pred-picker';
    pk.setAttribute('role', 'dialog');
    pk.setAttribute('aria-modal', 'true');
    pk.setAttribute('aria-label', 'Seleccionar selección');
    document.body.appendChild(pk);
  }
}

// ── Botón por grupo: se inyecta al renderizar el acordeón ──
// Se llama desde script.js → renderGroups después de que se crea el group-header
// Usamos un MutationObserver para detectar nuevos acordeones y añadir el botón.
function hookGroupButtons() {
  const container = document.getElementById('groups-container');
  if (!container) return;

  function addBtnToAccordion(acc) {
    const hdr = acc.querySelector('.group-header');
    if (!hdr || hdr.querySelector('.pred-grp-btn')) return;
    const grp = hdr.dataset.grp;
    if (!grp || grp === 'INTRO') return;

    // Contar predicciones del grupo
    const done = typeof MATCHES !== 'undefined'
      ? MATCHES.filter(m => m[0] === grp)
          .filter(m => { const s = sc[mid(m)]; return s && s.h != null && s.a != null; }).length
      : 0;

    const btn = document.createElement('button');
    btn.className = 'pred-grp-btn';
    btn.setAttribute('aria-label', `Predicciones Grupo ${grp}`);
    btn.title = 'Mis predicciones de este grupo';
    btn.innerHTML = `🎯 <span class="pred-grp-btn-badge${done===6?' done':''}">${done===6?'✓':`${done}/6`}</span>`;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openPredicciones(grp);
    });

    // Insertar antes del chevron
    const chevron = hdr.querySelector('.group-chevron');
    chevron ? hdr.insertBefore(btn, chevron) : hdr.appendChild(btn);
  }

  // Observar cambios en el contenedor
  const obs = new MutationObserver(muts => {
    muts.forEach(mu => {
      mu.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        if (node.classList.contains('group-accordion')) addBtnToAccordion(node);
        node.querySelectorAll?.('.group-accordion').forEach(addBtnToAccordion);
      });
    });
    // Actualizar badges de acordeones existentes
    document.querySelectorAll('.group-accordion').forEach(addBtnToAccordion);
  });
  obs.observe(container, { childList: true, subtree: false });

  // Procesar los que ya existen
  container.querySelectorAll('.group-accordion').forEach(addBtnToAccordion);
}

// ── Open / Close ──────────────────────────────────
window.openPredicciones = function (grpFocus) {
  sc = loadSc(); rl = loadRl();
  const ov = document.getElementById('pred-overlay');
  if (!ov) return;

  if (grpFocus && 'ABCDEFGHIJKL'.includes(grpFocus)) {
    predGrp = grpFocus;
    predTab = 'matches';
  }

  ov.classList.add('visible');
  document.body.style.overflow = 'hidden';

  document.querySelectorAll('#pred-overlay .pred-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === predTab));
  const mv = document.getElementById('pred-matches-view');
  const tv = document.getElementById('pred-tournament-view');
  if (predTab === 'matches') {
    mv && (mv.hidden = false); tv && (tv.hidden = true);
    renderPredGrpTabs(); renderPredMatchList();
  } else {
    mv && (mv.hidden = true); tv && (tv.hidden = false);
    renderPredTournament();
  }
  updPredStats();
};

function closePredicciones() {
  closePicker();
  document.getElementById('pred-overlay')?.classList.remove('visible');
  document.body.style.overflow = '';
  // Actualizar badges de grupos al cerrar
  document.querySelectorAll('.pred-grp-btn').forEach(btn => {
    const hdr = btn.closest('.group-header');
    if (!hdr) return;
    const grp = hdr.dataset.grp;
    const done = typeof MATCHES !== 'undefined'
      ? MATCHES.filter(m => m[0] === grp)
          .filter(m => { const s = sc[mid(m)]; return s && s.h != null && s.a != null; }).length
      : 0;
    const badge = btn.querySelector('.pred-grp-btn-badge');
    if (badge) {
      badge.textContent = done === 6 ? '✓' : `${done}/6`;
      badge.classList.toggle('done', done === 6);
    }
  });
}

window.openPredWelcome = window.openPredicciones;

// ── Init ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  sc = loadSc(); rl = loadRl();
  injectPredHTML();

  // Tab clicks
  document.addEventListener('click', e => {
    const tb = e.target.closest('#pred-overlay .pred-tab');
    if (tb) { switchPredTab(tb.dataset.tab); return; }
    if (e.target.id === 'pred-close' || e.target.closest('#pred-close')) closePredicciones();
  });

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (document.getElementById('pred-picker')?.classList.contains('visible')) { closePicker(); return; }
    if (document.getElementById('pred-overlay')?.classList.contains('visible')) closePredicciones();
  });

  // Click fuera del picker (en el fondo)
  document.addEventListener('click', e => {
    if (e.target.id === 'pred-picker') closePicker();
  });

  // Hookeamos los botones de grupo (el observer se encargará de los que aparezcan después)
  hookGroupButtons();
  // Intentar de nuevo después de que script.js haya renderizado
  setTimeout(hookGroupButtons, 600);
});