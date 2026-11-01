/* Preguntas sorpresa: catálogo ampliable sin crear una séptima categoría.
   Los datos de las respuestas proceden de las preguntas proporcionadas por el autor. */
window.TRIVIA_SURPRISE_QUESTIONS=[
  [
    "mix",
    "dificil",
    "¿Dónde nació el influencer Jaime Barreales?",
    "Ponferrada",
    [],
    "",
    "sorpresa personalizada",
    "sorpresa",
    {
      "surprise": true,
      "surpriseId": "personal-1"
    }
  ],
  [
    "mix",
    "dificil",
    "¿En qué año nació el DJ, showman e influencer Jaime Barreales?",
    "1989",
    [],
    "",
    "sorpresa personalizada",
    "sorpresa",
    {
      "surprise": true,
      "surpriseId": "personal-2"
    }
  ],
  [
    "mix",
    "dificil",
    "¿Cuál es el nombre completo (nombres y apellidos) del padre del DJ, showman e influencer Jaime Barreales?",
    "Emigdio Ángel Barreales Tomé",
    [],
    "",
    "sorpresa personalizada",
    "sorpresa",
    {
      "surprise": true,
      "surpriseId": "personal-3"
    }
  ],
  [
    "mix",
    "dificil",
    "¿Cuáles son los apellidos de Camino, la madre del DJ, showman e influencer Jaime Barreales?",
    "López Velera",
    [],
    "",
    "sorpresa personalizada",
    "sorpresa",
    {
      "surprise": true,
      "surpriseId": "personal-4"
    }
  ],
  [
    "mix",
    "dificil",
    "¿En qué localidad almeriense veranea Maeb?",
    "Roquetas de Mar",
    [],
    "",
    "sorpresa personalizada",
    "sorpresa",
    {
      "surprise": true,
      "surpriseId": "personal-5"
    }
  ],
  [
    "mix",
    "dificil",
    "¿En qué ciudad habita habitualmente Maeb?",
    "Ceuta",
    [],
    "",
    "sorpresa personalizada",
    "sorpresa",
    {
      "surprise": true,
      "surpriseId": "personal-6"
    }
  ],
  [
    "mix",
    "dificil",
    "¿Cuál es el nombre completo de Maeb?",
    "María Aída Escobar Baeza",
    [],
    "",
    "sorpresa personalizada",
    "sorpresa",
    {
      "surprise": true,
      "surpriseId": "personal-7"
    }
  ]
];
(function(){
 'use strict';
 const normalize=v=>String(v??'').toLocaleLowerCase('es').normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'').replace(/ñ/g,'n')
  .replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
 function editDistance(a,b,limit){
  if(Math.abs(a.length-b.length)>limit)return limit+1;
  let previous=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){
   const current=[i];
   let rowMinimum=current[0];
   for(let j=1;j<=b.length;j++){
    const x=Math.min(current[j-1]+1,previous[j]+1,previous[j-1]+(a[i-1]===b[j-1]?0:1));
    current.push(x);rowMinimum=Math.min(rowMinimum,x);
   }
   if(rowMinimum>limit)return limit+1;
   previous=current;
  }
  return previous[b.length];
 }
 // Devuelve null para el banco normal; las sorpresas exigen apellidos completos.
 window.TRIVIA_SURPRISE_MATCH=(input,q)=>{
  if(!q?.[8]?.surprise)return null;
  const correct=normalize(q[3]),given=normalize(input);
  if(!given)return false;
  if(/^\d{4}$/.test(correct))return given===correct || given==='en '+correct || given==='en el '+correct;
  if(given===correct)return true;
  const a=given.replace(/\s+/g,''),b=correct.replace(/\s+/g,'');
  const limit=b.length<7?1:b.length<14?2:3;
  return editDistance(a,b,limit)<=limit;
 };
 // El evento puede irrumpir en cualquier categoría, máximo una vez por partida.
 // Los índices usan el banco común para que coincidan entre ambos móviles.
 window.TRIVIA_SURPRISE_PICK=(used,shown,chance=0.012)=>{
  if(shown||Math.random()>=chance)return -1;
  const list=window.TRIVIA_SURPRISE_IDS||[];
  const free=list.filter(id=>Array.isArray(used)?!used.includes(id):
   used instanceof Set?!used.has(id):!used?.[id]);
  return free.length?free[Math.floor(Math.random()*free.length)]:-1;
 };
})();
