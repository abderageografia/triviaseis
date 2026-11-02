(function SoloGame() {
'use strict';
const BANK = (window.GAME_BANK || []).concat(window.TRIVIA_BONUS_QUIZ || []);
const byCat = ['historia','arte','geo','cine','lit','mix'];
const names = ['Historia','Arte','Geografía','Cine','Literatura y política','Miscelánea'];
const icons = ['🏛️','🎨','🌍','🎬','📚','🎤'];
const colors = ['#ef7186','#f2bf62','#42c8be','#6a9efa','#b99aff','#67d087'];
const KEY = 'triviaSeisSoloV1';
const RECORDS_KEY='triviaSeisSoloRecords';
function soloRecords(){try{return JSON.parse(localStorage.getItem(RECORDS_KEY)||'{}')}catch{return {}}}
function saveSoloRecord(){const all=soloRecords(),mode=state.mode,prev=all[mode]||{points:0,streak:0,correct:0,plays:0,wins:0};prev.points=Math.max(prev.points,state.points);prev.streak=Math.max(prev.streak,state.bestStreak);prev.correct=Math.max(prev.correct,state.correct);prev.plays++;if(state.mode==='classic'&&state.stars===6)prev.wins++;all[mode]=prev;try{localStorage.setItem(RECORDS_KEY,JSON.stringify(all))}catch{}}
function soloMedal(key,label){state.medals??=[];if(!state.medals.includes(key)){state.medals.push(key);state.lastMessage+=' 🏅 '+label+'.';window.TRIVIA_FX?.show('crown','🏅','LOGRO DESBLOQUEADO',label)}}
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
.solo-quiz-type{background:#2c3559;border:1px solid #9c91c8;border-radius:12px;padding:9px 12px;color:#ffe0a7;font-size:12px;font-weight:900;letter-spacing:.5px;margin:9px 0}
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
.solo-wheel-center{z-index:6;left:33%;top:33%;width:34%;height:34%;border:4px solid #e4dfff;background:radial-gradient(circle at 30% 23%,#354b7e,#111d39 80%);box-shadow:0 0 0 3px #ffffff1a,0 3px 15px #000a;font-size:clamp(27px,9vw,37px)}
.solo-wheel-action{pointer-events:auto;display:flex;flex-direction:column;gap:1px;color:#fff;font-size:clamp(13px,3.7vw,18px);font-weight:900;line-height:1.05;text-align:center;text-shadow:0 1px 4px #000a;cursor:pointer;touch-action:manipulation;user-select:none;background:radial-gradient(circle at 30% 18%,#856cff,#4334af 68%,#271d61);border-color:#f5e1ff;box-shadow:0 0 0 4px #ffffff25,0 5px 20px #1d134fbf,0 0 20px #826aff80}
.solo-wheel-action span{font-size:clamp(21px,6vw,29px);line-height:1}
.solo-wheel-action:active:not(:disabled){transform:scale(.96)}
.solo-wheel-action:disabled{opacity:.76;cursor:default;font-size:clamp(11px,3vw,15px)}
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
let wheelFrame=0,wheelToken=0,landingTimer=0;
function soloVibrate(pattern){
 if(!hapticsOn||root.hidden||document.hidden||typeof navigator.vibrate!=='function')return false;
 try{return navigator.vibrate(pattern)!==false}catch{return false}
}
function stopWheelVibration(){
 try{if(typeof navigator.vibrate==='function')navigator.vibrate(0)}catch{}
}
function cancelWheelAnimation(){
 wheelToken++;if(wheelFrame)cancelAnimationFrame(wheelFrame);
 if(landingTimer)clearTimeout(landingTimer);
 landingTimer=0;wheelFrame=0;spinning=false;stopWheelVibration();
}

const save=()=>{if(state)try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}};
function load(){try{
 let old=JSON.parse(localStorage.getItem(KEY)||'null');
 if(old?.v===2&&Array.isArray(old.pips)&&Array.isArray(old.used)&&old.stage!=='finished'){
  // Compatibilidad con partidas que ya habían gastado pistas en la versión antigua.
  if(!Array.isArray(old.hintPositions)){
   old.hintPositions=[];
   if(old.stage==='question'&&old.hintUses>0){
    const answer=Array.from(String(BANK[old.qid]?.[3]??'').trim());
    const indices=answer.map((ch,i)=>/[\p{L}\p{N}]/u.test(ch)?i:-1).filter(i=>i>=0);
    old.hintPositions=indices.slice(0,Math.min(indices.length-1,old.hintUses+1));
   }
  }
  return old;
 }
 }catch{}return null}
function resetSave(){try{localStorage.removeItem(KEY)}catch{}}
function stopTimer(){if(tick){clearInterval(tick);tick=0}}
function close(){
 // Salir descarta la partida, no la suspende.
 if(state&&state.stage!=='finished'&&!confirm('¿Salir del modo individual y eliminar la partida actual? No podrás recuperarla.'))return;
 stopTimer();cancelWheelAnimation();mediaTicket++;
 resetSave();state=null;root.hidden=true;document.body.style.overflow='';
}
function open(){root.hidden=false;document.body.style.overflow='hidden';state=load();if(state&&state.stage==='question'&&Date.now()>Number(state.deadline))grade('',true);else render()}
const currentCat=()=>state?.cat??0;
const playerQuestion=()=>BANK[state?.qid]||null;
function screen(content){
 const supported=typeof navigator.vibrate==='function';
 const hapticButton='<button class="solo-vibrate" type="button" data-solo="haptics" aria-pressed="'+(hapticsOn?'true':'false')+'" title="'+(supported?'Activar o desactivar la vibración':'Este navegador no permite vibración')+'" '+(supported?'':'disabled')+'>'+(supported?(hapticsOn?'📳':'🔕'):'🔕')+' <span>Vibración</span></button>';
 root.innerHTML='<div class="solo-wrap"><div class="solo-top"><div class="solo-logo">🎯 TRIVIA·SEIS <span class="solo-small">EN SOLITARIO</span></div>'+hapticButton+'<button class="solo-back" data-solo="close" type="button">'+(state?'Salir y borrar':'Salir')+'</button></div>'+content+'</div>';
}
function actionButton(cmd,title,cl='solo-cta'){return '<button class="'+cl+'" data-solo="'+cmd+'">'+title+'</button>'}
// Cada pista descubre una posición aleatoria nueva; jamás revela la respuesta entera.
function soloHintParts(){
 const chars=Array.from(String(playerQuestion()?.[3]??'').trim());
 const isLetter=ch=>/[\p{L}\p{N}]/u.test(ch);
 const letterIndexes=chars.map((ch,i)=>isLetter(ch)?i:-1).filter(i=>i>=0);
 const max=Math.max(0,letterIndexes.length-1);
 const visible=new Set(Array.isArray(state?.hintPositions)?state.hintPositions:[]);
 const shown=letterIndexes.filter(i=>visible.has(i)).length;
 const mask=chars.map((ch,i)=>!isLetter(ch)||visible.has(i)?ch:'·').join('');
 return {max,shown,mask,letterIndexes,visible};
}
function canUseSoloHint(){
 if(!state||state.stage!=='question'||state.aids.hint<1)return false;
 if(state.options?.length===4)return (state.hiddenChoices?.length||0)<2;
 const {max,shown}=soloHintParts();
 return max>shown;
}
function soloHintText(){
 if(state.options?.length===4)return (state.hiddenChoices?.length||0)>=2?'Comodín 50:50: eliminadas dos opciones incorrectas.':'';
 return soloHintParts().shown?'Pista: «'+soloHintParts().mask+'» · Cada pista descubre una letra en posición aleatoria.':'';
}
function summary(){
 const compact=state.stage!=='wheel';
 const hearts=Array.from({length:state.mode==='classic'?5:3},(_,i)=>'<span class="'+(i<state.lives?'':'lost')+'">♥</span>').join('');
 const stats='<div class="solo-stats"><div class="solo-stat"><b>'+state.points+'</b><small>PUNTOS</small></div>'+
   '<div class="solo-stat"><b class="solo-hearts" aria-label="'+state.lives+' vidas restantes">'+hearts+'</b><small>VIDAS</small></div>'+
   '<div class="solo-stat"><b>🔥 '+state.streak+'</b><small>RACHA</small></div></div>';
 const pips='<div class="solo-pips" aria-label="Progreso por categorías">'+state.pips.map((n,i)=>
   '<div class="solo-pip '+(n===3?'complete':'')+'" style="--cc:'+colors[i]+'" title="'+names[i]+': '+n+' de 3">'+
   '<span class="solo-pip-icon">'+icons[i]+'</span><div class="solo-circles">'+[0,1,2].map(j=>'<i class="'+(j<n?'on':'')+'"></i>').join('')+'</div><b>'+n+'/3</b></div>'
 ).join('')+'</div>';
 const inventory='<div class="solo-inventory"><span>🛡️ '+state.shields+' escudos</span><span>⭐ '+state.stars+' coronas</span><span>✅ '+state.correct+' aciertos'+(state.mode==='sprint'?' / '+state.goal:'')+'</span></div>';
 const value=state.mode==='classic'?state.pips.reduce((a,n)=>a+n,0):state.mode==='survival'?state.correct:Math.min(state.goal,state.correct);
 const goal=state.mode==='classic'?18:state.mode==='survival'?Math.max(10,Math.ceil((state.correct+1)/10)*10):state.goal;
 const prog='<div class="solo-progress" role="group" aria-label="Progreso de la partida"><div class="solo-progress-label"><span>'+(state.mode==='classic'?'👑 CONQUISTA':'⚡ DESAFÍO')+'</span><strong>'+value+' / '+goal+'</strong></div><div class="solo-progress-track" role="progressbar" aria-valuenow="'+value+'" aria-valuemin="0" aria-valuemax="'+goal+'"><span style="width:'+(value/goal*100)+'%"></span></div><div class="solo-progress-foot">'+(state.mode==='classic'?state.stars+' de 6 coronas completadas':state.mode==='survival'?state.asked+' preguntas resistidas':Math.max(0,state.goal-state.correct)+' aciertos para completar el desafío')+'</div></div>';
 return '<div class="solo-hud'+(compact?' compact':'')+'">'+stats+prog+pips+inventory+(state.medals?.length?'<div class="solo-inventory">🏅 '+state.medals.length+' logros conseguidos</div>':'')+'</div>';
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
  const record=soloRecords()[chosenMode]||{};
  screen('<div class="solo-panel solo-game-panel"><div class="solo-kicker">UN JUGADOR · SIN FIREBASE</div><h2>Tu ruleta. Tu desafío.</h2><div class="solo-choices"><button class="solo-choice '+(chosenMode==='classic'?'active':'')+'" data-solo="classic"><b>👑 Conquista</b><small>Completa las seis coronas, una por categoría. Cinco vidas.</small></button><button class="solo-choice '+(chosenMode==='sprint'?'active':'')+'" data-solo="sprint"><b>⚡ Desafío 15</b><small>Consigue 15 aciertos antes de perder las tres vidas.</small></button><button class="solo-choice '+(chosenMode==='survival'?'active':'')+'" data-solo="survival"><b>💀 Supervivencia</b><small>Tres vidas. Juega hasta fallar. Compite por tu mejor récord.</small></button></div><label class="solo-note" style="display:block;margin-top:17px">Dificultad</label><select id="soloDifficulty" class="solo-select"><option value="both">Media y difícil</option><option value="media">Media</option><option value="dificil">Difícil</option></select>'+(record.plays?'<p class="solo-note" style="margin:12px 0 4px">🏆 Récord de este modo: <b>'+Number(record.points||0)+' puntos</b> · 🔥 Mejor racha: <b>'+Number(record.streak||0)+'</b> · Partidas: '+Number(record.plays||0)+'</p>':'')+actionButton('start','EMPEZAR →')+'<p class="solo-note">Rachas x2, preguntas bomba, récords locales, supervivencia, escudos y comodines. El progreso queda guardado en este móvil.</p><div class="solo-haptics-help" id="soloHapticsMessage">'+(typeof navigator.vibrate==='function'?(hapticsOn?'La vibración está activada.':'La vibración está desactivada.')+' <button type="button" data-solo="testHaptics" '+(hapticsOn?'':'disabled')+'>Probar vibración</button>':'Tu navegador no admite vibración. En Chrome para Android suele estar disponible.')+'</div></div>');
  const selector=root.querySelector('#soloDifficulty');if(selector)selector.value=chosenLevel;return;
 }
 let main=summary();
 if(state.stage==='wheel'){
  main+='<div class="solo-panel solo-game-panel solo-wheel-panel"><div class="solo-kicker">'+(state.mode==='classic'?'CONQUISTA LAS SEIS CORONAS':state.mode==='survival'?'SUPERVIVENCIA · SIN LÍMITE':'DESAFÍO DE 15 ACIERTOS')+'</div><h2>Gira la ruleta</h2><div class="solo-wheel-wrap"><div class="solo-pointer"></div><div id="soloDisc" class="solo-disc">'+wheelSvg()+'</div>'+wheelIconsHtml()+'<button class="solo-wheel-center solo-wheel-action" data-solo="spin" type="button" aria-label="Girar la ruleta"><span aria-hidden="true">↻</span><b>GIRAR</b></button></div><div id="soloSpinStatus" class="solo-spin-status" aria-live="polite">Pulsa GIRAR para descubrir tu próxima categoría</div>'+'<p class="solo-note">Los aciertos mantienen tu racha. Cada cuarta respuesta correcta añade un escudo.</p></div>';
 }else if(state.stage==='offer'){
  main+='<div class="solo-panel solo-game-panel"><div class="solo-kicker">⚡ DESAFÍO ESPECIAL</div><h2>¿Te arriesgas?</h2><p class="solo-note">La siguiente pregunta será de <b>'+names[state.cat]+'</b>. Si aceptas, conseguirás doble avance y puntos extra al acertar. Si fallas perderás una vida adicional.</p>'+actionButton('risk','ACEPTAR EL RETO ⚡')+actionButton('normal','PREGUNTA NORMAL','solo-cta solo-secondary')+'</div>';
 }else if(state.stage==='question'){
  const q=playerQuestion(); if(!q){state.stage='wheel';save();render();return}
  let seconds=Math.max(0,Math.ceil((state.deadline-Date.now())/1000));
  main+='<div class="solo-panel solo-game-panel solo-question-panel">'+(q[8]?.surprise?'<div class="solo-kicker" style="color:#ffe59c;font-size:16px;margin-bottom:10px">🎁 ¡PREGUNTA SORPRESA! · 500 PUNTOS · AVANCE DOBLE</div>':'')+'<div class="solo-tag" style="color:'+colors[state.cat]+'">'+icons[state.cat]+' '+names[state.cat].toUpperCase()+' · '+(q[1]==='dificil'?'DIFÍCIL':'MEDIA')+(state.risk?' · ⚡ RETO':'')+(state.bomb?' · 💣 PREGUNTA BOMBA':'')+(q[8]?.mythology?' · 🏺 MITOLOGÍA':'')+'</div><div class="solo-kicker" id="soloCountdown">⏳ '+seconds+' SEGUNDOS</div><div class="solo-time"><div id="soloBar" style="width:'+Math.max(0,seconds/state.seconds*100)+'%"></div></div><div class="solo-question">'+htmlEscape(q[2])+'</div>'+(state.options?.length===4?'<div class="solo-quiz-type">'+(q[8]?.special_choice?((q[8]?.variant==='intruso'||q[8]?.variant==='asociacion-falsa')?'🚫 ENCUENTRA EL INTRUSO':'🎯 PREGUNTA ESPECIAL · 4 OPCIONES'):'🎯 RONDA ESPECIAL · 4 OPCIONES')+'</div>':'')+'<div id="soloMedia"></div>'+(state.options?.length===4?'<div class="solo-options">'+state.options.map((answer,i)=>'<button class="solo-option" type="button" data-solo="option" data-idx="'+i+'" '+(state.hiddenChoices?.includes(i)?'disabled':'')+'>'+htmlEscape(answer)+'</button>').join('')+'</div>':'<form id="soloAnswerForm"><input class="solo-field" id="soloAnswer" autocomplete="off" maxlength="120" placeholder="Escribe tu respuesta" required>'+actionButton('submit','COMPROBAR ✓')+'</form>')+'<div class="solo-powers"><button class="solo-pill" data-solo="hint" '+(!canUseSoloHint()?'disabled':'')+'>'+(state.options?.length===4?'💡 50:50 · ':'💡 Pista · ')+state.aids.hint+'</button><button class="solo-pill" data-solo="swap" '+(state.aids.swap===0?'disabled':'')+'>🔄 Cambiar · '+state.aids.swap+'</button><button class="solo-pill" data-solo="shield" '+(state.aids.shield===0?'disabled':'')+'>🛡️ Escudo · '+state.aids.shield+'</button></div><p class="solo-note" id="soloHint">'+htmlEscape(soloHintText())+'</p></div>';
 }else if(state.stage==='result'){
  main+='<div class="solo-panel solo-game-panel solo-result-panel"><div class="solo-kicker">'+(state.lastCorrect?'RESPUESTA CORRECTA':'RESPUESTA INCORRECTA')+'</div><h2>'+htmlEscape(state.lastQText)+'</h2><div class="'+(state.lastCorrect?'solo-ok':'solo-no')+'">'+(state.lastCorrect?'✓ ¡ACERTASTE!':'✕ FALLO')+'</div><p class="solo-note">Respuesta: <b style="color:#ffe094">'+htmlEscape(state.lastAnswer)+'</b></p><p class="solo-note">'+htmlEscape(state.lastMessage)+'</p>'+actionButton('next','CONTINUAR →')+'</div>';
 }else if(state.stage==='finished'){
  main+='<div class="solo-panel solo-game-panel solo-result-panel"><div class="solo-kicker">🏆 FIN DEL RETO</div><h2>'+htmlEscape(state.endReason||'Partida terminada')+'</h2><p class="solo-note">Has conseguido <b>'+state.points+' puntos</b> con '+state.correct+' aciertos en '+state.asked+' preguntas. Máxima racha: '+state.bestStreak+'. Coronas: '+state.stars+'/6. Logros: '+(state.medals?.length||0)+'. Récord del modo: '+Number(soloRecords()[state.mode]?.points||0)+' puntos.</p>'+actionButton('again','VOLVER A JUGAR ↻')+'</div>';
 }
 screen(main);if(state.stage==='wheel')paintWheel(wheelRotation);if(state.stage==='question'){loadPhoto();startTimer()}
}
function candidates(cat,level){
 const eligible=state.mode==='classic'?i=>state.pips[i]<3:()=>true;
 const pool=BANK.map((q,i)=>(q[0]===byCat[cat]&&!q[8]?.surprise&&!state.used.includes(i)&&(!q[8]?.geo_visual)&&(!q[8]||!!q[8].src||!!q[8].wiki||!!q[8].mythology||!!q[8].special_choice)&&(!level||level==='both'||q[1]===level))?i:-1).filter(i=>i>=0);
 return pool;
}
function createSoloOptions(q){
  return window.TRIVIA_OPTIONS?.make(q,BANK,4,(candidate,question)=>!!window.TRIVIA_MATCH?.(candidate,question))||[];
}
function startQuestion(){
 let pool=candidates(state.cat,state.risk?'dificil':state.diff);
 if(!pool.length){state.used=[];pool=candidates(state.cat,state.diff)}
 if(!pool.length){state.stage='wheel';save();render();return}
 const specials=pool.filter(i=>BANK[i]?.[8]?.special_choice);
 const surpriseId=!state.risk?(window.TRIVIA_SURPRISE_PICK?.(state.used,!!state.surpriseSeen)??-1):-1;
 const regular=pool.filter(i=>!BANK[i]?.[8]?.special_choice);
 const take=a=>a[Math.floor(Math.random()*a.length)];
 const showSpecial=specials.length>0&&(!regular.length||Math.random()<.12);
 const id=surpriseId>=0?surpriseId:(showSpecial?take(specials):take(regular.length?regular:specials));
 if(surpriseId>=0)state.surpriseSeen=true;
 state.qid=id;state.used.push(id);state.asked++;state.stage='question';state.seconds=state.mode==='sprint'?35:BANK[id][1]==='dificil'?60:45;state.deadline=Date.now()+state.seconds*1000;
 // La respuesta escrita es la regla. Las elecciones son una excepción difícil.
 const question=BANK[id];
 state.options=question[8]?.surprise?[]:(question[8]?.special_choice||(question[1]==='dificil'&&Math.random()<.17)?createSoloOptions(question):[]);
 state.hiddenChoices=[];state.hintUses=0;state.hintPositions=[];
 save();render();
}
function spin(){
 if(spinning||!state||state.stage!=='wheel')return;
 const available=byCat.map((_,i)=>i).filter(i=>state.mode!=='classic'||state.pips[i]<3);
 if(!available.length){end('Has conquistado los seis quesitos');return}
 cancelWheelAnimation();
 spinning=true;
 const token=wheelToken;
 const selected=available[Math.floor(Math.random()*available.length)];
 const startAngle=wheelRotation;
 const current=((startAngle%360)+360)%360;
 const target=(360-(selected+0.5)*60+360)%360;
 const offset=(target-current+360)%360;
 const finishAngle=startAngle+(4+Math.floor(Math.random()*2))*360+offset;
 const duration=2800;
 const btn=root.querySelector('[data-solo="spin"]');
 const status=root.querySelector('#soloSpinStatus');
 if(btn){btn.disabled=true;btn.textContent='GIRANDO…'}
 if(status){status.classList.add('spinning');status.textContent='La ruleta está eligiendo una categoría…'}
 // Este primer pulso se solicita directamente desde el toque del jugador.
 soloVibrate([50,35,50]);
 let started=null,lastPulse=-Infinity,lastSection=Math.floor((startAngle+30)/60);
 function frame(now){
  if(token!==wheelToken||!state||root.hidden||state.stage!=='wheel')return;
  if(started===null)started=now;
  const t=Math.min(1,(now-started)/duration);
  const eased=1-Math.pow(1-t,3.4);
  wheelRotation=startAngle+(finishAngle-startAngle)*eased;
  paintWheel(wheelRotation);
  // Pulsos breves al pasar a otro sector, con mayor separación al frenar.
  const section=Math.floor((wheelRotation+30)/60);
  if(section!==lastSection&&now-lastPulse>=110&&t<0.97){
   soloVibrate(t>0.7?34:24);
   lastPulse=now;
  }
  lastSection=section;
  if(t<1){wheelFrame=requestAnimationFrame(frame);return}
  wheelFrame=0;wheelRotation=finishAngle;paintWheel(wheelRotation);
  stopWheelVibration();soloVibrate([65,45,90]);
  if(status){status.classList.remove('spinning');status.textContent=icons[selected]+' '+names[selected]+' · ¡categoría elegida!'}
  landingTimer=setTimeout(()=>{
   landingTimer=0;
   if(token!==wheelToken||root.hidden||!state||state.stage!=='wheel')return;
   spinning=false;state.cat=selected;state.risk=false;state.bomb=Math.random()<.12;
   state.stage=state.bomb?'question':Math.random()<.18?'offer':'question';
   if(state.stage==='question')startQuestion();
   else{save();render()}
  },380);
 }
 wheelFrame=requestAnimationFrame(frame);
}
function grade(answer,expired=false){
 if(!state||state.stage!=='question')return;
 stopTimer();
 const q=playerQuestion();
 const correct=!expired && !!answer.trim() && !!window.TRIVIA_MATCH?.(answer,q);
 const beforeFx={lives:state.lives,shields:state.shields,stars:state.stars,points:state.points,streak:state.streak};
 state.lastCorrect=correct;state.lastQText=q[2];state.lastAnswer=q[3];state.lastMessage='';
 if(correct){
  soloVibrate([30,40,65]);
  state.correct++;state.streak++;state.bestStreak=Math.max(state.streak,state.bestStreak);
  const bonus=(state.risk||q[8]?.surprise||state.bomb)?2:1;
  const fire=state.streak>=3?2:1;
  const gain=(q[8]?.surprise?500+Math.min(100,state.streak*10):(q[1]==='dificil'?150:100)*bonus+Math.min(100,state.streak*10))*fire+(state.bomb?200:0);
  state.points+=gain;
  if(state.mode==='classic'){state.pips[state.cat]=Math.min(3,state.pips[state.cat]+bonus);state.stars=state.pips.filter(n=>n===3).length}
  if(state.streak%4===0){state.shields=Math.min(2,state.shields+1);state.lastMessage='🔥 Cuatro aciertos seguidos: has ganado un escudo.'}
  else state.lastMessage='+'+gain+' puntos'+(state.risk||q[8]?.surprise||state.bomb?' y avance doble':'')+(fire===2?' · 🔥 RACHA x2':'')+'.';
  if(state.streak>=5)soloMedal('streak5','Cinco aciertos seguidos');
  if(state.correct>=20)soloMedal('correct20','Veinte respuestas acertadas');
  if(state.correct>=50)soloMedal('correct50','Cincuenta respuestas acertadas');
 }else{
  soloVibrate([85,45,100]);
  const penalty=1+Number(!!state.risk)+Number(!!state.bomb);
  const shielded=state.shields>0?1:0;
  const livesLost=Math.min(state.lives,Math.max(0,penalty-shielded));
  if(shielded)state.shields--;
  state.lives=Math.max(0,state.lives-livesLost);state.streak=0;
  const cause=state.bomb?' (fallo + penalización de pregunta bomba)':state.risk?' (fallo + penalización del reto)':'';
  state.lastMessage=(expired?'Se ha agotado el tiempo. ':'')+(shielded?'🛡️ El escudo ha bloqueado una penalización. ':'')+
   (livesLost===0?'No has perdido ninguna vida.':'Has perdido '+livesLost+' vida'+(livesLost===1?'':'s')+cause+'.')+
   (state.lives===0?' No te quedan vidas.':' Te quedan '+state.lives+' vida'+(state.lives===1?'':'s')+'.');
 }
 state.stage='result';state.risk=false;state.bomb=false;save();render();
 if(window.TRIVIA_FX){
  if(state.lives<beforeFx.lives)window.TRIVIA_FX.show('life','💔','VIDA PERDIDA',state.lives+' vidas restantes');
  else if(state.stars>beforeFx.stars)window.TRIVIA_FX.show('crown','👑','¡CORONA CONSEGUIDA!',state.stars+' de 6 categorías conquistadas');
  else if(state.shields>beforeFx.shields)window.TRIVIA_FX.show('shield','🛡️','¡ESCUDO GANADO!','La racha de cuatro aciertos te protege');
  else if(state.shields<beforeFx.shields)window.TRIVIA_FX.show('shield','🛡️','¡ESCUDO ACTIVADO!','Has evitado perder una vida');
  else if(correct)window.TRIVIA_FX.show('right',q[8]?.surprise?'🎁':state.streak>1?'🔥':'✨',q[8]?.surprise?'¡SORPRESA ACERTADA!':state.streak>1?'¡RACHA DE '+state.streak+'!':'¡ACERTASTE!', '+'+(state.points-beforeFx.points)+' puntos');
  else window.TRIVIA_FX.show('wrong','✕',expired?'TIEMPO AGOTADO':'RESPUESTA INCORRECTA','Inténtalo en la siguiente');
 }
}
function end(message){stopTimer();state.endReason=message;state.stage='finished';saveSoloRecord();save();render();window.TRIVIA_FX?.show(state.lives&&state.mode==='classic'&&state.stars===6?'win':'end',state.lives&&state.mode==='classic'&&state.stars===6?'🏆':'🏁',state.lives&&state.mode==='classic'&&state.stars===6?'¡LOS SEIS QUESITOS!':'PARTIDA TERMINADA',message)}
function advance(){
 if(!state||state.stage!=='result')return;
 if(!state.lives){end('Te has quedado sin vidas');return}
 if(state.mode==='classic'&&state.pips.every(n=>n===3)){end('¡Has conseguido los seis quesitos!');return}
 if(state.mode==='sprint'&&state.correct>=state.goal){end('¡Has conseguido 15 aciertos!');return}
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
  const toggle=root.querySelector('[data-solo="haptics"]');
  if(toggle){toggle.setAttribute('aria-pressed',hapticsOn?'true':'false');toggle.innerHTML=(hapticsOn?'📳':'🔕')+' <span>Vibración</span>';}
  const info=root.querySelector('#soloHapticsMessage');
  if(info){
   info.innerHTML=(hapticsOn?'La vibración está activada.':'La vibración está desactivada.')+' <button type="button" data-solo="testHaptics" '+(hapticsOn?'':'disabled')+'>Probar vibración</button>';
  }
  return;
 }
 if(cmd==='testHaptics'){
  const ok=soloVibrate([80,60,130]);
  const info=root.querySelector('#soloHapticsMessage');
  if(info)info.textContent=ok?'Vibración solicitada. Si no la notas, revisa los ajustes de respuesta táctil del móvil.':'Este navegador o dispositivo ha rechazado la vibración.';
  return;
 }
 if(cmd==='classic'||cmd==='sprint'||cmd==='survival'){chosenMode=cmd;render();return}
 if(cmd==='start'||cmd==='again'){
  chosenLevel=root.querySelector('#soloDifficulty')?.value||chosenLevel;
  cancelWheelAnimation();wheelRotation=0;
  state={v:2,mode:chosenMode,diff:chosenLevel,points:0,lives:chosenMode==='classic'?5:3,streak:0,bestStreak:0,shields:0,aids:{hint:3,swap:2,shield:1},correct:0,asked:0,goal:15,stars:0,pips:[0,0,0,0,0,0],used:[],surpriseSeen:false,stage:'wheel',risk:false,bomb:false,medals:[],cat:0,qid:-1};
  save();render();return;
 }
 if(!state)return;
 if(cmd==='spin')return spin();
 if(cmd==='risk'){state.risk=true;startQuestion();return}
 if(cmd==='normal'){state.risk=false;startQuestion();return}
 if(cmd==='next')return advance();
 if(cmd==='option'&&state.stage==='question'&&state.options?.length===4){const i=Number(btn.dataset.idx);if(Number.isInteger(i)&&i>=0&&i<4&&!state.hiddenChoices?.includes(i))grade(state.options[i]);return}
 if(cmd==='mediaFail'&&state.stage==='question'){state.used.pop();state.asked=Math.max(0,state.asked-1);startQuestion();return}
 if(cmd==='submit'){e.preventDefault();let input=root.querySelector('#soloAnswer');if(input?.value.trim())grade(input.value);return}
 if(cmd==='hint'&&canUseSoloHint()){
  state.aids.hint--;
  if(state.options?.length===4){
   const wrong=state.options.map((v,i)=>({v,i})).filter(x=>!window.TRIVIA_MATCH(x.v,playerQuestion())&&!state.hiddenChoices.includes(x.i));
   for(const x of wrong.slice(0,2)){state.hiddenChoices.push(x.i);const btn=root.querySelector('[data-solo="option"][data-idx="'+x.i+'"]');if(btn)btn.disabled=true}
  }else{
   const {letterIndexes,visible}=soloHintParts();
   const available=letterIndexes.filter(i=>!visible.has(i));
   // Conservar siempre al menos una letra oculta.
   if(available.length>1){
    const next=available[Math.floor(Math.random()*available.length)];
    (state.hintPositions??=[]).push(next);
    state.hintUses=(state.hintUses||0)+1;
   }
  }
  save();
  const hint=root.querySelector('#soloHint');
  if(hint)hint.textContent=soloHintText();
  const b=root.querySelector('[data-solo="hint"]');
  if(b){b.textContent=(state.options?.length===4?'💡 50:50 · ':'💡 Pista · ')+state.aids.hint;b.disabled=!canUseSoloHint()}
  return;
 }
 if(cmd==='swap')return swapQuestion();
 if(cmd==='shield'&&state.stage==='question'&&state.aids.shield>0){state.aids.shield--;state.shields++;save();window.TRIVIA_FX?.show('shield','🛡️','ESCUDO EQUIPADO','Tu próximo fallo estará protegido');const b=root.querySelector('[data-solo="shield"]');if(b)b.textContent='🛡️ Escudo · '+state.aids.shield;const n=root.querySelector('#soloHint');if(n)n.textContent='Escudo activado para tu próximo fallo.';return}
});
root.addEventListener('submit',e=>{if(e.target.id==='soloAnswerForm'){e.preventDefault();const v=root.querySelector('#soloAnswer')?.value;if(v?.trim())grade(v)}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopWheelVibration()});
document.getElementById('soloLaunch')?.addEventListener('click',open);
})();

(function TriviaFeedback(){
'use strict';
const style=document.createElement('style');
style.textContent="\n/* Feedback visual compartido entre solitario, ruleta y VS */\n.solo-progress{padding:10px 12px 9px;margin:10px 0 12px;border:1px solid #52688e;background:#0e1c35;border-radius:15px}\n.solo-progress-label{display:flex;justify-content:space-between;gap:8px;font-size:11px;color:#c8dafa;font-weight:900;letter-spacing:.9px}\n.solo-progress-label strong{color:#ffe295;font-size:13px;letter-spacing:0}\n.solo-progress-track,.trivia-fx-track{height:10px;border-radius:20px;background:#0a1326;border:1px solid #52658d;overflow:hidden;position:relative}\n.solo-progress-track{margin:8px 0 4px}\n.solo-progress-track>span,.trivia-fx-track>span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#58c9d4,#a48bff,#ffd47f);box-shadow:0 0 12px #9cceff88;transition:width .7s cubic-bezier(.2,.8,.2,1)}\n.solo-progress-foot{font-size:10px;color:#a4b9db;text-align:right}\n.solo-pip.complete{animation:trivia-pip-glow 1s ease-out}\n.trivia-fx-progress{margin:7px 0 0;padding:0 4px 2px}\n.trivia-fx-caption{font-size:10px;font-weight:800;letter-spacing:.6px;color:#c9d5f0;display:flex;justify-content:space-between;margin-bottom:5px}\n.trivia-fx-track{height:8px}\n.trivia-fx-layer{position:fixed;inset:0;pointer-events:none;z-index:25000;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:16px;animation:trivia-overlay-enter .16s ease-out}\n.trivia-fx-shade{position:absolute;inset:0;background:radial-gradient(circle,#12183300 5%,#0b112350 90%);animation:trivia-overlay-fade 1.6s ease-out forwards}\n.trivia-fx-card{position:relative;isolation:isolate;min-width:min(78vw,285px);max-width:min(90vw,390px);text-align:center;border:2px solid var(--fx-color);border-radius:26px;background:linear-gradient(150deg,#263451f7,#0e1932f7);padding:20px 21px 21px;color:#fff;box-shadow:0 14px 60px #000c,0 0 45px var(--fx-glow);animation:trivia-reward-pop 1.62s ease-in-out both}\n.trivia-fx-symbol{font-size:clamp(57px,16vw,86px);line-height:1.1;display:block;margin:2px auto 8px;filter:drop-shadow(0 7px 12px var(--fx-glow));animation:trivia-symbol-bounce .8s ease-out}\n.trivia-fx-title{font-size:clamp(21px,6vw,31px);font-weight:1000;line-height:1.13;text-wrap:balance;letter-spacing:.3px}\n.trivia-fx-sub{font-size:14px;color:#dbe7ff;font-weight:650;margin-top:8px;line-height:1.25}\n.trivia-fx-layer.life .trivia-fx-card,.trivia-fx-layer.wrong .trivia-fx-card{animation:trivia-loss-pop 1.48s ease-in-out both}\n.trivia-fx-particle{position:absolute;left:50%;top:48%;width:8px;height:13px;border-radius:2px;background:var(--c);transform:translate(-50%,-50%);animation:trivia-confetti var(--t) cubic-bezier(.17,.65,.36,1) both;animation-delay:var(--delay)}\n.trivia-fx-layer.life .trivia-fx-symbol{animation:trivia-broken-heart .65s ease-out}\n.trivia-fx-layer.shield .trivia-fx-symbol{animation:trivia-shield-shine .8s ease-out}\n.trivia-fx-layer.crown .trivia-fx-symbol,.trivia-fx-layer.win .trivia-fx-symbol{animation:trivia-crown-rise .85s cubic-bezier(.1,.7,.2,1)}\n@keyframes trivia-overlay-enter{from{opacity:0}to{opacity:1}}\n@keyframes trivia-overlay-fade{0%{opacity:1}90%,100%{opacity:0}}\n@keyframes trivia-reward-pop{0%{opacity:0;transform:scale(.45) translateY(30px)}17%{opacity:1;transform:scale(1.10) translateY(-5px)}27%{transform:scale(1)}72%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.9) translateY(-20px)}}\n@keyframes trivia-loss-pop{0%{opacity:0;transform:scale(1.2)}15%{opacity:1;transform:scale(.95)}22%{transform:translateX(-11px)}30%{transform:translateX(10px)}38%{transform:translateX(-7px)}48%{transform:none}80%{opacity:1}100%{opacity:0;transform:scale(.95)}}\n@keyframes trivia-symbol-bounce{0%{transform:scale(.3) rotate(-20deg)}55%{transform:scale(1.2) rotate(9deg)}100%{transform:none}}\n@keyframes trivia-broken-heart{0%{transform:scale(1.3)}45%{transform:scale(.87) rotate(-17deg)}100%{transform:scale(1) rotate(0)}}\n@keyframes trivia-shield-shine{0%{transform:scale(.5) rotate(-17deg);filter:brightness(3)}60%{transform:scale(1.22) rotate(8deg)}100%{transform:scale(1)}}\n@keyframes trivia-crown-rise{0%{transform:translateY(50px) rotate(-15deg) scale(.5)}65%{transform:translateY(-12px) scale(1.2)}100%{transform:translateY(0) scale(1)}}\n@keyframes trivia-confetti{0%{opacity:1;transform:translate(-50%,-50%) rotate(0)}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) rotate(var(--rot))}}\n@keyframes trivia-pip-glow{0%{filter:brightness(1)}35%{filter:brightness(1.9)}100%{filter:brightness(1)}}\n@media(prefers-reduced-motion:reduce){.trivia-fx-card,.trivia-fx-symbol,.trivia-fx-particle,.trivia-fx-shade,.solo-pip.complete{animation:none!important}.trivia-fx-layer{animation:none}.solo-progress-track>span,.trivia-fx-track>span{transition:none!important}}\n";
style.textContent+=' #players .trivia-fx-progress{margin:4px 0 0;padding:0} #players .trivia-fx-caption{font-size:9px;margin-bottom:2px} #players .trivia-fx-track{height:5px}';
document.head.appendChild(style);
const colors={shield:['#6edcf1','#6edcf155'],crown:['#ffd676','#ffcf535c'],win:['#ffd676','#ffcf535c'],life:['#ff788d','#f756775b'],wrong:['#ff788d','#f756775b'],right:['#67ecc0','#67ecc05b'],round:['#a99aff','#aa99ff50'],end:['#a5b8dd','#9dabdd45']};
let cleanup=0,notificationToken=0;
function show(type,symbol,title,description){
 const tone=colors[type]||colors.round;
 if(cleanup)clearTimeout(cleanup);
 document.querySelectorAll('.trivia-fx-layer').forEach(e=>e.remove());
 const layer=document.createElement('div');
 layer.className='trivia-fx-layer '+type;
 layer.setAttribute('aria-hidden','true');
 layer.style.setProperty('--fx-color',tone[0]);layer.style.setProperty('--fx-glow',tone[1]);
 const shade=document.createElement('div');shade.className='trivia-fx-shade';layer.append(shade);
 const card=document.createElement('div');card.className='trivia-fx-card';
 for(const [cls,content] of [['trivia-fx-symbol',symbol],['trivia-fx-title',title],['trivia-fx-sub',description||'']]){
  const node=document.createElement('div');node.className=cls;node.textContent=content;card.append(node);
 }
 layer.append(card);
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&['crown','shield','win','right','round'].includes(type)){
  for(let i=0;i<30;i++){
   const particle=document.createElement('i');particle.className='trivia-fx-particle';
   const angle=Math.PI*2*i/30,spread=70+Math.random()*Math.min(200,innerWidth*.28);
   particle.style.setProperty('--c',['#ffd775','#78efc1','#aa9aff','#fff1ba'][i%4]);
   particle.style.setProperty('--dx',Math.cos(angle)*spread+'px');
   particle.style.setProperty('--dy',(Math.sin(angle)*spread+150)+'px');
   particle.style.setProperty('--rot',(Math.random()*960-480)+'deg');
   particle.style.setProperty('--t',(1.1+Math.random()*.65)+'s');
   particle.style.setProperty('--delay',(Math.random()*.16)+'s');
   layer.append(particle);
  }
 }
 document.body.appendChild(layer);
 const token=++notificationToken;
 cleanup=setTimeout(()=>{if(token===notificationToken)layer.remove();cleanup=0},1800);
}
window.TRIVIA_FX={show};
const progress=(value,max,label)=>{
 const n=Math.max(0,Math.min(max,Number(value)||0));
 return '<div class="trivia-fx-progress"><div class="trivia-fx-caption"><span>'+label+'</span><span>'+n+' / '+max+'</span></div><div class="trivia-fx-track" role="progressbar" aria-valuenow="'+n+'" aria-valuemin="0" aria-valuemax="'+max+'"><span style="width:'+(n/max*100)+'%"></span></div></div>';
};
let previousKey='',previousData=null,queued=false;
const getNumber=(text)=>Number(String(text||'').match(/\d+/)?.[0]||0);
function observeState(){
 queued=false;
 const online=document.getElementById('onlineRoot');
 const inOnline=online&&!online.hidden;
 const solo=document.getElementById('soloRoot');
 if(solo&&!solo.hidden){previousKey='';previousData=null;return}
 if(inOnline){
  const view=document.getElementById('onlineView');
  if(!view)return;
  const roomMarker=view.querySelector('.online-kicker')?.textContent||'';
  const key='online:'+roomMarker.match(/SALA\s+([A-Z0-9]{6})/)?.[1];
  const versus=!!view.querySelector('.vs-scoreboard');
  if(versus){
   const nodes=[...view.querySelectorAll('.vs-scoreboard .vs-player')];
   if(nodes.length!==2)return;
   const scores=nodes.map(n=>getNumber(n.querySelector('.vs-points')?.textContent));
   const roundText=view.querySelector('.vs-round-badge')?.textContent||'';
   const m=roundText.match(/RONDA\s+(\d+)\s*\/\s*(\d+)/i);
   if(m){
    const value=Number(m[1]),max=Number(m[2]);
    const bar=progress(Math.min(value,max),max,'RONDA ACTUAL');
    const holder=view.querySelector('.vs-round-badge');
    if(holder&&!holder.nextElementSibling?.classList.contains('trivia-fx-progress'))holder.insertAdjacentHTML('afterend',bar);
   }
   const here=key+':vs';
   if(previousKey===here&&previousData){
    const self=nodes.findIndex(n=>n.classList.contains('self'));
    const gain=self>=0?scores[self]-(previousData.scores?.[self]||0):0;
    if(gain>0)show('right','⚡','+'+gain+' PUNTOS','¡Buen resultado en el duelo!');
    const other=self===0?1:0;
    if(gain<=0&&scores[other]>(previousData.scores?.[other]||0))show('round','⚔️','PUNTÚA TU RIVAL','La siguiente ronda puede cambiar el marcador');
   }
   previousKey=here;previousData={scores};return;
  }
  const cards=[...view.querySelectorAll('.online-players .online-player')];
  if(cards.length!==2)return;
  const scores=cards.map(n=>getNumber(n.querySelector('.score')?.textContent));
  const shields=cards.map(n=>getNumber(n.querySelector('small')?.textContent?.split('🛡️')[1]));
  cards.forEach((card,i)=>{if(!card.querySelector('.trivia-fx-progress'))card.insertAdjacentHTML('beforeend',progress(scores[i],6,'QUESITOS CONSEGUIDOS'))});
  const here=key+':roulette';
  if(previousKey===here&&previousData){
   const earned=scores.findIndex((n,i)=>n>(previousData.scores?.[i]||0));
   const lost=scores.findIndex((n,i)=>n<(previousData.scores?.[i]||0));
   if(earned>=0)show('crown','🧀','¡QUESITO CONSEGUIDO!',cards[earned].querySelector('b')?.textContent||'');
   else if(lost>=0)show('life','💔','QUESITO PERDIDO',cards[lost].querySelector('b')?.textContent||'');
   else {
    const gained=shields.findIndex((n,i)=>n>(previousData.shields?.[i]||0));
    const spent=shields.findIndex((n,i)=>n<(previousData.shields?.[i]||0));
    if(gained>=0)show('shield','🛡️','ESCUDO CONSEGUIDO','Giro protegido disponible');
    else if(spent>=0)show('shield','🛡️','ESCUDO UTILIZADO','Giro protegido');
   }
  }
  previousKey=here;previousData={scores,shields};return;
 }
 const game=document.getElementById('game');
 if(!game||game.classList.contains('hide')){previousKey='';previousData=null;return}
 const cards=[...document.querySelectorAll('#players .mini-player')];
 if(!cards.length)return;
 const scores=cards.map(n=>getNumber(n.querySelector('.number')?.textContent));
 cards.forEach((card,i)=>{
  if(!card.querySelector('.trivia-fx-progress'))card.insertAdjacentHTML('beforeend',progress(scores[i],6,'QUESITOS'));
  card.querySelectorAll('.q-dot').forEach(dot=>{
   const done=Math.max(0,Math.min(3,Number((dot.title.split(': ').pop()||'0').split('/')[0])||0));
   dot.style.background='linear-gradient(90deg,var(--cheese-color) '+(done/3*100)+'%,#2d3a56 '+(done/3*100)+'%)';
  });
 });
 const here='local:'+cards.map(n=>n.querySelector('.player-name')?.textContent).join('|');
 if(previousKey===here&&previousData){
  const earned=scores.findIndex((n,i)=>n>(previousData.scores?.[i]||0));
  const lost=scores.findIndex((n,i)=>n<(previousData.scores?.[i]||0));
  if(earned>=0)show('crown','🧀','¡QUESITO CONSEGUIDO!',cards[earned].querySelector('.player-name')?.textContent||'');
  else if(lost>=0)show('life','💔','QUESITO PERDIDO',cards[lost].querySelector('.player-name')?.textContent||'');
 }
 previousKey=here;previousData={scores};
}
const observer=new MutationObserver(()=>{
 if(queued)return;
 queued=true;
 requestAnimationFrame(observeState);
});
observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']});
requestAnimationFrame(observeState);
})();
