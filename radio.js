// ════════════════════════════════════════════════════════════════
// RADIO.JS — Reproductor de música ambiental de Grada
// Extraído de script.js: playlist, reproductor (play/pausa/siguiente/
// anterior), barra de radio y la medalla musical asociada.
//
// Importa stopAnthem() directamente de album.js (acoplamiento
// intencional: el himno de un país pausa la radio y viceversa).
// Todo lo demás (volumen maestro, push de historial de navegación)
// llega inyectado desde script.js vía initRadio(deps).
// ════════════════════════════════════════════════════════════════
import { stopAnthem } from './album.js'
import { getCurrentProfile } from './profiles.js'
import { supabase } from './supabase.js'
import { showMedalUnlockToast } from './medals.js'

let _deps = {
  getEffectiveVolume: () => 1,
  pushUiState: () => {},
  onStateChange: () => {},
};

export function initRadio(deps) {
  Object.assign(_deps, deps);
}

// ════════════ MEDALLA MÚSICA ════════════
// Se llama al abrir cualquier playlist externa (.radio-stream-btn)
async function unlockMusicMedal() {
  const profile = getCurrentProfile()
  if (!profile) return
  const stored = Array.isArray(profile.medallas) ? profile.medallas : []
  if (stored.includes('music_note')) return // ya la tiene

  const currentMedals = [...stored, 'music_note']
  try {
    await supabase.from('profiles').update({ medallas: currentMedals }).eq('id', profile.id)
    profile.medallas = currentMedals
    showMedalUnlockToast('music_note')
  } catch (e) {
    console.error('[medals] save error (music):', e)
  }
}

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
  {artist:"J Balvin, Willy William",      title:"Mi Gente",                       url:"https://files.catbox.moe/n2zzxe.mp3"},
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
    {artist:"No Te Va Gustar", title:"A las Nueve", url:"https://files.catbox.moe/t98wlt.mp3"},
  {artist:"Airbag", title:"Por Mil Noches", url:"https://files.catbox.moe/dn0qgu.mp3"},
  {artist:"Airbag", title:"Cae el Sol", url:"https://files.catbox.moe/99a2eu.mp3"},
  {artist:"No Te Va Gustar, Juan Casanova", title:"Tan Lejos", url:"https://files.catbox.moe/gafd3k.mp3"},
  {artist:"La Beriso", title:"Traicionero", url:"https://files.catbox.moe/fckjud.mp3"},
  {artist:"Ryan Castro, SOG", title:"EL RITMO QUE NOS UNE - feat. Selección Colombia", url:"https://files.catbox.moe/9jjgg7.mp3"},
  {artist:"Santaferia", title:"Locura y Pasión", url:"https://files.catbox.moe/9rfx6o.mp3"},
  {artist:"Coldplay", title:"Yellow", url:"https://files.catbox.moe/1h59wt.mp3"},
  {artist:"Khaled", title:"C’est la vie", url:"https://files.catbox.moe/4xtr2r.mp3"},
  {artist:"Ariis", title:"GOZALO", url:"https://files.catbox.moe/1m4hsd.mp3"},
  {artist:"Whispers of a Dream", title:"Retrograde", url:"https://files.catbox.moe/7aeqi8.mp3"},
  {artist:"Joey Montana", title:"Picky", url:"https://files.catbox.moe/vh6al0.mp3"},
  {artist:"Rauw Alejandro, Chencho Corleone", title:"El Efecto", url:"https://files.catbox.moe/trhvzu.mp3"},
  {artist:"Ozuna", title:"Si No Te Quiere", url:"https://files.catbox.moe/252fvf.mp3"},
  {artist:"Farruko, Bad Bunny, Rvssian", title:"Krippy Kush", url:"https://files.catbox.moe/hebsli.mp3"},
  {artist:"Francis Lai, Christian Gaubert", title:"La leçon particulière - Bande originale du film \"La leçon particulière\"", url:"https://files.catbox.moe/zrqkpf.mp3"},
  {artist:"Jamie Duffy", title:"Solas", url:"https://files.catbox.moe/mrv12i.mp3"},
  {artist:"Sidewalks and Skeletons", title:"Goth (Slowed + Reverb)", url:"https://files.catbox.moe/zpxnhw.mp3"},
  {artist:"Txmy", title:"Ethereal", url:"https://files.catbox.moe/bq5rqu.mp3"},
  {artist:"Chezile", title:"Beanie", url:"https://files.catbox.moe/p3gq74.mp3"},
  {artist:"Prince Royce", title:"La Carretera", url:"https://files.catbox.moe/fnxm9q.mp3"},
  {artist:"Lady Gaga", title:"Bloody Mary", url:"https://files.catbox.moe/xo1zco.mp3"},
  {artist:"Kam Prada", title:"Undefeated", url:"https://files.catbox.moe/h46gq6.mp3"},
  {artist:"Bad Americans", title:"Ghost Hunting", url:"https://files.catbox.moe/wgkd8e.mp3"},
  {artist:"Council", title:"The Villain", url:"https://files.catbox.moe/6zsk2p.mp3"},
    {artist:"A-Mac & the Height", title:"Foreplay / Long Time - Live", url:"https://files.catbox.moe/31c511.mp3"},
  {artist:"Elie El Hage", title:"Rhythm of You", url:"https://files.catbox.moe/e7r3wp.mp3"},
  {artist:"Gary Reynolds", title:"Till We Meet Again", url:"https://files.catbox.moe/uo17d0.mp3"},
  {artist:"Roberto Jose Rincon", title:"Al Lado del Mar", url:"https://files.catbox.moe/vxfvtj.mp3"},
  {artist:"MXZI", title:"MONTAGEM TOMADA - Slowed", url:"https://files.catbox.moe/wal1mf.mp3"},
  {artist:"DJ Asul", title:"NO ERA AMOR - Slowed", url:"https://files.catbox.moe/5m9dkn.mp3"},
  {artist:"Yb Wasg'ood, Ariis, MC PR", title:"LUNA BALA - Slowed", url:"https://files.catbox.moe/lm54t7.mp3"},
  {artist:"MXZI, Dj Samir, DJ Javi26", title:"MONTAGEM XONADA", url:"https://files.catbox.moe/1kbja0.mp3"},
  {artist:"Ogryzek", title:"GLORY", url:"https://files.catbox.moe/wc5g1r.mp3"},
  {artist:"Elliot Sutton", title:"Sua amiga eu vou pegar / Yara Yara - Slowed", url:"https://files.catbox.moe/9j92zt.mp3"},
  {artist:"Sayfalse, Scythermane", title:"COM MEDO!", url:"https://files.catbox.moe/zy2a11.mp3"},
  {artist:"ICEDMANE, DYSMANE", title:"FUNK CRIMINAL - SLOWED", url:"https://files.catbox.moe/x6nk7j.mp3"},
  {artist:"Martinwhite, Katteyes", title:"POLLYPOCKET", url:"https://files.catbox.moe/ga29lj.mp3"},
  {artist:"Ryan Castro, Kapo, Gangsta", title:"LA VILLA", url:"https://files.catbox.moe/ay9nqt.mp3"},
  {artist:"Rels B", title:"TU VAS SIN (fav)", url:"https://files.catbox.moe/eewp5l.mp3"},
  {artist:"Easykid, Dysbit", title:"Shiny", url:"https://files.catbox.moe/9d35ud.mp3"},
  {artist:"d4vd", title:"Feel It", url:"https://files.catbox.moe/6sfu2u.mp3"},
  {artist:"W Sound, Beéle, Ovy On The Drums", title:"La Plena - W Sound 05", url:"https://files.catbox.moe/r97hu7.mp3"},
  {artist:"Bad Bunny", title:"BAILE INoLVIDABLE", url:"https://files.catbox.moe/20yhy0.mp3"},
  {artist:"Alleh, Yorghaki", title:"capaz (merengueton)", url:"https://files.catbox.moe/6d5f7v.mp3"},
  {artist:"Nicky Jam, J Balvin, Maluma, Ozuna", title:"X (feat. Maluma & Ozuna) - Remix", url:"https://files.catbox.moe/6uh309.mp3"},
  {artist:"Bad Bunny", title:"EoO", url:"https://files.catbox.moe/21nyk2.mp3"},
  {artist:"FloyyMenor, Cris MJ", title:"Gata Only", url:"https://files.catbox.moe/4f1zou.mp3"},
  {artist:"Beéle", title:"no tiene sentido", url:"https://files.catbox.moe/l21c6l.mp3"},
  {artist:"Bad Bunny, Los Pleneros de la Cresta", title:"CAFé CON RON", url:"https://files.catbox.moe/vxv59r.mp3"},
    {artist:"Bersuit Vergarabat", title:"El Baile De La Gambeta", url:"https://files.catbox.moe/h4xzji.mp3"},
  {artist:"Vicentico", title:"Los Caminos de la Vida", url:"https://files.catbox.moe/36j9tn.mp3"},
  {artist:"Los Fabulosos Cadillacs", title:"Matador - Remasterizado 2008", url:"https://files.catbox.moe/w5t2y4.mp3"},
  {artist:"Los Abuelos De La Nada", title:"Mil Horas", url:"https://files.catbox.moe/edtqqw.mp3"},
  {artist:"Los Fabulosos Cadillacs", title:"Manuel Santillán, el León (Versión Reggae) - Remasterizado 2008", url:"https://files.catbox.moe/zsft69.mp3"},
  {artist:"Virus", title:"Luna de Miel en la Mano", url:"https://files.catbox.moe/szdo88.mp3"},
  {artist:"HUMBE", title:"fantasmas", url:"https://files.catbox.moe/p5e2kz.mp3"},
  {artist:"Daddy Yankee", title:"Rompe", url:"https://files.catbox.moe/ap7pix.mp3"},
  {artist:"Don Omar", title:"Taboo", url:"https://files.catbox.moe/ud6cmx.mp3"},
  {artist:"Don Miguelo", title:"Y Que Fue?", url:"https://files.catbox.moe/aod1tj.mp3"},
  {artist:"Quevedo", title:"Columbia", url:"https://files.catbox.moe/7ddgiv.mp3"},
  {artist:"Elvis Crespo", title:"Suavemente", url:"https://files.catbox.moe/4h296k.mp3"},
  {artist:"La Mosca", title:"Para No Verte Más", url:"https://files.catbox.moe/qp3ybq.mp3"},
  {artist:"La La Love You, Axolotes Mexicanos", title:"El Fin del Mundo", url:"https://files.catbox.moe/9kenh5.mp3"},
  {artist:"Prince Royce", title:"Darte un Beso", url:"https://files.catbox.moe/10itv3.mp3"},
  {artist:"Prince Royce", title:"Corazón Sin Cara", url:"https://files.catbox.moe/jbk0ra.mp3"},
  {artist:"Nicky Jam, J Balvin", title:"X", url:"https://files.catbox.moe/orlal7.mp3"},
  {artist:"Romeo Santos, Carlos Santana", title:"Necio (feat. Carlos Santana)", url:"https://files.catbox.moe/5lvx0n.mp3"},
  {artist:"Lomiiel", title:"PA QUE LO BAILES (BAILALO ROCKY)", url:"https://files.catbox.moe/d0je92.mp3"},
  {artist:"Trueno", title:"REAL GANGSTA LOVE", url:"https://files.catbox.moe/nxlygr.mp3"},
  {artist:"Ozuna", title:"Baila Baila Baila", url:"https://files.catbox.moe/5gje3j.mp3"},
  {artist:"CNCO", title:"Reggaetón Lento (Bailemos)", url:"https://files.catbox.moe/mo4dwr.mp3"},
  {artist:"Daddy Yankee, Snow", title:"Con Calma", url:"https://files.catbox.moe/ngv7l5.mp3"},
  {artist:"Marc Seguí, Rauw Alejandro, Pol Granch", title:"Tiroteo - Remix", url:"https://files.catbox.moe/btd3no.mp3"},
  {artist:"Anuel AA, Daddy Yankee, Zion & Lennox, Farruko, Wisin", title:"Sola (Remix)", url:"https://files.catbox.moe/mv3t7w.mp3"},
    {artist:"Plan B", title:"Fanatica Sensual", url:"https://files.catbox.moe/re9rkp.mp3"},
  {artist:"Nicky Jam", title:"El Amante", url:"https://files.catbox.moe/1akx0k.mp3"},
  {artist:"Fuerza Regida, Grupo Frontera", title:"COQUETA", url:"https://files.catbox.moe/kqjy3l.mp3"},
  {artist:"Boza", title:"Hecha Pa' Mi", url:"https://files.catbox.moe/0bf9pr.mp3"},
  {artist:"Cosculluela, Bad Bunny", title:"Madura", url:"https://files.catbox.moe/i0243c.mp3"},
  {artist:"Gsus lz", title:"QUÉDIRÁN", url:"https://files.catbox.moe/3hnsbt.mp3"},
  {artist:"KAROL G, Nicki Minaj", title:"Tusa", url:"https://files.catbox.moe/5box0r.mp3"},
  {artist:"Nicky Jam, Enrique Iglesias", title:"El Perdón (with Enrique Iglesias)", url:"https://files.catbox.moe/bzdhcj.mp3"},
  {artist:"El Alfa, Yandel, Myke Towers", title:"Dembow y Reggaetón", url:"https://files.catbox.moe/vsptd2.mp3"},
  {artist:"Myke Towers", title:"Piensan", url:"https://files.catbox.moe/5po5y8.mp3"},
  {artist:"Feloman, Jon Z", title:"Quiere Que Llame", url:"https://files.catbox.moe/sdkbb4.mp3"},
  {artist:"Luck Ra, BM", title:"La Morocha", url:"https://files.catbox.moe/6u8qcn.mp3"},
  {artist:"Pure Negga, Skillz Beatz, Kion Studio", title:"Cnv Sound, Vol. 14", url:"https://files.catbox.moe/wqmcky.mp3"},
  {artist:"Ozuna", title:"Se Preparó", url:"https://files.catbox.moe/9h7b46.mp3"},
  {artist:"Daddy Yankee", title:"La Despedida", url:"https://files.catbox.moe/fj8usn.mp3"},
  {artist:"Ozuna", title:"Dile Que Tu Me Quieres", url:"https://files.catbox.moe/cjrh88.mp3"},
  {artist:"J Balvin, Farruko", title:"6 AM", url:"https://files.catbox.moe/ggerc2.mp3"},
  {artist:"Bad Bunny", title:"Me Fui de Vacaciones", url:"https://files.catbox.moe/txeq0r.mp3"},
  {artist:"Wisin, Ozuna", title:"Escápate Conmigo (feat. Ozuna)", url:"https://files.catbox.moe/cjziur.mp3"},
  {artist:"Daddy Yankee", title:"Pose", url:"https://files.catbox.moe/3ivbbq.mp3"},
  {artist:"El Bogueto, Yung Beef", title:"Cuando No Era Cantante", url:"https://files.catbox.moe/mugt93.mp3"},
  {artist:"Alemán, Neton Vega", title:"Te Quería Ver", url:"https://files.catbox.moe/3t6zmw.mp3"},
  {artist:"Charly Black, Daddy Yankee", title:"Gyal You a Party Animal - Remix", url:"https://files.catbox.moe/i64msp.mp3"},
  {artist:"Maluma", title:"Felices los 4", url:"https://files.catbox.moe/6oyi6k.mp3"},
  {artist:"Zion, Jory Boy, Ken-Y", title:"More", url:"https://files.catbox.moe/8ljz5q.mp3"},
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

export function isRadioPlaying() { return _radioPlaying; }
export function isRadioVisible() { return _radioVisible; }
export function hasRadioAudio()  { return !!_radioAudio; }
export function getCurrentTrackTitle() {
  return (_radioQueue && _radioQueue[_radioIdx]) ? _radioQueue[_radioIdx].title : '';
}

function radioLoadTrack(idx) {
  if (_radioAudio) { _radioAudio.pause(); _radioAudio.src = ''; }
  const track = _radioQueue[idx];
  document.getElementById('radio-title').textContent  = track.title;
  document.getElementById('radio-artist').textContent = track.artist;
  _radioAudio = new Audio(track.url);
  _radioAudio.volume = _deps.getEffectiveVolume();
  _radioAudio.addEventListener('ended', () => radioNext());
  if (_radioPlaying) _radioAudio.play().catch(() => {});
  _deps.onStateChange();
}

function radioPlay() {
  if (!_radioAudio) radioLoadTrack(_radioIdx);
  stopAnthem(); // no himno mientras suena radio
  const bg = document.getElementById('bg-video');
  if (bg) { bg._prevVolume = bg.volume; bg.volume = 0; }
  _radioAudio.volume = _deps.getEffectiveVolume();
  _radioAudio.play().catch(() => {});
  _radioPlaying = true;
  document.getElementById('radio-play').textContent = '⏸';
  _deps.onStateChange();
}

export function pauseRadio(restoreVideo = true) {
  if (_radioAudio) _radioAudio.pause();
  _radioPlaying = false;
  document.getElementById('radio-play').textContent = '▶';
  if (restoreVideo) {
    const bg = document.getElementById('bg-video');
    if (bg) { bg.volume = bg._prevVolume != null ? bg._prevVolume : _deps.getEffectiveVolume(); bg._prevVolume = null; }
  }
  _deps.onStateChange();
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

function closeRadioCompletely(){
  pauseRadio(true);
  _radioVisible = false;
  document.getElementById('radio-bar')?.classList.remove('visible');
  document.body.style.paddingBottom = '';
  _deps.onStateChange();
}

// Para el control de volumen maestro en script.js (applyMasterVolume)
export function setRadioVolume(v) {
  if (_radioAudio) _radioAudio.volume = v;
}

// ════════════ Listeners ════════════
document.getElementById('btn-radio').addEventListener('click', () => {
  if (!_radioVisible) {
    _radioVisible = true;
    document.getElementById('radio-bar').classList.add('visible');
    document.body.style.paddingBottom = '78px';
    if (!_radioAudio) radioLoadTrack(_radioIdx);
    radioPlay();
    _deps.pushUiState('radio');
  } else {
    closeRadioCompletely();
  }
});

document.getElementById('radio-play').addEventListener('click', () => {
  if (_radioPlaying) pauseRadio(true);
  else radioPlay();
});
document.getElementById('radio-next').addEventListener('click', radioNext);
document.getElementById('radio-prev').addEventListener('click', radioPrev);
document.getElementById('radio-stop')?.addEventListener('click', closeRadioCompletely);

// Medalla musical al abrir playlists externas
document.querySelectorAll('.radio-stream-btn').forEach(a => {
  a.addEventListener('click', () => unlockMusicMedal());
});
