'use strict';
// Visuelle Kampfwiedergabe aus dem Kampflog (Runden, Schüsse, Verluste)
(function(){
const R={};let B,cv,x,W,H,sprites,shots,booms,t0,round,speed=1,paused=false,raf,imgs={},done=false,counts;
const nm=k=>(GE.SHIP[k]||GE.DEF[k]).n;const f=n=>Math.floor(n).toLocaleString('de-DE');
function img(id){if(imgs[id])return imgs[id];const i=new Image();i.onerror=()=>{i.onerror=null;i.src=ART.make(id)};i.src='assets/img/'+id+'.png';return imgs[id]=i}
function layout(side,units){const ks=Object.keys(units).filter(k=>units[k]>0);const out=[];const cols=Math.max(1,ks.length);
 ks.forEach((k,ci)=>{const n=Math.min(10,Math.max(1,Math.ceil(Math.log2(units[k]+1)*1.6)));const isDef=!!GE.DEF[k];
  for(let i=0;i<n;i++){const colX=side?W*0.58+ci*(W*0.36/cols):W*0.06+ci*(W*0.36/cols);const sz=Math.min(64,Math.max(30,H/9));
   out.push({k,side,x:colX+(i%2)*sz*0.55+Math.random()*8,y:H*0.2+ (i/n)*H*0.62+Math.random()*10,sz,alive:true,fade:1,isDef,bob:Math.random()*6})}});return out}
R.play=function(battle){B=battle;const el=document.getElementById('replay');el.classList.remove('hidden');cv=document.getElementById('rcv');const d=devicePixelRatio||1;W=innerWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;x=cv.getContext('2d');x.setTransform(d,0,0,d,0,0);
 sprites=[...layout(0,B.startA),...layout(1,B.startD)];shots=[];booms=[];round=0;speed=1;paused=false;done=false;counts={a:{...B.startA},d:{...B.startD}};
 for(const s of sprites)img(s.k);t0=performance.now();hud();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame)};
function hud(res){const h=document.getElementById('rhud');const side=(o,st)=>Object.keys(st).map(k=>`<div style="display:flex;justify-content:space-between;gap:10px"><span>${nm(k)}</span><b style="color:${(o[k]||0)<st[k]?'#ff5d73':'#fff'}">${f(o[k]||0)}</b></div>`).join('')||'<span style="color:#8a97b4">Keine Einheiten</span>';
 const me=B.attackerIsMe;const w=B.winner==='draw'?'Unentschieden':((B.winner==='a')===me?'Sieg!':'Niederlage');
 h.innerHTML=`<div class="rtop glass">${done?'Kampf beendet':`Runde ${Math.min(round+1,B.rounds.length)} / ${B.rounds.length}`}</div>
 <div class="rsideA glass"><b style="color:#38e1ff">${PNx(B.nameA)}</b>${side(counts.a,B.startA)}</div><div class="rsideD glass"><b style="color:#ff9f43">${PNx(B.nameD)}</b>${side(counts.d,B.startD)}</div>
 ${res?`<div class="rres glass" style="color:${w==='Sieg!'?'#5cf2a0':w==='Niederlage'?'#ff5d73':'#ffc857'}">${w}<div style="font-size:12px;color:#b9c6e0;font-weight:500;margin-top:4px">Verluste: ${f(B.valA/1000)}k / ${f(B.valD/1000)}k Rohstoffe · Trümmer ${f(B.debris.m+B.debris.k)}</div></div>`:''}
 <div class="rbtns glass"><button class="btn sm ghost" id="rp">${paused?'Weiter':'Pause'}</button><button class="btn sm ghost" id="rs">${speed}×</button><button class="btn sm ghost" id="rr">Neu starten</button><button class="btn sm" id="rx">Schließen</button></div>`;
 h.querySelector('#rp').onclick=()=>{paused=!paused;if(!paused)t0=performance.now()-elapsed;hud(done)};h.querySelector('#rs').onclick=()=>{speed=speed===1?2:speed===2?4:1;hud(done)};
 h.querySelector('#rr').onclick=()=>R.play(B);h.querySelector('#rx').onclick=()=>{cancelAnimationFrame(raf);document.getElementById('replay').classList.add('hidden')}}
let elapsed=0,lastT=0;const RT=2600;
function fire(fromSide,n){const src=sprites.filter(s=>s.side===fromSide&&s.alive&&!(GE.SHIP[s.k]||GE.DEF[s.k]).at<=1),dst=sprites.filter(s=>s.side!==fromSide&&s.alive);if(!src.length||!dst.length)return;
 for(let i=0;i<n;i++){const a=src[Math.random()*src.length|0],b=dst[Math.random()*dst.length|0];shots.push({x0:a.x+a.sz/2,y0:a.y+a.sz/2,x1:b.x+b.sz/2+(Math.random()-.5)*b.sz*.6,y1:b.y+b.sz/2+(Math.random()-.5)*b.sz*.6,t:-Math.random()*RT*0.55,side:fromSide,big:(GE.SHIP[a.k]||GE.DEF[a.k]).at>=1000})}}
function applyRound(r){const rr=B.rounds[r];counts={a:rr.a,d:rr.d};
 for(const [side,c] of [[0,rr.a],[1,rr.d]]){const st=side?B.startD:B.startA;for(const k in st){const list=sprites.filter(s=>s.side===side&&s.k===k&&s.alive);const frac=(c[k]||0)/st[k];const keep=frac<=0?0:Math.max(1,Math.round(sprites.filter(s=>s.side===side&&s.k===k).length*frac));
  for(let i=keep;i<list.length;i++){list[i].alive=false;booms.push({x:list[i].x+list[i].sz/2,y:list[i].y+list[i].sz/2,t:0,r:list[i].sz})}}}}
function frame(now){raf=requestAnimationFrame(frame);const dt=Math.min(50,now-lastT)*speed;lastT=now;if(!paused&&!done)elapsed+=dt;
 const rIdx=Math.floor(elapsed/RT);
 if(!done&&rIdx>round){applyRound(round);round++;hud();if(round>=B.rounds.length){done=true;hud(true)}else{}}
 if(!done&&!paused&&shots.filter(s=>s.t<0).length===0&&elapsed%RT<RT*0.6&&round<B.rounds.length&&!frame._fired?.[round]){frame._fired=frame._fired||{};frame._fired[round]=1;const rr=B.rounds[round];fire(0,Math.min(70,Math.max(3,Math.round(Math.log2(rr.sa.shots+1)*6))));fire(1,Math.min(70,Math.max(rr.sd.shots?3:0,Math.round(Math.log2(rr.sd.shots+1)*6))))}
 // Hintergrund
 x.fillStyle='#02030a';x.fillRect(0,0,W,H);const g=x.createRadialGradient(W/2,H/2,0,W/2,H/2,W*.7);g.addColorStop(0,'#0d1430');g.addColorStop(1,'#02030a');x.fillStyle=g;x.fillRect(0,0,W,H);
 x.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<120;i++){const sx=(i*137.5)%W,sy=(i*71.3+i*i*.7)%H;x.fillRect(sx,sy,1,1)}
 // Einheiten
 const tt=now/1000;for(const s of sprites){if(!s.alive)s.fade=Math.max(0,s.fade-dt/500);if(s.fade<=0)continue;const im=imgs[s.k];x.save();x.globalAlpha=s.fade;const yy=s.y+Math.sin(tt+s.bob)*3;
  if(s.side===1&&!s.isDef){x.translate(s.x+s.sz,yy);x.scale(-1,1);if(im&&im.complete)x.drawImage(im,0,0,s.sz,s.sz)}else if(im&&im.complete)x.drawImage(im,s.x,yy,s.sz,s.sz);x.restore()}
 // Schüsse
 if(!paused)for(const s of shots)s.t+=dt;shots=shots.filter(s=>s.t<420);
 for(const s of shots){if(s.t<0)continue;const p=Math.min(1,s.t/260);const col=s.side?'255,159,67':'56,225,255';
  x.strokeStyle=`rgba(${col},${1-Math.max(0,(s.t-260)/160)})`;x.lineWidth=s.big?3:1.6;x.shadowColor=`rgb(${col})`;x.shadowBlur=10;x.beginPath();const hx=s.x0+(s.x1-s.x0)*p,hy=s.y0+(s.y1-s.y0)*p;const tx=s.x0+(s.x1-s.x0)*Math.max(0,p-0.25),ty=s.y0+(s.y1-s.y0)*Math.max(0,p-0.25);x.moveTo(tx,ty);x.lineTo(hx,hy);x.stroke();x.shadowBlur=0;
  if(p>=1&&s.t<330){x.fillStyle=`rgba(${col},.7)`;x.beginPath();x.arc(s.x1,s.y1,4+Math.random()*4,0,7);x.fill()}}
 for(const b of booms){if(!paused)b.t+=dt;const p=b.t/700;if(p>1)continue;const gg=x.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r*(0.4+p));gg.addColorStop(0,`rgba(255,240,200,${1-p})`);gg.addColorStop(.4,`rgba(255,140,40,${.8*(1-p)})`);gg.addColorStop(1,'rgba(255,60,0,0)');x.fillStyle=gg;x.beginPath();x.arc(b.x,b.y,b.r*(0.4+p),0,7);x.fill()}
 booms=booms.filter(b=>b.t<700);
 // Mittellinie
 x.strokeStyle='rgba(166,107,255,.15)';x.setLineDash([4,8]);x.beginPath();x.moveTo(W/2,H*.15);x.lineTo(W/2,H*.88);x.stroke();x.setLineDash([]);}
R.play=(orig=>function(b){frame._fired={};elapsed=0;lastT=performance.now();orig(b)})(R.play);
window.REPLAY=R;})();
