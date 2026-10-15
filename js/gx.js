// Galaxie-Karte: 499 Systeme als Sterne auf den Spiralarmen, Pan/Pinch/Zoom, Vorschau-Karte, Flotten-Linien.
(function(){
const GW=1280,GH=720;const GX={g:null,sel:null,slot:null,list:false,cam:null,cache:{},vel:null};window.GX=GX;
const $=s=>document.querySelector(s);
function vmap(g,[x,y]){const v=(g-1)%4;if(v===1)x=GW-x;if(v===2){x=GW-x;y=GH-y}if(v===3)y=GH-y;return[x,y]}
const imgTf=g=>{const v=(g-1)%4;return v===1?'scaleX(-1)':v===2?'rotate(180deg)':v===3?'scaleY(-1)':''};
const HUE=[0,55,-40,120,190,-95,250,30,-150];
const hue=g=>`hue-rotate(${[0,55,-40,120,190,-95,250,30,-150][g-1]}deg) saturate(${g%2?1.05:1.2})`;
GX.pos=(g,s)=>vmap(g,window.GXPOS[s-1]);
function info(g){const c=GX.cache[g];const sig=Object.keys(S.debris).length+':'+S.order.length;if(c&&c.sig===sig&&Date.now()-c.t<120000)return c.d;const d=[];
 for(let s=1;s<=499;s++){const sys=E.system(g,s);let own=0,moon=0,ina=0,lv=0,deb=0;
  for(const sl of sys){if(sl.kind==='own'){own++;if(sl.pl.moonId)moon=1}if(sl.kind==='inactive')ina++;if(sl.kind==='npc')lv=Math.max(lv,sl.lv||0);if(S.debris[E.ck(g,s,sl.p)])deb=1}
  d.push({own,moon,ina,lv,deb})}
 GX.cache[g]={t:Date.now(),d,sig};return d}
// Leuchtsprites einmalig vorrendern
const spr={};function sprite(col,r){const k=col+r;if(spr[k])return spr[k];const c=document.createElement('canvas');const n=Math.ceil(r*4);c.width=c.height=n*2;const x=c.getContext('2d');
 const gr=x.createRadialGradient(n,n,0,n,n,n);gr.addColorStop(0,'#fff');gr.addColorStop(.12,col);gr.addColorStop(.35,col.replace('1)','.35)'));gr.addColorStop(1,col.replace('1)','0)'));x.fillStyle=gr;x.fillRect(0,0,n*2,n*2);return spr[k]=c}
function colFor(i){if(i.own)return'rgba(56,225,255,1)';const t=Math.min(1,i.lv/22);return`rgba(${Math.round(175+80*t)},${Math.round(200-95*t)},${Math.round(255-190*t)},1)`}
const PAD={t:104,b:70,l:58,r:10};
function fit(){const m=$('#gxmap');const W=m.clientWidth-PAD.l-PAD.r,H=m.clientHeight-PAD.t-PAD.b;return Math.max(W/GW,H/GH)}
function clampCam(){const m=$('#gxmap'),W=m.clientWidth,H=m.clientHeight,c=GX.cam;const kf=fit();c.k=Math.min(kf*8,Math.max(kf*.92,c.k));
 const x0=PAD.l,x1=W-PAD.r-GW*c.k,y0=PAD.t,y1=H-PAD.b-GH*c.k;c.x=x1>x0?(x0+x1)/2:Math.min(x0,Math.max(x1,c.x));c.y=y1>y0?(y0+y1)/2:Math.min(y0,Math.max(y1,c.y))}
function apply(){clampCam();const c=GX.cam;if(window.GXGL&&GXGL.ok){const zr=c.k/fit();const now=performance.now();const lo=now-(GX.lastMove||0)<140;GXGL.draw(c,GX.g,HUE[GX.g-1],GX.g%2?1.05:1.2,Math.max(0,Math.min(1,(zr-2)/2.5)),lo);draw();return}$('#gximg').style.transform=`translate(${c.x}px,${c.y}px) scale(${c.k})`;const zr=c.k/fit();$('#gximg').style.opacity=zr>2.5?Math.max(.72,1-(zr-2.5)*.08).toFixed(2):'1';draw()}
GX.goto=function(g,s,p){if(!GX._b){GX._b=1;GX.bind()}if(GX.g!==g)setGal(g);GX.sel=s;GX.slot=p;GX.focus(s,Math.max(GX.cam.k,fit()*3));card()};
GX.focus=function(s,k){const m=$('#gxmap');const [x,y]=GX.pos(GX.g,s);const c=GX.cam;c.k=k||c.k;c.x=m.clientWidth/2-x*c.k;c.y=m.clientHeight/2-y*c.k;apply()};
// Helligkeitskarte der Galaxie (für prozedurale Detailsterne)
let LUM=null;function lum(){if(LUM)return LUM;const im=$('#gximginner');if(!im||!im.complete||!im.naturalWidth)return null;const c=document.createElement('canvas');c.width=256;c.height=144;const x=c.getContext('2d');x.drawImage(im,0,0,256,144);
 const d=x.getImageData(0,0,256,144).data;LUM={l:new Float32Array(256*144),c:new Uint8ClampedArray(256*144*3)};for(let i=0;i<256*144;i++){const r=d[i*4],g=d[i*4+1],b=d[i*4+2];LUM.l[i]=(r+g+b)/765;LUM.c[i*3]=r;LUM.c[i*3+1]=g;LUM.c[i*3+2]=b}return LUM}
const hsh=(a,b,n)=>{let h=(a*374761393+b*668265263+n*1442695041)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296};
function detail(x,W,H,c,zr){const L=lum();if(!L||zr<1.5)return;const a=Math.min(1,(zr-1.5)/1.5);const v=(GX.g-1)%4;
 const cell=16;const wx0=Math.max(0,Math.floor((-c.x)/c.k/cell)),wx1=Math.min(GW/cell,Math.ceil((W-c.x)/c.k/cell)),wy0=Math.max(0,Math.floor((-c.y)/c.k/cell)),wy1=Math.min(GH/cell,Math.ceil((H-c.y)/c.k/cell));
 for(let cy=wy0;cy<wy1;cy++)for(let cx=wx0;cx<wx1;cx++){let sx=cx*cell+8,sy=cy*cell+8;if(v===1)sx=GW-sx;if(v===2){sx=GW-sx;sy=GH-sy}if(v===3)sy=GH-sy;
  const li=Math.min(143,Math.max(0,Math.floor(sy/GH*144)))*256+Math.min(255,Math.max(0,Math.floor(sx/GW*256)));const b=L.l[li];const n=Math.floor(b*b*7+hsh(cx,cy,9)*1.6);
  for(let k=0;k<n;k++){const px=(cx+hsh(cx,cy,k*3))*cell,py=(cy+hsh(cx,cy,k*3+1))*cell;const X=c.x+px*c.k,Y=c.y+py*c.k;const br=hsh(cx,cy,k*3+2);
   const r=.45+br*br*1.3;x.globalAlpha=a*(.35+br*.65);x.fillStyle=br>.93?'#fff6e0':br>.75?'#dfe8ff':'#cbd5ff';x.beginPath();x.arc(X,Y,r,0,6.283);x.fill()}}
 x.globalAlpha=1}
function draw(){const cv=$('#gxcv'),m=$('#gxmap');if(!cv||!GX.cam)return;const d=Math.min(2,devicePixelRatio||1),W=m.clientWidth,H=m.clientHeight;
 if(cv.width!==Math.round(W*d)||cv.height!==Math.round(H*d)){cv.width=Math.round(W*d);cv.height=Math.round(H*d)}
 const x=cv.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,W,H);const c=GX.cam,g=GX.g,inf=info(g);const zr=c.k/fit();detail(x,W,H,c,zr);
 const now=E.now();
 // Flotten
 for(const f of S.fleets){if(f.npc)continue;const a=f.fromC,b=f.to;if(a.g!==g||b.g!==g)continue;let [x1,y1]=GX.pos(g,a.s),[x2,y2]=GX.pos(g,b.s);if(f.phase==='back')[x1,y1,x2,y2]=[x2,y2,x1,y1];
  const X1=c.x+x1*c.k,Y1=c.y+y1*c.k,X2=c.x+x2*c.k,Y2=c.y+y2*c.k;const t0=f.phase==='back'?f.arrive-f.dur:f.depart,pr=Math.min(1,Math.max(0,(now-t0)/Math.max(1,(f.phase==='back'?f.arrive:f.arrive)-t0)));
  x.save();x.setLineDash([4,5]);x.lineDashOffset=-(performance.now()/60)%9;x.strokeStyle=f.mission==='attack'?'rgba(255,107,129,.8)':'rgba(56,225,255,.75)';x.lineWidth=1.4;x.beginPath();x.moveTo(X1,Y1);x.lineTo(X2,Y2);x.stroke();x.restore();
  const fx=X1+(X2-X1)*pr,fy=Y1+(Y2-Y1)*pr;x.drawImage(sprite('rgba(255,255,255,1)',3),fx-12,fy-12,24,24);
  if(X1===X2&&Y1===Y2){x.strokeStyle='rgba(56,225,255,.6)';x.beginPath();x.arc(X1,Y1,9+3*Math.sin(performance.now()/300),0,7);x.stroke()}}
 for(let s=1;s<=499;s++){const i=inf[s-1];const [px,py]=GX.pos(g,s);const X=c.x+px*c.k,Y=c.y+py*c.k;if(X<-20||Y<-20||X>W+20||Y>H+20)continue;
  const r=(i.own?3.4:1.25+Math.min(1,i.lv/22))*Math.min(2.2,0.8+zr*0.3);const sp=sprite(colFor(i),4);const R=r*4;x.drawImage(sp,X-R,Y-R,R*2,R*2);
  if(i.own){x.strokeStyle='rgba(56,225,255,.85)';x.lineWidth=1.3;x.beginPath();x.arc(X,Y,r*2.6,0,7);x.stroke()}
  if(i.ina&&zr>1.7){x.fillStyle='rgba(255,200,97,.9)';x.beginPath();x.arc(X+r*2.3,Y+r*1.6,1.5,0,7);x.fill()}
  if(i.deb){x.fillStyle='rgba(120,255,170,.95)';x.beginPath();x.arc(X+r*2.2,Y-r*2.2,1.8,0,7);x.fill()}
  if(i.moon){x.fillStyle='#d8dde8';x.beginPath();x.arc(X-r*2.4,Y-r*2,1.9,0,7);x.fill()}
  if(GX.sel===s){x.strokeStyle='#fff';x.lineWidth=1.5;x.beginPath();x.arc(X,Y,r*3.4+3,0,7);x.stroke();x.strokeStyle='rgba(150,120,255,.6)';x.beginPath();x.arc(X,Y,r*3.4+7,0,7);x.stroke()}
  if(zr>2.6){x.font='600 9.5px system-ui';x.fillStyle=i.own?'#9ff0ff':'rgba(220,228,255,.75)';x.textAlign='center';x.fillText(g+':'+s,X,Y+r*3+9)}}}
function hit(cx,cy){const c=GX.cam;let best=null,bd=22*22;for(let s=1;s<=499;s++){const [px,py]=GX.pos(GX.g,s);const dx=c.x+px*c.k-cx,dy=c.y+py*c.k-cy,dd=dx*dx+dy*dy;if(dd<bd){bd=dd;best=s}}return best}
function card(){const el=$('#gxcard');if(!GX.sel){el.classList.add('hidden');return}const g=GX.g,s=GX.sel,sys=E.system(g,s);
 if(GX.slot==null){const o=sys.find(x=>x.kind==='own')||sys.find(x=>x.kind==='inactive')||sys.find(x=>x.kind==='npc');GX.slot=o?o.p:1}
 const sl=sys.find(x=>x.p===GX.slot)||sys[0];const ms=E.missionsFor(g,s,sl.p);
 const th=sys.map(x=>{const src=x.kind==='nebula'?'':A.planetSrc(x.type);const c=x.kind==='own'?'own':x.kind==='npc'?'npc':x.kind==='inactive'?'ina':x.kind==='empty'?'emp':x.kind==='nebula'?'neb':'pl';
  return`<button class="gth ${c} ${x.p===sl.p?'on':''}" data-gslot="${x.p}" title="${x.p}">${x.kind==='nebula'?A.img('nebula'):`<img src="${src}" alt="">`}<i>${x.p}</i></button>`}).join('');
 const who=sl.kind==='own'?`<span class="badge own">${PN(S.cmdName)}</span>`:sl.kind==='npc'?`<span class="badge">NPC · Lv ${sl.lv}</span>`:sl.kind==='inactive'?`${`<span class="pnl" data-pn="${esc(sl.player)}">${esc(sl.player)}</span>`} <span class="badge i">inaktiv</span>`:sl.kind==='player'?`${`<span class="pnl" data-pn="${esc(sl.player)}">${esc(sl.player)}</span>`} <span class="badge prot">geschützt</span>`:sl.kind==='nebula'?'<span class="badge">Nebel</span>':`<span class="mut">${sl.fields} Felder</span>`;
 const nm=sl.kind==='empty'?'Freier Planet':sl.kind==='nebula'?'Nebel':esc(sl.name);
 const deb=S.debris[E.ck(g,s,sl.p)];
 const btn=(m,ic,lbl,cls='')=>`<button class="btn sm ${cls}" ${ms.includes(m)?'':'disabled'} data-act="dispatch" data-g="${g}" data-s="${s}" data-p="${sl.p}" data-m="${m}">${ic} ${lbl}</button>`;
 const owners=[...new Set(sys.filter(x=>x.kind==='inactive'||x.kind==='player').map(x=>x.player))].slice(0,4);
 el.innerHTML=`<div class="row"><b style="font-size:14px">System ${g}:${s}</b><span class="mut" style="font-size:11px">${sys.filter(x=>x.kind==='npc').length} NPC · ${sys.filter(x=>x.kind==='empty').length} frei</span><span class="spacer"></span><button class="iconbtn sm" data-gx="close" aria-label="Schließen">✕</button></div>
 <div class="gths">${th}</div>
 <div class="gsel"><div class="row" style="font-size:11.5px;gap:6px;flex-wrap:nowrap;overflow:hidden"><b style="white-space:nowrap">${nm}</b><span class="mut">${g}:${s}:${sl.p}</span>${who}${sl.ally?`<span class="badge">${esc(sl.ally)}</span>`:''}${deb?`<span class="badge" style="color:#8fffb5">Trümmer ${fmt(deb.m+deb.k)}</span>`:''}</div></div>
 
 <div class="gacts"><button class="btn sm ghost" data-gx="view">${IC.sys} Ansehen</button>${btn('spy',IC.spy,'Spionieren')}${btn('attack',IC.attack,'Angreifen','bad')}${btn('colonize',IC.colonize,'Kolonisieren')}</div>`;
 el.classList.remove('hidden')}
function chrome(){const g=GX.g;
 $('#gxtop').innerHTML=`<div class="gsw">${[1,2,3,4,5,6,7,8,9].map(i=>`<button class="${i===g?'on':''}" data-gx="gal" data-v="${i}" title="Galaxie ${i}"><img src="assets/galaxy_t.webp" style="filter:${hue(i)};transform:${imgTf(i)}" alt=""><i>${i}</i></button>`).join('')}</div>
 <form class="gsearch" data-gx="search"><input id="gxq" placeholder="g:s oder g:s:p" inputmode="numeric" autocomplete="off"><button class="iconbtn sm" type="submit" aria-label="Springen">➜</button></form>
 <button class="btn sm ghost ${GX.list?'on':''}" data-gx="list">☰ Liste</button>`;
 $('#gximg').style.filter=hue(g)+' brightness(.9)';$('#gximg').dataset.tf=imgTf(g);}
function setGal(g){GX.g=g;GX.sel=null;GX.slot=null;chrome();const m=$('#gxmap');GX.cam={k:fit(),x:0,y:0};const c=GX.cam;c.x=(m.clientWidth-GW*c.k)/2;c.y=PAD.t+(m.clientHeight-PAD.t-PAD.b-GH*c.k)/2;
 $('#gximg').style.transformOrigin='0 0';const tf=imgTf(g);$('#gximginner').style.transform=tf;apply();card()}
GX.render=function(){const p=pl();if(!$('#gxmap'))return;if(GX.g==null){setGal(p.g);GX.focus(p.s,fit()*2.2)}
 $('#v-galaxy').classList.toggle('listmode',GX.list);if(GX.list){galG=GX.g;galS=GX.sel||galS||p.s;renderGalList()}draw();loopOn()};
let raf=0;function loopOn(){if(raf)return;const step=()=>{raf=0;if(view!=='galaxy'||document.hidden)return;
 if(GX.vel){GX.lastMove=performance.now();GX.cam.x+=GX.vel.x;GX.cam.y+=GX.vel.y;GX.vel.x*=.92;GX.vel.y*=.92;if(Math.abs(GX.vel.x)+Math.abs(GX.vel.y)<.3)GX.vel=null;apply()}
 else if(S.fleets.some(f=>!f.npc&&f.to.g===GX.g))draw();
 raf=requestAnimationFrame(step)};raf=requestAnimationFrame(step)}
function zoomAt(f,cx,cy){const c=GX.cam;const nk=Math.min(fit()*8,Math.max(fit()*.92,c.k*f));const r=nk/c.k;c.x=cx-(cx-c.x)*r;c.y=cy-(cy-c.y)*r;c.k=nk;apply()}
// Zoom animiert
function animZoom(f,cx,cy){let n=0;const st=()=>{zoomAt(Math.pow(f,1/10),cx,cy);if(++n<10)requestAnimationFrame(st)};st()}
function bind(){const m=$('#gxmap');{const cv=document.createElement('canvas');cv.id='gxgl';m.insertBefore(cv,m.firstChild);if(window.GXGL&&GXGL.init(cv)){$('#gximg').style.display='none';GXGL.onload=()=>{if(GX.cam)apply()}}else cv.remove()}$('#gximginner').addEventListener('load',()=>{LUM=null;draw()});const pts=new Map();let st=null;
 m.addEventListener('pointerdown',e=>{m.setPointerCapture(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});GX.vel=null;
  if(pts.size===1)st={x:e.clientX,y:e.clientY,t:performance.now(),moved:0,lx:e.clientX,ly:e.clientY,vx:0,vy:0};
  else if(pts.size===2){const [a,b]=[...pts.values()];st.pinch={d:Math.hypot(a.x-b.x,a.y-b.y),k:GX.cam.k};st.moved=99}});
 m.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId)||!st)return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});const r=m.getBoundingClientRect();
  if(pts.size>=2&&st.pinch){const [a,b]=[...pts.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);const tk=st.pinch.k*d/st.pinch.d;GX.lastMove=performance.now();zoomAt(tk/GX.cam.k,(a.x+b.x)/2-r.left,(a.y+b.y)/2-r.top);return}
  const dx=e.clientX-st.lx,dy=e.clientY-st.ly;st.lx=e.clientX;st.ly=e.clientY;st.moved+=Math.abs(dx)+Math.abs(dy);if(st.moved>6){GX.lastMove=performance.now();GX.cam.x+=dx;GX.cam.y+=dy;st.vx=dx;st.vy=dy;apply()}});
 const up=e=>{if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);if(pts.size||!st)return;const r=m.getBoundingClientRect();
  if(st.moved<=6&&performance.now()-st.t<500){const s=hit(e.clientX-r.left,e.clientY-r.top);GX.sel=s;GX.slot=null;draw();card()}
  else if(Math.abs(st.vx)+Math.abs(st.vy)>2){GX.vel={x:st.vx,y:st.vy};loopOn()}st=null};
 m.addEventListener('pointerup',up);m.addEventListener('pointercancel',up);
 m.addEventListener('wheel',e=>{e.preventDefault();const r=m.getBoundingClientRect();zoomAt(Math.exp(-e.deltaY*0.0015),e.clientX-r.left,e.clientY-r.top)},{passive:false});
 $('#v-galaxy').addEventListener('click',e=>{const t=e.target.closest('[data-gx],[data-gslot],[data-zoom]');if(!t)return;
  if(t.dataset.gslot){GX.slot=+t.dataset.gslot;card();return}
  if(t.dataset.zoom){const z=t.dataset.zoom;if(z==='home'){const p=pl();if(GX.g!==p.g)setGal(p.g);GX.sel=p.s;GX.slot=p.p;GX.focus(p.s,fit()*2.6);card()}else animZoom(z==='in'?1.6:1/1.6,m.clientWidth/2,m.clientHeight/2);return}
  const a=t.dataset.gx;if(a==='close'){GX.sel=null;draw();card()}
  else if(a==='gal'){setGal(+t.dataset.v)}
  else if(a==='list'){GX.list=!GX.list;chrome();GX.render()}
  else if(a==='view'){sysG=GX.g;sysS=GX.sel;setView('system')}});
 $('#v-galaxy').addEventListener('submit',e=>{e.preventDefault();const v=($('#gxq').value||'').split(/[^0-9]+/).filter(Boolean).map(Number);if(!v.length)return;
  let g=GX.g,s,p=null;if(v.length===1)s=v[0];else{g=v[0];s=v[1];p=v[2]||null}g=Math.min(9,Math.max(1,g));s=Math.min(499,Math.max(1,s||1));
  if(g!==GX.g)setGal(g);GX.sel=s;GX.slot=p;GX.focus(s,Math.max(GX.cam.k,fit()*3));card();$('#gxq').blur()});
 addEventListener('resize',()=>{if(GX.cam){apply()}})}
document.addEventListener('DOMContentLoaded',()=>{});
GX.bind=bind;
})();
function renderGalaxy(){if(!GX._b){GX._b=1;GX.bind()}GX.render()}
