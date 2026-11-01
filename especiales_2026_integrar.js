/* Trivial Seis · carga validada de 100 nuevas preguntas especiales por categoría.
   Se añaden únicamente a la colección especial (modos solitario y VS).
   El banco tradicional de la ruleta y sus índices permanecen intactos.
*/
(function(){
'use strict';
const defs=[
 ['historia',window.TRIVIA_SPECIAL_2026_HISTORIA],
 ['arte',window.TRIVIA_SPECIAL_2026_ARTE],
 ['geo',window.TRIVIA_SPECIAL_2026_GEO],
 ['cine',window.TRIVIA_SPECIAL_2026_CINE],
 ['lit',window.TRIVIA_SPECIAL_2026_LIT],
 ['mix',window.TRIVIA_SPECIAL_2026_MIX]
];
const normal=s=>String(s??'').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const old=window.TRIVIA_BONUS_QUIZ;
if(!Array.isArray(old)){console.error('No se ha cargado el banco anterior de preguntas especiales.');return;}
if(old.some(q=>q?.[8]?.edition==='especiales2026'))return;
const previous=new Set(old.map(q=>normal(q[2])));
const seen=new Set(previous);
const output=[];
const counts={};
for(const [category,items] of defs){
 if(!Array.isArray(items)||items.length!==100){
  console.error('Banco especial incompleto:',category,items?.length);
  return;
 }
 let count=0;
 for(const item of items){
  const {q,a,d,topic}=item||{};
  if(typeof q!=='string'||typeof a!=='string'||!Array.isArray(d)||d.length!==3||
      typeof topic!=='string'||!q.startsWith('¿')||!q.endsWith('?')){
   console.error('Enunciado especial inválido:',category,q);return;
  }
  const key=normal(q);
  if(!key||seen.has(key)){console.error('Enunciado repetido:',category,q);return;}
  const answers=[a,...d].map(x=>String(x).trim());
  if(answers.some(x=>!x)||new Set(answers.map(normal)).size!==4){
   console.error('Opciones repetidas o vacías:',category,q);return;
  }
  seen.add(key);
  // Rotación reproducible: repartir la respuesta correcta entre los cuatro botones.
  let h=2166136261;
  for(const c of q){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}
  const position=(h>>>0)%4;
  const options=answers.slice(1);
  options.splice(position,0,answers[0]);
  const isWrong=/\bNO\b|incorrect[ao]s?|equivocad[ao]s?|intrus[ao]/i.test(q);
  const variant=isWrong?'intruso':'eleccion';
  output.push([category,'dificil',q,a,[],'','especial:ampliacion-2026:'+topic,variant,
   {special_choice:true,options,variant,subtopic:topic,edition:'especiales2026'}]);
  count++;
 }
 counts[category]=count;
}
if(output.length!==600||Object.values(counts).some(n=>n!==100))return;
old.push(...output);
window.TRIVIA_SPECIAL_2026_COUNTS={total:output.length,byCategory:counts,all:old.length};
})();