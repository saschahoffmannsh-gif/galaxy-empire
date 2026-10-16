'use strict';
// v35: Freie Bauplatzwahl auf dem Plateau (Clash-of-Clans-Stil): Pan/Pinch/Doppeltipp, Platzierungsmodus, Verschieben per Langdruck.
(function(){
if(!window.B5)return; // Das Quellcodepaket ohne Sprite-Metadaten verwendet die DOM-Basis.
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
// ---------- v40: EIN Canvas-Renderer für die Basis (statt hunderter DOM-Ebenen) ----------
const LITE=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)||/[?&]lite\b/.test(location.search);B2.lite=LITE;if(LITE)document.documentElement.classList.add('lite');
const DPR=()=>Math.min(LITE?1.5:2,devicePixelRatio||1);
const RM=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
let root,cv,ctx,ui,cam={s:.2,x:0,y:0};
const minS=()=>vh()/WH,maxS=()=>LITE?1.6:2.6;
function vw(){return root.clientWidth||innerWidth}function vh(){return root.clientHeight||innerHeight}
function ensureDom(){if(root)return;root=document.createElement('div');root.id='b2';
 root.innerHTML=`<canvas id="b2c"></canvas><div id="b2ui"></div><div id="b2hint" data-b2="hint"><i></i></div>
 <div id="b2bar"><span id="b2msg"></span><button id="b2no" class="btn sm">✕</button><button id="b2ok" class="btn sm">✓ Hier bauen</button></div>`;
 $('#v-base').appendChild(root);cv=root.querySelector('#b2c');ui=root.querySelector('#b2ui');bind();fitAll();requestAnimationFrame(frame)}
// ---- Bild-Cache (ImageBitmap, mit close()) ----
const IMG=new Map();let memB=0;
function getImg(src,maxW){let o=IMG.get(src);if(o){o.used=1;return o.bmp}o={bmp:null,used:1,bytes:0};IMG.set(src,o);
 const done=b=>{if(!IMG.has(src)||IMG.get(src)!==o){b.close&&b.close();return}o.bmp=b;o.bytes=b.width*b.height*4;memB+=o.bytes;dirty=1};
 fetch(src).then(r=>{if(!r.ok)throw 0;return r.blob()}).then(bl=>createImageBitmap(bl)).then(b=>{if(maxW&&b.width>maxW*1.15){const h=Math.round(b.height*maxW/b.width);return createImageBitmap(b,{resizeWidth:maxW,resizeHeight:h,resizeQuality:'high'}).then(r=>{b.close();done(r)}).catch(()=>done(b))}done(b)}).catch(()=>{o.err=1});
 return null}
function sweep(keep){for(const [k,o] of IMG){if(o.used||(keep&&keep(k)))continue;if(o.bmp){memB-=o.bytes;o.bmp.close&&o.bmp.close()}IMG.delete(k)}for(const o of IMG.values())o.used=0}
function freeAll(){for(const o of IMG.values())if(o.bmp){o.bmp.close&&o.bmp.close()}IMG.clear();memB=0;for(const f of FALLS)f.c=null;scr=null;if(cv){cv.width=cv.height=0}}
B2.mem=()=>({imgMB:+(memB/1e6).toFixed(1),imgs:IMG.size,canvasMB:cv?+(cv.width*cv.height*4/1e6).toFixed(1):0});
// ---- Kamera ----
function clamp(){const s=cam.s=Math.max(minS(),Math.min(maxS(),cam.s));const W=WW*s,H=WH*s,w=vw(),h=vh();
 cam.x=W<=w?(w-W)/2:Math.min(0,Math.max(w-W,cam.x));cam.y=H<=h?(h-H)/2:Math.min(0,Math.max(h-H,cam.y))}
let dirty=1;
function apply(){clamp();dirty=1;placeUi()}
function fitAll(){cam.s=minS()*1.35;cam.x=vw()/2-1550*cam.s;cam.y=vh()/2-1150*cam.s;apply()}
B2.cam=cam;B2.apply=()=>apply();B2.cull=()=>{};
function zoomAt(f,sx,sy){const wx=(sx-cam.x)/cam.s,wy=(sy-cam.y)/cam.s;cam.s=Math.max(minS(),Math.min(maxS(),cam.s*f));cam.x=sx-wx*cam.s;cam.y=sy-wy*cam.s;apply()}
B2.focus=(x,y,s)=>{if(s)cam.s=s;cam.x=vw()/2-x*cam.s;cam.y=vh()/2-y*cam.s;apply()};
function view(m){m=m||0;const x0=-cam.x/cam.s-m,y0=-cam.y/cam.s-m;return[x0,y0,x0+vw()/cam.s+2*m,y0+vh()/cam.s+2*m]}
const vis=(V,x,y,w,h)=>x+w>V[0]&&x<V[2]&&y+h>V[1]&&y<V[3];
// ---- Gebäude-Daten ----
const els={};let order=[];
const hasCut=(k,tn)=>{const L=window.B5P&&B5P[k]&&B5P[k][tn];return !!(L&&!tn.endsWith('_up')&&L.some(e=>e.f.endsWith('.webp')))};
function sprite(p,id,lv,state){const k=key(id);const m=window.B5&&B5[k];if(!m)return null;const tn=state==='new'?'build':'t'+tier5(Math.max(1,lv))+(state==='up'?'_up':'');const file=(k==='radar'&&state==='done'&&window.B5DISH)?tn+'_nod':hasCut(k,tn)?tn+'_b':tn;const b6=window.B6&&B6.base(k,state==='new'?'build':tn);return{tn,k,m:m[tn]||m[tn.replace('_up','')],src:b6||`assets/b5/${k}_${file}.webp`}}
function geo(id,x,y,sp){const [W,H,ox0,oy0,ow]=sp.m;const s=foot(id,y)/ow;return{left:x-ox0*s,top:y-oy0*s,width:W*s,height:H*s}}
const R=(a,b)=>a+Math.random()*(b-a);
// Effektliste je Gebäude (aus B5FX/B5P/B5DISH), Koordinaten relativ zur Sprite-Box
function fxList(k,tn,state){const base=tn.replace('_up','');const L=(window.B5FX&&B5FX[k]&&B5FX[k][state==='new'?'build':base])||[];const o=[];const A=(t,x,y,z,d,ex)=>o.push(Object.assign({t,x,y,z,d:d||3.5,ph:R(0,6)},ex||{}));
 const C=L.find(p=>p[0]==='C')||['C',.5,.55,.6],T=L.find(p=>p[0]==='T')||['T',.5,.05,0];const bl=L.filter(p=>p[0]==='b');const big=bl.reduce((a,b)=>b[3]>a[3]?b:a,[0,0,0,0]);
 for(const [t,x,y,z] of L){if(t==='b'){if(k==='stargate'&&big[3]===z)continue;A('cy',x,y,Math.min(z*1.6,.6),R(2.8,4.6))}
  else if(t==='o')A('or',x,y,Math.min(z*2.4,.25),R(1.4,2.2));else if(t==='r')A('rd',x,y,Math.min(z*2,.25),R(2.4,3.6));else if(t==='g')A('gr',x,y,Math.min(z*1.5,.2),R(2,3.5));
  else if(t==='s'&&!(LITE&&o.filter(e=>e.t==='smoke').length>=4))for(let i=0;i<3;i++)A('smoke',x,y,Math.max(z,.07)*1.4,R(6.2,7.2),{ph:i*2.2+R(0,.6)})}
 if(k==='stargate'&&bl.length){A('swirl',big[1],big[2],big[3]*.72,12);A('cy',big[1],big[2],big[3]*1.1,3.2)}
 if(k==='nanite'&&bl.length)A('brain',big[1],big[2],big[3]*1.5,2.4);
 if(k==='power'){const c=L.find(p=>p[0]==='o')||C;A('pulse',c[1],c[2],.14,2.6,{ph:0});A('pulse',c[1],c[2],.14,2.6,{ph:1.3})}
 if(k==='shipyard')for(const [x,y] of [[C[1]-.08,C[2]-.06],[C[1]+.07,C[2]-.02],[C[1],C[2]+.05]])A('weld',x,y,.05,R(2.2,3.4));
 if(k==='defense'&&state!=='new')A('beam',T[1],T[2]+.08,.7,9);
 if(k==='lab'&&state!=='new')A('glint',T[1],T[2]+.03,.12,5.5);
 if((k==='metal_mine'||k==='crystal_mine'||k==='gas_mine')&&state!=='new'){A('dust',C[1]-.05,C[2]+.12,.16,5);A('dust',C[1]+.06,C[2]+.14,.13,5,{ph:2.5})}
 if(k==='terraformer')for(let i=0;i<3;i++)A('mist',C[1]+R(-.2,.2),C[2]+R(0,.2),.22,R(7,10));
 if(k==='radar'&&state!=='new'&&window.B5DISH&&B5DISH[base]){const d=B5DISH[base];A('dish',d[0],d[1],d[2],10,{h:d[3],src:`assets/b5/radar_${base}_dish.webp`});A('blink',T[1],T[2],.03,2.6)}
 if(k!=='radar'&&state!=='new')A('blink',T[1],T[2]+.01,.025,R(2.2,3.2));
 if(state==='new'||state==='up'){for(let i=0;i<3;i++)A('weld',C[1]+R(-.22,.22),C[2]-R(0,.25),.05,R(1.8,3.2));if(!LITE)for(let i=0;i<2;i++)A('dust',C[1]+R(-.25,.25),C[2]+R(.12,.22),.18,R(4,6));
  A('wl',C[1]+C[3]*.38,C[2]-.05,.12,1.9);A('wl',C[1]-C[3]*.42,C[2]+.02,.1,1.9,{ph:1})}
 const P=window.B5P&&B5P[k]&&B5P[k][state==='new'?'build':tn];if(P)for(const e of P){const d=e.a==='turret'?(e.d||0)*2.7:R(0,12);o.push({t:'part',e,ph:d,src:'assets/b5/'+e.f})}
 if(window.B6){const d=window.B6D&&B6D[k]&&B6D[k][state==='new'?'build':tn];const drop=d&&d.drop;const L=drop?o.filter(e=>!drop.includes(e.t)):o;L.push(...B6.list(k,tn,state));return L}
 return o}
// ---- vorgerenderte Leucht-Sprites (klein, einmalig) ----
const GL={};function glow(name,stops){if(GL[name])return GL[name];const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const r=g.createRadialGradient(32,32,0,32,32,32);for(const [o,col] of stops)r.addColorStop(o,col);g.fillStyle=r;g.fillRect(0,0,64,64);return GL[name]=c}
const G={cy:()=>glow('cy',[[0,'rgba(120,220,255,.55)'],[.45,'rgba(60,160,255,.18)'],[.7,'rgba(60,160,255,0)'],[1,'rgba(0,0,0,0)']]),
 or:()=>glow('or',[[0,'rgba(255,200,110,.75)'],[.45,'rgba(255,120,40,.22)'],[.7,'rgba(255,120,40,0)'],[1,'rgba(0,0,0,0)']]),
 rd:()=>glow('rd',[[0,'rgba(255,80,70,.6)'],[.45,'rgba(255,40,40,.15)'],[.7,'rgba(255,40,40,0)'],[1,'rgba(0,0,0,0)']]),
 gr:()=>glow('gr',[[0,'rgba(120,255,140,.45)'],[.65,'rgba(120,255,140,0)'],[1,'rgba(0,0,0,0)']]),
 smoke:()=>glow('sm',[[0,'rgba(205,205,210,.45)'],[.45,'rgba(180,180,190,.18)'],[.7,'rgba(180,180,190,0)'],[1,'rgba(0,0,0,0)']]),
 mist:()=>glow('mi',[[0,'rgba(235,245,255,.5)'],[.68,'rgba(235,245,255,0)'],[1,'rgba(0,0,0,0)']]),
 dust:()=>glow('du',[[0,'rgba(200,160,115,.5)'],[.68,'rgba(200,160,115,0)'],[1,'rgba(0,0,0,0)']]),
 wl:()=>glow('wl',[[0,'rgba(255,225,150,.55)'],[.4,'rgba(255,190,90,.15)'],[.68,'rgba(255,190,90,0)'],[1,'rgba(0,0,0,0)']]),
 weld:()=>glow('we',[[0,'#fff'],[.12,'rgba(255,240,180,.95)'],[.3,'rgba(255,170,60,.5)'],[.6,'rgba(255,170,60,0)'],[1,'rgba(0,0,0,0)']]),
 blink:()=>glow('bl',[[0,'#fff'],[.18,'rgba(255,70,60,.95)'],[.4,'rgba(255,40,40,.3)'],[.7,'rgba(255,40,40,0)'],[1,'rgba(0,0,0,0)']]),
 white:()=>glow('wh',[[0,'rgba(255,255,255,.9)'],[.25,'rgba(180,220,255,.3)'],[.6,'rgba(180,220,255,0)'],[1,'rgba(0,0,0,0)']]),
 star:()=>glow('st',[[0,'#fff'],[.2,'rgba(220,230,255,.9)'],[.45,'rgba(200,215,255,.3)'],[1,'rgba(200,215,255,0)']]),
 cg:()=>glow('cg',[[0,'rgba(150,120,255,.38)'],[.65,'rgba(150,120,255,0)'],[1,'rgba(0,0,0,0)']]),
 spray:()=>glow('sp',[[0,'rgba(230,240,255,.5)'],[.7,'rgba(230,240,255,0)'],[1,'rgba(0,0,0,0)']]),
 core:()=>glow('co',[[0,'rgba(255,230,210,.55)'],[.45,'rgba(220,150,255,.18)'],[.7,'rgba(220,150,255,0)'],[1,'rgba(0,0,0,0)']]),
 neb:()=>glow('nb',[[0,'rgba(170,90,255,.16)'],[.5,'rgba(80,60,200,.07)'],[.72,'rgba(80,60,200,0)'],[1,'rgba(0,0,0,0)']]),
 sh:()=>glow('sh',[[0,'rgba(40,18,6,.6)'],[.55,'rgba(40,18,6,.3)'],[1,'rgba(40,18,6,0)']])};
let swirlC=null;function swirl(){if(swirlC)return swirlC;const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
 if(g.createConicGradient){const r=g.createConicGradient(0,64,64);[[0,'rgba(120,170,255,0)'],[.12,'rgba(170,210,255,.7)'],[.3,'rgba(120,100,255,0)'],[.5,'rgba(150,200,255,.6)'],[.65,'rgba(120,100,255,0)'],[.82,'rgba(190,220,255,.65)'],[1,'rgba(120,170,255,0)']].forEach(([o,c])=>r.addColorStop(o,c));g.fillStyle=r;g.fillRect(0,0,128,128)}
 g.globalCompositeOperation='destination-in';const m=g.createRadialGradient(64,64,0,64,64,64);m.addColorStop(.3,'#000');m.addColorStop(.7,'rgba(0,0,0,0)');g.fillStyle=m;g.fillRect(0,0,128,128);return swirlC=c}
// Keyframes: [[p,v],...] mit weichem Übergang
function kf(p,K){p=((p%1)+1)%1;for(let i=1;i<K.length;i++)if(p<=K[i][0]){const a=K[i-1],b=K[i];const u=(p-a[0])/Math.max(1e-6,b[0]-a[0]);const e=u*u*(3-2*u);return a[1]+(b[1]-a[1])*e}return K[K.length-1][1]}
const KF={slew:[[0,1],[.18,1],[.45,.68],[.62,.68],[.88,1],[1,1]],luff:[[0,-3.5],[.4,2.5],[.55,2.8],[1,-3.5]],tur:[[0,0],[.12,-5],[.3,-5],[.45,4],[.62,4],[.78,0],[1,0]],sc:[[0,-3],[.35,-3],[.55,3.5],[.8,3.5],[1,-3]],
 beam:[[0,-165],[.5,-120],[1,-165]],dish:[[0,1],[.3,.86],[.65,.94],[1,1]],dishR:[[0,0],[.3,-3],[.65,2.5],[1,0]]};
const DEG=Math.PI/180;
const B6H={img:s=>getImg(s),src:f=>'assets/b6/'+f,lite:LITE,get scale(){return cam.s*DPR()}};
let scr=null;function scratch(w,h){if(!scr){scr=document.createElement('canvas')}if(scr.width<w||scr.height<h){scr.width=Math.max(scr.width,w);scr.height=Math.max(scr.height,h)}const g=scr.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.clearRect(0,0,w,h);return g}
function stripes(g,w,h,ang,per,off,cols){g.save();g.translate(w/2,h/2);g.rotate(ang*DEG);const L=Math.hypot(w,h);for(let x=-L-per+(off%per);x<L;x+=per){for(const [a,b,c] of cols){g.fillStyle=c;g.fillRect(x+a,-L,b-a,2*L)}}g.restore()}
function drawFx(g,f,bx,t){const W=bx.width,X=bx.left+f.x*W,Y=bx.top+f.y*bx.height,d=f.z*W,p=(t+f.ph)/f.d;
 const dot=(img,a,sc,dx,dy)=>{if(a<=.01)return;const D=d*(sc||1);g.globalAlpha=Math.min(1,a);g.drawImage(img,X-D/2+(dx||0),Y-D/2+(dy||0),D,D)};
 switch(f.t){
  case'cy':case'rd':{const u=.5-.5*Math.cos(p*2*Math.PI);dot(G[f.t](),.25+.65*u,.85+.25*u);break}
  case'or':dot(G.or(),.6+.35*(.5+.5*Math.sin(p*13)*Math.sin(p*7)));break;
  case'gr':{const q=p%1;dot(G.gr(),q>.48&&q<.53?.7:.27);break}
  case'smoke':{const q=p%1;const a=q<.2?q/.2*.6:.6*(1-(q-.2)/.8);dot(G.smoke(),a,.4+q,d*.1*q,-d*q);break}
  case'mist':{const u=.5-.5*Math.cos(p*2*Math.PI);dot(G.mist(),.15+.4*u,.8+.45*u,d*.1*u,-d*.2*u);break}
  case'dust':{const q=p%1;const a=q<.3?q/.3*.6:.6*(1-(q-.3)/.7);dot(G.dust(),a,.4+1.2*q,d*.2*q,d*.2-d*.6*q);break}
  case'wl':{const u=.5-.5*Math.cos(p*2*Math.PI);dot(G.wl(),.25+.65*u,.85+.25*u);break}
  case'blink':dot(G.blink(),(p%1)<.12?.1:1);break;
  case'weld':{const q=p%1;const on=(q>.08&&q<.3)||(q>.64&&q<.74);if(on){dot(G.weld(),(Math.floor(t*20)%3)?1:.5);g.fillStyle='#ffd';for(let i=0;i<4;i++){const a=(i*1.7+Math.floor(t*12))%6;g.globalAlpha=.9;g.fillRect(X+(a-3)*d*.15,Y+d*(.2+.1*((t*3+i)%1)),d*.07,d*.07)}}break}
  case'glint':{const q=p%1;const a=q<.7?0:q<.8?(q-.7)/.1*.9:q<.9?.9*(1-(q-.8)/.1):0;dot(G.white(),a,.3+.7*Math.min(1,(q-.7)/.1));break}
  case'pulse':{const q=p%1;const r=d*(.3+1.9*q)/2;g.globalAlpha=.9*(1-q);g.strokeStyle='rgba(160,230,255,.85)';g.lineWidth=Math.max(1,d*.04);g.beginPath();g.arc(X,Y,r,0,7);g.stroke();break}
  case'brain':{const q=p%1;dot(G.cy(),kf(q,[[0,.35],[.12,.95],[.24,.5],[.36,.85],[1,.35]])*1.4,kf(q,[[0,.9],[.12,1.05],[.36,1.02],[1,.9]]));break}
  case'swirl':{g.save();g.globalAlpha=.55;g.translate(X,Y);g.scale(.62,1);g.rotate(p*2*Math.PI);g.drawImage(swirl(),-d/2,-d/2,d,d);g.restore();break}
  case'beam':{const a=kf(p,KF.beam)*DEG;g.save();g.translate(X,Y);g.rotate(a);g.globalAlpha=kf(p,[[0,.5],[.5,.8],[1,.5]]);const gr=g.createLinearGradient(0,0,d,0);gr.addColorStop(0,'rgba(255,240,200,.45)');gr.addColorStop(1,'rgba(255,240,200,0)');g.fillStyle=gr;g.beginPath();g.moveTo(0,-d*.005);g.lineTo(d,-d*.05);g.lineTo(d,d*.05);g.lineTo(0,d*.005);g.fill();g.restore();break}
  case'dish':{const im=getImg(f.src);if(!im)break;const w=f.z*W,h=f.h*bx.height,ox=X+w*.55,oy=Y+h*.6;g.save();g.globalAlpha=1;g.translate(ox,oy);g.rotate(kf(p,KF.dishR)*DEG);g.scale(kf(p,KF.dish),1);g.drawImage(im,-w*.55,-h*.6,w,h);g.restore();break}
  case'b6':B6.draw(g,f,bx,t,B6H);break;
  case'part':{const e=f.e,x=bx.left+e.x*W,y=bx.top+e.y*bx.height,w=e.w*W,h=e.h*bx.height;
   if(e.a==='drill'||e.a==='belt'){const m=getImg(f.src);if(!m)break;const sw=Math.min(256,Math.max(8,Math.ceil(w*Math.min(2,cam.s*DPR())))),sh=Math.min(512,Math.max(8,Math.ceil(h*sw/w)));const k=sw/w;const s2=scratch(sw,sh);
    if(e.a==='belt')stripes(s2,sw,sh,e.ang||0,20*k,((t+f.ph)/.9%1)*20*k,[[0,9*k,'rgba(0,0,0,0)'],[9*k,13*k,'rgba(0,0,0,.55)'],[13*k,15*k,'rgba(255,255,255,.22)']]);
    else stripes(s2,sw,sh,70,14*k,((t+f.ph)/.45%1)*14*k,[[5*k,7*k,'rgba(255,255,255,.32)'],[7*k,11*k,'rgba(0,0,0,.38)']]);
    s2.globalCompositeOperation='destination-in';s2.drawImage(m,0,0,sw,sh);g.globalAlpha=1;g.drawImage(scr,0,0,sw,sh,x,y,w,h);break}
   const im=getImg(f.src);if(!im)break;const P=(t+f.ph);const px=x+(e.px||.5)*w,py=y+(e.py||.5)*h;g.save();g.globalAlpha=1;g.translate(px,py);
   if(e.a==='crane_tower')g.scale(kf(P/16,KF.slew),1);else if(e.a==='crane_luff')g.rotate(kf(P/11,KF.luff)*DEG);else if(e.a==='turret')g.rotate(kf(P/8.1,KF.tur)*DEG);else if(e.a==='scope')g.rotate(kf(P/18,KF.sc)*DEG);
   g.drawImage(im,x-px,y-py,w,h);
   if(e.a==='turret'){const q=(P/8.1)%1;if(q>.33&&q<.365){g.globalAlpha=q<.345?1:.5;const D=w*.26*1.1;g.drawImage(G.weld(),x-px+w*.04-D/2,y-py+h*.06-D/2,D,D)}}
   g.restore();break}}
}
// ---- Umgebung ----
const FALLS=[];let ENV=null;
function envInit(){if(ENV||!window.ENVD)return;const D=ENVD;ENV={stars:(LITE?D.stars.slice(0,30):D.stars).map(([x,y])=>({x,y,d:R(2.5,6),ph:R(0,6)})),
 cryst:D.cryst.map(([tx,ty,a,cx,cy,s],i)=>({tx,ty,cx,cy,s:Math.max(70,s*2.2),gl:i<10,d:R(5,10),ph:R(0,10)})),mush:D.mush.map(([x,y,w,h,n])=>({x,y,w,h,src:'assets/plat/fx/'+n,d:R(5.5,8),ph:R(0,6)})),
 clouds:Array.from({length:7},(_,i)=>({x:-500+i*560,y:1820+(i%2)*170,d:R(40,70),ph:R(0,60)})),motes:Array.from({length:LITE?10:22},()=>({x:R(500,2500),y:R(400,1750),d:R(14,26),ph:R(0,26)})),shots:[],nextS:0,nextP:0};
 for(const [x,y,w,h,n] of D.falls){if(h<(LITE?80:50))continue;FALLS.push({x,y,w,h,src:'assets/plat/fx/'+n,a:R(1.6,2.2),b:R(2.6,3.4),c:null,spray:h>110})}}
function drawEnv(g,t,V,now){const E=ENV;if(!E)return;const anim=!RM();
 // Himmel
 if(vis(V,0,0,3000,420)){if(!LITE&&vis(V,1300,-260,1100,520)){const u=Math.sin(t/60*Math.PI);g.globalAlpha=1;g.drawImage(G.neb(),1300+u*130,-260,1100*(1+.06*(u+1)),520)}
  const u=.5-.5*Math.cos(t/9*2*Math.PI);g.globalAlpha=.35+.45*u;g.drawImage(G.core(),1729-130,88-75,260,150);
  for(const s of E.stars){if(!vis(V,s.x-6,s.y-6,12,12))continue;const v=.5-.5*Math.cos((t+s.ph)/s.d*2*Math.PI);g.globalAlpha=.15+.85*v;const D=14*(.6+.55*v);g.drawImage(G.star(),s.x-D/2,s.y-D/2,D,D)}
  if(anim){if(now>E.nextS){E.nextS=now+R(7000,15000);if(E.nextS-now<99999&&E.shots.length<3)E.shots.push({k:'s',x:R(300,2600),y:R(10,200),a:R(14,30)*DEG,t0:now})}
   if(now>E.nextP){E.nextP=now+R(22000,38000);E.shots.push({k:'p',ltr:Math.random()<.5,y:R(60,330),t0:now})}}
  E.shots=E.shots.filter(o=>{const q=(now-o.t0)/(o.k==='s'?1400:24000);if(q>1)return false;g.save();
   if(o.k==='s'){g.translate(o.x,o.y);g.rotate(o.a);g.translate(520*q,0);g.globalAlpha=q<.15?q/.15:1-(q-.15)/.85;const gr=g.createLinearGradient(-220*(.3+.7*q),0,0,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(255,255,255,.95)');g.fillStyle=gr;g.fillRect(-220*(.3+.7*q),-1.5,220*(.3+.7*q),3)}
   else{const x=o.ltr?-60+3120*q:3060-3120*q,y=o.y+(o.ltr?-60*q:-40+50*q);g.globalAlpha=.85;g.drawImage(G.star(),x-14,y-10,28,20);g.fillStyle='#dfe9ff';g.fillRect(x-8,y-2.5,16,5)}
   g.restore();return true})}
 // Wasserfälle (Streifen + Maske, je Fall ein kleines Canvas)
 for(const f of FALLS){if(!vis(V,f.x,f.y,f.w,f.h+40))continue;const st=getImg('assets/plat/fx/streak.png'),m=getImg(f.src);if(!st||!m)continue;
  if(!f.c){f.c=document.createElement('canvas');f.c.width=f.w;f.c.height=f.h}const c=f.c.getContext('2d');c.globalCompositeOperation='source-over';c.clearRect(0,0,f.w,f.h);c.globalAlpha=1;
  const o1=((t/f.a)%1)*320,o2=((t/f.b)%1)*480;for(let x=0;x<f.w;x+=120)for(let y=-320+o1;y<f.h;y+=320)c.drawImage(st,x,y,120,320);c.globalAlpha=.6;for(let x=0;x<f.w;x+=180)for(let y=-480+o2;y<f.h;y+=480)c.drawImage(st,x,y,180,480);
  c.globalAlpha=1;c.globalCompositeOperation='destination-in';c.drawImage(m,0,0,f.w,f.h);g.globalAlpha=.7;g.drawImage(f.c,f.x,f.y);
  if(f.spray){const u=.5-.5*Math.cos((t+f.x)/4*2*Math.PI);const w=Math.max(80,f.w*1.3)*(.9+.25*u);g.globalAlpha=.35+.4*u;g.drawImage(G.spray(),f.x+f.w/2-w/2,f.y+f.h-10-30,w,60*(.8+.3*u))}}
 // Pilzbäume
 for(const m of E.mush){if(!vis(V,m.x,m.y,m.w,m.h))continue;const im=getImg(m.src);if(!im)continue;const a=Math.sin((t+m.ph)/m.d*2*Math.PI)*.9*DEG;g.save();g.globalAlpha=1;g.translate(m.x+m.w/2,m.y+m.h*.92);g.rotate(a);g.drawImage(im,-m.w/2,-m.h*.92,m.w,m.h);g.restore()}
 // Kristalle
 for(const c of E.cryst){if(c.gl&&vis(V,c.cx-c.s/2,c.cy-c.s/2,c.s,c.s)){const u=.5-.5*Math.cos((t+c.ph)/4.5*2*Math.PI);g.globalAlpha=.3+.55*u;g.drawImage(G.cg(),c.cx-c.s/2,c.cy-c.s/2,c.s,c.s)}
  if(vis(V,c.tx-22,c.ty-22,44,44)){const q=((t+c.ph)/c.d)%1;if(q>.82&&q<.94){const a=q<.88?(q-.82)/.06:1-(q-.88)/.06;const D=44*(.2+.8*a);g.save();g.globalAlpha=a;g.translate(c.tx,c.ty);g.rotate((q-.82)*3);g.drawImage(G.white(),-D/2,-D/2,D,D);g.fillStyle='rgba(255,255,255,.9)';g.fillRect(-D/2,-.8,D,1.6);g.fillRect(-.8,-D/2,1.6,D);g.restore()}}}
 // Staub
 for(const m of E.motes){const q=((t+m.ph)/m.d)%1;const x=m.x+240*q,y=m.y-70*q;if(!vis(V,x-4,y-4,8,8))continue;g.globalAlpha=q<.15?q/.15*.7:q<.85?.7-.2*(q-.15)/.7:.5*(1-(q-.85)/.15);g.fillStyle='rgba(255,236,205,.8)';g.fillRect(x-2.5,y-2.5,5,5)}
 // Wolken
 const cl=getImg('assets/plat/fx/cloud.webp');if(cl)for(const c of E.clouds){const x=c.x+Math.sin((t+c.ph)/c.d*Math.PI)*160;if(!vis(V,x,c.y,1000,420))continue;g.globalAlpha=.5;g.drawImage(cl,x,c.y,1000,420)}
 g.globalAlpha=1}
// ---- Hintergrund (Kacheln je nach Zoom, nur sichtbare) ----
function drawBg(g,V){const need=cam.s*DPR();const low=getImg('assets/plat/low.webp');if(low)g.drawImage(low,0,0,WW,WH);
 const lev=need>1.15?2:need>.45?1:0;const want=new Set();
 const L=(n,pre)=>{const tw=WW/n,th=WH/n;for(let r=0;r<n;r++)for(let c=0;c<n;c++){if(!vis(V,c*tw,r*th,tw,th))continue;const src=`assets/plat/${pre}_${r}_${c}.webp`;want.add(src);const im=getImg(src);if(im)g.drawImage(im,c*tw,r*th,tw+.5,th+.5);else if(pre==='h'){const ms=`assets/plat/m_${Math.floor(r/2)}_${Math.floor(c/2)}.webp`;const o=IMG.get(ms);if(o&&o.bmp){o.used=1;g.drawImage(o.bmp,(c%2)*375,(r%2)*281.25,375,281.25,c*tw,r*th,tw+.5,th+.5)}}}};
 if(lev>=1)L(4,'m');if(lev>=2)L(8,'h')}
// ---- Zeichnen ----
let lastT=0,hidT=0,ghostSp=null;
function frame(now){requestAnimationFrame(frame);if(!root)return;
 const on=root.offsetParent!==null&&root.style.display!=='none'&&!document.hidden;
 if(!on){if(!hidT)hidT=now;else if(now-hidT>1500&&cv.width){freeAll()}return}hidT=0;
 const anim=!RM();if(!dirty&&(!anim||now-lastT<(LITE?32:15)))return;lastT=now;dirty=0;
 const d=DPR(),W=Math.round(vw()*d),H=Math.round(vh()*d);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;cv.style.width=vw()+'px';cv.style.height=vh()+'px'}
 ctx=ctx||cv.getContext('2d',{alpha:false});const g=ctx;g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.fillStyle='#120c22';g.fillRect(0,0,W,H);
 g.setTransform(d*cam.s,0,0,d*cam.s,d*cam.x,d*cam.y);g.imageSmoothingEnabled=true;g.imageSmoothingQuality=LITE?'medium':'high';
 const V=view(0),V2=view(60),t=anim?now/1000:0;for(const o of IMG.values())o.used=0;
 drawBg(g,V);envInit();drawEnv(g,t,V2,now);
 // Gebäude
 const P=B2.placing;for(const b of order){const g2=b.g;if(!vis(V2,g2.left,g2.top,g2.width,g2.height))continue;
  const f=foot(b.id,b.y);g.globalAlpha=1;g.drawImage(G.sh(),b.x-f*.62,b.y-f*.24,f*1.24,f*.62);
  const im=getImg(b.src,b.maxW);if(im){g.globalAlpha=1;g.drawImage(im,g2.left,g2.top,g2.width,g2.height)}
  if(im)for(const fx of b.fx){if(fx.t==='part'||fx.under)drawFx(g,fx,g2,t)}
  if(im&&anim)for(const fx of b.fx)if(fx.t!=='part'&&!fx.under)drawFx(g,fx,g2,t)}
 // Geist (Platzierung)
 if(P&&ghostSp){const f=foot(P.id,P.y);const gg=geo(P.id,P.x,P.y,ghostSp);const im=getImg(ghostSp.src,ghostSp.maxW);g.globalAlpha=.85;if(im)g.drawImage(im,gg.left,gg.top,gg.width,gg.height);g.globalAlpha=1;
  g.strokeStyle=P.ok?'rgba(80,255,140,.95)':'rgba(255,70,70,.95)';g.lineWidth=4;g.beginPath();g.ellipse(P.x,P.y,f/2,f/4,0,0,7);g.stroke()}
 g.globalAlpha=1;
 // ungenutzte Bilder freigeben (nur wenn nicht gerade geladen)
 sweep(k=>IMG.get(k)&&!IMG.get(k).bmp&&!IMG.get(k).err)}
// ---- Gebäude-Zustand ----
function maxW(sp,id,y){const [W,,,,ow]=sp.m;const ww=W*foot(id,y)/ow;return Math.ceil(ww*maxS()*DPR())}
function render(){ensureDom();const p=pl();if(ensurePos(p))save();const ids=list(p);const out=[];
 for(const id of ids){if(B2.placing&&B2.placing.move&&B2.placing.id===id)continue;const lv=lvOf(p,id),busy=busyOf(p,id);const state=busy&&!lv?'new':busy?'up':'done';const pos=p.pos[id];if(!pos)continue;
  const sp=sprite(p,id,lv,state);if(!sp)continue;const k=sp.src+pos.x+','+pos.y+state;let b=els[id];
  if(!b||b.k!==k){b=els[id]={id,k,x:pos.x,y:pos.y,src:sp.src,g:geo(id,pos.x,pos.y,sp),fx:fxList(sp.k,sp.tn,state),state,maxW:maxW(sp,id,pos.y)}}
  b.busy=busy;out.push(b)}
 for(const id in els)if(!out.includes(els[id]))delete els[id];
 order=out.sort((a,b)=>a.y-b.y);pills();drawGhost();dirty=1}
// Timer-Pillen: wenige DOM-Elemente in Bildschirmkoordinaten
function pills(){const busy=order.filter(b=>b.busy&&b.busy.end);const have=new Map([...ui.children].map(e=>[e.dataset.id,e]));
 for(const b of busy){let e=have.get(b.id);if(!e){e=document.createElement('div');e.className='b2pill';e.dataset.id=b.id;e.innerHTML='<span class="b2t"></span><div class="b2ring"><i></i></div>';ui.appendChild(e)}have.delete(b.id);
  const t=e.querySelector('.b2t'),bar=e.querySelector('.b2ring i');if(t.dataset.end!=String(b.busy.end)){t.dataset.end=b.busy.end;bar.dataset.pstart=b.busy.start;bar.dataset.pend=b.busy.end}e._w=[b.x,b.g.top+b.g.height*.08]}
 for(const e of have.values())e.remove();placeUi()}
function placeUi(){if(!ui)return;for(const e of ui.children){const w=e._w;if(!w)continue;e.style.transform=`translate(${(cam.x+w[0]*cam.s).toFixed(1)}px,${(cam.y+w[1]*cam.s).toFixed(1)}px) translate(-50%,-100%)`}
 const h=root.querySelector('#b2hint');if(h&&h._w){const [x,y,w,hh]=h._w;Object.assign(h.style,{left:cam.x+x*cam.s+'px',top:cam.y+y*cam.s+'px',width:w*cam.s+'px',height:hh*cam.s+'px'})}}
// Treffer: oberstes Gebäude unter dem Finger (Alpha des Sprites geprüft)
const hc=document.createElement('canvas');hc.width=hc.height=1;const hctx=hc.getContext('2d',{willReadFrequently:true});
function hitAt(sx,sy){const wx=(sx-cam.x)/cam.s,wy=(sy-cam.y)/cam.s;for(let i=order.length-1;i>=0;i--){const b=order[i],g=b.g;if(wx<g.left||wx>g.left+g.width||wy<g.top||wy>g.top+g.height)continue;
  const f=foot(b.id,b.y);if(((wx-b.x)/(f*.5))**2+((wy-b.y)/(f*.25))**2<=1)return b.id;
  const o=IMG.get(b.src);if(!o||!o.bmp)return b.id;try{hctx.clearRect(0,0,1,1);hctx.drawImage(o.bmp,(wx-g.left)/g.width*o.bmp.width,(wy-g.top)/g.height*o.bmp.height,1,1,0,0,1,1);if(hctx.getImageData(0,0,1,1).data[3]>40)return b.id}catch(e){return b.id}}return null}
// ---------- Platzierung ----------
function drawGhost(){const bar=root.querySelector('#b2bar');const P=B2.placing;root.classList.toggle('placing',!!P);dirty=1;if(!P){ghostSp=null;bar.style.display='none';return}
 const p=pl();const lv=lvOf(p,P.id);const sp=sprite(p,P.id,lv,P.move?(lv?'done':'new'):'new')||sprite(p,P.id,1,'done');ghostSp={...sp,src:sp.src.replace('_nod','').replace('_b.webp','.webp')};ghostSp.maxW=maxW(sp,P.id,P.y);bar.style.display='flex';
 P.ok=fits(p,P.id,P.x,P.y);root.querySelector('#b2ok').disabled=!P.ok;
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
   const r0=root.getBoundingClientRect();const hb=e.target===cv?hitAt(e.clientX-r0.left,e.clientY-r0.top):null;st.hb=hb;clearTimeout(lpT);if(hb&&!B2.placing)lpT=setTimeout(()=>{moved=true;navigator.vibrate&&navigator.vibrate(20);B2.startPlace(hb,true)},520)}
  else if(pts.size===2){clearTimeout(lpT);moved=true;drag=false;const [a,b]=[...pts.values()];const r=root.getBoundingClientRect();pinch={d:Math.hypot(a.x-b.x,a.y-b.y),s:cam.s,mx:(a.x+b.x)/2-r.left,my:(a.y+b.y)/2-r.top};pinch.wx=(pinch.mx-cam.x)/cam.s;pinch.wy=(pinch.my-cam.y)/cam.s}});
 root.addEventListener('pointermove',e=>{const q=pts.get(e.pointerId);if(!q)return;const dx=e.clientX-q.x,dy=e.clientY-q.y;q.x=e.clientX;q.y=e.clientY;
  if(pts.size===1){if(Math.hypot(e.clientX-st.x,e.clientY-st.y)>8){moved=true;clearTimeout(lpT)}if(!moved)return;
   if(drag&&B2.placing){const w=W(e);B2.placing.x=Math.round((w.x+st.ox)/10)*10;B2.placing.y=Math.round((w.y+st.oy)/10)*10;drawGhost();return}
   cam.x+=dx;cam.y+=dy;apply();const n=performance.now(),dt=Math.max(1,n-lt);lt=n;vel={x:dx/dt*16,y:dy/dt*16}}
  else if(pts.size===2&&pinch){const [a,b]=[...pts.values()];const r=root.getBoundingClientRect();const mx=(a.x+b.x)/2-r.left,my=(a.y+b.y)/2-r.top;cam.s=Math.max(minS(),Math.min(maxS(),pinch.s*Math.hypot(a.x-b.x,a.y-b.y)/pinch.d));cam.x=mx-pinch.wx*cam.s;cam.y=my-pinch.wy*cam.s;apply()}});
 const up=e=>{if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);clearTimeout(lpT);if(pts.size===1){pinch=null;const q=[...pts.values()][0];st={x:q.x,y:q.y,t:performance.now()};lt=st.t;return}if(pts.size)return;pinch=null;
  if(!moved){const tgt=st.tgt;const b=st.hb;const r=root.getBoundingClientRect();const sx=e.clientX-r.left,sy=e.clientY-r.top;const n=performance.now();
   if(B2.placing){if(!drag){const w=W(e);B2.placing.x=Math.round(w.x/10)*10;B2.placing.y=Math.round(w.y/10)*10;drawGhost()}return}
   if(tgt&&tgt.closest&&tgt.closest('#b2hint')){openPanel('padbuild',0);return}
   if(b){openPanel('bld',b);return}
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
 if(h.dataset.k!==s.x+','+s.y){h.dataset.k=s.x+','+s.y;h._w=[s.x-f/2,s.y-f/4,f,f/2];B2.focus(s.x,s.y)}placeUi();h.classList.add('on');return h};
B2.hintOff=()=>{if(root)root.querySelector('#b2hint').classList.remove('on')};B2.hitAt=(x,y)=>hitAt(x,y);B2.els=()=>order.map(b=>({id:b.id,x:b.x,y:b.y,g:b.g}));
// renderBase umleiten
const _rb=window.renderBase;
window.renderBase=function(){if(B2.on()){const pn=$('#pano');if(pn)pn.style.display='none';ensureDom();root.style.display='';if(!document.body.classList.contains('cp-guided'))B2.hintOff();render();if(typeof renderQueues==='function')renderQueues()}else{if(root)root.style.display='none';const pn=$('#pano');if(pn)pn.style.display='';_rb()}};
})();
