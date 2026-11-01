/* TRIVIA SEIS: 1.000 preguntas nuevas. Reparto: política (800), literatura accesible (200).
   Fuentes editorialmente separadas para facilitar revisión y evitar repetidas.
   Se aplican después de las ampliaciones antiguas, sin modificar sus índices.
*/
(function(){
'use strict';
window.TRIVIA_BANK_PATCHES??=[];
const quotas={
 'instituciones':180,
 'politica-historia':180,
 'politica-internacional':220,
 'democracia-mundo':220,
 'literatura-facil':200
};
function norm(text){
 return String(text??'').toLocaleLowerCase('es').normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
}
function hash(s){
 let h=2166136261;
 for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}
 return h>>>0;
}
window.TRIVIA_BANK_PATCHES.push(function(){
 const bank=window.GAME_BANK;
 const packs=window.TRIVIA_LITPOL_PACKS;
 if(!Array.isArray(bank)||!Array.isArray(packs)||packs.length<5)return;
 const existing=new Set(bank.map(q=>norm(q[2])));
 const candidates=[];
 const selected=[];
 const audit={};
 // Evitar respuestas vacías, preguntas repetidas y coincidencias exactas con el banco anterior.
 for(const pack of packs){
  const own=new Set();
  const cleaned=[];
  for(const row of pack.rows||[]){
   if(!Array.isArray(row)||row.length!==2)continue;
   const q=String(row[0]||'').trim(),a=String(row[1]||'').trim();
   const key=norm(q);
   if(!q||!a||!key||existing.has(key)||own.has(key))continue;
   own.add(key);cleaned.push([q,a]);
  }
  cleaned.sort((a,b)=>hash(a[0]+'|'+a[1]+'|trivia2026')-hash(b[0]+'|'+b[1]+'|trivia2026'));
  candidates.push({id:pack.id,rows:cleaned});
 }
 const used=new Set(existing);
 for(const [id,wanted] of Object.entries(quotas)){
  const pack=candidates.find(x=>x.id===id);
  if(!pack){audit[id]=0;continue;}
  let count=0;
  for(const [question,answer] of pack.rows){
   if(count>=wanted)break;
   const key=norm(question);
   if(used.has(key))continue;
   used.add(key);
   const literature=id==='literatura-facil';
   const source=literature?'literatura:light-2026':'politica:ampliacion-2026';
   const hard=!literature&&hash(question)%9===0;
   selected.push(['lit',hard?'dificil':'media',question,answer,[],'',source,id]);
   count++;
  }
  audit[id]=count;
 }
 // Si cambia algún banco antiguo, cubrir huecos con preguntas no seleccionadas de la misma rama.
 const needPolitics=800-selected.filter(q=>q[7]!=='literatura-facil').length;
 const needLiterature=200-selected.filter(q=>q[7]==='literatura-facil').length;
 const fill=(literature,n)=>{
  if(n<=0)return;
  const others=candidates.filter(p=>(p.id==='literatura-facil')===literature)
   .flatMap(p=>p.rows.map(([q,a])=>({q,a,id:p.id})))
   .sort((a,b)=>hash(a.q+'|resto')-hash(b.q+'|resto'));
  for(const {q,a,id} of others){
   if(n<=0)break;
   const k=norm(q);
   if(used.has(k))continue;
   used.add(k);
   selected.push(['lit',!literature&&hash(q)%9===0?'dificil':'media',q,a,[],'',literature?'literatura:light-2026':'politica:ampliacion-2026',id]);
   audit[id]=(audit[id]||0)+1;
   n--;
  }
 };
 fill(false,needPolitics);
 fill(true,needLiterature);
 if(selected.length!==1000){
  console.warn('Ampliación incompleta: '+selected.length+'/1000; banco antiguo sin modificar.');
  window.TRIVIA_LITPOL_COUNTS={error:'Insuficientes preguntas únicas',found:selected.length};
  return;
 }
 bank.push(...selected);
 window.TRIVIA_LITPOL_COUNTS={
  total:selected.length,
  politica:selected.filter(q=>q[7]!=='literatura-facil').length,
  literatura:selected.filter(q=>q[7]==='literatura-facil').length,
  fuentes:audit,
  porDificultad:{
   media:selected.filter(q=>q[1]==='media').length,
   dificil:selected.filter(q=>q[1]==='dificil').length
  }
 };
});
})();
