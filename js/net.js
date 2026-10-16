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
const AL={tab:'ally',list:null,listT:0,chat:{},last:{},ch:'global',sub:'home',tr:null,edit:null};NET.AL=AL;
async function alLoad(){try{AL.list=(await api('ally/list')).allies||[];AL.listT=Date.now()}catch(e){AL.err=e.message}}
NET.logoData=tag=>{if(!tag)return null;if(NET.ally&&NET.ally.tag===tag)return NET.ally.logo;if((!AL.list||Date.now()-AL.listT>60e3)&&!AL.loading){AL.loading=1;alLoad().finally(()=>{AL.loading=0})}const a=(AL.list||[]).find(x=>x.tag===tag);return a?a.logo:null};
NET.logoHtml=(tag,sz)=>{const l=NET.logoData(tag);return l&&window.ALLY&&ALLY.emblem?ALLY.emblem(l,sz||16)+' ':''};
async function chatLoad(ch){const arr=AL.chat[ch]||(AL.chat[ch]=[]);const since=arr.length?arr[arr.length-1].id:0;try{const r=await api('chat?ch='+encodeURIComponent(ch)+'&since='+since);if(r.msgs&&r.msgs.length){arr.push(...r.msgs);if(arr.length>200)arr.splice(0,arr.length-200);return true}}catch(e){AL.err=e.message}return false}
const PERMN={acc:'Bewerbungen annehmen',kick:'Mitglieder entfernen',rank:'Ränge bearbeiten/vergeben',set:'Einstellungen ändern',msg:'Rundmail',treas:'Tresor verwalten',shop:'Shop nutzen'};
const MODEN={open:'Offen (sofort beitreten)',apply:'Nur Bewerbung',closed:'Geschlossen'};
const RES3=[['m','Metall'],['k','Kristall'],['g','Gas']];
function rankName(A,id){return id==='founder'?'Gründer':((A.ranks||[]).find(r=>r.id===id)||{}).n||id}
function mpAlly(){const b=$('#allybody');b.className='vbody glass';const A=NET.ally;const me=NET.cfg.name;let h='<div class="disp"><div>';const em=(l,s)=>window.ALLY?ALLY.emblem(l,s):'';
 if(!AL.list){alLoad().then(()=>{if(view==='ally')renderAlly()})}
 if(!A){h+=`<div class="box"><b>Allianz gründen</b><div class="row" style="margin-top:6px"><input id="mpan" placeholder="Name (3–30)" maxlength="30" style="flex:1"><input id="mpat" placeholder="Kürzel" maxlength="5" style="width:80px"></div><button class="btn" style="margin-top:8px" data-act="mpa-create">${IC.ally} Gründen</button></div>`;
  h+=`<div class="box" style="margin-top:8px"><b>Allianzen im Universum</b>${AL.list?AL.list.length?`<table class="tbl" style="margin-top:4px">${AL.list.map(a=>{const ap=(a.apps||[]).some(x=>x.n===me);return`<tr><td>${em(a.logo,30)}</td><td><span class="badge">${esc(a.tag)}</span> ${esc(a.name)}<div class="mut" style="font-size:11px">${a.members.length} Mitglieder · Gründer ${PN(a.founder)} · ${MODEN[a.mode]||''}</div>${a.descr?`<div class="mut" style="font-size:11px">${esc(a.descr)}</div>`:''}</td><td style="text-align:right">${ap?`<span class="mut">beworben</span> <button class="btn sm ghost" data-act="mpa-withdraw" data-id="${esc(a.tag)}">Zurückziehen</button>`:a.mode==='closed'?'<span class="mut">geschlossen</span>':a.mode==='open'?`<button class="btn sm green" data-act="mpa-apply" data-id="${esc(a.tag)}" data-open="1">Beitreten</button>`:`<button class="btn sm" data-act="mpa-apply" data-id="${esc(a.tag)}">Bewerben</button>`}</td></tr>`}).join('')}</table>`:'<div class="mut">Noch keine Allianzen.</div>':'<div class="mut">Lädt…</div>'}</div>`}
 else{const P=new Set(A.perms||[]);const founder=A.rank==='founder';const tabs=[['home','Übersicht'],['mem','Mitglieder'],...(P.has('acc')?[['apps',`Bewerbungen (${(A.apps||[]).length})`]]:[]),['ranks','Ränge'],['tres','Tresor'],['shop','Shop'],['set','Einstellungen']];
  if(!tabs.some(t=>t[0]===AL.sub))AL.sub='home';
  h+=`<div class="box"><div class="row">${em(A.logo,44)}<div style="margin-left:8px"><b style="font-size:16px">${esc(A.name)}</b> <span class="badge own">${esc(A.tag)}</span><div class="mut" style="font-size:11px">${rankName(A,A.rank)} · ${A.members.length} Mitglieder · ${MODEN[A.mode]||''}</div></div></div>
   <div class="row" style="margin-top:8px;gap:4px;flex-wrap:wrap">${tabs.map(t=>`<button class="btn sm ${AL.sub===t[0]?'':'ghost'}" data-act="mpa-sub" data-id="${t[0]}">${t[1]}</button>`).join('')}</div></div>`;
  const box=(t,x)=>`<div class="box" style="margin-top:8px"><b>${t}</b>${x}</div>`;
  if(AL.sub==='home'){h+=box('Beschreibung',A.descr?`<div class="desc" style="margin-top:6px">${esc(A.descr)}</div>`:'<div class="mut">Keine Beschreibung.</div>');
   h+=box('Aktive Allianz-Boni',(A.buffs||[]).length?A.buffs.map(x=>`<div>+${Math.round(x.v*100)} % ${x.buff==='prod'?'Produktion':x.buff==='hull'?'Hülle':'Energie'} · noch <span data-end="${S_now(x.end)}"></span></div>`).join('')+'<div class="mut" style="font-size:11px">Zählt wie ein Item: der stärkste Bonus gilt, nichts stapelt.</div>':'<div class="mut">Keine. Im Shop mit Tresormitteln kaufbar.</div>');
   if(P.has('msg'))h+=box('Rundmail an alle Mitglieder',`<div class="row" style="margin-top:6px"><input id="mpacm" maxlength="300" placeholder="Nachricht…" style="flex:1"><button class="btn sm" data-act="mpa-circ">Senden</button></div>`)}
  if(AL.sub==='mem'){h+=box(`Mitglieder (${A.members.length})`,`<table class="tbl" style="margin-top:4px">${A.members.map(m=>{const other=m.n!==me&&m.rank!=='founder';return`<tr><td>${PN(m.n)}${m.n===me?' (Du)':''}</td><td>${P.has('rank')&&other?`<select data-act="mpa-rank" data-id="${esc(m.n)}">${A.ranks.map(r=>`<option value="${esc(r.id)}" ${r.id===m.rank?'selected':''} ${r.p.every(p=>P.has(p))?'':'disabled'}>${esc(r.n)}</option>`).join('')}</select>`:`<span class="mut">${esc(rankName(A,m.rank))}</span>`}</td><td style="text-align:right">${P.has('kick')&&other?`<button class="btn sm ghost" data-act="mpa-kick" data-id="${esc(m.n)}">Entfernen</button>`:''}${founder&&m.n!==me?` <button class="btn sm ghost" data-act="mpa-hand" data-id="${esc(m.n)}">Führung übergeben</button>`:''}</td></tr>`}).join('')}</table><div class="mut" style="font-size:11px;margin-top:4px">Namen antippen öffnet den Privatchat.</div>`)}
  if(AL.sub==='apps'){h+=box(`Bewerbungen (${(A.apps||[]).length})`,(A.apps||[]).length?`<table class="tbl" style="margin-top:4px">${A.apps.map(x=>`<tr><td>${PN(x.n)}${x.msg?`<div class="mut" style="font-size:11px">„${esc(x.msg)}“</div>`:''}</td><td style="text-align:right"><button class="btn sm green" data-act="mpa-acc" data-id="${esc(x.n)}">Annehmen</button> <button class="btn sm ghost" data-act="mpa-rej" data-id="${esc(x.n)}">Ablehnen</button></td></tr>`).join('')}</table>`:'<div class="mut">Keine offenen Bewerbungen.</div>')}
  if(AL.sub==='ranks'){const ed=P.has('rank');h+=box('Ränge',`<div class="mut" style="font-size:11px">Gründer: alle Rechte. Niemand kann Rechte über seinen eigenen vergeben.</div><table class="tbl" style="margin-top:4px"><tr><th>Rang</th>${Object.values(PERMN).map(n=>`<th style="font-size:10px">${n}</th>`).join('')}<th></th></tr>${A.ranks.map(r=>{const mine=r.p.every(p=>P.has(p))&&(founder||r.id!==A.rank);return`<tr><td>${ed&&mine?`<input id="mpr-n-${esc(r.id)}" value="${esc(r.n)}" maxlength="20" style="width:90px">`:esc(r.n)}</td>${Object.keys(PERMN).map(p=>`<td style="text-align:center"><input type="checkbox" id="mpr-${esc(r.id)}-${p}" ${r.p.includes(p)?'checked':''} ${ed&&mine&&P.has(p)?'':'disabled'}></td>`).join('')}<td>${ed&&mine?`<button class="btn sm" data-act="mpa-rsave" data-id="${esc(r.id)}">Speichern</button>${r.id!=='member'?` <button class="btn sm ghost" data-act="mpa-rdel" data-id="${esc(r.id)}">Löschen</button>`:''}`:''}</td></tr>`}).join('')}</table>
   ${ed?`<div class="row" style="margin-top:6px"><input id="mpr-n-new" placeholder="Neuer Rang" maxlength="20" style="flex:1">${Object.keys(PERMN).map(p=>`<label style="font-size:10px"><input type="checkbox" id="mpr-new-${p}" ${P.has(p)?'':'disabled'}>${PERMN[p]}</label>`).join(' ')}<button class="btn sm" data-act="mpa-rsave" data-id="">Anlegen</button></div>`:''}`)}
  if(AL.sub==='tres'){const T=AL.tr;if(!T){api('ally/treasury').then(r=>{AL.tr=r.treasury;if(view==='ally')renderAlly()}).catch(e=>toast(e.message,'err'))}
   const pl=GS().planets[GS().cur];const shipsHere=Object.entries(pl.ships||{}).filter(([k,n])=>n>0);
   h+=box('Tresor',T?`<div class="row" style="gap:12px;margin-top:4px">${RES3.map(([r,n])=>`<span>${n}: <b>${fmt(T.r[r])}</b></span>`).join('')}<span>DM: <b>${fmt(T.dm)}</b></span></div><div class="mut" style="font-size:11px">${Object.entries(T.ships).map(([k,n])=>`${n}× ${(GE.SHIP[k]||{}).n||k}`).join(', ')||'Keine Schiffe'}</div>`:'<div class="mut">Lädt…</div>');
   h+=box(`Spenden von ${esc(pl.name)}`,`<div class="row" style="margin-top:6px;gap:6px;flex-wrap:wrap">${RES3.map(([r,n])=>`<input id="mpd-${r}" type="number" min="0" placeholder="${n} (max ${fmt(Math.floor(pl.r[r]))})" style="width:130px">`).join('')}<input id="mpd-dm" type="number" min="0" placeholder="DM (max ${fmt(GS().dm||0)})" style="width:110px"></div>
    ${shipsHere.length?`<div class="row" style="margin-top:6px;gap:6px;flex-wrap:wrap">${shipsHere.map(([k,n])=>`<label style="font-size:11px">${(GE.SHIP[k]||{}).n||k} <input id="mpd-s-${k}" type="number" min="0" max="${n}" placeholder="0–${n}" style="width:70px"></label>`).join('')}</div>`:'<div class="mut" style="font-size:11px">Keine Schiffe auf diesem Planeten (unterwegs zählen nicht).</div>'}
    <button class="btn sm green" style="margin-top:6px" data-act="mpa-donate">Spenden</button><div class="mut" style="font-size:11px">Spenden gehen sofort und endgültig vom Planeten in den Tresor. DM können nur im Shop verwendet, nicht ausgezahlt werden.</div>`);
   if(P.has('treas')&&T)h+=box('Aus dem Tresor verteilen',`<div class="row" style="margin-top:6px;gap:6px;flex-wrap:wrap"><select id="mpg-to">${A.members.map(m=>`<option>${esc(m.n)}</option>`).join('')}</select>${RES3.map(([r,n])=>`<input id="mpg-${r}" type="number" min="0" placeholder="${n}" style="width:110px">`).join('')}${Object.entries(T.ships).map(([k,n])=>`<label style="font-size:11px">${(GE.SHIP[k]||{}).n||k} <input id="mpg-s-${k}" type="number" min="0" max="${n}" style="width:60px"></label>`).join('')}</div><button class="btn sm" style="margin-top:6px" data-act="mpa-give">Zuteilen (Heimatplanet des Mitglieds)</button>`);
   if(T){const don=Object.entries(T.don).sort((a,b)=>b[1].v-a[1].v);h+=box('Spender',don.length?don.map(([n,d])=>`<div>${PN(n)}: ${fmt(d.v)} Ressourcenwert${d.dm?` · ${d.dm} DM`:''}</div>`).join(''):'<div class="mut">Noch keine Spenden.</div>');
    h+=box('Tresorbuch (letzte 100)',T.log.length?`<table class="tbl" style="margin-top:4px">${T.log.map(l=>`<tr><td class="mut" style="font-size:10px">${new Date(l.t).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</td><td>${PN(l.by)} ${l.kind==='donate'?'spendet':l.kind==='give'?'teilt '+esc(l.to)+' zu':'kauft '+esc((A.shop.find(x=>x.id===l.item)||{}).n||l.item)}</td><td style="font-size:11px">${RES3.filter(([r])=>l.res&&l.res[r]).map(([r,n])=>fmt(l.res[r])+' '+n[0]).join(' ')}${l.dm?' '+l.dm+' DM':''}${l.ships&&Object.keys(l.ships).length?' · '+Object.entries(l.ships).map(([k,n])=>n+'× '+((GE.SHIP[k]||{}).n||k)).join(', '):''}</td></tr>`).join('')}</table>`:'<div class="mut">Leer.</div>')}}
  if(AL.sub==='shop'){const T=AL.tr;if(!T)api('ally/treasury').then(r=>{AL.tr=r.treasury;if(view==='ally')renderAlly()});
   h+=box('Allianz-Shop',`<div class="mut" style="font-size:11px">Bezahlt aus dem Tresor. Boni gelten für alle Mitglieder, zählen wie Items (stärkster gilt, kein Stapeln) und lassen sich bis 72 h verlängern.</div><table class="tbl" style="margin-top:4px">${(A.shop||[]).map(it=>{const own=it.cos&&(A.cos||[]).includes(it.cos);return`<tr><td>${esc(it.n)}</td><td style="font-size:11px">${RES3.filter((_,i)=>it.c[i]).map(([r,n],i)=>fmt(it.c[RES3.findIndex(x=>x[0]===r)])+' '+n[0]).join(' ')}${it.dm?' '+it.dm+' DM':''}</td><td style="text-align:right">${own?'<span class="mut">freigeschaltet</span>':P.has('shop')?`<button class="btn sm" data-act="mpa-buy" data-id="${it.id}">Kaufen</button>`:'<span class="mut">Recht „Shop nutzen“ fehlt</span>'}</td></tr>`}).join('')}</table>`)}
  if(AL.sub==='set'){const L=AL.edit||(AL.edit={...A.logo});const cos=A.cos||[];
   if(P.has('set')){h+=box('Einstellungen',`<div class="row" style="margin-top:6px;gap:6px"><input id="mps-n" value="${esc(A.name)}" maxlength="30" style="flex:1"><input id="mps-t" value="${esc(A.tag)}" maxlength="5" style="width:70px"></div>
     <textarea id="mps-d" maxlength="300" rows="3" style="width:100%;margin-top:6px" placeholder="Beschreibung">${esc(A.descr||'')}</textarea>
     <div class="row" style="margin-top:6px"><span class="mut">Aufnahme</span><select id="mps-m">${Object.entries(MODEN).map(([k,n])=>`<option value="${k}" ${A.mode===k?'selected':''}>${n}</option>`).join('')}</select></div>
     <div class="row" style="margin-top:10px;gap:10px"><div>${em(L,72)}</div><div style="flex:1">
      <div class="row" style="gap:3px;flex-wrap:wrap"><span class="mut" style="width:62px">Form</span>${ALLY.EMSH.map((_,i)=>`<button class="al-sy ${L.sh===i?'on':''}" data-act="mpa-logo" data-k="sh" data-v="${i}">${em({...L,sh:i},24)}</button>`).join('')}</div>
      <div class="row" style="gap:3px;flex-wrap:wrap;margin-top:3px"><span class="mut" style="width:62px">Symbol</span>${ALLY.EMS.map((_,i)=>i>=6&&!cos.includes('sym')?'':`<button class="al-sy ${L.s===i?'on':''}" data-act="mpa-logo" data-k="s" data-v="${i}">${em({...L,s:i},24)}</button>`).join('')}</div>
      <div class="row" style="gap:3px;margin-top:3px"><span class="mut" style="width:62px">Farbe</span>${ALLY.EMC.map((c,i)=>`<button class="al-sw ${L.c===i?'on':''}" style="background:${c}" data-act="mpa-logo" data-k="c" data-v="${i}"></button>`).join('')}</div>
      <div class="row" style="gap:3px;margin-top:3px"><span class="mut" style="width:62px">Feld</span>${ALLY.EMC.map((c,i)=>`<button class="al-sw ${L.c2===i?'on':''}" style="background:${c}" data-act="mpa-logo" data-k="c2" data-v="${i}"></button>`).join('')}</div>
      <div class="row" style="gap:8px;margin-top:3px">${cos.includes('gold')?`<label><input type="checkbox" id="mps-fr" ${L.fr==='gold'?'checked':''} data-act="mpa-logo" data-k="fr">Goldrahmen</label>`:''}${cos.includes('glow')?`<label><input type="checkbox" id="mps-gl" ${L.gl?'checked':''} data-act="mpa-logo" data-k="gl">Nebelglühen</label>`:''}</div></div></div>
     <button class="btn sm" style="margin-top:8px" data-act="mpa-set">Speichern</button>`)}
   else h+=box('Einstellungen','<div class="mut">Recht „Einstellungen ändern“ fehlt.</div>');
   h+=box('Mitgliedschaft',`<div class="row" style="margin-top:6px;gap:6px"><button class="btn sm ghost" data-act="mpa-leave">Allianz verlassen</button>${founder?'<button class="btn sm ghost" style="color:var(--bad)" data-act="mpa-disband">Allianz auflösen</button>':''}</div>${founder?'<div class="mut" style="font-size:11px">Als Gründer zuerst die Führung übergeben (Mitglieder) – sonst übernimmt beim Verlassen das Mitglied mit den meisten Rechten.</div>':''}`)}}
 h+='</div><div>';const rows=NET.rankList().sort((a,b)=>b.tot-a.tot);h+=`<div class="box"><b>Rangliste</b><table class="tbl" style="margin-top:4px">${rows.slice(0,15).map((r,i)=>`<tr class="${r.me?'cur':''}"><td>${i+1}</td><td>${PNx(r.n)}${r.tag?` ${NET.logoHtml(r.tag,14)}<span class="badge">${esc(r.tag)}</span>`:''}</td><td style="text-align:right">${fmt(r.tot)}</td></tr>`).join('')}</table></div></div></div>`;
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
async function allyAct(a,t){const v=id=>(document.getElementById(id)||{}).value||'';const num=id=>Math.max(0,Math.floor(+v(id)||0));const chk=id=>!!(document.getElementById(id)||{}).checked;const id=t.dataset.id;const A=NET.ally;
 if(a==='mpa-sub'){AL.sub=id;AL.tr=null;AL.edit=null;renderAlly();return}
 if(a==='mpa-logo'){const L=AL.edit||(AL.edit={...A.logo});const k=t.dataset.k;if(k==='fr')L.fr=t.checked?'gold':undefined;else if(k==='gl')L.gl=t.checked?1:0;else L[k]=+t.dataset.v;renderAlly();return}
 if(a==='mpa-create')await api('ally/create',{body:{name:v('mpan').trim(),tag:v('mpat').trim()}});
 else if(a==='mpa-apply'){let msg='';if(!t.dataset.open){msg=prompt('Bewerbungstext an die Allianz:','');if(msg===null)return}const r=await api('ally/apply',{body:{tag:id,msg}});toast(r.joined?'Beigetreten':'Bewerbung gesendet','ok')}
 else if(a==='mpa-withdraw'){await api('ally/withdraw',{body:{tag:id}});toast('Bewerbung zurückgezogen','ok')}
 else if(a==='mpa-acc'||a==='mpa-rej')await api('ally/decide',{body:{name:id,accept:a==='mpa-acc'}});
 else if(a==='mpa-rank')await api('ally/rank',{body:{name:id,rank:t.value}});
 else if(a==='mpa-rsave'){const k=id||'new';await api('ally/rankdef',{body:{id:id||undefined,n:v('mpr-n-'+k),p:Object.keys(PERMN).filter(p=>chk('mpr-'+k+'-'+p))}});toast('Rang gespeichert','ok')}
 else if(a==='mpa-rdel'){if(!confirm('Rang löschen? Mitglieder werden zu „Mitglied“.'))return;await api('ally/rankdef',{body:{id,del:1}})}
 else if(a==='mpa-kick'){if(!confirm(id+' aus der Allianz entfernen?'))return;await api('ally/kick',{body:{name:id}})}
 else if(a==='mpa-hand'){if(!confirm('Führung an '+id+' übergeben? Du verlierst die Gründerrechte.'))return;await api('ally/handover',{body:{name:id}})}
 else if(a==='mpa-leave'){if(!confirm('Allianz wirklich verlassen?'))return;await api('ally/leave',{body:{}})}
 else if(a==='mpa-disband'){const c=prompt('Zum Auflösen das Kürzel ['+A.tag+'] eingeben:','');if(!c)return;await api('ally/disband',{body:{confirm:c}})}
 else if(a==='mpa-set'){const r=await api('ally/settings',{body:{name:v('mps-n'),tag:v('mps-t'),descr:v('mps-d'),mode:v('mps-m'),logo:AL.edit||A.logo}});AL.edit=null;toast('Gespeichert','ok')}
 else if(a==='mpa-circ'){await api('ally/circular',{body:{txt:v('mpacm')}});toast('Rundmail gesendet','ok')}
 else if(a==='mpa-donate'||a==='mpa-give'){const give=a==='mpa-give',pre=give?'mpg-':'mpd-';const res={m:num(pre+'m'),k:num(pre+'k'),g:num(pre+'g')};const ships={};for(const k in GE.SHIP){const n=num(pre+'s-'+k);if(n)ships[k]=n}
  if(!give){await NET.pushSave();if(!confirm('Wirklich spenden? Das ist endgültig.'))return}
  const r=await api(give?'ally/give':'ally/donate',{body:{res,ships,dm:give?0:num('mpd-dm'),pid:GS().cur,to:give?v('mpg-to'):undefined}});AL.tr=r.treasury;
  if(r.z){await NET.acceptCanonical(r,Infinity);try{save()}catch(e){}}toast(give?'Zugeteilt':'Gespendet – danke!','ok')}
 else if(a==='mpa-buy'){const it=A.shop.find(x=>x.id===id);if(!confirm(it.n+' aus dem Tresor kaufen?'))return;const r=await api('ally/buy',{body:{item:id}});AL.tr=r.treasury;toast('Gekauft','ok')}
 AL.list=null;await NET.sync(false);renderAll()}

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
  document.addEventListener('change',async e=>{const t=e.target.closest('select[data-act="mpa-rank"]');if(!t)return;try{await allyAct('mpa-rank',t)}catch(err){toast(err.message,'err',4000);renderAlly()}},true);
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
