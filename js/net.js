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
 if(!r.ok){const er=new Error((j&&j.error)||('HTTP '+r.status));er.status=r.status;er.code=j&&j.code;er.reasons=j&&j.reasons;throw er}return j};
NET.api=api;
// gzip + base64
async function zip(str){const cs=new CompressionStream('gzip');const b=await new Response(new Blob([str]).stream().pipeThrough(cs)).arrayBuffer();let s='';const u=new Uint8Array(b);for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s)}
async function unzip(b64){const bin=atob(b64);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).text()}
NET.zip=zip;NET.unzip=unzip;
// neuer Spielstand im Mehrspieler: Heimat-Koordinaten + Tempo vom Server
NET.initNew=function(S){const h=NET.cfg.home;const pl=S.planets[S.home];S.seed=NET.cfg.seed||4242;if(h){pl.g=h[0];pl.s=h[1];pl.p=h[2];const np=ENGINE.npcAt(pl.g,pl.s);for(let k=0;k<15&&np.includes(pl.p);k++)pl.p=pl.p%15+1;/* Review F09: begrenzte Suche, Server vergibt NPC-freie Heimat */pl.temp=40;}S.speed=NET.cfg.speed||10;S.cmdName=NET.cfg.name;S.flags=S.flags||{};S.flags.testRes19=1;S.flags.named=1;S.mp=1};
NET.enforce=function(S){if(!NET.on||!S)return;S.speed=NET.cfg.speed||10;S.cmdName=NET.cfg.name;S.flags=S.flags||{};S.flags.testRes19=1};
function breakdown(){const S=GS();let f=0,d=0;const add=(o,T)=>{let v=0;for(const k in o){const u=T[k];if(u)v+=o[k]*(u.c[0]+u.c[1]+u.c[2])/1000}return v};
 for(const id of S.order){const p=S.planets[id];f+=add(p.ships,GE.SHIP);d+=add(p.def,GE.DEF)}for(const fl of S.fleets)if(!fl.npc)f+=add(fl.ships,GE.SHIP);for(const sv of S.saves||[])f+=add(sv.ships,GE.SHIP);
 const cp=ENGINE.calcPoints(S);return{b:cp.b,t:cp.t,f:Math.floor(f),d:Math.floor(d)}}
NET.breakdown=breakdown;
NET.sync=async function(withSave){if(!NET.on||!GS())return;const S=GS();
 try{const planets=S.order.map(id=>S.planets[id]).map(p=>({g:p.g,s:p.s,p:p.p,name:p.name,type:p.type,moon:!!p.moon}));
  const snap=S.order.map(id=>S.planets[id]).filter(p=>!p.moon).map(p=>({g:p.g,s:p.s,p:p.p,r:{m:Math.floor(p.r.m),k:Math.floor(p.r.k),g:Math.floor(p.r.g)},ships:{...p.ships},def:{...p.def},core:p.core||null}));
  NET.uni=await api('pub',{body:{pts:breakdown(),tag:S.ally?S.ally.tag:null,ally:S.ally?S.ally.name:null,planets,snap,tech:ENGINE.techOf(),pve:!!(S.flags&&S.flags.pveMode)}});
  if(+NET.uni.created>0&&S.created!==+NET.uni.created){S.created=+NET.uni.created;delete NET.uni.created} // Progression v1: Fenster-Anker = vertrauenswürdige Kontoerstellung
  NET.incoming=NET.uni.incoming||[];NET.ally=NET.uni.ally||null;const evs0=NET.uni.events||[];delete NET.uni.events;
  if(NET.ally)S.ally={name:NET.ally.name,tag:NET.ally.tag,created:S.ally&&S.ally.tag===NET.ally.tag?S.ally.created:Date.now(),mp:1};else if(S.ally&&S.ally.mp)S.ally=null;
  if(evs0.length){const S1=GS();const fresh=applyEvents(evs0);if(fresh){try{save()}catch(e){}try{await NET.pushSave()}catch(e){}}if(evs0.every(e=>S1&&S1.evSeen&&S1.evSeen[e.key||e.id]))await api('ack',{body:{ids:evs0.map(e=>e.id)}})}if(evs0.length&&!NET._re){NET._re=1;try{await NET.sync(false)}finally{NET._re=0}}NET.lastSync=Date.now();NET.err=null;
  try{localStorage.setItem('ge_mp_uni',JSON.stringify({...NET.uni,players:NET.uni.players,npcs:NET.uni.npcs}))}catch(e){}
  if(window.RANK)RANK.g=null;rkC.t=0;try{hud()}catch(e){}
  if(withSave||Date.now()-NET.lastSave>10*60e3){await NET.pushSave()}
 }catch(e){NET.err=e.message}};
NET.CV=60; // Client-Version: der Server lehnt Spielstände älterer Clients (ohne Stufen-Regeln) ab
NET.acceptCanonical=async function(res,maxSeq){
  const canonical=JSON.parse(await unzip(res.z));const current=GS(),remaining=(current.pendingActions||[]).filter(a=>a.seq>maxSeq);const ui={cur:current.cur,settings:current.settings};const visual={};for(const id of current.order)visual[id]={pos:current.planets[id].pos,pads:current.planets[id].pads,padsV:current.planets[id].padsV};
  let at=canonical.t;for(const a of remaining){a.t=Math.max(at,a.t);at=a.t;}
  const seen=current.camp&&current.camp.seen,skip=current.camp&&current.camp.skip;const hook=ENGINE.onSend,oldClock=ENGINE.clock;
  try{ENGINE.onSend=f=>{const old=current.fleets.find(q=>q.id===f.id);if(old&&old.pvp)f.pvp=old.pvp;};ENGINE.journalEnabled=false;ENGINE.replay(canonical,remaining,Math.max(canonical.t,current.t));const next=ENGINE.state();next.pendingActions=remaining;
   for(const k of Object.keys(current))delete current[k];Object.assign(current,next);ENGINE.load(current);if(current.planets[ui.cur])current.cur=ui.cur;for(const id in visual)if(current.planets[id])Object.assign(current.planets[id],visual[id]);if(current.camp){if(seen)current.camp.seen=seen;current.camp.skip=skip||0;}
  }finally{ENGINE.onSend=hook;ENGINE.clock=oldClock;ENGINE.journalEnabled=true;}
localStorage.setItem('ge_mp_base_'+String(NET.cfg.name).toLowerCase(),String(res.rev));};
let pushPromise=null;
NET.pushSave=function(keepalive){if(pushPromise)return pushPromise.then(()=>NET.pushSave(keepalive));
 pushPromise=(async()=>{const state=GS();if(!state||!NET.on)return;const commands=JSON.parse(JSON.stringify(state.pendingActions||[]));const maxSeq=state.actionSeq||0;const z=await zip(JSON.stringify(state));
 const base=+localStorage.getItem('ge_mp_base_'+String(NET.cfg.name).toLowerCase())||0;
 try{const res=await api('save',{body:{z,actions:commands,t:state.t,cv:NET.CV,base},keepalive:keepalive&&z.length<40000});
  await NET.acceptCanonical(res,maxSeq);
  NET.lastSave=Date.now();localStorage.setItem('ge_mp_base_'+String(NET.cfg.name).toLowerCase(),String(res.rev));try{save()}catch(_){}
 }catch(e){if(e.code==='reject'&&!keepalive)await NET.revert(e.message);throw e;}
 })().finally(()=>{pushPromise=null;});return pushPromise;};
// v41: Server hat den Stand abgelehnt (unmöglicher Fortschritt) → letzten gültigen Server-Stand laden
NET.revert=async function(msg){try{const s=await api('save');const key=window.NET_KEY||('ge_mp_save_'+String(NET.cfg.name).toLowerCase());localStorage.setItem(key,await unzip(s.z));try{localStorage.setItem('ge_mp_base_'+String(NET.cfg.name).toLowerCase(),String(s.rev??s.t))}catch(_){}
 try{toast('Server: '+String(msg||'Spielstand abgelehnt').slice(0,140)+' – letzter gültiger Stand wird geladen','err',6000)}catch(_){}
 window.__noSave=1;setTimeout(()=>location.reload(),2500)}catch(e){console.warn(e)}};
// v45: bei jedem Start den Server-Stand prüfen – ist er neuer (anderes Gerät/Browser, PWA vs. Safari) oder gehört er zu einem Konto-Reset,
// wird er übernommen; die vergangene Echtzeit holt E.tick danach nach (Bau, Forschung, Werft, Produktion laufen offline weiter).
const BK=()=>'ge_mp_base_'+String(NET.cfg.name).toLowerCase();
NET.pull=async function(){const S=GS();if(!NET.on||!S)return;try{const s=await api('save');if(!s||!s.z)return;const raw=await unzip(s.z);let o=null;try{o=JSON.parse(raw)}catch(e){return}
 if(!o||o.v!==3)return;const bk=BK(),base=+localStorage.getItem(bk)||0;if(!base){localStorage.setItem(bk,String(s.rev??s.t));if((o.rid||null)===(S.rid||null)&&!window.GE_FRESH)return}
 else if((o.rid||null)===(S.rid||null)&&(+s.rev||+s.t||0)<=base)return;localStorage.setItem(bk,String(s.rev??s.t));
 console.log('Server-Stand ist neuer – wird übernommen',o.t,S.t);window.GE_FRESH=0;sessionStorage.setItem('ge_import',raw);GE_REBOOT(window.NET_KEY||('ge_mp_save_'+String(NET.cfg.name).toLowerCase()));try{renderAll()}catch(e){}}catch(e){if(e.status!==404)console.warn('pull',e.message)}};
// Anmeldung: Server-Spielstand holen und lokal ablegen, dann neu laden
async function enter(res,url){const c={url,token:res.token,name:res.name,home:res.home,speed:res.speed,seed:res.seed||4242};NET.cfg=c;
 const key='ge_mp_save_'+String(res.name).toLowerCase();
 if(res.hasSave){try{const s=await api('save');const local=JSON.parse(localStorage.getItem(key)||'null');const raw=await unzip(s.z);let rid=null;try{rid=JSON.parse(raw).rid||null}catch(e){}
  // v42: nach einem Konto-Reset (rid) gewinnt immer der Server-Stand, auch wenn die lokale Kopie „neuer“ ist
  if(!local||(local.t||0)<s.t||(local.rid||null)!==rid)localStorage.setItem(key,raw);localStorage.setItem('ge_mp_base_'+String(res.name).toLowerCase(),String(s.rev??s.t))}catch(e){}}
 localStorage.setItem(LS,JSON.stringify(c));localStorage.removeItem('ge_mp_off');
 if(!window.GE_REBOOT||!NET._ui){location.reload();return}
 NET.on=true;window.NET_KEY=key;ENGINE.mp=true;NET.uni=null;installMP();rkC.t=0;GE_REBOOT(key);setTimeout(()=>{try{renderAll()}catch(e){}},2500)}
NET.register=async(url,name,pin,invite)=>enter(await api('register',{url,noauth:true,body:{name,pin,invite}}),url);
NET.login=async(url,name,pin)=>enter(await api('login',{url,noauth:true,body:{name,pin}}),url);
NET.logout=async function(){try{await NET.pushSave()}catch(e){}localStorage.removeItem(LS);location.reload()};
// ---------- Galaxie: echte Spieler + NPC-Spieler an ihren Koordinaten ----------
const h32=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
function index(){const U=NET.uni;if(!U)return{};if(U._idx)return U._idx;const idx={};const me=String(NET.cfg.name||'').toLowerCase();
 for(const p of U.players||[]){if(String(p.name).toLowerCase()===me)continue;const tot=p.pts.b+p.pts.t+p.pts.f+p.pts.d;for(const pl of p.planets||[]){if(pl.moon)continue;idx[pl.g+':'+pl.s+':'+pl.p]={kind:'player',player:p.name,pts:tot,ally:p.tag,name:pl.name||'Planet',real:1,prot:!!p.prot}}}
 for(const x of U.npcs||[]){const tot=x.pts.b+x.pts.t+x.pts.f+x.pts.d;idx[x.home.join(':')]={kind:'player',player:x.n,pts:Math.max(50,tot),ally:x.tag,name:'Heimatplanet',npcp:x.type,npcid:x.id}}
 for(const h of U.reserved||[])idx[h.join(':')]={kind:'reserved',npcid:'reserved',name:'Reservierte Position'};
 Object.defineProperty(U,'_idx',{value:idx,enumerable:false});return idx}
NET.slotHook=(g,s,p)=>index()[g+':'+s+':'+p]||null;
// ---------- Rangliste ----------
NET.rankList=function(){const U=NET.uni||{ranking:[]};const me=String(NET.cfg.name||'').toLowerCase();const out=[];
 for(const x of U.ranking||[]){if(!x.npc&&String(x.n).toLowerCase()===me)continue;const p=x.pts||{};out.push({id:x.id,n:x.n+(x.npc?'':' 👤')+(x.pve?' · PvE':''),tag:x.tag,act:x.npc?!(x.type==='pausing'&&false):(Date.now()-(x.seen||0)<7*864e5),home:x.home,hue:h32(x.n)%360,tot:x.tot,b:p.b||0,t:p.t||0,f:p.f||0,d:p.d||0,real:!x.npc})}
 const S=GS();const b=breakdown();const home=S.planets[S.home];out.push({id:'me',n:S.cmdName,tag:S.ally?S.ally.tag:null,act:true,me:1,home:[home.g,home.s,home.p],hue:190,...b,tot:b.b+b.t+b.f+b.d});return out};

// ---------- Stufe 2: Angriffe / Spionage / Transporte zwischen Spielern (Kampf auf dem Server) ----------
const fmtR=o=>['m','k','g'].filter(r=>o&&o[r]>0).map(r=>(window.fmt?fmt(Math.floor(o[r])):Math.floor(o[r]))+' '+({m:'Metall',k:'Kristall',g:'Gas'})[r]).join(', ')||'nichts';
function planetAt(S,c){for(const id of S.order){const p=S.planets[id];if(!p.moon&&p.g===c.g&&p.s===c.s&&p.p===c.p)return p}return null}
// Review F11: Ereignisse dedupliziert (evSeen), angewendet, gespeichert – ACK erst danach
function applyEvents(evs){const S=GS(),E=ENGINE;if(!S)return false;let any=false;E.externalEvents=E.externalEvents||{};
 for(const ev of evs){const key=ev.key||ev.id;E.externalEvents[key]=ev;if(S.evSeen&&S.evSeen[key])continue;const e=E.receiveEvent(key);if(e)continue;any=true;}
 return any;}
NET.applyEvents=applyEvents;
const registrations=new Map();
function registerFleet(id){if(registrations.has(id))return registrations.get(id);const job=(async()=>{
 try{await NET.pushSave();const f=GS().fleets.find(f=>f.id===id);if(!f||!f.pvp||f.phase==='back')return;if(f.pvp.sid){NET.err=null;return;}const r=await api('fleet',{body:{cid:id}});const q=GS().fleets.find(q=>q.id===id);if(q&&q.pvp)q.pvp.sid=r.id;NET.err=null;try{save()}catch(_){}
 }catch(e){NET.err=e.message;const q=GS().fleets.find(q=>q.id===id);if(q&&q.pvp&&!q.pvp.sid&&[400,403,404].includes(e.status)){const err=ENGINE.recall(id);if(!err){ENGINE.report('info','Mission abgebrochen',{text:e.message+' – die Flotte kehrt zurück.'});try{save();await NET.pushSave()}catch(_){}}}}
 })().finally(()=>registrations.delete(id));registrations.set(id,job);return job;}
function onSend(f){if(!NET.on||f.npc||!['attack','spy','transport'].includes(f.mission)||f.to.moon)return;const sl=NET.slotHook(f.to.g,f.to.s,f.to.p);if(!sl)return;
 let target=null;if(sl.real)target={name:sl.player};else if(sl.npcp&&sl.npcid&&f.mission!=='transport')target={npc:sl.npcid};if(!target)return;
 f.pvp={...target,who:sl.player};Promise.resolve().then(()=>registerFleet(f.id));}
let busy=false;
async function resolveLoop(){if(!GS()||busy||!NET.on)return;busy=true;
 try{for(const id of GS().fleets.filter(f=>f.pvp&&!f.pvp.sid&&['out','pvp'].includes(f.phase)).map(f=>f.id))await registerFleet(id);
  for(const id of GS().fleets.filter(f=>f.phase==='pvp'&&f.pvp&&f.pvp.sid).map(f=>f.id)){const f=GS().fleets.find(f=>f.id===id);if(!f||!f.pvp)continue;
   let r;try{await NET.pushSave();r=await api('fleet/resolve',{body:{id:f.pvp.sid}})}catch(e){NET.err=e.message;continue;}
   if(!r.result)continue;if(r.save){const max=(GS().actionSeq||0)-(GS().pendingActions||[]).length;await NET.acceptCanonical(r.save,max);}else applyResult(f,r.result);}}
 finally{busy=false;try{after()}catch(e){}}}
NET.resolveLoop=resolveLoop;
function applyResult(f,x){const E=ENGINE;E.externalResults=E.externalResults||{};E.externalResults[f.pvp.sid]=x;const sid=f.pvp.sid;const e=E.receiveFleet(f.id,sid);if(e)return;}
NET.extIncoming=()=>{const S=GS();if(!S)return[];return(NET.incoming||[]).filter(i=>(i.mission==='attack'||!i.mission)&&i.arrive).map(i=>{const pl=planetAt(S,i.to||{});return pl?{id:'x'+i.id,target:S.order.find(id=>S.planets[id]===pl),arrive:S.t+(i.arrive-Date.now()),who:i.from||'Unbekannt (Radar zu niedrig)',phase:'out',ext:1,ships:i.ships||{},radar:i.radar,nRough:i.nRough,classes:i.classes}:null}).filter(Boolean)};
// ---------- Stufe 3: Allianzen + Chat (v62: Einstellungen, Bewerbungen, Ränge/Rechte, Wappen, Tresor, Shop) ----------
const AL={tab:'ally',list:null,listT:0,chat:{},last:{},ch:'global',sub:'home',tr:null,edit:null,col:{}};NET.AL=AL;
async function alLoad(){try{AL.list=(await api('ally/list')).allies||[];AL.listT=Date.now()}catch(e){AL.err=e.message}}
NET.logoData=tag=>{if(!tag)return null;if(NET.ally&&NET.ally.tag===tag)return NET.ally.logo;if((!AL.list||Date.now()-AL.listT>60e3)&&!AL.loading){AL.loading=1;alLoad().finally(()=>{AL.loading=0})}const a=(AL.list||[]).find(x=>x.tag===tag);return a?a.logo:null};
NET.logoHtml=(tag,sz)=>{const l=NET.logoData(tag);return l&&window.ALLY&&ALLY.emblem?ALLY.emblem(l,sz||16)+' ':''};
async function chatLoad(ch){const arr=AL.chat[ch]||(AL.chat[ch]=[]);const since=arr.length?arr[arr.length-1].id:0;try{const r=await api('chat?ch='+encodeURIComponent(ch)+'&since='+since);if(r.msgs&&r.msgs.length){arr.push(...r.msgs);if(arr.length>200)arr.splice(0,arr.length-200);return true}}catch(e){AL.err=e.message}return false}
const PERMN={acc:'Bewerbungen annehmen',kick:'Mitglieder entfernen',rank:'Ränge vergeben',set:'Einstellungen ändern',msg:'Rundmail senden',treas:'Tresor verwalten',shop:'Shop nutzen'};
const MODEN={open:'Offen',apply:'Bewerbung',closed:'Geschlossen'};
const RES3=[['m','Metall'],['k','Kristall'],['g','Gas']];
const RKS=['r5','r4','r3','r2','r1'];const RKN={r5:'Präsident',r4:'Offizier',r3:'Ausbilder',r2:'Veteran',r1:'Mitglied'};
// ---- Allianzfenster v63: Kopfbereich, Kachelraster, Karten ----
const AXI={ // eigene SVG-Symbole (24er Raster)
 mem:'<circle cx="9" cy="8" r="3.4"/><circle cx="16.5" cy="9" r="2.6"/><path d="M3.5 19c.6-3.6 2.8-5.6 5.5-5.6s4.9 2 5.5 5.6zM14.5 19c.3-2.2 1-3.7 2.2-4.5 2.4.1 3.8 1.7 4.3 4.5z"/>',
 tres:'<path d="M4 9h16v10H4z"/><path d="M4 9l2-4h12l2 4" fill="none"/><circle cx="12" cy="14" r="2.4" fill="#0b1020"/><path d="M12 12.6v2.8" stroke="#ffd166"/>',
 shop:'<path d="M5 8h14l-1.4 11H6.4z"/><path d="M8.5 8a3.5 3.5 0 0 1 7 0" fill="none"/><path d="M12 11.5l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z" fill="#0b1020"/>',
 apps:'<path d="M4 6h16v12H4z"/><path d="M4 6l8 7 8-7" fill="none" stroke="#0b1020"/>',
 ranks:'<path d="M12 3l3 5.5 6 .9-4.4 4.2 1 6-5.6-3-5.6 3 1-6L3 9.4l6-.9z"/>',
 set:'<path d="M10.5 3h3l.5 2.4 2 1 2.3-.9 1.5 2.6-1.8 1.6v2.6l1.8 1.6-1.5 2.6-2.3-.9-2 1-.5 2.4h-3l-.5-2.4-2-1-2.3.9-1.5-2.6 1.8-1.6v-2.6L4.2 8.1l1.5-2.6 2.3.9 2-1z"/><circle cx="12" cy="12" r="2.6" fill="#0b1020"/>',
 msg:'<path d="M4 10l12-5v14L4 14z"/><path d="M16 8.5c2 .4 3 1.8 3 3.5s-1 3.1-3 3.5" fill="none"/><path d="M6 14l1.4 5h2.4l-1-4.4"/>',
 chat:'<path d="M4 5h16v10H10l-4 4v-4H4z"/>',
 back:'<path d="M14.5 5l-7 7 7 7" fill="none" stroke-width="2.4"/>',
 send:'<path d="M3 11.5L21 4l-6.5 17-3-7.2z"/>',
 prod:'<path d="M4 20V10l5 3V10l5 3V6h4v14z"/>',hull:'<path d="M12 3l8 3v6c0 5-3.6 8-8 9-4.4-1-8-4-8-9V6z"/>',energy:'<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>',
 gold:'<circle cx="12" cy="12" r="8" fill="none" stroke-width="3"/><path d="M12 7l1.5 3 3.3.4-2.4 2.3.6 3.3L12 14.4 9 16l.6-3.3-2.4-2.3 3.3-.4z"/>',
 glow:'<circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="8.5" fill="none" stroke-dasharray="2 2.6"/>',sym:'<path d="M12 3l2.3 6.2H21l-5.4 4 2 6.5L12 15.9 6.4 19.7l2-6.5-5.4-4h6.7z"/>',
 crown:'<path d="M3 18l-1-11 5.5 4L12 4l4.5 7L22 7l-1 11z"/>',x:'<path d="M6 6l12 12M18 6L6 18" fill="none" stroke-width="2.4"/>'};
const axI=(k,c)=>`<svg class="axi" viewBox="0 0 24 24" ${c?`style="--ic:${c}"`:''}>${AXI[k]||''}</svg>`;
const axHue=n=>{let h=0;for(const ch of String(n))h=(h*31+ch.charCodeAt(0))>>>0;return h%360};
const axAv=(n,sz)=>`<span class="ax-av" style="--h:${axHue(n)};width:${sz||40}px;height:${sz||40}px;font-size:${Math.round((sz||40)*.42)}px">${esc(String(n||'?')[0].toUpperCase())}</span>`;
const axIns=(rk,sz)=>{const l=+rk.slice(1);sz=sz||22;return`<svg class="ax-ins r${l}" viewBox="0 0 24 24" width="${sz}" height="${sz}">${l===5?AXI.crown:Array.from({length:l},(_,i)=>`<path d="M5 ${19-i*4.6-(4-l)*2.3}l7-4 7 4"/>`).join('')}</svg>`};
const axLvl=d=>{const l=Math.min(20,1+Math.floor(Math.log2(1+(d||0)/50000)));const lo=50000*(Math.pow(2,l-1)-1),hi=50000*(Math.pow(2,l)-1);return{l,p:l>=20?1:Math.max(0,Math.min(1,((d||0)-lo)/(hi-lo)))}};
const axOnline=(A,m)=>m.n===NET.cfg.name||(A.now||Date.now())-(m.seen||0)<15*60e3;
const axBack=t=>`<div class="ax-ph"><button class="ax-bk" data-act="mpa-sub" data-id="home">${axI('back')}</button><b>${t}</b></div>`;
const axRes=(r,v)=>`<span class="ax-rc r-${r}">${IC[r]}${fmt(v)}</span>`;
function rankName(A,id){return RKN[id]||id}
function axMembers(A){const g={};for(const m of A.members)(g[m.rank]||(g[m.rank]=[])).push(m);return g}
function axHero(A){const em=window.ALLY?ALLY.emblem(A.logo,86):'';const c=window.ALLY?ALLY.EMC[(A.logo.c|0)%ALLY.EMC.length]:'#38e1ff';const pw=A.members.reduce((s,m)=>s+(m.pts||0),0);const on=A.members.filter(m=>axOnline(A,m)).length;const L=axLvl(A.donTotal);
 return`<div class="ax-hero" style="--ac:${c}"><div class="ax-bnr"></div><div class="ax-hem">${em}<span class="ax-lv">Lv ${L.l}</span></div>
  <div class="ax-hn"><div class="ax-tag">[${esc(A.tag)}]</div><div class="ax-name">${esc(A.name)}</div><div class="ax-me">${axIns(A.rank,16)} ${rankName(A,A.rank)}</div></div>
  <div class="ax-stats"><div><i>Macht</i><b>${fmt(pw)}</b></div><div><i>Mitglieder</i><b>${A.members.length}<small>/50</small></b></div><div><i>Online</i><b class="ok">${on}</b></div><div><i>Aufnahme</i><b>${MODEN[A.mode]||''}</b></div></div>
  <div class="ax-xp"><i style="width:${Math.round(L.p*100)}%"></i><span>Allianzlevel ${L.l} · Spenden ${fmt(A.donTotal||0)}</span></div>
  ${(A.buffs||[]).length?`<div class="ax-bf">${A.buffs.map(x=>`<span>${axI(x.buff)}+${Math.round(x.v*100)} %</span>`).join('')}</div>`:''}</div>`}
function axTiles(A){const P=new Set(A.perms||[]);const T=[['mem','Mitglieder','#38e1ff',A.members.length],['tres','Tresor','#ffd166'],['shop','Shop','#b06bff'],['apps','Bewerbungen','#4ade80',(A.apps||[]).length,!P.has('acc')],['ranks','Ränge','#ff9f43'],['msg','Rundmail','#ff5577',0,!P.has('msg')],['chat','Allianzchat','#7af0ff'],['set','Einstellungen','#a9b6d3']];
 return`<div class="ax-tiles">${T.map(([k,n,c,cnt,lock])=>`<button class="ax-tile ${lock?'lock':''}" style="--tc:${c}" data-act="${k==='chat'?'mpa-chat':'mpa-sub'}" data-id="${k}"><span class="ax-tic">${axI(k)}</span><span class="ax-tn">${n}</span>${k==='apps'&&cnt?`<span class="ax-badge">${cnt}</span>`:k==='mem'?`<span class="ax-cnt">${cnt}</span>`:''}</button>`).join('')}</div>`}
function axPage(A){const P=new Set(A.perms||[]);const me=NET.cfg.name;const sub=AL.sub;
 if(sub==='mem'){const g=axMembers(A);let h=axBack('Mitglieder · '+A.members.length);
  for(const rk of RKS){const L=g[rk]||[];const open=!AL.col[rk];h+=`<div class="ax-grp ${open?'':'shut'}"><button class="ax-gh" data-act="mpa-col" data-id="${rk}">${axIns(rk,20)}<b>${rk.toUpperCase()} · ${RKN[rk]}</b><span class="mut">${L.length}</span><span class="ax-car">▾</span></button>
   ${open?`<div class="ax-cards">${L.length?L.sort((a,b)=>(b.pts||0)-(a.pts||0)).map(m=>`<div class="ax-mc ${m.n===me?'me':''}" data-act="mpa-pick" data-id="${esc(m.n)}">${axAv(m.n,38)}<i class="ax-dot ${axOnline(A,m)?'on':''}"></i><div class="ax-mi"><div class="ax-mn">${PN(m.n)}${m.n===me?' <small>(Du)</small>':''}</div><div class="ax-mp">⚡ ${fmt(m.pts||0)}</div></div>${axIns(rk,18)}</div>`).join(''):'<div class="ax-empty">Niemand</div>'}</div>`:''}</div>`}
  return h+'<div class="ax-hint">Karte antippen: Rang, Tresor-Versand, Entfernen. Name antippen: Privatchat.</div>'}
 if(sub==='apps'){return axBack('Bewerbungen')+((A.apps||[]).length?`<div class="ax-cards">${A.apps.map(x=>`<div class="ax-ac">${axAv(x.n,44)}<div class="ax-mi"><div class="ax-mn">${PN(x.n)}</div><div class="ax-quote">${x.msg?'„'+esc(x.msg)+'“':'<span class="mut">ohne Text</span>'}</div></div><div class="ax-btns"><button class="ax-b ok" data-act="mpa-acc" data-id="${esc(x.n)}">Annehmen</button><button class="ax-b ghost" data-act="mpa-rej" data-id="${esc(x.n)}">Ablehnen</button></div></div>`).join('')}</div>`:`<div class="ax-void">${axI('apps')}<b>Keine offenen Bewerbungen</b><span>Aufnahme: ${MODEN[A.mode]}</span></div>`)}
 if(sub==='ranks'){const r5=A.rank==='r5';const g=axMembers(A);return axBack('Ränge & Rechte')+`<div class="ax-rk">${RKS.map(rk=>{const p=rk==='r5'?Object.keys(PERMN):(A.rp[rk]||[]);return`<div class="ax-rkc r${rk[1]}">${axIns(rk,34)}<div class="ax-rkt"><b>${rk.toUpperCase()} · ${RKN[rk]}</b><span class="mut">${(g[rk]||[]).length} Mitglied${(g[rk]||[]).length===1?'':'er'}</span></div><div class="ax-chips">${Object.entries(PERMN).map(([k,n])=>`<button class="ax-chip ${p.includes(k)?'on':''}" ${r5&&rk!=='r5'?`data-act="mpa-right" data-r="${rk}" data-id="${k}"`:'disabled'}>${n}</button>`).join('')}</div></div>`}).join('')}</div><div class="ax-hint">${r5?'Als Präsident tippst du Rechte an oder aus.':'Nur der Präsident (R5) passt Rechte an.'} R5 vergibt R4–R1, R4 vergibt bis R3 – immer nur unterhalb des eigenen Rangs.</div>`}
 if(sub==='tres'){const T=AL.tr;if(!T){api('ally/treasury').then(r=>{AL.tr=r.treasury;if(view==='ally')renderAlly()}).catch(e=>toast(e.message,'err'));return axBack('Tresor')+'<div class="ax-void">Lädt…</div>'}
  const pl=GS().planets[GS().cur];const mine=Object.entries(pl.ships||{}).filter(([k,n])=>n>0);const ts=Object.entries(T.ships).filter(([k,n])=>n>0);const mode=AL.tm||'don';
  let h=axBack('Allianz-Tresor')+`<div class="ax-vault">${RES3.map(([r,n])=>`<div class="ax-vc r-${r}"><span class="ax-vi">${IC[r]}</span><i>${n}</i><b>${fmt(T.r[r])}</b></div>`).join('')}<div class="ax-vc r-dm"><span class="ax-vi">${IC.dm}</span><i>Dunkle Materie</i><b>${fmt(T.dm)}</b></div></div>
   <div class="ax-fleet">${ts.length?ts.map(([k,n])=>`<div class="ax-sc">${A_img(k)}<b>${fmt(n)}</b><i>${esc((GE.SHIP[k]||{}).n||k)}</i></div>`).join(''):'<div class="ax-empty">Keine Schiffe im Tresor</div>'}</div>
   <div class="ax-seg"><button class="${mode==='don'?'on':''}" data-act="mpa-tm" data-id="don">Spenden</button><button class="${mode==='send'?'on':''}" data-act="mpa-tm" data-id="send">${P.has('treas')?'Versenden':'Versenden 🔒'}</button><button class="${mode==='log'?'on':''}" data-act="mpa-tm" data-id="log">Tresorbuch</button></div>`;
  if(mode==='don'){h+=`<div class="ax-panel"><div class="ax-pt">Von <b>${esc(pl.name)}</b> spenden</div>${RES3.map(([r,n])=>axSlider('mpd-'+r,n,r,Math.floor(pl.r[r]))).join('')}${axSlider('mpd-dm','Dunkle Materie','dm',Math.floor(GS().dm||0))}
   <div class="ax-pt" style="margin-top:8px">Schiffe auf diesem Planeten</div><div class="ax-fleet pick">${mine.length?mine.map(([k,n])=>axStep('mpd-s-'+k,k,n)).join(''):'<div class="ax-empty">Keine Schiffe stationiert (Flotten unterwegs zählen nicht)</div>'}</div>
   <button class="ax-cta" data-act="mpa-donate">${axI('tres')} Endgültig spenden</button><div class="ax-hint">Spenden verlassen sofort deinen Planeten. DM sind nur für den Shop, nicht auszahlbar.</div></div>`}
  if(mode==='send'){if(!P.has('treas'))h+=`<div class="ax-void">${axI('tres')}<b>Recht „Tresor verwalten“ fehlt</b><span>R4 und R5 dürfen versenden.</span></div>`;else{const to=AL.to||'';
   h+=`<div class="ax-panel"><div class="ax-pt">Empfänger wählen</div><div class="ax-pick">${A.members.map(m=>`<button class="ax-pm ${to===m.n?'on':''}" data-act="mpa-to" data-id="${esc(m.n)}">${axAv(m.n,36)}<span>${esc(m.n)}</span>${axIns(m.rank,12)}</button>`).join('')}</div>
    ${RES3.map(([r,n])=>axSlider('mpg-'+r,n,r,T.r[r])).join('')}<div class="ax-pt" style="margin-top:8px">Schiffe aus dem Tresor</div><div class="ax-fleet pick">${ts.length?ts.map(([k,n])=>axStep('mpg-s-'+k,k,n)).join(''):'<div class="ax-empty">Keine Schiffe im Tresor</div>'}</div>
    <button class="ax-cta" data-act="mpa-give" ${to?'':'disabled'}>${axI('send')} ${to?'An '+esc(to)+' senden':'Empfänger wählen'}</button><div class="ax-hint">Transfer per Allianz-Sprungtor zum Heimatplaneten – Ankunft sofort.</div></div>`}}
  if(mode==='log'){const don=Object.entries(T.don).sort((a,b)=>b[1].v-a[1].v).slice(0,5);h+=`<div class="ax-panel">${don.length?`<div class="ax-pt">Top-Spender</div><div class="ax-top">${don.map(([n,d],i)=>`<div class="ax-tp p${i}">${axAv(n,30)}<b>${PN(n)}</b><span>${fmt(d.v)}${d.dm?' · '+d.dm+' DM':''}</span></div>`).join('')}</div>`:''}
   <div class="ax-pt" style="margin-top:8px">Tresorbuch</div><div class="ax-log">${T.log.length?T.log.map(l=>`<div class="ax-ll k-${l.kind}"><span class="ax-lk">${axI(l.kind==='donate'?'tres':l.kind==='give'?'send':'shop')}</span><div><b>${PN(l.by)}</b> ${l.kind==='donate'?'spendet':l.kind==='give'?'sendet an '+PN(l.to):'kauft '+esc((A.shop.find(x=>x.id===l.item)||{}).n||l.item)}<div class="ax-lr">${RES3.filter(([r])=>l.res&&l.res[r]).map(([r])=>axRes(r,l.res[r])).join('')}${l.dm?`<span class="ax-rc">${IC.dm}${l.dm}</span>`:''}${l.ships&&Object.keys(l.ships).length?Object.entries(l.ships).map(([k,n])=>`<span class="ax-rc">${n}× ${esc((GE.SHIP[k]||{}).n||k)}</span>`).join(''):''}</div></div><span class="ax-lt">${new Date(l.t).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</span></div>`).join(''):'<div class="ax-empty">Noch keine Buchungen</div>'}</div></div>`}
  return h}
 if(sub==='shop'){const T=AL.tr;if(!T)api('ally/treasury').then(r=>{AL.tr=r.treasury;if(view==='ally')renderAlly()});
  return axBack('Allianz-Shop')+`${T?`<div class="ax-bal">Tresor ${RES3.map(([r])=>axRes(r,T.r[r])).join('')}<span class="ax-rc">${IC.dm}${fmt(T.dm)}</span></div>`:''}<div class="ax-shop">${(A.shop||[]).map(it=>{const own=it.cos&&(A.cos||[]).includes(it.cos);const act=it.buff&&(A.buffs||[]).find(x=>x.buff===it.buff);const ic=it.buff||it.cos;const aff=T&&RES3.every(([r],i)=>T.r[r]>=it.c[i])&&T.dm>=(it.dm||0);
   return`<div class="ax-it ${it.buff?'buff':'cos'} ${own?'own':''}"><span class="ax-iic">${axI(ic)}</span><b>${esc(it.n.replace(/\s*\(.*\)/,''))}</b><i>${it.buff?`+${Math.round(it.v*100)} % für alle · ${it.h} h`:'Wappen-Kosmetik'}</i>${act?`<span class="ax-on">aktiv · <span data-end="${act.end}"></span></span>`:''}
    <div class="ax-cost">${RES3.map(([r],i)=>it.c[i]?axRes(r,it.c[i]):'').join('')}${it.dm?`<span class="ax-rc">${IC.dm}${it.dm}</span>`:''}</div>${own?'<button class="ax-b ghost" disabled>Freigeschaltet</button>':P.has('shop')?`<button class="ax-b ${aff?'gold':'ghost'}" data-act="mpa-buy" data-id="${it.id}">${act?'Verlängern':'Kaufen'}</button>`:'<button class="ax-b ghost" disabled>R4/R5</button>'}</div>`}).join('')}</div><div class="ax-hint">Boni zählen wie Items: der stärkste gilt, nichts stapelt. Verlängerbar bis 72 h.</div>`}
 if(sub==='msg'){return axBack('Rundmail')+(P.has('msg')?`<div class="ax-panel"><div class="ax-pt">An alle ${A.members.length} Mitglieder</div><textarea id="mpacm" maxlength="300" rows="4" placeholder="Nachricht an die Allianz…"></textarea><button class="ax-cta" data-act="mpa-circ">${axI('msg')} Rundmail senden</button><div class="ax-hint">Erscheint als Bericht bei jedem Mitglied und im Allianzchat.</div></div>`:`<div class="ax-void">${axI('msg')}<b>Rundmail ab R3</b></div>`)}
 if(sub==='set'){const L=AL.edit||(AL.edit={...A.logo});const cos=A.cos||[];const em=(l,s)=>ALLY.emblem(l,s);let h=axBack('Einstellungen');
  if(P.has('set'))h+=`<div class="ax-panel ax-set"><div class="ax-lb"><div class="ax-lbp">${em(L,104)}</div><div class="ax-lbo">
    <div class="ax-row"><i>Form</i>${ALLY.EMSH.map((_,i)=>`<button class="ax-o ${L.sh===i?'on':''}" data-act="mpa-logo" data-k="sh" data-v="${i}">${em({...L,sh:i,fr:undefined,gl:0},28)}</button>`).join('')}</div>
    <div class="ax-row"><i>Symbol</i>${ALLY.EMS.map((_,i)=>i>=6&&!cos.includes('sym')?'':`<button class="ax-o ${L.s===i?'on':''}" data-act="mpa-logo" data-k="s" data-v="${i}">${em({...L,s:i,fr:undefined,gl:0},28)}</button>`).join('')}</div>
    <div class="ax-row"><i>Farbe</i>${ALLY.EMC.map((c,i)=>`<button class="ax-sw ${L.c===i?'on':''}" style="background:${c}" data-act="mpa-logo" data-k="c" data-v="${i}"></button>`).join('')}</div>
    <div class="ax-row"><i>Feld</i>${ALLY.EMC.map((c,i)=>`<button class="ax-sw ${L.c2===i?'on':''}" style="background:${c}" data-act="mpa-logo" data-k="c2" data-v="${i}"></button>`).join('')}</div>
    <div class="ax-row"><i>Extras</i>${cos.includes('gold')?`<button class="ax-chip ${L.fr==='gold'?'on':''}" data-act="mpa-logo" data-k="fr">Goldrahmen</button>`:''}${cos.includes('glow')?`<button class="ax-chip ${L.gl?'on':''}" data-act="mpa-logo" data-k="gl">Nebelglühen</button>`:''}${!cos.includes('gold')&&!cos.includes('glow')?'<span class="mut">im Allianz-Shop</span>':''}</div></div></div>
   <div class="ax-form"><label><i>Name</i><input id="mps-n" value="${esc(A.name)}" maxlength="30"></label><label class="sm"><i>Kürzel</i><input id="mps-t" value="${esc(A.tag)}" maxlength="5"></label></div>
   <label class="ax-full"><i>Beschreibung</i><textarea id="mps-d" maxlength="300" rows="2">${esc(A.descr||'')}</textarea></label>
   <div class="ax-row"><i>Aufnahme</i><div class="ax-seg sm">${Object.entries(MODEN).map(([k,n])=>`<button class="${(AL.mode||A.mode)===k?'on':''}" data-act="mpa-mode" data-id="${k}">${n}</button>`).join('')}</div></div>
   <button class="ax-cta" data-act="mpa-set">Speichern</button></div>`;
  else h+=`<div class="ax-void">${axI('set')}<b>Einstellungen ab R4</b><span>${esc(A.descr||'')}</span></div>`;
  h+=`<div class="ax-panel ax-danger"><div class="ax-pt">Mitgliedschaft</div><div class="ax-btns"><button class="ax-b ghost" data-act="mpa-leave">Allianz verlassen</button>${A.rank==='r5'?'<button class="ax-b bad" data-act="mpa-disband">Allianz auflösen</button>':''}</div>${A.rank==='r5'?'<div class="ax-hint">Präsidentschaft übergibst du über die Mitgliederkarte.</div>':''}</div>`;return h}
 return''}
const A_img=k=>`<img src="assets/img/${k}.png" alt="" onerror="this.style.visibility='hidden'">`;
function axSlider(id,n,r,max){max=Math.max(0,Math.floor(max||0));return`<div class="ax-sl r-${r}"><span class="ax-si">${IC[r]||''}</span><div class="ax-sb"><div class="ax-st"><i>${n}</i><b id="${id}-v">0</b><small>/ ${fmt(max)}</small></div><input type="range" id="${id}" min="0" max="${max}" step="${Math.max(1,Math.round(max/200))}" value="0" data-sl="${id}" ${max?'':'disabled'}></div><button class="ax-mx" data-act="mpa-max" data-id="${id}" ${max?'':'disabled'}>Max</button></div>`}
function axStep(id,k,max){return`<div class="ax-sc pick">${A_img(k)}<i>${esc((GE.SHIP[k]||{}).n||k)}</i><div class="ax-stp"><button data-act="mpa-step" data-id="${id}" data-d="-1">−</button><input id="${id}" type="number" min="0" max="${max}" value="0"><button data-act="mpa-step" data-id="${id}" data-d="1">+</button></div><small>max ${fmt(max)}</small></div>`}
function axSheet(A){const n=AL.pick;if(!n)return'';const m=A.members.find(x=>x.n===n);if(!m){AL.pick=null;return''}const me=NET.cfg.name;const my=+A.rank[1],tl=+m.rank[1];const P=new Set(A.perms||[]);const can=m.n!==me&&tl<my;
 return`<div class="ax-sheet" data-act="mpa-unpick"><div class="ax-sh glass" data-act="mpa-keep"><button class="ax-x" data-act="mpa-unpick">${axI('x')}</button><div class="ax-shh">${axAv(m.n,64)}<div><div class="ax-mn big">${PN(m.n)}</div><div class="ax-me">${axIns(m.rank,16)} ${m.rank.toUpperCase()} · ${RKN[m.rank]} · ${axOnline(A,m)?'<span class="ok">online</span>':'offline'}</div><div class="ax-mp">⚡ Macht ${fmt(m.pts||0)}</div></div></div>
  ${P.has('rank')&&can?`<div class="ax-pt">Rang zuweisen</div><div class="ax-rpick">${['r4','r3','r2','r1'].map(rk=>`<button class="ax-rb ${m.rank===rk?'on':''}" data-act="mpa-rank" data-id="${esc(m.n)}" data-r="${rk}" ${+rk[1]<my?'':'disabled'}>${axIns(rk,22)}<b>${rk.toUpperCase()}</b><i>${RKN[rk]}</i></button>`).join('')}</div>`:''}
  <div class="ax-btns">${m.n!==me?`<button class="ax-b" data-act="mpa-pm" data-id="${esc(m.n)}">${axI('chat')} Privatchat</button>`:''}${P.has('treas')?`<button class="ax-b gold" data-act="mpa-sendto" data-id="${esc(m.n)}">${axI('send')} Aus Tresor senden</button>`:''}${P.has('kick')&&can?`<button class="ax-b bad" data-act="mpa-kick" data-id="${esc(m.n)}">Entfernen</button>`:''}${A.rank==='r5'&&m.n!==me?`<button class="ax-b ghost" data-act="mpa-hand" data-id="${esc(m.n)}">${axI('crown')} Präsident übergeben</button>`:''}</div></div></div>`}
function axJoin(){const me=NET.cfg.name;const em=(l,s)=>window.ALLY?ALLY.emblem(l,s):'';let h=`<div class="ax-wrap join"><div class="ax-left col"><div class="ax-hero lobby"><div class="ax-bnr"></div><div class="ax-hn"><div class="ax-name">Allianzen</div><div class="ax-me">Gemeinsam stärker: Tresor, Boni und Allianzchat</div></div></div>`;
 h+=`<div class="ax-panel ax-create"><div class="ax-pt">Eigene Allianz gründen</div><div class="ax-form"><label><i>Name</i><input id="mpan" placeholder="3–30 Zeichen" maxlength="30"></label><label class="sm"><i>Kürzel</i><input id="mpat" placeholder="ABC" maxlength="5"></label></div><button class="ax-cta" data-act="mpa-create">${axI('crown')} Gründen</button></div></div><div class="ax-right"><div class="ax-ph"><b>Allianzen im Universum</b></div>`;
 h+=`<div class="ax-alist">${AL.list?AL.list.length?AL.list.map(a=>{const ap=(a.apps||[]).some(x=>x.n===me);return`<div class="ax-ali">${em(a.logo,54)}<div class="ax-mi"><div class="ax-mn"><span class="ax-tag sm">[${esc(a.tag)}]</span> ${esc(a.name)}</div><div class="ax-mp">${axI('mem')} ${a.members.length}/50 · ${MODEN[a.mode]||''} · R5 ${PN(a.founder)}</div>${a.descr?`<div class="ax-quote">${esc(a.descr)}</div>`:''}</div>
  ${ap?`<button class="ax-b ghost" data-act="mpa-withdraw" data-id="${esc(a.tag)}">Zurückziehen</button>`:a.mode==='closed'?'<span class="ax-lockb">Geschlossen</span>':a.mode==='open'?`<button class="ax-b ok" data-act="mpa-apply" data-id="${esc(a.tag)}" data-open="1">Beitreten</button>`:`<button class="ax-b" data-act="mpa-apply" data-id="${esc(a.tag)}">Bewerben</button>`}</div>`}).join(''):'<div class="ax-void">Noch keine Allianzen – gründe die erste!</div>':'<div class="ax-void">Lädt…</div>'}</div></div></div>`;return h}
function mpAlly(){const b=$('#allybody');b.className='vbody glass ax-body';const A=NET.ally;
 if(!AL.list){alLoad().then(()=>{if(view==='ally')renderAlly()})}
 if(!A){setHTML(b,axJoin());return}
 const pg=AL.sub&&AL.sub!=='home';const h=`<div class="ax-wrap ${pg?'sub':''}"><div class="ax-left">${axHero(A)}</div><div class="ax-right"><div class="ax-page" data-pg="${AL.sub||'home'}">${pg?axPage(A):(A.descr?`<div class="ax-motd"><i>Nachricht der Führung</i>${esc(A.descr)}</div>`:'')+axTiles(A)}</div></div>${axSheet(A)}${AL.fx||''}</div>`;
 setHTML(b,h)}
const S_now=t=>t; // Serverzeit = Spielzeit im Mehrspieler
function mpChat(){const b=$('#chatbody');b.className='vbody glass';const A=NET.ally;if(AL.ch!=='global'&&!(A&&AL.ch==='ally:'+A.tag))AL.ch='global';const ch=AL.ch;const arr=AL.chat[ch]||[];const me=NET.cfg.name;
 const keep=document.getElementById('mpct');const draft=keep?keep.value:'';const tagOf=n=>{if(n===me)return A&&A.tag;const p=((NET.uni&&NET.uni.players)||[]).find(p=>p.name===n);return p&&p.tag};
 b.innerHTML=`<div class="row" style="margin-bottom:8px;gap:6px"><button class="btn sm ${ch==='global'?'':'ghost'}" data-act="mpc-ch" data-id="global">🌐 Universum</button>${A?`<button class="btn sm ${ch!=='global'?'':'ghost'}" data-act="mpc-ch" data-id="ally:${esc(A.tag)}">${NET.logoHtml(A.tag,16)||IC.ally} [${esc(A.tag)}]</button>`:''}<span class="spacer"></span><span class="mut" style="font-size:11px">Mehrspieler-Chat</span></div>
 <div id="mpcl" style="max-height:52vh;overflow:auto">${arr.length?arr.map(m=>{const tg=m.name!=='System'&&tagOf(m.name);return`<div class="chatmsg"><div class="cav">${m.name==='System'?'!':esc(m.name[0]||'?')}</div><div class="cb"><small>${tg?NET.logoHtml(tg,12)+'['+esc(tg)+'] ':''}${m.name==='System'?esc(m.name):PN(m.name)}${m.name===me?' (Du)':''} · ${new Date(m.t).toLocaleString('de-DE',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'})}</small>${esc(m.txt)}</div></div>`}).join(''):'<div class="mut">Noch keine Nachrichten.</div>'}</div>
 <div class="row" style="margin-top:8px;gap:6px"><input id="mpct" maxlength="300" placeholder="Nachricht…" style="flex:1"><button class="btn sm" data-act="mpc-send">Senden</button></div>`;
 const i=document.getElementById('mpct');i.value=draft;i.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();sendChat()}};const l=document.getElementById('mpcl');l.scrollTop=l.scrollHeight;
 if(AL.last[ch]!==-1){AL.last[ch]=-1;chatLoad(ch).then(n=>{if(n&&view==='chat')mpChat()})}}
async function sendChat(){const i=document.getElementById('mpct');const txt=(i&&i.value||'').trim();if(!txt)return;i.value='';try{await api('chat',{body:{ch:AL.ch,txt}});await chatLoad(AL.ch);if(view==='chat')mpChat()}catch(e){toast(e.message,'err')}}
async function allyAct(a,t){const v=id=>(document.getElementById(id)||{}).value||'';const num=id=>Math.max(0,Math.floor(+v(id)||0));const id=t.dataset.id;const A=NET.ally;
 if(a==='mpa-keep'){t.disabled=false;return}
 if(a==='mpa-sub'){AL.sub=id;AL.edit=null;AL.mode=null;AL.pick=null;if(id==='tres'||id==='shop')AL.tr=null;renderAlly();return}
 if(a==='mpa-col'){AL.col=AL.col||{};AL.col[id]=!AL.col[id];renderAlly();return}
 if(a==='mpa-pick'){AL.pick=id;renderAlly();return}
 if(a==='mpa-unpick'){AL.pick=null;renderAlly();return}
 if(a==='mpa-pm'){AL.pick=null;if(window.openPM)openPM(id);else{AL.ch='global';setView('chat')}return}
 if(a==='mpa-chat'){AL.ch='ally:'+A.tag;AL.last[AL.ch]=0;setView('chat');return}
 if(a==='mpa-sendto'){AL.pick=null;AL.sub='tres';AL.tm='send';AL.to=id;AL.tr=null;renderAlly();return}
 if(a==='mpa-tm'){AL.tm=id;renderAlly();return}
 if(a==='mpa-to'){AL.to=id;renderAlly();return}
 if(a==='mpa-mode'){AL.mode=id;renderAlly();return}
 if(a==='mpa-max'){const i=document.getElementById(id);if(i){i.value=i.max;axSl(i)}t.disabled=false;return}
 if(a==='mpa-step'){const i=document.getElementById(id);if(i){i.value=Math.max(0,Math.min(+i.max,(+i.value||0)+(+t.dataset.d)))}t.disabled=false;return}
 if(a==='mpa-logo'){const L=AL.edit||(AL.edit={...A.logo});const k=t.dataset.k;if(k==='fr')L.fr=L.fr==='gold'?undefined:'gold';else if(k==='gl')L.gl=L.gl?0:1;else L[k]=+t.dataset.v;renderAlly();return}
 if(a==='mpa-create')await api('ally/create',{body:{name:v('mpan').trim(),tag:v('mpat').trim()}});
 else if(a==='mpa-apply'){let msg='';if(!t.dataset.open){msg=prompt('Bewerbungstext an die Allianz:','');if(msg===null)return}const r=await api('ally/apply',{body:{tag:id,msg}});toast(r.joined?'Beigetreten':'Bewerbung gesendet','ok')}
 else if(a==='mpa-withdraw'){await api('ally/withdraw',{body:{tag:id}});toast('Bewerbung zurückgezogen','ok')}
 else if(a==='mpa-acc'||a==='mpa-rej')await api('ally/decide',{body:{name:id,accept:a==='mpa-acc'}});
 else if(a==='mpa-rank'){await api('ally/rank',{body:{name:id,rank:t.dataset.r}});toast(id+' ist jetzt '+t.dataset.r.toUpperCase(),'ok')}
 else if(a==='mpa-right'){const rk=t.dataset.r;const cur=new Set(A.rp[rk]||[]);cur.has(id)?cur.delete(id):cur.add(id);await api('ally/rights',{body:{rank:rk,p:[...cur]}})}
 else if(a==='mpa-kick'){if(!confirm(id+' aus der Allianz entfernen?'))return;AL.pick=null;await api('ally/kick',{body:{name:id}})}
 else if(a==='mpa-hand'){if(!confirm('Präsidentschaft (R5) an '+id+' übergeben? Du wirst R4.'))return;AL.pick=null;await api('ally/handover',{body:{name:id}})}
 else if(a==='mpa-leave'){if(!confirm('Allianz wirklich verlassen?'))return;AL.sub='home';await api('ally/leave',{body:{}})}
 else if(a==='mpa-disband'){const c=prompt('Zum Auflösen das Kürzel ['+A.tag+'] eingeben:','');if(!c)return;AL.sub='home';await api('ally/disband',{body:{confirm:c}})}
 else if(a==='mpa-set'){await api('ally/settings',{body:{name:v('mps-n'),tag:v('mps-t'),descr:v('mps-d'),mode:AL.mode||A.mode,logo:AL.edit||A.logo}});AL.edit=null;AL.mode=null;toast('Gespeichert','ok')}
 else if(a==='mpa-circ'){await api('ally/circular',{body:{txt:v('mpacm')}});toast('Rundmail gesendet','ok')}
 else if(a==='mpa-donate'||a==='mpa-give'){const give=a==='mpa-give',pre=give?'mpg-':'mpd-';const res={m:num(pre+'m'),k:num(pre+'k'),g:num(pre+'g')};const ships={};for(const k in GE.SHIP){const n=num(pre+'s-'+k);if(n)ships[k]=n}
  const dm=give?0:num('mpd-dm');if(!res.m&&!res.k&&!res.g&&!dm&&!Object.keys(ships).length){toast('Nichts ausgewählt','err');t.disabled=false;return}
  if(give&&!confirm('An '+AL.to+' senden?'))return;
  const r=await api(give?'ally/give':'ally/donate',{body:{res,ships,dm,pid:GS().cur,to:give?AL.to:undefined}});AL.tr=r.treasury;axFx(give?AL.to:'Tresor',give);toast(give?'Konvoi an '+AL.to+' angekommen':'Danke für deine Spende!','ok')}
 else if(a==='mpa-buy'){const it=A.shop.find(x=>x.id===id);if(!confirm(it.n+' aus dem Tresor kaufen?'))return;const r=await api('ally/buy',{body:{item:id}});AL.tr=r.treasury;toast('Gekauft','ok')}
 AL.list=null;await NET.sync(false);renderAll()}
function axSl(i){const o=document.getElementById(i.id+'-v');if(o)o.textContent=fmt(+i.value)}
function axFx(to,give){AL.fx=`<div class="ax-fx ${give?'give':'don'}"><div class="ax-fxp">${axI('tres')}</div><div class="ax-fxl"><i></i><i></i><i></i></div><div class="ax-fxs">${axI('send')}</div><div class="ax-fxt">${give?'Konvoi → '+esc(to):'Spende → Tresor'}</div></div>`;setTimeout(()=>{AL.fx='';if(view==='ally')renderAlly()},1900)}
document.addEventListener('input',e=>{const i=e.target;if(i&&i.dataset&&i.dataset.sl)axSl(i)},true);

// ---------- v32: Kommandant-HUD (Name + Punkte + Platz) ----------
let rkC={t:0,r:null};
function hud(){const el=document.getElementById('cmdhud');const S=GS();if(!el||!S)return;let pts=0;try{pts=Math.floor(ENGINE.totalPoints())}catch(e){}
 if(Date.now()-rkC.t>30e3&&window.RANK){rkC.t=Date.now();try{const L=RANK.players('tot');const m=L.find(x=>x.me);rkC.r=m?m.rank:null;rkC.n=L.length}catch(e){}}
 const h=`<div class="hn"><i class="${NET.on?(NET.err?'off':''):'off'}" title="${NET.on?(NET.err?'Server nicht erreichbar':'Online'):'Einzelspieler'}"></i>${esc(S.cmdName||'Kommandant')}</div><div class="hp">★ ${fmt(pts)}${rkC.r?`<b>#${rkC.r}</b>`:''}</div>`;
 if(el._h!==h){el._h=h;el.innerHTML=h}}
NET.hud=hud;
// ---------- v32: Anmeldebildschirm nach dem Ladebildschirm ----------
function loginScreen(msg){if(document.getElementById('mplogin'))return;const d=document.createElement('div');d.id='mplogin';let tab='in';
 const draw=()=>{d.innerHTML=`<div class="lg glass"><h1>GALAXY EMPIRE</h1><div class="sub">Gemeinsames Universum · Tempo 10×</div>
  <div class="tabs"><button data-t="in" class="${tab==='in'?'on':''}">Anmelden</button><button data-t="reg" class="${tab==='reg'?'on':''}">Registrieren</button></div>
  <form autocomplete="on"><input id="lg_n" name="username" autocomplete="username" placeholder="Kommandantenname" maxlength="16" value="${esc(NET.cfg.name||'')}">
  <input id="lg_p" name="password" type="password" inputmode="numeric" autocomplete="${tab==='in'?'current-password':'new-password'}" placeholder="PIN (4–8 Ziffern)" maxlength="8">
  ${tab==='reg'?'<input id="lg_i" placeholder="Einladungscode" maxlength="32" autocomplete="off">':''}
  <button class="go" type="submit">${tab==='in'?'Anmelden':'Konto erstellen'}</button></form>
  <div class="er">${esc(msg||'')}</div><button class="off" data-off="1">Offline spielen (Einzelspieler)</button></div>`;
  d.querySelector('form').onsubmit=async e=>{e.preventDefault();const v=id=>((d.querySelector('#'+id)||{}).value||'').trim();const er=d.querySelector('.er');const b=d.querySelector('.go');
   const n=v('lg_n'),p=v('lg_p'),i=v('lg_i');
   if(n.length<3)return er.textContent='Bitte einen Namen mit mindestens 3 Zeichen eingeben.';if(!/^\d{4,8}$/.test(p))return er.textContent='Die PIN muss aus 4 bis 8 Ziffern bestehen.';if(tab==='reg'&&!i)return er.textContent='Bitte den Einladungscode eingeben.';
   b.disabled=true;b.textContent='Verbinde…';er.textContent='';
   try{const url=NET.cfg.url||NET.DEFAULT_URL;if(tab==='in')await NET.login(url,n,p);else await NET.register(url,n,p,i);close();toast(`Willkommen, ${n}!`,'ok',3000)}
   catch(err){b.disabled=false;b.textContent=tab==='in'?'Anmelden':'Konto erstellen';er.textContent=de(err.message)}};
  d.querySelectorAll('[data-t]').forEach(x=>x.onclick=()=>{msg='';tab=x.dataset.t;draw()});
  d.querySelector('[data-off]').onclick=()=>{try{sessionStorage.setItem('ge_mp_off','1')}catch(e){}if(NET.on){location.reload();return}close()}};
 const close=()=>{d.classList.add('out');setTimeout(()=>d.remove(),550)};
 draw();document.body.appendChild(d)}
const de=m=>/fetch|network|Failed/i.test(m)?'Server nicht erreichbar – bitte Internetverbindung prüfen.':/HTTP 5/.test(m)?'Serverfehler – bitte später erneut versuchen.':m;
NET.loginScreen=loginScreen;
function bootGate(){if(sessionStorage.getItem('ge_mp_off'))return;
 if(NET.on){api('me').catch(e=>{if(/401|403|Token|Sitzung|anmelden|unauth/i.test(e.message)){localStorage.removeItem(LS);loginScreen('Sitzung abgelaufen – bitte neu anmelden.')}});return}
 loginScreen()}
// ---------- UI (nach dem Laden der Oberfläche) ----------
let mpDone=false;
function installMP(){const E=window.ENGINE;if(mpDone)return;mpDone=true;E.journalEnabled=true;{E.slotHook=NET.slotHook;E.onSend=onSend;E.pvpArrive=f=>{setTimeout(resolveLoop,300)};E.extIncoming=NET.extIncoming;
  setInterval(resolveLoop,5000);setInterval(()=>{if(document.visibilityState==='visible'&&view==='chat'){const ch=AL.ch;chatLoad(ch).then(n=>{if(n&&view==='chat')mpChat()})}},8000);
  window.renderAlly=mpAlly;window.renderChat=mpChat;
    document.addEventListener('click',async e=>{const t=e.target.closest('[data-act^="mpa-"],[data-act^="mpc-"]');if(!t||t.tagName==='SELECT')return;e.stopPropagation();const a=t.dataset.act;
   try{if(a==='mpc-ch'){AL.ch=t.dataset.id;AL.last[AL.ch]=0;mpChat()}else if(a==='mpc-send')await sendChat();else{t.disabled=true;await allyAct(a,t)}}catch(err){t.disabled=false;toast(err.message,'err',4000)}},true);
const ss=E.setSpeed;E.setSpeed=function(sp){if(sp!==(NET.cfg.speed||10)){toast('Im Mehrspieler-Universum ist das Tempo fest ('+(NET.cfg.speed||10)+'×)','err');return}return ss.call(this,sp)};
  setTimeout(()=>NET.pull().then(()=>NET.sync(true)).then(()=>{if(NET.err)toast('Server nicht erreichbar: '+NET.err,'err',4000);else{try{renderAll()}catch(e){}}}),1500);
  setInterval(()=>{if(document.visibilityState==='visible')NET.sync(false)},120e3);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')NET.pushSave(true).catch(()=>{});else setTimeout(()=>NET.checkGifts(),1500)});setTimeout(()=>NET.checkGifts(),1500);setInterval(()=>{if(document.visibilityState==='visible')NET.checkGifts()},300e3)}
}

// Admin-Geschenke: beim Start/Zurückkehren abrufen, Popup zeigen, serverseitig einlösen (einmalig, geräteübergreifend)
let giftBusy=false;
NET.checkGifts=async function(){const S=GS();if(!NET.on||!S||giftBusy)return;giftBusy=true;try{const r=await api('gifts');S.gifts=S.gifts||{};let fixed=false;
 ENGINE.externalGifts=ENGINE.externalGifts||{};for(const g of r.gifts||[]){if(g.claimed)ENGINE.externalGifts[g.id]=g.dm;if(g.claimed&&!S.gifts[g.id]){ENGINE.applyGift(g.id,g.dm);fixed=true}} // eingelöst, aber im lokalen Stand fehlend → nachtragen
 if(fixed){try{save()}catch(e){}NET.pushSave().catch(()=>{})}
 const g=(r.gifts||[]).find(x=>!x.claimed&&!S.gifts[x.id]);if(g)await giftPopup(g)}catch(e){if(e.status!==404)console.warn('gifts',e.message)}finally{giftBusy=false}};
function giftPopup(g){return new Promise(res=>{const d=document.createElement('div');d.id='ge-gift';d.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6)';
 d.innerHTML=`<div class="glass" style="max-width:360px;margin:16px;padding:20px;border-radius:16px;text-align:center;background:rgba(20,16,40,.95);border:1px solid rgba(255,200,90,.5)"><div style="font-size:12px;letter-spacing:2px;color:#f5c75a">GESCHENK VON ${esc(g.sender||'Admin')}</div><div style="font-size:18px;margin:10px 0">${esc(g.msg||'')}</div><div style="font-size:26px;font-weight:700;margin:8px 0 14px">${Number(g.dm).toLocaleString('de-DE')} DM</div><button class="btn" data-gift="1" style="min-width:160px">Einsammeln</button></div>`;
 document.body.appendChild(d);const b=d.querySelector('[data-gift]');b.onclick=async()=>{if(b.disabled)return;b.disabled=true;b.textContent='…';
  try{const x=await api('gift/claim',{body:{id:g.id}});const S=GS();ENGINE.externalGifts=ENGINE.externalGifts||{};ENGINE.externalGifts[g.id]=x.dm;if(ENGINE.applyGift(g.id,x.dm))toast('+'+x.dm+' Dunkle Materie eingesammelt','ok',4000);try{save()}catch(e){}try{renderAll()}catch(e){}await NET.pushSave().catch(()=>{});d.remove();res(true)}
  catch(e){b.disabled=false;b.textContent='Einsammeln';toast('Server: '+e.message,'err',4000)}}})}
function ui(){NET._ui=1;if(NET.on)installMP();setInterval(hud,2000);setTimeout(hud,300);
 {const L=document.getElementById('loader');if(!L)bootGate();else{const mo=new MutationObserver(()=>{if(!document.getElementById('loader')){mo.disconnect();bootGate()}});mo.observe(document.body,{childList:true});
  const t=setInterval(()=>{if(L.classList.contains('done')){clearInterval(t);bootGate()}},200)}}
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
