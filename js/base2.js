'use strict';
// v35: Freie Bauplatzwahl auf dem Plateau (Clash-of-Clans-Stil): Pan/Pinch/Doppeltipp, Platzierungsmodus, Verschieben per Langdruck.
(function(){
const WW=3000,WH=2250,CELL=95,TW=750,TH=562.5;
const POLY=PLAT.poly,SPOTS=PLAT.spots;
// v36: Größe nach Wichtigkeit (groß / mittel / klein)
const FOOT={shipyard:4.3,stargate:4.3,power:4.1,lab:4.1,terraformer:4.1,metal_mine:3.2,crystal_mine:3.2,gas_mine:3.2,store:3.2,robotics:3.2,nanite:3.2,galacto:3.2,alliance:3.2,radar:2.3,'@defense':2.4};
const PREF=['metal_mine','crystal_mine','gas_mine','power','store','robotics','shipyard','lab','@defense','nanite','radar','alliance','galacto','terraformer','stargate'];
const depth=y=>.84+.32*Math.max(0,Math.min(1,(y-450)/1450));
const foot=(id,y)=>(FOOT[id]||3)*CELL*depth(y);
const B2={placing:null};window.B2=B2;
B2.on=()=>{try{const p=pl();return !!p&&!p.moon}catch(e){return false}};
const key=id=>id==='@defense'?'defense':id;
function inPoly(x,y){let c=false;for(let i=0,j=POLY.length-1;i<POLY.length;j=i++){const [xi,yi]=POLY[i],[xj,yj]=POLY[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c}
function fits(p,id,x,y){const r=foot(id,y)/2;for(let k=0;k<8;k++){const a=k*Math.PI/4;if(!inPoly(x+Math.cos(a)*r,y+Math.sin(a)*r*.5))return false}
 for(const o in p.pos){if(o===id)continue;if(!placedAny(p,o))continue;const q=p.pos[o];const R=(foot(id,y)+foot(o,q.y))/2*1.0;const dx=x-q.x,dy=(y-q.y)/.5;if(dx*dx+dy*dy<R*R)return false}return true}
function placedAny(p,id){return placed(p,id)}
function list(p){return GE.PLANET_B.concat(['@defense']).filter(id=>placed(p,id))}
function freeSpot(p,id){for(const [x,y] of SPOTS)if(fits(p,id,x,y))return{x,y};for(let t=0;t<400;t++){const x=400+Math.random()*2200,y=500+Math.random()*1400;if(fits(p,id,x,y))return{x:Math.round(x),y:Math.round(y)}}return{x:1500,y:1100}}
function ensurePos(p){p.pos=p.pos||{};let ch=false;
 // v36: größere Gebäude – alte Positionen auf Überlappung prüfen und ggf. umsetzen
 if(p.posV!==36){p.posV=36;ch=true;const ids=Object.keys(p.pos).sort((a,b)=>(FOOT[b]||3)-(FOOT[a]||3));const keep={};const all=p.pos;
  p.pos={};for(const id of ids){const q=all[id];if(placed(p,id)&&fits(p,id,q.x,q.y))p.pos[id]=q;else keep[id]=q}
  for(const id in keep){if(!placed(p,id))continue;p.pos[id]=nearestFree(p,id,keep[id])}}
 for(const id of PREF){if(!placed(p,id)||p.pos[id])continue;const k=PREF.indexOf(id);const s=SPOTS[k];if(s&&fits(p,id,s[0],s[1]))p.pos[id]={x:s[0],y:s[1]};else p.pos[id]=freeSpot(p,id);ch=true}
 for(const id in p.pos)if(!placed(p,id)&&!(B2.placing&&B2.placing.id===id)){delete p.pos[id];ch=true}
 return ch}
B2.ensurePos=ensurePos;
// ---------- DOM ----------
let root,wld,cam={s:.2,x:0,y:0},tiles={};
const FX=[[45,360],[150,455],[640,170],[700,340],[60,300]].map(([x,y])=>`<i class="b2mist" style="left:${x*4}px;top:${y*4}px"></i><i class="b2mist d2" style="left:${x*4+30}px;top:${y*4+10}px"></i>`).join('')+
 [[115,300],[180,390],[612,140],[690,440],[470,125],[100,215]].map(([x,y],i)=>`<i class="b2glow" style="left:${x*4}px;top:${y*4}px;animation-delay:-${i*.7}s"></i>`).join('');
function ensureDom(){if(root)return;root=document.createElement('div');root.id='b2';
 root.innerHTML=`<div id="b2w"><img id="b2img" src="assets/plat/base.webp" alt="" draggable="false"><div id="b2tiles"></div><div id="b2fx"></div><div id="b2blds"></div><div id="b2ghost"><div class="b2fp"></div><img alt="" draggable="false"></div><div id="b2hint" data-b2="hint"><i></i></div></div>
 <div id="b2bar"><span id="b2msg"></span><button id="b2no" class="btn sm">✕</button><button id="b2ok" class="btn sm">✓ Hier bauen</button></div>`;
 $('#v-base').appendChild(root);wld=root.querySelector('#b2w');if(window.ENV2)try{ENV2.init(root.querySelector('#b2fx'))}catch(e){console.warn(e)}bind();fitAll()}
function vw(){return root.clientWidth||innerWidth}function vh(){return root.clientHeight||innerHeight}
const LITE=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)||/[?&]lite\b/.test(location.search);B2.lite=LITE;if(LITE)document.documentElement.classList.add('lite');
const minS=()=>vh()/WH,maxS=()=>LITE?1.25:2.6;
function clamp(){const s=cam.s=Math.max(minS(),Math.min(maxS(),cam.s));const W=WW*s,H=WH*s,w=vw(),h=vh();
 cam.x=W<=w?(w-W)/2:Math.min(0,Math.max(w-W,cam.x));cam.y=H<=h?(h-H)/2:Math.min(0,Math.max(h-H,cam.y))}
function apply(){clamp();wld.style.transform=`translate3d(${cam.x}px,${cam.y}px,0) scale(${cam.s})`;wld.style.setProperty('--inv',(1/cam.s).toFixed(3));tilesUpd();schedCull()}
let cullRaf=0;function schedCull(){if(cullRaf)return;cullRaf=requestAnimationFrame(()=>{cullRaf=0;cull()})}
// v39: Effekte außerhalb des Sichtfelds komplett ausblenden (keine GPU-Ebenen)
function cull(){if(!root)return;const m0=1,m=120/cam.s+80,x0=-cam.x/cam.s-m,y0=-cam.y/cam.s-m,x1=x0+vw()/cam.s+2*m,y1=y0+vh()/cam.s+2*m;
 const env=root.querySelectorAll('#b2fx .ev');for(const e of env){let r=e._r;if(!r){const w=e.offsetWidth||40,h=e.offsetHeight||40;const p=w<80?80:40;r=e._r=[e.offsetLeft-p-(w<300?w:0),e.offsetTop-p-(h<300?h:0),e.offsetLeft+w+p,e.offsetTop+h+p]}const v=r[2]>x0&&r[0]<x1&&r[3]>y0&&r[1]<y1;if(e._v!==v){e._v=v;e.style.display=v?'':'none'}}
 for(const id in els){const f=els[id].querySelector('.b2fx');if(!f)continue;const l=parseFloat(f.style.left),t=parseFloat(f.style.top),w=parseFloat(f.style.width),h=parseFloat(f.style.height);const v=!(LITE&&cam.s<.5)&&l+w>x0&&l<x1&&t+h>y0&&t<y1;if(f._v!==v){f._v=v;f.style.display=v?'':'none'}}}
B2.cull=()=>{if(root)root.querySelectorAll('#b2fx .ev').forEach(e=>{e._r=null;e._v=null});schedCull()};
function fitAll(){cam.s=minS()*1.35;cam.x=vw()/2-1550*cam.s;cam.y=vh()/2-1150*cam.s;apply()}
B2.cam=cam;B2.apply=()=>apply();
function zoomAt(f,sx,sy){const wx=(sx-cam.x)/cam.s,wy=(sy-cam.y)/cam.s;cam.s=Math.max(minS(),Math.min(maxS(),cam.s*f));cam.x=sx-wx*cam.s;cam.y=sy-wy*cam.s;apply()}
B2.focus=(x,y,s)=>{if(s)cam.s=s;cam.x=vw()/2-x*cam.s;cam.y=vh()/2-y*cam.s;apply()};
function tilesUpd(){const dpr=Math.min(2,devicePixelRatio||1);const hi=cam.s*dpr>(LITE?1.6:1.15);const host=root.querySelector('#b2tiles');
 const x0=-cam.x/cam.s,y0=-cam.y/cam.s,x1=x0+vw()/cam.s,y1=y0+vh()/cam.s;
 for(let r=0;r<4;r++)for(let c=0;c<4;c++){const k=r+'_'+c;const vis=hi&&c*TW<x1&&(c+1)*TW>x0&&r*TH<y1&&(r+1)*TH>y0;let t=tiles[k];
  if(vis&&!t){t=tiles[k]=new Image();t.className='b2t';t.draggable=false;Object.assign(t.style,{left:c*TW+'px',top:r*TH+'px',width:TW+'px',height:TH+'px'});t.onload=()=>t.classList.add('on');t.src=`assets/plat/t_${k}.webp`;host.appendChild(t)}
  else if(!vis&&t){t.remove();t.src='';delete tiles[k]}}}
// ---------- Gebäude ----------
const els={};
function sprite(p,id,lv,state){const k=key(id);const m=window.B5&&B5[k];if(!m)return null;const tn=state==='new'?'build':'t'+tier5(Math.max(1,lv))+(state==='up'?'_up':'');const file=(k==='radar'&&state==='done'&&window.B5DISH)?tn+'_nod':(window.B5A&&B5A.hasCut&&B5A.hasCut(k,tn))?tn+'_b':tn;return{tn,k,m:m[tn]||m[tn.replace('_up','')],src:`assets/b5/${k}_${file}.webp`}}
function geo(id,x,y,sp){const [W,H,ox0,oy0,ow]=sp.m;const ft=sp.ft;let k=1,ox=ox0,oy=oy0;if(ft){k=ft[0];ox+=ft[2]*ow;oy+=ft[3]*ow}const s=foot(id,y)/(ow*k);return{left:x-ox*s,top:y-oy*s,width:W*s,height:H*s}}
function render(){ensureDom();const p=pl();if(ensurePos(p))save();const host=root.querySelector('#b2blds');const ids=list(p);const seen=new Set();
 for(const id of ids){if(B2.placing&&B2.placing.move&&B2.placing.id===id)continue;seen.add(id);const lv=lvOf(p,id),busy=busyOf(p,id);const state=busy&&!lv?'new':busy?'up':'done';const pos=p.pos[id];if(!pos)continue;
  const sp=sprite(p,id,lv,state);if(!sp)continue;let e=els[id];
  if(!e){e=els[id]=document.createElement('div');e.className='b2b';e.dataset.b2=id;e.innerHTML='<div class="b2sh"></div><img alt="" draggable="false"><div class="b2fx"></div><div class="b2pill"><span class="b2t"></span><div class="b2ring"><i></i></div></div>';host.appendChild(e)}
  const k=sp.src+pos.x+','+pos.y+state;if(e.dataset.k!==k){e.dataset.k=k;const g=geo(id,pos.x,pos.y,sp);const im=e.querySelector('img');if(im.getAttribute('src')!==sp.src)im.src=sp.src;
   Object.assign(im.style,{left:g.left+'px',top:g.top+'px',width:g.width+'px',height:g.height+'px'});const f=foot(id,pos.y);
   const fx=e.querySelector('.b2fx');Object.assign(fx.style,{left:g.left+'px',top:g.top+'px',width:g.width+'px',height:g.height+'px'});if(window.B5A)B5A.fill(fx,sp.k,sp.tn,state);
   Object.assign(e.querySelector('.b2pill').style,{left:pos.x+'px',top:g.top+g.height*.08+'px'});
   Object.assign(e.querySelector('.b2sh').style,{left:pos.x-f*.62+'px',top:pos.y-f*.24+'px',width:f*1.24+'px',height:f*.62+'px'});
   
   e.style.zIndex=Math.round(pos.y);e.className='b2b '+state}
  const t=e.querySelector('.b2t'),bar=e.querySelector('.b2ring i');if(busy&&busy.end){if(t.dataset.end!=String(busy.end)){t.dataset.end=busy.end;bar.dataset.pstart=busy.start;bar.dataset.pend=busy.end}}else if(t.dataset.end){t.removeAttribute('data-end');bar.removeAttribute('data-pend')}}
 for(const id in els)if(!seen.has(id)){els[id].remove();delete els[id]}
 drawGhost();schedCull()}
// ---------- Platzierung ----------
function drawGhost(){const gh=root.querySelector('#b2ghost'),bar=root.querySelector('#b2bar');const P=B2.placing;root.classList.toggle('placing',!!P);if(!P){gh.style.display='none';bar.style.display='none';return}
 const p=pl();const lv=lvOf(p,P.id);const sp=sprite(p,P.id,lv,P.move?(lv?'done':'new'):'new')||sprite(p,P.id,1,'done');const g=geo(P.id,P.x,P.y,sp);gh.style.display='block';bar.style.display='flex';
 const im=gh.querySelector('img');const gs=sp.src.replace('_nod','').replace('_b.webp','.webp');if(im.getAttribute('src')!==gs)im.src=gs;Object.assign(im.style,{left:g.left+'px',top:g.top+'px',width:g.width+'px',height:g.height+'px'});
 const f=foot(P.id,P.y);Object.assign(gh.querySelector('.b2fp').style,{left:P.x-f/2+'px',top:P.y-f/4+'px',width:f+'px',height:f/2+'px'});
 P.ok=fits(p,P.id,P.x,P.y);gh.classList.toggle('bad',!P.ok);gh.style.zIndex=Math.round(P.y)+1;root.querySelector('#b2ok').disabled=!P.ok;
 root.querySelector('#b2ok').textContent=P.move?'✓ Hier abstellen':'✓ Hier bauen';root.querySelector('#b2msg').textContent=(P.ok?'':'Platz belegt – ')+(P.id==='@defense'?'Abwehr':GE.BUILD[P.id].n)}
B2.startPlace=function(id,move){const p=pl();ensureDom();const c={x:(vw()/2-cam.x)/cam.s,y:(vh()/2-cam.y)/cam.s};let s=move&&p.pos[id]?{...p.pos[id]}:fits(p,id,c.x,c.y)?c:nearestFree(p,id,c);
 B2.placing={id,move:!!move,x:Math.round(s.x),y:Math.round(s.y),orig:p.pos[id]?{...p.pos[id]}:null};cam.s=Math.max(minS()*2,Math.min(.62,cam.s));B2.focus(B2.placing.x,B2.placing.y-60);render()};
function nearestFree(p,id,c){let best=null,bd=1e18;for(const [x,y] of SPOTS)if(fits(p,id,x,y)){const d=(x-c.x)**2+(y-c.y)**2;if(d<bd){bd=d;best={x,y}}}return best||freeSpot(p,id)}
function confirm(){const P=B2.placing;if(!P||!P.ok)return;const p=pl();
 if(P.move){p.pos[P.id]={x:P.x,y:P.y};B2.placing=null;save();toast('Gebäude verschoben','ok')}
 else{const e=E.build(p.id,P.id);if(e){toast(e,'err');return}p.pos=p.pos||{};p.pos[P.id]={x:P.x,y:P.y};B2.placing=null;toast(`${GE.BUILD[P.id].n} wird gebaut`,'ok');save()}
 render();if(window.renderTop)try{renderTop()}catch(e){}}
function cancel(){B2.placing=null;render()}
// ---------- Eingabe ----------
function bind(){const pts=new Map();let st=null,moved=false,pinch=null,vel={x:0,y:0},lt=0,lpT=null,drag=false,lastTap=0,tapTimer=null,inert=0;
 const W=e=>({x:(e.clientX-root.getBoundingClientRect().left-cam.x)/cam.s,y:(e.clientY-root.getBoundingClientRect().top-cam.y)/cam.s});
 root.querySelector('#b2ok').onclick=e=>{e.stopPropagation();confirm()};root.querySelector('#b2no').onclick=e=>{e.stopPropagation();cancel()};
 root.querySelector('#b2bar').addEventListener('pointerdown',e=>e.stopPropagation());
 root.addEventListener('pointerdown',e=>{if(e.target.closest('#b2bar'))return;root.setPointerCapture(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});cancelAnimationFrame(inert);
  if(pts.size===1){st={x:e.clientX,y:e.clientY,t:performance.now(),tgt:e.target};moved=false;vel={x:0,y:0};lt=st.t;
   const P=B2.placing;if(P){const w=W(e);const f=foot(P.id,P.y);drag=Math.abs(w.x-P.x)<f*.7&&w.y>P.y-f*1.3&&w.y<P.y+f*.45;if(drag){st.ox=P.x-w.x;st.oy=P.y-w.y}}else drag=false;
   const b=e.target.closest('.b2b');clearTimeout(lpT);if(b&&!B2.placing)lpT=setTimeout(()=>{moved=true;navigator.vibrate&&navigator.vibrate(20);B2.startPlace(b.dataset.b2,true)},520)}
  else if(pts.size===2){clearTimeout(lpT);moved=true;drag=false;const [a,b]=[...pts.values()];const r=root.getBoundingClientRect();pinch={d:Math.hypot(a.x-b.x,a.y-b.y),s:cam.s,mx:(a.x+b.x)/2-r.left,my:(a.y+b.y)/2-r.top};pinch.wx=(pinch.mx-cam.x)/cam.s;pinch.wy=(pinch.my-cam.y)/cam.s}});
 root.addEventListener('pointermove',e=>{const q=pts.get(e.pointerId);if(!q)return;const dx=e.clientX-q.x,dy=e.clientY-q.y;q.x=e.clientX;q.y=e.clientY;
  if(pts.size===1){if(Math.hypot(e.clientX-st.x,e.clientY-st.y)>8){moved=true;clearTimeout(lpT)}if(!moved)return;
   if(drag&&B2.placing){const w=W(e);B2.placing.x=Math.round((w.x+st.ox)/10)*10;B2.placing.y=Math.round((w.y+st.oy)/10)*10;drawGhost();return}
   cam.x+=dx;cam.y+=dy;apply();const n=performance.now(),dt=Math.max(1,n-lt);lt=n;vel={x:dx/dt*16,y:dy/dt*16}}
  else if(pts.size===2&&pinch){const [a,b]=[...pts.values()];const r=root.getBoundingClientRect();const mx=(a.x+b.x)/2-r.left,my=(a.y+b.y)/2-r.top;cam.s=Math.max(minS(),Math.min(maxS(),pinch.s*Math.hypot(a.x-b.x,a.y-b.y)/pinch.d));cam.x=mx-pinch.wx*cam.s;cam.y=my-pinch.wy*cam.s;apply()}});
 const up=e=>{if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);clearTimeout(lpT);if(pts.size===1){pinch=null;const q=[...pts.values()][0];st={x:q.x,y:q.y,t:performance.now()};lt=st.t;return}if(pts.size)return;pinch=null;
  if(!moved){const tgt=st.tgt;const b=tgt&&tgt.closest&&tgt.closest('.b2b');const r=root.getBoundingClientRect();const sx=e.clientX-r.left,sy=e.clientY-r.top;const n=performance.now();
   if(B2.placing){if(!drag){const w=W(e);B2.placing.x=Math.round(w.x/10)*10;B2.placing.y=Math.round(w.y/10)*10;drawGhost()}return}
   if(tgt&&tgt.closest&&tgt.closest('#b2hint')){openPanel('padbuild',0);return}
   if(b){openPanel('bld',b.dataset.b2==='@defense'?'@defense':b.dataset.b2);return}
   if(n-lastTap<320){clearTimeout(tapTimer);lastTap=0;zoomAt(cam.s<maxS()*.7?2:1/3,sx,sy);return}
   lastTap=n;return}
  if(!drag&&Math.hypot(vel.x,vel.y)>1){const step=()=>{vel.x*=.93;vel.y*=.93;cam.x+=vel.x;cam.y+=vel.y;apply();if(Math.hypot(vel.x,vel.y)>.3)inert=requestAnimationFrame(step)};inert=requestAnimationFrame(step)}drag=false};
 root.addEventListener('pointerup',up);root.addEventListener('pointercancel',up);
 root.addEventListener('wheel',e=>{e.preventDefault();const r=root.getBoundingClientRect();zoomAt(Math.exp(-e.deltaY*.0015),e.clientX-r.left,e.clientY-r.top)},{passive:false});
 addEventListener('resize',()=>{if(root.offsetParent)apply()});
 // Bauen-Buttons in Panels → Platzierungsmodus statt Sofortbau (nur für noch nicht gesetzte Gebäude)
 document.addEventListener('click',e=>{if(!B2.on())return;const b=e.target.closest('[data-act=padbuild],[data-act=build]');if(!b||b.disabled)return;const id=b.dataset.id;if(!id||!GE.PLANET_B.includes(id))return;const p=pl();if(placed(p,id))return;
  const er=E.canBuild?E.canBuild(p,id):null;if(er)return;e.preventDefault();e.stopPropagation();closePanel();B2.startPlace(id,false)},true)}
// Tutorial-Hilfe: freier Platz für den nächsten Bau
B2.hintEl=function(id){if(!B2.on())return null;ensureDom();const h=root.querySelector('#b2hint');const p=pl();const s=nearestFree(p,id||'metal_mine',{x:1550,y:1150});const f=foot(id||'metal_mine',s.y);
 if(h.dataset.k!==s.x+','+s.y){h.dataset.k=s.x+','+s.y;Object.assign(h.style,{left:s.x-f/2+'px',top:s.y-f/4+'px',width:f+'px',height:f/2+'px'});B2.focus(s.x,s.y)}h.classList.add('on');return h};
B2.hintOff=()=>{if(root)root.querySelector('#b2hint').classList.remove('on')};
// renderBase umleiten
const _rb=window.renderBase;
window.renderBase=function(){if(B2.on()){const pn=$('#pano');if(pn)pn.style.display='none';ensureDom();root.style.display='';if(!document.body.classList.contains('cp-guided'))B2.hintOff();render()}else{if(root)root.style.display='none';const pn=$('#pano');if(pn)pn.style.display='';_rb()}};
})();
