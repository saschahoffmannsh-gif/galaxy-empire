'use strict';
// v37: Gebäude-Animationen (CSS, nur transform/opacity). Punkte kommen aus B5FX (automatisch aus den Sprites erkannt).
(function(){
const R=(a,b)=>a+Math.random()*(b-a);
const span=(cls,x,y,z,ex)=>`<i class="fx ${cls}" style="left:${(x*100).toFixed(2)}%;top:${(y*100).toFixed(2)}%;width:${(z*100).toFixed(2)}%;animation-delay:-${R(0,6).toFixed(2)}s;${ex||''}"></i>`;
const DISH=window.B5DISH||{};let B5A_hasCut;
function fill(el,k,tn,state){const base=tn.replace('_up','');const L=(window.B5FX&&B5FX[k]&&B5FX[k][state==='new'?'build':base])||[];let h='';
 const C=L.find(p=>p[0]==='C')||['C',.5,.55,.6],T=L.find(p=>p[0]==='T')||['T',.5,.05,0];
 const bl=L.filter(p=>p[0]==='b');
 for(const [t,x,y,z] of L){
  if(t==='b'){const big=z>.25;if(k==='stargate'&&p0(bl)===z)continue;h+=span('glow cy'+(big?' big':''),x,y,Math.min(z*1.6,.6),`animation-duration:${R(2.8,4.6).toFixed(2)}s`)}
  else if(t==='o')h+=span('glow or',x,y,Math.min(z*2.4,.25),`animation-duration:${R(1.4,2.2).toFixed(2)}s`);
  else if(t==='r')h+=span('glow rd',x,y,Math.min(z*2,.25),`animation-duration:${R(2.4,3.6).toFixed(2)}s`);
  else if(t==='g')h+=span('glow gr',x,y,Math.min(z*1.5,.2),`animation-duration:${R(2,3.5).toFixed(2)}s`);
  else if(t==='s')for(let i=0;i<3;i++)h+=span('smoke',x,y,Math.max(z,.07)*1.4,`animation-delay:-${(i*2.2+R(0,.6)).toFixed(2)}s;animation-duration:${R(6.2,7.2).toFixed(2)}s`)}
 // funktionsspezifisch
 if(k==='stargate'&&bl.length){const g=bl.reduce((a,b)=>b[3]>a[3]?b:a);h+=`<i class="fx swirl" style="left:${g[1]*100}%;top:${g[2]*100}%;width:${g[3]*72}%"><b></b></i>`+span('glow cy big',g[1],g[2],g[3]*1.1,'animation-duration:3.2s')}
 if(k==='nanite'&&bl.length){const g=bl.reduce((a,b)=>b[3]>a[3]?b:a);h+=span('brain',g[1],g[2],g[3]*1.5)}
 if(k==='power'){const o=L.find(p=>p[0]==='o');const c=o||C;h+=span('pulse',c[1],c[2],.14)+span('pulse',c[1],c[2],.14,'animation-delay:-1.3s')}
 if(k==='shipyard')for(const [x,y] of [[C[1]-.08,C[2]-.06],[C[1]+.07,C[2]-.02],[C[1],C[2]+.05]])h+=span('weld',x,y,.05,`animation-duration:${R(2.2,3.4).toFixed(2)}s`);
 if(k==='defense'&&state!=='new')h+=`<i class="fx beam" style="left:${T[1]*100}%;top:${(T[2]+.08)*100}%;width:70%"></i>`;
 if(k==='lab'&&state!=='new')h+=span('glint',T[1],T[2]+.03,.12,'animation-duration:5.5s');
 if((k==='metal_mine'||k==='crystal_mine'||k==='gas_mine')&&state!=='new')h+=span('dust',C[1]-.05,C[2]+.12,.16)+span('dust',C[1]+.06,C[2]+.14,.13,'animation-delay:-2.5s');
 if(k==='terraformer')for(let i=0;i<3;i++)h+=span('mist',C[1]+R(-.2,.2),C[2]+R(.0,.2),.22,`animation-duration:${R(7,10).toFixed(1)}s`);
 if(k==='radar'&&state!=='new'&&DISH[base]){const d=DISH[base];h+=`<img class="fx dish" src="assets/b5/radar_${base}_dish.webp" style="left:${d[0]*100}%;top:${d[1]*100}%;width:${d[2]*100}%;height:${d[3]*100}%">`+span('blink',T[1],T[2],.03)}
 if(k!=='radar'&&state!=='new')h+=span('blink',T[1],T[2]+.01,.025,`animation-duration:${R(2.2,3.2).toFixed(2)}s`);
 // Baustelle: Funken, Staub, Arbeitslicht
 if(state==='new'||state==='up'){for(let i=0;i<3;i++)h+=span('weld',C[1]+R(-.22,.22),C[2]-R(0,.25),.05,`animation-duration:${R(1.8,3.2).toFixed(2)}s`);
  for(let i=0;i<2;i++)h+=span('dust',C[1]+R(-.25,.25),C[2]+R(.12,.22),.18,`animation-duration:${R(4,6).toFixed(1)}s`);
  h+=span('wl',C[1]+C[3]*.38,C[2]-.05,.12)+span('wl',C[1]-C[3]*.42,C[2]+.02,.1,'animation-delay:-1s')}
 h+=parts(k,state==='new'?'build':tn,state);
 el.innerHTML=h}
// v38: bewegliche Teile (aus den Sprites geschnitten) und Laufband/Bohrer-Overlays
const pc=v=>(v*100).toFixed(3)+'%';
function parts(k,tn,state){const L=window.B5P&&B5P[k]&&B5P[k][tn];if(!L)return'';let h='';
 for(const e of L){const box=`left:${pc(e.x)};top:${pc(e.y)};width:${pc(e.w)};height:${pc(e.h)};`;const org=`transform-origin:${pc(e.px)} ${pc(e.py)};`;
  if(e.a==='drill'||e.a==='belt'){const m=`url(assets/b5/${e.f})`;
   h+=`<div class="pt ov ${e.a}" style="${box}-webkit-mask-image:${m};mask-image:${m}"><div class="rot" style="transform:translate(-50%,-50%) rotate(${e.ang||0}deg)"><i style="animation-delay:-${R(0,2).toFixed(2)}s"></i></div></div>`;continue}
  const d=e.a==='turret'?(e.d||0)*2.7:R(0,12);
  h+=`<div class="pt ${e.a}" style="${box}${org}animation-delay:-${d.toFixed(2)}s"><img src="assets/b5/${e.f}" alt="" draggable="false">${e.a==='turret'?`<i class="mz" style="animation-delay:-${d.toFixed(2)}s"></i>`:''}</div>`}
 return h}
B5A_hasCut=(k,tn)=>{const L=window.B5P&&B5P[k]&&B5P[k][tn];return !!(L&&!tn.endsWith('_up')&&L.some(e=>e.f.endsWith('.webp')))};
function p0(bl){return bl.reduce((a,b)=>b[3]>a[3]?b:a,[0,0,0,0])[3]}
window.B5A={fill,hasCut:(k,tn)=>B5A_hasCut(k,tn)};
// Pausieren wenn unsichtbar
document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('fxpause',document.hidden));
})();
