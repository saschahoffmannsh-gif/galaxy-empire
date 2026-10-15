// v23: Belohnungs-Flow – Modal, Einsammeln-Animation, Klang, Haptik; Gutschrift erst nach der Landung
(function(){const E=window.ENGINE;
const SK='ge_sfx';let sfx={on:true};try{Object.assign(sfx,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
let ac=null;const ctx=()=>{if(!ac){try{ac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(ac&&ac.state==='suspended')ac.resume();return ac};
function tone(f,t0,d,v,type='sine'){const a=ctx();if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+0.008);g.gain.exponentialRampToValueAtTime(0.0001,t0+d);o.connect(g);g.connect(a.destination);o.start(t0);o.stop(t0+d+0.05)}
const SFX={
 clink(i=0){if(!sfx.on)return;const a=ctx();if(!a)return;const t=a.currentTime;const b=[1318,1568,1760,2093,2349][i%5];tone(b,t,0.35,0.07);tone(b*2.01,t,0.18,0.03);tone(b*3.98,t+0.004,0.09,0.015,'triangle')},
 open(){if(!sfx.on)return;const a=ctx();if(!a)return;const t=a.currentTime;[523,659,784,1047].forEach((f,i)=>{tone(f,t+i*0.07,0.9,0.05);tone(f*2,t+i*0.07,0.4,0.015)})},
 pop(i=0){if(!sfx.on)return;const a=ctx();if(!a)return;const t=a.currentTime;tone(660+i*90,t,0.12,0.05,'triangle')},
 fin(){if(!sfx.on)return;const a=ctx();if(!a)return;const t=a.currentTime;[1047,1319,1568,2093].forEach((f,i)=>tone(f,t+i*0.05,1.1,0.04))}};
window.SFX=SFX;
const vib=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
// Belohnung in Einzelposten zerlegen
function items(r){const L=[];const ic=k=>IC[k]||'';
 if(r.m)L.push({k:'m',ic:ic('m'),n:r.m,t:'Metall',to:0});if(r.k)L.push({k:'k',ic:ic('k'),n:r.k,t:'Kristall',to:1});if(r.g)L.push({k:'g',ic:ic('g'),n:r.g,t:'Gas',to:2});
 if(r.dm)L.push({k:'dm',ic:ic('dm'),n:r.dm,t:'Dunkle Materie',to:4});
 if(r.voucher)L.push({k:'voucher',ic:'<span class="rw-gem e">⚡</span>',n:r.voucher,t:'Gutschein 10 Min.',to:'inv'});
 if(r.gal)L.push({k:'gal',ic:'<span class="rw-gem">◆</span>',n:r.gal,t:'Galactonit-Splitter',to:'inv'});
 if(r.gen)L.push({k:'gen',ic:'<span class="rw-gem e">✦</span>',n:r.gen,t:'Galactonit-Energie',to:'inv'});
 if(r.cmd)L.push({k:'cmd',ic:'<span class="rw-gem c">★</span>',n:r.cmd[1],t:GE.COMMANDERS[r.cmd[0]].n+' (Tage)',to:'inv'});
 if(r.ships)for(const id in r.ships){const u=GE.SHIP[id]||GE.DEF[id];L.push({k:'s_'+id,ic:A.img(id),n:r.ships[id],t:u.n,to:'inv'})}
 return L}
const fmtc=n=>fmt(Math.round(n));
function countUp(el,to,ms){const t0=performance.now();const f=t=>{const k=Math.min(1,(t-t0)/ms);const e=1-Math.pow(1-k,3);el.textContent=(to>=1000?fmtc(to*e):Math.round(to*e).toLocaleString('de-DE'));if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)}
const M=document.createElement('div');M.id='rwd';document.body.appendChild(M);
let active=false;
function flow(r,title,booked){if(active)return Promise.resolve(false);active=true;const L=items(r);
 return new Promise(res=>{M.innerHTML=`<div class="rw-rays"></div><div class="rw-card glass"><div class="rw-k">Belohnung</div><div class="rw-t">${esc(title||'Mission erfüllt')}</div><div class="rw-list">${L.map((x,i)=>`<div class="rw-it" data-i="${i}"><div class="rw-ic">${x.ic}</div><div class="rw-n">0</div><div class="rw-l">${esc(x.t)}</div></div>`).join('')}</div><button class="btn rw-go" disabled>Einsammeln</button></div>`;
  M.classList.add('on');SFX.open();vib(15);
  const its=[...M.querySelectorAll('.rw-it')];its.forEach((el,i)=>setTimeout(()=>{el.classList.add('in');SFX.pop(i);countUp(el.querySelector('.rw-n'),L[i].n,650)},350+i*220));
  const go=M.querySelector('.rw-go');setTimeout(()=>{go.disabled=false;go.classList.add('ready')},350+L.length*220+300);
  go.onclick=async e=>{e.stopPropagation();if(go.disabled)return;go.disabled=true;await collect(L,its);if(!booked)E.giveReward(r);
   try{renderTop&&renderTop()}catch(e){}SFX.fin();vib([20,40,30]);M.classList.add('out');setTimeout(()=>{M.classList.remove('on','out');M.innerHTML='';active=false;res(true)},420)}})}
function target(to){if(to==='inv')return document.querySelector('#rail [data-p=inv]')||document.querySelector('#rail');const rc=document.querySelectorAll('#res .rc')[to];return rc&&(rc.querySelector('svg')||rc)}
function collect(L,its){M.classList.add('fly');document.body.classList.add('rw-flying');const lay=document.createElement('div');lay.className='rw-fx';document.body.appendChild(lay);
 const N=innerWidth<900?7:9;const st=performance.now();let done=0,total=0;const pend=[];
 L.forEach((x,i)=>{const src=its[i].querySelector('.rw-ic').getBoundingClientRect();const tg=target(x.to);if(!tg)return;const tr=tg.getBoundingClientRect();
  const tx=tr.left+tr.width/2,ty=tr.top+tr.height/2;const rc=tg.closest('.rc');const rv=rc&&rc.querySelector('.rv');
  const base=rv?parseFloat((rv.textContent||'0').replace(/\./g,'').replace(',','.'))||0:0;const cnt=x.to==='inv'?1:N;
  for(let j=0;j<cnt;j++){total++;pend.push(new Promise(ok=>setTimeout(()=>{
   const p=document.createElement('div');p.className='rw-p';p.innerHTML=x.ic;lay.appendChild(p);
   const sx=src.left+src.width/2+(Math.random()-.5)*30,sy=src.top+src.height/2+(Math.random()-.5)*20;
   const cx=(sx+tx)/2+(Math.random()-.5)*160,cy=Math.min(sy,ty)-60-Math.random()*90;const dur=650+Math.random()*250;const t0=performance.now();let lt=0;
   const step=t=>{const k=Math.min(1,(t-t0)/dur);const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;const u=1-e;
    const X=u*u*sx+2*u*e*cx+e*e*tx,Y=u*u*sy+2*u*e*cy+e*e*ty;const s=1.15-0.55*e;p.style.transform=`translate(${X-11}px,${Y-11}px) scale(${s}) rotate(${e*240}deg)`;
    if(t-lt>55&&k<.92){lt=t;const sp=document.createElement('i');sp.className='rw-sp';sp.style.transform=`translate(${X}px,${Y}px)`;lay.appendChild(sp);setTimeout(()=>sp.remove(),450)}
    if(k<1)requestAnimationFrame(step);else{p.remove();done++;SFX.clink(j+i);if(j%2===0)vib(6);
     if(rc){rc.classList.remove('rw-hit');void rc.offsetWidth;rc.classList.add('rw-hit');if(rv){const v=base+x.n*(j+1)/cnt;rv.textContent=fmtc(v)}}
     else{const inv=document.querySelector('#rail [data-p=inv]');if(inv){inv.classList.remove('rw-hit');void inv.offsetWidth;inv.classList.add('rw-hit')}}ok()}};
   requestAnimationFrame(step)},i*260+j*70)))}});
 return Promise.all(pend).then(()=>new Promise(r=>setTimeout(()=>{lay.remove();M.classList.remove('fly');document.body.classList.remove('rw-flying');r()},350)))}
window.RWD={flow,items,SFX,get on(){return sfx.on}};
// SFX-Einstellung
const _s=PANELS.settings;PANELS.settings=()=>{const r=_s();r[1]=`<div class="box" style="margin-bottom:8px"><div class="row"><b>🔔 Soundeffekte</b><span class="spacer"></span><button class="btn sm ${sfx.on?'green':'ghost'}" data-act="sfx-on">${sfx.on?'An':'Aus'}</button></div><div class="mut" style="font-size:11px">Klänge beim Einsammeln von Belohnungen.</div></div>`+r[1];return r};
document.addEventListener('click',e=>{if(!e.target.closest('[data-act="sfx-on"]'))return;sfx.on=!sfx.on;localStorage.setItem(SK,JSON.stringify(sfx));if(sfx.on)SFX.clink(2);renderPanel(true)});
})();
