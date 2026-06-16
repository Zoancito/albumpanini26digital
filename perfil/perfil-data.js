// ══════════════════════════════════════════════════════
//  perfil-data.js — Constantes del álbum + utilidades
// ══════════════════════════════════════════════════════

export function esc(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

export const GROUP_COLORS = {
  A:'#ff6b35',B:'#2dd4bf',C:'#fbbf24',D:'#f43f5e',
  E:'#4ade80',F:'#a78bfa',G:'#fb923c',H:'#38bdf8',
  I:'#e879f9',J:'#34d399',K:'#c084fc',L:'#f87171'
}

export const INTRO_DATA = ["WE ARE PANINI Logo","Official Emblem /1","Official Emblem /2","Official Mascots","Official Slogan","Official Ball","Host Country Emblem - CAN","Host Country Emblem - MEX","Host Country Emblem - USA"]

export const albumData = {
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
}

export const GROUPS = {
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
}
