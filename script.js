// ════════════ DATA ════════════
const STORAGE_KEY = 'album_panini_2026_v2';
const INTRO_DATA = ["WE ARE PANINI Logo","Official Emblem /1","Official Emblem /2","Official Mascots","Official Slogan","Official Ball","Host Country Emblem - CAN","Host Country Emblem - MEX","Host Country Emblem - USA"];

const albumData = {
  "🇲🇽 México":["Mexico Logo","Luis Malagón","Johan Vásquez","César Montes","Jesús Gallardo","Israel Reyes","Edson Álvarez","Marcel Ruiz","Hirving Lozano","Raúl Jiménez","Alexis Vega","Roberto Alvarado"],
  "🇿🇦 Sudáfrica":["South Africa Logo","Ronwen Williams","Aubrey Modiba","Mbekezeli Mbokazi","Siyabonga Ngezana","Khuliso Mudau","Teboho Mokoena","Yaya Sithole","Bathusi Aubaas","Sipho Mbule","Lyle Foster","Oswin Appollis"],
  "🇰🇷 República de Corea":["Korea Republic Logo","Hyeonwoo Jo","Minjae Kim","Yumin Cho","Youngwoo Seol","Jaesung Lee","Inbeom Hwang","Kangin Lee","Jens Castrop","Heungmin Son","Heechan Hwang","Hyeongyu Oh"],
  "🇨🇿 República Checa":["Czechia Logo","Matěj Kovář","Ladislav Krejčí","Vladimír Coufal","Jaroslav Zelený","Lukáš Provod","Lukáš Červ","Tomáš Souček","Pavel Šulc","Václav Černý","Adam Hložek","Patrik Schick"],
  "🇨🇦 Canadá":["Canada Logo","Dayne St. Clair","Alphonso Davies","Richie Laryea","Derek Cornelius","Stephen Eustáquio","Ismaël Koné","Jacob Shaffelburg","Niko Sigur","Tajon Buchanan","Cyle Larin","Jonathan David"],
  "🇧🇦 Bosnia y Herzegovina":["Bosnia-Herzegovina Logo","Nikola Vasilj","Amar Dedić","Sead Kolašinac","Tarik Muharemović","Nikola Katić","Benjamin Tahirović","Ivan Šunjić","Ermedin Demirović","Esmir Bajraktarević","Edin Džeko","Amar Memić"],
  "🇶🇦 Catar":["Qatar Logo","Meshaal Barsham","Sultan Albrake","Boualem Khoukhi","Pedro Miguel","Mohammed Mannai","Karim Boudiaf","Assim Madibo","Edmílson Junior","Akram Hassan Afif","Ahmed Al-Ganehi","Almoez Ali"],
  "🇨🇭 Suiza":["Switzerland Logo","Gregor Kobel","Manuel Akanji","Ricardo Rodríguez","Nico Elvedi","Silvan Widmer","Granit Xhaka","Remo Freuler","Fabian Rieder","Breel Embolo","Rubén Vargas","Dan Ndoye"],
  "🇧🇷 Brasil":["Brazil Logo","Alisson","Marquinhos","Éder Militão","Gabriel Magalhães","Casemiro","Bruno Guimarães","Vinícius Júnior","Rodrygo","Matheus Cunha","Raphinha","Estêvão"],
  "🇲🇦 Marruecos":["Morocco Logo","Yassine Bounou","Achraf Hakimi","Noussair Mazraoui","Nayef Aguerd","Romain Saïss","Sofyan Amrabat","Eliesse Ben Seghir","Bilal El Khannouss","Ismael Saibari","Youssef En-Nesyri","Brahim Díaz"],
  "🇭🇹 Haití":["Haiti Logo","Johny Placide","Carlens Arcus","Ricardo Adé","Duke Lacroix","Leverton Pierre","Danley Jean Jacques","Jean-Ricner Bellegarde","Josué Casimir","Ruben Providence","Duckens Nazon","Frantzdy Pierrot"],
  "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia":["Scotland Logo","Angus Gunn","Aaron Hickey","Andrew Robertson","John Souttar","Grant Hanley","Scott McTominay","Lewis Ferguson","Ryan Christie","John McGinn","Ché Adams","Ben Gannon-Doak"],
  "🇺🇸 EE. UU.":["USA Logo","Matt Freese","Chris Richards","Tim Ream","Mark McKenzie","Tyler Adams","Weston McKennie","Timothy Weah","Malik Tillman","Christian Pulisic","Brenden Aaronson","Folarin Balogun"],
  "🇵🇾 Paraguay":["Paraguay Logo","Orlando Gill","Gustavo Gómez","Juan José Cáceres","Omar Alderete","Júnior Alonso","Diego Gómez","Andrés Cubas","Julio Enciso","Miguel Almirón","Ramón Sosa","Antonio Sanabria"],
  "🇦🇺 Australia":["Australia Logo","Mathew Ryan","Harry Souttar","Aziz Behich","Cameron Burgess","Lewis Miller","Jackson Irvine","Riley McGree","Aiden O'Neill","Connor Metcalfe","Kusini Yengi","Nestory Irankunda"],
  "🇹🇷 Turquía":["Turkey Logo","Uğurcan Çakır","Mert Müldür","Abdülkerim Bardakcı","Merih Demiral","Ferdi Kadıoğlu","Hakan Çalhanoğlu","Orkun Kökçü","Arda Güler","Can Uzun","Kerem Aktürkoğlu","Kenan Yıldız"],
  "🇩🇪 Alemania":["Germany Logo","Marc-André ter Stegen","Antonio Rüdiger","Jonathan Tah","David Raum","Florian Wirtz","Joshua Kimmich","Leon Goretzka","Jamal Musiala","Serge Gnabry","Kai Havertz","Nick Woltemade"],
  "🇨🇼 Curaçao":["Curaçao Logo","Eloy Room","Armando Obispo","Sherel Floranus","Roshon van Eijma","Shurandy Sambo","Livano Comenencia","Juninho Bacuna","Leandro Bacuna","Kenji Gorré","Jürgen Locadia","Sontje Hansen"],
  "🇨🇮 Costa de Marfil":["Côte d'Ivoire Logo","Yahia Fofana","Ghislain Konan","Wilfried Singo","Evan Ndicka","Willy Boly","Franck Kessié","Seko Fofana","Ibrahim Sangaree","Sébastien Haller","Simon Adingra","Evann Guessand"],
  "🇪🇨 Ecuador":["Ecuador Logo","Hernán Galíndez","Piero Hincapié","Pervis Estupiñán","Willian Pacho","Ángelo Preciado","Kendry Páez","Moisés Caicedo","Alan Franco","Pedro Vite","Gonzalo Plata","Enner Valencia"],
  "🇳🇱 Países Bajos":["Netherlands Logo","Bart Verbruggen","Virgil van Dijk","Micky van de Ven","Denzel Dumfries","Tijjani Reijnders","Ryan Gravenberch","Frenkie de Jong","Xavi Simons","Memphis Depay","Donyell Malen","Cody Gakpo"],
  "🇯🇵 Japón":["Japan Logo","Zion Suzuki","Tsuyoshi Watanabe","Kaishu Sano","Ao Tanaka","Daichi Kamada","Ritsu Doan","Keito Nakamura","Takumi Minamino","Takefusa Kubo","Shuto Machino","Ayase Ueda"],
  "🇸🇪 Suecia":["Sweden Logo","Viktor Johansson","Isak Hien","Emil Holm","Victor Nilsson Lindelöf","Lucas Bergvall","Yasin Ayari","Daniel Svensson","Dejan Kulusevski","Anthony Elanga","Alexander Isak","Viktor Gyökeres"],
  "🇹🇳 Túnez":["Tunisia Logo","Aymen Dahmen","Montassar Talbi","Yassine Meriah","Ali Abdi","Ferjani Sassi","Ellyes Skhiri","Aïssa Laïdouni","Hannibal Mejbri","Naïm Sliti","Elias Achouri","Hazem Mastouri"],
  "🇧🇪 Bélgica":["Belgium Logo","Thibaut Courtois","Arthur Theate","Timothy Castagne","Maxim De Cuyper","Youri Tielemans","Kevin De Bruyne","Amadou Onana","Jérémy Doku","Charles De Ketelaere","Leandro Trossard","Romelu Lukaku"],
  "🇪🇬 Egipto":["Egypt Logo","Mohamed Elshenawy","Mohamed Hany","Yasser Ibrahim","Ramy Rabia","Marwan Attia","Zizo","Hamdy Fathy","Omar Marmoush","Mohamed Salah","Mostafa Mohamed","Trezeguet"],
  "🇮🇷 RI de Irán":["IR Iran Logo","Alireza Beiranvand","Shojae Khalilzadeh","Milad Mohammadi","Ramin Rezaeian","Hossein Kanaani","Saeed Ezatolahi","Saman Ghoddos","Mohammad Mohebi","Mehdi Taremi","Sardar Azmoun","Alireza Jahanbakhsh"],
  "🇳🇿 Nueva Zelanda":["New Zealand Logo","Max Crocombe","Michael Boxall","Liberato Cacace","Tim Payne","Finn Surman","Marko Stamenić","Joe Bell","Sarpreet Singh","Matthew Garbett","Chris Wood","Elijah Just"],
  "🇪🇸 España":["Spain Logo","Unai Simón","Robin Le Normand","Dean Huijsen","Marc Cucurella","Rodri","Martín Zubimendi","Pedri","Fabián Ruiz","Lamine Yamal","Nico Williams","Mikel Oyarzabal"],
  "🇨🇻 Cabo Verde":["Cabo Verde Logo","Vozinha","Logan Costa","Pico","Steven Moreira","João Paulo","Kevin Pina","Jamiro Monteiro","Yannick Semedo","Ryan Mendes","Jovane Cabral","Dailon Livramento"],
  "🇸🇦 Arabia Saudí":["Saudi Arabia Logo","Nawaf Alaqidi","Hassan Altambakti","Jehad Thikri","Saud Abdulhamid","Nasser Aldawsari","Abdullah Alkhaibari","Musab Aljuwayr","Feras Albrikan","Salem Aldawsari","Saleh Abu Alshamat","Saleh Alshehri"],
  "🇺🇾 Uruguay":["Uruguay Logo","Sergio Rochet","José María Giménez","Ronald Araújo","Sebastián Cáceres","Mathías Olivera","Nahitan Nández","Federico Valverde","Rodrigo Bentancur","Manuel Ugarte","Facundo Pellistri","Darwin Núñez"],
  "🇫🇷 Francia":["France Logo","Mike Maignan","William Saliba","Jules Koundé","Théo Hernández","Aurélien Tchouaméni","Eduaco Camavinga","Ousmane Dembélé","Kylian Mbappé","Bradley Barcola","Désiré Doué","Hugo Ekitiké"],
  "🇸🇳 Senegal":["Senegal Logo","Édouard Mendy","Kalidou Koulibaly","Moussa Niakhaté","El Hadji Malick Diouf","Idrissa Gana Gueye","Pape Matar Sarr","Sadio Mané","Iliman Ndiaye","Krépin Diatta","Ismaïla Sarr","Nicolas Jackson"],
  "🇮🇶 Irak":["Iraq Logo","Jalal Hassan","Hussein Ali","Akam Hashem","Merchas Doski","Zaid Tahseen","Zidane Iqbal","Amir Al-Ammari","Ibrahim Bayesh","Ali Jasim","Aimar Sher","Mohanad Ali"],
  "🇳🇴 Noruega":["Norway Logo","Ørjan Nyland","Julian Ryerson","Kristoffer Vassbakk Ajer","David Møller Wolfe","Martin Ødegaard","Sander Berge","Patrick Berg","Erling Haaland","Antonio Nusa","Oscar Bobb","Alexander Sørloth"],
  "🇦🇷 Argentina":["Argentina Logo","Emiliano Martínez","Nahuel Molina","Cristian Romero","Nicolás Otamendi","Enzo Fernández","Alexis Mac Allister","Rodrigo De Paul","Julián Alvarez","Lionel Messi","Giuliano Simeone","Lautaro Martínez"],
  "🇩🇿 Argelia":["Algeria Logo","Alexis Guendouz","Rayan Aït-Nouri","Ramy Bensebaini","Youcef Atal","Aïssa Mandi","Nabil Bentaleb","Riyad Mahrez","Saïd Benrahma","Amine Gouiri","Mohamed Amoura","Baghdad Bounedjah"],
  "🇦🇹 Austria":["Austria Logo","Alexander Schlager","David Alaba","Kevin Danso","Philipp Lienhart","Konrad Laimer","Nicolas Seiwald","Marcel Sabitzer","Florian Grillitsch","Marko Arnautović","Christoph Baumgartner","Michael Gregoritsch"],
  "🇯🇴 Jordania":["Jordan Logo","Yazeed Abulaila","Mohammad Abu Hashish","Yazan Al-Arab","Abdallah Nasib","Ibrahim Saadeh","Nizar Al-Rashdan","Noor Al-Rawabdeh","Yazan Al-Naimat","Mousa Al-Taamari","Mahmoud Al-Mardi","Ali Olwan"],
  "🇵🇹 Portugal":["Portugal Logo","Diogo Costa","Rúben Dias","Nuno Mendes","Vitinha","Bernardo Silva","Bruno Fernandes","Rúben Neves","Cristiano Ronaldo","João Félix","Pedro Neto","Rafael Leão"],
  "🇨🇩 República Democrática del Congo":["Congo DR Logo","Lionel Mpasi","Aaron Wan-Bissaka","Axel Tuanzebe","Arthur Masuaku","Chancel Mbemba","Ngal'ayel Mukau","Samuel Moutoussamy","Noah Sadiki","Théo Bongonda","Yoane Wissa","Cédric Bakambu"],
  "🇺🇿 Uzbekistán":["Uzbekistan Logo","Utkir Yusupov","Abdukodir Khusanov","Farrukh Sayfiev","Sherzod Nasrullaev","Husniddin Aliqulov","Rustam Ashurmatov","Khojiakbar Alijonov","Odiljon Hamrobekov","Otabek Shukurov","Eldor Shomurodov","Abbosbek Fayzullaev"],
  "🇨🇴 Colombia":["Colombia Logo","Camilo Vargas","Dávinson Sánchez","Yerry Mina","Daniel Muñoz","James Rodríguez","Jefferson Lerma","Richard Ríos","Juan Fernando Quintero","Luis Díaz","Jhon Arias","Luis Suárez"],
  "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra":["England Logo","Jordan Pickford","Reece James","John Stones","Jude Bellingham","Declan Rice","Jordan Henderson","Phil Foden","Harry Kane","Bukayo Saka","Cole Palmer","Marcus Rashford"],
  "🇭🇷 Croacia":["Croatia Logo","Dominik Livaković","Duje Ćaleta-Car","Joško Gvardiol","Josip Stanišić","Ivan Perišić","Luka Modrić","Mateo Kovačić","Lovro Majer","Mario Pašalić","Ante Budimir","Andrej Kramarić"],
  "🇬🇭 Ghana":["Ghana Logo","Lawrence Ati Zigi","Alidu Seidu","Alexander Djiku","Gideon Mensah","Caleb Yirenkyi","Thomas Partey","Abdul Issahaku Fatawu","Mohammed Kudus","Kamaldeen Sulemana","Jordan Ayew","Antoine Semenyo"],
  "🇵🇦 Panamá":["Panama Logo","Orlando Mosquera","Michael Amir Murillo","Andrés Andrade","Fidel Escobar","Aníbal Godoy","Cristian Martínez","Adalberto Carrasquilla","Édgar Bárcenas","José Fajardo","Ismael Díaz","José Luis Rodríguez"]
};



const GROUPS = {
  A:['🇲🇽 México','🇿🇦 Sudáfrica','🇰🇷 República de Corea','🇨🇿 República Checa'],
  B:['🇨🇦 Canadá','🇧🇦 Bosnia y Herzegovina','🇶🇦 Catar','🇨🇭 Suiza'],
  C:['🇧🇷 Brasil','🇲🇦 Marruecos','🇭🇹 Haití','🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia'],
  D:['🇺🇸 EE. UU.','🇵🇾 Paraguay','🇦🇺 Australia','🇹🇷 Turquía'],
  E:['🇩🇪 Alemania','🇨🇼 Curaçao','🇨🇮 Costa de Marfil','🇪🇨 Ecuador'],
  F:['🇳🇱 Países Bajos','🇯🇵 Japón','🇸🇪 Suecia','🇹🇳 Túnez'],
  G:['🇧🇪 Bélgica','🇪🇬 Egipto','🇮🇷 RI de Irán','🇳🇿 Nueva Zelanda'],
  H:['🇪🇸 España','🇨🇻 Cabo Verde','🇸🇦 Arabia Saudí','🇺🇾 Uruguay'],
  I:['🇫🇷 Francia','🇸🇳 Senegal','🇮🇶 Irak','🇳🇴 Noruega'],
  J:['🇦🇷 Argentina','🇩🇿 Argelia','🇦🇹 Austria','🇯🇴 Jordania'],
  K:['🇵🇹 Portugal','🇨🇩 República Democrática del Congo','🇺🇿 Uzbekistán','🇨🇴 Colombia'],
  L:['🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra','🇭🇷 Croacia','🇬🇭 Ghana','🇵🇦 Panamá']
};



const GROUP_COLORS = {
  A:'#ff6b35',B:'#2dd4bf',C:'#fbbf24',D:'#f43f5e',
  E:'#4ade80',F:'#a78bfa',G:'#fb923c',H:'#38bdf8',
  I:'#e879f9',J:'#34d399',K:'#c084fc',L:'#f87171'
};

// For jsPDF (r,g,b)
const GROUP_RGB = {
  A:[255,107,53],B:[45,212,191],C:[251,191,36],D:[244,63,94],
  E:[74,222,128],F:[167,139,250],G:[251,146,60],H:[56,189,248],
  I:[232,121,249],J:[52,211,153],K:[192,132,252],L:[248,113,113]
};

const GROUP_INFO = {
  A:{label:'Grupo del Anfitrión',analysis:'México llega como favorito absoluto siendo co-anfitrión con el respaldo de millones de aficionados. La República de Corea con Heung-min Son es la principal amenaza, mientras Sudáfrica y la República Checa buscan la sorpresa.',tags:['México Favorito','Son vs Jiménez','Sorpresa: Sudáfrica']},
  B:{label:'Grupo del Talento Joven',analysis:'Canadá como co-anfitrión trae una generación histórica con Davies y Jonathan David. Suiza, siempre competitiva, complica cualquier pronóstico. Bosnia y Herzegovina con Džeko busca su mejor resultado mundialista.',tags:['Davies & David','Suiza Sólida','Bosnia Peligrosa']},
  C:{label:'El Grupo del Maracanazo',analysis:'Brasil, la selección más laureada del mundo, es el gran favorito del grupo. Marruecos llega como la revelación de Qatar 2022 y buscará revalidar su histórica actuación. Haití y Escocia completan un grupo de alto nivel.',tags:['Brasil 5x Campeón','Marruecos Revelación','QF 2022: Marruecos']},
  D:{label:'Grupo Norteamérica vs Mundo',analysis:'EE.UU. como co-anfitrión sueña con una actuación histórica en casa liderada por Christian Pulisic. Turquía con Arda Güler y Australia, que llegó a octavos en Qatar, hacen de este grupo uno de los más disputados.',tags:['Pulisic Estrella','Arda Güler Joya','Australia en Alza']},
  E:{label:'Grupo de la Potencia Europea',analysis:'Alemania busca reivindicarse tras la decepción de Qatar 2022 con Wirtz y Musiala como su dúo más emocionante en años. Costa de Marfil con Haller y Ecuador con Moisés Caicedo son adversarios de máximo respeto.',tags:['Alemania Favorita','Wirtz & Musiala','Caicedo Top 5 Mundo']},
  F:{label:'Grupo del Juego Veloz',analysis:'Países Bajos busca su elusivo primer título con Van Dijk y Gakpo. Japón demostró en Qatar 2022 que puede eliminar a cualquier favorito. Suecia con Gyökeres e Isak tiene el mejor ataque de su historia reciente.',tags:['Oranje Naranja','Japón Sorprendió QF22','Gyökeres Imparable']},
  G:{label:'Grupo de los Reyes de África',analysis:'Bélgica con De Bruyne intenta ganar algo con su generación dorada antes de que expire. Egipto con Salah es la gran potencia africana. Irán, siempre competitiva, y Nueva Zelanda completan un grupo equilibrado.',tags:['De Bruyne Mundial','Mo Salah 900 Goles','Irán Compacta']},
  H:{label:'Grupo de los Campeones',analysis:'España, ganadora del Mundial 2010, trae a Lamine Yamal, el prodigio del Barcelona. Uruguay con Valverde y Darwin Núñez defiende la tradición de la garra charrúa. Arabia Saudí recuerda que puede dar sorpresas.',tags:['Lamine Yamal 17 años','Valverde Top Mundo','Sorpresa: Arabia Saudí']},
  I:{label:'Grupo de la Muerte',analysis:'Francia con Mbappé es el máximo favorito al título del grupo y del torneo. Senegal ganó 2 Copas Africanas consecutivas. Noruega de Haaland buscará su primer Mundial de impacto. El más difícil de predecir.',tags:['Mbappé El Mejor','Haaland Debut Mundial','Senegal 2x CAF Champ']},
  J:{label:'Grupo del Campeón Vigente',analysis:'Argentina defiende el título del mundo con Messi en lo que podría ser su última Copa del Mundo. Argelia con Mahrez busca su primer gran resultado mundialista. Austria con Alaba sorprende siempre. Jordania es la revelación de Asia.',tags:['Messi Último Baile','Mahrez Líder Argelia','Alaba Real Madrid']},
  K:{label:'Grupo Ibérico y Africano',analysis:'Portugal con Cristiano Ronaldo busca su primer Mundial. Bernardo Silva y Bruno Fernandes rodean al astro portugués. Colombia con Luis Díaz y James Rodríguez es la gran amenaza. DR Congo y Uzbekistán sorprenderán.',tags:['Ronaldo 900 Goles','Luis Díaz Liverpool','Uzbekistán Debut']},
  L:{label:'Grupo de los Inventores',analysis:'Inglaterra, inventora del fútbol, busca su segundo Mundial con Kane, Bellingham y Foden como tridente histórico. Croacia con Modrić sigue siendo temible. Ghana y Panamá completan un grupo atractivo.',tags:['Kane & Bellingham','Modrić Leyenda','Ghana Sub-campeón CAF']},
};


const COUNTRY_DATA = {
  "🇲🇽 México":{flag:'mx',wiki:'Mexico_national_football_team',nick:'El Tri',conf:'CONCACAF',rank:15,bestWC:'Cuartos de Final (1970, 1986)',founded:1927,achiev:['16 Mundiales consecutivos','Juegos Olímpicos Oro 1996','10 × Campeonato CONCACAF'],history:'La selección mexicana, conocida como <strong>"El Tri"</strong>, es la potencia histórica de la CONCACAF con 16 participaciones mundialistas consecutivas. Su Estadio Azteca es el único en albergar dos finales de Copa del Mundo (1970 y 1986), y la afición mexicana es de las más apasionadas del planeta. Raúl Jiménez e Hirving Lozano lideran esta generación que, en 2026, actúa como <strong>co-anfitrión ante su propio público</strong>, soñando con superar los octavos de final por primera vez en 40 años.'},
  "🇿🇦 Sudáfrica":{flag:'za',wiki:'South_Africa_national_football_team',nick:'Bafana Bafana',conf:'CAF',rank:68,bestWC:'Fase de Grupos (anfitriones 2010)',founded:1892,achiev:['Copa Africana de Naciones 1996','Primer anfitrión africano de un Mundial','4 × COSAFA Cup'],history:'Los <strong>"Bafana Bafana"</strong> (Los Chicos) son la única nación africana que ha organizado un Mundial, haciendo historia en 2010 ante el mundo. Ganaron la Copa Africana en 1996 como anfitriones con una generación brillante. Lyle Foster y Oswin Appollis representan una nueva era con jugadores forjados en Europa que buscan devolver a Sudáfrica a la élite continental y mundial.'},
  "🇰🇷 República de Corea":{flag:'kr',wiki:'South_Korea_national_football_team',nick:'Guerreros Taeguk',conf:'AFC',rank:22,bestWC:'Semifinales (2002)',founded:1928,achiev:['Semifinales Mundial 2002 (únicos en Asia)','2 × Copa Asiática (1956, 1960)','9 Mundiales consecutivos'],history:'Los <strong>"Guerreros Taeguk"</strong> protagonizaron la mayor sorpresa mundialista en 2002 al llegar a las semifinales como co-anfitriones, siendo la única nación asiática en lograr tal hazaña. <strong>Heung-min Son</strong>, capitán del Tottenham, es uno de los mejores extremos del planeta. Su generación también incluyó la eliminación de Portugal en Qatar 2022, demostrando su talento para las sorpresas.'},
  "🇨🇿 República Checa":{flag:'cz',wiki:'Czech_Republic_national_football_team',nick:'Los Leones',conf:'UEFA',rank:37,bestWC:'Cuartos de Final (herederos de Checoslovaquia)',founded:1901,achiev:['Final Eurocopa 1996 (República Checa)','Copa del Mundo Checoslovaquia: Final 1962','Balón de Oro 2003: Pavel Nedvěd'],history:'Heredera del glorioso legado de <strong>Checoslovaquia</strong>, la República Checa llegó a la final de la Eurocopa 1996 con una generación brillante. Pavel Nedvěd, Balón de Oro 2003, es su mayor leyenda. Hoy, <strong>Patrik Schick y Adam Hložek</strong> lideran la promisoria generación checa con talento en las mejores ligas europeas que busca devolver al país al mapa futbolístico mundial.'},
  "🇨🇦 Canadá":{flag:'ca',wiki:'Canada_national_soccer_team',nick:'Les Rouges',conf:'CONCACAF',rank:47,bestWC:'Octavos Qatar 2022 (debut moderno)',founded:1912,achiev:['Copa de Oro CONCACAF 2000','Liga de Naciones CONCACAF 2022','Primera clasificación en 36 años (Qatar 2022)'],history:'Los <strong>"Les Rouges"</strong> vivieron su renacimiento mundialista en Qatar 2022, su primer Mundial en 36 años. <strong>Alphonso Davies</strong> del Bayern Múnich y <strong>Jonathan David</strong>, uno de los máximos goleadores de Europa, forman la dupla más emocionante de su historia. Como co-anfitriones en 2026, ante su propia afición, sueñan con ir más lejos que nunca y consolidar el fútbol canadiense.'},
  "🇧🇦 Bosnia y Herzegovina":{flag:'ba',wiki:'Bosnia_and_Herzegovina_national_football_team',nick:'Zmajevi (Los Dragones)',conf:'UEFA',rank:54,bestWC:'Fase de Grupos (2014, debut)',founded:1992,achiev:['Debut Mundial 2014 con victoria ante Argentina','Edin Džeko: máximo goleador histórico','Copa COSAFA 2023'],history:'Esta nación de apenas 30 años de historia futbolística debutó brillantemente en el <strong>Mundial 2014</strong>, donde marcó goles a campeones como Argentina. La generación de <strong>Edin Džeko</strong> —uno de los grandes delanteros de su época— puso el fútbol balcánico en el mapa. Ahora Benjamin Tahirović y Amar Memić portan el testigo hacia su segunda actuación mundialista.'},
  "🇶🇦 Catar":{flag:'qa',wiki:'Qatar_national_football_team',nick:'Al Annabi (Los Granates)',conf:'AFC',rank:58,bestWC:'Fase de Grupos (anfitrión 2022)',founded:1960,achiev:['Copa Asiática 2019','Primer anfitrión árabe del Mundial','Aspire Football Dreams (academia mundial)'],history:'<strong>Catar 2022</strong> fue el primer Mundial árabe de la historia. Como anfitriones, fueron eliminados en fase de grupos, pero el proyecto deportivo catarí es de los más ambiciosos del mundo con inversiones de miles de millones. <strong>Akram Afif</strong>, Balón de Oro de la Copa Asiática 2023, lidera esta selección que busca dejar su huella en el primer Mundial donde participarán como visitantes.'},
  "🇨🇭 Suiza":{flag:'ch',wiki:'Switzerland_national_football_team',nick:'La Nati',conf:'UEFA',rank:19,bestWC:'Cuartos de Final (1934, 1938, 1954)',founded:1895,achiev:['Cuartos de Final 3 Mundiales','13 participaciones mundialistas','Logro: Octavos en Qatar 2022'],history:'La <strong>"Nati"</strong> es sinónimo de consistencia mundialista con 13 participaciones históricas. Su extraordinaria mezcla de culturas germana, italiana y francesa la convierte en un caso único. <strong>Granit Xhaka</strong>, capitán del Arsenal, es el guerrero que personifica el espíritu helvético. En Qatar 2022, eliminaron a Serbia y llegaron a cuartos, demostrando que siempre compiten aunque nunca sean favoritos.'},
  "🇧🇷 Brasil":{flag:'br',wiki:'Brazil_national_football_team',nick:'A Canarinha',conf:'CONMEBOL',rank:5,bestWC:'Campeón (1958, 1962, 1970, 1994, 2002)',founded:1914,achiev:['5 Copas del Mundo (récord mundial)','Único en participar en todos los Mundiales','9 × Copa América'],history:'La <strong>"Canarinha"</strong> es la selección más exitosa del mundo con <strong>5 títulos mundiales</strong>. El único equipo presente en todos los Mundiales, inventó el "jogo bonito" con leyendas como Pelé, Ronaldo y Ronaldinho. <strong>Vinícius Júnior</strong>, candidato eterno al Balón de Oro, y el joven Estêvão representan la nueva generación dorada que busca la sexta estrella y exorcizar el fantasma del 7-1 de 2014.'},
  "🇲🇦 Marruecos":{flag:'ma',wiki:'Morocco_national_football_team',nick:'Los Leones del Atlas',conf:'CAF',rank:14,bestWC:'Semifinales Qatar 2022 (¡Primeros africanos!)',founded:1955,achiev:['Primeros africanos en llegar a Semifinales de un Mundial (2022)','Copa Africana de Naciones 1976','2 × Copa Árabe'],history:'Los <strong>"Leones del Atlas"</strong> escribieron el capítulo más emocionante del fútbol africano en Qatar 2022, siendo el <strong>primer equipo del continente en alcanzar las semifinales mundialistas</strong>. Con Achraf Hakimi (PSG), Sofyan Amrabat y una defensa heroica, demostraron que África puede competir con los mejores. En 2026 llegan como candidatos serios a ir aún más lejos.'},
  "🇭🇹 Haití":{flag:'ht',wiki:'Haiti_national_football_team',nick:'Los Grenadiers',conf:'CONCACAF',rank:102,bestWC:'Fase de Grupos (1974)',founded:1904,achiev:['Mundial 1974 en Alemania','Campeonato CONCACAF varias ediciones','Primer gol haitiano en un Mundial'],history:'Los <strong>"Grenadiers"</strong> tienen una historia emotiva en el fútbol mundial. Participaron en el <strong>Mundial 1974</strong> en Alemania, siendo uno de los equipos caribeños más destacados de esa época. A pesar de las enormes adversidades que enfrenta el país, el fútbol haitiano cuenta con una activa diáspora en Francia y América. <strong>Frantzdy Pierrot</strong> representa las esperanzas de una nación resiliente que nunca se rinde.'},
  "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia":{flag:'gb-sct',wiki:'Scotland_national_football_team',nick:'Los Guerreros Azules',conf:'UEFA',rank:39,bestWC:'Primera ronda (múltiples participaciones)',founded:1873,achiev:['Primera selección internacional del mundo (1872)','Primer internacional: 0-0 vs Inglaterra','8 participaciones mundialistas'],history:'Escocia es una de las <strong>cuatro asociaciones fundadoras del fútbol moderno</strong>. En 1872 disputó el primer partido internacional de la historia ante Inglaterra. A pesar de su rica tradición, nunca ha superado la fase de grupos mundialista. <strong>Scott McTominay</strong> (Nápoles) y <strong>Andrew Robertson</strong> (Liverpool) lideran la generación actual que busca devolverle el orgullo a la nación del thistles.'},
  "🇺🇸 EE. UU.":{flag:'us',wiki:"United_States_men's_national_soccer_team",nick:'Stars and Stripes',conf:'CONCACAF',rank:16,bestWC:'Semifinales (1930), Octavos (2022)',founded:1913,achiev:['Semifinalistas del primer Mundial 1930','3 × Copa Oro CONCACAF','Copa América 2024: Sede'],history:'Los <strong>"Stars and Stripes"</strong> llegaron a las semifinales del primer Mundial de 1930 en Uruguay. En Qatar 2022 alcanzaron octavos con <strong>Christian Pulisic</strong> como estandarte. Como co-anfitriones en 2026, con la Major League Soccer en pleno crecimiento y una nueva generación liderada por Pulisic y Gio Reyna, sueñan con hacer historia ante el mundo en su propio territorio.'},
  "🇵🇾 Paraguay":{flag:'py',wiki:'Paraguay_national_football_team',nick:'La Albirroja',conf:'CONMEBOL',rank:64,bestWC:'Cuartos de Final (2010)',founded:1906,achiev:['2 × Copa América (1953, 1979)','Cuartos de Final: Korea 2002 y Sudáfrica 2010','Campeones absolutos de la CONMEBOL sub-20 (2007)'],history:'La <strong>"Albirroja"</strong> es una potencia histórica del fútbol sudamericano con dos Copas América. Su mejor actuación mundialista fue llegar a cuartos de final en Sudáfrica 2010, donde dieron pelea a España. <strong>Miguel Almirón</strong> del Newcastle y el joven <strong>Julio Enciso</strong> del Brighton representan la nueva guardia de un país con enorme pasión futbolística.'},
  "🇦🇺 Australia":{flag:'au',wiki:'Australia_national_soccer_team',nick:'Socceroos',conf:'AFC',rank:25,bestWC:'Cuartos de Final (2006), Octavos (2022)',founded:1961,achiev:['Cuartos de Final Alemania 2006','Octavos Qatar 2022','Copa OFC (antes de migrar a AFC)'],history:'Los <strong>"Socceroos"</strong> alcanzaron cuartos en Alemania 2006 con la magia de Harry Kewell y Mark Viduka. En Qatar 2022 eliminaron a Dinamarca con un grupo renovado. Su fútbol híbrido combina intensidad física con la técnica de jugadores forjados en Europa. <strong>Harry Souttar</strong> y el experimentado <strong>Mathew Ryan</strong> lideran esta generación comprometida con llegar aún más lejos.'},
  "🇹🇷 Turquía":{flag:'tr',wiki:'Turkey_national_football_team',nick:'Ay-Yıldızlılar',conf:'UEFA',rank:29,bestWC:'Tercer lugar (2002)',founded:1923,achiev:['3er Lugar Mundial 2002','Semifinalistas Eurocopa 2008','Hakan Şükür: gol más rápido del Mundial (11 seg, 2002)'],history:'Los turcos alcanzaron su mejor resultado mundialista en 2002 al quedar en <strong>tercer lugar</strong>, con Hakan Şükür marcando el gol más rápido en la historia de un Mundial (11 segundos). <strong>Arda Güler</strong> del Real Madrid, considerado el Mozart del fútbol, y <strong>Hakan Çalhanoğlu</strong> del Inter de Milán lideran una generación de extraordinario talento que sueña con repetir aquella hazaña.'},
  "🇩🇪 Alemania":{flag:'de',wiki:'Germany_national_football_team',nick:'Die Mannschaft',conf:'UEFA',rank:13,bestWC:'Campeón (1954, 1974, 1990, 2014)',founded:1900,achiev:['4 Copas del Mundo','4 Eurocopas','Más de 900 partidos internacionales jugados'],history:'La <strong>"Mannschaft"</strong> es una de las selecciones más exitosas de la historia con 4 títulos mundiales. Tras la decepción de Qatar 2022, donde cayeron en fase de grupos, el futuro es brillante: <strong>Florian Wirtz</strong> y <strong>Jamal Musiala</strong> forman la dupla más emocionante del fútbol europeo actualmente. Alemania llega a 2026 hambrienta de reivindicación y con una de las generaciones más talentosas de su historia reciente.'},
  "🇨🇼 Curaçao":{flag:'cw',wiki:'Curaçao_national_football_team',nick:'Los Delfines del Caribe',conf:'CONCACAF',rank:72,bestWC:'Primera clasificación (2026)',founded:1921,achiev:['Clasificación histórica al Mundial 2026','Varias participaciones en Copa Oro','Diáspora activa en Holanda'],history:'La perla del fútbol caribeño. Una nación de apenas 160.000 habitantes que produce <strong>jugadores de alto nivel</strong> gracias a su nutrida diáspora en los Países Bajos. Los hermanos <strong>Juninho y Leandro Bacuna</strong> y el experimentado <strong>Jürgen Locadia</strong> representan la ambición de este pequeño gran equipo. Su clasificación al Mundial 2026 es histórica y sería su debut absoluto en la máxima competición.'},
  "🇨🇮 Costa de Marfil":{flag:'ci',wiki:'Ivory_Coast_national_football_team',nick:'Los Elefantes',conf:'CAF',rank:50,bestWC:'Fase de Grupos (2006, 2010, 2014)',founded:1960,achiev:['2 × Copa Africana de Naciones (1992, 2015)','Didier Drogba: leyenda mundial','Copa Africana 2023: Campeones (locales)'],history:'Los <strong>"Elefantes"</strong> han conquistado la Copa Africana de Naciones en 1992 y 2015. La generación de <strong>Didier Drogba</strong> —campeón de la Champions con el Chelsea— llevó el fútbol marfileño a la cima mundial. <strong>Sébastien Haller</strong>, quien superó un cáncer testicular con ejemplo y valentía, y <strong>Simon Adingra</strong> del Brighton lideran esta nueva e ilusionante generación.'},
  "🇪🇨 Ecuador":{flag:'ec',wiki:'Ecuador_national_football_team',nick:'La Tri',conf:'CONMEBOL',rank:36,bestWC:'Octavos de Final (2006)',founded:1925,achiev:['Octavos de Final Alemania 2006','4 participaciones mundialistas','Enner Valencia: máximo goleador histórico'],history:'La <strong>"Tri"</strong> ecuatoriana ha participado en 4 Mundiales con su mejor resultado en los octavos de final de Alemania 2006. <strong>Moisés Caicedo</strong>, uno de los mejores mediocampistas defensivos del mundo en el Chelsea, es la joya más brillante de la historia del fútbol ecuatoriano. El veterano <strong>Enner Valencia</strong>, máximo goleador histórico, es el ejemplo de sacrificio y gol de varias generaciones.'},
  "🇳🇱 Países Bajos":{flag:'nl',wiki:'Netherlands_national_football_team',nick:'La Naranja Mecánica',conf:'UEFA',rank:8,bestWC:'Finalista (1974, 1978, 2010)',founded:1889,achiev:['3 Finales mundialistas sin título','Eurocopa 1988 con Van Basten y Gullit','Fútbol Total inventado por Cruyff'],history:'La <strong>"Naranja Mecánica"</strong> revolucionó el fútbol mundial en los años 70 con Johan Cruyff y el "fútbol total". Aunque finalistas en 1974, 1978 y 2010, el título mundial se les ha resistido. <strong>Virgil van Dijk</strong>, uno de los mejores defensores del planeta, y <strong>Cody Gakpo</strong> lideran una generación que quiere conquistar lo que históricamente les ha eludido. ¿Será 2026 su año?'},
  "🇯🇵 Japón":{flag:'jp',wiki:'Japan_national_football_team',nick:'Samurái Azul',conf:'AFC',rank:17,bestWC:'Cuartos de Final (2002), Octavos (2022)',founded:1921,achiev:['Eliminaron a Alemania y España en Qatar 2022','4 × Copa Asiática','9 Mundiales consecutivos'],history:'Los <strong>"Samurái Azul"</strong> escribieron el capítulo de la sorpresa en Qatar 2022 al eliminar a <strong>Alemania y España</strong> en la fase de grupos. Su fútbol veloz, ordenado y lleno de sacrificio colectivo ha conquistado al mundo. <strong>Takefusa Kubo</strong>, formado en La Masía del Barcelona y ahora estrella de la Real Sociedad, y la nueva generación de japoneses en Europa marcan una era dorada del fútbol nipón.'},
  "🇸🇪 Suecia":{flag:'se',wiki:'Sweden_national_football_team',nick:'Blågult',conf:'UEFA',rank:27,bestWC:'3er Lugar (1994), 4to (1938, 1950)',founded:1904,achiev:['3er Lugar 1994 con Brolin y Larsson','Cuna de Zlatan Ibrahimović','Gyökeres: Mejor Goleador Europa 2024-25'],history:'La <strong>"Blågult"</strong> tiene una de las historias más ricas del fútbol escandinavo: tercer lugar en 1994 con Tomas Brolin y Henrik Larsson. <strong>Zlatan Ibrahimović</strong> fue el jugador más icónico de décadas. Ahora <strong>Alexander Isak</strong> del Newcastle y <strong>Viktor Gyökeres</strong> del Sporting (el máximo goleador de Europa) forman la mejor dupla atacante de la historia reciente de Suecia.'},
  "🇹🇳 Túnez":{flag:'tn',wiki:'Tunisia_national_football_team',nick:'Águilas de Cartago',conf:'CAF',rank:32,bestWC:'Octavos de Final (2022)',founded:1956,achiev:['7 participaciones mundialistas (récord africano compartido)','Primera victoria africana en un Mundial: 3-1 México (1978)','Copa Africana 2004'],history:'Las <strong>"Águilas de Cartago"</strong> son uno de los equipos africanos con más historia mundialista. En 1978 lograron la <strong>primera victoria africana en un Mundial</strong> al vencer a México. En Qatar 2022 alcanzaron los octavos de final. <strong>Hannibal Mejbri</strong> del Manchester United es el futuro del fútbol tunecino, con una calidad técnica que recuerda a los grandes mediocampistas del continente.'},
  "🇧🇪 Bélgica":{flag:'be',wiki:'Belgium_national_football_team',nick:'Diablos Rojos',conf:'UEFA',rank:3,bestWC:'3er Lugar (2018)',founded:1895,achiev:['3er Lugar Mundial 2018','Número 1 del ranking FIFA (4 años)','Eurocopa 1980: Subcampeones'],history:'Los <strong>"Diablos Rojos"</strong> alcanzaron el tercer lugar en Rusia 2018 con lo que se llamó su "generación dorada": De Bruyne, Hazard, Lukaku y Courtois. <strong>Kevin De Bruyne</strong>, considerado uno de los mejores mediocampistas de la historia moderna, sigue siendo el faro del equipo. Bélgica busca el éxito que se les ha escapado a pesar de tener uno de los elencos más talentosos del mundo durante una década.'},
  "🇪🇬 Egipto":{flag:'eg',wiki:'Egypt_national_football_team',nick:'Los Faraones',conf:'CAF',rank:44,bestWC:'Fase de Grupos (1934, 1990, 2018)',founded:1921,achiev:['7 × Copa Africana de Naciones (récord absoluto)','Primera selección africana en un Mundial (1934)','Mohamed Salah: leyenda del Liverpool'],history:'Los <strong>"Faraones"</strong> son los campeones históricos de África con un <strong>récord de 7 títulos de la Copa Africana de Naciones</strong>. Han ganado tres ediciones consecutivas en 1957-59-74. <strong>Mohamed Salah</strong>, considerado el mejor jugador africano de la historia reciente y leyenda del Liverpool, es el ídolo absoluto de más de 100 millones de fanáticos del fútbol en Egipto.'},
  "🇮🇷 RI de Irán":{flag:'ir',wiki:'Iran_national_football_team',nick:'Selección Melli',conf:'AFC',rank:21,bestWC:'Fase de Grupos (1978, 1998, 2006, 2014, 2018, 2022)',founded:1920,achiev:['3 × Copa Asiática (1968, 1972, 1976)','6 participaciones mundialistas','Primera en eliminar a EE.UU. en 1998'],history:'La <strong>"Selección Melli"</strong> es una de las potencias del fútbol asiático con 6 participaciones mundialistas. En Qatar 2022 protagonizaron momentos dramáticos e históricos, batiendo a Gales. <strong>Mehdi Taremi</strong> del Inter de Milán y <strong>Sardar Azmoun</strong> son los referentes de una generación que combina calidad técnica con una intensidad defensiva reconocida mundialmente.'},
  "🇳🇿 Nueva Zelanda":{flag:'nz',wiki:'New_Zealand_national_football_team',nick:'All Whites',conf:'OFC',rank:97,bestWC:'Fase de Grupos (1982, 2010)',founded:1891,achiev:['Campeones de Oceanía (múltiples veces)','Invictos en el Mundial 2010 (3 empates)','Chris Wood: máximo goleador histórico'],history:'Los <strong>"All Whites"</strong> tienen una historia mundialista especial con solo dos participaciones. El rugby sigue siendo el deporte rey pero el fútbol crece. En 2010 lograron un mérito histórico: quedaron invictos con tres empates en la fase de grupos. <strong>Chris Wood</strong> del Nottingham Forest, con más de 30 goles internacionales, es el mayor goleador histórico y el símbolo de una generación que aspira a más.'},
  "🇪🇸 España":{flag:'es',wiki:'Spain_national_football_team',nick:'La Roja',conf:'UEFA',rank:9,bestWC:'Campeón (2010)',founded:1913,achiev:['Mundial 2010','3 × Eurocopa (1964, 2008, 2012)','El "tiki-taka" que cambió el fútbol'],history:'La <strong>"Roja"</strong> ganó su único y glorioso Mundial en Sudáfrica 2010 con el "tiki-taka" que revolucionó el fútbol moderno. Iniesta, Xavi y Villa fueron los héroes. También dominó Europa ganando las Eurocopas de 2008 y 2012. <strong>Lamine Yamal</strong>, con apenas 17 años y prodigio del Barcelona, lidera junto a <strong>Nico Williams</strong> una nueva era dorada española que ya ganó la Eurocopa 2024.'},
  "🇨🇻 Cabo Verde":{flag:'cv',wiki:'Cape_Verde_national_football_team',nick:'Tubarões Azuis',conf:'CAF',rank:81,bestWC:'Primera clasificación (2026)',founded:1982,achiev:['Cuartos de Final Copa Africana 2021 y 2023','Jugadores en Portugal y España','Jovane Cabral: estrella de la Lazio'],history:'Las <strong>"Tubarões Azuis"</strong> (Tiburones Azules) son la gran revelación del fútbol africano en la última década. Han llegado a cuartos de la Copa Africana en varias ediciones consecutivas. Su selección se nutre de la activa diáspora en Portugal y España. <strong>Jovane Cabral</strong> de la Lazio es su gran figura y símbolo de un archipiélago que produce talento desproporcionado a su tamaño.'},
  "🇸🇦 Arabia Saudí":{flag:'sa',wiki:'Saudi_Arabia_national_football_team',nick:'Halcones Verdes',conf:'AFC',rank:57,bestWC:'Octavos de Final (1994)',founded:1959,achiev:['3 × Copa Asiática (1984, 1988, 1996)','¡Venció a Argentina 2-1 en Qatar 2022!','Salem Al-Dawsari: héroe nacional'],history:'Los <strong>"Halcones Verdes"</strong> causaron la mayor sorpresa de Qatar 2022 al vencer a la campeona del mundo <strong>Argentina</strong> con un fútbol de presión alta y velocidad impresionante. <strong>Salem Al-Dawsari</strong> fue el héroe de esa noche histórica. Han ganado 3 Copas Asiáticas y su liga atrae ahora a las mayores estrellas del mundo. Buscan reivindicarse en el torneo americano con hambre de protagonismo.'},
  "🇺🇾 Uruguay":{flag:'uy',wiki:'Uruguay_national_football_team',nick:'La Celeste',conf:'CONMEBOL',rank:18,bestWC:'Campeón (1930, 1950)',founded:1900,achiev:['2 × Copa del Mundo (1930, 1950 - El Maracanazo)','15 × Copa América (récord mundial)','Fundadores del primer Mundial de la historia'],history:'La <strong>"Celeste"</strong> ganó los dos primeros Mundiales de la historia (1930 como anfitrión y 1950 con el legendario Maracanazo). Su <strong>"garra charrúa"</strong> es legendaria en el fútbol mundial. <strong>Federico Valverde</strong> del Real Madrid es el mejor futbolista de América del Sur actualmente, mientras que <strong>Darwin Núñez</strong> del Liverpool es la punta de lanza de esta brillante generación de jugadores orientales.'},
  "🇫🇷 Francia":{flag:'fr',wiki:'France_national_football_team',nick:'Les Bleus',conf:'UEFA',rank:2,bestWC:'Campeón (1998, 2018), Finalista (2022)',founded:1904,achiev:['2 × Copa del Mundo (1998, 2018)','2 × Eurocopa (1984, 2000)','Mbappé: el más caro en la historia del fútbol'],history:'Los <strong>"Bleus"</strong> han ganado el Mundial en 1998 (de local con el dios Zidane) y en Rusia 2018. <strong>Kylian Mbappé</strong>, el jugador más caro del mundo y delantero del Real Madrid, es considerado el mejor de su generación y posible sucesor del trono de Messi. Con el elenco más talentoso del planeta, Francia es el <strong>máximo favorito</strong> para cualquier competición que dispute en 2026.'},
  "🇸🇳 Senegal":{flag:'sn',wiki:'Senegal_national_football_team',nick:'Leones de Teranga',conf:'CAF',rank:20,bestWC:'Cuartos de Final (2002), Octavos (2022)',founded:1960,achiev:['2 × Copa Africana de Naciones (2021, 2022)','Cuartos de Final debut mundialista (2002)','Sadio Mané: el rey de África'],history:'Los <strong>"Leones de Teranga"</strong> protagonizaron cuartos de final en el Mundial 2002, su primera participación histórica. Ganaron la Copa Africana de Naciones en <strong>2021 y 2022 consecutivamente</strong>, siendo la mejor selección de África. <strong>Sadio Mané</strong>, dos veces Balón de Oro africano y ex-estrella del Liverpool, es la leyenda viva. <strong>Nicolas Jackson</strong> del Chelsea y Pape Matar Sarr representan el prometedor futuro.'},
  "🇮🇶 Irak":{flag:'iq',wiki:'Iraq_national_football_team',nick:'Leones de Mesopotamia',conf:'AFC',rank:62,bestWC:'Fase de Grupos (1986)',founded:1948,achiev:['Copa Asiática 2007 (en plena guerra civil)','Participación en el Mundial 1986','Zidane Iqbal: la nueva joya'],history:'Los <strong>"Leones de Mesopotamia"</strong> lograron su mayor hazaña ganando la <strong>Copa Asiática 2007</strong> en plena guerra civil en el país, un logro que unificó a toda la nación y emocionó al mundo entero. <strong>Zidane Iqbal</strong>, nacido en Manchester de familia iraquí y forjado en las academias de Europa, es el futuro del fútbol iraquí con una visión de juego y calidad técnica que marca diferencias.'},
  "🇳🇴 Noruega":{flag:'no',wiki:'Norway_national_football_team',nick:'Los Vikingos',conf:'UEFA',rank:31,bestWC:'Cuartos de Final (1938, 2002 fallida clasificación)',founded:1902,achiev:['Erling Haaland: El goleador más mortal del planeta','Noveno lugar en 1938','Ole Gunnar Solskjær: leyenda del Manchester United'],history:'Noruega tiene en <strong>Erling Haaland</strong> la mayor estrella del fútbol mundial actual y el delantero más mortal en la historia del deporte. El monstruo del Manchester City ha roto todos los récords posibles de goles. Paradójicamente, Noruega ha luchado por clasificar con su estrella y llega a 2026 con una generación liderada por Haaland, <strong>Martin Ødegaard</strong> y Antonio Nusa que por fin puede hacer historia.'},
  "🇦🇷 Argentina":{flag:'ar',wiki:'Argentina_national_football_team',nick:'La Albiceleste',conf:'CONMEBOL',rank:1,bestWC:'Campeón (1978, 1986, 2022)',founded:1893,achiev:['3 × Copa del Mundo (1978, 1986, 2022)','15 × Copa América','Lionel Messi: 8 Balones de Oro'],history:'Los <strong>"Albicelestes"</strong> son campeones del mundo en 1978, 1986 con el dios Maradona y 2022 con el inmortal Messi. <strong>Lionel Messi</strong>, ganador de 8 Balones de Oro y considerado el mejor jugador de la historia del fútbol, busca el bicampeonato en lo que podría ser su último Mundial. Con <strong>Julián Álvarez, Enzo Fernández y Rodrigo De Paul</strong>, la Albiceleste llega como gran favorita.'},
  "🇩🇿 Argelia":{flag:'dz',wiki:'Algeria_national_football_team',nick:'Los Zorros del Desierto',conf:'CAF',rank:52,bestWC:'Octavos de Final (1982)',founded:1958,achiev:['2 × Copa Africana de Naciones (1990, 2019)','Invictos en la Copa Africana 2019 bajo Belmadi','Riyad Mahrez: estrella del Manchester City'],history:'Los <strong>"Zorros del Desierto"</strong> ganaron la Copa Africana de Naciones en 2019 invictos bajo la brillante dirección de Belmadi. <strong>Riyad Mahrez</strong> (Al-Ahli), referente en los títulos del Manchester City de Guardiola, es la gran estrella. Su momento mundialista más histórico fue llegar a los octavos del <strong>Mundial 1982</strong> en España, donde causaron la mayor sorpresa hasta ese momento al vencer a Alemania.'},
  "🇦🇹 Austria":{flag:'at',wiki:'Austria_national_football_team',nick:'Das Nationalteam',conf:'UEFA',rank:24,bestWC:'3er Lugar (1954)',founded:1904,achiev:['3er Lugar Mundial 1954','El "Wunderteam" de los años 30: mejor equipo del mundo','David Alaba: mejor jugador austriaco de la historia'],history:'El <strong>"Wunderteam"</strong> austriaco de los años 30 fue considerado el mejor equipo del mundo, aunque la II Guerra Mundial truncó su desarrollo. Austria alcanzó el <strong>tercer lugar del Mundial 1954</strong>. <strong>David Alaba</strong> del Real Madrid, ganador de la Champions League, es el mejor futbolista austriaco de la historia moderna. Marcel Sabitzer y Florian Grillitsch también brillan en las mejores ligas europeas.'},
  "🇯🇴 Jordania":{flag:'jo',wiki:'Jordan_national_football_team',nick:'Los Nashama',conf:'AFC',rank:69,bestWC:'Primera clasificación (2026)',founded:1949,achiev:['Final Copa Asiática 2023 (primera vez)','Clasificación histórica al Mundial 2026','Mousa Al-Taamari: estrella emergente'],history:'Una selección en constante y sorprendente crecimiento. Jordania llegó por primera vez a la <strong>final de la Copa Asiática 2023</strong>, donde cayó ante Qatar, sorprendiendo al mundo árabe. <strong>Mousa Al-Taamari</strong> es su gran figura con actuaciones destacadas en Europa. Su clasificación al Mundial 2026 sería absolutamente histórica y representaría el espíritu emergente del fútbol árabe que aspira a dejar su huella en la máxima competición.'},
  "🇵🇹 Portugal":{flag:'pt',wiki:'Portugal_national_football_team',nick:'A Seleção',conf:'UEFA',rank:6,bestWC:'3er Lugar (1966), Semifinales (2006)',founded:1914,achiev:['Eurocopa 2016 (con gol de Éder)','Liga de Naciones 2019','Cristiano Ronaldo: +900 goles en su carrera'],history:'Los <strong>"Navegantes"</strong> ganaron la Eurocopa 2016 con el inesperado héroe Éder y la Liga de Naciones 2019. <strong>Cristiano Ronaldo</strong>, con más de 900 goles en su carrera y récord de goles internacionales, busca su primer y último Mundial como corona de su legendaria trayectoria. <strong>Bernardo Silva, Bruno Fernandes y Rafael Leão</strong> forman la nueva generación que quiere regalar a CR7 el título que merece.'},
  "🇨🇩 República Democrática del Congo":{flag:'cd',wiki:'Democratic_Republic_of_the_Congo_national_football_team',nick:'Los Leopardos',conf:'CAF',rank:56,bestWC:'Fase de Grupos (1974, como Zaire)',founded:1919,achiev:['2 × Copa Africana de Naciones (1968, 1974)','Primer equipo africano en marcar en un Mundial (1974)','Aaron Wan-Bissaka: Premier League'],history:'Los <strong>"Leopardos"</strong>, antes conocidos como Zaire, ganaron la Copa Africana en 1968 y 1974 y participaron en el Mundial de ese año. <strong>Aaron Wan-Bissaka</strong> (West Ham), <strong>Yoane Wissa</strong> (Brentford) y <strong>Cédric Bakambu</strong> representan el inmenso talento congoleño. Con 100 millones de habitantes y millones de apasionados aficionados, DR Congo busca volver a la élite del fútbol mundial.'},
  "🇺🇿 Uzbekistán":{flag:'uz',wiki:'Uzbekistan_national_football_team',nick:'Los Lobos Blancos',conf:'AFC',rank:71,bestWC:'Primera clasificación (2026)',founded:1946,achiev:['Copa Asiática de Fútbol Sub-23 2018','Eldor Shomurodov: estrella de la Roma','Abbosbek Fayzullaev: talento emergente'],history:'Una nación en plena revolución futbolística. Uzbekistán nunca ha participado en un Mundial, y 2026 sería su <strong>debut histórico absoluto</strong>. <strong>Eldor Shomurodov</strong> del Roma y <strong>Abbosbek Fayzullaev</strong> son sus estrellas en el fútbol europeo. El país invierte fuerte en el desarrollo del fútbol con academias modernas, y el talento uzbeko en Europa y el Medio Oriente crece año tras año de forma impresionante.'},
  "🇨🇴 Colombia":{flag:'co',wiki:'Colombia_national_football_team',nick:'Los Cafeteros',conf:'CONMEBOL',rank:11,bestWC:'Cuartos de Final (2014)',founded:1924,achiev:['Copa América 2001','James Rodríguez: Balón de Oro Mundial 2014 (6 goles)','Luis Díaz: estrella del Liverpool'],history:'Los <strong>"Cafeteros"</strong> alcanzaron los cuartos de final en Brasil 2014 con un torneo memorable. <strong>James Rodríguez</strong> fue el Balón de Oro del torneo con 6 goles, imagen icónica del Mundial. <strong>Luis Díaz</strong> del Liverpool es la nueva generación: extremo explosivo, desequilibrante e imparable. Colombia tiene actualmente una de las mejores generaciones de su historia, disputando incluso la Copa América 2024 con enorme nivel.'},
  "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra":{flag:'gb-eng',wiki:'England_national_football_team',nick:'Three Lions',conf:'UEFA',rank:4,bestWC:'Campeón (1966)',founded:1863,achiev:['Copa del Mundo 1966 en Wembley con Bobby Moore','Inventores del fútbol moderno (1863)','Jude Bellingham: El talento más valorado del mundo'],history:'La nación <strong>inventora del fútbol</strong> ganó su único título mundialista en 1966 en Wembley, con Bobby Moore levantando la Copa ante su público. El "¡El fútbol viene a casa!" es el anhelo de décadas. <strong>Harry Kane</strong> (Bayern Múnich), <strong>Jude Bellingham</strong> (Real Madrid) y <strong>Phil Foden</strong> (Manchester City) forman la trinidad dorada que lleva años siendo favorita y que puede escribir la historia que los ingleses llevan 60 años esperando.'},
  "🇭🇷 Croacia":{flag:'hr',wiki:'Croatia_national_football_team',nick:'Vatreni (Los Ardientes)',conf:'UEFA',rank:10,bestWC:'Finalista (2018), 3er Lugar (2022)',founded:1912,achiev:['Final del Mundial 2018','3er Lugar del Mundial 2022','Luka Modrić: Balón de Oro 2018'],history:'Los <strong>"Vatreni"</strong> llegaron a la final del Mundial 2018 y al tercer lugar de 2022, un rendimiento extraordinario para una nación de 4 millones de habitantes. <strong>Luka Modrić</strong>, Balón de Oro 2018, es una de las leyendas vivas del fútbol mundial. La Croacia de Modrić y Kovačić ha demostrado que las naciones pequeñas también pueden llegar a lo más alto con inteligencia táctica y calidad técnica superior.'},
  "🇬🇭 Ghana":{flag:'gh',wiki:'Ghana_national_football_team',nick:'Estrellas Negras',conf:'CAF',rank:65,bestWC:'Cuartos de Final (2010)',founded:1957,achiev:['4 × Copa Africana de Naciones (1963, 1965, 1978, 1982)','Cuartos de Final Sudáfrica 2010','Thomas Partey: Arsenal y selección'],history:'Las <strong>"Estrellas Negras"</strong> llegaron a los cuartos de final en Sudáfrica 2010, donde eliminaron al equipo local en un emocionante partido. <strong>Thomas Partey</strong> del Arsenal y <strong>Mohammed Kudus</strong> del West Ham lideran la nueva generación que busca repetir ese histórico sueño mundialista en 2026.'},
  "🇵🇦 Panamá":{flag:'pa',wiki:'Panama_national_football_team',nick:'Los Canaleros',conf:'CONCACAF',rank:55,bestWC:'Fase de Grupos (Rusia 2018)',founded:1937,achiev:['Primera clasificación al Mundial en Rusia 2018','Campeones Liga de Naciones CONCACAF 2023','Rommel Fernández: leyenda histórica'],history:'Los <strong>"Canaleros"</strong> lograron su primer Mundial en Rusia 2018, un hito histórico para el fútbol panameño. Aunque cayeron en fase de grupos, el partido ante Inglaterra fue histórico con el primer gol mundialista de Panamá, celebrado como un título nacional. <strong>Aníbal Godoy</strong> y <strong>Adalberto Carrasquilla</strong> lideran una generación competitiva que busca en 2026 superar aquella primera actuación y demostrar que el fútbol centroamericano llegó para quedarse.'}
};

// ════════════ ANTHEM ENGINE ════════════
const ANTHEMS = {
  // Grupo A
  "🇲🇽 México":           "https://upload.wikimedia.org/wikipedia/commons/transcoded/9/9d/Himno_Nacional_Mexicano_instrumental.ogg/Himno_Nacional_Mexicano_instrumental.ogg.mp3",
  "🇿🇦 Sudáfrica":        "https://upload.wikimedia.org/wikipedia/commons/transcoded/1/1d/South_African_national_anthem.oga/South_African_national_anthem.oga.mp3",
  "🇰🇷 República de Corea":"https://upload.wikimedia.org/wikipedia/commons/transcoded/7/75/National_Anthem_of_Republic_of_Korea_2018_Chorus.wav/National_Anthem_of_Republic_of_Korea_2018_Chorus.wav.mp3",
  "🇨🇿 República Checa":  "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/6e/Czech_anthem.ogg/Czech_anthem.ogg.mp3",
  // Grupo B
  "🇨🇦 Canadá":           "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/b4/United_States_Navy_Band_-_O_Canada.ogg/United_States_Navy_Band_-_O_Canada.ogg.mp3",
  "🇧🇦 Bosnia y Herzegovina":"https://upload.wikimedia.org/wikipedia/en/transcoded/d/dd/Bosnia_and_Herzegovina%27s_national_anthem.ogg/Bosnia_and_Herzegovina%27s_national_anthem.ogg.mp3",
  "🇶🇦 Catar":            "https://upload.wikimedia.org/wikipedia/commons/transcoded/e/ec/National_anthem_of_Qatar.ogg/National_anthem_of_Qatar.ogg.mp3",
  "🇨🇭 Suiza":            "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/00/Swiss_Psalm.ogg/Swiss_Psalm.ogg.mp3",
  // Grupo C
  "🇧🇷 Brasil":           "https://upload.wikimedia.org/wikipedia/commons/transcoded/9/9b/Hino_Nacional_Brasileiro_instrumental.ogg/Hino_Nacional_Brasileiro_instrumental.ogg.mp3",
  "🇲🇦 Marruecos":        "https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3f/National_Anthem_of_Morocco.ogg/National_Anthem_of_Morocco.ogg.mp3",
  "🇭🇹 Haití":            "https://upload.wikimedia.org/wikipedia/commons/transcoded/4/4f/Haiti_National_Anthem.ogg/Haiti_National_Anthem.ogg.mp3",
  "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia":        "https://files.catbox.moe/d09fhq.mp3",
  // Grupo D
  "🇺🇸 EE. UU.":          "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/65/Star_Spangled_Banner_instrumental.ogg/Star_Spangled_Banner_instrumental.ogg.mp3",
  "🇵🇾 Paraguay":         "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a6/Paraguayan_National_Anthem.oga/Paraguayan_National_Anthem.oga.mp3",
  "🇦🇺 Australia":        "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a6/U.S._Navy_Band%2C_Advance_Australia_Fair_%28instrumental%29.ogg/U.S._Navy_Band%2C_Advance_Australia_Fair_%28instrumental%29.ogg.mp3",
  "🇹🇷 Turquía":          "https://upload.wikimedia.org/wikipedia/commons/transcoded/9/99/Istikl%C3%A2l_Marsi_instrumetal.ogg/Istikl%C3%A2l_Marsi_instrumetal.ogg.mp3",
  // Grupo E
  "🇩🇪 Alemania":         "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a6/German_national_anthem_performed_by_the_US_Navy_Band.ogg/German_national_anthem_performed_by_the_US_Navy_Band.ogg.mp3",
  "🇨🇼 Curaçao":          "https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7a/Curacaoanthem.ogg/Curacaoanthem.ogg.mp3",
  "🇨🇮 Costa de Marfil":  "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/67/United_States_Navy_Band_-_National_Anthem_of_C%C3%B4te_D%27Ivoire_%22L%27Abidjanaise%22.ogg/United_States_Navy_Band_-_National_Anthem_of_C%C3%B4te_D%27Ivoire_%22L%27Abidjanaise%22.ogg.mp3",
  "🇪🇨 Ecuador":          "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/6e/Anthem_of_Ecuador.ogg/Anthem_of_Ecuador.ogg.mp3",
  // Grupo F
  "🇳🇱 Países Bajos":     "https://upload.wikimedia.org/wikipedia/commons/transcoded/f/f5/United_States_Navy_Band_-_Het_Wilhelmus_%28tempo_corrected%29.ogg/United_States_Navy_Band_-_Het_Wilhelmus_%28tempo_corrected%29.ogg.mp3",
  "🇯🇵 Japón":            "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a3/Kimi_ga_Yo_instrumental.ogg/Kimi_ga_Yo_instrumental.ogg.mp3",
  "🇸🇪 Suecia":           "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/02/United_States_Navy_Band_-_Sweden.ogg/United_States_Navy_Band_-_Sweden.ogg.mp3",
  "🇹🇳 Túnez":            "https://upload.wikimedia.org/wikipedia/commons/transcoded/2/23/Humat_al-Hima.ogg/Humat_al-Hima.ogg.mp3",
  // Grupo G
  "🇧🇪 Bélgica":          "https://upload.wikimedia.org/wikipedia/commons/transcoded/e/e8/La_Braban%C3%A7onne.oga/La_Braban%C3%A7onne.oga.mp3",
  "🇪🇬 Egipto":           "https://upload.wikimedia.org/wikipedia/commons/transcoded/f/f2/Bilady%2C_Bilady%2C_Bilady.ogg/Bilady%2C_Bilady%2C_Bilady.ogg.mp3",
  "🇮🇷 RI de Irán":       "https://upload.wikimedia.org/wikipedia/commons/transcoded/f/f2/Sorud-e_Mell%C3%AD-e_Yomhur%C3%AD-e_Eslam%C3%AD-e_Ir%C3%A1n_%28instrumental%29.oga/Sorud-e_Mell%C3%AD-e_Yomhur%C3%AD-e_Eslam%C3%AD-e_Ir%C3%A1n_%28instrumental%29.oga.mp3",
  "🇳🇿 Nueva Zelanda":    "https://upload.wikimedia.org/wikipedia/commons/transcoded/d/d6/God_Defend_New_Zealand_instrumental.ogg/God_Defend_New_Zealand_instrumental.ogg.mp3",
  // Grupo H
  "🇪🇸 España":           "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c8/Marcha_Real-Royal_March_by_US_Navy_Band.ogg/Marcha_Real-Royal_March_by_US_Navy_Band.ogg.mp3",
  "🇨🇻 Cabo Verde":       "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/b6/C%C3%A2ntico_da_Liberdade_%28instrumental%29.ogg/C%C3%A2ntico_da_Liberdade_%28instrumental%29.ogg.mp3",
  "🇸🇦 Arabia Saudí":     "https://upload.wikimedia.org/wikipedia/commons/transcoded/f/f0/Aash_Al_Maleek_instrumental.ogg/Aash_Al_Maleek_instrumental.ogg.mp3",
  "🇺🇾 Uruguay":          "https://upload.wikimedia.org/wikipedia/commons/transcoded/2/2b/United_States_Navy_Band_-_National_Anthem_of_Uruguay_%28complete%29.ogg/United_States_Navy_Band_-_National_Anthem_of_Uruguay_%28complete%29.ogg.mp3",
  // Grupo I
  "🇫🇷 Francia":          "https://upload.wikimedia.org/wikipedia/commons/transcoded/3/30/La_Marseillaise.ogg/La_Marseillaise.ogg.mp3",
  "🇸🇳 Senegal":          "https://upload.wikimedia.org/wikipedia/commons/transcoded/8/8c/National_Anthem_of_Senegal.ogg/National_Anthem_of_Senegal.ogg.mp3",
  "🇮🇶 Irak":             "https://upload.wikimedia.org/wikipedia/commons/transcoded/1/16/United_States_Navy_Band_-_Mawtini.ogg/United_States_Navy_Band_-_Mawtini.ogg.mp3",
  "🇳🇴 Noruega":          "https://upload.wikimedia.org/wikipedia/commons/transcoded/f/f6/Norway_%28National_Anthem%29.ogg/Norway_%28National_Anthem%29.ogg.mp3",
  // Grupo J
  "🇦🇷 Argentina":        "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/cd/Himno_Nacional_Argentino_instrumental.ogg/Himno_Nacional_Argentino_instrumental.ogg.mp3",
  "🇩🇿 Argelia":          "https://upload.wikimedia.org/wikipedia/commons/transcoded/4/48/Kassaman_instrumental.ogg/Kassaman_instrumental.ogg.mp3",
  "🇦🇹 Austria":          "https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7c/Land_der_Berge_Land_am_Strome_instrumental.ogg/Land_der_Berge_Land_am_Strome_instrumental.ogg.mp3",
  "🇯🇴 Jordania":         "https://upload.wikimedia.org/wikipedia/commons/transcoded/e/ee/National_anthem_of_Jordan_instrumental.ogg/National_anthem_of_Jordan_instrumental.ogg.mp3",
  // Grupo K
  "🇵🇹 Portugal":         "https://upload.wikimedia.org/wikipedia/commons/transcoded/5/58/A_Portuguesa.ogg/A_Portuguesa.ogg.mp3",
  "🇨🇩 República Democrática del Congo": "https://files.catbox.moe/5ln77y.mp3",
  "🇺🇿 Uzbekistán":       "https://upload.wikimedia.org/wikipedia/commons/transcoded/3/36/National_Anthem_of_Uzbekistan_%28Instrumental%29.ogg/National_Anthem_of_Uzbekistan_%28Instrumental%29.ogg.mp3",
  "🇨🇴 Colombia":         "https://upload.wikimedia.org/wikipedia/commons/transcoded/5/55/United_States_Navy_Band_-_%C2%A1Oh%2C_gloria_inmarcesible%21.ogg/United_States_Navy_Band_-_%C2%A1Oh%2C_gloria_inmarcesible%21.ogg.mp3",
  // Grupo L
  "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra":    "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/03/United_States_Navy_Band_-_God_Save_the_Queen.oga/United_States_Navy_Band_-_God_Save_the_Queen.oga.mp3",
  "🇭🇷 Croacia":          "https://upload.wikimedia.org/wikipedia/commons/transcoded/d/df/Lijepa_nasa_domovino_instrumental.ogg/Lijepa_nasa_domovino_instrumental.ogg.mp3",
  "🇬🇭 Ghana":            "https://upload.wikimedia.org/wikipedia/commons/transcoded/4/43/National_Anthem_of_Ghana.ogg/National_Anthem_of_Ghana.ogg.mp3",
  "🇵🇦 Panamá":           "https://upload.wikimedia.org/wikipedia/commons/transcoded/4/4a/Panama_National_Anthem.ogg/Panama_National_Anthem.ogg.mp3",
};

let _anthemAudio = null;

function playAnthem(country) {
  stopAnthem();
  pauseRadio(false); // pausa radio sin restaurar video (el himno toma el control)

  const url = ANTHEMS[country];
  if (!url) return;

  const bgVideo = document.getElementById('bg-video');
  if (bgVideo) { bgVideo._prevVolume = bgVideo.volume; bgVideo.volume = 0; }

  _anthemAudio = new Audio(url);
  _anthemAudio.volume = Math.min(1, getEffectiveVolume() + 0.1);
  _anthemAudio.play().catch(() => {});
}

function stopAnthem() {
  if (_anthemAudio) { _anthemAudio.pause(); _anthemAudio.currentTime = 0; _anthemAudio = null; }
  const bgVideo = document.getElementById('bg-video');
  if (bgVideo && !_radioPlaying) {
    bgVideo.volume = bgVideo._prevVolume != null ? bgVideo._prevVolume : getEffectiveVolume();
    bgVideo._prevVolume = null;
  }
}

// ════════════ STATE ════════════
let state = {};
let activeGroup = 'all';
let activeStatus = 'all';
let searchQuery = '';
let currentOverlayCountry = null;
let pdfMode = 'owned';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    state = raw ? JSON.parse(raw) : {};
  } catch(e) { state = {}; }
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
}
function getStickerKey(country, idx) { return country + '::' + idx; }
function getStickerState(country, idx) { return state[getStickerKey(country, idx)] || 'none'; }
function cycleStickerState(country, idx) {
  const k = getStickerKey(country, idx);
  const cur = state[k] || 'none';
  if (cur === 'none') state[k] = 'tengo';
  else if (cur === 'tengo') state[k] = 'falta';
  else { state[k] = 'none'; clearStickerSubState(country, idx); }
  saveState();
}

// ── SUB-STATES ──
function getSubKey(c, i) { return c + '::' + i + '::sub'; }
function getStickerSubState(c, i) { return state[getSubKey(c, i)] || null; }
function cycleStickerSubState(c, i) {
  const k = getSubKey(c, i);
  const cur = state[k] || null;
  if (!cur) state[k] = 'repetida';
  else if (cur === 'repetida') state[k] = 'reserva';
  else delete state[k];
  saveState();
}
function clearStickerSubState(c, i) { delete state[getSubKey(c, i)]; saveState(); }

// ── MASTER VOLUME ──
let masterVolume = 0.6;
let masterMuted  = false;

function getEffectiveVolume() { return masterMuted ? 0 : masterVolume; }

function applyMasterVolume() {
  const v = getEffectiveVolume();
  const bg = document.getElementById('bg-video');
  // Only update bg if no anthem/radio override is active
  if (bg && !_anthemAudio && !_radioPlaying) bg.volume = v;
  if (_anthemAudio) _anthemAudio.volume = Math.min(1, v + 0.1);
  if (_radioAudio)  _radioAudio.volume  = v;
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

// ════════════ STATS ════════════
function getCountryStats(country) {
  const stickers = albumData[country];
  if (!stickers) return {owned:0,missing:0,total:0,pct:0,repetida:0,reserva:0};
  let owned=0,missing=0,repetida=0,reserva=0;
  stickers.forEach((_, i) => {
    const s = getStickerState(country, i);
    const sub = getStickerSubState(country, i);
    if (s === 'tengo') owned++;
    else if (s === 'falta') missing++;
    if (sub === 'repetida') repetida++;
    else if (sub === 'reserva') reserva++;
  });
  const total = stickers.length;
  return {owned, missing, total, pct: total ? Math.round(owned/total*100) : 0, repetida, reserva};
}
function getGroupStats(grp) {
  const countries = GROUPS[grp] || [];
  let owned=0, total=0;
  countries.forEach(c => {
    const s = getCountryStats(c);
    owned += s.owned; total += s.total;
  });
  return {owned, total, pct: total ? Math.round(owned/total*100) : 0};
}
function getGlobalStats() {
  let owned=0, missing=0, total=0, repetida=0, reserva=0;

  INTRO_DATA.forEach((_, i) => {
    const s = getStickerState('INTRO', i);
    const sub = getStickerSubState('INTRO', i);
    if (s === 'tengo') owned++;
    else if (s === 'falta') missing++;
    if (sub === 'repetida') repetida++;
    else if (sub === 'reserva') reserva++;
    total++;
  });

  Object.keys(albumData).forEach(c => {
    const s = getCountryStats(c);
    owned += s.owned; missing += s.missing; total += s.total;
    repetida += s.repetida; reserva += s.reserva;
  });

  return {owned, missing, total, pct: total ? Math.round(owned/total*100) : 0, repetida, reserva};
}
function updateStatsBar() {
  const gs = getGlobalStats();
  document.getElementById('s-total').textContent = gs.total;
  document.getElementById('s-tengo').textContent = gs.owned;
  document.getElementById('s-falta').textContent = gs.missing;
  document.getElementById('s-pct').textContent   = gs.pct + '%';
  document.getElementById('s-rep').textContent   = gs.repetida;
  document.getElementById('s-res').textContent   = gs.reserva;
}

// ════════════ GROUP TABS ════════════
function buildGroupTabs() {
  const wrap = document.getElementById('group-tabs');
  wrap.innerHTML = '';
  // ALL
  const allBtn = document.createElement('button');
  allBtn.className = 'gtab all-tab' + (activeGroup==='all' ? ' active' : '');
  allBtn.dataset.group = 'all';
  allBtn.style.background = activeGroup==='all' ? 'var(--gold)' : 'var(--card)';
  allBtn.innerHTML = 'TODOS';
  wrap.appendChild(allBtn);

  'ABCDEFGHIJKL'.split('').forEach(g => {
    const gs = getGroupStats(g);
    const col = GROUP_COLORS[g];
    const btn = document.createElement('button');
    btn.className = 'gtab' + (activeGroup===g ? ' active' : '');
    btn.dataset.group = g;
    btn.style.background = activeGroup===g ? col : 'var(--card)';
    btn.style.borderColor = activeGroup===g ? col : 'var(--border)';
    btn.innerHTML = `<span>${g}</span><span class="gtab-pct">${gs.pct}%</span>`;
    wrap.appendChild(btn);
  });

  wrap.querySelectorAll('.gtab').forEach(btn => {
    btn.addEventListener('click', () => {
      activeGroup = btn.dataset.group;
      buildGroupTabs();
      renderGroups();
    });
  });
}

// ════════════ RENDER GROUPS ════════════
function renderGroups() {
  const container = document.getElementById('groups-container');
  container.innerHTML = '';

  if (activeGroup === 'all' && !searchQuery) {
    const introOwned = INTRO_DATA.filter((_, i) => getStickerState('INTRO', i) === 'tengo').length;
    const introPct = INTRO_DATA.length ? Math.round(introOwned / INTRO_DATA.length * 100) : 0;

    const introAcc = document.createElement('div');
    introAcc.className = 'group-accordion open';
    introAcc.style.setProperty('--g-color', '#f5c518');

    introAcc.innerHTML = `
      <div class="group-header" data-grp="INTRO">
        <div class="group-letter" style="background:#f5c518">✨</div>
        <div class="group-header-info">
          <div class="group-label">Intro</div>
          <div class="group-names">WE ARE PANINI · Emblems · Mascots · Slogan · Ball · Hosts</div>
          <div class="group-prog-wrap">
            <div class="group-prog-track">
              <div class="group-prog-fill" style="background:#f5c518;width:${introPct}%"></div>
            </div>
            <span class="group-prog-pct" style="color:#f5c518">${introPct}%</span>
          </div>
        </div>
      </div>
      <div class="group-body expanded">
        <ul class="sticker-list" id="intro-list"></ul>
      </div>
    `;

    container.appendChild(introAcc);

    const introList = introAcc.querySelector('#intro-list');
    function renderIntroList() {
      introList.innerHTML = '';
      INTRO_DATA.forEach((name, ii) => {
        const st  = getStickerState('INTRO', ii);
        const sub = getStickerSubState('INTRO', ii);

        if (activeStatus === 'tengo'    && st  !== 'tengo')    return;
        if (activeStatus === 'falta'    && st  !== 'falta')    return;
        if (activeStatus === 'repetida' && sub !== 'repetida') return;
        if (activeStatus === 'reserva'  && sub !== 'reserva')  return;
        if (searchQuery && !name.toLowerCase().includes(searchQuery)) return;

        const stClass  = st  === 'tengo' ? ' state-tengo' : st  === 'falta' ? ' state-falta' : '';
        const subClass = sub ? ' sub-' + sub : '';
        const li = document.createElement('li');
        li.className = 'sticker' + stClass + subClass;
        li.dataset.country = 'INTRO';
        li.dataset.idx = ii;

        const subLabel   = sub === 'repetida' ? '🔄 REP' : sub === 'reserva' ? '📌 RES' : '+';
        const subBtnHtml = st !== 'none'
          ? `<span class="s-sub-btn sub-${sub||'none'}">${subLabel}</span>`
          : '';

        li.innerHTML = `<span class="s-num">#${ii+1}</span><span class="s-name">${name}</span>
          ${subBtnHtml}
          <span class="s-badge">${st === 'tengo' ? 'TENGO' : st === 'falta' ? 'FALTA' : '—'}</span>`;

        li.addEventListener('click', (e) => {
          if (e.target.closest('.s-sub-btn')) return;
          cycleStickerState('INTRO', ii);
          updateAll();
          const introPct2 = INTRO_DATA.length ? Math.round(
            INTRO_DATA.filter((_, x) => getStickerState('INTRO', x) === 'tengo').length / INTRO_DATA.length * 100
          ) : 0;
          const fill = introAcc.querySelector('.group-prog-fill');
          const pct  = introAcc.querySelector('.group-prog-pct');
          if (fill) fill.style.width = introPct2 + '%';
          if (pct)  pct.textContent  = introPct2 + '%';
          renderIntroList();
        });

        const subBtn = li.querySelector('.s-sub-btn');
        if (subBtn) {
          subBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            cycleStickerSubState('INTRO', ii);
            updateAll();
            renderIntroList();
          });
        }

        introList.appendChild(li);
      });
    }
    renderIntroList();
  }

  let groupsToShow = 'ABCDEFGHIJKL'.split('');
  if (activeGroup !== 'all') groupsToShow = [activeGroup];

  groupsToShow.forEach((grp, gi) => {
    const countries = GROUPS[grp];
    const gColor = GROUP_COLORS[grp];
    const gInfo = GROUP_INFO[grp];
    const gs = getGroupStats(grp);

    // Filter by search / status at country level
    const visibleCountries = countries.filter(c => {
      if (searchQuery) {
        const stickers = albumData[c] || [];
        const match = c.toLowerCase().includes(searchQuery) ||
          stickers.some(s => s.toLowerCase().includes(searchQuery));
        if (!match) return false;
      }
      return true;
    });
    if (visibleCountries.length === 0) return;

    const acc = document.createElement('div');
    acc.className = 'group-accordion';
    acc.style.setProperty('--g-color', gColor);
    acc.style.animationDelay = (gi * 0.06) + 's';

    // Names string
    const nameStr = countries.map(c => c.replace(/^[\p{Emoji}\s]+/u,'')).join(' · ');

    acc.innerHTML = `
      <div class="group-header" data-grp="${grp}">
        <div class="group-letter" style="background:${gColor}">${grp}</div>
        <div class="group-header-info">
          <div class="group-label">${gInfo ? gInfo.label : 'Grupo '+grp}</div>
          <div class="group-names">${nameStr}</div>
          <div class="group-prog-wrap">
            <div class="group-prog-track">
              <div class="group-prog-fill" style="background:${gColor};width:${gs.pct}%"></div>
            </div>
            <span class="group-prog-pct" style="color:${gColor}">${gs.pct}%</span>
          </div>
        </div>
        <div class="group-flags" id="flags-${grp}"></div>
        <svg class="group-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div class="group-body" id="body-${grp}">
        <div id="countries-${grp}"></div>
        ${gInfo ? `<div class="group-info-card">
          <h4>📊 ${gInfo.label}</h4>
          <p>${gInfo.analysis}</p>
          <div class="group-info-tags">${gInfo.tags.map(t=>`<span class="g-tag">${t}</span>`).join('')}</div>
        </div>` : ''}
      </div>`;

    container.appendChild(acc);

    // Mini flags
    const flagsDiv = acc.querySelector(`#flags-${grp}`);
    countries.forEach(c => {
      const cd = COUNTRY_DATA[c];
      if (!cd) return;
      const img = document.createElement('img');
      img.className = 'mini-flag';
      img.src = `https://flagcdn.com/w40/${cd.flag}.png`;
      img.alt = c;
      img.onerror = () => { img.style.display='none'; };
      flagsDiv.appendChild(img);
    });

    // Header click → expand
    acc.querySelector('.group-header').addEventListener('click', () => toggleGroup(grp, acc));

    // If only one group shown, auto-open
    if (activeGroup !== 'all') {
      setTimeout(() => toggleGroup(grp, acc, true), 80);
    }
  });
}

function toggleGroup(grp, acc, forceOpen) {
  const body = document.getElementById('body-'+grp);
  const isOpen = acc.classList.contains('open');
  if (forceOpen && isOpen) return;
  if (forceOpen || !isOpen) {
    acc.classList.add('open');
    body.classList.add('expanded');
    renderCountries(grp);
  } else {
    acc.classList.remove('open');
    body.classList.remove('expanded');
  }
}

function renderCountries(grp) {
  const wrap = document.getElementById('countries-'+grp);
  if (!wrap) return;
  wrap.innerHTML = '';
  const countries = GROUPS[grp];
  const gColor = GROUP_COLORS[grp];

  countries.forEach(c => {
    // Search filter
    if (searchQuery) {
      const stickers = albumData[c] || [];
      const match = c.toLowerCase().includes(searchQuery) ||
        stickers.some(s => s.toLowerCase().includes(searchQuery));
      if (!match) return;
    }

    const cs = getCountryStats(c);
    const cd = COUNTRY_DATA[c];
    const flagCode = cd ? cd.flag : 'xx';

    const sec = document.createElement('div');
    sec.className = 'country-section';

    sec.innerHTML = `
      <div class="country-header" data-country="${c}">
        <div class="country-flag-wrap">
          <img class="country-flag" src="https://flagcdn.com/w80/${flagCode}.png" alt="${c}" onerror="this.style.display='none'">
        </div>
        <div class="country-info">
          <div class="country-name">${c}</div>
          <div class="cp-wrap">
            <div class="cp-track"><div class="cp-fill" style="background:${gColor};width:${cs.pct}%"></div></div>
            <span class="cp-text">${cs.owned}/${cs.total} · ${cs.pct}%</span>
          </div>
        </div>
        <button class="view-btn" data-country="${c}">VER SELECCIÓN →</button>
      </div>
      <ul class="sticker-list" id="slist-${CSS.escape(c)}" style="display:none"></ul>`;

    wrap.appendChild(sec);

    // Toggle sticker list on header click
    sec.querySelector('.country-header').addEventListener('click', (e) => {
      if (e.target.closest('.view-btn')) return;
      const list = sec.querySelector('.sticker-list');
      if (list.style.display === 'none') {
        list.style.display = '';
        renderStickerList(c, list, gColor);
      } else {
        list.style.display = 'none';
      }
    });

    // View overlay button
    sec.querySelector('.view-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openOverlay(c);
    });
  });
}

function renderStickerList(country, listEl, gColor) {
  listEl.innerHTML = '';
  const stickers = albumData[country] || [];
  stickers.forEach((name, i) => {
    const st  = getStickerState(country, i);
    const sub = getStickerSubState(country, i);

    // Status filter
    if (activeStatus === 'tengo'    && st !== 'tengo') return;
    if (activeStatus === 'falta'    && st !== 'falta') return;
    if (activeStatus === 'repetida' && sub !== 'repetida') return;
    if (activeStatus === 'reserva'  && sub !== 'reserva')  return;
    if (searchQuery && !name.toLowerCase().includes(searchQuery) && !country.toLowerCase().includes(searchQuery)) return;

    const li = document.createElement('li');
    const stClass = st === 'tengo' ? ' state-tengo' : st === 'falta' ? ' state-falta' : '';
    const subClass = sub ? ' sub-' + sub : '';
    li.className = 'sticker' + stClass + subClass;
    li.dataset.country = country;
    li.dataset.idx = i;

    const subLabel = sub === 'repetida' ? '🔄 REP' : sub === 'reserva' ? '📌 RES' : '+';
    const subBtnHtml = st !== 'none'
      ? `<span class="s-sub-btn sub-${sub||'none'}">${subLabel}</span>`
      : '';

    li.innerHTML = `<span class="s-num">#${i+1}</span><span class="s-name">${name}</span>
      ${subBtnHtml}
      <span class="s-badge">${st === 'tengo' ? 'TENGO' : st === 'falta' ? 'FALTA' : '—'}</span>`;

    // Primary click → cycle main state
    li.addEventListener('click', (e) => {
      if (e.target.closest('.s-sub-btn')) return;
      cycleStickerState(country, i);
      updateAll();
      const pl = li.closest('.sticker-list');
      const pg = li.closest('.group-accordion');
      const gc = pg ? pg.querySelector('.group-header').dataset.grp : null;
      renderStickerList(country, pl, gc ? GROUP_COLORS[gc] : gColor);
      updateCountryBar(country, gc ? GROUP_COLORS[gc] : gColor);
    });

    // Sub-state click
    const subBtn = li.querySelector('.s-sub-btn');
    if (subBtn) {
      subBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        cycleStickerSubState(country, i);
        updateAll();
        const pl = li.closest('.sticker-list');
        const pg = li.closest('.group-accordion');
        const gc = pg ? pg.querySelector('.group-header').dataset.grp : null;
        renderStickerList(country, pl, gc ? GROUP_COLORS[gc] : gColor);
      });
    }

    listEl.appendChild(li);
  });
}

function updateCountryBar(country, gColor) {
  const cs = getCountryStats(country);
  const fill = document.querySelector(`.country-header[data-country="${country}"] .cp-fill`);
  const text = document.querySelector(`.country-header[data-country="${country}"] .cp-text`);
  if (fill) { fill.style.width = cs.pct + '%'; fill.style.background = gColor; }
  if (text) text.textContent = `${cs.owned}/${cs.total} · ${cs.pct}%`;
  // also update group progress
  const grp = Object.keys(GROUPS).find(g => GROUPS[g].includes(country));
  if (grp) {
    const gs = getGroupStats(grp);
    const gFill = document.querySelector(`.group-header[data-grp="${grp}"] .group-prog-fill`);
    const gPct = document.querySelector(`.group-header[data-grp="${grp}"] .group-prog-pct`);
    if (gFill) gFill.style.width = gs.pct + '%';
    if (gPct) { gPct.textContent = gs.pct + '%'; }
  }
}

function updateAll() {
  updateStatsBar();
  buildGroupTabs();
}

// ════════════ OVERLAY ════════════
function openOverlay(country) {
  currentOverlayCountry = country;
  const cd = COUNTRY_DATA[country];
  const stickers = albumData[country] || [];
  const cs = getCountryStats(country);
  const grp = Object.keys(GROUPS).find(g => GROUPS[g].includes(country)) || 'A';
  const gColor = GROUP_COLORS[grp] || '#f5c518';

  const flagCode = cd ? cd.flag : 'xx';
  const flagUrl = `https://flagcdn.com/w160/${flagCode}.png`;

  document.getElementById('ov-flag').src = flagUrl;
  document.getElementById('ov-flag').alt = country;
  document.getElementById('ov-bg').style.backgroundImage = `url(${flagUrl})`;
  document.getElementById('ov-nick').textContent = cd ? cd.nick : '';
  document.getElementById('ov-name').textContent = country.replace(/^[\p{Emoji}\s]+/u, '');
  document.getElementById('ov-pbar').style.width = cs.pct + '%';
  document.getElementById('ov-ptext').textContent = `${cs.owned} / ${cs.total} cromos (${cs.pct}%)`;

  // Badges
  const badgesEl = document.getElementById('ov-badges');
  badgesEl.innerHTML = '';
  if (cd) {
    [{l:'🌍 '+cd.conf},{l:'FIFA #'+cd.rank},{l:'Fundado: '+cd.founded},{l:'🏆 '+cd.bestWC}].forEach(b => {
      const s = document.createElement('span');
      s.className = 'o-badge'; s.textContent = b.l;
      badgesEl.appendChild(s);
    });
  }

  // Body
  const body = document.getElementById('ov-body');
  body.innerHTML = '';

  // Players section
  const playersSection = document.createElement('div');
  playersSection.className = 'overlay-section';
  playersSection.innerHTML = `<div class="overlay-section-title"><span>🃏</span> CROMOS DE LA SELECCIÓN</div><div class="player-grid" id="ov-player-grid"></div>`;
  body.appendChild(playersSection);

  const grid = playersSection.querySelector('#ov-player-grid');
  stickers.forEach((name, i) => {
    const st  = getStickerState(country, i);
    const sub = getStickerSubState(country, i);
    const card = document.createElement('div');
    const stClass = st==='tengo' ? ' owned' : st==='falta' ? ' missing' : '';
    const subClass = sub ? ' sub-' + sub : '';
    card.className = 'pcard' + stClass + subClass;

    const subLabel = sub === 'repetida' ? '🔄 REP' : sub === 'reserva' ? '📌 RES' : '+ sub';
    const subHtml  = st !== 'none'
      ? `<span class="pcard-sub sub-${sub||'none'}" data-action="sub">${subLabel}</span>`
      : '';

    card.innerHTML = `<div class="pcard-num">#${i+1}</div><div class="pcard-name">${name}</div>${subHtml}`;

    // Main click → cycle primary
    card.addEventListener('click', (e) => {
      if (e.target.dataset.action === 'sub') return;
      cycleStickerState(country, i);
      const ns   = getStickerState(country, i);
      const nsub = getStickerSubState(country, i);
      const stC  = ns==='tengo' ? ' owned' : ns==='falta' ? ' missing' : '';
      const subC = nsub ? ' sub-'+nsub : '';
      card.className = 'pcard' + stC + subC;
      const sl2 = nsub==='repetida'?'🔄 REP':nsub==='reserva'?'📌 RES':'+ sub';
      const sbtn = card.querySelector('.pcard-sub');
      if (ns !== 'none' && !sbtn) {
        const ns2 = document.createElement('span');
        ns2.className = `pcard-sub sub-${nsub||'none'}`;
        ns2.dataset.action = 'sub';
        ns2.textContent = sl2;
        card.appendChild(ns2);
        ns2.addEventListener('click', subClickHandler);
      } else if (ns === 'none' && sbtn) sbtn.remove();
      else if (sbtn) { sbtn.className = `pcard-sub sub-${nsub||'none'}`; sbtn.textContent = sl2; }
      const cs2 = getCountryStats(country);
      document.getElementById('ov-pbar').style.width = cs2.pct + '%';
      document.getElementById('ov-ptext').textContent = `${cs2.owned} / ${cs2.total} cromos (${cs2.pct}%)`;
      updateAll();
      updateCountryBar(country, gColor);
    });

    function subClickHandler(e) {
      e.stopPropagation();
      cycleStickerSubState(country, i);
      const nsub = getStickerSubState(country, i);
      const sbtn = card.querySelector('.pcard-sub');
      if (sbtn) {
        sbtn.className = `pcard-sub sub-${nsub||'none'}`;
        sbtn.textContent = nsub==='repetida'?'🔄 REP':nsub==='reserva'?'📌 RES':'+ sub';
      }
      const stC = getStickerState(country,i);
      card.className = 'pcard' + (stC==='tengo'?' owned':stC==='falta'?' missing':'') + (nsub?' sub-'+nsub:'');
      updateAll();
    }

    const sb = card.querySelector('.pcard-sub');
    if (sb) sb.addEventListener('click', subClickHandler);

    grid.appendChild(card);
  });

  // History
  if (cd && cd.history) {
    const histSection = document.createElement('div');
    histSection.className = 'overlay-section';
    histSection.innerHTML = `<div class="overlay-section-title"><span>📖</span> HISTORIA DE LA SELECCIÓN</div><p class="history-text">${cd.history}</p>`;
    body.appendChild(histSection);
  }

  // Achievements
  if (cd && cd.achiev && cd.achiev.length) {
    const achSection = document.createElement('div');
    achSection.className = 'overlay-section';
    achSection.innerHTML = `<div class="overlay-section-title"><span>🏆</span> PALMARÉS Y LOGROS</div>
      <ul class="achievements-list">${cd.achiev.map(a=>`<li>${a}</li>`).join('')}</ul>`;
    body.appendChild(achSection);
  }

  document.getElementById('country-overlay').classList.add('visible');
  document.body.style.overflow = 'hidden';

  // ► Reproducir himno de la selección
  playAnthem(country);
}

function closeOverlay() {
  stopAnthem(); // detiene himno y restaura video (solo si radio no está activa)
  document.getElementById('country-overlay').classList.remove('visible');
  document.body.style.overflow = '';
  currentOverlayCountry = null;
  // Si la radio estaba visible y "debería" estar sonando, reanudarla
  if (_radioVisible && _radioPlaying === false && _radioAudio) {
    // No auto-resume; el usuario decide
  }
}
document.getElementById('ov-back').addEventListener('click', closeOverlay);

// ════════════ PDF EXPORT ════════════
function showPdfModal() { document.getElementById('pdf-modal').classList.add('visible'); }
function hidePdfModal() { document.getElementById('pdf-modal').classList.remove('visible'); }

document.getElementById('pdf-modal').querySelectorAll('.modal-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('pdf-modal').querySelectorAll('.modal-opt').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    pdfMode = btn.dataset.mode;
  });
});
document.getElementById('pdf-cancel').addEventListener('click', hidePdfModal);
document.getElementById('pdf-modal').addEventListener('click', e => { if(e.target===e.currentTarget) hidePdfModal(); });

document.getElementById('pdf-generate').addEventListener('click', () => {
  hidePdfModal();
  generatePDF(pdfMode);
});

function generatePDF(mode) {
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  const W=210, margin=14;
  let y = margin;

  // Title
  doc.setFillColor(8,12,24);
  doc.rect(0,0,W,30,'F');
  doc.setTextColor(245,197,24);
  doc.setFontSize(22);
  doc.setFont('helvetica','bold');
  doc.text('ÁLBUM MUNDIAL 2026', W/2, 12, {align:'center'});
  doc.setFontSize(9);
  doc.setTextColor(122,138,170);
  const modeLabel = mode==='owned'?'Solo TENGO': mode==='missing'?'Solo FALTAN': mode==='repetida'?'Mis REPETIDAS': mode==='reserva'?'Mis RESERVADAS':'Colección completa (TENGO / FALTA)';
  const gs = getGlobalStats();
  doc.text(`${modeLabel} · ${gs.owned}/${gs.total} cromos (${gs.pct}%)`, W/2, 20, {align:'center'});
  doc.text(`Generado: ${new Date().toLocaleDateString('es-CL')}`, W/2, 26, {align:'center'});
  y = 36;


  // Intro
  const introItems = [];
  INTRO_DATA.forEach((name, i) => {
    const st = getStickerState('INTRO', i);
    if (mode === 'owned' && st !== 'tengo') return;
    if (mode === 'missing' && st !== 'falta') return;
    introItems.push({name, st, i});
  });

  if (introItems.length > 0) {
    if (y > 260) { doc.addPage(); y = margin; }

    doc.setFillColor(245,197,24);
    doc.roundedRect(margin, y, W - margin * 2, 9, 2, 2, 'F');
    doc.setTextColor(0,0,0);
    doc.setFontSize(10);
    doc.setFont('helvetica','bold');
    doc.text('SECCIÓN INTRO', margin + 4, y + 6);
    y += 12;

    const colW = (W - margin * 2 - 6) / 3;

    introItems.forEach((item, ii) => {
      const col = ii % 3;
      const row = Math.floor(ii / 3);
      const x = margin + col * (colW + 3);
      const safeY = y + row * 7;

      if (safeY > 270) {
        doc.addPage();
        y = margin;
      }

      const yy = y + Math.floor(ii / 3) * 7;

      if (mode === 'all') {
        if (item.st === 'tengo') doc.setFillColor(34,197,94);
        else if (item.st === 'falta') doc.setFillColor(229,57,53);
        else doc.setFillColor(74,85,104);
        doc.circle(x + 2, yy + 2.5, 1.5, 'F');
      } else {
        doc.setFillColor(245,197,24);
        doc.circle(x + 2, yy + 2.5, 1.5, 'F');
      }

      doc.setTextColor(50,60,80);
      doc.setFontSize(6);
      doc.setFont('helvetica','normal');
      doc.text(`#${item.i + 1}`, x + 5, yy + 3.5);

      doc.setTextColor(20,30,50);
      doc.setFontSize(7);
      const introName = item.name.length > 22 ? item.name.substring(0,20) + '…' : item.name;
      doc.text(introName, x + 11, yy + 3.5);

      if (mode === 'all') {
        doc.setFontSize(6);
        doc.setTextColor(item.st === 'tengo' ? [34,197,94] : item.st === 'falta' ? [229,57,53] : [150,150,150]);
        const badge = item.st === 'tengo' ? 'TENGO' : item.st === 'falta' ? 'FALTA' : '—';
        doc.text(badge, x + colW - 2, yy + 3.5, {align:'right'});
      }
    });

    const introRows = Math.ceil(introItems.length / 3);
    y += introRows * 7 + 8;
  }
  'ABCDEFGHIJKL'.split('').forEach(grp => {
    const countries = GROUPS[grp];
    const gColor = GROUP_RGB[grp] || [245,197,24];
    const gInfo = GROUP_INFO[grp];
    const gs2 = getGroupStats(grp);

    // Check if group has anything to show
    let groupHasItems = false;
    countries.forEach(c => {
      const stickers = albumData[c] || [];
      stickers.forEach((name, i) => {
        const st  = getStickerState(c, i);
        const sub = getStickerSubState(c, i);
        if (mode==='owned'    && st==='tengo')      groupHasItems=true;
        if (mode==='missing'  && st==='falta')      groupHasItems=true;
        if (mode==='all')                           groupHasItems=true;
        if (mode==='repetida' && sub==='repetida')  groupHasItems=true;
        if (mode==='reserva'  && sub==='reserva')   groupHasItems=true;
      });
    });
    if (!groupHasItems) return;

    // Page break if needed
    if (y > 260) { doc.addPage(); y = margin; }

    // Group header bar
    doc.setFillColor(...gColor);
    doc.roundedRect(margin, y, W-margin*2, 9, 2, 2, 'F');
    doc.setTextColor(0,0,0);
    doc.setFontSize(10);
    doc.setFont('helvetica','bold');
    doc.text(`GRUPO ${grp} — ${gInfo ? gInfo.label.toUpperCase() : ''}`, margin+4, y+6);
    doc.setFontSize(8);
    doc.text(`${gs2.pct}%`, W-margin-4, y+6, {align:'right'});
    y += 12;

    countries.forEach(c => {
      const stickers = albumData[c] || [];
      const cs = getCountryStats(c);
      const items = [];
      stickers.forEach((name, i) => {
        const st  = getStickerState(c, i);
        const sub = getStickerSubState(c, i);
        if (mode==='owned'    && st  !== 'tengo')     return;
        if (mode==='missing'  && st  !== 'falta')     return;
        if (mode==='repetida' && sub !== 'repetida')  return;
        if (mode==='reserva'  && sub !== 'reserva')   return;
        items.push({name, st, sub, i});
      });
      if (items.length===0) return;

      if (y > 268) { doc.addPage(); y = margin; }

      // Country sub-header
      const cName = c.replace(/^[\p{Emoji}\s]+/u,'');
      doc.setFillColor(22,32,58);
      doc.rect(margin, y, W-margin*2, 7, 'F');
      doc.setTextColor(...gColor);
      doc.setFontSize(8);
      doc.setFont('helvetica','bold');
      doc.text(`  ${cName}  (${cs.owned}/${cs.total} · ${cs.pct}%)`, margin+2, y+5);
      y += 9;

      // Sticker rows — 3 columns
      const colW = (W-margin*2-6)/3;
      items.forEach((item, ii) => {
        const col = ii % 3;
        const row = Math.floor(ii / 3);
        const x = margin + col*(colW+3);
        const ry = y + row*7;

        if (ry + 7 > 285) {
          if (col===0 && row > 0) { doc.addPage(); y = margin; }
        }

        const finalY = y + row*7;
        if (finalY > 270) { doc.addPage(); y = margin; return; }

        // Color dot
        if (mode==='all') {
          if (item.st==='tengo') doc.setFillColor(34,197,94);
          else if (item.st==='falta') doc.setFillColor(229,57,53);
          else doc.setFillColor(74,85,104);
          doc.circle(x+2, finalY+2.5, 1.5, 'F');
        } else {
          doc.setFillColor(...gColor);
          doc.circle(x+2, finalY+2.5, 1.5, 'F');
        }

        doc.setTextColor(50,60,80);
        doc.setFontSize(6);
        doc.setFont('helvetica','normal');
        doc.text(`#${item.i+1}`, x+5, finalY+3.5);
        doc.setTextColor(20,30,50);
        doc.setFontSize(7);
        const nameStr = item.name.length > 22 ? item.name.substring(0,20)+'…' : item.name;
        doc.text(nameStr, x+11, finalY+3.5);

        if (mode==='all') {
          doc.setFontSize(6);
          doc.setTextColor(item.st==='tengo'?[34,197,94]:item.st==='falta'?[229,57,53]:[150,150,150]);
          const badge = item.st==='tengo'?'TENGO':item.st==='falta'?'FALTA':'—';
          doc.text(badge, x+colW-2, finalY+3.5, {align:'right'});
        }
      });

      const rows = Math.ceil(items.length/3);
      y += rows*7 + 4;
    });

    y += 4;
  });

  // Footer on last page
  doc.setFontSize(7);
  doc.setTextColor(100,110,130);
  doc.text('Álbum Mundial 2026 — Panini Digital', W/2, 292, {align:'center'});

  const fname = mode==='owned'?'tengo':mode==='missing'?'faltan':'completo';
  doc.save(`album-mundial-2026-${fname}.pdf`);
}

// ════════════ SAVE / IMPORT ════════════
document.getElementById('btn-save').addEventListener('click', () => {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'album-mundial-2026.json';
  a.click();
});


// ════════════ SEARCH ════════════
document.getElementById('search').addEventListener('input', e => {
  searchQuery = e.target.value.toLowerCase().trim();
  renderGroups();
});

// ════════════ RESET ════════════
document.getElementById('btn-reset').addEventListener('click', () => {
  document.getElementById('reset-modal').classList.add('visible');
});
document.getElementById('reset-cancel').addEventListener('click', () => {
  document.getElementById('reset-modal').classList.remove('visible');
});
document.getElementById('reset-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) document.getElementById('reset-modal').classList.remove('visible');
});
document.getElementById('reset-confirm').addEventListener('click', () => {
  state = {};
  saveState();
  document.getElementById('reset-modal').classList.remove('visible');
  updateAll();
  renderGroups();
  alert('✅ Álbum reiniciado a cero');
});

// ════════════ VOLUME CONTROL ════════════
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

// ════════════ RADIO ENGINE ════════════
const RADIO_PLAYLIST = [
  {artist:"Shakira, Burna Boy",            title:"Dai Dai",                        url:"https://files.catbox.moe/lay7sr.mp3"},
  {artist:"FIFA Sound",                    title:"The Official FIFA World Cup 26™ Theme", url:"https://files.catbox.moe/7m5cck.mp3"},
  {artist:"Jelly Roll, Carín León, FIFA Sound", title:"Lighter",                   url:"https://files.catbox.moe/y0qzsw.mp3"},
  {artist:"LISA, Anitta, Rema, FIFA Sound",title:"Goals",                          url:"https://files.catbox.moe/vyttci.mp3"},
  {artist:"Jessie Reyez, Elyanna, FIFA Sound", title:"Illuminate",                 url:"https://files.catbox.moe/z8lgve.mp3"},
  {artist:"Daddy Yankee, Shenseea, FIFA Sound", title:"Echo",                      url:"https://files.catbox.moe/pnvjau.mp3"},
  {artist:"Trinidad Cardona, Davido, Aisha",title:"Hayya Hayya (Better Together)", url:"https://files.catbox.moe/tsipl8.mp3"},
  {artist:"FIFA Sound",                    title:"The Official FIFA World Cup Qatar 2022™ Theme", url:"https://files.catbox.moe/p6pc5a.mp3"},
  {artist:"Shakira, Carlinhos Brown",      title:"La La La (Brazil 2014)",         url:"https://files.catbox.moe/2pfb0y.mp3"},
  {artist:"K'NAAN",                        title:"Wavin' Flag - Coca-Cola® Celebration Mix", url:"https://files.catbox.moe/i2vooq.mp3"},
  {artist:"Ozuna, RedOne, GIMS, FIFA Sound",title:"Arhbo",                         url:"https://files.catbox.moe/9nz1nn.mp3"},
  {artist:"Ricky Martin",                  title:"The Cup of Life (La Copa De La Vida)", url:"https://files.catbox.moe/0bekk2.mp3"},
  {artist:"Shakira ft. Wyclef Jean",       title:"Hips Don't Lie",                 url:"https://files.catbox.moe/kuwc87.mp3"},
  {artist:"Magic System, Chawki",          title:"Magic in the Air",               url:"https://files.catbox.moe/yxddk5.mp3"},
  {artist:"Daddy Yankee",                  title:"Grito Mundial",                  url:"https://files.catbox.moe/8hlzyc.mp3"},
  {artist:"Wisin",                         title:"Que Viva la Vida",               url:"https://files.catbox.moe/gfanij.mp3"},
  {artist:"Wisin ft. Jennifer Lopez & Ricky Martin", title:"Adrenalina",           url:"https://files.catbox.moe/zmbnk6.mp3"},
  {artist:"Queen",                         title:"We Are The Champions",           url:"https://files.catbox.moe/c2s4ry.mp3"},
  {artist:"Pitbull ft. Jennifer Lopez & Claudia Leitte", title:"We Are One (Ole Ola)", url:"https://files.catbox.moe/0hok92.mp3"},
  {artist:"Avicii",                        title:"The Nights",                     url:"https://files.catbox.moe/o63389.mp3"},
  {artist:"Imagine Dragons",               title:"On Top Of The World",            url:"https://files.catbox.moe/g45lmz.mp3"},
  {artist:"John Newman",                   title:"Love Me Again",                  url:"https://files.catbox.moe/b79l0p.mp3"},
  {artist:"Glass Animals",                 title:"Heat Waves",                     url:"https://files.catbox.moe/88x44k.mp3"},
  {artist:"MEDUZA, OneRepublic, Leony",    title:"Fire (UEFA EURO 2024)",          url:"https://files.catbox.moe/7vjx0h.mp3"},
  {artist:"Skrillex, Fred again.., Flowdan", title:"Rumble",                       url:"https://files.catbox.moe/rbt2i4.mp3"},
  {artist:"Zakes Bantwini, Kasango",       title:"Osama (Bruno Be, Ralk Rework)",  url:"https://files.catbox.moe/0u77x6.mp3"},
  {artist:"Andrei Mihai, Elena Morosanu",  title:"I Need You Like Medicine",       url:"https://files.catbox.moe/fixgy9.mp3"},
  {artist:"MEDUZA, Sam Tompkins, Em Beihold", title:"Phone",                      url:"https://files.catbox.moe/50y0rq.mp3"},
  {artist:"Myke Towers",                   title:"LALA",                           url:"https://files.catbox.moe/mf78j6.mp3"},
  {artist:"Mata",                          title:"Lloret de Mar",                  url:"https://files.catbox.moe/93xriq.mp3"},
  {artist:"Young Miko",                    title:"arcoíris",                       url:"https://files.catbox.moe/q6zgaj.mp3"},
  {artist:"Charlotte Plank, Hybrid Minds", title:"Lights",                         url:"https://files.catbox.moe/5v70j9.mp3"},
  {artist:"Justice, Tame Impala",          title:"Neverender",                     url:"https://files.catbox.moe/6weet4.mp3"},
  {artist:"RÜFÜS DU SOL",                  title:"Break My Love",                  url:"https://files.catbox.moe/gnoy28.mp3"},
  {artist:"Joy Crookes",                   title:"Feet Don't Fail Me Now",         url:"https://files.catbox.moe/s0ae8h.mp3"},
  {artist:"Young Miko",                    title:"WASSUP",                         url:"https://files.catbox.moe/hzejc8.mp3"},
  {artist:"Gusttavo Lima",                 title:"Balada",                         url:"https://files.catbox.moe/wzxe85.mp3"},
  {artist:"MC L da Vinte, MC Gury, DJ Swat", title:"Parado no Bailão",            url:"https://files.catbox.moe/3f6oyp.mp3"},
  {artist:"Michel Teló",                   title:"Ai Se Eu Te Pego",               url:"https://files.catbox.moe/ao36ya.mp3"},
  {artist:"MC Kevinho",                    title:"Olha A Explosão",                url:"https://files.catbox.moe/ht5ltn.mp3"},
  {artist:"Sérgio Mendes",                 title:"Magalenha",                      url:"https://files.catbox.moe/afik3h.mp3"},
  {artist:"Opus",                          title:"Live Is Life (Live)",             url:"https://files.catbox.moe/eeqyck.mp3"},
  {artist:"Luck Ra, Bersuit, La T y La M", title:"TOCO Y ME VOY",                  url:"https://files.catbox.moe/xpqizr.mp3"},
  {artist:"Rodrigo",                       title:"La Mano de Dios",                url:"https://files.catbox.moe/trjvgm.mp3"},
  {artist:"La T y La M",                   title:"Pa' la Selección",               url:"https://files.catbox.moe/kfknsq.mp3"},
  {artist:"Los Miserables",                title:"El crack",                       url:"https://files.catbox.moe/5v76st.mp3"},
  {artist:"Shakira ft. Freshlyground",     title:"Waka Waka (Esto es Africa)",     url:"https://files.catbox.moe/gxa7aq.mp3"},
  {artist:"Turf",                          title:"Pasos Al Costado",               url:"https://files.catbox.moe/4f2em5.mp3"},
  {artist:"Los Palmeras",                  title:"El Bombón",                      url:"https://files.catbox.moe/2sz5jj.mp3"},
  {artist:"Los Palmeras",                  title:"Soy Sabalero (Versión Cancha)",  url:"https://files.catbox.moe/686sfk.mp3"},
  {artist:"La Mosca",                      title:"Muchachos, Ahora Nos Volvimos a Ilusionar", url:"https://files.catbox.moe/y4vrjb.mp3"},
  {artist:"Vegedream",                     title:"Ramenez la coupe à la maison",   url:"https://files.catbox.moe/cr1iky.mp3"},
  {artist:"Farruko",                       title:"Pepas",                          url:"https://files.catbox.moe/8qwso6.mp3"},
  {artist:"Bellini",                       title:"Samba do Brasil",                url:"https://files.catbox.moe/uqmfmp.mp3"},
  {artist:"Rema",                          title:"Calm Down",                      url:"https://files.catbox.moe/wf8dts.mp3"},
  {artist:"Daddy Yankee",                  title:"Limbo",                          url:"https://files.catbox.moe/gs7f0v.mp3"},
  {artist:"Enrique Iglesias, Descemer Bueno, Gente De Zona", title:"Bailando (Spanish Version)", url:"https://files.catbox.moe/wj2uej.mp3"},
  {artist:"Ricchi E Poveri",               title:"Sarà perché ti amo",             url:"https://files.catbox.moe/b3usn1.mp3"},
  {artist:"Gente De Zona, Marc Anthony",   title:"La Gozadera (feat. Marc Anthony)", url:"https://files.catbox.moe/kg9cbv.mp3"},
  {artist:"Don Omar, Lucenzo",             title:"Danza Kuduro",                   url:"https://files.catbox.moe/sol0b6.mp3"},
  {artist:"Stromae",                       title:"Formidable",                     url:"https://files.catbox.moe/z6zdzn.mp3"},
  {artist:"Enrique Iglesias, Wisin",       title:"DUELE EL CORAZON",              url:"https://files.catbox.moe/ihrwde.mp3"},
  {artist:"Pitbull, Christina Aguilera",   title:"Feel This Moment (feat. Christina Aguilera)", url:"https://files.catbox.moe/ihf4eu.mp3"},
  {artist:"Jennifer Lopez, Pitbull",       title:"On The Floor",                   url:"https://files.catbox.moe/59jzl8.mp3"},
  {artist:"Marc Anthony",                  title:"Vivir Mi Vida",                  url:"https://files.catbox.moe/px7ysf.mp3"},
  {artist:"Shakira, Alejandro Sanz",       title:"La Tortura (feat. Alejandro Sanz)", url:"https://files.catbox.moe/sjayhm.mp3"},
  {artist:"Luis Fonsi, Daddy Yankee",      title:"Despacito",                      url:"https://files.catbox.moe/av6iv6.mp3"},
  {artist:"Kaoma",                         title:"Lambada (Original Version 1989)", url:"https://files.catbox.moe/jdf3w2.mp3"},
  {artist:"Pitbull, Kesha",               title:"Timber",                         url:"https://files.catbox.moe/0orte5.mp3"},
  {artist:"Capital Cities",               title:"Safe and Sound",                 url:"https://files.catbox.moe/pf9cks.mp3"},
  {artist:"Coldplay",                     title:"Viva La Vida",                   url:"https://files.catbox.moe/04jq4p.mp3"},
  {artist:"Daft Punk, Pharrell Williams, Nile Rodgers", title:"Get Lucky (feat. Pharrell Williams and Nile Rodgers)", url:"https://files.catbox.moe/avkm8n.mp3"},
  {artist:"Coldplay",                     title:"A Sky Full of Stars",            url:"https://files.catbox.moe/fha28x.mp3"},
  {artist:"Pitbull",                      title:"I Know You Want Me (Calle Ocho)", url:"https://files.catbox.moe/1r4q3b.mp3"},
  {artist:"Nicky Jam, Will Smith, Era Istrefi", title:"Live It Up (Official Song 2018 FIFA World Cup Russia)", url:"https://files.catbox.moe/g8rb8x.mp3"},
  {artist:"Elvis Presley, Junkie XL",     title:"A Little Less Conversation (JXL Radio Edit Remix)", url:"https://files.catbox.moe/olln7o.mp3"},
  {artist:"The White Stripes",            title:"Seven Nation Army",              url:"https://files.catbox.moe/w5i6qk.mp3"},
  {artist:"Queen",                        title:"We Will Rock You (Remastered 2011)", url:"https://files.catbox.moe/0c15cv.mp3"},
  {artist:"Yerba Brava",                  title:"La Cumbia De Los Trapos",        url:"https://files.catbox.moe/w3cexc.mp3"},
  {artist:"Bizarrap, Daddy Yankee",       title:"Daddy Yankee: Bzrp Music Sessions, Vol. 66", url:"https://files.catbox.moe/lkawk7.mp3"},
  {artist:"Enrique Iglesias, Descemer Bueno, Zion & Lennox", title:"SUBEME LA RADIO", url:"https://files.catbox.moe/35dak1.mp3"},
  {artist:"Pitbull, John Ryan",           title:"Fireball (feat. John Ryan)",     url:"https://files.catbox.moe/t0vs9n.mp3"},
  {artist:"J Balvin, Willy William",      title:"Mi Gente",                       url:"https://files.catbox.moe/icp9j9.mp3"},
  {artist:"Avicii, Sandro Cavazza",       title:"Without You (feat. Sandro Cavazza)", url:"https://files.catbox.moe/ldrs5v.mp3"},
  {artist:"Avicii",                       title:"Wake Me Up",                     url:"https://files.catbox.moe/6zb1s1.mp3"},
  {artist:"The Kid LAROI",                title:"LOVE AGAIN",                     url:"https://files.catbox.moe/uc97ln.mp3"},
  {artist:"Chawki",                       title:"Time of Our Lives",              url:"https://files.catbox.moe/m6n06n.mp3"},
  {artist:"Shakira, Wyclef Jean",         title:"Hips Don't Lie (Bamboo - 2006 FIFA World Cup Mix)", url:"https://files.catbox.moe/oqsigl.mp3"},
  {artist:"Edoardo Bennato, Gianna Nannini", title:"Un'estate italiana (Original Stadio Version 1990)", url:"https://files.catbox.moe/dg0j3e.mp3"},
  {artist:"Ramblers",                     title:"El Rock del Mundial",            url:"https://files.catbox.moe/q9hxqf.mp3"},
  {artist:"Cali Y El Dandee",             title:"Gol",                            url:"https://files.catbox.moe/qgscze.mp3"},
  {artist:"Rihanna",                      title:"Only Girl (In The World)",       url:"https://files.catbox.moe/q32v19.mp3"},
  {artist:"Sean Paul",                    title:"Get Busy",                       url:"https://files.catbox.moe/2tkjc7.mp3"},
  {artist:"Cher",                         title:"Believe",                        url:"https://files.catbox.moe/4on155.mp3"},
  {artist:"Flo Rida, T-Pain",             title:"Low (feat. T-Pain)",             url:"https://files.catbox.moe/w9merj.mp3"},
  {artist:"Calvin Harris",                title:"My Way",                         url:"https://files.catbox.moe/j7lqtj.mp3"},
  {artist:"Gym Class Heroes, Adam Levine", title:"Stereo Hearts (feat. Adam Levine)", url:"https://files.catbox.moe/uzijwv.mp3"},
  {artist:"Coolio, L.V.",                 title:"Gangsta's Paradise",             url:"https://files.catbox.moe/yvvudk.mp3"},
  {artist:"Pitbull, Ne-Yo",               title:"Time of Our Lives",              url:"https://files.catbox.moe/eax8ce.mp3"},
  {artist:"Skrillex, pennybirdrabbit",    title:"All I Ask of You (feat. Pennybirdrabbit)", url:"https://files.catbox.moe/kd6nni.mp3"},
];

// Shuffle helper
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let _radioAudio    = null;
let _radioPlaying  = false;
let _radioQueue    = shuffleArray(RADIO_PLAYLIST);
let _radioIdx      = 0;
let _radioVisible  = false;

function radioLoadTrack(idx) {
  if (_radioAudio) { _radioAudio.pause(); _radioAudio.src = ''; }
  const track = _radioQueue[idx];
  document.getElementById('radio-title').textContent  = track.title;
  document.getElementById('radio-artist').textContent = track.artist;
  _radioAudio = new Audio(track.url);
  _radioAudio.volume = getEffectiveVolume();
  _radioAudio.addEventListener('ended', () => radioNext());
  if (_radioPlaying) _radioAudio.play().catch(() => {});
}

function radioPlay() {
  if (!_radioAudio) radioLoadTrack(_radioIdx);
  stopAnthem(); // no himno mientras suena radio
  const bg = document.getElementById('bg-video');
  if (bg) { bg._prevVolume = bg.volume; bg.volume = 0; }
  _radioAudio.volume = getEffectiveVolume();
  _radioAudio.play().catch(() => {});
  _radioPlaying = true;
  document.getElementById('radio-play').textContent = '⏸';
}

function pauseRadio(restoreVideo = true) {
  if (_radioAudio) _radioAudio.pause();
  _radioPlaying = false;
  document.getElementById('radio-play').textContent = '▶';
  if (restoreVideo) {
    const bg = document.getElementById('bg-video');
    if (bg) { bg.volume = bg._prevVolume != null ? bg._prevVolume : getEffectiveVolume(); bg._prevVolume = null; }
  }
}

function radioNext() {
  _radioIdx = (_radioIdx + 1) % _radioQueue.length;
  if (_radioIdx === 0) _radioQueue = shuffleArray(RADIO_PLAYLIST); // re-shuffle al terminar ciclo
  const wasPlaying = _radioPlaying;
  radioLoadTrack(_radioIdx);
  if (wasPlaying) _radioAudio.play().catch(() => {});
}

function radioPrev() {
  _radioIdx = (_radioIdx - 1 + _radioQueue.length) % _radioQueue.length;
  const wasPlaying = _radioPlaying;
  radioLoadTrack(_radioIdx);
  if (wasPlaying) _radioAudio.play().catch(() => {});
}

document.getElementById('btn-radio').addEventListener('click', () => {
  if (!_radioVisible) {
    _radioVisible = true;
    document.getElementById('radio-bar').classList.add('visible');
    document.body.style.paddingBottom = '70px';
    // Inicializar primera canción sin reproducir
    radioLoadTrack(_radioIdx);
  } else {
    // Segunda pulsación: ocultar y detener
    pauseRadio(true);
    _radioVisible = false;
    document.getElementById('radio-bar').classList.remove('visible');
    document.body.style.paddingBottom = '';
  }
});

document.getElementById('radio-play').addEventListener('click', () => {
  if (_radioPlaying) pauseRadio(true);
  else radioPlay();
});
document.getElementById('radio-next').addEventListener('click', radioNext);
document.getElementById('radio-prev').addEventListener('click', radioPrev);

// ════════════ STATUS TABS ════════════
document.querySelectorAll('.stab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.stab').forEach(b => {
      b.classList.remove('active');
      b.style.background = '';
      b.style.color = '';
      b.style.borderColor = '';
    });
    btn.classList.add('active');
    // Custom colors for sub-state tabs
    const customColor = btn.style.getPropertyValue('--stab-active');
    if (customColor) {
      btn.style.background = customColor;
      btn.style.color = '#111';
      btn.style.borderColor = customColor;
    }
    activeStatus = btn.dataset.status;
    renderGroups();
  });
});

// ════════════ PDF BUTTON ════════════
document.getElementById('btn-pdf').addEventListener('click', showPdfModal);

// ════════════ KEYBOARD ESC ════════════
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeOverlay();
    hidePdfModal();
    document.getElementById('reset-modal').classList.remove('visible');
  }
});

// ════════════ INIT ════════════
loadState();
buildGroupTabs();
renderGroups();
updateStatsBar();


function startAlbum(){
    document.getElementById('ws').classList.add('off');
    const video = document.getElementById('bg-video');
    video.muted = false;
    video.volume = getEffectiveVolume();
    video.play();
    applyMasterVolume();
}

// ════════════ ACCESSIBILITY + RADIO UX PATCH ════════════
const A11Y_KEY = 'album_panini_2026_accessibility';
let a11yPrefs = {
  textSize: 'normal',
  theme: 'dark',
  touchUI: false,
  labels: false,
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
  const visible = !!a11yPrefs.visualRadio && !!_radioVisible && !!_radioPlaying;
  banner.classList.toggle('visible', visible);
  if(txt && _radioQueue && _radioQueue[_radioIdx]) txt.textContent = `Reproduciendo: ${_radioQueue[_radioIdx].title}`;
  document.body.classList.toggle('radio-active', !!_radioVisible && !!_radioPlaying);
}
function closeRadioCompletely(){
  pauseRadio(true);
  _radioVisible = false;
  document.getElementById('radio-bar')?.classList.remove('visible');
  document.body.style.paddingBottom = '';
  updateRadioVisualState();
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
});

// Patch sticker click animation
const _origRenderGroups = renderGroups;
renderGroups = function(){
  _origRenderGroups();
  setTimeout(() => {
    document.querySelectorAll('.sticker').forEach(st => {
      if(st.dataset.flashBound) return;
      st.dataset.flashBound = '1';
      st.addEventListener('click', () => {
        st.classList.remove('flash');
        void st.offsetWidth;
        st.classList.add('flash');
      }, {capture:true});
    });
  }, 0);
};

// Patch radio button behavior: opening radio autoplays, stop button closes all
const oldBtnRadio = document.getElementById('btn-radio');
if(oldBtnRadio){
  const fresh = oldBtnRadio.cloneNode(true);
  oldBtnRadio.parentNode.replaceChild(fresh, oldBtnRadio);
  fresh.addEventListener('click', () => {
    if (!_radioVisible) {
      _radioVisible = true;
      document.getElementById('radio-bar').classList.add('visible');
      document.body.style.paddingBottom = '78px';
      if (!_radioAudio) radioLoadTrack(_radioIdx);
      radioPlay();
      updateRadioVisualState();
      pushUiState('radio');
    } else {
      closeRadioCompletely();
    }
  });
}
const stopBtn = document.getElementById('radio-stop');
if(stopBtn) stopBtn.addEventListener('click', closeRadioCompletely);

// Patch existing radio functions to keep accessibility banner synced
const _origRadioLoadTrack = radioLoadTrack;
radioLoadTrack = function(idx){
  _origRadioLoadTrack(idx);
  updateRadioVisualState();
};
const _origRadioPlay = radioPlay;
radioPlay = function(){
  _origRadioPlay();
  updateRadioVisualState();
};
const _origPauseRadio = pauseRadio;
pauseRadio = function(restoreVideo = true){
  _origPauseRadio(restoreVideo);
  updateRadioVisualState();
};
const _origRadioNext = radioNext;
radioNext = function(){
  _origRadioNext();
  updateRadioVisualState();
};
const _origRadioPrev = radioPrev;
radioPrev = function(){
  _origRadioPrev();
  updateRadioVisualState();
};

// Improve ARIA on status tab clicks
const _statusBtns = document.querySelectorAll('.stab');
_statusBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    _statusBtns.forEach(b => b.setAttribute('aria-selected', b === btn ? 'true' : 'false'));
  });
});

// Patch open overlay/history hooks if button exists later
const _origOpenCountryOverlay = typeof openCountryOverlay === 'function' ? openCountryOverlay : null;
if(_origOpenCountryOverlay){
  openCountryOverlay = function(country){
    _origOpenCountryOverlay(country);
    pushUiState('country');
  };
}
const _origShowPdfModal = typeof showPdfModal === 'function' ? showPdfModal : null;
if(_origShowPdfModal){
  showPdfModal = function(){
    _origShowPdfModal();
    pushUiState('pdf');
  };
}

// Start album remains global
function startAlbum(){
  document.getElementById('ws')?.classList.add('off');
  const video = document.getElementById('bg-video');
  if(video){
    video.muted = false;
    video.volume = getEffectiveVolume();
    video.play().catch(() => {});
  }
  applyMasterVolume();
}
window.startAlbum = startAlbum;

loadA11yPrefs();
setupA11yUI();
applyA11yPrefs();
