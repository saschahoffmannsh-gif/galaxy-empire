// WebGL2-Renderer der Galaxie: 8 Kacheln (5120×2880, Real-ESRGAN ×4), Mipmaps, Farbvariante per Shader (statt CSS-Filter),
// prozeduraler Nebel-/Staub-Detail-Layer ab hohem Zoom.
(function(){
const GW=1280,GH=720;const R={ok:false};window.GXGL=R;
const VS=`#version 300 es
in vec2 p;in vec2 t;uniform vec3 cam;uniform vec2 vp;out vec2 uv;out vec2 wp;
void main(){vec2 s=(p*cam.z+cam.xy);wp=p;uv=t;gl_Position=vec4(s.x/vp.x*2.-1.,1.-s.y/vp.y*2.,0.,1.);}`;
const FS=`#version 300 es
precision highp float;in vec2 uv;in vec2 wp;uniform sampler2D tx;uniform mat3 hm;uniform float det;out vec4 o;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
float fb(vec2 p){return n(p)*.5+n(p*2.1+3.)*.27+n(p*4.3+7.)*.15+n(p*8.7+1.)*.08;}
void main(){vec3 c=texture(tx,uv).rgb;c=clamp(hm*c,0.,1.)*.93;
 if(det>0.){float l=dot(c,vec3(.3,.55,.15));float d1=fb(wp*.18),d2=fb(wp*.55+11.);
  c*=1.+det*((d1-.5)*.30+(d2-.5)*.16)*(.4+l);
  c=mix(c,c*c*1.25+c*.1,det*.18);}
 o=vec4(c,1.);}`;
function hueMat(deg,sat){const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
 const m=[.213+c*.787-s*.213,.715-c*.715-s*.715,.072-c*.072+s*.928,.213-c*.213+s*.143,.715+c*.285+s*.140,.072-c*.072-s*.283,.213-c*.213-s*.787,.715-c*.715+s*.715,.072+c*.928+s*.072];
 const L=[.213,.715,.072];const out=[];for(let r=0;r<3;r++)for(let k=0;k<3;k++)out[r*3+k]=m[r*3+k]*sat+L[k]*(1-sat)*(1)+(0);
 // saturation: mix with luminance row
 for(let r=0;r<3;r++)for(let k=0;k<3;k++)out[r*3+k]=sat*m[r*3+k]+(1-sat)*L[k];
 return new Float32Array([out[0],out[3],out[6],out[1],out[4],out[7],out[2],out[5],out[8]])}
R.init=function(cv){const gl=cv.getContext('webgl2',{antialias:false,alpha:false,powerPreference:'high-performance'});if(!gl)return false;
 const sh=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(x);return x};
 try{const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);
  R.gl=gl;R.pr=pr;R.u={cam:gl.getUniformLocation(pr,'cam'),vp:gl.getUniformLocation(pr,'vp'),hm:gl.getUniformLocation(pr,'hm'),det:gl.getUniformLocation(pr,'det'),tx:gl.getUniformLocation(pr,'tx')};
  R.buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,R.buf);const lp=gl.getAttribLocation(pr,'p'),lt=gl.getAttribLocation(pr,'t');
  gl.enableVertexAttribArray(lp);gl.enableVertexAttribArray(lt);gl.vertexAttribPointer(lp,2,gl.FLOAT,false,16,0);gl.vertexAttribPointer(lt,2,gl.FLOAT,false,16,8);
  R.tiles=[];const aniso=gl.getExtension('EXT_texture_filter_anisotropic');
  for(let j=0;j<2;j++)for(let i=0;i<4;i++){const t={i,j,tex:null};R.tiles.push(t);const im=new Image();im.onload=()=>{const tx=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tx);
    let src=im;if(document.documentElement.classList.contains('lite')){const c=document.createElement('canvas');c.width=im.naturalWidth>>1;c.height=im.naturalHeight>>1;c.getContext('2d').drawImage(im,0,0,c.width,c.height);src=c}gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,src);if(src!==im){src.width=src.height=0}im.src='';gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);if(aniso)gl.texParameterf(gl.TEXTURE_2D,aniso.TEXTURE_MAX_ANISOTROPY_EXT,4);
    t.tex=tx;R.loaded=(R.loaded||0)+1;R.onload&&R.onload()};im.src=`assets/gal/t${j}${i}.webp`}
  R.cv=cv;R.ok=true;return true}catch(e){console.warn('Galaxie-GL aus:',e);return false}};
const vm=(v,x,y)=>{if(v===1)x=GW-x;if(v===2){x=GW-x;y=GH-y}if(v===3)y=GH-y;return[x,y]};
R.draw=function(cam,g,hue,sat,det,lo){if(!R.ok)return;const gl=R.gl,cv=R.cv;const d=Math.min(2,devicePixelRatio||1);const W=cv.clientWidth,H=cv.clientHeight;
 if(cv.width!==Math.round(W*d)||cv.height!==Math.round(H*d)){cv.width=Math.round(W*d);cv.height=Math.round(H*d)}
 gl.viewport(0,0,cv.width,cv.height);gl.clearColor(0.008,0.012,0.04,1);gl.clear(gl.COLOR_BUFFER_BIT);
 gl.uniform3f(R.u.cam,cam.x*d,cam.y*d,cam.k*d);gl.uniform2f(R.u.vp,cv.width,cv.height);gl.uniformMatrix3fv(R.u.hm,false,hueMat(hue,sat));gl.uniform1f(R.u.det,det);gl.uniform1i(R.u.tx,0);gl.activeTexture(gl.TEXTURE0);
 const v=(g-1)%4;const tw=GW/4,th=GH/2;
 for(const t of R.tiles){if(!t.tex)continue;const x0=t.i*tw,y0=t.j*th,x1=x0+tw,y1=y0+th;
  const c=[[x0,y0,0,0],[x1,y0,1,0],[x0,y1,0,1],[x1,y1,1,1]].map(([x,y,u,w])=>{const [X,Y]=vm(v,x,y);return[X,Y,u,w]});
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(c.flat()),gl.DYNAMIC_DRAW);gl.bindTexture(gl.TEXTURE_2D,t.tex);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)}};
})();
