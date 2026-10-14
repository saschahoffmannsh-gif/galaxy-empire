// Basis-Atmosphäre: ein WebGL-Pass über dem sichtbaren Ausschnitt des Panoramas.
// Wind in Vegetation (UV-Versatz, maskiert, Spitzen stärker als Fuß), ziehende Wolkenschatten in Bodenperspektive,
// Nebel in den Tälern, Himmelsschleier, Kristall-Glitzern, Glühwürmchen, Vögel und ferner Schiffsverkehr.
// Maske assets/ambient_m.png: R=Vegetation (Schwankgewicht), G=Talnebel, B=Kristalle. Ohne WebGL bleibt das Bild statisch.
(function(){
const PW=2360,PH=800;
const VS='attribute vec2 p;varying vec2 uv;void main(){uv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';
const FS=`precision mediump float;uniform sampler2D tex,msk;uniform float t;uniform vec2 off,sz;varying vec2 uv;
const vec2 PS=vec2(${PW}.,${PH}.);
float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1.,0.)),f.x),mix(h1(i+vec2(0.,1.)),h1(i+1.),f.x),f.y);}
float fb(vec2 p){return n(p)*.5+n(p*2.03+7.1)*.3+n(p*4.01+3.3)*.2;}
float seg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float k=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*k);}
vec3 ship(vec2 p,float sp,float y,float ph,float sc,vec3 c){float x=mod(t*sp+ph,2900.)-270.;float dir=sign(sp);vec2 q=(p-vec2(x,y+sin(t*.3+ph)*3.))/sc;q.x*=dir;
 float body=smoothstep(1.,.55,length(q*vec2(.14,.6)));float top=smoothstep(.2,-.6,q.y);
 vec3 col=mix(vec3(.10,.10,.14),vec3(.55,.5,.55),top*.6);
 float tr=smoothstep(0.,-1.,q.x+7.)*exp(-q.y*q.y*1.6)*exp((q.x+7.)*.035);float eng=exp(-dot(q-vec2(-7.,0.),q-vec2(-7.,0.))*.9);
 float nav=exp(-dot(q-vec2(2.,-1.6),q-vec2(2.,-1.6))*3.)*step(.82,fract(t*.9+ph));
 c=mix(c,col,body*.92);c+=vec3(.45,.75,1.)*(tr*.32+eng*1.1);c+=vec3(1.,.35,.3)*nav*.8;return c;}
vec3 bird(vec2 p,vec2 o,float s,float ph,vec3 c){vec2 q=(p-o)/s;float fl=sin(t*7.+ph)*.9;
 float d=min(seg(q,vec2(0.),vec2(-1.,-.25-fl*.6)),seg(q,vec2(0.),vec2(1.,-.25-fl*.6)));
 return mix(c,vec3(.12,.1,.13),smoothstep(.22,.06,d)*.85);}
void main(){vec2 p=off+uv*sz;vec2 tu=p/PS;vec3 m=texture2D(msk,tu).rgb;
 float gust=.55+.45*sin(t*.55+p.x*.0035)*sin(t*.23+p.x*.0011+1.);
 float ph=n(p*.045)*6.28;float sw=(sin(t*1.7+ph+p.x*.02)*.7+sin(t*2.9+ph*1.6)*.3)*gust;
 vec2 d=vec2(sw*1.9,abs(sw)*.35)*m.r;
 vec3 c=texture2D(tex,(p+d)/PS).rgb;
 float sky=clamp((240.-p.y)/45.,0.,1.);float gnd=clamp((p.y-300.)/130.,0.,1.);
 // Wolkenschatten in Bodenperspektive
 float dd=max(p.y-232.,10.);vec2 gp=vec2((p.x-1180.)/dd*26.,4200./dd);
 float cs=fb(gp*.016+vec2(t*.05,t*.012));cs=smoothstep(.48,.72,cs);
 c*=mix(1.,1.-.24*cs,gnd)*mix(1.,1.045,gnd*(1.-cs));
 // Talnebel
 float f=fb(vec2(p.x*.0065-t*.025,p.y*.03)+fb(p*.012+vec2(t*.02,0.))*1.6);
 c=mix(c,vec3(.95,.88,.9),m.g*smoothstep(.32,.82,f)*.55);
 // Himmelsschleier
 float w=fb(vec2(p.x*.0028-t*.006,p.y*.016+t*.002));c=mix(c,vec3(1.,.84,.9),sky*smoothstep(.5,.85,w)*.22);
 // Kristalle: Puls + Funkeln
 float hc=h1(floor(p/4.));float tw=pow(max(0.,sin(t*2.3+hc*60.)),30.)*step(.86,hc);
 c+=m.b*(vec3(.35,.5,1.)*.08*(.5+.5*sin(t*1.2+p.x*.015))+vec3(.85,.95,1.)*tw*1.6);
 // Glühwürmchen
 if(p.y>380.){vec2 cl=floor(p/46.);float hh=h1(cl+3.);if(hh>.86){vec2 ctr=cl*46.+23.+vec2(sin(t*.6+hh*40.),cos(t*.43+hh*23.))*13.;float r=length(p-ctr);
  float bl=.5+.5*sin(t*(1.2+hh)+hh*30.);c+=vec3(1.,.9,.45)*exp(-r*r*.35)*bl*.9+vec3(1.,.8,.3)*exp(-r*r*.03)*bl*.05;}}
 // Ferner Verkehr und Vögel
 if(p.y<300.){c=ship(p,38.,150.,0.,1.2,c);c=ship(p,-26.,205.,1300.,.8,c);c=ship(p,55.,118.,2100.,1.6,c);
  float bx=mod(t*22.,3000.)-300.;for(int i=0;i<5;i++){float fi=float(i);c=bird(p,vec2(bx-fi*14.-abs(fi-2.)*4.,260.+abs(fi-2.)*7.+sin(t*.5+fi)*2.),5.5,fi*1.3,c);}}
 gl_FragColor=vec4(c,1.);}`;
const A={ok:false};window.AMBIENT=A;
function load(src){return new Promise((r,j)=>{const i=new Image();i.onload=()=>r(i);i.onerror=j;i.src=src})}
A.init=async function(world){try{
 const cv=document.createElement('canvas');cv.id='ambcv';const gl=cv.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,powerPreference:'low-power',preserveDrawingBuffer:false});if(!gl)return;
 const [ti,mi]=await Promise.all([load($('#terrain').currentSrc||'assets/base_pano3.webp'),load('assets/ambient_m.png')]);
 const sh=(ty,s)=>{const o=gl.createShader(ty);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(o);return o};
 const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);
 const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 const loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
 [ti,mi].forEach((img,u)=>{const tx=gl.createTexture();gl.activeTexture(gl.TEXTURE0+u);gl.bindTexture(gl.TEXTURE_2D,tx);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img);
  for(const [k,v] of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v)});
 gl.uniform1i(gl.getUniformLocation(pr,'tex'),0);gl.uniform1i(gl.getUniformLocation(pr,'msk'),1);
 Object.assign(A,{ok:true,cv,gl,ut:gl.getUniformLocation(pr,'t'),uo:gl.getUniformLocation(pr,'off'),us:gl.getUniformLocation(pr,'sz')});
 cv.addEventListener('webglcontextlost',e=>{e.preventDefault();A.ok=false;cv.style.display='none'});$('#terrain').after(cv);A.place();$('#pano').addEventListener('scroll',()=>A.place(),{passive:true});requestAnimationFrame(loop)}catch(e){console.warn('Ambient-Shader aus:',e)}};
// Leinwand deckt nur den sichtbaren Ausschnitt ab (Welt-Koordinaten), Auflösung = Geräte-Pixel (max. 1,5; adaptiv runter auf 1,0 bei langsamen Frames).
A.place=function(){if(!A.ok)return;const pano=$('#pano'),wd=$('#world');const s=window.panoS||1;const y0=window.PANO_Y0v||60;
 const x0=Math.max(0,(pano.scrollLeft-wd.offsetLeft)/s-2),w=Math.min(PW-x0,pano.clientWidth/s+4),hgt=Math.min(PH-y0,pano.clientHeight/s);
 Object.assign(A.cv.style,{left:x0+'px',top:y0+'px',width:w+'px',height:hgt+'px'});A.box=[x0,y0,w,hgt];
 const d=Math.min(A.q||1.5,devicePixelRatio||1);const cw=Math.round(w*s*d),ch=Math.round(hgt*s*d);if(A.cv.width!==cw||A.cv.height!==ch){A.cv.width=cw;A.cv.height=ch;A.gl.viewport(0,0,cw,ch);draw(performance.now())}A.dirty=1};
const t0=performance.now();let last=0,prev=0;const dts=[];
function loop(now){requestAnimationFrame(loop);const pano=document.getElementById('pano');if(document.hidden||!pano||pano.classList.contains('paused'))return;
 if(prev&&!pano.classList.contains('paused')){dts.push(now-prev);if(dts.length>90){dts.shift();if(!A.q||A.q>1){const m=dts.slice().sort((a,b)=>a-b)[45];if(m>34){A.q=1;dts.length=0;A.place();document.body.classList.add('lowfx')}}}}prev=now;
 if(now-last<31&&!A.dirty)return;last=now;A.dirty=0;draw(now)}
function draw(now){if(!A.ok)return;const gl=A.gl,[x0,y0,w,h]=A.box;
 gl.uniform1f(A.ut,((now-t0)/1000)%3000);gl.uniform2f(A.uo,x0,y0);gl.uniform2f(A.us,w,h);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)}
})();
