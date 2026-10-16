'use strict';
// v66: Gebäude-Animationen Stufe 3 – ausgeschnittene Teile, Leuchtmasken, Partikel. Ein Canvas (base2), keine DOM-Ebenen.
(function(){
const D=window.B6D||{};const DEG=Math.PI/180,TAU=Math.PI*2;
const fr=x=>x-Math.floor(x);
const hash=n=>fr(Math.sin(n*127.1+311.7)*43758.5453);
const ease=u=>u*u*(3-2*u);
// weiche Keyframes [[p,v]...]
function kf(p,K){p=fr(p);for(let i=1;i<K.length;i++)if(p<=K[i][0]){const a=K[i-1],b=K[i];return a[1]+(b[1]-a[1])*ease((p-a[0])/Math.max(1e-6,b[0]-a[0]))}return K[K.length-1][1]}
// kleine Leucht-Sprites
const GC={};function gl(name,stops,n){if(GC[name])return GC[name];const c=document.createElement('canvas');c.width=c.height=n||64;const g=c.getContext('2d');const h=c.width/2;const r=g.createRadialGradient(h,h,0,h,h,h);for(const [o,col] of stops)r.addColorStop(o,col);g.fillStyle=r;g.fillRect(0,0,c.width,c.width);return GC[name]=c}
const SP={
 ember:()=>gl('em',[[0,'rgba(255,250,220,1)'],[.18,'rgba(255,200,90,.95)'],[.45,'rgba(255,110,20,.35)'],[1,'rgba(255,80,0,0)']]),
 spark:()=>gl('sk',[[0,'#fff'],[.15,'rgba(255,245,200,.95)'],[.4,'rgba(255,170,60,.4)'],[1,'rgba(255,140,40,0)']]),
 cyan:()=>gl('cy6',[[0,'rgba(235,255,255,1)'],[.2,'rgba(120,240,255,.85)'],[.5,'rgba(40,170,255,.25)'],[1,'rgba(40,170,255,0)']]),
 red:()=>gl('rd6',[[0,'rgba(255,235,230,1)'],[.2,'rgba(255,70,60,.9)'],[.5,'rgba(255,30,30,.25)'],[1,'rgba(255,0,0,0)']]),
 green:()=>gl('gn6',[[0,'rgba(240,255,240,1)'],[.2,'rgba(90,255,120,.85)'],[.5,'rgba(40,220,90,.25)'],[1,'rgba(0,200,60,0)']]),
 purple:()=>gl('pu6',[[0,'rgba(255,240,255,1)'],[.2,'rgba(220,120,255,.85)'],[.5,'rgba(160,60,255,.25)'],[1,'rgba(140,40,255,0)']]),
 blue:()=>gl('bu6',[[0,'rgba(240,245,255,1)'],[.2,'rgba(120,160,255,.85)'],[.5,'rgba(70,100,255,.25)'],[1,'rgba(60,80,255,0)']]),
 white:()=>gl('wh6',[[0,'rgba(255,255,255,1)'],[.25,'rgba(230,240,255,.6)'],[.6,'rgba(200,220,255,.12)'],[1,'rgba(200,220,255,0)']]),
 warm:()=>gl('wa6',[[0,'rgba(255,240,200,.9)'],[.35,'rgba(255,190,110,.35)'],[1,'rgba(255,160,80,0)']]),
 smoke:()=>gl('sm6',[[0,'rgba(222,220,226,.62)'],[.35,'rgba(196,194,204,.42)'],[.7,'rgba(170,168,182,.12)'],[1,'rgba(160,160,175,0)']],96),
 steam:()=>gl('st6',[[0,'rgba(250,252,255,.75)'],[.4,'rgba(236,242,250,.45)'],[.75,'rgba(225,232,245,.1)'],[1,'rgba(225,232,245,0)']],96),
 dark:()=>gl('dk6',[[0,'rgba(60,52,50,.55)'],[.45,'rgba(70,60,58,.3)'],[1,'rgba(70,60,58,0)']],96),
 dust:()=>gl('du6',[[0,'rgba(214,176,128,.55)'],[.5,'rgba(200,160,115,.22)'],[1,'rgba(200,160,115,0)']],96),
 shadow:()=>gl('sh6',[[0,'rgba(20,10,5,.45)'],[.6,'rgba(20,10,5,.15)'],[1,'rgba(20,10,5,0)']])};
let swC=null;function SW(){if(swC)return swC;const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.translate(128,128);
 for(let a=0;a<3;a++)for(let i=0;i<70;i++){const u=i/70;const r=8+u*120;const ang=a*TAU/3+u*5.2;g.fillStyle=`rgba(${200+55*(1-u)|0},${225+30*(1-u)|0},255,${.35*(1-u)+.08})`;g.beginPath();g.arc(Math.cos(ang)*r,Math.sin(ang)*r,3+u*10,0,TAU);g.fill()}
 return swC=c}
const COL={cyan:'120,235,255',orange:'255,170,70',red:'255,80,70',green:'110,255,140',purple:'215,120,255',blue:'130,165,255',white:'240,246,255',gold:'255,215,120'};
// Zeitliche Wellenformen
function wave(kind,p,ph){switch(kind){
 case'flick':return .55+.25*Math.sin(p*17.3+ph)+.2*Math.sin(p*7.1+ph*2);
 case'beat':{const q=fr(p);return q<.1?q/.1:q<.2?1-(q-.1)/.1*.6:q<.3?.4+(q-.2)/.1*.5:q<.5?.9-(q-.3)/.2*.9:0}
 case'blink':return fr(p)<.5?1:.08;
 default:return .5-.5*Math.cos(p*TAU)}}
// Zwischenspeicher pro Ebene (Masken-Animationen werden nur so groß wie nötig gerendert)
function cacheCv(f,w,h){let c=f._c;if(!c){c=f._c=document.createElement('canvas')}if(c.width!==w||c.height!==h){c.width=w;c.height=h}return c}
// ---------- Effekte ----------
function draw(g,f,bx,t,H){const L=f.L,W=bx.width,Hh=bx.height,act=f.act||1;const X=bx.left+(L.x||0)*W,Y=bx.top+(L.y||0)*Hh,w=(L.w||0)*W,h=(L.h||0)*Hh;const sp=(L.sp||1)*act;const T=t*sp+(f.ph||0);
 switch(L.fx){
 case'pulse':{const im=H.img(H.src(L.f));if(!im)return;const a=(L.a0!=null?L.a0:.15)+(L.a1!=null?L.a1:.75)*wave(L.wv,T/(L.d||3),f.ph);g.save();g.globalCompositeOperation='lighter';g.globalAlpha=Math.max(0,Math.min(1,a));g.drawImage(im,X,Y,w,h);g.restore();return}
 case'flow':case'shim':{const im=H.img(H.src(L.f));if(!im)return;
  const k=Math.min(1.25,H.scale);const cw=Math.max(8,Math.min(H.lite?220:340,Math.ceil(w*k))),ch=Math.max(8,Math.min(H.lite?220:340,Math.ceil(h*k)));
  const step=H.lite?1/20:1/40;const tq=Math.floor(t/step);const c=cacheCv(f,cw,ch);
  if(f._t!==tq||f._k!==cw){f._t=tq;f._k=cw;const x=c.getContext('2d');x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-over';x.clearRect(0,0,cw,ch);
   const ang=(L.ang||0)*DEG;const Lg=Math.hypot(cw,ch);x.save();x.translate(cw/2,ch/2);x.rotate(ang);
   const per=(L.per||.22)*Lg,off=fr(T/(L.d||2))*per;const rgb=COL[L.col]||L.col||COL.white;
   if(L.fx==='shim'){const q=fr(T/(L.d||5));const pos=-Lg*.8+q*Lg*2.6;const bw=(L.bw||.18)*Lg;const gr=x.createLinearGradient(pos-bw,0,pos+bw,0);gr.addColorStop(0,`rgba(${rgb},0)`);gr.addColorStop(.5,`rgba(${rgb},${L.a||.9})`);gr.addColorStop(1,`rgba(${rgb},0)`);x.fillStyle=gr;x.fillRect(-Lg,-Lg,2*Lg,2*Lg)}
   else{for(let p=-Lg-per+off;p<Lg;p+=per){const gr=x.createLinearGradient(p,0,p+per,0);gr.addColorStop(0,`rgba(${rgb},0)`);gr.addColorStop(.55,`rgba(${rgb},${L.a||.8})`);gr.addColorStop(.7,`rgba(${rgb},${(L.a||.8)*.25})`);gr.addColorStop(1,`rgba(${rgb},0)`);x.fillStyle=gr;x.fillRect(p,-Lg,per,2*Lg)}}
   x.restore();x.globalCompositeOperation='destination-in';x.drawImage(im,0,0,cw,ch)}
  g.save();g.globalCompositeOperation='lighter';g.globalAlpha=L.ga||1;g.drawImage(c,X,Y,w,h);g.restore();return}
 case'swirl':{// rotierende Wirbeltextur in einer Maske (Portal)
  const im=H.img(H.src(L.f));if(!im)return;const k=Math.min(1.1,H.scale);const cw=Math.max(8,Math.min(H.lite?200:320,Math.ceil(w*k))),ch=Math.max(8,Math.min(H.lite?200:320,Math.ceil(h*k)));
  const tq=Math.floor(t*(H.lite?20:40));const c=cacheCv(f,cw,ch);
  if(f._t!==tq||f._k!==cw){f._t=tq;f._k=cw;const x=c.getContext('2d');x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-over';x.clearRect(0,0,cw,ch);
   const ccx=((L.cx-L.x)/L.w)*cw,ccy=((L.cy-L.y)/L.h)*ch;const R=Math.max(cw,ch)*.75;
   for(let j=0;j<2;j++){x.save();x.translate(ccx,ccy);x.scale(1,ch/cw*.95);x.rotate(T*TAU/(L.d||7)*(j?-.6:1));x.globalAlpha=j?.5:.9;x.drawImage(SW(),-R,-R,2*R,2*R);x.restore()}
   x.globalCompositeOperation='destination-in';x.drawImage(im,0,0,cw,ch)}
  g.save();g.globalCompositeOperation='lighter';g.globalAlpha=L.a||.7;g.drawImage(c,X,Y,w,h);g.restore();return}
 case'embers':case'glints':case'bubbles':case'sparks':{const P=L.pts;if(!P||!P.length)return;const n=Math.max(1,Math.round((L.n||12)*(H.lite?.55:1)*(act>1?1.4:1)));const im=SP[L.sp2||(L.fx==='glints'?'white':L.fx==='bubbles'?'cyan':'ember')]();const S=(L.s||.012)*W;
  g.save();g.globalCompositeOperation='lighter';
  for(let i=0;i<n;i++){const life=L.d||2.2;const u=T/life+i*.61803;const cyc=Math.floor(u),q=fr(u);const p=P[Math.floor(hash(i*13.7+cyc*7.3)*P.length)];const sx=bx.left+p[0]*W,sy=bx.top+p[1]*Hh;
   if(L.fx==='glints'){if(q>.3)continue;const a=Math.sin(q/.3*Math.PI);const D=S*(1.2+2.5*a);g.globalAlpha=a;g.drawImage(im,sx-D/2,sy-D/2,D,D);g.fillStyle=`rgba(255,255,255,${a*.8})`;g.fillRect(sx-D*.9,sy-S*.07,D*1.8,S*.14);g.fillRect(sx-S*.07,sy-D*.9,S*.14,D*1.8);continue}
   const rise=(L.rise||.18)*Hh,dr=(hash(i*3.1+cyc)-.5)*(L.drift||.06)*W+(L.wind||0)*W*q;
   let x=sx+dr*q,y=sy-rise*q;if(L.fx==='sparks'){const vx=(hash(i*5.7+cyc*1.3)-.5)*(L.spread||.12)*W,vy=-(.4+hash(i*2.9+cyc))*rise*1.6;x=sx+vx*q;y=sy+vy*q+rise*2.6*q*q}
   const a=(q<.12?q/.12:1-(q-.12)/.88)*(L.a||1);const D=S*(L.fx==='bubbles'?1+q:1.6-q*.8);g.globalAlpha=Math.max(0,a);g.drawImage(im,x-D/2,y-D/2,D,D)}
  g.restore();return}
 case'smoke':{// Rauchfahne aus Punkt (L.x,L.y); Wind nach rechts oben
  const n=H.lite?5:8;const im=SP[L.sp2||'smoke']();const S=(L.s||.06)*W;g.save();
  for(let i=0;i<n;i++){const q=fr(T/(L.d||6)+i/n);const gr=1+q*(L.grow||3.2);const D=S*gr;const x=X+(L.wind!=null?L.wind:.08)*W*q*q+Math.sin((q*3+i)*1.7)*S*.15,y=Y-(L.rise||.32)*Hh*q;
   const a=(q<.1?q/.1:1-Math.pow((q-.1)/.9,.8))*(L.a||.85);g.globalAlpha=Math.max(0,a);g.drawImage(im,x-D/2,y-D*.5,D,D*.82)}
  g.restore();return}
 case'flame':{// flackernde Flamme an Spitze
  const a=wave('flick',T*1.3,f.ph);g.save();g.globalCompositeOperation='lighter';const D=(L.s||.03)*W;
  for(let i=0;i<3;i++){const q=fr(T*1.6+i/3);const y=Y-D*1.4*q,s=D*(1.25-q*.7)*(.85+.3*a);g.globalAlpha=(1-q)*.9;g.drawImage(SP.ember(),X-s/2+Math.sin(T*9+i)*D*.12,y-s/2,s,s*1.35)}
  g.globalAlpha=.18+.2*a;const gw=D*2.6;g.drawImage(SP.warm(),X-gw/2,Y-gw*.62,gw,gw);g.restore();return}
 case'arcs':{// Blitze zwischen Punkten
  const P=L.pts;if(!P||P.length<2)return;const step=Math.floor(T*11);const n=L.n||2;g.save();g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
  for(let i=0;i<n;i++){const r=hash(step*3.3+i*9.1);if(r<(L.gap||.35))continue;const a=P[0],b=P[1+Math.floor(hash(step+i*5.5)*(P.length-1))];const ax=bx.left+a[0]*W,ay=bx.top+a[1]*Hh,bx2=bx.left+b[0]*W,by=bx.top+b[1]*Hh;
   const seg=8;const pts=[[ax,ay]];const len=Math.hypot(bx2-ax,by-ay);for(let s=1;s<seg;s++){const u=s/seg;const j=(hash(step*1.7+i*3+s*11.3)-.5)*len*.22*Math.sin(u*Math.PI);pts.push([ax+(bx2-ax)*u-(by-ay)/len*j,ay+(by-ay)*u+(bx2-ax)/len*j])}pts.push([bx2,by]);
   for(const [lw,al] of [[W*.012,.18],[W*.005,.55],[W*.0018,1]]){g.globalAlpha=al*(L.a||1);g.strokeStyle=`rgba(${COL[L.col]||COL.cyan},1)`;if(al===1)g.strokeStyle='#fff';g.lineWidth=lw;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(const p of pts)g.lineTo(p[0],p[1]);g.stroke()}
   const D=W*.05;g.globalAlpha=.8;g.drawImage(SP[L.col==='blue'?'blue':'cyan'](),bx2-D/2,by-D/2,D,D)}
  g.restore();return}
 case'ring':{// rotierende Ellipsenringe (Holo/Plasma)
  const cx=X,cy=Y,rx=(L.rx||.1)*W,ry=rx*(L.flat||.32);g.save();g.globalCompositeOperation='lighter';const rgb=COL[L.col]||COL.cyan;const k=L.k||2;
  for(let j=0;j<k;j++){const yo=(L.dy||0)*Hh*(j-(k-1)/2);const rot=T*TAU/(L.d||4)*(j%2?-1:1);g.lineWidth=Math.max(.6,W*.004);
   for(let s=0;s<3;s++){const a0=rot+s*TAU/3;g.strokeStyle=`rgba(${rgb},${.75*(L.a||1)})`;g.beginPath();g.ellipse(cx,cy+yo,rx*(1-j*.18),ry*(1-j*.18),0,a0,a0+TAU/6);g.stroke()}
   for(let s=0;s<(L.dots||2);s++){const a=rot*1.3+s*TAU/(L.dots||2);const x=cx+Math.cos(a)*rx*(1-j*.18),y=cy+yo+Math.sin(a)*ry*(1-j*.18);const D=W*.028*(Math.sin(a)>0?1.15:.75);g.globalAlpha=Math.sin(a)>0?1:.55;g.drawImage(SP[L.col]?SP[L.col]():SP.cyan(),x-D/2,y-D/2,D,D)}g.globalAlpha=1}
  g.restore();return}
 case'beam':{// Suchscheinwerfer / Scanner-Kegel
  const a=kf(T/(L.d||8),L.K||[[0,-150],[.5,-30],[1,-150]])*DEG;const len=(L.len||.6)*W,sp2=(L.wd||.1);g.save();g.translate(X,Y);g.scale(1,L.flat||.55);g.rotate(a);g.globalCompositeOperation='lighter';
  const gr=g.createLinearGradient(0,0,len,0);const rgb=COL[L.col]||COL.white;gr.addColorStop(0,`rgba(${rgb},${.5*(L.a||1)})`);gr.addColorStop(.6,`rgba(${rgb},${.18*(L.a||1)})`);gr.addColorStop(1,`rgba(${rgb},0)`);g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.lineTo(len,-len*sp2);g.quadraticCurveTo(len*1.04,0,len,len*sp2);g.closePath();g.fill();g.restore();
  if(L.src){const D=W*.04;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.9;g.drawImage(SP[L.col==='white'?'white':L.col||'white'](),X-D/2,Y-D/2,D,D);g.restore()}return}
 case'sweep':{// Radar-Sweep (Kreissektor am Boden)
  const r=(L.r||.2)*W;g.save();g.translate(X,Y);g.scale(1,L.flat||.5);const a=T*TAU/(L.d||4);g.globalCompositeOperation='lighter';const rgb=COL[L.col]||COL.green;
  for(let i=0;i<10;i++){g.globalAlpha=(1-i/10)*.22*(L.a||1);g.fillStyle=`rgba(${rgb},1)`;g.beginPath();g.moveTo(0,0);g.arc(0,0,r,a-(i+1)*.09,a-i*.09);g.closePath();g.fill()}
  g.globalAlpha=.55*(L.a||1);g.strokeStyle=`rgba(${rgb},1)`;g.lineWidth=W*.003;g.beginPath();g.arc(0,0,r*(.4+.6*fr(T/(L.d||4)*2)),0,TAU);g.stroke();g.restore();return}
 case'drones':{// kleine Lastdrohnen über dem Gelände (mit Bodenschatten)
  const n=H.lite?Math.max(1,(L.n||2)-1):(L.n||2);for(let i=0;i<n;i++){const u=T/(L.d||9)+i/n;const px=X+w*(.5+.45*Math.sin(u*TAU+i)),py=Y+h*(.5+.4*Math.sin(u*TAU*2+i*1.7));const alt=(L.alt||.12)*Hh*(1+.15*Math.sin(T*3+i));
   const s=(L.s||.03)*W;g.save();g.globalAlpha=.5;g.drawImage(SP.shadow(),px-s,py-s*.35,s*2,s*.7);g.restore();
   const dy=py-alt;g.save();g.fillStyle='#262a36';g.strokeStyle='#5d6680';g.lineWidth=s*.08;g.beginPath();g.ellipse(px,dy,s*.55,s*.26,0,0,TAU);g.fill();g.stroke();
   g.fillStyle='#3a4256';g.fillRect(px-s*.9,dy-s*.08,s*1.8,s*.12);const rp=fr(T*9+i);g.globalAlpha=.5;g.fillStyle='#b8c4e0';for(const sx of [-1,1]){g.beginPath();g.ellipse(px+sx*s*.9,dy-s*.1,s*.32*(.4+.6*Math.abs(Math.sin(rp*TAU))),s*.08,0,0,TAU);g.fill()}
   g.globalCompositeOperation='lighter';g.globalAlpha=fr(T*1.4+i*.3)<.5?1:.25;const D=s*.7;g.drawImage(SP.red(),px-s*.9-D/2,dy-D/2,D,D);g.globalAlpha=1-g.globalAlpha+.25;g.drawImage(SP.green(),px+s*.9-D/2,dy-D/2,D,D);
   if(L.load){g.globalAlpha=.9;g.drawImage(SP[L.load](),px-D*.6,dy+s*.1,D*1.2,D*1.2)}g.restore()}return}
 case'carts':{// Fördergut entlang einer Strecke (Weltpunkte in Box-Koordinaten)
  const [a,b]=L.pts;const ax=bx.left+a[0]*W,ay=bx.top+a[1]*Hh,bx2=bx.left+b[0]*W,by=bx.top+b[1]*Hh;const n=L.n||5;const s=(L.s||.02)*W;g.save();
  for(let i=0;i<n;i++){const q=fr(T/(L.d||5)+i/n);const x=ax+(bx2-ax)*q,y=ay+(by-ay)*q;const al=q<.08?q/.08:q>.92?(1-q)/.08:1;g.globalAlpha=al;
   g.fillStyle=L.c1||'#6b5a4a';g.beginPath();g.ellipse(x,y,s,s*.6,0,0,TAU);g.fill();g.fillStyle=L.c2||'#a88a6a';g.beginPath();g.ellipse(x-s*.2,y-s*.2,s*.55,s*.32,0,0,TAU);g.fill();
   if(L.glow){g.globalCompositeOperation='lighter';g.globalAlpha=al*.8;const D=s*2.6;g.drawImage(SP[L.glow](),x-D/2,y-D/2,D,D);g.globalCompositeOperation='source-over'}}
  g.restore();return}
 case'blinks':{const P=L.pts||[];g.save();g.globalCompositeOperation='lighter';const D=(L.s||.02)*W;const im=SP[L.col||'red']();
  for(let i=0;i<P.length;i++){const q=fr(T/(L.d||1.6)+i*(L.st!=null?L.st:.37));const a=L.seq?(q<.18?1:.06):(q<.5?.25+1.5*q:1.75-1.5*q);g.globalAlpha=Math.max(0,Math.min(1,a));const x=bx.left+P[i][0]*W,y=bx.top+P[i][1]*Hh;g.drawImage(im,x-D/2,y-D/2,D,D)}g.restore();return}
 case'scan':{// Laserlinie fährt über eine Fläche (Schiff, Bauteil)
  const q=kf(T/(L.d||5),[[0,0],[.5,1],[1,0]]);const ang=(L.ang||0)*DEG;g.save();g.beginPath();g.rect(X,Y,w,h);g.clip();g.translate(X+w/2,Y+h/2);g.rotate(ang);const Lg=Math.hypot(w,h);const pos=-Lg/2+q*Lg;g.globalCompositeOperation='lighter';
  const rgb=COL[L.col]||COL.cyan;const gr=g.createLinearGradient(pos-Lg*.05,0,pos+Lg*.05,0);gr.addColorStop(0,`rgba(${rgb},0)`);gr.addColorStop(.5,`rgba(${rgb},.55)`);gr.addColorStop(1,`rgba(${rgb},0)`);g.fillStyle=gr;g.fillRect(pos-Lg*.05,-Lg,Lg*.1,2*Lg);g.fillStyle=`rgba(${rgb},.9)`;g.fillRect(pos-W*.0015,-Lg,W*.003,2*Lg);g.restore();return}
 // ---- ausgeschnittene Teile ----
 case'part':{const im=H.img(H.src(L.f));if(!im)return;const px=X+(L.px!=null?L.px:.5)*w,py=Y+(L.py!=null?L.py:.5)*h;g.save();g.translate(px,py);
  const m=L.m;const p=T/(L.d||4);
  if(m==='rot')g.rotate(kf(p,L.K||[[0,-4],[.5,4],[1,-4]])*DEG);
  else if(m==='nod')g.rotate(Math.sin(p*TAU)*(L.amp||9)*DEG);
  else if(m==='bob'){g.translate(0,Math.sin(p*TAU)*(L.amp||.04)*Hh);}
  else if(m==='slide'){const u=kf(p,L.K||[[0,0],[.45,1],[.55,1],[1,0]]);g.translate((L.vx||0)*W*u,(L.vy||0)*Hh*u)}
  else if(m==='slew')g.scale(kf(p,L.K||[[0,1],[.2,1],[.45,.7],[.62,.7],[.88,1],[1,1]]),1);
  if(m==='spinA'){// Zahnrad in schräger Ebene: A=[ux,uy,vx,vy] (Einheitskreis -> Ellipse), um (cx,cy) drehen
   g.restore();const A=L.A.map(v=>v*W);const cx=bx.left+L.cx*W,cy=bx.top+L.cy*Hh;g.save();g.translate(cx,cy);g.transform(A[0],A[1],A[2],A[3],0,0);g.beginPath();g.arc(0,0,1,0,TAU);g.clip();
   g.rotate(T*TAU/(L.d||8)*(L.dir||1));const det=A[0]*A[3]-A[2]*A[1];g.transform(A[3]/det,-A[1]/det,-A[2]/det,A[0]/det,0,0);g.drawImage(im,X-cx,Y-cy,w,h);g.restore();return}
  if(m==='spinE'){// Drehung in einer schrägen Ebene: Ellipse (rx,ry,tilt)
   const rx=L.rx*w,ry=L.ry*h,tl=(L.tilt||0)*DEG;g.rotate(tl);g.beginPath();g.ellipse(0,0,rx,ry,0,0,TAU);g.clip();g.scale(rx,ry);g.rotate(T*TAU/(L.d||6)*(L.dir||1));g.scale(1/rx,1/ry);g.rotate(-tl);g.drawImage(im,-(px-X),-(py-Y),w,h);g.restore();return}
  if(m==='sway'||m==='holo'){// hängendes Banner (oben fixiert) / Hologramm (schwebt, flimmert)
   g.translate(-(px-X),-(py-Y));const iw=im.width,ih=im.height;const n=H.lite?8:16;
   if(m==='holo'){const bob=Math.sin(p*TAU)*(L.amp||.01)*Hh;const fl=.88+.12*Math.sin(t*23)*Math.sin(t*7.7);g.globalAlpha=fl;const sx=1+.025*Math.sin(p*TAU*.5);g.translate(w/2,0);g.scale(sx,1);g.translate(-w/2,0);g.drawImage(im,0,bob,w,h);if(fr(t*.7)<.06){g.globalAlpha=.5;g.drawImage(im,w*.02,bob,w,h)}g.restore();return}
   for(let i=0;i<n;i++){const u=i/n,u2=(i+1)/n;const off=Math.sin(T*TAU/(L.d||2.4)-u*3.2+(L.ph2||0))*(L.amp||.02)*W*Math.pow(u,1.3);g.drawImage(im,0,u*ih,iw,(u2-u)*ih+.8,off,u*h,w,(u2-u)*h+.8)}
   g.restore();return}
  if(m==='wave'){// Fahne: senkrechte Streifen, am Mast (links/rechts) fixiert
   const n=H.lite?10:18;const iw=im.width,ih=im.height;const amp=(L.amp||.03)*Hh;for(let i=0;i<n;i++){const u=i/n,u2=(i+1)/n;const k2=L.pole==='r'?1-u:u;const off=Math.sin(T*TAU/(L.d||2.2)-k2*5)*amp*k2;const shade=.92+.08*Math.cos(T*TAU/(L.d||2.2)-k2*5);
     g.globalAlpha=1;g.drawImage(im,u*iw,0,(u2-u)*iw+.6,ih,-(px-X)+u*w,-(py-Y)+off,(u2-u)*w+.6,h);if(shade<.97){g.globalAlpha=(1-shade)*2.2;g.fillStyle='#000';}}
   g.restore();return}
  g.drawImage(im,-(px-X),-(py-Y),w,h);
  if(L.glow){g.globalCompositeOperation='lighter';const a=.4+.4*Math.sin(p*TAU*2);g.globalAlpha=a;const D=Math.max(w,h)*1.4;g.drawImage(SP[L.glow](),-(px-X)+w/2-D/2,-(py-Y)+h/2-D/2,D,D)}
  g.restore();
  if(m==='bob'&&L.shadow){const s=w*.8;const k2=.75+.25*Math.sin(p*TAU+Math.PI);g.save();g.globalAlpha=.4*k2;g.drawImage(SP.shadow(),X+w/2-s/2*k2,bx.top+L.shadow*Hh-s*.15,s*k2,s*.3);g.restore()}
  return}
 }}
// Liste der Ebenen für ein Gebäude (Reihenfolge = Zeichenreihenfolge)
function list(k,tn,state){const d=D[k]&&(D[k][state==='new'?'build':tn]);if(!d||!d.L)return[];const act=state==='up'||state==='new'?1.5:1;
 return d.L.filter(L=>!(L.only==='up'&&state==='done')).map((L,i)=>({t:'b6',L,ph:(i*1.618)%1*7,act,under:L.fx==='part'||L.under}))}
function base(k,tn){const d=D[k]&&D[k][tn];return d&&d.base?'assets/b6/'+d.base:null}
window.B6={list,draw,base,kf};
})();
