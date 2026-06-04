// ═══════════════════════════════════════════════════
//  ÁLBUM MUNDIAL 2026 — trivia.js
//  Trivia por grupo + intento diario para usuarios
// ═══════════════════════════════════════════════════
import { supabase } from './supabase.js'

// ── Preguntas por grupo (5 por grupo) ────────────
export const TRIVIA_QUESTIONS = {
  A: [
    { q:'¿En qué año debutó México en un Mundial de Fútbol?', opts:['1930','1950','1954','1966'], a:0 },
    { q:'¿Cómo se llama el estadio más icónico de México, sede del Mundial 2026?', opts:['Azteca','Jalisco','Universitario','Hidalgo'], a:0 },
    { q:'¿Cuántos mundiales ha disputado Corea del Sur hasta 2022?', opts:['8','10','11','7'], a:1 },
    { q:'¿En qué Mundial llegó Corea del Sur a las semifinales sorprendiendo al mundo?', opts:['1998','2002','2006','2010'], a:1 },
    { q:'¿Cuál es el apodo de la selección de Sudáfrica?', opts:['Bafana Bafana','Amakhosi','Springboks','Soweto Boys'], a:0 },
  ],
  B: [
    { q:'¿En qué año clasificó Canadá por primera vez a un Mundial de Fútbol?', opts:['1986','1990','2022','2018'], a:0 },
    { q:'¿Cómo se llama el jugador estrella de Canadá que juega en el Bayern de Múnich?', opts:['Jonathan David','Cyle Larin','Alphonso Davies','Tajon Buchanan'], a:2 },
    { q:'¿Cuántas copas del mundo ha ganado Suiza?', opts:['0','1','2','3'], a:0 },
    { q:'¿En qué continente juega Catar sus competiciones oficiales de selecciones?', opts:['Asia','Europa','África','América'], a:0 },
    { q:'¿Qué país albergó la Copa del Mundo 2022?', opts:['Arabia Saudí','Emiratos Árabes','Catar','Baréin'], a:2 },
  ],
  C: [
    { q:'¿Cuántos títulos mundiales tiene Brasil?', opts:['4','5','6','3'], a:1 },
    { q:'¿En qué año fue eliminado Brasil con el histórico 7-1?', opts:['2010','2014','2018','2022'], a:1 },
    { q:'¿Qué logro histórico consiguió Marruecos en el Mundial de Qatar 2022?', opts:['Ganar el grupo','Ser el primer africano en semifinales','Ganar el partido inaugural','Meter más goles de África'], a:1 },
    { q:'¿En qué año debutó Haití en su único Mundial?', opts:['1966','1970','1974','1978'], a:2 },
    { q:'¿Cuántos mundiales ha disputado Brasil en total hasta 2022?', opts:['19','22','21','20'], a:1 },
  ],
  D: [
    { q:'¿Cuándo fue la última vez que EE. UU. llegó a semifinales de un Mundial?', opts:['1930','1950','2002','2010'], a:0 },
    { q:'¿Cómo se llama el capitán y goleador de EE. UU. que juega en el Bayern?', opts:['Gio Reyna','Christian Pulisic','Weston McKennie','Tyler Adams'], a:1 },
    { q:'¿En qué puesto terminó Turquía en el Mundial de Corea-Japón 2002?', opts:['1°','2°','3°','4°'], a:2 },
    { q:'¿Cuántas Copas América tiene Uruguay?', opts:['13','15','14','12'], a:1 },
    { q:'¿Cuántos mundiales ha ganado Australia (Socceroos)?', opts:['0','1','2','ninguno pero llegó a cuartos'], a:3 },
  ],
  E: [
    { q:'¿Cuántos títulos mundiales tiene Alemania?', opts:['3','4','5','2'], a:1 },
    { q:'¿Cómo se llama el joven talento del Bayer Leverkusen considerado el mejor del mundo?', opts:['Jamal Musiala','Kai Havertz','Florian Wirtz','Leroy Sané'], a:2 },
    { q:'¿En qué año ganó Alemania su último Mundial?', opts:['2010','2014','2018','2006'], a:1 },
    { q:'¿A qué confederación pertenece Costa de Marfil?', opts:['UEFA','CONCACAF','CAF','AFC'], a:2 },
    { q:'¿Cuántas Copas Africanas de Naciones ha ganado Costa de Marfil?', opts:['1','2','3','0'], a:1 },
  ],
  F: [
    { q:'¿Cuántos mundiales ha ganado Países Bajos (Holanda)?', opts:['0','1','2','3'], a:0 },
    { q:'¿En cuántas finales mundiales ha estado Países Bajos?', opts:['2','3','4','1'], a:1 },
    { q:'¿Cómo se llama el torneo de selecciones de Asia donde juega Japón?', opts:['Copa Asiática','Copa AFC','Copa del Pacífico','Asian Cup'], a:3 },
    { q:'¿Cuántos mundiales consecutivos clasificó Suecia entre 1934 y 1978?', opts:['7','8','9','6'], a:0 },
    { q:'¿En qué puesto terminó Japón en el Mundial de Korea-Japón 2002?', opts:['Cuartos','Semifinales','Octavos','Grupo'], a:0 },
  ],
  G: [
    { q:'¿Cuántos títulos mundiales tiene Bélgica?', opts:['0','1','2','3'], a:0 },
    { q:'¿Cuál fue el mejor resultado histórico de Bélgica en un Mundial?', opts:['Campeón','Subcampeón','3er Lugar','4° Lugar'], a:2 },
    { q:'¿En qué año clasificó Irán por primera vez a un Mundial?', opts:['1974','1978','1982','1970'], a:1 },
    { q:'¿Cuál es el apodo de la selección de Nueva Zelanda?', opts:['All Whites','Kiwis','Haka Boys','Southern Stars'], a:0 },
    { q:'¿Cuántas veces ha clasificado Egipto a una Copa del Mundo?', opts:['2','3','4','5'], a:1 },
  ],
  H: [
    { q:'¿Cuántas Eurocopas ha ganado España?', opts:['2','3','4','1'], a:1 },
    { q:'¿En qué año ganó España su único Mundial?', opts:['2006','2010','2014','2002'], a:1 },
    { q:'¿Qué jugador del Real Madrid es considerado la nueva estrella de España con solo 17 años en la Euro 2024?', opts:['Pedri','Gavi','Lamine Yamal','Dani Olmo'], a:2 },
    { q:'¿Cuántos mundiales ha disputado Arabia Saudí?', opts:['4','5','6','3'], a:1 },
    { q:'¿Qué selección venció Arabia Saudí sorprendentemente en Qatar 2022?', opts:['Brasil','Argentina','Francia','Polonia'], a:1 },
  ],
  I: [
    { q:'¿Cuántos títulos mundiales tiene Francia?', opts:['1','2','3','4'], a:1 },
    { q:'¿En qué año ganó Francia su primer Mundial?', opts:['1994','1998','2002','1990'], a:1 },
    { q:'¿Cuántas Copas Africanas de Naciones ha ganado Senegal?', opts:['0','1','2','3'], a:1 },
    { q:'¿En qué Mundial llegó Noruega a cuartos de final?', opts:['1938','1954','1958','1966'], a:2 },
    { q:'¿Cómo se llama el capitán del Liverpool que juega para Senegal?', opts:['Idrissa Gueye','Sadio Mané','Édouard Mendy','Kalidou Koulibaly'], a:1 },
  ],
  J: [
    { q:'¿Cuántos títulos mundiales tiene Argentina?', opts:['2','3','4','1'], a:1 },
    { q:'¿En qué año ganó Argentina su tercer Mundial con Messi?', opts:['2018','2022','2026','2014'], a:1 },
    { q:'¿En cuántos Mundiales ha jugado Lionel Messi?', opts:['4','5','6','3'], a:1 },
    { q:'¿A qué confederación pertenece Argelia?', opts:['UEFA','CAF','AFC','CONMEBOL'], a:1 },
    { q:'¿En qué año ganó Argelia su única Copa Africana de Naciones más reciente?', opts:['2015','2017','2019','2021'], a:2 },
  ],
  K: [
    { q:'¿Cuántos títulos mundiales tiene Portugal?', opts:['0','1','2','3'], a:0 },
    { q:'¿Cuál es el récord de goles internacionales de Cristiano Ronaldo?', opts:['128','130','135','130+'], a:3 },
    { q:'¿Cuántas Copas Africanas tiene la República Democrática del Congo?', opts:['1','2','3','4'], a:1 },
    { q:'¿A qué confederación pertenece Uzbekistán?', opts:['UEFA','AFC','CAF','OFC'], a:1 },
    { q:'¿En qué año ganó Colombia su única Copa América?', opts:['1995','2001','2007','2011'], a:1 },
  ],
  L: [
    { q:'¿En qué año ganó Inglaterra su único título mundial?', opts:['1962','1966','1970','1974'], a:1 },
    { q:'¿Cuál es el apodo de la selección de Inglaterra?', opts:['Red Lions','Three Lions','Royal Lions','English Lions'], a:1 },
    { q:'¿En qué año fue el primer partido internacional de la historia, disputado entre Escocia e Inglaterra?', opts:['1870','1872','1875','1880'], a:1 },
    { q:'¿Cuántas veces ha clasificado Croacia a la final de un Mundial?', opts:['1','2','3','0'], a:1 },
    { q:'¿Qué premio individual ganó Luka Modrić en 2018?', opts:['Bota de Oro','Guante de Oro','Balón de Oro','Trofeo Yashin'], a:2 },
  ],
}

// ── Jugadores por grupo para el 11 ideal ─────────
export const GROUP_PLAYERS = {
  A: {
    '🇲🇽 México':             ['Guillermo Ochoa (POR)','Edson Álvarez (MED)','Hirving Lozano (EXT)','Raúl Jiménez (DEL)','César Montes (DEF)'],
    '🇿🇦 Sudáfrica':          ['Ronwen Williams (POR)','Bongani Zungu (MED)','Percy Tau (EXT)','Lyle Foster (DEL)','Siyanda Xulu (DEF)'],
    '🇰🇷 República de Corea': ['Kim Seung-gyu (POR)','Min-jae Kim (DEF)','Heung-min Son (EXT)','Lee Jae-sung (MED)','Hwang Hee-chan (DEL)'],
    '🇨🇿 República Checa':    ['Jiří Pavlenka (POR)','Tomáš Souček (MED)','Patrik Schick (DEL)','Vladimír Coufal (LAT)','Lukáš Holeš (MED)'],
  },
  B: {
    '🇨🇦 Canadá':              ['Maxime Crépeau (POR)','Alphonso Davies (LAT)','Jonathan David (DEL)','Tajon Buchanan (EXT)','Stephen Eustáquio (MED)'],
    '🇧🇦 Bosnia y Herzegovina':['Jasmin Handanović (POR)','Edin Džeko (DEL)','Miralem Pjanić (MED)','Sead Kolašinac (LAT)','Ermedin Demirović (DEL)'],
    '🇶🇦 Catar':               ['Meshaal Barsham (POR)','Akram Afif (EXT)','Almoez Ali (DEL)','Assim Madibo (MED)','Pedro Miguel (LAT)'],
    '🇨🇭 Suiza':               ['Yann Sommer (POR)','Granit Xhaka (MED)','Xherdan Shaqiri (EXT)','Breel Embolo (DEL)','Manuel Akanji (DEF)'],
  },
  C: {
    '🇧🇷 Brasil':              ['Alisson (POR)','Marquinhos (DEF)','Vinicius Jr. (EXT)','Rodrygo (EXT)','Endrick (DEL)'],
    '🇲🇦 Marruecos':           ['Yassine Bounou (POR)','Achraf Hakimi (LAT)','Hakim Ziyech (EXT)','Youssef En-Nesyri (DEL)','Sofyan Amrabat (MED)'],
    '🇭🇹 Haití':               ['Josué Duverger (POR)','Frantzdy Pierrot (DEL)','Derrick Etienne (EXT)','James Peneau (MED)','Mechack Jérôme (DEF)'],
    '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia':          ['Angus Gunn (POR)','Andrew Robertson (LAT)','Scott McTominay (MED)','Lyndon Dykes (DEL)','John McGinn (MED)'],
  },
  D: {
    '🇺🇸 EE. UU.':             ['Matt Turner (POR)','Sergino Dest (LAT)','Christian Pulisic (EXT)','Gio Reyna (MED)','Folarin Balogun (DEL)'],
    '🇵🇾 Paraguay':            ['Antony Silva (POR)','Gustavo Gómez (DEF)','Miguel Almirón (MED)','Julio Enciso (EXT)','Antonio Sanabria (DEL)'],
    '🇦🇺 Australia':           ['Mathew Ryan (POR)','Harry Souttar (DEF)','Mathew Leckie (EXT)','Mitchell Duke (DEL)','Ajdin Hrustic (MED)'],
    '🇹🇷 Turquía':             ['Uğurcan Çakır (POR)','Merih Demiral (DEF)','Hakan Çalhanoğlu (MED)','Arda Güler (MED)','Kerem Aktürkoğlu (EXT)'],
  },
  E: {
    '🇩🇪 Alemania':            ['Manuel Neuer (POR)','Antonio Rüdiger (DEF)','Florian Wirtz (MED)','Jamal Musiala (MED)','Kai Havertz (DEL)'],
    '🇨🇼 Curaçao':             ['Eloy Room (POR)','Ethan Pinnock (DEF)','Jurien Daal (LAT)','Juninho Bacuna (MED)','Cuco Martina (LAT)'],
    '🇨🇮 Costa de Marfil':     ['Badra Ali Sangaré (POR)','Serge Aurier (LAT)','Sébastien Haller (DEL)','Franck Kessié (MED)','Nicolas Pépé (EXT)'],
    '🇪🇨 Ecuador':             ['Hernán Galíndez (POR)','Piero Hincapié (DEF)','Moisés Caicedo (MED)','Enner Valencia (DEL)','Gonzalo Plata (EXT)'],
  },
  F: {
    '🇳🇱 Países Bajos':        ['Bart Verbruggen (POR)','Virgil van Dijk (DEF)','Xavi Simons (MED)','Cody Gakpo (EXT)','Wout Weghorst (DEL)'],
    '🇯🇵 Japón':               ['Shuichi Gonda (POR)','Takehiro Tomiyasu (DEF)','Takefusa Kubo (EXT)','Kaoru Mitoma (EXT)','Ayase Ueda (DEL)'],
    '🇸🇪 Suecia':              ['Robin Olsen (POR)','Victor Lindelöf (DEF)','Dejan Kulusevski (MED)','Alexander Isak (DEL)','Emil Forsberg (MED)'],
    '🇹🇳 Túnez':               ['Aymen Dahmen (POR)','Montassar Talbi (DEF)','Hannibal Mejbri (MED)','Issam Jebali (DEL)','Aissa Laïdouni (MED)'],
  },
  G: {
    '🇧🇪 Bélgica':             ['Koen Casteels (POR)','Toby Alderweireld (DEF)','Kevin De Bruyne (MED)','Romelu Lukaku (DEL)','Lois Openda (DEL)'],
    '🇪🇬 Egipto':              ['Mohamed El-Shenawy (POR)','Ahmed Hegazi (DEF)','Mohamed Salah (EXT)','Omar Marmoush (DEL)','Tarek Hamed (MED)'],
    '🇮🇷 RI de Irán':          ['Alireza Beiranvand (POR)','Ehsan Hajsafi (LAT)','Sardar Azmoun (DEL)','Mehdi Taremi (DEL)','Ali Gholizadeh (EXT)'],
    '🇳🇿 Nueva Zelanda':       ['Stefan Marinovic (POR)','Tommy Smith (DEF)','Chris Wood (DEL)','Liberato Cacace (LAT)','Elijah Just (MED)'],
  },
  H: {
    '🇪🇸 España':              ['Unai Simón (POR)','Dani Carvajal (LAT)','Pedri (MED)','Lamine Yamal (EXT)','Álvaro Morata (DEL)'],
    '🇨🇻 Cabo Verde':          ['Vozinha (POR)','Lisandro Semedo (DEF)','Ryan Mendes (EXT)','Garry Rodrigues (EXT)','Jamiro Monteiro (MED)'],
    '🇸🇦 Arabia Saudí':        ['Mohammed Al-Owais (POR)','Ali Al-Bulayhi (LAT)','Salem Al-Dawsari (EXT)','Firas Al-Buraikan (DEL)','Salman Al-Faraj (MED)'],
    '🇺🇾 Uruguay':             ['Sergio Rochet (POR)','Ronald Araújo (DEF)','Federico Valverde (MED)','Darwin Núñez (DEL)','Luis Suárez (DEL)'],
  },
  I: {
    '🇫🇷 Francia':             ['Mike Maignan (POR)','Theo Hernández (LAT)','Aurélien Tchouaméni (MED)','Kylian Mbappé (DEL)','Antoine Griezmann (MED)'],
    '🇸🇳 Senegal':             ['Édouard Mendy (POR)','Kalidou Koulibaly (DEF)','Sadio Mané (EXT)','Idrissa Gueye (MED)','Boulaye Dia (DEL)'],
    '🇮🇶 Irak':                ['Jalal Hassan (POR)','Ahmed Ibrahim (DEF)','Amjed Attwan (MED)','Aymen Hussein (DEL)','Bashar Resan (EXT)'],
    '🇳🇴 Noruega':             ['Ørjan Nyland (POR)','Leo Østigård (DEF)','Martin Ødegaard (MED)','Erling Haaland (DEL)','Alexander Sørloth (DEL)'],
  },
  J: {
    '🇦🇷 Argentina':           ['Emiliano Martínez (POR)','Cristian Romero (DEF)','Rodrigo De Paul (MED)','Julián Álvarez (DEL)','Lionel Messi (DEL)'],
    '🇩🇿 Argelia':             ['Raïs M\'Bolhi (POR)','Riyad Mahrez (EXT)','Islam Slimani (DEL)','Sofiane Feghouli (MED)','Saïd Benrahma (EXT)'],
    '🇦🇹 Austria':             ['Patrick Pentz (POR)','David Alaba (DEF)','Marcel Sabitzer (MED)','Marko Arnautović (DEL)','Konrad Laimer (MED)'],
    '🇯🇴 Jordania':            ['Yazeed Abo Laila (POR)','Yazan Al-Arab (DEF)','Baha Faisal (MED)','Musa Al-Taamari (EXT)','Ahmad Hayel (DEL)'],
  },
  K: {
    '🇵🇹 Portugal':            ['Diogo Costa (POR)','Rúben Dias (DEF)','Bruno Fernandes (MED)','Bernardo Silva (MED)','Cristiano Ronaldo (DEL)'],
    '🇨🇩 República Democrática del Congo':['Joël Kiassumbua (POR)','Chancel Mbemba (DEF)','Yoane Wissa (EXT)','Cédric Bakambu (DEL)','Aaron Wan-Bissaka (LAT)'],
    '🇺🇿 Uzbekistán':          ['Utkir Yusupov (POR)','Eldor Shomurodov (DEL)','Abbosbek Fayzullaev (MED)','Jaloliddin Masharipov (EXT)','Sherzod Nasrullayev (MED)'],
    '🇨🇴 Colombia':            ['Camilo Vargas (POR)','Dávinson Sánchez (DEF)','James Rodríguez (MED)','Luis Díaz (EXT)','Falcao García (DEL)'],
  },
  L: {
    '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra':      ['Jordan Pickford (POR)','Kyle Walker (LAT)','Jude Bellingham (MED)','Phil Foden (MED)','Harry Kane (DEL)'],
    '🇭🇷 Croacia':             ['Dominik Livaković (POR)','Joško Gvardiol (DEF)','Luka Modrić (MED)','Mateo Kovačić (MED)','Andrej Kramarić (DEL)'],
    '🇬🇭 Ghana':               ['Lawrence Ati-Zigi (POR)','Alexander Djiku (DEF)','Thomas Partey (MED)','Mohammed Kudus (EXT)','Jordan Ayew (DEL)'],
    '🇵🇦 Panamá':              ['Orlando Mosquera (POR)','Fidel Escobar (DEF)','Aníbal Godoy (MED)','Adalberto Carrasquilla (MED)','Rolando Blackburn (DEL)'],
  },
}

// ── Lógica de intento diario ──────────────────────
const TRIVIA_KEY = 'trivia_attempts'  // localStorage key

function todayStr() {
  return new Date().toISOString().slice(0, 10)  // YYYY-MM-DD
}

/** Devuelve si el usuario ya intentó la trivia del grupo hoy */
export function hasAttemptedToday(grp) {
  try {
    const raw = JSON.parse(localStorage.getItem(TRIVIA_KEY) || '{}')
    return raw[grp] === todayStr()
  } catch { return false }
}

/** Marca el grupo como intentado hoy */
function markAttemptedToday(grp) {
  try {
    const raw = JSON.parse(localStorage.getItem(TRIVIA_KEY) || '{}')
    raw[grp] = todayStr()
    localStorage.setItem(TRIVIA_KEY, JSON.stringify(raw))
  } catch {}
}

/** Guarda resultado en Supabase si hay sesión */
async function saveResultToSupabase(userId, grp, score, total) {
  try {
    await supabase.from('trivia_intentos').insert({
      user_id: userId,
      grupo: grp,
      score,
      total,
      fecha: todayStr(),
    })
  } catch (e) {
    console.warn('[trivia] no se pudo guardar en Supabase:', e)
  }
}

// ── Renderizar modal de trivia ────────────────────
export function openTriviaModal(grp, gColor, userId = null) {
  const questions = TRIVIA_QUESTIONS[grp]
  if (!questions) return

  // Eliminar modal anterior si existe
  document.getElementById('trivia-modal')?.remove()

  const modal = document.createElement('div')
  modal.id = 'trivia-modal'
  modal.className = 'trivia-modal-backdrop'
  modal.setAttribute('role', 'dialog')
  modal.setAttribute('aria-modal', 'true')

  let current = 0
  let score = 0
  let answered = false

  function renderQuestion() {
    const q = questions[current]
    const isLast = current === questions.length - 1
    modal.innerHTML = `
      <div class="trivia-box" style="--trivia-color:${gColor}">
        <div class="trivia-header">
          <div class="trivia-eyebrow">🧠 TRIVIA · GRUPO ${grp}</div>
          <button class="trivia-close" id="trivia-close" aria-label="Cerrar">✕</button>
        </div>
        <div class="trivia-progress">
          <div class="trivia-progress-fill" style="width:${(current/questions.length)*100}%;background:${gColor}"></div>
        </div>
        <div class="trivia-q-count">${current+1} / ${questions.length}</div>
        <div class="trivia-question">${q.q}</div>
        <div class="trivia-opts" id="trivia-opts">
          ${q.opts.map((o,i) => `
            <button class="trivia-opt" data-idx="${i}">${o}</button>
          `).join('')}
        </div>
        <div class="trivia-feedback" id="trivia-feedback"></div>
        <div class="trivia-actions" id="trivia-actions" style="display:none">
          <button class="trivia-next-btn" id="trivia-next">
            ${isLast ? '🏁 Ver resultado' : 'Siguiente →'}
          </button>
        </div>
      </div>`

    // Bind opciones
    answered = false
    modal.querySelectorAll('.trivia-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return
        answered = true
        const chosen = parseInt(btn.dataset.idx)
        const correct = q.a
        if (chosen === correct) score++

        modal.querySelectorAll('.trivia-opt').forEach((b, i) => {
          b.disabled = true
          if (i === correct) b.classList.add('correct')
          else if (i === chosen) b.classList.add('wrong')
        })

        const fb = document.getElementById('trivia-feedback')
        fb.textContent = chosen === correct ? '✅ ¡Correcto!' : `❌ Era: ${q.opts[correct]}`
        fb.className = 'trivia-feedback ' + (chosen === correct ? 'ok' : 'bad')

        document.getElementById('trivia-actions').style.display = ''
      })
    })

    // Siguiente / resultado
    document.getElementById('trivia-next')?.addEventListener('click', () => {
      if (current < questions.length - 1) {
        current++
        renderQuestion()
      } else {
        renderResult()
      }
    })

    // Cerrar
    document.getElementById('trivia-close')?.addEventListener('click', closeModal)
  }

  function renderResult() {
    markAttemptedToday(grp)
    if (userId) saveResultToSupabase(userId, grp, score, questions.length)

    const pct = Math.round((score / questions.length) * 100)
    const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : pct >= 40 ? '😅' : '📚'
    const msg   = pct >= 80 ? '¡Eres un experto!' : pct >= 60 ? '¡Bien hecho!' : pct >= 40 ? 'Puedes mejorar' : 'A estudiar más...'

    modal.innerHTML = `
      <div class="trivia-box trivia-result-box" style="--trivia-color:${gColor}">
        <div class="trivia-header">
          <div class="trivia-eyebrow">🧠 RESULTADO · GRUPO ${grp}</div>
          <button class="trivia-close" id="trivia-close" aria-label="Cerrar">✕</button>
        </div>
        <div class="trivia-result-icon">${emoji}</div>
        <div class="trivia-result-score">${score} / ${questions.length}</div>
        <div class="trivia-result-pct" style="color:${gColor}">${pct}%</div>
        <div class="trivia-result-msg">${msg}</div>
        <div class="trivia-result-bar-wrap">
          <div class="trivia-result-bar" style="width:${pct}%;background:${gColor}"></div>
        </div>
        <p class="trivia-result-note">Podrás volver a intentarlo mañana</p>
        <button class="trivia-close-btn" id="trivia-close-btn">Cerrar</button>
      </div>`

    document.getElementById('trivia-close')?.addEventListener('click', closeModal)
    document.getElementById('trivia-close-btn')?.addEventListener('click', closeModal)
  }

  function closeModal() {
    modal.classList.add('trivia-hiding')
    setTimeout(() => modal.remove(), 350)
  }

  modal.addEventListener('click', e => { if (e.target === modal) closeModal() })
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', esc) }
  })

  document.body.appendChild(modal)
  requestAnimationFrame(() => modal.classList.add('trivia-visible'))
  renderQuestion()
}
