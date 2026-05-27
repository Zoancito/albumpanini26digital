// ════════════════════════════════════════════════════
//  CALENDARIO.JS — Fase de Grupos · FIFA World Cup 2026
//  v9a · Zonas horarias Sudamérica + España
//  Fuente horarios: FIFA oficial (ET = UTC-4 en junio)
// ════════════════════════════════════════════════════

// ── Utilidad: ET → UTC ms ─────────────────────────
// ET en junio/julio 2026 = EDT = UTC-4
const et = (dateStr, h, m = 0) =>
  new Date(`${dateStr}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00-04:00`).getTime();

// ── Grupos de zona horaria ────────────────────────
const TZ_GROUPS = [
  {
    id:'utc-5', offset:-5, label:'UTC−5',
    abbr:'COT · ECT · PET',
    flags:['🇨🇴','🇪🇨','🇵🇪'],
    countries:'Colombia · Ecuador · Perú',
    color:'#60a5fa'
  },
  {
    id:'utc-4', offset:-4, label:'UTC−4',
    abbr:'BOT · CLT · GYT · PYT · VET',
    flags:['🇧🇴','🇨🇱','🇬🇾','🇵🇾','🇻🇪'],
    countries:'Bolivia · Chile · Guyana · Paraguay · Venezuela',
    color:'#34d399'
  },
  {
    id:'utc-3', offset:-3, label:'UTC−3',
    abbr:'ART · BRT · SRT · UYT',
    flags:['🇦🇷','🇧🇷','🇸🇷','🇺🇾'],
    countries:'Argentina · Brasil · Surinam · Uruguay',
    color:'#f59e0b'
  },
  {
    id:'utc+2', offset:2, label:'UTC+2',
    abbr:'CEST',
    flags:['🇪🇸'],
    countries:'España',
    color:'#f87171'
  }
];

// ── Días de la semana / meses ─────────────────────
const DIAS  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul'];

function fmtTime(utcMs, offset) {
  const d = new Date(utcMs + offset * 3600000);
  return `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`;
}
function fmtDate(utcMs, offset) {
  const d = new Date(utcMs + offset * 3600000);
  return `${DIAS[d.getUTCDay()]} ${d.getUTCDate()} ${MESES[d.getUTCMonth()]}`;
}
function fmtICS(ms) {
  return new Date(ms).toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
}

// ── Datos de partidos (72 · Fase de Grupos) ───────
// Formato: [grupo, utcMs, homeEmoji, home, awayEmoji, away, venue]
const MATCHES = [
  // ── GRUPO A ──
  ['A', et('2026-06-11',15), '🇲🇽','México',        '🇿🇦','Sudáfrica',          'Estadio Azteca, Ciudad de México'],
  ['A', et('2026-06-11',22), '🇰🇷','Corea del Sur', '🇨🇿','República Checa',   'Estadio Akron, Zapopan'],
  ['A', et('2026-06-18',12), '🇨🇿','República Checa','🇿🇦','Sudáfrica',          'Mercedes-Benz Stadium, Atlanta'],
  ['A', et('2026-06-18',21), '🇲🇽','México',        '🇰🇷','Corea del Sur',      'Estadio Akron, Zapopan'],
  ['A', et('2026-06-24',21), '🇨🇿','República Checa','🇲🇽','México',             'Estadio Azteca, Ciudad de México'],
  ['A', et('2026-06-24',21), '🇿🇦','Sudáfrica',      '🇰🇷','Corea del Sur',      'Estadio BBVA, Guadalupe'],
  // ── GRUPO B ──
  ['B', et('2026-06-12',15), '🇨🇦','Canadá',          '🇧🇦','Bosnia y Herz.',  'BMO Field, Toronto'],
  ['B', et('2026-06-13',15), '🇶🇦','Qatar',            '🇨🇭','Suiza',            "Levi's Stadium, Santa Clara"],
  ['B', et('2026-06-18',15), '🇨🇭','Suiza',            '🇧🇦','Bosnia y Herz.',  'SoFi Stadium, Inglewood'],
  ['B', et('2026-06-18',18), '🇨🇦','Canadá',           '🇶🇦','Qatar',            'BC Place, Vancouver'],
  ['B', et('2026-06-24',15), '🇨🇭','Suiza',            '🇨🇦','Canadá',           'BC Place, Vancouver'],
  ['B', et('2026-06-24',15), '🇧🇦','Bosnia y Herz.',   '🇶🇦','Qatar',            'Lumen Field, Seattle'],
  // ── GRUPO C ──
  ['C', et('2026-06-13',18), '🇧🇷','Brasil',         '🇲🇦','Marruecos',       'MetLife Stadium, East Rutherford'],
  ['C', et('2026-06-13',21), '🇭🇹','Haití',          '🏴󠁧󠁢󠁳󠁣󠁴󠁿','Escocia',       'Gillette Stadium, Foxborough'],
  ['C', et('2026-06-19',18), '🏴󠁧󠁢󠁳󠁣󠁴󠁿','Escocia',    '🇲🇦','Marruecos',       'Gillette Stadium, Foxborough'],
  ['C', et('2026-06-19',21), '🇧🇷','Brasil',         '🇭🇹','Haití',           'Lincoln Financial Field, Filadelfia'],
  ['C', et('2026-06-24',18), '🏴󠁧󠁢󠁳󠁣󠁴󠁿','Escocia',    '🇧🇷','Brasil',          'Hard Rock Stadium, Miami'],
  ['C', et('2026-06-24',18), '🇲🇦','Marruecos',      '🇭🇹','Haití',           'Mercedes-Benz Stadium, Atlanta'],
  // ── GRUPO D ──
  ['D', et('2026-06-12',21), '🇺🇸','EE. UU.',        '🇵🇾','Paraguay',        'SoFi Stadium, Inglewood'],
  ['D', et('2026-06-13', 0), '🇦🇺','Australia',      '🇹🇷','Turquía',         'BC Place, Vancouver'],
  ['D', et('2026-06-19', 0), '🇹🇷','Turquía',        '🇵🇾','Paraguay',        "Levi's Stadium, Santa Clara"],
  ['D', et('2026-06-19',15), '🇺🇸','EE. UU.',        '🇦🇺','Australia',       'Lumen Field, Seattle'],
  ['D', et('2026-06-25',22), '🇹🇷','Turquía',        '🇺🇸','EE. UU.',         'SoFi Stadium, Inglewood'],
  ['D', et('2026-06-25',22), '🇵🇾','Paraguay',       '🇦🇺','Australia',       "Levi's Stadium, Santa Clara"],
  // ── GRUPO E ──
  ['E', et('2026-06-14',13), '🇩🇪','Alemania',       '🇨🇼','Curaçao',         'NRG Stadium, Houston'],
  ['E', et('2026-06-14',19), '🇨🇮','Costa de Marfil','🇪🇨','Ecuador',         'Lincoln Financial Field, Filadelfia'],
  ['E', et('2026-06-20',16), '🇩🇪','Alemania',       '🇨🇮','Costa de Marfil', 'BMO Field, Toronto'],
  ['E', et('2026-06-20',20), '🇪🇨','Ecuador',        '🇨🇼','Curaçao',         'Arrowhead Stadium, Kansas City'],
  ['E', et('2026-06-25',16), '🇪🇨','Ecuador',        '🇩🇪','Alemania',        'MetLife Stadium, East Rutherford'],
  ['E', et('2026-06-25',16), '🇨🇼','Curaçao',        '🇨🇮','Costa de Marfil', 'Lincoln Financial Field, Filadelfia'],
  // ── GRUPO F ──
  ['F', et('2026-06-14',16), '🇳🇱','Países Bajos',  '🇯🇵','Japón',            'AT&T Stadium, Arlington'],
  ['F', et('2026-06-14',22), '🇸🇪','Suecia',         '🇹🇳','Túnez',            'Estadio BBVA, Guadalupe'],
  ['F', et('2026-06-20',13), '🇳🇱','Países Bajos',  '🇸🇪','Suecia',           'NRG Stadium, Houston'],
  ['F', et('2026-06-20', 0), '🇹🇳','Túnez',          '🇯🇵','Japón',            'Estadio BBVA, Guadalupe'],
  ['F', et('2026-06-25',19), '🇹🇳','Túnez',          '🇳🇱','Países Bajos',    'AT&T Stadium, Arlington'],
  ['F', et('2026-06-25',19), '🇯🇵','Japón',          '🇸🇪','Suecia',           'Arrowhead Stadium, Kansas City'],
  // ── GRUPO G ──
  ['G', et('2026-06-15',15), '🇧🇪','Bélgica',       '🇪🇬','Egipto',          'Lumen Field, Seattle'],
  ['G', et('2026-06-15',21), '🇮🇷','Irán',           '🇳🇿','Nueva Zelanda',   'SoFi Stadium, Inglewood'],
  ['G', et('2026-06-21',15), '🇧🇪','Bélgica',       '🇮🇷','Irán',             'SoFi Stadium, Inglewood'],
  ['G', et('2026-06-21',21), '🇳🇿','Nueva Zelanda',  '🇪🇬','Egipto',          'BC Place, Vancouver'],
  ['G', et('2026-06-26',23), '🇳🇿','Nueva Zelanda',  '🇧🇪','Bélgica',         'BC Place, Vancouver'],
  ['G', et('2026-06-26',23), '🇪🇬','Egipto',         '🇮🇷','Irán',             'Lumen Field, Seattle'],
  // ── GRUPO H ──
  ['H', et('2026-06-15',12), '🇪🇸','España',         '🇨🇻','Cabo Verde',      'Mercedes-Benz Stadium, Atlanta'],
  ['H', et('2026-06-15',18), '🇸🇦','Arabia Saudí',   '🇺🇾','Uruguay',         'Hard Rock Stadium, Miami'],
  ['H', et('2026-06-21',12), '🇪🇸','España',         '🇸🇦','Arabia Saudí',    'Mercedes-Benz Stadium, Atlanta'],
  ['H', et('2026-06-21',18), '🇺🇾','Uruguay',        '🇨🇻','Cabo Verde',      'Hard Rock Stadium, Miami'],
  ['H', et('2026-06-26',20), '🇺🇾','Uruguay',        '🇪🇸','España',          'NRG Stadium, Houston'],
  ['H', et('2026-06-26',20), '🇨🇻','Cabo Verde',     '🇸🇦','Arabia Saudí',    'Estadio Akron, Zapopan'],
  // ── GRUPO I ──
  ['I', et('2026-06-16',15), '🇫🇷','Francia',        '🇸🇳','Senegal',         'MetLife Stadium, East Rutherford'],
  ['I', et('2026-06-16',18), '🇮🇶','Irak',           '🇳🇴','Noruega',         'Gillette Stadium, Foxborough'],
  ['I', et('2026-06-22',17), '🇫🇷','Francia',        '🇮🇶','Irak',            'Lincoln Financial Field, Filadelfia'],
  ['I', et('2026-06-22',20), '🇳🇴','Noruega',        '🇸🇳','Senegal',         'MetLife Stadium, East Rutherford'],
  ['I', et('2026-06-26',15), '🇳🇴','Noruega',        '🇫🇷','Francia',         'Gillette Stadium, Foxborough'],
  ['I', et('2026-06-26',15), '🇸🇳','Senegal',        '🇮🇶','Irak',            'BMO Field, Toronto'],
  // ── GRUPO J ──
  ['J', et('2026-06-16',21), '🇦🇷','Argentina',      '🇩🇿','Argelia',         'Arrowhead Stadium, Kansas City'],
  ['J', et('2026-06-16', 0), '🇦🇹','Austria',        '🇯🇴','Jordania',        "Levi's Stadium, Santa Clara"],
  ['J', et('2026-06-22',13), '🇦🇷','Argentina',      '🇦🇹','Austria',         'AT&T Stadium, Arlington'],
  ['J', et('2026-06-22',23), '🇯🇴','Jordania',       '🇩🇿','Argelia',         "Levi's Stadium, Santa Clara"],
  ['J', et('2026-06-27',22), '🇯🇴','Jordania',       '🇦🇷','Argentina',       'AT&T Stadium, Arlington'],
  ['J', et('2026-06-27',22), '🇩🇿','Argelia',        '🇦🇹','Austria',         'Arrowhead Stadium, Kansas City'],
  // ── GRUPO K ──
  ['K', et('2026-06-17',13),   '🇵🇹','Portugal',     '🇨🇩','RD Congo',        'NRG Stadium, Houston'],
  ['K', et('2026-06-17',22),   '🇺🇿','Uzbekistán',   '🇨🇴','Colombia',        'Estadio Azteca, Ciudad de México'],
  ['K', et('2026-06-23',13),   '🇵🇹','Portugal',     '🇺🇿','Uzbekistán',      'NRG Stadium, Houston'],
  ['K', et('2026-06-23',22),   '🇨🇴','Colombia',     '🇨🇩','RD Congo',        'Estadio Akron, Zapopan'],
  ['K', et('2026-06-27',19,30),'🇨🇴','Colombia',     '🇵🇹','Portugal',        'Hard Rock Stadium, Miami'],
  ['K', et('2026-06-27',19,30),'🇨🇩','RD Congo',     '🇺🇿','Uzbekistán',      'Mercedes-Benz Stadium, Atlanta'],
  // ── GRUPO L ──
  ['L', et('2026-06-17',16), '🏴󠁧󠁢󠁥󠁮󠁧󠁿','Inglaterra', '🇭🇷','Croacia',         'AT&T Stadium, Arlington'],
  ['L', et('2026-06-17',19), '🇬🇭','Ghana',          '🇵🇦','Panamá',          'BMO Field, Toronto'],
  ['L', et('2026-06-23',16), '🏴󠁧󠁢󠁥󠁮󠁧󠁿','Inglaterra', '🇬🇭','Ghana',           'Gillette Stadium, Foxborough'],
  ['L', et('2026-06-23',19), '🇵🇦','Panamá',         '🇭🇷','Croacia',         'BMO Field, Toronto'],
  ['L', et('2026-06-27',17), '🇵🇦','Panamá',         '🏴󠁧󠁢󠁥󠁮󠁧󠁿','Inglaterra',  'MetLife Stadium, East Rutherford'],
  ['L', et('2026-06-27',17), '🇭🇷','Croacia',        '🇬🇭','Ghana',           'Lincoln Financial Field, Filadelfia']
];

// ── ICS generator ─────────────────────────────────
function generateICS() {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Album Mundial 2026//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Mundial 2026 - Fase de Grupos',
    'X-WR-TIMEZONE:UTC'
  ];
  MATCHES.forEach(([g, utcMs, hE, h, aE, a, venue]) => {
    const end = utcMs + 7200000; // +2h
    lines.push(
      'BEGIN:VEVENT',
      `DTSTART:${fmtICS(utcMs)}`,
      `DTEND:${fmtICS(end)}`,
      `SUMMARY:${hE} ${h} vs ${aE} ${a}`,
      `LOCATION:${venue}`,
      `DESCRIPTION:Grupo ${g} · FIFA World Cup 2026 · ${venue}`,
      'END:VEVENT'
    );
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function generateMatchICS(m) {
  const [g, utcMs, hE, h, aE, a, venue] = m;
  const end = utcMs + 7200000;
  const lines = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Album Mundial 2026//ES',
    'CALSCALE:GREGORIAN','METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${fmtICS(utcMs)}`,
    `DTEND:${fmtICS(end)}`,
    `SUMMARY:${hE} ${h} vs ${aE} ${a}`,
    `LOCATION:${venue}`,
    `DESCRIPTION:Grupo ${g} · FIFA World Cup 2026 · ${venue}`,
    'END:VEVENT','END:VCALENDAR'
  ];
  return lines.join('\r\n');
}

function downloadICS(content, filename) {
  const blob = new Blob([content], {type:'text/calendar;charset=utf-8'});
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob), download: filename
  });
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

// ── Estado activo ──────────────────────────────────
let calActiveTZ  = TZ_GROUPS[1]; // UTC-4 por defecto (Bolivia, Chile, etc.)
let calActiveGrp = 'A';

// ── Render ────────────────────────────────────────
function renderCalendar() {
  const overlay = document.getElementById('calendar-overlay');
  if (!overlay) return;

  // Timezone tabs
  const tzWrap = overlay.querySelector('#cal-tz-tabs');
  tzWrap.innerHTML = '';
  TZ_GROUPS.forEach(tz => {
    const btn = document.createElement('button');
    btn.className = 'cal-tz-tab' + (tz.id === calActiveTZ.id ? ' active' : '');
    btn.setAttribute('data-tz', tz.id);
    btn.setAttribute('aria-label', `Zona horaria ${tz.label} - ${tz.countries}`);
    btn.innerHTML = `
      <div class="cal-tz-flags">${tz.flags.map(f => `<span class="cal-tz-flag">${f}</span>`).join('')}</div>
      <div class="cal-tz-info">
        <div class="cal-tz-label" style="color:${tz.color}">${tz.label}</div>
        <div class="cal-tz-abbr">${tz.abbr}</div>
        <div class="cal-tz-countries">${tz.countries}</div>
      </div>
    `;
    btn.addEventListener('click', () => {
      calActiveTZ = tz;
      renderCalendar();
    });
    tzWrap.appendChild(btn);
  });

  // Add-all button
  const addAll = overlay.querySelector('#cal-add-all');
  if (addAll) {
    addAll.style.setProperty('--tz-color', calActiveTZ.color);
    addAll.onclick = () => {
      downloadICS(generateICS(), 'mundial2026-fase-grupos.ics');
    };
  }

  renderCalendarGroupTabs();
  renderMatchList();
}

function renderCalendarGroupTabs() {
  const overlay = document.getElementById('calendar-overlay');
  if (!overlay) return;
  const grpWrap = overlay.querySelector('#cal-grp-tabs');
  if (!grpWrap) return;
  grpWrap.innerHTML = '';
  ['A','B','C','D','E','F','G','H','I','J','K','L'].forEach(g => {
    const btn = document.createElement('button');
    btn.className = 'cal-grp-tab' + (g === calActiveGrp ? ' active' : '');
    btn.textContent = `Grupo ${g}`;
    btn.setAttribute('aria-label', `Grupo ${g}`);
    btn.addEventListener('click', () => { calActiveGrp = g; renderCalendarGroupTabs(); renderMatchList(); });
    grpWrap.appendChild(btn);
  });
}

function renderMatchList() {
  const list = document.getElementById('cal-match-list');
  if (!list) return;

  const tz  = calActiveTZ;
  const matches = MATCHES.filter(m => m[0] === calActiveGrp);

  list.innerHTML = '';

  // Group matches by local date
  const byDate = {};
  matches.forEach(m => {
    const dateKey = fmtDate(m[1], tz.offset);
    if (!byDate[dateKey]) byDate[dateKey] = [];
    byDate[dateKey].push(m);
  });

  Object.entries(byDate).forEach(([dateKey, dayMatches]) => {
    // Date header
    const dh = document.createElement('div');
    dh.className = 'cal-date-header';
    dh.textContent = dateKey;
    list.appendChild(dh);

    dayMatches.forEach(m => {
      const [g, utcMs, hE, h, aE, a, venue] = m;
      const localTime = fmtTime(utcMs, tz.offset);

      const card = document.createElement('div');
      card.className = 'cal-match-card';
      card.innerHTML = `
        <div class="cal-match-time" style="color:${tz.color}">
          <span class="cal-match-hr">${localTime}</span>
          <span class="cal-match-tz">${tz.label}</span>
        </div>
        <div class="cal-match-teams">
          <span class="cal-team home">${hE} <span class="cal-team-name">${h}</span></span>
          <span class="cal-vs">vs</span>
          <span class="cal-team away">${aE} <span class="cal-team-name">${a}</span></span>
        </div>
        <div class="cal-match-venue">${venue}</div>
        <button class="cal-add-match" aria-label="Añadir ${h} vs ${a} a mi calendario">
          📅
        </button>
      `;

      card.querySelector('.cal-add-match').addEventListener('click', () => {
        downloadICS(generateMatchICS(m), `mundial2026-${h.toLowerCase().replace(/\s/g,'-')}-vs-${a.toLowerCase().replace(/\s/g,'-')}.ics`);
      });

      list.appendChild(card);
    });
  });
}

// ── Open / Close ──────────────────────────────────
window.openCalendar = function () {
  const overlay = document.getElementById('calendar-overlay');
  if (!overlay) return;
  overlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
  renderCalendar();
};

function closeCalendar() {
  const overlay = document.getElementById('calendar-overlay');
  if (!overlay) return;
  overlay.classList.remove('visible');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('cal-close')?.addEventListener('click', closeCalendar);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('calendar-overlay')?.classList.contains('visible')) {
      closeCalendar();
    }
  });
});
