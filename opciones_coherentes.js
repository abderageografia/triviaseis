/* Opciones homogéneas: nunca completar huecos con respuestas de otra clase. */
(function(){
'use strict';
const N=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const clean=v=>String(v||'').trim();
const numeric=v=>/^(?:c\.\s*)?\d{1,4}(?:\s*a\.?\s*c\.?)?$/.test(v);
const shapes=v=>/^siglo\s/i.test(v)?'siglo':numeric(v)?'año':/^\d+(?:[,.]\d+)?\s*%$/.test(v)?'porcentaje':/^\d+(?:[,.]\d+)?$/.test(v)?'cantidad':'texto';
function semantic(q){
 const a=clean(q[3]),t=clean(q[2]).toLocaleLowerCase('es'),tag=clean(q[7]).toLowerCase(),sh=shapes(a);
 if(sh!=='texto')return sh;
 // Un cargo deportivo necesita alternativas del mismo ámbito y función.
 if(/(?:federaci[oó]n espa[nñ]ola de f[uú]tbol|\brfef\b)/i.test(t)&&/presidente|presidenta|dirigi[oó]/i.test(t))return 'futbol:dirigente';
 if(/¿en qué (?:año|siglo|década)|¿de qué (?:siglo|año)/.test(t))return 'fecha';
 if(/¿cómo se (?:apellida|apellidaba)|¿cuál es el apellido/.test(t))return 'apellido';
 const bravo=/housewives|rhoslc|rhobh|rhonj|rhori|rhony|bravo-(bh|slc|ri)/i.test(t+' '+tag);
 if(bravo){
  if(/¿(?:en qué|qué) ciudad|¿de qué localidad/.test(t))return 'bravo:ciudad';
  if(/¿(?:en qué|qué) estado/.test(t))return 'bravo:estado';
  if(/¿qué franquicia|¿dónde/.test(t))return 'bravo:ubicacion';
  if(/¿qué presentador|¿quién present[oó]|¿quién dirigi[oó] (?:el |un )?reencuentro/.test(t))return 'bravo:presentador';
  if(/¿cómo se abrevia|siglas/.test(t))return 'bravo:siglas';
  if(/¿qué programa|¿qué reality|¿cuál es el título/.test(t))return 'bravo:programa';
  if(/¿quién|¿qué (?:integrante|mujer|ama de casa|exconcursante|presentador|cantante|participante|famosa|figura|actriz|socialité|personaje)|¿cómo se llama la participante/.test(t))return 'bravo:persona';
  return null;
 }
 if(/musica-(?:interprete|album)/.test(tag))return 'interprete-musical';
 if(tag==='television-presentador')return 'presentador';
 if(tag==='television-interprete')return 'actor';
 if(/¿(?:de|en) qué pa[ií]s|¿qué pa[ií]s|¿de qué nacionalidad|¿en qué naci[oó]n/.test(t))return 'pais';
 if(/¿(?:de|en) qué ciudad|¿qué ciudad|¿cuál es la capital|¿dónde se (?:encuentra|encuentran|ubica|celebró|celebra)/.test(t))return 'ciudad';
 if(/¿qué (?:canci[oó]n|tema musical|sencillo|himno)|¿cuál (?:canci[oó]n|tema)/.test(t))return 'cancion';
 if(/¿qué (?:disco|[aá]lbum)|¿cuál (?:disco|[aá]lbum)/.test(t))return 'album';
 if(/¿(?:en qué|qué) (?:programa|concurso|reality|serie|franquicia|show|formato)|¿cuál (?:programa|reality|serie)/.test(t))return 'programa';
 if(/¿qué (?:pel[ií]cula|largometraje|filme)|¿en qué pel[ií]cula/.test(t))return 'pelicula';
 if(/¿qué (?:novela|libro|obra literaria)|¿en qué novela/.test(t))return 'literatura';
 if(/¿qué (?:premio|galard[oó]n)|¿cuál es el premio/.test(t))return 'premio';
 if(/¿qué (?:grupo|banda)|¿a qué grupo/.test(t))return 'grupo';
 if(/¿quién|¿de qui[eé]n|¿qu[eé] (?:actor|actriz|artista|cantante|solista|rapero|rapera|compositor|int[eé]rprete|famoso|famosa|socialit[eé]|concursante|presentador|presentadora|influencer|influente|celebridad|personaje|cantautor|directora|director|presidente|presidenta|futbolista|jugador|modelo|pol[ií]tico|pol[ií]tica|miembro|integrante|jurado|creador|creadora|streamer|empresario|empresaria)/.test(t)){
  if(/¿qu[eé] (?:actor|actriz|int[eé]rprete)|interpreta|da vida|encarna/.test(t))return 'actor';
  if(/¿qu[eé] (?:cantante|m[uú]sico|grupo|banda)|canta|sencillo|grab[oó]|lanz[oó]|public[oó] el disco|[aá]lbum/.test(t))return 'interprete-musical';
  if(/present[oó]|presentaba|al frente|condujo el programa/.test(t))return 'presentador';
  return 'persona';
 }
 if(/¿cómo se llama (?:el personaje|la protagonista|el protagonista)|¿qué personaje/.test(t))return 'personaje';
 if(/¿qu[eé] (?:instituci[oó]n|organismo|tribunal|empresa|plataforma)/.test(t))return 'organizacion';
 return null;
}
function domain(q){
 const t=clean(q[2]).toLocaleLowerCase('es');
 const tag=clean(q[7]).toLocaleLowerCase('es');
 if(/housewives|real housewives|rhobh|rhoslc|rhonj|rhony|rhori|bravo-/.test(t+' '+tag))return 'bravo';
 if(/f[uú]tbol|futbolist|mundial femenino|selecci[oó]n espa[nñ]ola|bal[oó]n de oro|\\brfef\\b|laliga|liga de campeones|champions|premier league|\\bfifa\\b|\\buefa\\b/.test(t))return 'futbol';
 if(/tenis|wimbledon|baloncesto|\\bnba\\b|f[oó]rmula 1|motogp|olimpiad|deportista/.test(t))return 'deporte';
 if(/president|primer ministro|gobierno|congreso|senado|parlamento|partido pol[ií]tico|elecciones|alcald|monarc|diputad/.test(t))return 'politica';
 if(/m[uú]sica|canci[oó]n|disco|[aá]lbum|cantante|grammy|eurosi[oó]n|eurovisi[oó]n|raper|\\bdj\\b/.test(t))return 'musica';
 if(/serie de televisi[oó]n|programa de televisi[oó]n|reality|presentador|presentadora|concurso televisivo|netflix|telecinco|antena 3|rtve|la 1|serie /.test(t))return 'television';
 if(/pel[ií]cula|cine|oscar|director de cine|actriz|actor|film|largometraje/.test(t))return 'cine';
 if(/influencer|tiktoker|streamer|youtuber|instagram|twitch/.test(t))return 'internet';
 return null;
}
const curated={
 'futbol:dirigente':['Ángel María Villar','Pedro Rocha','Rafael Louzán','Javier Tebas']
};
function family(k){
 if(['persona','actor','presentador','interprete-musical','bravo:persona'].includes(k))return 'persona';
 if(k==='bravo:ubicacion')return 'ubicacion';
 return k;
}
const houseNames=['Kyle Richards','Kim Richards','Kathy Hilton','Lisa Rinna','Lisa Vanderpump','Erika Jayne','Dorit Kemsley','Sutton Stracke','Garcelle Beauvais','Jennifer Tilly','Bozoma Saint John','Heather Gay','Whitney Rose','Meredith Marks','Mary Cosby','Lisa Barlow','Jen Shah','Monica Garcia','Bronwyn Newport','Britani Bateman','Dolores Catania','Teresa Giudice','Melissa Gorga','Ashley Iaconetti','Rulla Nehme Pontarelli','Alicia Carmody'];
const houseCities=['Beverly Hills','Salt Lake City','Atlanta','New York City','Potomac','Miami','Dallas','Dubai','Vancouver','Melbourne'];
const houseStates=['Utah','New Jersey','Rhode Island','California','Georgia','Florida','Texas'];
const housePlaces=[...houseCities,...houseStates,'Orange County','Cheshire'];
function choose(q,bank,amount=4,validFn=null){
 if(!q||![2,4].includes(amount))return [];
 const a=clean(q[3]);if(!a)return [];
 const normal=Array.isArray(q[8]?.options)&&q[8]?.special_choice;
 if(normal){
  const options=q[8].options.map(clean);
  if(options.length!==4||!options.includes(a)||new Set(options.map(N)).size!==4)return [];
  const arr=amount===2?[a,options.find(x=>N(x)!==N(a))]:options.slice();
  return arr.sort(()=>Math.random()-.5);
 }
 const kind=semantic(q);
 if(!kind)return [];  // Ante la duda, respuesta escrita.
 if(curated[kind]){
  const pool=curated[kind].filter(v=>N(v)!==N(a)&&!(validFn&&validFn(v,q))).slice(0,amount-1);
  if(pool.length!==amount-1)return [];
  const picks=[a,...pool];
  for(let i=picks.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[picks[i],picks[j]]=[picks[j],picks[i]]}
  return picks;
 }
 const shape=shapes(a),cat=q[0];
 const candidates=[],used=new Set([N(a)]);
 const topic = /bravo:/.test(kind)?'bravo':/^(?:interprete-musical|cancion|album|grupo)$/.test(kind)?'musica':/^(?:presentador|actor|programa)$/.test(kind)?'tv':null;
 const personKinds=new Set(['persona','actor','presentador','interprete-musical','bravo:persona']);
 const requestDomain=domain(q);
 const sameTopic=p=>{
  const k=semantic(p);
  if(!k)return false;
  // Un actor, un presidente y un futbolista no son distractores intercambiables.
  if(personKinds.has(kind)){
   if(topic==='bravo')return k===kind;
   if(!requestDomain||domain(p)!==requestDomain)return false;
   if(k===kind)return true;
   // En el mismo ámbito se permite un perfil parecido, nunca otra temática.
   return family(k)===family(kind)&&family(kind)==='persona'&&requestDomain!=='politica';
  }
  return k===kind;
 };
 for(const peer of bank){
  if(!peer||peer===q||peer[0]!==cat||peer[8]?.special_choice)continue;
  const value=clean(peer[3]);
  if(kind==='bravo:persona'&&/integrante|famosa|mujer|ama de casa|exconcursante|actriz|socialité|participante|concursante|hermana/i.test(q[2]||'')&&/^(?:andy cohen)$/i.test(value))continue;
  if(!value||used.has(N(value))||!sameTopic(peer)||shapes(value)!==shape)continue;
  if(shape==='año'&&/a\.?\s*c/i.test(value)!==/a\.?\s*c/i.test(a))continue;
  if(shape==='año'&&Math.abs(Number(value)-Number(a))>45)continue;
  if(shape==='texto'&&Math.abs(value.length-a.length)>Math.max(14,a.length*.85))continue;
  if(validFn&&validFn(value,q))continue;
  used.add(N(value));
  let rank=0;
  if(peer[7]===q[7])rank+=6;
  if(peer[6]===q[6])rank+=4;
  if(topic==='bravo'&&/bravo|housewives/i.test(peer[2]+' '+peer[7]))rank+=8;
  const spanishShows=/Aída|Aquí no hay quien viva|La que se avecina|Los protegidos|Los Serrano|Cuéntame cómo pasó|Las chicas del cable|Vis a vis|La casa de papel|Élite|El internado|Física o química|El ministerio del tiempo/i;
  if(kind==='actor'&&spanishShows.test(peer[2])===spanishShows.test(q[2]))rank+=4;
  if(topic==='tv'&&/televisi[oó]n|programa|serie|reality|cast/i.test(peer[2]+' '+peer[7]))rank+=2;
  if(topic==='musica'&&/cantante|int[eé]rprete|canci[oó]n|disco|[aá]lbum|m[uú]sica/i.test(peer[2]+' '+peer[7]))rank+=2;
  candidates.push({value,rank:rank+Math.random()});
 }
 if(['bravo:persona','bravo:ubicacion','bravo:ciudad','bravo:estado'].includes(kind)){
  const correctPool=kind==='bravo:persona'?houseNames:kind==='bravo:ciudad'?houseCities:kind==='bravo:estado'?houseStates:housePlaces;
  for(const value of correctPool){
   if(!used.has(N(value))&&value!==a){used.add(N(value));candidates.push({value,rank:10+Math.random()})}
  }
 }
 candidates.sort((a,b)=>b.rank-a.rank);
 if(candidates.length<amount-1)return [];
 const picks=[a,...candidates.slice(0,amount-1).map(x=>x.value)];
 for(let i=picks.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[picks[i],picks[j]]=[picks[j],picks[i]]}
 return picks;
}
window.TRIVIA_OPTIONS={make:choose,kind:semantic};
})();