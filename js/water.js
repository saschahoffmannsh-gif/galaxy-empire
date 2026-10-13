// Wasser-Animation: WebGL-Fragment-Shader nur auf maskierten Bereichen (Fluss, Wasserfall, See).
// Maske: R = Wasser, G = Wasserfall, B = Gischt. Ohne WebGL bleibt das statische Bild sichtbar.
(function(){
const REG=[{id:'r1',x:0,y:330,w:600,h:230,flow:[-1,0.42],lake:0},{id:'r2',x:1540,y:316,w:480,h:100,flow:[0,0],lake:1}];
const VS='attribute vec2 p;varying vec2 uv;void main(){uv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';
const FS=`precision mediump float;uniform sampler2D tex,msk;uniform float t,lake;uniform vec2 sz,flow;varying vec2 uv;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+1.),f.x),f.y);}
float fb(vec2 p){return n(p)*.55+n(p*2.07+1.7)*.3+n(p*4.13+3.1)*.15;}
float wav(vec2 q){vec2 fl=flow*t*.55;vec2 lk=lake*vec2(t*.05,t*.035);return fb(q-fl+lk)*.6+fb(q*1.8-fl*1.4+vec2(5.2,1.3)-lk*1.3)*.4;}
void main(){vec4 m=texture2D(msk,uv);if(m.a<.004)discard;vec2 px=uv*sz;
 vec2 q=vec2(px.x,px.y*(lake>.5?3.6:2.6))/(lake>.5?26.:18.);
 float a=wav(q);vec2 nr=vec2(a-wav(q+vec2(.22,0.)),a-wav(q+vec2(0.,.22)))*4.;
 vec4 c=texture2D(tex,uv+nr*vec2(.004,.010)*m.r*(lake>.5?.7:1.));
 float sp=pow(clamp(-nr.x*.6-nr.y*.8+.15,0.,1.),5.)*(lake>.5?.55:.85);
 c.rgb+=vec3(1.,.86,.62)*sp*m.r;c.rgb+=(a-.5)*.07*m.r;
 if(m.g>.01){float s=fb(vec2(px.x/3.2,px.y/38.-t*1.7));float s2=fb(vec2(px.x/6.5,px.y/16.-t*2.4)+3.);
  vec3 cf=texture2D(tex,uv+vec2((s2-.5)*.004,(s-.5)*.012)).rgb;c.rgb=mix(c.rgb,mix(cf,vec3(.94,.97,1.),smoothstep(.5,.85,s*.55+s2*.55)*.5),m.g);}
 if(m.b>.01){float fo=fb(px/5.+vec2(t*.7,-t*.45))*fb(px/12.-vec2(t*.35,t*.6));c.rgb=mix(c.rgb,vec3(.95,.97,1.),smoothstep(.16,.42,fo)*m.b*.85);}
 gl_FragColor=vec4(c.rgb*m.a,m.a);}`;
const W={items:[],s:1,run:false};window.WATER=W;
function load(src){return new Promise((r,j)=>{const i=new Image();i.onload=()=>r(i);i.onerror=j;i.src=src})}
function sh(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(s);return s}
function texOf(gl,img,unit){const t=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
 for(const [k,v] of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);return t}
W.init=async function(host){try{
 for(const r of REG){const cv=document.createElement('canvas');cv.className='watercv';Object.assign(cv.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px'});
  const gl=cv.getContext('webgl',{premultipliedAlpha:true,alpha:true,antialias:false,powerPreference:'low-power'});if(!gl)return;
  const [ti,mi]=await Promise.all([load(`assets/water/${r.id}.jpg`),load(`assets/water/${r.id}m.png`)]);
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl,gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl,gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);texOf(gl,ti,0);texOf(gl,mi,1);
  gl.uniform1i(gl.getUniformLocation(pr,'tex'),0);gl.uniform1i(gl.getUniformLocation(pr,'msk'),1);
  gl.uniform2f(gl.getUniformLocation(pr,'sz'),r.w,r.h);gl.uniform2f(gl.getUniformLocation(pr,'flow'),r.flow[0],r.flow[1]);gl.uniform1f(gl.getUniformLocation(pr,'lake'),r.lake);
  W.items.push({r,cv,gl,ut:gl.getUniformLocation(pr,'t')});host.appendChild(cv)}
 W.resize(W.s);if(!W.run){W.run=true;requestAnimationFrame(loop)}}catch(e){console.warn('Wasser-Shader aus:',e)}};
W.resize=function(s){W.s=s;const d=Math.min(2,devicePixelRatio||1);for(const it of W.items){const w=Math.round(it.r.w*s*d),h=Math.round(it.r.h*s*d);if(it.cv.width!==w||it.cv.height!==h){it.cv.width=w;it.cv.height=h;it.gl.viewport(0,0,w,h);it.dirty=1}}};
const t0=performance.now();
function loop(now){requestAnimationFrame(loop);const pano=document.getElementById('pano');if(document.hidden||!pano||pano.classList.contains('paused'))return;
 const vw=innerWidth;for(const it of W.items){const b=it.cv.getBoundingClientRect();if(b.right<0||b.left>vw)continue;const gl=it.gl;
  gl.uniform1f(it.ut,(now-t0)/1000);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)}}
})();
