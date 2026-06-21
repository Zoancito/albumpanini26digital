// ════════════════════════════════════════════════════
//  MUNDIALES.JS  —  Historia de los Mundiales FIFA
//  v10 · Álbum Mundial 2026
// ════════════════════════════════════════════════════

const WORLD_CUPS = [
  {
    year:1930, host:'Uruguay', champion:'Uruguay', runnerUp:'Argentina',
    topScorer:'Guillermo Stábile (8 goles, ARG)', teams:13, matches:18, goals:70,
    img:'https://files.catbox.moe/os4dpg.jpeg',
    mascot:null, mascotName:null,
    song:null,
    hito:'El primer Mundial de la historia. Sin clasificación UEFA, muchos países europeos rechazaron viajar a Sudamérica.',
    context:'Celebrado en plena Gran Depresión. Uruguay ganó en el Estadio Centenario ante 93.000 personas. Solo 13 selecciones participaron y no hubo clasificación: las invitaron directamente. El campeón olímpico Uruguay era el gran favorito y cumplió con el título en casa.',
    mvp:'Guillermo Stábile (ARG)', third:'EE. UU.',
    curiosidad:'Uruguay y Argentina discutieron qué balón usar en la final. Usaron uno diferente en cada tiempo; Uruguay ganó con el suyo en el segundo.',
    semis:['Argentina 6 – 1 EE. UU.', 'Uruguay 6 – 1 Yugoslavia']
  },
  {
    year:1934, host:'Italia', champion:'Italia', runnerUp:'Checoslovaquia',
    topScorer:'Oldřich Nejedlý (5 goles, CZE)', teams:16, matches:17, goals:70,
    img:'https://files.catbox.moe/9xs49s.png',
    mascot:null, mascotName:null,
    song:null,
    hito:'Uruguay, campeón defensor, no participó en protesta por la baja asistencia europea en 1930. Primer Mundial con ronda eliminatoria desde la primera fase.',
    context:'Organizado bajo el régimen fascista de Mussolini, cargado de politización. Italia fue el equipo más poderoso con Meazza y Schiavio. El partido de cuartos de final entre Austria e Italia fue durísimo y marcó el torneo.',
    mvp:'Giuseppe Meazza (ITA)', third:'Alemania',
    curiosidad:'Uruguay, campeón defensor, no participó en represalia por la poca asistencia europea en 1930.',
    semis:['Italia 1 – 0 (AET) Austria', 'Checoslovaquia 3 – 1 Alemania']
  },
  {
    year:1938, host:'Francia', champion:'Italia', runnerUp:'Hungría',
    topScorer:'Leônidas (7 goles, BRA)', teams:15, matches:18, goals:84,
    img:'https://files.catbox.moe/z1t0c2.jpeg',
    mascot:null, mascotName:null,
    song:null,
    hito:'Italia retuvo el título y se consagró bicampeona. Austria fue absorbida por Alemania antes del torneo y sus jugadores se repartieron entre Alemania y la abstención.',
    context:'Europa estaba al borde de la guerra. Fue el último Mundial hasta 1950 debido a la Segunda Guerra Mundial. Brasil, con Leônidas, fue la gran revelación pero el jugador no fue al partido clave. Cuba y las Indias Orientales Holandesas hicieron su único Mundial.',
    mvp:'Leônidas da Silva (BRA)', third:'Brasil',
    curiosidad:'Pelé aún no había nacido; Leônidas ya inventaba bicicletas y rabionas que deslumbraron al mundo.',
    semis:['Italia 2 – 1 Brasil', 'Hungría 5 – 1 Suecia']
  },
  {
    year:1950, host:'Brasil', champion:'Uruguay', runnerUp:'Brasil',
    topScorer:'Ademir (9 goles, BRA)', teams:13, matches:22, goals:88,
    img:'https://files.catbox.moe/sj944y.jpeg',
    mascot:null, mascotName:null,
    song:null,
    hito:'El "Maracanazo": Uruguay venció a Brasil ante ~200.000 personas en el Maracaná. No hubo partido de final oficial; fue una fase final de grupos.',
    context:'Primer Mundial tras la Segunda Guerra Mundial. Alemania y Japón fueron excluidos. El Maracaná se inauguró para este torneo. La derrota de Brasil en el partido decisivo ante Uruguay sigue siendo el mayor trauma del fútbol brasileño. Muchos aficionados quedaron en shock; hubo casos de suicidio reportados.',
    mvp:'Zizinho (BRA)', third:'Suecia',
    curiosidad:'No hubo partido de final; la decisión fue en una liguilla. Uruguay necesitaba solo empatar y ganó 2-1 ante 200.000 personas.',
    semis:['Formato de liguilla final (4 equipos). No hubo semifinales tradicionales.']
  },
  {
    year:1954, host:'Suiza', champion:'Alemania Occ.', runnerUp:'Hungría',
    topScorer:'Sándor Kocsis (11 goles, HUN)', teams:16, matches:26, goals:140,
    img:'https://files.catbox.moe/uigzn5.png',
    mascot:null, mascotName:null,
    song:null,
    hito:'"El Milagro de Berna": Alemania Occidental venció a la invencible Hungría (34 partidos sin perder). El promedio de 5,38 goles por partido sigue siendo el mayor de la historia.',
    context:'Hungría era considerada el mejor equipo del mundo y había goleado a Alemania 8-3 en la fase de grupos. La remontada alemana en la final es una de las mayores hazañas del deporte. Primera transmisión parcial por televisión. Kocsis marcó 11 goles en 5 partidos, récord aún vigente por partido.',
    mvp:'Fritz Walter (GER)', third:'Austria',
    curiosidad:'El promedio de 5,38 goles por partido es el récord histórico absoluto de un Mundial. Hubo un partido con 12 goles: Austria 7 – 5 Suiza.',
    semis:['Alemania 6 – 1 Austria', 'Hungría 4 – 2 Uruguay']
  },
  {
    year:1958, host:'Suecia', champion:'Brasil', runnerUp:'Suecia',
    topScorer:'Just Fontaine (13 goles, FRA)', teams:16, matches:35, goals:126,
    img:'https://files.catbox.moe/15mwma.png',
    mascot:null, mascotName:null,
    song:null,
    hito:'Pelé (17 años) deslumbró al mundo con su primer Mundial. Just Fontaine marcó 13 goles, récord histórico que aún se mantiene.',
    context:'El joven Pelé se presentó al planeta entero llorando de emoción al final. Primera vez que Brasil ganó fuera de América. Garrincha y Pelé formaron la dupla más desequilibrante de la historia. Suecia fue un anfitrión formidable llegando a la final en su propio estadio.',
    mvp:'Pelé (BRA)', third:'Francia',
    curiosidad:'Pelé (17 años) es el goleador más joven en una final de Copa del Mundo, con un hat-trick ante el anfitrión. Lloró de emoción sobre el hombro de Didi.',
    semis:['Brasil 5 – 2 Francia', 'Suecia 3 – 1 Alemania Occ.']
  },
  {
    year:1962, host:'Chile', champion:'Brasil', runnerUp:'Checoslovaquia',
    topScorer:'Garrincha / Vavá / L. Sánchez / Jerković / Albert / Ivanov (4 goles c/u)', teams:16, matches:32, goals:89,
    img:'https://files.catbox.moe/4opr3r.png',
    mascot:null, mascotName:null,
    song:{title:'Rock del Mundial', artist:'The Ramblers', url:'https://files.catbox.moe/yfc0l3.mp3'},
    hito:'La "Batalla de Santiago" entre Chile e Italia, uno de los partidos más violentos de la historia, con dos expulsados y lesiones graves.',
    context:'Chile organizó el torneo tras el devastador terremoto de Valdivia de 1960. Brasil sin un Pelé lesionado fue liderado magistralmente por Garrincha. Pelé solo jugó dos partidos pero el equipo fue suficientemente brillante. El árbitro inglés Ken Aston tuvo que pedir ayuda a la policía durante el Chile-Italia.',
    mvp:'Garrincha (BRA)', third:'Chile',
    curiosidad:'Garrincha fue expulsado en semifinales por una patada, pero la FIFA lo amnistió para la final. Brasil no perdió ningún partido con Garrincha en el campo.',
    semis:['Brasil 4 – 2 Chile', 'Checoslovaquia 3 – 1 Yugoslavia']
  },
  {
    year:1966, host:'Inglaterra', champion:'Inglaterra', runnerUp:'Alemania Occ.',
    topScorer:'Eusébio (9 goles, POR)', teams:16, matches:32, goals:89,
    img:'https://files.catbox.moe/uu6x32.png',
    mascot:'https://files.catbox.moe/m4qehn.png', mascotName:'Willie',
    song:{title:'World Cup Willie', artist:'Lonnie Donegan', url:'https://files.catbox.moe/62xicf.mp3'},
    hito:'El único título de Inglaterra. El trofeo Jules Rimet fue robado antes del torneo y encontrado por un perro llamado Pickles. Corea del Norte eliminó a Italia en la mayor sorpresa de la época.',
    context:'Primera mascota oficial de la historia: Willie, un león con la camiseta de Inglaterra. El gol de Hurst en la final (el famoso "gol sobre la línea") sigue siendo debatido. Eusébio de Portugal fue la figura individual del torneo con 9 goles. La selección de Corea del Norte llegó a cuartos de final venciendo a Italia.',
    mvp:'Bobby Charlton (ENG)', third:'Portugal',
    curiosidad:'El trofeo Jules Rimet fue robado antes del torneo y encontrado por un perro llamado Pickles paseando en un jardín de Londres.',
    semis:['Alemania Occ. 2 – 1 URSS', 'Inglaterra 2 – 1 Portugal']
  },
  {
    year:1970, host:'México', champion:'Brasil', runnerUp:'Italia',
    topScorer:'Gerd Müller (10 goles, GER)', teams:16, matches:32, goals:95,
    img:'https://files.catbox.moe/c6hi7m.png',
    mascot:'https://files.catbox.moe/cf2z01.png', mascotName:'Juanito',
    song:{title:'Fútbol México 70', artist:'Motto Continuo', url:'https://files.catbox.moe/h4gsar.mp3'},
    hito:'Brasil ganó el Jules Rimet definitivamente (3 títulos). El "Partido del Siglo" entre Italia y Alemania (4-3 en prórroga). Primera Copa del Mundo en colores por televisión.',
    context:'Pelé en su mejor momento colectivo con Tostão, Rivelino y Jairzinho. Brasil jugó el fútbol más hermoso de la historia; Pelé casi marcó de medio campo. El saludo entre Pelé y Bobby Moore tras el Brasil-Inglaterra es la imagen más icónica del deporte. Alemania remontó de 0-2 a Italia en solo 30 minutos para ganar en prórroga.',
    mvp:'Pelé (BRA)', third:'Alemania Occ.',
    curiosidad:'Pelé es el único jugador en la historia en ganar tres Copas del Mundo (1958, 1962, 1970). El saludo con Bobby Moore tras el Brasil-Inglaterra es icónico.',
    semis:['Italia 4 – 3 (AET) Alemania Occ. — "El Partido del Siglo"', 'Brasil 3 – 1 Uruguay']
  },
  {
    year:1974, host:'Alemania Occ.', champion:'Alemania Occ.', runnerUp:'Países Bajos',
    topScorer:'Grzegorz Lato (7 goles, POL)', teams:16, matches:38, goals:97,
    img:'https://files.catbox.moe/qqh0ic.png',
    mascot:'https://files.catbox.moe/hwzawp.png', mascotName:'Tip & Tap',
    song:{title:'Football, Football', artist:'Maryla Rodowicz', url:'https://files.catbox.moe/7akpga.mp3'},
    hito:'El "Fútbol Total" de Holanda con Johan Cruyff revolucionó el mundo. La Copa Jules Rimet fue reemplazada por la actual Copa del Mundo FIFA.',
    context:'Cruyff y su giro homónimo se hicieron eternos. Holanda dominó el torneo estéticamente pero Alemania ganó en casa siendo más pragmática. Polonia con Lato fue la sorpresa y terminó tercera. Primera participación de países como Zaire y Australia. El "Cruyff Turn" fue mostrado al mundo en el partido ante Suecia.',
    mvp:'Johan Cruyff (NED)', third:'Polonia',
    curiosidad:'Cruyff usó la camiseta de Países Bajos con solo 2 rayas en vez de 3 porque tenía contrato con Puma y la equipación era Adidas.',
    semis:['Alemania Occ. 1 – 0 Polonia', 'Países Bajos 2 – 0 Brasil']
  },
  {
    year:1978, host:'Argentina', champion:'Argentina', runnerUp:'Países Bajos',
    topScorer:'Mario Kempes (6 goles, ARG)', teams:16, matches:38, goals:102,
    img:'https://files.catbox.moe/7r0t3t.png',
    mascot:'https://files.catbox.moe/4vb3yc.png', mascotName:'Gauchito',
    song:{title:'El Mundial', artist:'Ennio Morricone', url:'https://files.catbox.moe/adncff.mp3'},
    hito:'Argentina ganó su primer título en casa bajo la dictadura militar. La victoria ante Perú (6-0) que les clasificó a la final en lugar de Brasil generó polémica histórica.',
    context:'Cruyff no participó por amenazas de muerte según confesó años después. El partido ante Perú, donde Argentina necesitaba ganar por 4 goles y ganó 6-0, nunca fue totalmente esclarecido. Kempes fue el héroe indiscutible. El estadio Monumental de Buenos Aires rugió con papel picado en uno de los espectáculos más impresionantes de la historia del fútbol.',
    mvp:'Mario Kempes (ARG)', third:'Brasil',
    curiosidad:'En el minuto 90, Rensenbrink pegó en el palo con el marcador 1-1. Un gol allí habría dado el título a Holanda sin llegar a la prórroga.',
    semis:['Formato de 2.ª fase de grupos. Argentina y Países Bajos clasificaron sus grupos para la final.']
  },
  {
    year:1982, host:'España', champion:'Italia', runnerUp:'Alemania Occ.',
    topScorer:'Paolo Rossi (6 goles, ITA)', teams:24, matches:52, goals:146,
    img:'https://files.catbox.moe/lrfbdn.png',
    mascot:'https://files.catbox.moe/fciacf.png', mascotName:'Naranjito',
    song:{title:'El Mundial', artist:'Plácido Domingo', url:'https://files.catbox.moe/4rtp90.mp3'},
    hito:'Primera edición con 24 equipos. Paolo Rossi resurgió de una suspensión de 2 años para ser el máximo goleador. El Brasil de Zico, Falcão y Sócrates fue el más aplaudido sin ganar.',
    context:'Hungría goleó 10-1 a El Salvador, récord histórico. Italia fue humillada en la fase de grupos pero se transformó de la mano de Rossi, que en cuartos marcó tres goles ante Brasil para eliminarlos. La Roja española defraudó en casa. Naranjito fue la mascota más querida de la historia del torneo.',
    mvp:'Paolo Rossi (ITA)', third:'Polonia',
    curiosidad:'Brasil hizo 15 goles en fase de grupos sin perder ningún partido, pero fue eliminado en la 2.ª fase. Hungría goleó 10-1 a El Salvador, récord histórico.',
    semis:['Italia 2 – 0 Polonia', 'Alemania Occ. 3 – 3 (AET) Francia — Alemania ganó en penaltis']
  },
  {
    year:1986, host:'México', champion:'Argentina', runnerUp:'Alemania Occ.',
    topScorer:'Gary Lineker (6 goles, ENG)', teams:24, matches:52, goals:132,
    img:'https://files.catbox.moe/rpjwpm.png',
    mascot:'https://files.catbox.moe/ipu243.png', mascotName:'Pique',
    song:{title:'Mexico 86', artist:'Juan Carlos Abara & Los Hermanos Zavala', url:'https://files.catbox.moe/49sxll.mp3'},
    hito:'Maradona marcó "La Mano de Dios" y "El Gol del Siglo" ante Inglaterra en cuartos de final. El mejor Mundial individual de la historia.',
    context:'Colombia renunció como sede y México asumió pese al terremoto de 1985. Maradona guió a Argentina desde atrás con una visión de juego sobrehumana. El "Gol del Siglo" fue elegido el mejor de la historia por los aficionados de la FIFA. Dinamarca fue la revelación de la primera fase antes de caer con España. El torneo tuvo el primer partido con tanda de penaltis: Francia-Brasil.',
    mvp:'Diego Maradona (ARG)', third:'Francia',
    curiosidad:'El "Gol del Siglo" de Maradona ante Inglaterra fue elegido el mejor gol de la historia en votación FIFA en 2002. Recorrió 60 metros driblando a 5 rivales.',
    semis:['Argentina 2 – 0 Bélgica', 'Alemania Occ. 2 – 0 Francia']
  },
  {
    year:1990, host:'Italia', champion:'Alemania Occ.', runnerUp:'Argentina',
    topScorer:'Salvatore Schillaci (6 goles, ITA)', teams:24, matches:52, goals:115,
    img:'https://files.catbox.moe/pzwarc.jpeg',
    mascot:'https://files.catbox.moe/v42lxl.png', mascotName:'Ciao',
    song:{title:"Un'estate italiana", artist:'Gianna Nannini & Edoardo Bennato', url:'https://files.catbox.moe/dg0j3e.mp3'},
    hito:'El Mundial más defensivo de la historia (1,97 goles por partido). Schillaci fue la sorpresa italiana. Roger Milla (38 años) convirtió a Camerún en los favoritos de todo el mundo.',
    context:'El último Mundial de Alemania Occidental antes de la reunificación. Argentina llegó a la final sin convencer, ganando partidos en penaltis. La mascota Ciao era un hombre-figura geométrica, la más inusual. Camerún llegó a cuartos eliminando a Argentina campeona. Fue la primera vez que un equipo africano llegaba tan lejos.',
    mvp:'Salvatore Schillaci (ITA)', third:'Italia',
    curiosidad:'Con solo 1,97 goles por partido, fue el Mundial más defensivo de la historia. Hubo 16 partidos sin gol en 52 totales.',
    semis:['Alemania Occ. 1 – 1 (AET) Inglaterra — Alemania ganó en penaltis', 'Argentina 1 – 1 (AET) Italia — Argentina ganó en penaltis']
  },
  {
    year:1994, host:'EE. UU.', champion:'Brasil', runnerUp:'Italia',
    topScorer:'Hristo Stoichkov (6, BUL) / Oleg Salenko (6, RUS)', teams:24, matches:52, goals:141,
    img:'https://files.catbox.moe/03a95w.jpeg',
    mascot:'https://files.catbox.moe/oymmb8.png', mascotName:'Striker',
    song:{title:'Gloryland', artist:'Daryl Hall & Sounds of Blackness', url:'https://files.catbox.moe/p0avp7.mp3'},
    hito:'Primera final con tanda de penaltis (Brasil 3-2 Italia). Roberto Baggio falló el último y quedó desolado. Bulgaria llegó a semifinales eliminando a Alemania.',
    context:'El fútbol llegó masivamente a EE.UU. con la mayor asistencia total de la historia: 3,58 millones. Primer Mundial sin empates en tabla (solo 3 puntos por victoria). El escandaloso positivo por dopamina de Maradona marcó su última aparición mundialista. Romario y Bebeto formaron la delantera más efectiva del torneo.',
    mvp:'Romário (BRA)', third:'Suecia',
    curiosidad:'Fue el primer Mundial sin empates en la fase de grupos (3 puntos por victoria) y con asistencia total récord: 3,58 millones de espectadores.',
    semis:['Brasil 1 – 0 Suecia', 'Italia 2 – 1 Bulgaria']
  },
  {
    year:1998, host:'Francia', champion:'Francia', runnerUp:'Brasil',
    topScorer:'Davor Šuker (6 goles, CRO)', teams:32, matches:64, goals:171,
    img:'https://files.catbox.moe/x2zroh.png',
    mascot:'https://files.catbox.moe/tr3us7.png', mascotName:'Footix',
    song:{title:'La Copa de la Vida (The Cup of Life)', artist:'Ricky Martin', url:'https://files.catbox.moe/0bekk2.mp3'},
    hito:'Primera edición con 32 equipos. Zidane marcó dos goles de cabeza en la final. El misterioso "affaire Ronaldo" — el astro brasileño convulsionó horas antes de la final y jugó en condiciones anormales.',
    context:'Francia ganó su único y hasta ahora único título en casa en el Stade de France. Zidane fue el héroe absoluto. El "affaire Ronaldo" nunca fue explicado completamente — Nike, el cuerpo técnico y los médicos se contradijeron. Croacia en su debut mundialista llegó al tercer puesto. El galés Mark Hughes... no, fue el galo Laurent Blanc el que marcó el gol de oro de la historia en octavos.',
    mvp:'Ronaldo (BRA)', third:'Croacia',
    curiosidad:'Francia es el único equipo en ganar el Mundial en casa con Zidane sin marcar ningún gol durante la fase de grupos.',
    semis:['Brasil 1 – 1 (AET) Países Bajos — Brasil ganó en penaltis', 'Francia 2 – 1 Croacia']
  },
  {
    year:2002, host:'Corea del Sur / Japón', champion:'Brasil', runnerUp:'Alemania',
    topScorer:'Ronaldo (8 goles, BRA)', teams:32, matches:64, goals:161,
    img:'https://files.catbox.moe/07d4v8.jpeg',
    mascot:'https://files.catbox.moe/z54isw.png', mascotName:'Ato, Kaz & Nik',
    song:{title:'Boom', artist:'Anastacia', url:'https://files.catbox.moe/g0x4kx.mp3'},
    hito:'Primer Mundial en Asia y con dos sedes. Corea del Sur llegó a semifinales eliminando a España, Italia y Portugal. Francia, Argentina e Italia quedaron eliminados en la fase de grupos.',
    context:'Ronaldo Nazario resurgió de sus convulsiones de 1998 para ser el mejor jugador y máximo goleador. Sus dos goles en la final sellaron el pentacampeonato brasileño. Turquía fue tercera en una gran sorpresa. El arbitraje fue muy cuestionado en los partidos de Corea del Sur. Senegal eliminó a Francia campeona en el debut.',
    mvp:'Oliver Kahn (GER)', third:'Turquía',
    curiosidad:'Oliver Kahn es el único portero y el único jugador del equipo subcampeón en ganar el Balón de Oro de un Mundial. Senegal eliminó a Francia campeona en su debut.',
    semis:['Alemania 1 – 0 Corea del Sur', 'Brasil 1 – 0 Turquía']
  },
  {
    year:2006, host:'Alemania', champion:'Italia', runnerUp:'Francia',
    topScorer:'Miroslav Klose (5 goles, GER)', teams:32, matches:64, goals:147,
    img:'https://files.catbox.moe/2rbdko.jpeg',
    mascot:'https://files.catbox.moe/p4xe2q.png', mascotName:'Goleo VI',
    song:{title:'The Time of Our Lives', artist:'Il Divo & Toni Braxton', url:'https://files.catbox.moe/569idm.mp3'},
    hito:'El cabezazo de Zidane a Materazzi en la final, la imagen más icónica y polémica de la historia del fútbol. Italia ganó en penaltis su cuarto título.',
    context:'El "Sommermärchen" (cuento de hadas de verano) alemán: el país se llenó de alegría y color. Zidane se despidió del fútbol de la forma más dramática posible. Ghana y Ecuador brillaron como representantes africanos y latinoamericanos. La mascota Goleo VI fue un león sin pantalones que generó burlas pero mucho cariño. Klose comenzó a escribir su leyenda como máximo goleador histórico de Mundiales.',
    mvp:'Zinedine Zidane (FRA)', third:'Alemania',
    curiosidad:'Zidane recibió el Balón de Oro del torneo pese a ser expulsado en la final. Fue elegido mejor jugador por la prensa antes de que se conociera el resultado.',
    semis:['Alemania 0 – 2 Italia', 'Francia 1 – 0 Portugal']
  },
  {
    year:2010, host:'Sudáfrica', champion:'España', runnerUp:'Países Bajos',
    topScorer:'Thomas Müller (5 goles, GER)', teams:32, matches:64, goals:145,
    img:'https://files.catbox.moe/krz8vw.jpeg',
    mascot:'https://files.catbox.moe/eurgtv.png', mascotName:'Zakumi',
    song:{title:'Waka Waka (Esto es África)', artist:'Shakira ft. Freshlyground', url:'https://files.catbox.moe/gxa7aq.mp3'},
    hito:'Primer Mundial en África. España ganó su único título con el "tiki-taka". El pulpo Paul acertó todos los resultados. La vuvuzela sonó en cada partido.',
    context:'El tiki-taka de España fue una revolución: dominaron con posesión y presión. Iniesta marcó el gol de la final en la prórroga. Alemania goleó 4-0 a Argentina con Messi e impresionó. La vuvuzela fue fuente de debate por el ruido constante. Paul, el pulpo alemán, predijo 8 de 8 resultados correctamente y se convirtió en estrella mundial.',
    mvp:'Diego Forlán (URU)', third:'Alemania',
    curiosidad:'El pulpo Paul predijo correctamente los 7 partidos de Alemania y la final, con una precisión del 100%. Se convirtió en estrella mundial.',
    semis:['Uruguay 2 – 3 Países Bajos', 'Alemania 0 – 1 España']
  },
  {
    year:2014, host:'Brasil', champion:'Alemania', runnerUp:'Argentina',
    topScorer:'James Rodríguez (6 goles, COL)', teams:32, matches:64, goals:171,
    img:'https://files.catbox.moe/dg7fcq.jpeg',
    mascot:'https://files.catbox.moe/xni3hn.png', mascotName:'Fuleco',
    song:{title:'We Are One (Ole Ola)', artist:'Pitbull ft. Jennifer Lopez & Claudia Leitte', url:'https://files.catbox.moe/0hok92.mp3'},
    hito:'El "Mineirazo": Alemania goleó 7-1 a Brasil en semifinales, la mayor goleada en la historia de las semis. Götze marcó el gol de la final en la prórroga ante Argentina.',
    context:'Brasil, sin Neymar lesionado y con Thiago Silva suspendido, colapsó ante Alemania en una de las noches más oscuras del fútbol. El estadio Mineirão fue escenario del mayor trauma deportivo brasileño desde el Maracanazo. James Rodríguez fue la revelación absoluta. Messi ganó el Balón de Oro del torneo pero sin el título que perseguía.',
    mvp:'Lionel Messi (ARG)', third:'Países Bajos',
    curiosidad:'El 7-1 al anfitrión Brasil en semifinales fue la mayor derrota en la historia de Brasil y la goleada más abultada en unas semifinales mundialistas.',
    semis:['Brasil 1 – 7 Alemania', 'Argentina 0 – 0 (AET) Países Bajos — Argentina ganó en penaltis']
  },
  {
    year:2018, host:'Rusia', champion:'Francia', runnerUp:'Croacia',
    topScorer:'Harry Kane (6 goles, ENG)', teams:32, matches:64, goals:169,
    img:'https://files.catbox.moe/vmy4jz.jpeg',
    mascot:'https://files.catbox.moe/ngcr6i.png', mascotName:'Zabivaka',
    song:{title:'Live It Up', artist:'Nicky Jam, Will Smith & Era Istrefi', url:'https://files.catbox.moe/g8rb8x.mp3'},
    hito:'Croacia (4 millones de habitantes) llegó a la final. Mbappé fue la figura emergente. El VAR debutó en un Mundial generando debate.',
    context:'Francia ganó con un equipo multicultural y brillante liderado por Mbappé (19 años). Croacia, con Modrić como alma, ganó sus tres partidos de eliminatoria en la prórroga o penaltis. El VAR fue clave en varias eliminaciones. Bélgica fue tercera. Argentina y Portugal fueron eliminados en octavos. Rusia llegó a cuartos como anfitrión.',
    mvp:'Luka Modrić (CRO)', third:'Bélgica',
    curiosidad:'Bélgica remontó de 0-2 contra Japón para ganar 3-2 en octavos. Croacia (4 mill. hab.) es el país más pequeño en llegar a una final desde 1954.',
    semis:['Francia 1 – 0 Bélgica', 'Croacia 2 – 1 (AET) Inglaterra']
  },
  {
    year:2022, host:'Qatar', champion:'Argentina', runnerUp:'Francia',
    topScorer:'Kylian Mbappé (8 goles, FRA)', teams:32, matches:64, goals:172,
    img:'https://files.catbox.moe/v9okur.jpeg',
    mascot:'https://files.catbox.moe/j7q9dh.png', mascotName:"La'eeb",
    song:{title:'Hayya Hayya (Better Together)', artist:'Trinidad Cardona, Davido & Aisha', url:'https://files.catbox.moe/tsipl8.mp3'},
    hito:'La mejor final de la historia: Argentina ganó 3-3 y en penaltis. Mbappé marcó un hat-trick en la final. Messi por fin campeón del mundo. Marruecos llegó a semifinales, primer equipo africano y árabe en lograrlo.',
    context:'Primer Mundial en Oriente Medio y en invierno boreal. Qatar fue el estado más pequeño en organizar un Mundial. Argentina fue de menos a más: perdió ante Arabia Saudita pero despertó. La final fue un espectáculo sin precedentes: 3-3 con Mbappé marcando tres goles, remontando de 2-0. Argentina ganó en penaltis. Messi a los 35 años obtuvo lo único que le faltaba.',
    mvp:'Lionel Messi (ARG)', third:'Croacia',
    curiosidad:'La final fue la única en la historia con 3 goles marcados en la prórroga. Mbappé marcó 3 en 97 minutos, remontando de 0-2, pero Argentina ganó en penaltis.',
    semis:['Argentina 3 – 0 Croacia', 'Francia 2 – 0 Marruecos']
  },
  {
    year:2026, host:'Canadá · México · EE. UU.', champion:'Por definir', runnerUp:'Por definir',
    topScorer:'Por definir', teams:48, matches:104, goals:'Por definir',
    img:'https://files.catbox.moe/1uogrk.jpeg',
    mascot:'https://files.catbox.moe/u7fj4i.png', mascotName:'Taini',
    song:{title:'Dai Dai', artist:'Shakira & Burna Boy', url:'https://files.catbox.moe/lay7sr.mp3'},
    hito:'El Mundial más grande de la historia: 48 selecciones, 3 países anfitriones, 104 partidos. Primer torneo con 12 grupos de 4 equipos. El pitazo inicial: México vs Sudáfrica el 11 de junio.',
    context:'La Copa del Mundo llega a Norteamérica por primera vez desde 1994 y ahora con una dimensión nunca vista. Canadá debuta como anfitrión mundialista. El estadio Azteca de México se convierte en el único que ha albergado dos finales mundialistas (1970 y 1986), ahora sumando el partido inaugural. Taini, la mascota, representa la unión de las tres culturas anfitrionas.',
    mvp:'Por definir', third:'Por definir',
    curiosidad:'Primer Mundial con 48 selecciones y 104 partidos. El Estadio Azteca acogerá el partido inaugural (México vs Sudáfrica) y es el único estadio que habrá albergado 3 mundiales.',
    semis:['Por disputar']
  }
];

// ── Audio state ──────────────────────────────────────
// ════════════════════════════════════════════════════
//  Competiciones — Historia ya no es solo Mundiales.
//  Por ahora solo "mundial" tiene contenido real; el resto
//  muestra el aviso de "en construcción" hasta que se cargue
//  su data (mismo patrón que WORLD_CUPS más arriba).
// ════════════════════════════════════════════════════
const COMPETITIONS = [
  { id: 'mundial',            label: 'Mundial',             icon: '🌍' },
  { id: 'champions',          label: 'Champions League',    icon: '⭐' },
  { id: 'libertadores',       label: 'Libertadores',        icon: '🏆' },
  { id: 'eurocopa',           label: 'Eurocopa',            icon: '🇪🇺' },
  { id: 'copa-america',       label: 'Copa América',        icon: '🌎' },
  { id: 'asia',               label: 'Copa Asiática',       icon: '🌏' },
  { id: 'africa',             label: 'Copa Africana',       icon: '🦁' },
  { id: 'sudamericana',       label: 'Sudamericana',        icon: '🥈' },
  { id: 'confederaciones',    label: 'Confederaciones',     icon: '🕓' },
  { id: 'europa-league',      label: 'Europa League',       icon: '🟠' },
  { id: 'conference-league',  label: 'Conference League',   icon: '🟢' },
  { id: 'nations-league',     label: 'Nations League',      icon: '🔷' },
];
let _activeCompetition = 'mundial';

function renderCompTabs() {
  const wrap = document.getElementById('mun-comp-tabs');
  if (!wrap) return;
  wrap.innerHTML = COMPETITIONS.map(c => `
    <button class="mun-comp-tab${c.id === _activeCompetition ? ' active' : ''}" data-comp="${c.id}" role="tab" aria-selected="${c.id === _activeCompetition}">
      ${c.icon} <span class="mun-comp-tab-label">${c.label}</span>
    </button>
  `).join('');
  wrap.querySelectorAll('.mun-comp-tab').forEach(btn => {
    btn.addEventListener('click', () => selectCompetition(btn.dataset.comp));
  });
}

function selectCompetition(id) {
  _activeCompetition = id;
  renderCompTabs();

  const grid         = document.getElementById('mun-grid');
  const construction  = document.getElementById('mun-construction');
  const eyebrow       = document.getElementById('mun-eyebrow');
  const title         = document.getElementById('mun-title');
  const sub           = document.getElementById('mun-sub');
  const comp          = COMPETITIONS.find(c => c.id === id);

  // La vista de detalle (podio, hito, contexto…) es específica del Mundial
  const dv = document.getElementById('mun-detail-view');
  if (dv?.classList.contains('visible')) {
    munStopAudio();
    dv.classList.remove('visible');
    dv.setAttribute('aria-hidden', 'true');
  }

  if (id === 'mundial') {
    if (grid) grid.style.display = '';
    if (construction) construction.style.display = 'none';
    if (title) title.innerHTML = 'HISTORIA DE LOS <span>MUNDIALES</span>';
    if (sub) sub.textContent = 'Pasa el cursor sobre cada edición para descubrirla · Haz clic para explorarla';
  } else {
    if (grid) grid.style.display = 'none';
    if (construction) construction.style.display = '';
    if (title) title.innerHTML = `HISTORIA — <span>${comp?.label || ''}</span>`;
    if (sub) sub.textContent = 'Pronto vas a poder explorar esta competición igual que el Mundial';
  }
  if (eyebrow) eyebrow.textContent = 'Panini · Experiencia Histórica';
}

let munAudio   = null;
let munPlaying = false;
let munCurrentWC = null;

function munStopAudio() {
  if (munAudio) { munAudio.pause(); munAudio.currentTime = 0; munAudio = null; munPlaying = false; }
}

function _bgVideoMute(mute) {
  const v = document.getElementById('bg-video');
  if (v) v.muted = mute;
  // Also pause/resume radio if open
  const radioBar = document.getElementById('radio-bar');
  if (mute && radioBar && radioBar.style.transform !== 'translateY(100%)') {
    const rPlay = document.getElementById('radio-play');
    if (rPlay && rPlay.textContent === '⏸') rPlay.click();
  }
}

function munPlayPause(wc) {
  if (!wc.song) return;
  const btn = document.getElementById('mun-play-btn');

  if (munPlaying && munCurrentWC === wc.year) {
    munAudio.pause(); munPlaying = false;
    if (btn) btn.textContent = '▶';
    _bgVideoMute(true); // keep video muted
    return;
  }

  if (munAudio && munCurrentWC !== wc.year) munStopAudio();

  if (!munAudio) {
    munAudio = new Audio(wc.song.url);
    munAudio.volume = 0.75;
    munAudio.addEventListener('ended', () => {
      munPlaying = false;
      if (btn) btn.textContent = '▶';
      _bgVideoMute(true);
    });
    munCurrentWC = wc.year;
  }

  _bgVideoMute(true); // ensure bg silent before playing
  munAudio.play().then(() => {
    munPlaying = true;
    if (btn) btn.textContent = '⏸';
  }).catch(() => {});
}

// ── Detail view ──────────────────────────────────────
function openWCDetail(wc) {
  munStopAudio();
  const detailView = document.getElementById('mun-detail-view');
  const inner      = document.getElementById('mun-detail-inner');
  detailView.setAttribute('aria-hidden', 'false');
  detailView.classList.add('visible');

  const hasMascot = !!wc.mascot;
  const hasSong   = !!wc.song;
  const isUpcoming = wc.year === 2026;

  inner.innerHTML = `
    <div class="mun-detail-header">
      <button class="mun-back-detail" id="mun-back-detail" aria-label="Volver a la galería">← Todos los Mundiales</button>
    </div>

    <div class="mun-detail-hero" style="--hero-img:url('${wc.img}')">
      <div class="mun-detail-hero-bg"></div>
      <div class="mun-detail-hero-content">
        <div class="mun-detail-year-badge">${wc.year}</div>
        <div class="mun-detail-host">${wc.host}</div>
        ${hasMascot ? `<img class="mun-detail-mascot" src="${wc.mascot}" alt="Mascota ${wc.mascotName}" loading="lazy">` : ''}
      </div>
    </div>

    <div class="mun-detail-body">

      ${hasSong ? `
      <div class="mun-player">
        <div class="mun-player-info">
          <span class="mun-player-icon">🎵</span>
          <div class="mun-player-meta">
            <div class="mun-player-title">${wc.song.title}</div>
            <div class="mun-player-artist">${wc.song.artist}</div>
          </div>
        </div>
        <div class="mun-player-controls">
          <button class="mun-player-btn" id="mun-play-btn" aria-label="Reproducir o pausar canción del mundial">▶</button>
          <button class="mun-player-btn mun-stop-btn" id="mun-stop-btn" aria-label="Detener canción">⏹</button>
        </div>
        <span class="mun-player-badge">🎧 CANCIÓN OFICIAL</span>
      </div>` : ''}

      <div class="mun-stats-row">
        <div class="mun-stat"><span class="mun-stat-v">${isUpcoming ? '48' : wc.teams}</span><span class="mun-stat-l">Selecciones</span></div>
        <div class="mun-stat"><span class="mun-stat-v">${isUpcoming ? '104' : wc.matches}</span><span class="mun-stat-l">Partidos</span></div>
        <div class="mun-stat"><span class="mun-stat-v">${isUpcoming ? '—' : wc.goals}</span><span class="mun-stat-l">Goles</span></div>
        <div class="mun-stat mun-stat-wide"><span class="mun-stat-v mun-stat-champ">🏆 ${wc.champion}</span><span class="mun-stat-l">Campeón</span></div>
      </div>

      ${!isUpcoming ? `
      <div class="mun-podio">
        <div class="mun-podio-item gold">
          <span class="mun-podio-medal">🥇</span>
          <div class="mun-podio-label">CAMPEÓN</div>
          <div class="mun-podio-val">${wc.champion}</div>
        </div>
        <div class="mun-podio-item silver">
          <span class="mun-podio-medal">🥈</span>
          <div class="mun-podio-label">FINALISTA</div>
          <div class="mun-podio-val">${wc.runnerUp}</div>
        </div>
        <div class="mun-podio-item bronze">
          <span class="mun-podio-medal">🥉</span>
          <div class="mun-podio-label">TERCER LUGAR</div>
          <div class="mun-podio-val">${wc.third || '—'}</div>
        </div>
      </div>

      <div class="mun-awards-row">
        <div class="mun-award">
          <span class="mun-award-icon">🏅</span>
          <div class="mun-award-label">BALÓN DE ORO</div>
          <div class="mun-award-val">${wc.mvp || '—'}</div>
        </div>
        <div class="mun-award">
          <span class="mun-award-icon">👟</span>
          <div class="mun-award-label">BOTA DE ORO</div>
          <div class="mun-award-val">${wc.topScorer}</div>
        </div>
      </div>` : `
      <div class="mun-info-block">
        <div class="mun-info-label">🥇 CAMPEÓN</div>
        <div class="mun-info-val">${wc.champion}</div>
      </div>`}

      ${wc.semis?.length ? `
      <div class="mun-semis">
        <div class="mun-semis-label">⚽ SEMIFINALES</div>
        ${wc.semis.map(s => `<div class="mun-semi-row">${s}</div>`).join('')}
      </div>` : ''}

      <div class="mun-hito">
        <div class="mun-hito-label">⭐ HITO DEL MUNDIAL</div>
        <p class="mun-hito-text">${wc.hito}</p>
      </div>

      ${wc.curiosidad ? `
      <div class="mun-curiosidad">
        <div class="mun-curiosidad-label">💡 ¿SABÍAS QUE?</div>
        <p class="mun-curiosidad-text">${wc.curiosidad}</p>
      </div>` : ''}

      <div class="mun-context">
        <div class="mun-context-label">📖 CONTEXTO</div>
        <p class="mun-context-text">${wc.context}</p>
      </div>

      ${hasMascot ? `
      <div class="mun-mascot-strip">
        <img src="${wc.mascot}" alt="${wc.mascotName}" class="mun-mascot-strip-img" loading="lazy">
        <div class="mun-mascot-strip-info">
          <div class="mun-mascot-strip-label">MASCOTA OFICIAL</div>
          <div class="mun-mascot-strip-name">${wc.mascotName}</div>
          <div class="mun-mascot-strip-year">FIFA World Cup ${wc.year}</div>
        </div>
      </div>` : ''}

    </div>
  `;

  // Detail back button
  document.getElementById('mun-back-detail').addEventListener('click', () => {
    munStopAudio();
    detailView.classList.remove('visible');
    detailView.setAttribute('aria-hidden', 'true');
  });

  // Player controls
  if (hasSong) {
    document.getElementById('mun-play-btn').addEventListener('click', () => munPlayPause(wc));
    document.getElementById('mun-stop-btn').addEventListener('click', () => {
      munStopAudio();
      const btn = document.getElementById('mun-play-btn');
      if (btn) btn.textContent = '▶';
    });
  }

  // Scroll to top
  inner.scrollTop = 0;
}

// ── Gallery ──────────────────────────────────────────
function renderMundialesGallery() {
  const grid = document.getElementById('mun-grid');
  if (!grid) return;
  grid.innerHTML = '';

  WORLD_CUPS.forEach(wc => {
    const card = document.createElement('div');
    card.className = 'mun-card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Mundial ${wc.year} - ${wc.host}`);

    const isUpcoming = wc.year === 2026;

    card.innerHTML = `
      <div class="mun-card-img-wrap">
        <img class="mun-card-img" src="${wc.img}" alt="Mundial ${wc.year}" loading="lazy">
        <div class="mun-card-overlay">
          <div class="mun-card-year">${wc.year}</div>
          <div class="mun-card-host">${wc.host}</div>
        </div>
        ${wc.mascot ? `<img class="mun-card-mascot" src="${wc.mascot}" alt="${wc.mascotName}" loading="lazy">` : ''}
        ${wc.song ? `<span class="mun-card-song-badge" aria-label="Tiene canción oficial">🎵</span>` : ''}
        ${isUpcoming ? `<span class="mun-card-live-badge">EN CURSO</span>` : ''}
      </div>
      <div class="mun-card-footer">
        <span class="mun-card-champ">${isUpcoming ? '🏆 Por definir' : '🏆 ' + wc.champion}</span>
      </div>
    `;

    card.addEventListener('click', () => openWCDetail(wc));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openWCDetail(wc); }});
    grid.appendChild(card);
  });
}

// ── Open / Close overlay ─────────────────────────────
window.openMundiales = function () {
  // Cerrar cualquier otra sección abierta antes de abrir Historia
  window.closeAllOverlays?.();
  const overlay = document.getElementById('mundiales-overlay');
  if (!overlay) return;
  munStopAudio();
  overlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
  renderCompTabs();
  selectCompetition(_activeCompetition);
  renderMundialesGallery();
};

function closeMundiales() {
  const overlay = document.getElementById('mundiales-overlay');
  if (!overlay) return;
  munStopAudio();
  overlay.classList.remove('visible');
  document.body.style.overflow = '';
  // Reset detail view
  const dv = document.getElementById('mun-detail-view');
  if (dv) { dv.classList.remove('visible'); dv.setAttribute('aria-hidden','true'); }
  // La próxima vez que se abra, empieza de nuevo en Mundial
  _activeCompetition = 'mundial';
}
// Exponer globalmente para que closeAllOverlays lo llame
window.closeMundiales = closeMundiales;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('mun-close')?.addEventListener('click', closeMundiales);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const dv = document.getElementById('mun-detail-view');
      if (dv?.classList.contains('visible')) {
        munStopAudio();
        dv.classList.remove('visible'); dv.setAttribute('aria-hidden','true');
      } else if (document.getElementById('mundiales-overlay')?.classList.contains('visible')) {
        closeMundiales();
      }
    }
  });
});
