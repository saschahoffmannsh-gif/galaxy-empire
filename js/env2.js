'use strict';
// v37: Umgebungsanimation fürs Plateau – Wasserfälle, Wolken/Nebel, Himmel, Kristall-Glanz, wiegende Pilzbäume, Staub.
// Masken/Regionen kommen aus ENVD (aus dem Bild erzeugt). Eine einzige rAF-Schleife (Sternschnuppen/Schiffe), pausiert wenn unsichtbar.
(function(){
const R=(a,b)=>a+Math.random()*(b-a),F='assets/plat/fx/';const LITE=document.documentElement.classList.contains('lite')||/iP(hone|ad|od)/.test(navigator.userAgent);
function init(host){const D=window.ENVD;if(!D||host.dataset.env)return;host.dataset.env=1;let h='';
 // Himmel
 h+=`<i class="ev neb" style="left:1300px;top:-260px"></i><i class="ev gcore" style="left:1729px;top:88px"></i>`;
 for(const [x,y] of (LITE?D.stars.slice(0,30):D.stars))h+=`<i class="ev star" style="left:${x}px;top:${y}px;animation-duration:${R(2.5,6).toFixed(1)}s;animation-delay:-${R(0,6).toFixed(1)}s"></i>`;
 // Wasserfälle
 for(const [x,y,w,hh,n] of D.falls){if(hh<(LITE?110:50))continue;const m=`url(${F}${n})`;
  h+=`<div class="ev wf" style="left:${x}px;top:${y}px;width:${w}px;height:${hh}px;-webkit-mask-image:${m};mask-image:${m}"><i style="animation-duration:${R(1.6,2.2).toFixed(2)}s"></i><i class="b" style="animation-duration:${R(2.6,3.4).toFixed(2)}s"></i></div>`;
  if(hh>110)h+=`<i class="ev spray" style="left:${x+w/2}px;top:${y+hh-10}px;width:${Math.max(80,w*1.3)}px;animation-delay:-${R(0,4).toFixed(1)}s"></i>`}
 // Pilzbäume
 for(const [x,y,w,hh,n] of D.mush)h+=`<img class="ev mush" src="${F}${n}" alt="" style="left:${x}px;top:${y}px;width:${w}px;height:${hh}px;animation-duration:${R(5.5,8).toFixed(1)}s;animation-delay:-${R(0,6).toFixed(1)}s">`;
 // Kristalle
 D.cryst.forEach(([tx,ty,a,cx,cy,s],i)=>{h+=`<i class="ev glint" style="left:${tx}px;top:${ty}px;animation-duration:${R(5,10).toFixed(1)}s;animation-delay:-${R(0,10).toFixed(1)}s"></i>`;
  if(i<10)h+=`<i class="ev cglow" style="left:${cx}px;top:${cy}px;width:${Math.max(70,s*2.2)}px;animation-delay:-${R(0,5).toFixed(1)}s"></i>`});
 // Wolken & Nebel
 for(let i=0;i<7;i++)h+=`<i class="ev cloud" style="left:${-500+i*560}px;top:${1820+(i%2)*170}px;animation-duration:${R(40,70).toFixed(0)}s;animation-delay:-${R(0,60).toFixed(0)}s"></i>`;h+=`<i class="ev side l"></i><i class="ev side r"></i>`;
 // Staub
 for(let i=0;i<(LITE?10:22);i++)h+=`<i class="ev mote" style="left:${R(500,2500)|0}px;top:${R(400,1750)|0}px;animation-duration:${R(14,26).toFixed(1)}s;animation-delay:-${R(0,26).toFixed(1)}s"></i>`;
 h+=`<div class="ev skyfx"></div>`;host.innerHTML=h;loop(host);if(window.B2&&B2.cull)setTimeout(()=>B2.cull(),50)}
let raf=0;
function loop(host){const sky=host.querySelector('.skyfx');let nextS=performance.now()+R(3000,7000),nextP=performance.now()+R(6000,12000);
 const tick=t=>{raf=requestAnimationFrame(tick);if(document.hidden||!host.offsetParent||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  if(t>nextS){nextS=t+R(7000,15000);const e=document.createElement('i');e.className='ev shoot';e.style.left=R(300,2600)+'px';e.style.top=R(10,200)+'px';e.style.setProperty('--a',R(14,30)+'deg');sky.appendChild(e);setTimeout(()=>e.remove(),1600)}
  if(t>nextP){nextP=t+R(22000,38000);const e=document.createElement('i');const ltr=Math.random()<.5;e.className='ev ship'+(ltr?'':' rtl');e.style.top=R(60,330)+'px';sky.appendChild(e);setTimeout(()=>e.remove(),26000)}};
 cancelAnimationFrame(raf);raf=requestAnimationFrame(tick)}
window.ENV2={init};
})();
