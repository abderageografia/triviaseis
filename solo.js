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
.solo-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:16px 0}
.solo-option{background:#24375a;color:white;border:1px solid #748bb8;border-radius:16px;min-height:74px;padding:14px 9px;font:inherit;font-weight:750;line-height:1.25;cursor:pointer}
.solo-option:disabled{display:none}
.solo-write{background:none;border:0;color:#a9dbed;text-decoration:underline;padding:12px 8px;cursor:pointer}
.solo-powers{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:15px}
.solo-pill{background:#283a5c;border:1px solid #7388ae;color:#fff;border-radius:13px;padding:11px 4px;font-size:12px;cursor:pointer}
.solo-ok{border:1px solid #5eddb6;background:#173c3b;color:#8bffdb;border-radius:15px;padding:14px;text-align:center;font-size:20px;font-weight:850}
.solo-no{border:1px solid #ec8195;background:#3b233f;color:#ffabbc;border-radius:15px;padding:14px;text-align:center;font-size:20px;font-weight:850}
.solo-kicker{font-size:12px;font-weight:800;letter-spacing:1.7px;text-align:center;color:#a1e6ed}
@media(min-width:640px){#soloRoot{padding:25px}}

/* Tablero móvil actualizado */
#soloRoot{background:radial-gradient(ellipse 90% 45% at 50% -15%,#314673,transparent 87%),linear-gradient(#101a33,#080f21);padding:calc(12px + env(safe-area-inset-top)) 12px calc(26px + env(safe-area-inset-bottom))}
.solo-wrap{max-width:580px}
.solo-top{gap:7px;margin-bottom:9px}
.solo-logo{font-size:clamp(16px,4.6vw,21px);line-height:1.2}
.solo-small{font-size:10px}
.solo-back,.solo-vibrate{flex-shrink:0;min-height:42px;padding:8px 10px;border:1px solid #6785af;border-radius:12px;color:#f1f5ff;background:#213555;font-size:12px;font-weight:800}
.solo-vibrate[aria-pressed="true"]{border-color:#70e5d3;color:#a8fff2}
.solo-vibrate:disabled{opacity:.6}
.solo-panel{padding:clamp(13px,4vw,21px);border:1px solid #617ba9;border-radius:23px;box-shadow:0 14px 36px #02071488,inset 0 1px #ffffff1b}
.solo-panel h2{margin:8px auto 12px;font-size:clamp(22px,6vw,29px)}
.solo-hud{display:grid;gap:8px;margin:8px 0}
.solo-stats{gap:7px}
.solo-stat{min-height:78px;min-width:0;padding:9px 3px;border-radius:15px;background:linear-gradient(160deg,#1a2b49,#0c1b33)}
.solo-stat b{font-size:clamp(22px,7vw,30px);line-height:1.25;font-variant-numeric:tabular-nums}
.solo-stat small{letter-spacing:.5px;font-size:10px}
.solo-stat .solo-hearts{display:flex;align-items:center;justify-content:center;gap:1px;flex-wrap:wrap;font-size:clamp(20px,6vw,28px);min-height:38px;letter-spacing:-2px;color:#ff7689}
.solo-hearts .lost{color:#455270;filter:saturate(.4)}
.solo-pips{gap:5px;margin:0}
.solo-pip{border-radius:12px;padding:8px 1px 6px;background:linear-gradient(145deg,#172743,#101c33);border-color:#4a638a}
.solo-pip.complete{border-color:var(--cc);box-shadow:0 0 11px color-mix(in srgb,var(--cc) 30%,transparent)}
.solo-pip-icon{display:block;font-size:clamp(18px,5.6vw,24px);line-height:1.1}
.solo-pip b{font-size:10px;margin-top:4px}
.solo-circles{gap:3px;margin-top:6px}
.solo-circles i{width:7px;height:7px}
.solo-inventory{display:flex;justify-content:center;flex-wrap:wrap;gap:5px;font-size:11px;color:#d7e6ff}
.solo-inventory span{border:1px solid #526b96;border-radius:99px;background:#162640;padding:5px 9px;white-space:nowrap}
.solo-hud.compact .solo-stat{min-height:58px;padding:5px 3px}
.solo-hud.compact .solo-stat b{font-size:23px}
.solo-hud.compact .solo-stat .solo-hearts{font-size:20px;min-height:29px}
.solo-hud.compact .solo-pip{padding:5px 0}
.solo-hud.compact .solo-pip-icon{font-size:19px}
.solo-hud.compact .solo-circles{margin-top:3px}
.solo-game-panel{margin-top:8px;text-align:center}
.solo-wheel-panel{background:radial-gradient(circle at 50% 33%,#293e67,#192743 65%,#141e36)}
.solo-wheel-wrap{width:clamp(185px,min(78vw,37dvh),338px);height:auto;aspect-ratio:1;position:relative;margin:10px auto 16px;isolation:isolate;filter:drop-shadow(0 10px 21px #000a)}
.solo-wheel-wrap:before{content:'';position:absolute;inset:-3%;z-index:-1;background:conic-gradient(#ef718655,#f2bf6255,#42c8be55,#6a9efa55,#b99aff55,#67d08755,#ef718655);border-radius:50%;filter:blur(12px)}
.solo-disc{width:100%;height:100%;border:4px solid #d7e4ff;border-radius:50%;transition:none;will-change:transform;box-shadow:inset 0 0 18px #0007,0 0 0 3px #334671;overflow:hidden}
.solo-wheel-icons{position:absolute;inset:0;pointer-events:none}
.solo-wheel-icon{position:absolute;transform:translate(-50%,-50%);width:17%;height:17%;display:grid;place-items:center;border:2px solid var(--cc);border-radius:50%;background:radial-gradient(circle at 35% 20%,#2c3d63,#0b172b 80%);font-size:clamp(21px,7vw,34px);box-shadow:0 3px 10px #000b,0 0 12px color-mix(in srgb,var(--cc) 44%,transparent)}
.solo-pointer{z-index:5;top:-7px;left:50%;width:0;height:0;transform:translateX(-50%);border-left:15px solid transparent;border-right:15px solid transparent;border-top:29px solid #ffe7aa;border-bottom:0;filter:drop-shadow(0 3px 3px #000a) drop-shadow(0 0 7px #ffe18f)}
.solo-wheel-center{z-index:3;left:33%;top:33%;width:34%;height:34%;border:4px solid #e4dfff;background:radial-gradient(circle at 30% 23%,#354b7e,#111d39 80%);box-shadow:0 0 0 3px #ffffff1a,0 3px 15px #000a;font-size:clamp(27px,9vw,37px);pointer-events:none}
.solo-spin-status{font-size:12px;font-weight:850;color:#b9cce9;min-height:18px;margin:0 0 6px}
.solo-spin-status.spinning{color:#ffe3ab}
.solo-cta{min-height:54px;margin:10px auto;padding:13px 16px;font-size:16px;border:1px solid #b4a7ff;border-bottom:4px solid #342a8a;box-shadow:0 4px 0 #302776,0 11px 24px #4b39bd40}
.solo-cta:active:not(:disabled){transform:translateY(2px);box-shadow:0 2px 0 #302776}
.solo-cta:disabled{opacity:.68}
.solo-game-panel .solo-note{font-size:12px;margin:9px 0 0}
.solo-question-panel .solo-question{font-size:clamp(20px,5.6vw,29px);line-height:1.23;margin:17px auto;text-wrap:balance;overflow-wrap:anywhere}
.solo-question-panel .solo-option{min-height:66px;padding:11px 8px;font-size:14px}
.solo-question-panel .solo-options{margin:12px 0}
.solo-question-panel .solo-pill{min-height:43px}
.solo-question-panel .solo-time{height:9px;margin:9px 0}
.solo-question-panel .solo-field{padding:13px 14px;font-size:17px}
.solo-result-panel h2{font-size:clamp(19px,5vw,26px);overflow-wrap:anywhere}
.solo-choice.active{background:#24455a;border-color:#79eddd}
.solo-haptics-help{font-size:12px;text-align:center;color:#b9cce8;margin:12px auto;line-height:1.4}
.solo-haptics-help button{margin-left:5px;background:#263e62;border:1px solid #719ac7;border-radius:10px;color:#fff;padding:7px 10px;font-weight:800}
#soloRoot button:focus-visible,#soloRoot input:focus-visible,#soloRoot select:focus-visible{outline:3px solid #ffe39e;outline-offset:2px}
@media(max-width:370px){#soloRoot{padding-left:8px;padding-right:8px}.solo-panel{padding:12px}.solo-logo{font-size:15px}.solo-small{font-size:9px}.solo-back,.solo-vibrate{padding:7px 8px;font-size:11px}.solo-wheel-wrap{width:clamp(176px,min(75vw,35dvh),298px)}.solo-inventory{gap:3px}.solo-inventory span{padding:4px 6px}}
@media(max-height:640px){.solo-panel{margin:7px 0}.solo-wheel-wrap{width:clamp(160px,min(69vw,32dvh),280px);margin:5px auto 9px}.solo-game-panel h2{margin:4px 0}.solo-stat{min-height:69px}.solo-stat b{font-size:23px}.solo-inventory{font-size:10px}.solo-cta{min-height:46px;padding:10px}}
`;
document.head.appendChild(css);
let state = null, tick = 0, spinning = false, wheelRotation = 0, mediaTicket = 0, chosenMode = 'classic', chosenLevel = 'both';
const HAPTIC_KEY='triviaSeisSoloHaptics';
let hapticsOn=true;
try{hapticsOn=localStorage.getItem(HAPTIC_KEY)!=='off'}catch{}
let wheelFrame=0,wheelToken=0;
function soloVibrate(pattern){
 if(!hapticsOn||root.hidden||document.hidden||typeof navigator.vibrate!=='function')return false;
 try{return navigator.vibrate(pattern)!==false}catch{return false}
}
function stopWheelVibration(){
 try{if(typeof navigator.vibrate==='function')navigator.vibrate(0)}catch{}
}
function cancelWheelAnimation(){
 wheelToken++;if(wheelFrame)cancelAnimationFrame(wheelFrame);
 wheelFrame=0;spinning=false;stopWheelVibration();
}

const save=()=>{if(state)try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}};
function load(){try{let old=JSON.parse(localStorage.getItem(KEY)||'null');if(old?.v===1&&Array.isArray(old.pips)&&Array.isArray(old.used)&&old.stage!=='finished')return old}catch{}return null}
function resetSave(){try{localStorage.removeItem(KEY)}catch{}}
function stopTimer(){if(tick){clearInterval(tick);tick=0}}
function close(){stopTimer();cancelWheelAnimation();root.hidden=true;document.body.style.overflow='';save()}
function open(){root.hidden=false;document.body.style.overflow='hidden';state=load();if(state&&state.stage==='question'&&Date.now()>Number(state.deadline))grade('',true);else render()}
const currentCat=()=>state?.cat??0;
const playerQuestion=()=>BANK[state?.qid]||null;
function screen(content){
 const supported=typeof navigator.vibrate==='function';
 const hapticButton='<button class="solo-vibrate" type="button" data-solo="haptics" aria-pressed="'+(hapticsOn?'true':'false')+'" title="'+(supported?'Activar o desactivar la vibración':'Este navegador no permite vibración')+'" '+(supported?'':'disabled')+'>'+(supported?(hapticsOn?'📳':'🔕'):'🔕')+' <span>Vibración</span></button>';
 root.innerHTML='<div class="solo-wrap"><div class="solo-top"><div class="solo-logo">🎯 TRIVIA·SEIS <span class="solo-small">EN SOLITARIO</span></div>'+hapticButton+'<button class="solo-back" data-solo="close" type="button">Salir</button></div>'+content+'</div>';
}
function actionButton(cmd,title,cl='solo-cta'){return '<button class="'+cl+'" data-solo="'+cmd+'">'+title+'</button>'}
function summary(){
 const compact=state.stage!=='wheel';
 const hearts=Array.from({length:state.mode==='sprint'?3:5},(_,i)=>'<span class="'+(i<state.lives?'':'lost')+'">♥</span>').join('');
 const stats='<div class="solo-stats"><div class="solo-stat"><b>'+state.points+'</b><small>PUNTOS</small></div>'+
   '<div class="solo-stat"><b class="solo-hearts" aria-label="'+state.lives+' vidas restantes">'+hearts+'</b><small>VIDAS</small></div>'+
   '<div class="solo-stat"><b>🔥 '+state.streak+'</b><small>RACHA</small></div></div>';
 const pips='<div class="solo-pips" aria-label="Progreso por categorías">'+state.pips.map((n,i)=>
   '<div class="solo-pip '+(n===3?'complete':'')+'" style="--cc:'+colors[i]+'" title="'+names[i]+': '+n+' de 3">'+
   '<span class="solo-pip-icon">'+icons[i]+'</span><div class="solo-circles">'+[0,1,2].map(j=>'<i class="'+(j<n?'on':'')+'"></i>').join('')+'</div><b>'+n+'/3</b></div>'
 ).join('')+'</div>';
 const inventory='<div class="solo-inventory"><span>🛡️ '+state.shields+' escudos</span><span>⭐ '+state.stars+' coronas</span><span>✅ '+state.correct+' aciertos'+(state.mode==='sprint'?' / '+state.goal:'')+'</span></div>';
 return '<div class="solo-hud'+(compact?' compact':'')+'">'+stats+pips+inventory+'</div>';
}
function wheelSvg(){
 const step=2*Math.PI/6,cx=150,cy=150,r=145;
 return '<svg viewBox="0 0 300 300" class="solo-wheel-svg" style="width:100%;height:100%" role="img" aria-label="Ruleta de seis categorías">'+
 colors.map((col,i)=>{
  const a=i*step-Math.PI/2,b=(i+1)*step-Math.PI/2;
  const x1=cx+r*Math.cos(a),y1=cy+r*Math.sin(a),x2=cx+r*Math.cos(b),y2=cy+r*Math.sin(b);
  return '<path d="M 150 150 L '+x1+' '+y1+' A '+r+' '+r+' 0 0 1 '+x2+' '+y2+' Z" fill="'+col+'" stroke="#111a34" stroke-width="3" opacity="'+(state.pips[i]===3?'.28':'1')+'"/>';
 }).join('')+'<circle cx="150" cy="150" r="141" fill="none" stroke="#ffffff53" stroke-width="2"/><circle cx="150" cy="150" r="57" fill="#131e3a" stroke="#ffffff5a" stroke-width="3"/></svg>';
}
function wheelIconsHtml(){
 return '<div class="solo-wheel-icons" id="soloWheelIcons" aria-hidden="true">'+icons.map((v,i)=>
  '<span class="solo-wheel-icon" style="--cc:'+colors[i]+'" data-solo-icon="'+i+'">'+v+'</span>'
 ).join('')+'</div>';
}
function paintWheel(angle){
 const disc=root.querySelector('#soloDisc');
 if(disc)disc.style.transform='rotate('+angle+'deg)';
 const iconsWrap=root.querySelector('#soloWheelIcons');
 if(!iconsWrap)return;
 Array.from(iconsWrap.children).forEach((badge,i)=>{
  const a=(-60+i*60+angle)*Math.PI/180;
  badge.style.left=(50+30*Math.cos(a))+'%';
  badge.style.top=(50+30*Math.sin(a))+'%';
 });
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
  main+='<div class="solo-panel"><div class="solo-kicker">'+(state.mode==='classic'?'CONQUISTA LAS SEIS CORONAS':'DESAFÍO DE 15 PREGUNTAS')+'</div><h2>Gira la ruleta</h2><div class="solo-wheel-wrap"><div class="solo-pointer"></div><div id="soloDisc" class="solo-disc">'+wheelSvg()+'</div>'+wheelIconsHtml()+'<div class="solo-wheel-center">🎯</div></div>'+actionButton('spin','GIRAR RULETA ↻')+'<p class="solo-note">Los aciertos mantienen tu racha. Cada cuarta respuesta correcta añade un escudo.</p></div>';
 }else if(state.stage==='offer'){
  main+='<div class="solo-panel"><div class="solo-kicker">⚡ DESAFÍO ESPECIAL</div><h2>¿Te arriesgas?</h2><p class="solo-note">La siguiente pregunta será de <b>'+names[state.cat]+'</b>. Si aceptas, conseguirás doble avance y puntos extra al acertar. Si fallas perderás una vida adicional.</p>'+actionButton('risk','ACEPTAR EL RETO ⚡')+actionButton('normal','PREGUNTA NORMAL','solo-cta solo-secondary')+'</div>';
 }else if(state.stage==='question'){
  const q=playerQuestion(); if(!q){state.stage='wheel';save();render();return}
  let seconds=Math.max(0,Math.ceil((state.deadline-Date.now())/1000));
  main+='<div class="solo-panel"><div class="solo-tag" style="color:'+colors[state.cat]+'">'+icons[state.cat]+' '+names[state.cat].toUpperCase()+' · '+(q[1]==='dificil'?'DIFÍCIL':'MEDIA')+(state.risk?' · ⚡ RETO':'')+'</div><div class="solo-kicker" id="soloCountdown">⏳ '+seconds+' SEGUNDOS</div><div class="solo-time"><div id="soloBar" style="width:'+Math.max(0,seconds/state.seconds*100)+'%"></div></div><div class="solo-question">'+htmlEscape(q[2])+'</div><div id="soloMedia"></div>'+(state.options?.length===4?'<div class="solo-options">'+state.options.map((answer,i)=>'<button class="solo-option" type="button" data-solo="option" data-idx="'+i+'" '+(state.hiddenChoices?.includes(i)?'disabled':'')+'>'+htmlEscape(answer)+'</button>').join('')+'</div><button class="solo-write" data-solo="write">Prefiero escribir la respuesta</button>':'<form id="soloAnswerForm"><input class="solo-field" id="soloAnswer" autocomplete="off" maxlength="120" placeholder="Escribe tu respuesta" required>'+actionButton('submit','COMPROBAR ✓')+'</form>')+'<div class="solo-powers"><button class="solo-pill" data-solo="hint" '+(state.aids.hint===0?'disabled':'')+'>'+(state.options?.length===4?'💡 50:50 · ':'💡 Pista · ')+state.aids.hint+'</button><button class="solo-pill" data-solo="swap" '+(state.aids.swap===0?'disabled':'')+'>🔄 Cambiar · '+state.aids.swap+'</button><button class="solo-pill" data-solo="shield" '+(state.aids.shield===0?'disabled':'')+'>🛡️ Escudo · '+state.aids.shield+'</button></div><p class="solo-note" id="soloHint"></p></div>';
 }else if(state.stage==='result'){
  main+='<div class="solo-panel"><div class="solo-kicker">'+(state.lastCorrect?'RESPUESTA CORRECTA':'RESPUESTA INCORRECTA')+'</div><h2>'+htmlEscape(state.lastQText)+'</h2><div class="'+(state.lastCorrect?'solo-ok':'solo-no')+'">'+(state.lastCorrect?'✓ ¡ACERTASTE!':'✕ FALLO')+'</div><p class="solo-note">Respuesta: <b style="color:#ffe094">'+htmlEscape(state.lastAnswer)+'</b></p><p class="solo-note">'+htmlEscape(state.lastMessage)+'</p>'+actionButton('next','CONTINUAR →')+'</div>';
 }else if(state.stage==='finished'){
  main+='<div class="solo-panel"><div class="solo-kicker">🏆 FIN DEL RETO</div><h2>'+htmlEscape(state.endReason||'Partida terminada')+'</h2><p class="solo-note">Has conseguido <b>'+state.points+' puntos</b> con '+state.correct+' aciertos en '+state.asked+' preguntas. Máxima racha: '+state.bestStreak+'. Coronas: '+state.stars+'/6.</p>'+actionButton('again','VOLVER A JUGAR ↻')+'</div>';
 }
 screen(main);if(state.stage==='wheel')paintWheel(wheelRotation);if(state.stage==='question'){loadPhoto();startTimer()}
}
function candidates(cat,level){
 const eligible=state.mode==='classic'?i=>state.pips[i]<3:()=>true;
 const pool=BANK.map((q,i)=>(q[0]===byCat[cat]&&!state.used.includes(i)&&(!q[8]?.geo_visual)&&(!q[8]||!!q[8].src||!!q[8].wiki)&&(!level||level==='both'||q[1]===level))?i:-1).filter(i=>i>=0);
 return pool;
}
function createSoloOptions(q){
 const norm=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
 const answer=String(q[3]||''),sameKind=r=>r[0]===q[0]&&r[7]===q[7];
 const isYear=/^(?:c\.\s*)?\d{1,4}(?:\s*a\.\s*C\.)?$/.test(answer);
 const isCentury=/^siglo\s/i.test(answer);
 const bce=/a\.\s*C\./.test(answer);
 const fits=r=>{
  const x=String(r?.[3]||'');
  if(!x||norm(x)===norm(answer)||window.TRIVIA_MATCH?.(x,q))return false;
  if(isYear)return /^(?:c\.\s*)?\d{1,4}(?:\s*a\.\s*C\.)?$/.test(x)&&(/a\.\s*C\./.test(x)===bce);
  if(isCentury)return /^siglo\s/i.test(x)&&(/a\.\s*C\./.test(x)===bce);
  if(/^\d+$/.test(x)||/^siglo\s/i.test(x))return false;
  return Math.abs(x.length-answer.length)<Math.max(12,answer.length*.8);
 };
 let similar=BANK.filter(r=>r!==q&&sameKind(r)&&fits(r));
 const era=similar.filter(r=>r[6]===q[6]);if(era.length>=3)similar=era;
 let pool=[...new Set(similar.map(x=>x[3]))];
 if(pool.length<3)pool=[...new Set([...pool,...BANK.filter(r=>r[0]===q[0]&&fits(r)).map(r=>r[3])])];
 for(let i=pool.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
 if(pool.length<3)return [];
 let opts=[answer,...pool.slice(0,3)];
 for(let i=3;i>0;i--){let j=Math.floor(Math.random()*(i+1));[opts[i],opts[j]]=[opts[j],opts[i]]}
 return opts;
}
function startQuestion(){
 let pool=candidates(state.cat,state.risk?'dificil':state.diff);
 if(!pool.length){state.used=[];pool=candidates(state.cat,state.diff)}
 if(!pool.length){state.stage='wheel';save();render();return}
 const id=pool[Math.floor(Math.random()*pool.length)];
 state.qid=id;state.used.push(id);state.asked++;state.stage='question';state.seconds=state.mode==='sprint'?35:BANK[id][1]==='dificil'?60:45;state.deadline=Date.now()+state.seconds*1000;
 state.options=createSoloOptions(BANK[id]);state.hiddenChoices=[];
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
   if(!res.ok)throw Error('Imagen no disponible');const json=await res.json();source=json.originalimage?.source||json.thumbnail?.source}catch{if(box.isConnected)box.innerHTML='<p class="solo-note">No se ha cargado la imagen.</p><button class="solo-secondary" data-solo="mediaFail">Otra pregunta sin penalización</button>';return}
 }
 if(!source||ticket!==mediaTicket||!box.isConnected)return;
 const img=document.createElement('img');img.src=source;img.loading='eager';img.alt='Imagen para identificar';
 if(meta.fit==='cover'&&Number(meta.zoom)>1){const div=document.createElement('div');div.className='solo-crop';const zoom=Math.min(4,Math.max(1.1,Number(meta.zoom)));div.style.setProperty('--z',zoom);div.style.setProperty('--pos',meta.position||'center center');div.appendChild(img);box.appendChild(div)}
 else{img.className='solo-media';box.appendChild(img)}
}
function swapQuestion(){
 if(!state||state.stage!=='question'||state.aids.swap<1)return;
 state.aids.swap--;state.used.pop();state.asked=Math.max(0,state.asked-1);startQuestion();
}
root.addEventListener('click',e=>{
 const btn=e.target.closest('[data-solo]');if(!btn||btn.disabled)return;
 const cmd=btn.dataset.solo;
 if(cmd==='close')return close();
 if(cmd==='haptics'){
  hapticsOn=!hapticsOn;
  try{localStorage.setItem(HAPTIC_KEY,hapticsOn?'on':'off')}catch{}
  if(hapticsOn)soloVibrate([65,40,100]);else stopWheelVibration();
  render();return;
 }
 if(cmd==='testHaptics'){
  const ok=soloVibrate([80,60,130]);
  const info=root.querySelector('#soloHapticsMessage');
  if(info)info.textContent=ok?'Vibración solicitada. Si no la notas, revisa los ajustes de respuesta táctil del móvil.':'Este navegador o dispositivo ha rechazado la vibración.';
  return;
 }
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
 if(cmd==='option'&&state.stage==='question'&&state.options?.length===4){const i=Number(btn.dataset.idx);if(Number.isInteger(i)&&i>=0&&i<4&&!state.hiddenChoices?.includes(i))grade(state.options[i]);return}
 if(cmd==='write'&&state.stage==='question'){state.options=[];save();render();return}
 if(cmd==='mediaFail'&&state.stage==='question'){state.used.pop();state.asked=Math.max(0,state.asked-1);startQuestion();return}
 if(cmd==='submit'){e.preventDefault();let input=root.querySelector('#soloAnswer');if(input?.value.trim())grade(input.value);return}
 if(cmd==='hint'&&state.stage==='question'&&state.aids.hint>0){
  state.aids.hint--;const answer=String(playerQuestion()[3]);
  if(state.options?.length===4){
   const wrong=state.options.map((v,i)=>({v,i})).filter(x=>!window.TRIVIA_MATCH(x.v,playerQuestion())&&!state.hiddenChoices.includes(x.i));
   for(const x of wrong.slice(0,2)){state.hiddenChoices.push(x.i);const btn=root.querySelector('[data-solo="option"][data-idx="'+x.i+'"]');if(btn)btn.disabled=true}
   root.querySelector('#soloHint').textContent='Comodín 50:50: eliminadas dos opciones incorrectas.';
  }else root.querySelector('#soloHint').textContent='Pista: empieza por «'+answer.slice(0,Math.min(2,answer.length))+'…»';
  save();const b=root.querySelector('[data-solo="hint"]');if(b)b.textContent=(state.options?.length===4?'💡 50:50 · ':'💡 Pista · ')+state.aids.hint;return
 }
 if(cmd==='swap')return swapQuestion();
 if(cmd==='shield'&&state.stage==='question'&&state.aids.shield>0){state.aids.shield--;state.shields++;save();const b=root.querySelector('[data-solo="shield"]');if(b)b.textContent='🛡️ Escudo · '+state.aids.shield;const n=root.querySelector('#soloHint');if(n)n.textContent='Escudo activado para tu próximo fallo.';return}
});
root.addEventListener('submit',e=>{if(e.target.id==='soloAnswerForm'){e.preventDefault();const v=root.querySelector('#soloAnswer')?.value;if(v?.trim())grade(v)}});
document.getElementById('soloLaunch')?.addEventListener('click',open);
})();