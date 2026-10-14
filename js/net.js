'use strict';
// v30: Mehrspieler Stufe 1 – Login (Name+PIN+Einladung), Spielstand-Sync, gemeinsame Galaxie, Rangliste mit echten Spielern + NPC-Spielern.
// Ohne Anmeldung bleibt alles Einzelspieler (eigener Spielstand-Schlüssel, nichts wird gesendet).
(function(){
const GS=()=>{try{return S}catch(e){return null}};const LS='ge_mp';let cfg=null;try{cfg=JSON.parse(localStorage.getItem(LS)||'null')}catch(e){}
const NET={on:!!(cfg&&cfg.token&&cfg.url),cfg:cfg||{},uni:null,lastSync:0,lastSave:0,err:null,DEFAULT_URL:window.GE_SERVER_URL||'https://wlujgkbtpjxuekwsgnmg.supabase.co/functions/v1/ge'};
window.NET=NET;
if(NET.on){window.NET_KEY='ge_mp_save_'+String(cfg.name).toLowerCase();if(window.ENGINE)ENGINE.mp=true;try{const u=JSON.parse(localStorage.getItem('ge_mp_uni')||'null');if(u)NET.uni=u}catch(e){}}
const api=async(path,opt={})=>{const url=(opt.url||NET.cfg.url).replace(/\/+$/,'')+'/api/'+path;const h={'content-type':'application/json'};if(NET.cfg.token&&!opt.noauth)h.authorization='Bearer '+NET.cfg.token;
 const r=await fetch(url,{method:opt.body?'POST':'GET',headers:h,body:opt.body?JSON.stringify(opt.body):undefined,keepalive:!!opt.keepalive});let j=null;try{j=await r.json()}catch(e){}
 if(!r.ok)throw new Error((j&&j.error)||('HTTP '+r.status));return j};
NET.api=api;
// gzip + base64
async function zip(str){const cs=new CompressionStream('gzip');const b=await new Response(new Blob([str]).stream().pipeThrough(cs)).arrayBuffer();let s='';const u=new Uint8Array(b);for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s)}
async function unzip(b64){const bin=atob(b64);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).text()}
NET.zip=zip;NET.unzip=unzip;
// neuer Spielstand im Mehrspieler: Heimat-Koordinaten + Tempo vom Server
NET.initNew=function(S){const h=NET.cfg.home;const pl=S.planets[S.home];S.seed=NET.cfg.seed||4242;if(h){pl.g=h[0];pl.s=h[1];pl.p=h[2];const np=ENGINE.npcAt(pl.g,pl.s);while(np.includes(pl.p))pl.p=pl.p%12+3;pl.temp=Math.round(220-(pl.p-1)*25+(pl.p*7%11));}S.speed=NET.cfg.speed||10;S.cmdName=NET.cfg.name;S.flags=S.flags||{};S.flags.testRes19=1;S.flags.named=1;S.mp=1};
NET.enforce=function(S){if(!NET.on||!S)return;S.speed=NET.cfg.speed||10;S.cmdName=NET.cfg.name;S.flags=S.flags||{};S.flags.testRes19=1};
function breakdown(){const S=GS();let f=0,d=0;const add=(o,T)=>{let v=0;for(const k in o){const u=T[k];if(u)v+=o[k]*(u.c[0]+u.c[1]+u.c[2])/1000}return v};
 for(const id of S.order){const p=S.planets[id];f+=add(p.ships,GE.SHIP);d+=add(p.def,GE.DEF)}for(const fl of S.fleets)if(!fl.npc)f+=add(fl.ships,GE.SHIP);
 return{b:Math.floor(S.pts.b||0),t:Math.floor(S.pts.t||0),f:Math.floor(f),d:Math.floor(d)}}
NET.breakdown=breakdown;
NET.sync=async function(withSave){if(!NET.on||!GS())return;const S=GS();
 try{const planets=S.order.map(id=>S.planets[id]).map(p=>({g:p.g,s:p.s,p:p.p,name:p.name,type:p.type,moon:!!p.moon}));
  NET.uni=await api('pub',{body:{pts:breakdown(),tag:S.ally?S.ally.tag:null,ally:S.ally?S.ally.name:null,planets}});NET.lastSync=Date.now();NET.err=null;
  try{localStorage.setItem('ge_mp_uni',JSON.stringify({...NET.uni,players:NET.uni.players,npcs:NET.uni.npcs}))}catch(e){}
  if(window.RANK)RANK.g=null;
  if(withSave||Date.now()-NET.lastSave>10*60e3){await NET.pushSave()}
 }catch(e){NET.err=e.message}};
NET.pushSave=async function(keepalive){const S=GS();if(!S)return;const z=await zip(JSON.stringify(S));await api('save',{body:{z,t:S.t},keepalive:keepalive&&z.length<60000});NET.lastSave=Date.now()};
// Anmeldung: Server-Spielstand holen und lokal ablegen, dann neu laden
async function enter(res,url){const c={url,token:res.token,name:res.name,home:res.home,speed:res.speed,seed:res.seed||4242};NET.cfg=c;
 const key='ge_mp_save_'+String(res.name).toLowerCase();
 if(res.hasSave){try{const s=await api('save');const local=JSON.parse(localStorage.getItem(key)||'null');if(!local||(local.t||0)<s.t)localStorage.setItem(key,await unzip(s.z))}catch(e){}}
 localStorage.setItem(LS,JSON.stringify(c));location.reload()}
NET.register=async(url,name,pin,invite)=>enter(await api('register',{url,noauth:true,body:{name,pin,invite}}),url);
NET.login=async(url,name,pin)=>enter(await api('login',{url,noauth:true,body:{name,pin}}),url);
NET.logout=async function(){try{await NET.pushSave()}catch(e){}localStorage.removeItem(LS);location.reload()};
// ---------- Galaxie: echte Spieler + NPC-Spieler an ihren Koordinaten ----------
const h32=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
function index(){const U=NET.uni;if(!U)return{};if(U._idx)return U._idx;const idx={};const me=String(NET.cfg.name||'').toLowerCase();
 for(const p of U.players||[]){if(String(p.name).toLowerCase()===me)continue;const tot=p.pts.b+p.pts.t+p.pts.f+p.pts.d;for(const pl of p.planets||[]){if(pl.moon)continue;idx[pl.g+':'+pl.s+':'+pl.p]={kind:'player',player:p.name,pts:tot,ally:p.tag,name:pl.name||'Planet',real:1}}}
 for(const x of U.npcs||[]){const tot=x.pts.b+x.pts.t+x.pts.f+x.pts.d;idx[x.home.join(':')]={kind:'player',player:x.n,pts:Math.max(50,tot),ally:x.tag,name:'Heimatplanet',npcp:x.type}}
 Object.defineProperty(U,'_idx',{value:idx,enumerable:false});return idx}
NET.slotHook=(g,s,p)=>index()[g+':'+s+':'+p]||null;
// ---------- Rangliste ----------
NET.rankList=function(){const U=NET.uni||{ranking:[]};const me=String(NET.cfg.name||'').toLowerCase();const out=[];
 for(const x of U.ranking||[]){if(!x.npc&&String(x.n).toLowerCase()===me)continue;const p=x.pts||{};out.push({id:x.id,n:x.n+(x.npc?'':' 👤'),tag:x.tag,act:x.npc?!(x.type==='pausing'&&false):(Date.now()-(x.seen||0)<7*864e5),home:x.home,hue:h32(x.n)%360,tot:x.tot,b:p.b||0,t:p.t||0,f:p.f||0,d:p.d||0,real:!x.npc})}
 const S=GS();const b=breakdown();const home=S.planets[S.home];out.push({id:'me',n:S.cmdName,tag:S.ally?S.ally.tag:null,act:true,me:1,home:[home.g,home.s,home.p],hue:190,...b,tot:b.b+b.t+b.f+b.d});return out};
// ---------- UI (nach dem Laden der Oberfläche) ----------
function ui(){const E=window.ENGINE;
 if(NET.on){E.slotHook=NET.slotHook;const ss=E.setSpeed;E.setSpeed=function(sp){if(sp!==(NET.cfg.speed||10)){toast('Im Mehrspieler-Universum ist das Tempo fest ('+(NET.cfg.speed||10)+'×)','err');return}return ss.call(this,sp)};
  setTimeout(()=>NET.sync(true).then(()=>{if(NET.err)toast('Server nicht erreichbar: '+NET.err,'err',4000);else{try{renderAll()}catch(e){}}}),1500);
  setInterval(()=>{if(document.visibilityState==='visible')NET.sync(false)},120e3);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')NET.pushSave(true).catch(()=>{})})}
 const _s=PANELS.settings;PANELS.settings=()=>{const r=_s();const c=NET.cfg;let h;
  if(NET.on)h=`<div class="box" style="margin-bottom:8px"><div class="row"><b>🌐 Mehrspieler</b><span class="spacer"></span><span class="mut">${esc(c.name)} · [${(c.home||[]).join(':')}] · ${c.speed}×</span></div>
   <div class="mut" style="font-size:11px;margin:4px 0">Server: ${esc(c.url)}<br>Letzter Abgleich: ${NET.lastSync?new Date(NET.lastSync).toLocaleTimeString('de-DE'):'–'}${NET.err?` · <span style="color:var(--bad)">${esc(NET.err)}</span>`:''} · Spieler: ${(NET.uni&&NET.uni.players||[]).length} · NPC-Spieler: ${(NET.uni&&NET.uni.npcs||[]).length}</div>
   <div class="row" style="gap:6px"><button class="btn sm" data-act="mp-sync">Jetzt abgleichen</button><button class="btn sm ghost" data-act="mp-out">Abmelden (zurück zum Einzelspieler)</button></div></div>`;
  else h=`<div class="box" style="margin-bottom:8px"><b>🌐 Mehrspieler (Test)</b><div class="mut" style="font-size:11px;margin:2px 0 6px">Gemeinsames Universum mit Freunden. Dein Einzelspieler-Stand bleibt erhalten.</div>
   <div class="mp-f"><input id="mp_url" placeholder="Server-Adresse (https://…)" value="${esc(c.url||NET.DEFAULT_URL)}"><input id="mp_name" placeholder="Name" maxlength="16" value="${esc(c.name||'')}"><input id="mp_pin" placeholder="PIN (4–8 Ziffern)" inputmode="numeric" type="password" maxlength="8"><input id="mp_inv" placeholder="Einladungscode (nur bei Registrierung)"></div>
   <div class="row" style="gap:6px;margin-top:6px"><button class="btn sm" data-act="mp-login">Anmelden</button><button class="btn sm green" data-act="mp-reg">Registrieren</button></div></div>`;
  r[1]=h+r[1];return r};
 document.addEventListener('click',async e=>{const t=e.target.closest('[data-act^="mp-"]');if(!t)return;e.stopPropagation();const a=t.dataset.act;const v=id=>(document.getElementById(id)||{}).value||'';
  try{if(a==='mp-sync'){await NET.sync(true);toast(NET.err?'Fehler: '+NET.err:'Abgeglichen',NET.err?'err':'ok');renderPanel(true);renderAll()}
   else if(a==='mp-out'){if(confirm('Abmelden? Dein Mehrspieler-Stand bleibt auf dem Server gespeichert.'))await NET.logout()}
   else if(a==='mp-login'){if(!v('mp_url'))return toast('Server-Adresse fehlt','err');t.disabled=true;await NET.login(v('mp_url').trim(),v('mp_name').trim(),v('mp_pin').trim())}
   else if(a==='mp-reg'){if(!v('mp_url'))return toast('Server-Adresse fehlt','err');t.disabled=true;await NET.register(v('mp_url').trim(),v('mp_name').trim(),v('mp_pin').trim(),v('mp_inv').trim())}}
  catch(err){t.disabled=false;toast(err.message,'err',4000)}},true);
}
window.addEventListener('load',()=>{try{ui()}catch(e){console.error(e)}});
})();
