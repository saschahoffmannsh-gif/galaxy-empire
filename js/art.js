'use strict';
// Grafik-Hilfen: Bild-Fallbacks (bis die gerenderten Bilder unter assets/img/ liegen), Nebel, Sonne, Sterne
(function(){
const A={cache:{}};
const H=s=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const R=seed=>{let a=seed;return()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296}};
function cat(id){if(GE.SHIP[id])return'ship';if(GE.DEF[id])return'def';if(GE.TECH[id])return'tech';if(GE.BUILD[id])return'build';if(GE.ITEMS[id])return'item';if(GE.COMMANDERS[id])return'cmd';if(id.startsWith('gem_'))return'gem';return'misc'}
const COL={ship:['#38e1ff','#0b3a5a'],def:['#ff9f43','#4a2a0b'],tech:['#b388ff','#2b1650'],build:['#5cf2c4','#0c3d33'],item:['#ffd166','#4a3a0b'],cmd:['#ff6fae','#4a0f2c'],gem:['#fff','#222'],misc:['#38e1ff','#14204a']};
function badge(x,c,col){const g=x.createRadialGradient(128,110,10,128,128,128);g.addColorStop(0,'#1a2846');g.addColorStop(0.7,'#0a1020');g.addColorStop(1,'#04060d');
 x.fillStyle=g;x.beginPath();x.arc(128,128,124,0,7);x.fill();
 const r=x.createLinearGradient(0,0,256,256);r.addColorStop(0,col[0]);r.addColorStop(1,col[1]);x.lineWidth=5;x.strokeStyle=r;x.beginPath();x.arc(128,128,120,0,7);x.stroke();
 x.globalAlpha=.25;x.fillStyle=col[0];for(let i=0;i<40;i++){const a=i*0.157;x.fillRect(128+Math.cos(a)*106-1,128+Math.sin(a)*106-1,2,2)}x.globalAlpha=1;}
function metal(x,y0,y1,c1){const g=x.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'#e8f0fa');g.addColorStop(.45,c1||'#8a9bb3');g.addColorStop(1,'#2a3446');return g}
function glow(x,px,py,r,c){const g=x.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,'#fff');g.addColorStop(.3,c);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.beginPath();x.arc(px,py,r,0,7);x.fill()}
function ship(x,id,col){const r=R(H(id));const big={sc:.7,lc:.85,lf:.65,hf:.75,cr:.85,bs:.95,ic:.95,bo:.9,de:1,dn:1.08,ib:1.12,rc:.85,pr:.45,co:.9,ss:.7}[id]||.8;
 x.save();x.translate(128,128);x.rotate(-Math.PI/4);x.scale(big,big);
 if(id==='ss'){x.fillStyle=metal(x,-20,20,'#5b6f8f');x.fillRect(-12,-12,24,24);for(const s of[-1,1]){const g=x.createLinearGradient(0,-40,0,40);g.addColorStop(0,'#2a6fd6');g.addColorStop(1,'#0b1f4a');x.fillStyle=g;x.fillRect(s>0?16:-86,-34,70,68);x.strokeStyle='rgba(140,200,255,.6)';x.lineWidth=1.5;for(let i=1;i<5;i++){x.beginPath();x.moveTo(s>0?16+i*14:-86+i*14,-34);x.lineTo(s>0?16+i*14:-86+i*14,34);x.stroke()}}glow(x,0,0,14,col[0]);x.restore();return}
 const L=70+r()*25,W=12+r()*10,span=28+r()*40,sweep=10+r()*30,cargo=['sc','lc','rc','co'].includes(id);
 // Triebwerksglühen
 const ne=id==='pr'?1:2+Math.floor(r()*2);for(let i=0;i<ne;i++){const ex=(i-(ne-1)/2)*W*0.9;glow(x,ex,L*0.62+8,18,col[0])}
 x.fillStyle=metal(x,-L,L,'#7f92ad');
 // Flügel
 x.beginPath();x.moveTo(-W*.6,0);x.lineTo(-span-W,sweep+18);x.lineTo(-span-W+6,sweep+30);x.lineTo(-W,L*0.45);x.lineTo(W,L*0.45);x.lineTo(span+W-6,sweep+30);x.lineTo(span+W,sweep+18);x.lineTo(W*.6,0);x.closePath();x.fill();
 x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=1.5;x.stroke();
 // Rumpf
 x.fillStyle=metal(x,-L,L,'#9aaac0');x.beginPath();
 if(cargo){x.moveTo(-W,-L*.55);x.quadraticCurveTo(0,-L*.95,W,-L*.55);x.lineTo(W*1.25,L*.6);x.lineTo(-W*1.25,L*.6);}
 else{x.moveTo(0,-L);x.lineTo(W,-L*.3);x.lineTo(W*1.1,L*.6);x.lineTo(-W*1.1,L*.6);x.lineTo(-W,-L*.3);}
 x.closePath();x.fill();x.stroke();
 if(cargo){x.fillStyle='rgba(20,30,50,.55)';for(let i=0;i<3;i++)x.fillRect(-W*.9,-L*.3+i*L*.28,W*1.8,L*.18)}
 // Panels
 x.strokeStyle='rgba(20,30,50,.6)';x.lineWidth=2;x.beginPath();x.moveTo(0,-L*.7);x.lineTo(0,L*.55);x.stroke();
 if(id==='rc'){x.strokeStyle='#ffc857';x.lineWidth=4;x.beginPath();x.arc(0,-L*.62,W*1.4,Math.PI*1.15,Math.PI*1.85);x.stroke()}
 // Cockpit
 const g=x.createLinearGradient(0,-L*.6,0,-L*.25);g.addColorStop(0,'#bff6ff');g.addColorStop(1,col[0]);x.fillStyle=g;x.beginPath();x.ellipse(0,-L*.42,W*.45,L*.13,0,0,7);x.fill();
 // Akzentlichter
 x.fillStyle=col[0];x.shadowColor=col[0];x.shadowBlur=10;x.fillRect(-span-W+2,sweep+20,4,4);x.fillRect(span+W-6,sweep+20,4,4);x.restore()}
function defense(x,id,col){x.save();x.translate(128,150);
 x.fillStyle=metal(x,0,40,'#5d6b80');x.beginPath();x.ellipse(0,20,78,26,0,0,7);x.fill();x.fillStyle='rgba(0,0,0,.35)';x.beginPath();x.ellipse(0,28,70,18,0,0,7);x.fill();
 if(id==='sdome'||id==='ldome'){const g=x.createRadialGradient(-20,-40,5,0,0,90);g.addColorStop(0,'rgba(220,250,255,.9)');g.addColorStop(.5,'rgba(80,200,255,.35)');g.addColorStop(1,'rgba(40,120,255,.15)');x.fillStyle=g;x.beginPath();x.arc(0,10,id==='ldome'?82:66,Math.PI,0);x.closePath();x.fill();x.strokeStyle='rgba(160,230,255,.7)';x.lineWidth=2;x.stroke();x.restore();return}
 x.fillStyle=metal(x,-50,20,'#8796ac');x.beginPath();x.moveTo(-40,15);x.lineTo(-30,-25);x.lineTo(30,-25);x.lineTo(40,15);x.closePath();x.fill();
 x.beginPath();x.arc(0,-28,28,Math.PI,0);x.fill();
 const n={rl:2,ll:1,hl:1,gauss:1,ionc:0,plasmat:1}[id];const len={rl:50,ll:60,hl:70,gauss:90,plasmat:80}[id]||60;
 x.save();x.translate(0,-34);x.rotate(-0.6);for(let i=0;i<n;i++){x.fillStyle=metal(x,-6,6,'#6b7a90');x.fillRect(-8+i*(n>1?12:0)-(n>1?6:0),-len,10,len);glow(x,-3+i*(n>1?12:0)-(n>1?6:0),-len,10,col[0])}x.restore();
 if(id==='ionc'||id==='plasmat'){glow(x,0,-30,30,id==='ionc'?'#4fc3ff':'#ff4fd8')}
 x.restore()}
function tech(x,id,col){const r=R(H(id));x.save();x.translate(128,128);glow(x,0,0,46,col[0]);
 x.strokeStyle=col[0];x.lineWidth=2.5;for(let i=0;i<3;i++){x.save();x.rotate(i*1.05+r());x.globalAlpha=.8;x.beginPath();x.ellipse(0,0,78,26,0,0,7);x.stroke();x.restore()}
 x.fillStyle='#fff';x.font='bold 40px system-ui';x.textAlign='center';x.textBaseline='middle';x.shadowColor=col[0];x.shadowBlur=16;x.fillText(GE.TECH[id]?GE.TECH[id].n.slice(0,2):'?',0,2);x.restore()}
function building(x,id,col){x.save();x.translate(128,140);const r=R(H(id));
 x.fillStyle='#16202e';x.beginPath();x.moveTo(-80,20);x.lineTo(0,58);x.lineTo(80,20);x.lineTo(0,-18);x.closePath();x.fill();
 const h=40+r()*40;const left=x.createLinearGradient(-60,0,0,0);left.addColorStop(0,'#5e6d84');left.addColorStop(1,'#8494ab');
 x.fillStyle=left;x.beginPath();x.moveTo(-55,15);x.lineTo(0,40);x.lineTo(0,40-h);x.lineTo(-55,15-h);x.fill();
 x.fillStyle='#3d4a5e';x.beginPath();x.moveTo(55,15);x.lineTo(0,40);x.lineTo(0,40-h);x.lineTo(55,15-h);x.fill();
 x.fillStyle='#a8b6c9';x.beginPath();x.moveTo(-55,15-h);x.lineTo(0,40-h);x.lineTo(55,15-h);x.lineTo(0,-10-h);x.fill();
 x.fillStyle=col[0];x.shadowColor=col[0];x.shadowBlur=12;for(let i=0;i<4;i++)x.fillRect(-46+i*11,10-h*.5+i*5,6,4);glow(x,0,-10-h-6,16,col[0]);x.restore()}
function gem(x,colr){x.save();x.translate(128,128);glow(x,0,0,80,colr);const pts=[[0,-70],[52,-28],[40,52],[0,74],[-40,52],[-52,-28]];
 const g=x.createLinearGradient(-50,-70,50,70);g.addColorStop(0,'#fff');g.addColorStop(.4,colr);g.addColorStop(1,'#111');x.fillStyle=g;x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();x.fill();
 x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=2;x.stroke();x.beginPath();x.moveTo(-52,-28);x.lineTo(0,-8);x.lineTo(52,-28);x.moveTo(0,-8);x.lineTo(0,74);x.moveTo(-40,52);x.lineTo(0,-8);x.lineTo(40,52);x.globalAlpha=.5;x.stroke();x.restore()}
function item(x,id,col){x.save();x.translate(128,132);x.fillStyle=metal(x,-50,50,'#7c6a3a');x.beginPath();x.roundRect(-58,-44,116,88,12);x.fill();x.strokeStyle=col[0];x.lineWidth=3;x.stroke();
 x.fillStyle='rgba(0,0,0,.35)';x.fillRect(-58,-6,116,12);glow(x,0,0,26,{armor:'#c9a36b',energy:'#ffe066',power:'#5cf2c4',engine:'#38e1ff'}[id.replace(/\d/,'')]||col[0]);
 x.fillStyle='#fff';x.font='bold 26px system-ui';x.textAlign='center';x.fillText('Lv'+id.slice(-1),0,36);x.restore()}
function cmd(x,id,col){x.save();x.translate(128,140);const g=x.createLinearGradient(0,-80,0,80);g.addColorStop(0,'#3b4a66');g.addColorStop(1,'#0e1424');x.fillStyle=g;
 x.beginPath();x.arc(0,-30,40,0,7);x.fill();x.beginPath();x.moveTo(-70,70);x.quadraticCurveTo(-60,10,0,10);x.quadraticCurveTo(60,10,70,70);x.fill();
 x.fillStyle=col[0];x.shadowColor=col[0];x.shadowBlur=14;x.fillRect(-26,-36,52,8);x.beginPath();x.moveTo(-14,30);x.lineTo(0,18);x.lineTo(14,30);x.lineTo(0,50);x.fill();x.restore()}
A.make=function(id){if(A.cache[id])return A.cache[id];const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');const k=cat(id);const col=k==='gem'?[GE.GEMS[id.slice(4)].col,'#111']:COL[k];
 if(k==='gem'){gem(x,col[0])}else{badge(x,k,col);({ship,def:defense,tech,build:building,item,cmd}[k]||tech)(x,id,col)}
 return A.cache[id]=c.toDataURL('image/png')};
A.fb=function(el){el.onerror=null;el.dataset.osrc=el.getAttribute('src');const id=el.dataset.fb;if(id==='nebula')el.src=A.nebula();else if(id==='sun')el.src=A.sun();else el.src=A.make(id);el.classList.add('fb')};
A.PORTRAIT=new Set(['commander','technocrat','admiral','geologist','engineer','guider','aries','pilot']);
A.img=(id,cls='')=>`<img class="gi ${A.PORTRAIT.has(id)?'portrait':''} ${cls}" src="assets/img/${id}.png" data-fb="${id}" onerror="ART.fb(this)" alt="" draggable="false">`;
A.planetSrc=t=>t==='moon'?'assets/p2/mondgrau.webp':t&&t.startsWith('p2_')?`assets/p2/${t.slice(3)}.webp`:`assets/p/${t}.webp`;
A.nebula=function(){if(A.cache._neb)return A.cache._neb;const c=document.createElement('canvas');c.width=c.height=360;const x=c.getContext('2d');const r=R(99);
 x.globalCompositeOperation='lighter';const cols=['rgba(160,80,255,','rgba(56,225,255,','rgba(255,90,200,','rgba(90,120,255,'];
 for(let i=0;i<70;i++){const px=180+(r()-.5)*220,py=180+(r()-.5)*160,rad=30+r()*90;const g=x.createRadialGradient(px,py,0,px,py,rad);const cc=cols[i%4];g.addColorStop(0,cc+(0.10+r()*0.1)+')');g.addColorStop(1,cc+'0)');x.fillStyle=g;x.beginPath();x.arc(px,py,rad,0,7);x.fill()}
 for(let i=0;i<120;i++){x.fillStyle=`rgba(255,255,255,${r()*.8})`;const s=r()*1.6;x.fillRect(180+(r()-.5)*260,180+(r()-.5)*200,s,s)}
 glow(x,180,175,26,'rgba(200,170,255,.8)');return A.cache._neb=c.toDataURL()};
A.sun=function(){if(A.cache._sun)return A.cache._sun;const c=document.createElement('canvas');c.width=c.height=400;const x=c.getContext('2d');
 let g=x.createRadialGradient(200,200,0,200,200,200);g.addColorStop(0,'rgba(255,250,230,1)');g.addColorStop(.25,'rgba(255,210,120,1)');g.addColorStop(.36,'rgba(255,150,40,.9)');g.addColorStop(.6,'rgba(255,100,20,.25)');g.addColorStop(1,'rgba(255,80,0,0)');x.fillStyle=g;x.fillRect(0,0,400,400);
 x.globalCompositeOperation='lighter';const r=R(5);for(let i=0;i<60;i++){const a=r()*7,l=90+r()*90;x.strokeStyle=`rgba(255,200,120,${.05+r()*.08})`;x.lineWidth=1+r()*3;x.beginPath();x.moveTo(200+Math.cos(a)*60,200+Math.sin(a)*60);x.lineTo(200+Math.cos(a)*l,200+Math.sin(a)*l);x.stroke()}
 return A.cache._sun=c.toDataURL()};
A.stars=function(cv){const d=devicePixelRatio||1;cv.width=innerWidth*d;cv.height=innerHeight*d;const x=cv.getContext('2d');const r=R(3);
 const g=x.createRadialGradient(cv.width*.7,cv.height*.3,0,cv.width*.7,cv.height*.3,cv.width*.8);g.addColorStop(0,'#13183a');g.addColorStop(.5,'#070a1a');g.addColorStop(1,'#020308');x.fillStyle=g;x.fillRect(0,0,cv.width,cv.height);
 x.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const px=r()*cv.width,py=r()*cv.height,rad=(100+r()*250)*d;const gg=x.createRadialGradient(px,py,0,px,py,rad);gg.addColorStop(0,i%2?'rgba(120,60,255,.10)':'rgba(40,200,255,.07)');gg.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gg;x.fillRect(0,0,cv.width,cv.height)}
 for(let i=0;i<700;i++){const s=r()*1.5*d;x.fillStyle=`rgba(${200+r()*55|0},${210+r()*45|0},255,${r()*.9})`;x.fillRect(r()*cv.width,r()*cv.height,s,s)}};
window.ART=A;
})();
