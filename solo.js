(function SoloGame() {
'use strict';
const BANK = window.GAME_BANK || [];
const byCat = ['historia','arte','geo','cine','lit','mix'];
const names = ['Historia','Arte','Geografía','Cine','Literatura','Miscelánea'];
const icons = ['🏛️','🎨','🌍','🎬','📚','🎤'];
const colors = ['#ef7186','#f2bf62','#42c8be','#6a9efa','#b99aff','#67d087'];
const KEY = 'triviaSeisSoloV1';
const htmlEscape = v => String(v??'').replace(/[&<>"']/g, a=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[a]));
const root = document.createElement('section');
root.id = 'soloRoot';
root.hidden = true;
root.setAttribute('aria-label','Modo para un jugador');
document.body.appendChild(root);
const css = document.createElement('style');
css.textContent = `
#soloRoot{position:fixed;z-index:15000;inset:0;overflow:auto;background:radial-gradient(circle at 50% -10%,#263e71 0,#0a1229 55%,#070c1b 100%);color:#f5f6ff;font:inherit;padding:18px 12px 46px;overscroll-behavior:contain}
#soloRoot[hidden]{display:none!important}
#soloRoot *{box-sizing:border-box}
.solo-wrap{max-width:720px;margin:auto}
.solo-top{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.solo-logo{font-size:19px;font-weight:900;flex:1;letter-spacing:.4px}
.solo-small{font-size:12px;color:#9ce6e9;letter-spacing:1.5px}
.solo-back{color:#f5f6ff;background:#263553;border:1px solid #58709c;border-radius:14px;padding:11px 13px;font-weight:700;cursor:pointer}
.solo-panel{background:linear-gradient(140deg,#223253,#15213d);border:1px solid #596c94;box-shadow:0 12px 30px #0004;border-radius:24px;padding:20px;margin:12px 0}
.solo-panel h2{font-size:clamp(23px,6vw,34px);line-height:1.14;text-align:center;margin:12px 0 16px}
.solo-note{color:#b5c4e0;font-size:14px;line-height:1.5;text-align:center}
.solo-cta{border:1px solid #9d98ff;border-bottom:5px solid #34238c;background:linear-gradient(120deg,#7862ff,#5142e8);color:#fff;border-radius:19px;padding:17px;font-weight:900;font-size:17px;min-height:58px;display:block;width:100%;cursor:pointer;margin:12px auto;touch-action:manipulation}
.solo-cta:disabled,.solo-pill:disabled{opacity:.45;cursor:default}
.solo-secondary{background:#283b5f;border:1px solid #6e85b1;border-radius:14px;padding:13px;color:#fff;font-weight:750;cursor:pointer}
.solo-choices{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.solo-choice{padding:17px 10px;min-height:110px;text-align:left;border-radius:16px;border:1px solid #6a80aa;background:#172640;color:#fff;cursor:pointer}
.solo-choice b{display:block;font-size:17px;margin-bottom:7px}
.solo-choice small{color:#b8c8e4;font-size:12px;line-height:1.3}
.solo-choice.active{border:2px solid #9ce7df;box-shadow:0 0 0 2px #42d8c22e}
.solo-select{display:block;background:#0c1932;color:#fff;border:1px solid #6c80b1;border-radius:13px;padding:13px;width:100%;font-size:16px;margin:9px 0 15px}
.solo-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;text-align:center}
.solo-stat{background:#10203a;border:1px solid #536e98;border-radius:15px;padding:12px 3px}
.solo-stat b{color:#ffe094;display:block;font-size:27px}
.solo-stat small{color:#9ee4e7;font-size:11px;font-weight:700}
.solo-pips{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px;margin:15px 0 5px}
.solo-pip{background:#12233e;border-radius:12px;text-align:center;padding:8px 2px;min-width:0;border:1px solid #536786}
.solo-pip b{display:block;font-size:10px;margin-top:5px;color:#d3e5fc}
.solo-circles{display:flex;justify-content:center;gap:3px;margin-top:5px}
.solo-circles i{display:block;width:10px;height:10px;border-radius:50%;background:#344665}
.solo-circles i.on{background:var(--cc);box-shadow:0 0 7px var(--cc)}
.solo-wheel-wrap{width:min(72vw,290px);height:min(72vw,290px);position:relative;margin:12px auto 17px}
.solo-disc{width:100%;height:100%;transition:transform 1500ms cubic-bezier(.17,.78,.09,1);border-radius:50%;box-shadow:0 4px 25px #0009}
.solo-pointer{position:absolute;z-index:2;top:-16px;left:calc(50% - 14px);border-left:14px solid transparent;border-right:14px solid transparent;border-top:25px solid #fff0;border-bottom:25px solid #ffe09c;transform:rotate(180deg);filter:drop-shadow(0 2px 3px #000)}
.solo-wheel-center{position:absolute;left:33%;top:33%;width:34%;height:34%;background:#0d1630;border:5px solid #ccd9ec;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;box-shadow:0 2px 13px #0007}
.solo-tag{text-align:center;font-size:13px;font-weight:800;color:#9fe5e8;letter-spacing:1.7px;margin:5px 0 13px}
.solo-question{font-size:clamp(23px,5.5vw,34px);line-height:1.25;font-weight:850;text-align:center;margin:23px 0}
.solo-field{width:100%;background:#09152d;border-radius:16px;border:1px solid #607ba7;color:white;padding:17px;font-size:19px;outline-offset:3px}
.solo-media{width:100%;max-width:480px;max-height:280px;display:block;object-fit:contain;margin:12px auto;border-radius:13px;background:#0a1020}
.solo-crop{margin:12px auto;width:min(100%,320px);aspect-ratio:1/1;overflow:hidden;border-radius:14px}
.solo-crop img{width:100%;height:100%;object-fit:cover;transform:scale(var(--z,2));transform-origin:var(--pos,center center)}
.solo-time{height:12px;border-radius:9px;background:#0a1732;overflow:hidden;border:1px solid #52618a;margin:10px 0}
.solo-time > div{height:100%;width:100%;background:#65d8ca;transition:width 250ms linear}
.solo-powers{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:15px}
.solo-pill{background:#283a5c;border:1px solid #7388ae;color:#fff;border-radius:13px;padding:11px 4px;font-size:12px;cursor:pointer}
.solo-ok{border:1px solid #5eddb6;background:#173c3b;color:#8bffdb;border-radius:15px;padding:14px;text-align:center;font-size:20px;font-weight:850}
.solo-no{border:1px solid #ec8195;background:#3b233f;color:#ffabbc;border-radius:15px;padding:14px;text-align:center;font-size:20px;font-weight:850}
.solo-kicker{font-size:12px;font-weight:800;letter-spacing:1.7px;text-align:center;color:#a1e6ed}
@media(min-width:640px){#soloRoot{padding:25px}}
`;
document.head.appendChild(css);
let state = null, tick = 0, spinning = false, wheelRotation = 0, mediaTicket = 0, chosenMode = 'classic', chosenLevel = 'both';
const save=()=>{if(state)try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}};
function load(){try{let old=JSON.parse(localStorage.getItem(KEY)||'null');if(old?.v===1&&Array.isArray(old.pips)&&Array.isArray(old.used)&&old.stage!=='finished')return old}catch{}return null}
function resetSave(){try{localStorage.removeItem(KEY)}catch{}}
function stopTimer(){if(tick){clearInterval(tick);tick=0}}
function close(){stopTimer();root.hidden=true;document.body.style.overflow='';save()}
function open(){root.hidden=false;document.body.style.overflow='hidden';state=load();if(state&&state.stage==='question'&&Date.now()>Number(state.deadline))grade('',true);else render()}
const currentCat=()=>state?.cat??0;
const playerQuestion=()=>BANK[state?.qid]||null;
function screen(content){root.innerHTML='<div class="solo-wrap"><div class="solo-top"><div class="solo-logo">🎯 TRIVIA·SEIS <span class="solo-small">EN SOLITARIO</span></div><button class="solo-back" data-solo="close">Salir</button></div>'+content+'</div>'}
function actionButton(cmd,title,cl='solo-cta'){return '<button class="'+cl+'" data-solo="'+cmd+'">'+title+'</button>'}
function summary(){
 const pips=state.pips;
 return '<div class="solo-stats"><div class="solo-stat"><b>'+state.points+'</b><small>PUNTOS</small></div><div class="solo-stat"><b>'+('❤️'.repeat(state.lives)||'0')+'</b><small>VIDAS</small></div><div class="solo-stat"><b>🔥 '+state.streak+'</b><small>RACHA</small></div></div><div class="solo-pips">'+pips.map((n,i)=>'<div class="solo-pip"><span>'+icons[i]+'</span><div class="solo-circles">'+[0,1,2].map(j=>'<i class="'+(j<n?'on':'')+'" style="--cc:'+colors[i]+'"></i>').join('')+'</div><b>'+n+'/3</b></div>').join('')+'</div><p class="solo-note" style="margin:8px 0">🛡️ '+state.shields+' escudos · ⭐ '+state.stars+' coronas · ✅ '+state.correct+' aciertos'+(state.mode==='sprint'?' / '+state.goal+' preguntas':'')+'</p>';
}
function wheelSvg(){
 const step=2*Math.PI/6, cx=150,cy=150,r=145;
 return '<svg viewBox="0 0 300 300" style="width:100%;height:100%" aria-label="Ruleta de categorías">'+colors.map((col,i)=>{
 const a=i*step-Math.PI/2,b=(i+1)*step-Math.PI/2;
 let x1=cx+r*Math.cos(a),y1=cy+r*Math.sin(a),x2=cx+r*Math.cos(b),y2=cy+r*Math.sin(b);
 let t=(a+b)/2,tx=cx+90*Math.cos(t),ty=cy+90*Math.sin(t);
 return '<path d="M 150 150 L '+x1+' '+y1+' A '+r+' '+r+' 0 0 1 '+x2+' '+y2+' Z" fill="'+col+'" stroke="#10213c" stroke-width="3" opacity="'+(state.pips[i]===3?'.3':'1')+'"/><text x="'+tx+'" y="'+(ty+8)+'" font-size="30" text-anchor="middle">'+icons[i]+'</text>'
 }).join('')+'</svg>';
}
function render(){
 if(root.hidden)return;
 stopTimer();
 if(!state){
  screen('<div class="solo-panel"><div class="solo-kicker">UN JUGADOR · SIN FIREBASE</div><h2>Tu ruleta. Tu desafío.</h2><div class="solo-choices"><button class="solo-choice '+(chosenMode==='classic'?'active':'')+'" data-solo="classic"><b>👑 Conquista</b><small>Completa las seis coronas, una por categoría. Cinco vidas.</small></button><button class="solo-choice '+(chosenMode==='sprint'?'active':'')+'" data-solo="sprint"><b>⚡ Desafío 15</b><small>15 preguntas, tres vidas y puntuación final.</small></button></div><label class="solo-note" style="display:block;margin-top:17px">Dificultad</label><select id="soloDifficulty" class="solo-select"><option value="both">Media y difícil</option><option value="media">Media</option><option value="dificil">Difícil</option></select>'+actionButton('start','EMPEZAR →')+'<p class="solo-note">Rachas, escudos, desafíos de riesgo, comodines y preguntas inéditas. El progreso queda guardado en este móvil.</p></div>');
  const selector=root.querySelector('#soloDifficulty');if(selector)selector.value=chosenLevel;return;
 }
 let main=summary();
 if(state.stage==='wheel'){
  main+='<div class="solo-panel"><div class="solo-kicker">'+(state.mode==='classic'?'CONQUISTA LAS SEIS CORONAS':'DESAFÍO DE 15 PREGUNTAS')+'</div><h2>Gira la ruleta</h2><div class="solo-wheel-wrap"><div class="solo-pointer"></div><div id="soloDisc" class="solo-disc">'+wheelSvg()+'</div><div class="solo-wheel-center">🎯</div></div>'+actionButton('spin','GIRAR RULETA ↻')+'<p class="solo-note">Los aciertos mantienen tu racha. Cada cuarta respuesta correcta añade un escudo.</p></div>';
 }else if(state.stage==='offer'){
  main+='<div class="solo-panel"><div class="solo-kicker">⚡ DESAFÍO ESPECIAL</div><h2>¿Te arriesgas?</h2><p class="solo-note">La siguiente pregunta será de <b>'+names[state.cat]+'</b>. Si aceptas, conseguirás doble avance y puntos extra al acertar. Si fallas perderás una vida adicional.</p>'+actionButton('risk','ACEPTAR EL RETO ⚡')+actionButton('normal','PREGUNTA NORMAL','solo-cta solo-secondary')+'</div>';
 }else if(state.stage==='question'){
  const q=playerQuestion(); if(!q){state.stage='wheel';save();render();return}
  let seconds=Math.max(0,Math.ceil((state.deadline-Date.now())/1000));
  main+='<div class="solo-panel"><div class="solo-tag" style="color:'+colors[state.cat]+'">'+icons[state.cat]+' '+names[state.cat].toUpperCase()+' · '+(q[1]==='dificil'?'DIFÍCIL':'MEDIA')+(state.risk?' · ⚡ RETO':'')+'</div><div class="solo-kicker" id="soloCountdown">⏳ '+seconds+' SEGUNDOS</div><div class="solo-time"><div id="soloBar" style="width:'+Math.max(0,seconds/state.seconds*100)+'%"></div></div><div class="solo-question">'+htmlEscape(q[2])+'</div><div id="soloMedia"></div><form id="soloAnswerForm"><input class="solo-field" id="soloAnswer" autocomplete="off" maxlength="120" placeholder="Escribe tu respuesta" required>'+actionButton('submit','COMPROBAR ✓')+'</form><div class="solo-powers"><button class="solo-pill" data-solo="hint" '+(state.aids.hint===0?'disabled':'')+'>💡 Pista · '+state.aids.hint+'</button><button class="solo-pill" data-solo="swap" '+(state.aids.swap===0?'disabled':'')+'>🔄 Cambiar · '+state.aids.swap+'</button><button class="solo-pill" data-solo="shield" '+(state.aids.shield===0?'disabled':'')+'>🛡️ Escudo · '+state.aids.shield+'</button></div><p class="solo-note" id="soloHint"></p></div>';
 }else if(state.stage==='result'){
  main+='<div class="solo-panel"><div class="solo-kicker">'+(state.lastCorrect?'RESPUESTA CORRECTA':'RESPUESTA INCORRECTA')+'</div><h2>'+htmlEscape(state.lastQText)+'</h2><div class="'+(state.lastCorrect?'solo-ok':'solo-no')+'">'+(state.lastCorrect?'✓ ¡ACERTASTE!':'✕ FALLO')+'</div><p class="solo-note">Respuesta: <b style="color:#ffe094">'+htmlEscape(state.lastAnswer)+'</b></p><p class="solo-note">'+htmlEscape(state.lastMessage)+'</p>'+actionButton('next','CONTINUAR →')+'</div>';
 }else if(state.stage==='finished'){
  main+='<div class="solo-panel"><div class="solo-kicker">🏆 FIN DEL RETO</div><h2>'+htmlEscape(state.endReason||'Partida terminada')+'</h2><p class="solo-note">Has conseguido <b>'+state.points+' puntos</b> con '+state.correct+' aciertos en '+state.asked+' preguntas. Máxima racha: '+state.bestStreak+'. Coronas: '+state.stars+'/6.</p>'+actionButton('again','VOLVER A JUGAR ↻')+'</div>';
 }
 screen(main);if(state.stage==='question'){loadPhoto();startTimer()}
}
function candidates(cat,level){
 const eligible=state.mode==='classic'?i=>state.pips[i]<3:()=>true;
 const pool=BANK.map((q,i)=>(q[0]===byCat[cat]&&!state.used.includes(i)&&(!q[8]?.geo_visual)&&(!q[8]||!!q[8].src||!!q[8].wiki)&&(!level||level==='both'||q[1]===level))?i:-1).filter(i=>i>=0);
 return pool;
}
function startQuestion(){
 let pool=candidates(state.cat,state.risk?'dificil':state.diff);
 if(!pool.length){state.used=[];pool=candidates(state.cat,state.diff)}
 if(!pool.length){state.stage='wheel';save();render();return}
 const id=pool[Math.floor(Math.random()*pool.length)];
 state.qid=id;state.used.push(id);state.asked++;state.stage='question';state.seconds=state.mode==='sprint'?35:BANK[id][1]==='dificil'?60:45;state.deadline=Date.now()+state.seconds*1000;
 save();render();
}
function spin(){
 if(spinning||state.stage!=='wheel')return;spinning=true;
 let cats=byCat.map((_,i)=>i).filter(i=>state.mode!=='classic'||state.pips[i]<3);
 if(!cats.length){end('Has conquistado los seis quesitos');return}
 const cat=cats[Math.floor(Math.random()*cats.length)];
 const index=cat; const normalized=(index+0.5)*60;
 wheelRotation+=1440+(360-(wheelRotation%360)-normalized+360)%360;
 const disc=root.querySelector('#soloDisc');
 if(disc)disc.style.transform='rotate('+wheelRotation+'deg)';
 const btn=root.querySelector('[data-solo="spin"]');if(btn)btn.disabled=true;
 setTimeout(()=>{
  spinning=false;if(root.hidden||!state||state.stage!=='wheel')return;
  state.cat=cat;state.risk=false;
  state.stage=Math.random()<.18?'offer':'question';
  if(state.stage==='question')startQuestion();else{save();render()}
 },1570);
}
function grade(answer,expired=false){
 if(!state||state.stage!=='question')return;
 stopTimer();
 const q=playerQuestion();
 const correct=!expired && !!answer.trim() && !!window.TRIVIA_MATCH?.(answer,q);
 state.lastCorrect=correct;state.lastQText=q[2];state.lastAnswer=q[3];state.lastMessage='';
 if(correct){
  state.correct++;state.streak++;state.bestStreak=Math.max(state.streak,state.bestStreak);
  const bonus=state.risk?2:1;
  state.points+=(q[1]==='dificil'?150:100)*bonus+Math.min(100,state.streak*10);
  if(state.mode==='classic'){state.pips[state.cat]=Math.min(3,state.pips[state.cat]+bonus);state.stars=state.pips.filter(n=>n===3).length}
  if(state.streak%4===0){state.shields=Math.min(2,state.shields+1);state.lastMessage='🔥 Cuatro aciertos seguidos: has ganado un escudo.'}
  else state.lastMessage='+'+((q[1]==='dificil'?150:100)*bonus+Math.min(100,state.streak*10))+' puntos'+(state.risk?' y avance doble':'')+'.';
 }else{
  const livesLost=(state.shields>0?0:1)+(state.risk?1:0);
  if(state.shields>0){state.shields--;state.lastMessage='El escudo evita perder una vida.'}
  else state.lastMessage=expired?'Se ha agotado el tiempo.':'Pierdes una vida.';
  if(state.risk)state.lastMessage+=' El reto fallido cuesta una vida adicional.';
  state.lives=Math.max(0,state.lives-livesLost);state.streak=0;
 }
 state.stage='result';state.risk=false;save();render();
}
function end(message){stopTimer();state.endReason=message;state.stage='finished';save();render()}
function advance(){
 if(!state||state.stage!=='result')return;
 if(!state.lives){end('Te has quedado sin vidas');return}
 if(state.mode==='classic'&&state.pips.every(n=>n===3)){end('¡Has conseguido los seis quesitos!');return}
 if(state.mode==='sprint'&&state.asked>=state.goal){end('¡Has completado las 15 preguntas!');return}
 state.stage='wheel';save();render();
}
function startTimer(){
 if(!state||state.stage!=='question')return;
 tick=setInterval(()=>{
  if(root.hidden||!state||state.stage!=='question')return;
  const left=Math.max(0,state.deadline-Date.now()),secs=Math.ceil(left/1000);
  const label=root.querySelector('#soloCountdown'),bar=root.querySelector('#soloBar');
  if(label)label.textContent='⏳ '+secs+' SEGUNDOS';
  if(bar)bar.style.width=Math.min(100,Math.max(0,left/state.seconds/1000*100))+'%';
  if(left<=0)grade('',true);
 },250);
}
async function loadPhoto(){
 const q=playerQuestion(),meta=q?.[8],box=root.querySelector('#soloMedia');
 if(!box||!meta||(!meta.src&&!meta.wiki))return;
 const ticket=++mediaTicket;
 let source=meta.src;
 if(!source&&meta.wiki){
  try{const res=await fetch('https://'+(meta.lang||'es')+'.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(meta.wiki));
   if(!res.ok)throw Error('Imagen no disponible');const json=await res.json();source=json.originalimage?.source||json.thumbnail?.source}catch{return}
 }
 if(!source||ticket!==mediaTicket||!box.isConnected)return;
 const img=document.createElement('img');img.src=source;img.loading='eager';img.alt='Imagen para identificar';
 if(meta.fit==='cover'&&Number(meta.zoom)>1){const div=document.createElement('div');div.className='solo-crop';const zoom=Math.min(4,Math.max(1.1,Number(meta.zoom)));div.style.setProperty('--z',zoom);div.style.setProperty('--pos',meta.position||'center center');div.appendChild(img);box.appendChild(div)}
 else{img.className='solo-media';box.appendChild(img)}
}
function swapQuestion(){
 if(!state||state.stage!=='question'||state.aids.swap<1)return;
 state.aids.swap--;state.used.pop();startQuestion();
}
root.addEventListener('click',e=>{
 const btn=e.target.closest('[data-solo]');if(!btn||btn.disabled)return;
 const cmd=btn.dataset.solo;
 if(cmd==='close')return close();
 if(cmd==='classic'||cmd==='sprint'){chosenMode=cmd;render();return}
 if(cmd==='start'||cmd==='again'){
  chosenLevel=root.querySelector('#soloDifficulty')?.value||chosenLevel;
  state={v:1,mode:chosenMode,diff:chosenLevel,points:0,lives:chosenMode==='classic'?5:3,streak:0,bestStreak:0,shields:0,aids:{hint:3,swap:2,shield:1},correct:0,asked:0,goal:15,stars:0,pips:[0,0,0,0,0,0],used:[],stage:'wheel',risk:false,cat:0,qid:-1};
  save();render();return;
 }
 if(!state)return;
 if(cmd==='spin')return spin();
 if(cmd==='risk'){state.risk=true;startQuestion();return}
 if(cmd==='normal'){state.risk=false;startQuestion();return}
 if(cmd==='next')return advance();
 if(cmd==='submit'){e.preventDefault();let input=root.querySelector('#soloAnswer');if(input?.value.trim())grade(input.value);return}
 if(cmd==='hint'&&state.stage==='question'&&state.aids.hint>0){state.aids.hint--;const answer=String(playerQuestion()[3]);root.querySelector('#soloHint').textContent='Pista: empieza por «'+answer.slice(0,Math.min(2,answer.length))+'…»';save();const b=root.querySelector('[data-solo="hint"]');if(b)b.textContent='💡 Pista · '+state.aids.hint;return}
 if(cmd==='swap')return swapQuestion();
 if(cmd==='shield'&&state.stage==='question'&&state.aids.shield>0){state.aids.shield--;state.shields++;save();const b=root.querySelector('[data-solo="shield"]');if(b)b.textContent='🛡️ Escudo · '+state.aids.shield;const n=root.querySelector('#soloHint');if(n)n.textContent='Escudo activado para tu próximo fallo.';return}
});
root.addEventListener('submit',e=>{if(e.target.id==='soloAnswerForm'){e.preventDefault();const v=root.querySelector('#soloAnswer')?.value;if(v?.trim())grade(v)}});
document.getElementById('soloLaunch')?.addEventListener('click',open);
})();