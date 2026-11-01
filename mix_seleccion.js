/* Selección variada y sin preguntas repetidas: exactamente mil nuevos ítems. */
(function(){
'use strict';
function normalize(v){return String(v||'').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
function hash(v){let h=2166136261;for(const c of v){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
const quotas={
 'mix:pop-ampliacion-2026':320,
 'mix:albumes-2026':160,
 'mix:television-nueva-2026':145,
 'mix:series-y-personajes-2026':145,
 'mix:famosos-gossip-2026':130,
 'mix:actualidad-2026':100
};
window.TRIVIA_MIX_FINALIZE=function(){
 const bank=window.GAME_BANK,pool=window.TRIVIA_NEW_MIX_QUESTIONS||[];
 if(!Array.isArray(bank)||!pool.length)return;
 const existing=new Set(bank.filter(q=>q[0]==='mix').map(q=>normalize(q[2])));
 const duplicateFacts=new Set();
 const existingPairs=new Set();
 for(const q of bank.filter(q=>q[0]==='mix')){
  const match=String(q[2]).match(/«([^»]{2,80})»/);
  if(match)existingPairs.add(normalize(q[3])+'|'+normalize(match[1]));
 }
 const accepted=[];
 const reserve=[];
 const bySource=Object.fromEntries(Object.keys(quotas).map(k=>[k,[]]));
 for(const q of pool){
  if(q[0]!=='mix'||!q[2]||!q[3]||!bySource[q[6]])continue;
  const key=normalize(q[2]),answer=normalize(q[3]);
  if(!key||!answer||existing.has(key)||/^(?:ninguno|ninguna|nadie)$/.test(answer))continue;
  const match=String(q[2]).match(/«([^»]{2,80})»/);
  const fact=match?answer+'|'+normalize(match[1]):null;
  if(fact&&existingPairs.has(fact)&&q[6]!=='mix:actualidad-2026')continue;
  if(fact&&duplicateFacts.has(fact))continue;
  existing.add(key);if(fact)duplicateFacts.add(fact);
  bySource[q[6]].push(q);
 }
 const ordered=(list)=>list.slice().sort((a,b)=>hash(a[2]+'|'+a[3])-hash(b[2]+'|'+b[3]));
 // Evitar series de preguntas seguidas sobre una sola cantante, programa o famoso.
 const diversity=(q)=>{
  if(q[6]==='mix:series-y-personajes-2026')return normalize(String(q[2]).match(/«([^»]+)»/)?.[1]||q[3]);
  return normalize(q[3]);
 };
 const used=new Set();
 const select=(list,cap,target)=>{
  for(const q of list){
   if(accepted.length>=1000||target<=0)break;
   const key=diversity(q),count=used.get(key)||0;
   if(count>=cap)continue;
   used.set(key,count+1);accepted.push(q);target--;
  }
  return target;
 };
 for(const [source,count] of Object.entries(quotas)){
  const entries=ordered(bySource[source]);let remaining=count;
  for(const cap of [2,3,5,10,999]){if(!remaining)break;remaining=select(entries.filter(q=>!accepted.includes(q)),cap,remaining)}
  reserve.push(...entries.filter(q=>!accepted.includes(q)));
 }
 // Algunas canciones coinciden con preguntas anteriores: cubrir esas vacantes con otras de la misma temática.
 if(accepted.length<1000){
  for(const q of ordered(reserve))if(accepted.length<1000&&!accepted.includes(q))accepted.push(q);
 }
 if(accepted.length!==1000){
  console.warn('Banco de Miscelánea incompleto:',accepted.length);
  return;
 }
 // Intercalar fuentes para evitar tandas de discos o series.
 const buckets=Object.values(quotas).length;
 accepted.sort((a,b)=>{
  const ah=hash(a[2]+'|'+a[3]+'|mezcla'),bh=hash(b[2]+'|'+b[3]+'|mezcla');
  return ah-bh;
 });
 bank.push(...accepted);
 window.TRIVIA_MIX_AUDIT={
  total:accepted.length,
  fuentes:Object.fromEntries(Object.keys(quotas).map(source=>[source,accepted.filter(q=>q[6]===source).length])),
  media:accepted.filter(q=>q[1]==='media').length,
  dificil:accepted.filter(q=>q[1]==='dificil').length
 };
};
})();