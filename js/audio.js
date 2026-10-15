'use strict';
// Ladebildschirm + Hintergrundmusik (v16). Einstellungen in localStorage 'ge_music' {on,vol}.
(function(){
const K='ge_music';let cfg={on:true,vol:.6};try{Object.assign(cfg,JSON.parse(localStorage.getItem(K)||'{}'))}catch(e){}
const au=new Audio('assets/audio/music.mp3');au.loop=true;au.preload='auto';au.volume=0;
const M={cfg,au,started:false};window.MUSIC=M;
let fadeT=null;function fadeTo(v,ms){clearInterval(fadeT);const v0=au.volume,t0=performance.now();fadeT=setInterval(()=>{const k=Math.min(1,(performance.now()-t0)/ms);au.volume=Math.max(0,Math.min(1,v0+(v-v0)*k));if(k>=1){clearInterval(fadeT);if(v===0&&!M.want())au.pause()}},40)}
M.want=()=>cfg.on&&!document.hidden;
M.play=function(){if(!cfg.on)return Promise.resolve(false);return au.play().then(()=>{M.started=true;fadeTo(cfg.vol,2500);return true}).catch(()=>false)};
M.save=()=>{try{localStorage.setItem(K,JSON.stringify(cfg))}catch(e){}};
M.set=function(on,vol){if(on!=null)cfg.on=on;if(vol!=null)cfg.vol=vol;M.save();if(cfg.on){if(au.paused&&M.started!==null)M.play();else fadeTo(cfg.vol,300)}else fadeTo(0,500)};
document.addEventListener('visibilitychange',()=>{if(!M.started)return;if(document.hidden){fadeTo(0,250)}else if(cfg.on){au.play().then(()=>fadeTo(cfg.vol,800)).catch(()=>{})}});
// Ladebildschirm
const L=document.getElementById('loader');const DUR=6500;
const TIPS=['Tipp: Tippe auf einen freien Bauplatz, um ein Gebäude zu errichten.','Tipp: Bis zu 25 Nebel-Erkundungen je 24 h – Recycler finden Rohstoffe, Sonden finden Schiffe.','Tipp: Spenden ins Allianzdepot treiben die Allianzforschung voran.','Tipp: Lager schützen deine Rohstoffe vor dem Überlaufen.','Tipp: In der Rangliste siehst du, wer die Galaxie beherrscht.'];
function run(){if(!L||L.dataset.run)return;L.dataset.run=1;L.classList.add('run');const bar=L.querySelector('.ld-fill'),pc=L.querySelector('.ld-pc'),tip=L.querySelector('.ld-tip');let ti=Math.random()*TIPS.length|0;tip.textContent=TIPS[ti];
 const t0=performance.now();let lastTip=t0;
 (function step(n){const k=Math.min(1,(n-t0)/DUR);const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;const v=(e*.85+k*.15)*100;bar.style.width=v+'%';pc.textContent=Math.floor(v)+' %';
  if(n-lastTip>2600){lastTip=n;ti=(ti+1)%TIPS.length;tip.classList.remove('in');setTimeout(()=>{tip.textContent=TIPS[ti];tip.classList.add('in')},250)}
  if(k<1)requestAnimationFrame(step);else{L.classList.add('done');setTimeout(()=>L.remove(),900)}})(t0)}
M.run=run;
if(L){const go=()=>{M.play();run()};L.addEventListener('click',go,{once:true});
 // Desktop: Autoplay versuchen – klappt es, startet der Ladebalken sofort
 if(!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)&&cfg.on)au.play().then(()=>{M.started=true;fadeTo(cfg.vol,2500);run()}).catch(()=>{});
 if(!cfg.on&&!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))run()}
// Einstellungen
const _s=PANELS.settings;PANELS.settings=()=>{const r=_s();r[1]=`<div class="box" style="margin-bottom:8px"><div class="row"><b>♪ Musik</b><span class="spacer"></span><button class="btn sm ${cfg.on?'green':'ghost'}" data-act="mus-on">${cfg.on?'An':'Aus'}</button></div>
 <div class="row" style="margin-top:6px"><span class="mut" style="font-size:11px">Lautstärke</span><input type="range" min="0" max="100" value="${Math.round(cfg.vol*100)}" data-act="mus-vol" data-k="musvol" style="flex:1"><span class="mut" id="musv" style="width:36px;text-align:right">${Math.round(cfg.vol*100)} %</span></div></div>`+r[1];return r};
document.addEventListener('click',e=>{const t=e.target.closest('[data-act="mus-on"]');if(!t)return;M.set(!cfg.on);if(cfg.on&&!M.started)M.play();renderPanel(true)});
document.addEventListener('input',e=>{if(e.target.dataset.act!=='mus-vol')return;const v=+e.target.value/100;cfg.vol=v;M.save();if(M.started)au.volume=v;const s=document.getElementById('musv');if(s)s.textContent=Math.round(v*100)+' %'});
})();
