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
  const snap=S.order.map(id=>S.planets[id]).filter(p=>!p.moon).map(p=>({g:p.g,s:p.s,p:p.p,r:{m:Math.floor(p.r.m),k:Math.floor(p.r.k),g:Math.floor(p.r.g)},ships:{...p.ships},def:{...p.def}}));
  NET.uni=await api('pub',{body:{pts:breakdown(),tag:S.ally?S.ally.tag:null,ally:S.ally?S.ally.name:null,planets,snap,tech:ENGINE.techOf()}});
  NET.incoming=NET.uni.incoming||[];NET.ally=NET.uni.ally||null;const evs0=NET.uni.events||[];delete NET.uni.events;
  if(NET.ally)S.ally={name:NET.ally.name,tag:NET.ally.tag,created:S.ally&&S.ally.tag===NET.ally.tag?S.ally.created:Date.now(),mp:1};else if(S.ally&&S.ally.mp)S.ally=null;
  if(evs0.length&&applyEvents(evs0)){await api('ack',{body:{ids:evs0.map(e=>e.id)}});try{save()}catch(e){}if(!NET._re){NET._re=1;try{await NET.sync(false)}finally{NET._re=0}}}NET.lastSync=Date.now();NET.err=null;
  try{localStorage.setItem('ge_mp_uni',JSON.stringify({...NET.uni,players:NET.uni.players,npcs:NET.uni.npcs}))}catch(e){}
  if(window.RANK)RANK.g=null;rkC.t=0;try{hud()}catch(e){}
  if(withSave||Date.now()-NET.lastSave>10*60e3){await NET.pushSave()}
 }catch(e){NET.err=e.message}};
NET.pushSave=async function(keepalive){const S=GS();if(!S)return;const z=await zip(JSON.stringify(S));await api('save',{body:{z,t:S.t},keepalive:keepalive&&z.length<60000});NET.lastSave=Date.now()};
// Anmeldung: Server-Spielstand holen und lokal ablegen, dann neu laden
async function enter(res,url){const c={url,token:res.token,name:res.name,home:res.home,speed:res.speed,seed:res.seed||4242};NET.cfg=c;
 const key='ge_mp_save_'+String(res.name).toLowerCase();
 if(res.hasSave){try{const s=await api('save');const local=JSON.parse(localStorage.getItem(key)||'null');if(!local||(local.t||0)<s.t)localStorage.setItem(key,await unzip(s.z))}catch(e){}}
 localStorage.setItem(LS,JSON.stringify(c));localStorage.removeItem('ge_mp_off');
 if(!window.GE_REBOOT||!NET._ui){location.reload();return}
 NET.on=true;window.NET_KEY=key;ENGINE.mp=true;NET.uni=null;installMP();rkC.t=0;GE_REBOOT(key);setTimeout(()=>{try{renderAll()}catch(e){}},2500)}
NET.register=async(url,name,pin,invite)=>enter(await api('register',{url,noauth:true,body:{name,pin,invite}}),url);
NET.login=async(url,name,pin)=>enter(await api('login',{url,noauth:true,body:{name,pin}}),url);
NET.logout=async function(){try{await NET.pushSave()}catch(e){}localStorage.removeItem(LS);location.reload()};
// ---------- Galaxie: echte Spieler + NPC-Spieler an ihren Koordinaten ----------
const h32=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
function index(){const U=NET.uni;if(!U)return{};if(U._idx)return U._idx;const idx={};const me=String(NET.cfg.name||'').toLowerCase();
 for(const p of U.players||[]){if(String(p.name).toLowerCase()===me)continue;const tot=p.pts.b+p.pts.t+p.pts.f+p.pts.d;for(const pl of p.planets||[]){if(pl.moon)continue;idx[pl.g+':'+pl.s+':'+pl.p]={kind:'player',player:p.name,pts:tot,ally:p.tag,name:pl.name||'Planet',real:1}}}
 for(const x of U.npcs||[]){const tot=x.pts.b+x.pts.t+x.pts.f+x.pts.d;idx[x.home.join(':')]={kind:'player',player:x.n,pts:Math.max(50,tot),ally:x.tag,name:'Heimatplanet',npcp:x.type,npcid:x.id}}
 Object.defineProperty(U,'_idx',{value:idx,enumerable:false});return idx}
NET.slotHook=(g,s,p)=>index()[g+':'+s+':'+p]||null;
// ---------- Rangliste ----------
NET.rankList=function(){const U=NET.uni||{ranking:[]};const me=String(NET.cfg.name||'').toLowerCase();const out=[];
 for(const x of U.ranking||[]){if(!x.npc&&String(x.n).toLowerCase()===me)continue;const p=x.pts||{};out.push({id:x.id,n:x.n+(x.npc?'':' 👤'),tag:x.tag,act:x.npc?!(x.type==='pausing'&&false):(Date.now()-(x.seen||0)<7*864e5),home:x.home,hue:h32(x.n)%360,tot:x.tot,b:p.b||0,t:p.t||0,f:p.f||0,d:p.d||0,real:!x.npc})}
 const S=GS();const b=breakdown();const home=S.planets[S.home];out.push({id:'me',n:S.cmdName,tag:S.ally?S.ally.tag:null,act:true,me:1,home:[home.g,home.s,home.p],hue:190,...b,tot:b.b+b.t+b.f+b.d});return out};

// ---------- Stufe 2: Angriffe / Spionage / Transporte zwischen Spielern (Kampf auf dem Server) ----------
const fmtR=o=>['m','k','g'].filter(r=>o&&o[r]>0).map(r=>(window.fmt?fmt(Math.floor(o[r])):Math.floor(o[r]))+' '+({m:'Metall',k:'Kristall',g:'Gas'})[r]).join(', ')||'nichts';
function planetAt(S,c){for(const id of S.order){const p=S.planets[id];if(!p.moon&&p.g===c.g&&p.s===c.s&&p.p===c.p)return p}return null}
function applyEvents(evs){const S=GS();const E=ENGINE;if(!S)return false;let any=false;
 for(const ev of evs){any=true;const c=ev.to||{};const pl=planetAt(S,c);const where=pl?`${pl.name} [${c.g}:${c.s}:${c.p}]`:`[${c.g}:${c.s}:${c.p}]`;
  try{if(ev.kind==='attacked'){if(pl){for(const k in ev.lossShips||{})pl.ships[k]=Math.max(0,(pl.ships[k]||0)-ev.lossShips[k]);for(const k in ev.lossDef||{})pl.def[k]=Math.max(0,(pl.def[k]||0)-ev.lossDef[k]);
     for(const k in pl.ships)if(!pl.ships[k])delete pl.ships[k];for(const r of['m','k','g'])pl.r[r]=Math.max(0,pl.r[r]-((ev.loot||{})[r]||0))}
    E.report('combat',`Angriff von ${ev.from} auf ${where}`,{battle:ev.battle});toast(`⚔️ ${ev.from} hat ${where} angegriffen`,'err',5000)}
   else if(ev.kind==='spied'){E.report('info',`Spionage von ${ev.from}`,{text:`${ev.from} hat ${where} ausspioniert.`+(ev.lost?' Die Sonden wurden abgeschossen.':'')})}
   else if(ev.kind==='transport'){if(pl)for(const r of['m','k','g'])pl.r[r]+=(+(ev.res||{})[r]||0);E.report('transport',`Lieferung von ${ev.from}`,{text:`${ev.from} hat dir ${fmtR(ev.res)} nach ${where} geliefert.`})}
   else if(ev.kind==='allyapp'){E.report('info',`Bewerbung von ${ev.from}`,{text:`${ev.from} möchte deiner Allianz [${ev.tag}] beitreten.`+(ev.msg?` Nachricht: „${ev.msg}“`:'')});toast(`Neue Allianz-Bewerbung von ${ev.from}`,'ok',4000)}
   else if(ev.kind==='allydecision'){E.report('info',ev.accept?`Aufgenommen in [${ev.tag}]`:`Bewerbung bei [${ev.tag}] abgelehnt`,{text:ev.accept?`Du bist jetzt Mitglied der Allianz ${ev.name} [${ev.tag}].`:`Die Allianz ${ev.name} [${ev.tag}] hat deine Bewerbung abgelehnt.`})}
   else if(ev.kind==='allykick'){E.report('info',`Aus [${ev.tag}] entfernt`,{text:`Du wurdest aus der Allianz [${ev.tag}] entfernt.`})}
  }catch(e){console.error(e)}}
 return any}
NET.applyEvents=applyEvents;
function onSend(f){const S=GS();if(!NET.on||f.npc||!['attack','spy','transport'].includes(f.mission)||f.to.moon)return;const sl=NET.slotHook(f.to.g,f.to.s,f.to.p);if(!sl)return;
 let target=null;if(sl.real)target={name:sl.player};else if(sl.npcp&&sl.npcid&&f.mission!=='transport')target={npc:sl.npcid};if(!target)return;
 f.pvp={...target,who:sl.player};const E=ENGINE;
 api('fleet',{body:{mission:f.mission,target,to:{g:f.to.g,s:f.to.s,p:f.to.p},fromC:f.fromC,ships:f.ships,cargo:f.cargo,tech:E.techOf(),esp:E.tl('espionage'),arrive:Date.now()+(f.arrive-S.t),depart:Date.now(),cid:f.id}})
  .then(r=>{f.pvp.sid=r.id;try{save()}catch(e){}}).catch(e=>{f.pvp.err=e.message;toast('Server: '+e.message+' – Flotte kehrt bei Ankunft um','err',4000)})}
let busy=false;
async function resolveLoop(){const S=GS();if(!S||busy||!NET.on)return;const list=S.fleets.filter(f=>f.phase==='pvp');if(!list.length)return;busy=true;
 try{for(const f of list){if(!f.pvp.sid){if(f.pvp.err||S.t-f.pvpAt>60e3){f.phase='back';f.arrive=S.t+f.dur;ENGINE.report('info','Mission abgebrochen',{text:'Der Server hat die Flotte nicht angenommen. Sie kehrt zurück.'})}continue}
   let r;try{r=await api('fleet/resolve',{body:{id:f.pvp.sid}})}catch(e){if(/unbekannt/.test(e.message)){f.phase='back';f.arrive=S.t+f.dur}continue}
   if(!r.result)continue;applyResult(f,r.result)}}
 finally{busy=false;try{after()}catch(e){}}}
function applyResult(f,x){const S=GS();const E=ENGINE;const to=f.to;const c=`[${to.g}:${to.s}:${to.p}]`;const who=f.pvp.who||'Spieler';
 if(x.kind==='attack'){f.ships={};for(const k in x.endShips||{})if(x.endShips[k]>0)f.ships[k]=x.endShips[k];for(const r of['m','k','g'])f.cargo[r]+=(x.loot||{})[r]||0;
  const d=x.debris||{};if((d.m||0)+(d.k||0)>0){const k=E.ck(to.g,to.s,to.p);const o=S.debris[k]||(S.debris[k]={m:0,k:0});o.m+=d.m||0;o.k+=d.k||0}
  E.report('combat',`Kampf bei ${who} ${c}`,{battle:x.battle})}
 else if(x.kind==='spy'){if(x.lostProbes){f.ships={}}E.report('spy',`Spionagebericht ${who} ${c}`,{spy:x.spy})}
 else if(x.kind==='transport'){E.report('transport','Transport angekommen',{text:`Deine Flotte hat ${fmtR(f.cargo)} an ${who} ${c} geliefert.`});f.cargo={m:0,k:0,g:0}}
 else E.report('info','Mission fehlgeschlagen',{text:(x.msg||'Unbekannter Fehler')+' – die Flotte kehrt zurück.'});
 if(!Object.keys(f.ships).length){S.fleets=S.fleets.filter(y=>y!==f);return}
 f.phase='back';f.arrive=S.t+f.dur;delete f.pvp}
NET.extIncoming=()=>{const S=GS();if(!S)return[];return(NET.incoming||[]).filter(i=>i.mission==='attack').map(i=>{const pl=planetAt(S,i.to||{});return pl?{id:'x'+i.id,target:S.order.find(id=>S.planets[id]===pl),arrive:S.t+(i.arrive-Date.now()),who:i.from,phase:'out',ext:1,ships:{}}:null}).filter(Boolean)};
// ---------- Stufe 3: Allianzen + Chat ----------
const AL={tab:'ally',list:null,chat:{},last:{},ch:'global'};NET.AL=AL;
async function alLoad(){try{AL.list=(await api('ally/list')).allies||[]}catch(e){AL.err=e.message}}
async function chatLoad(ch){const arr=AL.chat[ch]||(AL.chat[ch]=[]);const since=arr.length?arr[arr.length-1].id:0;try{const r=await api('chat?ch='+encodeURIComponent(ch)+'&since='+since);if(r.msgs&&r.msgs.length){arr.push(...r.msgs);if(arr.length>200)arr.splice(0,arr.length-200);return true}}catch(e){AL.err=e.message}return false}
const rk={founder:'Gründer',officer:'Offizier',member:'Mitglied'};
function mpAlly(){const b=$('#allybody');b.className='vbody glass';const A=NET.ally;const me=NET.cfg.name;let h='<div class="disp"><div>';
 if(!AL.list){alLoad().then(()=>{if(view==='ally')renderAlly()})}
 if(!A){h+=`<div class="box"><b>Allianz gründen</b><div class="row" style="margin-top:6px"><input id="mpan" placeholder="Name (3–30)" maxlength="30" style="flex:1"><input id="mpat" placeholder="Kürzel" maxlength="5" style="width:80px"></div><button class="btn" style="margin-top:8px" data-act="mpa-create">${IC.ally} Gründen</button></div>`;
  h+=`<div class="box" style="margin-top:8px"><b>Allianzen im Universum</b>${AL.list?AL.list.length?`<table class="tbl" style="margin-top:4px">${AL.list.map(a=>`<tr><td><span class="badge">${esc(a.tag)}</span></td><td>${esc(a.name)}<div class="mut" style="font-size:11px">${a.members.length} Mitglieder · Gründer ${esc(a.founder)}</div></td><td style="text-align:right">${(a.apps||[]).some(x=>x.n===me)?'<span class="mut">beworben</span>':`<button class="btn sm" data-act="mpa-apply" data-id="${esc(a.tag)}">Bewerben</button>`}</td></tr>`).join('')}</table>`:'<div class="mut">Noch keine Allianzen.</div>':'<div class="mut">Lädt…</div>'}</div>`}
 else{const my=A.members.find(m=>m.n===me)||{};const boss=my.rank==='founder'||my.rank==='officer';
  h+=`<div class="box"><div class="row">${IC.ally}<b style="font-size:16px">${esc(A.name)}</b><span class="badge own">${esc(A.tag)}</span><span class="spacer"></span><span class="mut">${rk[my.rank]||''}</span></div>${A.descr?`<div class="desc" style="margin-top:6px">${esc(A.descr)}</div>`:''}
   ${my.rank==='founder'?`<div class="row" style="margin-top:6px"><input id="mpad" placeholder="Beschreibung" maxlength="300" style="flex:1" value="${esc(A.descr||'')}"><button class="btn sm" data-act="mpa-descr">Speichern</button></div>`:''}</div>`;
  h+=`<div class="box" style="margin-top:8px"><b>Mitglieder (${A.members.length})</b><table class="tbl" style="margin-top:4px">${A.members.map(m=>`<tr><td>${esc(m.n)}${m.n===me?' (Du)':''}</td><td class="mut">${rk[m.rank]||m.rank}</td><td style="text-align:right">${my.rank==='founder'&&m.rank!=='founder'?`<button class="btn sm ghost" data-act="mpa-rank" data-id="${esc(m.n)}" data-r="${m.rank==='officer'?'member':'officer'}">${m.rank==='officer'?'Zum Mitglied':'Zum Offizier'}</button>`:''}${boss&&m.rank!=='founder'&&m.n!==me?` <button class="btn sm ghost" data-act="mpa-kick" data-id="${esc(m.n)}">Entfernen</button>`:''}</td></tr>`).join('')}</table></div>`;
  if(boss)h+=`<div class="box" style="margin-top:8px"><b>Bewerbungen (${(A.apps||[]).length})</b>${(A.apps||[]).length?`<table class="tbl" style="margin-top:4px">${A.apps.map(x=>`<tr><td>${esc(x.n)}${x.msg?`<div class="mut" style="font-size:11px">„${esc(x.msg)}“</div>`:''}</td><td style="text-align:right"><button class="btn sm green" data-act="mpa-acc" data-id="${esc(x.n)}">Annehmen</button> <button class="btn sm ghost" data-act="mpa-rej" data-id="${esc(x.n)}">Ablehnen</button></td></tr>`).join('')}</table>`:'<div class="mut">Keine offenen Bewerbungen.</div>'}</div>`;
  h+=`<button class="btn sm ghost" style="margin-top:8px" data-act="mpa-leave">Allianz verlassen</button>`}
 h+='</div><div>';const rows=NET.rankList().sort((a,b)=>b.tot-a.tot);h+=`<div class="box"><b>Rangliste</b><table class="tbl" style="margin-top:4px">${rows.slice(0,15).map((r,i)=>`<tr class="${r.me?'cur':''}"><td>${i+1}</td><td>${esc(r.n)}${r.tag?` <span class="badge">${esc(r.tag)}</span>`:''}</td><td style="text-align:right">${fmt(r.tot)}</td></tr>`).join('')}</table></div></div></div>`;
 setHTML(b,h)}
function mpChat(){const b=$('#chatbody');b.className='vbody glass';const A=NET.ally;if(AL.ch!=='global'&&!(A&&AL.ch==='ally:'+A.tag))AL.ch='global';const ch=AL.ch;const arr=AL.chat[ch]||[];const me=NET.cfg.name;
 const keep=document.getElementById('mpct');const draft=keep?keep.value:'';
 b.innerHTML=`<div class="row" style="margin-bottom:8px;gap:6px"><button class="btn sm ${ch==='global'?'':'ghost'}" data-act="mpc-ch" data-id="global">🌐 Universum</button>${A?`<button class="btn sm ${ch!=='global'?'':'ghost'}" data-act="mpc-ch" data-id="ally:${esc(A.tag)}">${IC.ally} [${esc(A.tag)}]</button>`:''}<span class="spacer"></span><span class="mut" style="font-size:11px">Mehrspieler-Chat</span></div>
 <div id="mpcl" style="max-height:52vh;overflow:auto">${arr.length?arr.map(m=>`<div class="chatmsg"><div class="cav">${m.name==='System'?'!':esc(m.name[0]||'?')}</div><div class="cb"><small>${esc(m.name)}${m.name===me?' (Du)':''} · ${new Date(m.t).toLocaleString('de-DE',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'})}</small>${esc(m.txt)}</div></div>`).join(''):'<div class="mut">Noch keine Nachrichten.</div>'}</div>
 <div class="row" style="margin-top:8px;gap:6px"><input id="mpct" maxlength="300" placeholder="Nachricht…" style="flex:1"><button class="btn sm" data-act="mpc-send">Senden</button></div>`;
 const i=document.getElementById('mpct');i.value=draft;i.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();sendChat()}};const l=document.getElementById('mpcl');l.scrollTop=l.scrollHeight;
 if(AL.last[ch]!==-1){AL.last[ch]=-1;chatLoad(ch).then(n=>{if(n&&view==='chat')mpChat()})}}
async function sendChat(){const i=document.getElementById('mpct');const txt=(i&&i.value||'').trim();if(!txt)return;i.value='';try{await api('chat',{body:{ch:AL.ch,txt}});await chatLoad(AL.ch);if(view==='chat')mpChat()}catch(e){toast(e.message,'err')}}
async function allyAct(a,t){const v=id=>(document.getElementById(id)||{}).value||'';const id=t.dataset.id;
 if(a==='mpa-create')await api('ally/create',{body:{name:v('mpan').trim(),tag:v('mpat').trim()}});
 else if(a==='mpa-apply'){const msg=prompt('Nachricht an die Allianz (optional):','')||'';await api('ally/apply',{body:{tag:id,msg}});toast('Bewerbung gesendet','ok')}
 else if(a==='mpa-acc'||a==='mpa-rej')await api('ally/decide',{body:{name:id,accept:a==='mpa-acc'}});
 else if(a==='mpa-rank')await api('ally/rank',{body:{name:id,rank:t.dataset.r}});
 else if(a==='mpa-kick'){if(!confirm(id+' aus der Allianz entfernen?'))return;await api('ally/kick',{body:{name:id}})}
 else if(a==='mpa-leave'){if(!confirm('Allianz wirklich verlassen?'))return;await api('ally/leave',{body:{}})}
 else if(a==='mpa-descr')await api('ally/descr',{body:{descr:v('mpad')}});
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
function installMP(){const E=window.ENGINE;if(mpDone)return;mpDone=true;{E.slotHook=NET.slotHook;E.onSend=onSend;E.pvpArrive=f=>{setTimeout(resolveLoop,300)};E.extIncoming=NET.extIncoming;
  const rc=E.recall;E.recall=function(fid){const S=GS();const f=S&&S.fleets.find(x=>x.id===fid);if(f&&f.phase==='pvp')return;if(f&&f.pvp&&f.pvp.sid&&f.phase==='out'){api('fleet/recall',{body:{id:f.pvp.sid}}).catch(()=>{});delete f.pvp}return rc.call(this,fid)};
  setInterval(resolveLoop,5000);setInterval(()=>{if(document.visibilityState==='visible'&&view==='chat'){const ch=AL.ch;chatLoad(ch).then(n=>{if(n&&view==='chat')mpChat()})}},8000);
  window.renderAlly=mpAlly;window.renderChat=mpChat;
  document.addEventListener('click',async e=>{const t=e.target.closest('[data-act^="mpa-"],[data-act^="mpc-"]');if(!t)return;e.stopPropagation();const a=t.dataset.act;
   try{if(a==='mpc-ch'){AL.ch=t.dataset.id;AL.last[AL.ch]=0;mpChat()}else if(a==='mpc-send')await sendChat();else{t.disabled=true;await allyAct(a,t)}}catch(err){t.disabled=false;toast(err.message,'err',4000)}},true);
const ss=E.setSpeed;E.setSpeed=function(sp){if(sp!==(NET.cfg.speed||10)){toast('Im Mehrspieler-Universum ist das Tempo fest ('+(NET.cfg.speed||10)+'×)','err');return}return ss.call(this,sp)};
  setTimeout(()=>NET.sync(true).then(()=>{if(NET.err)toast('Server nicht erreichbar: '+NET.err,'err',4000);else{try{renderAll()}catch(e){}}}),1500);
  setInterval(()=>{if(document.visibilityState==='visible')NET.sync(false)},120e3);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')NET.pushSave(true).catch(()=>{})})}
}
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
