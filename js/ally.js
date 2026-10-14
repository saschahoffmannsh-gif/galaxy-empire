'use strict';
// Allianz-Portal (v14): Heimat mit Banner, Mitglieder & Ränge, Bewerbungen, Einladungen, Chat & Ankündigungen,
// Forschung & Spenden, Depot, Diplomatie, Verwaltung. Mitspieler sind simulierte NPCs (Echtzeit, mit Offline-Aufholung).
(function(){
const AL={tab:'home'};window.ALLY=AL;
const MIN=60000,now=()=>Date.now(),R=(a,b)=>a+Math.random()*(b-a),RI=(a,b)=>Math.floor(R(a,b+1)),pick=a=>a[Math.floor(Math.random()*a.length)];
const NAMES=['Lena_K','DarkVoid','MaxPower88','Kommandant Rex','NebelFee','Taurus','Kai.Weber','Ironclad','Zenturio','Sternenwolf','Mira Solis','Graf Zahl','Nachtfalke','ColdFusion','Jule94','Admiral Krause','Valkyrie','Sky_Hunter','Bernstein','Polarlicht','Orbitalis','TomTheTank','Selene','KaiserBlau','Nova_Prime','Frostbite','Hagen','Lyra Vex','Commander Jo','Eisenherz','Saphira','Rotfuchs','Quantum_Q','Bjarne','Luna Lux','Steelrain','Mondkind','Odysseus','Kometenjäger','Fenja','Vex','Raumpirat','Ember_7','Lord Stahl','Pixelkrieger','Andromeda','Silberpfeil','Nordstern','Tessa_R','Gravitas'];
const RK={leader:'Anführer',officer:'Offizier',member:'Mitglied',recruit:'Rekrut'},RORD=['leader','officer','member','recruit'];
const PERM=[['apps','Bewerbungen bearbeiten'],['invite','Spieler einladen'],['kick','Mitglieder entfernen'],['announce','Ankündigungen'],['research','Forschung starten'],['depot','Depot auszahlen'],['diplo','Diplomatie']];
const PDEF={leader:{apps:1,invite:1,kick:1,announce:1,research:1,depot:1,diplo:1},officer:{apps:1,invite:1,kick:1,announce:1,research:1,depot:0,diplo:0},member:{},recruit:{}};
const RES=[{id:'eco',n:'Bergbau-Synergie',d:'+1 % Rohstoffproduktion auf allen Planeten je Stufe',max:10,base:[60000,40000,10000]},
 {id:'depot',n:'Depot-Erweiterung',d:'+50 % Depotkapazität je Stufe',max:8,base:[30000,30000,5000]},
 {id:'recruit',n:'Rekrutierungsnetz',d:'+5 Mitgliederplätze je Stufe',max:6,base:[40000,20000,20000]}];
const EMC=['#38e1ff','#ff9f43','#b06bff','#4ade80','#ff5577','#ffd166'],EMS=['star','planet','sword','wing','crown','comet'];
const CHAT={hi:['Hallo zusammen! Danke für die Aufnahme 🙂','Moin! Freu mich dabei zu sein.','Hi! Wer braucht Kristall? Hab Überschuss.','Servus, bin neu hier – auf gute Zusammenarbeit!'],
 idle:['Hat jemand Tipps für die Expedition auf Pos. 16?','Gerade die Metallmine auf Stufe {n} gebracht 💪','Achtung, in G{g} fliegen Piraten rum.','Wer ist heute Abend online? Gemeinsamer Angriff?','Danke für die Spende vorhin!','Forschung läuft gut, weiter so Leute.','Mein Schildgenerator ist endlich fertig.','Kristall ist knapp bei mir, Depot hilft echt.','Hab einen Trümmerfeld-Recycler übrig, falls wer braucht.','Gute Nacht, bin morgen früh wieder da.','Unsere Allianzpunkte steigen schön 🚀','Kann ein Offizier mal die Bewerbungen checken?'],
 reply:['Klingt gut, Chef!','Bin dabei.','👍','Verstanden.','Mach ich, danke!','Super Idee.','Alles klar, Kommandant.','Ich spende gleich was ins Depot.'],
 don:['Hab {x} ins Depot gelegt.','Spende für die Forschung ist raus.','Kleine Spende fürs Depot 🙂'],
 bye:['Schade, aber ok. Viel Erfolg euch.']};
const AL_NPC=[['Sternenbund','SB'],['Eiserne Flotte','IRON'],['Nebula Legion','NEB'],['Orden des Lichts','OdL'],['Schattenkartell','SHDW'],['Nordallianz','NORD'],['Kometenreiter','KOM']];
const DK={none:'Neutral',nap:'Nichtangriffspakt',bnd:'Bündnis',war:'Krieg'};
const nm=()=>{const S0=S.ally;const used=new Set([...S0.members.map(m=>m.n),...S0.apps.map(a=>a.n),...S0.inv.map(a=>a.n)]);const f=NAMES.filter(n=>!used.has(n));return f.length?pick(f):pick(NAMES)+RI(2,99)};
const myPts=()=>E.totalPoints();
const uid=()=>Math.random().toString(36).slice(2,9);
function init(){const a=S.ally;if(!a)return null;if(a.v===14)return a;
 Object.assign(a,{v:14,desc:a.desc||'Gemeinsam die Galaxie erobern. Aktiv, hilfsbereit, deutschsprachig.',em:a.em||{c:0,s:0},open:true,minPts:0,
  members:[{id:'me',n:S.cmdName||'Kommandant',rank:'leader',pts:myPts(),joined:a.created||now(),don:0,me:1,on:now()}],apps:[],inv:[],chat:[],ann:{txt:'Willkommen! Bitte spendet regelmäßig ins Depot – jede Spende bringt die Allianzforschung voran.',t:now()},
  res:{eco:0,depot:0,recruit:0},rp:null,depot:{m:0,k:0,g:0},xp:0,log:[],perm:JSON.parse(JSON.stringify(PDEF)),
  diplo:AL_NPC.filter(([n,t])=>n!==a.name&&t!==a.tag).map(([n,t])=>({n,t,s:'none',pts:Math.round(myPts()*R(2,30)+2e5),mem:RI(8,40)})),inbox:[],next:{app:now()+R(.4,1)*MIN,chat:now()+R(1,2)*MIN,don:now()+R(2,4)*MIN,dip:now()+R(6,12)*MIN}});
 return a}
AL.init=init;
const cap=a=>10+5*a.res.recruit;
const dcap=a=>Math.round(5e5*Math.pow(1.5,a.res.depot)*(1+a.members.length*.1));
const lvl=a=>1+Math.floor(Math.sqrt(a.xp/2e4));
const say=(a,from,txt,sys)=>{a.chat.push({t:now(),from,txt,sys:!!sys});if(a.chat.length>120)a.chat.splice(0,a.chat.length-120)};
const log=(a,txt)=>{a.log.unshift({t:now(),txt});a.log.length=Math.min(a.log.length,60)};
const npcMember=(n,pts)=>({id:uid(),n,rank:'recruit',pts:pts||Math.round(myPts()*R(.25,1.8)+R(2e3,2e4)),joined:now(),don:0,on:now()-(Math.random()<.5?R(0,6e5):R(15*MIN,180*MIN)),act:R(.3,1)});
function addMember(a,n,pts){const m=npcMember(n,pts);a.members.push(m);say(a,'System',`${n} ist der Allianz beigetreten.`,1);log(a,`${n} beigetreten`);
 setTimeout(()=>{if(S.ally===a&&a.members.includes(m)){say(a,n,pick(CHAT.hi));AL.ping()}},R(3e3,9e3));return m}
const resKey=()=>{const a=S.ally;return a&&a.rp?a.rp.id:null};
function donate(a,m,c){const room=dcap(a)-(a.depot.m+a.depot.k+a.depot.g);let tot=c.m+c.k+c.g;if(tot>room&&tot>0){const f=Math.max(0,room)/tot;c={m:c.m*f,k:c.k*f,g:c.g*f};tot=room}
 if(tot<=0)return 0;for(const k of 'mkg')a.depot[k]+=Math.floor(c[k]);m.don+=tot;a.xp+=tot/10;return tot}
// Simulation: Ereignisse bis jetzt abarbeiten (max. 25 auf einmal, Offline-Aufholung gedeckelt)
AL.sim=function(){const a=init();if(!a)return false;const t=now();let ch=false,g=0;
 const npcs=a.members.filter(m=>!m.me);
 while(g++<25){const nx=a.next;const k=Object.keys(nx).reduce((x,y)=>nx[x]<nx[y]?x:y);if(nx[k]>t)break;const at=nx[k];
  if(k==='app'){nx.app=at+R(2.5,7)*MIN;if(a.open&&a.apps.length<6&&a.members.length+a.apps.length<cap(a)+3){const n=nm();const pts=Math.round(myPts()*R(.2,1.6)+R(1e3,3e4));
    if(pts>=a.minPts){a.apps.push({id:uid(),n,pts,t:at,msg:pick(['Aktiver Spieler, täglich online. Würde gern helfen!','Suche eine aktive deutsche Allianz.','Erfahrener Miner, spende regelmäßig.','Meine alte Allianz hat sich aufgelöst – nehmt ihr mich?','Hi, ich mag Expeditionen und Handel.','Bin Frühaufsteher, kann Nachtschichten abdecken.'])});ch=true;
     // Offiziere bearbeiten Bewerbungen auch selbst
     const off=npcs.find(m=>m.rank==='officer');if(off&&Math.random()<.3&&a.members.length<cap(a)){const ap=a.apps.pop();addMember(a,ap.n,ap.pts);log(a,`${off.n} hat ${ap.n} aufgenommen`)}}}}
  else if(k==='chat'){nx.chat=at+R(1.2,4)*MIN/Math.max(1,Math.sqrt(npcs.length));if(npcs.length&&t-at<10*MIN){const m=pick(npcs);m.on=at;say(a,m.n,pick(CHAT.idle).replace('{n}',RI(12,28)).replace('{g}',RI(1,9)));ch=true}}
  else if(k==='don'){nx.don=at+R(2,5)*MIN/Math.max(1,Math.sqrt(npcs.length));if(npcs.length){const m=pick(npcs);const base=m.pts*R(.4,1.4);
    const got=donate(a,m,{m:base*.5,k:base*.33,g:base*.17});if(got>0){m.on=at;m.pts+=Math.round(got/1e3);log(a,`${m.n} spendete ${fmt(got)}`);if(Math.random()<.4&&t-at<10*MIN)say(a,m.n,pick(CHAT.don).replace('{x}',fmt(got)));ch=true}}}
  else if(k==='dip'){nx.dip=at+R(10,25)*MIN;const d=pick(a.diplo.filter(x=>x.s!=='war'));if(d&&!a.inbox.some(x=>x.t===d.t)){const kind=d.s==='none'?'nap':d.s==='nap'?'bnd':null;if(kind){a.inbox.push({t:d.t,kind,at});log(a,`[${d.t}] schlägt ${DK[kind]} vor`);ch=true}}}}
 // Einladungen: NPCs antworten nach 20–90 s
 for(const iv of a.inv.slice())if(t>=iv.due){a.inv.splice(a.inv.indexOf(iv),1);if(iv.ok&&a.members.length<cap(a))addMember(a,iv.n,iv.pts);else{say(a,'System',`${iv.n} hat die Einladung abgelehnt.`,1)}ch=true}
 // Diplomatie-Antworten
 for(const d of a.diplo)if(d.pend&&t>=d.pend.due){const p=d.pend;delete d.pend;if(p.ok){d.s=p.kind;say(a,'System',`[${d.t}] ${d.n} hat ${DK[p.kind]} angenommen.`,1)}else say(a,'System',`[${d.t}] ${d.n} lehnt ${DK[p.kind]} ab.`,1);ch=true}
 // Forschung abschließen
 if(a.rp&&t>=a.rp.end){a.res[a.rp.id]++;say(a,'System',`Forschung abgeschlossen: ${RES.find(r=>r.id===a.rp.id).n} Stufe ${a.res[a.rp.id]}`,1);log(a,`Forschung ${RES.find(r=>r.id===a.rp.id).n} St. ${a.res[a.rp.id]}`);a.rp=null;ch=true}
 const me=a.members.find(m=>m.me);if(me){me.pts=myPts();me.n=S.cmdName||me.n;me.on=t}
 if(ch){a.unread=(a.unread||0)+1}
 return ch};
AL.ping=function(){if(view==='ally')renderAlly();renderNav()};
const rcost=(r,lv)=>r.base.map(v=>Math.round(v*Math.pow(1.8,lv)));
const rtime=(r,lv)=>Math.round((10+lv*8)*MIN/(S.speed||1)*2);
const myRank=()=>S.ally.members.find(m=>m.me).rank;
const can=p=>!!S.ally.perm[myRank()][p];
// Emblem
const SYM={star:'<path d="M50 24l7 15 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2z"/>',planet:'<circle cx="50" cy="48" r="13"/><ellipse cx="50" cy="48" rx="24" ry="7" fill="none" stroke-width="3.5" transform="rotate(-18 50 48)"/>',
 sword:'<path d="M50 20l5 8v30h-10V28zM38 60h24v5H38zM47 65h6v12h-6z"/>',wing:'<path d="M50 70C38 60 26 52 22 34c10 6 18 8 28 10 10-2 18-4 28-10-4 18-16 26-28 36z"/>',
 crown:'<path d="M28 64l-4-30 14 12 12-18 12 18 14-12-4 30z"/>',comet:'<circle cx="58" cy="40" r="9"/><path d="M52 47L26 72l4-14-10 2z" opacity=".75"/>'};
function emblem(em,sz){const c=EMC[em.c%EMC.length],s=EMS[em.s%EMS.length];return`<svg class="al-em" viewBox="0 0 100 100" width="${sz}" height="${sz}"><defs><linearGradient id="emg${em.c}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".95"/><stop offset="1" stop-color="#0b1020"/></linearGradient></defs>
 <path d="M50 4l40 14v28c0 26-18 42-40 50C28 88 10 72 10 46V18z" fill="url(#emg${em.c})" stroke="${c}" stroke-width="3"/><path d="M50 12l32 11v23c0 21-14 34-32 41-18-7-32-20-32-41V23z" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="1.5"/>
 <g fill="#fff" stroke="#fff" style="filter:drop-shadow(0 0 4px ${c})">${SYM[s]}</g></svg>`}
AL.emblem=emblem;
const ago=t=>{const s=(now()-t)/1000;return s<60?'gerade eben':s<3600?`vor ${s/60|0} Min`:s<86400?`vor ${s/3600|0} Std`:`vor ${s/86400|0} T`};
const online=m=>m.me||now()-m.on<12*MIN;
const TABS=[['home','Übersicht'],['mem','Mitglieder'],['apps','Bewerbungen'],['chat','Chat'],['res','Forschung'],['depot','Depot'],['diplo','Diplomatie'],['admin','Verwaltung']];
function tabHome(a){const on=a.members.filter(online).length,tot=a.members.reduce((s,m)=>s+m.pts,0);const L=lvl(a);const nx=Math.pow(L,2)*2e4,px=Math.pow(L-1,2)*2e4;
 return`<div class="al-grid"><div class="box al-ann"><div class="row"><b>📣 Ankündigung</b><span class="spacer"></span><span class="mut">${ago(a.ann.t)}</span></div><div class="desc" style="margin-top:4px">${esc(a.ann.txt)}</div></div>
 <div class="box"><div class="al-stats"><div><small>Stufe</small><b>${L}</b></div><div><small>Mitglieder</small><b>${a.members.length}/${cap(a)}</b></div><div><small>Online</small><b class="ok">${on}</b></div><div><small>Punkte</small><b>${fmt(tot)}</b></div></div>
 <div class="al-xp"><i style="width:${Math.min(100,(a.xp-px)/(nx-px)*100)}%"></i></div><div class="mut" style="font-size:10.5px;margin-top:3px">Allianz-EP ${fmt(a.xp)} / ${fmt(nx)} · durch Spenden</div></div>
 <div class="box"><b>Letzte Aktivität</b>${a.log.slice(0,5).map(l=>`<div class="al-log"><span>${esc(l.txt)}</span><span class="mut">${ago(l.t)}</span></div>`).join('')||'<div class="mut">Noch ruhig – lade Spieler ein!</div>'}</div>
 <div class="box"><b>Boni aktiv</b>${RES.map(r=>`<div class="al-log"><span>${r.n}</span><span class="${a.res[r.id]?'ok':'mut'}">Stufe ${a.res[r.id]}</span></div>`).join('')}</div></div>`}
function tabMem(a){const ms=a.members.slice().sort((x,y)=>RORD.indexOf(x.rank)-RORD.indexOf(y.rank)||y.pts-x.pts);
 return`<div class="row" style="margin-bottom:6px"><b>${a.members.length}/${cap(a)} Mitglieder</b><span class="spacer"></span>${can('invite')?`<input id="alinv" data-k="alinv" placeholder="Spielername" maxlength="20" style="width:140px"><button class="btn sm" data-act="al-invite">Einladen</button>`:''}</div>
 ${a.inv.length?`<div class="mut" style="font-size:11px;margin-bottom:6px">Ausstehende Einladungen: ${a.inv.map(i=>esc(i.n)).join(', ')}</div>`:''}
 <table class="tbl al-mt"><tr><th></th><th>Name</th><th>Rang</th><th style="text-align:right">Punkte</th><th style="text-align:right">Spenden</th><th></th></tr>${ms.map(m=>`<tr class="${m.me?'cur':''}"><td><i class="al-dot ${online(m)?'on':''}"></i></td><td>${esc(m.n)}${m.me?' <span class="mut">(Du)</span>':''}<div class="mut" style="font-size:10px">${online(m)?'online':'zuletzt '+ago(m.on)}</div></td>
 <td><span class="al-rk ${m.rank}">${RK[m.rank]}</span></td><td style="text-align:right">${fmt(m.pts)}</td><td style="text-align:right">${fmt(m.don)}</td>
 <td><div class="acts">${!m.me&&myRank()==='leader'?`${m.rank!=='officer'?`<button class="btn sm ghost" data-act="al-rank" data-id="${m.id}" data-v="up" title="Befördern">▲</button>`:''}${m.rank!=='recruit'?`<button class="btn sm ghost" data-act="al-rank" data-id="${m.id}" data-v="down" title="Degradieren">▼</button>`:''}<button class="btn sm ghost" data-act="al-lead" data-id="${m.id}" title="Führung übergeben">👑</button>`:''}${!m.me&&can('kick')&&(myRank()==='leader'||['member','recruit'].includes(m.rank))?`<button class="btn sm ghost bad" data-act="al-kick" data-id="${m.id}" title="Entfernen">✕</button>`:''}</div></td></tr>`).join('')}</table>
 <div class="box" style="margin-top:8px"><b>Rechte je Rang</b><table class="tbl al-perm"><tr><th></th>${RORD.map(r=>`<th>${RK[r]}</th>`).join('')}</tr>${PERM.map(([k,n])=>`<tr><td>${n}</td>${RORD.map(r=>`<td>${r==='leader'?'<span class="ok">✓</span>':myRank()==='leader'?`<button class="al-pt ${a.perm[r][k]?'y':''}" data-act="al-perm" data-id="${r}" data-v="${k}">${a.perm[r][k]?'✓':'–'}</button>`:a.perm[r][k]?'✓':'–'}</td>`).join('')}</tr>`).join('')}</table></div>`}
function tabApps(a){return`<div class="row" style="margin-bottom:6px"><b>Bewerbungen</b><span class="spacer"></span><span class="mut">Aufnahme: ${a.open?'offen':'geschlossen'} · min. ${fmt(a.minPts)} Punkte</span></div>`+
 (a.apps.length?a.apps.map(p=>`<div class="box al-app"><div class="al-av">${esc(p.n[0])}</div><div style="flex:1;min-width:0"><b>${esc(p.n)}</b> <span class="mut">${fmt(p.pts)} Punkte · ${ago(p.t)}</span><div class="desc">„${esc(p.msg)}“</div></div>
 ${can('apps')?`<button class="btn sm green" data-act="al-app" data-id="${p.id}" data-v="1">Annehmen</button><button class="btn sm ghost" data-act="al-app" data-id="${p.id}" data-v="0">Ablehnen</button>`:''}</div>`).join(''):`<div class="box mut">Keine offenen Bewerbungen. ${a.open?'Neue Spieler bewerben sich mit der Zeit.':'Die Aufnahme ist geschlossen (Verwaltung).'}</div>`)}
function tabChat(a){return`<div class="al-chat" id="alchat">${a.chat.slice(-60).map(c=>c.sys?`<div class="al-sys">${esc(c.txt)} · ${new Date(c.t).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}</div>`:`<div class="chatmsg ${c.from===(S.cmdName||'')?'me':''}"><div class="cav">${esc(c.from[0])}</div><div class="cb"><small>${esc(c.from)} · ${new Date(c.t).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}</small>${esc(c.txt)}</div></div>`).join('')||'<div class="mut">Noch keine Nachrichten.</div>'}</div>
 <div class="row al-send"><input id="almsg" data-k="almsg" placeholder="Nachricht an die Allianz…" maxlength="200" style="flex:1"><button class="btn sm" data-act="al-say">Senden</button></div>`}
function tabRes(a){const rp=a.rp;return`<div class="mut" style="font-size:11px;margin-bottom:6px">Forschung wird aus dem Allianzdepot bezahlt. Depot: ${IC.m}${fmt(a.depot.m)} ${IC.k}${fmt(a.depot.k)} ${IC.g}${fmt(a.depot.g)}</div>`+RES.map(r=>{const lv=a.res[r.id],c=rcost(r,lv),run=rp&&rp.id===r.id,ok=c.every((v,i)=>a.depot['mkg'[i]]>=v);
 return`<div class="box al-res"><div style="flex:1;min-width:0"><b>${r.n}</b> <span class="mut">Stufe ${lv}/${r.max}</span><div class="desc">${r.d}</div>${lv<r.max?costHTML(c,{r:{m:a.depot.m,k:a.depot.k,g:a.depot.g}}):''}
 ${run?`<div class="al-xp"><i data-pstart="${rp.start}" data-pend="${rp.end}"></i></div>`:''}</div>${run?`<span class="mut" data-end="${rp.end}"></span>`:lv>=r.max?'<span class="ok">Max</span>':`<button class="btn sm" data-act="al-res" data-id="${r.id}" ${!ok||rp||!can('research')?'disabled':''}>Erforschen · ${ft(rtime(r,lv))}</button>`}</div>`}).join('')}
function tabDepot(a){const p=pl(),tot=a.depot.m+a.depot.k+a.depot.g,c=dcap(a);const me=a.members.find(m=>m.me);
 return`<div class="al-grid"><div class="box"><b>Allianzdepot</b><div class="al-xp" style="margin:6px 0"><i style="width:${Math.min(100,tot/c*100)}%"></i></div><div class="mut" style="font-size:11px">${fmt(tot)} / ${fmt(c)}</div>
 <div class="al-dep">${'mkg'.split('').map(k=>`<div>${IC[k]}<b>${fmt(a.depot[k])}</b></div>`).join('')}</div>
 ${can('depot')?`<div class="row" style="margin-top:6px"><button class="btn sm ghost" data-act="al-take" data-v="10">10 % auf ${esc(p.name)} auszahlen</button></div>`:''}</div>
 <div class="box"><b>Spenden</b><div class="desc">Von ${esc(p.name)} ins Depot. Spenden geben Allianz-EP.</div><div class="row" style="margin-top:6px;flex-wrap:wrap">${[1,5,10].map(x=>`<button class="btn sm" data-act="al-don" data-v="${x}">${x} % der Rohstoffe</button>`).join('')}</div><div class="mut" style="font-size:11px;margin-top:6px">Deine Spenden gesamt: ${fmt(me.don)}</div></div>
 <div class="box" style="grid-column:1/-1"><b>Top-Spender</b><table class="tbl">${a.members.slice().sort((x,y)=>y.don-x.don).slice(0,6).map((m,i)=>`<tr class="${m.me?'cur':''}"><td>${i+1}</td><td>${esc(m.n)}</td><td style="text-align:right">${fmt(m.don)}</td></tr>`).join('')}</table></div></div>`}
function tabDiplo(a){return(a.inbox.length?`<div class="box" style="margin-bottom:6px"><b>Eingehende Anfragen</b>${a.inbox.map((x,i)=>{const d=a.diplo.find(z=>z.t===x.t);return`<div class="al-log"><span>[${esc(d.t)}] ${esc(d.n)} schlägt <b>${DK[x.kind]}</b> vor</span><span>${can('diplo')?`<button class="btn sm green" data-act="al-dipin" data-id="${i}" data-v="1">Annehmen</button> <button class="btn sm ghost" data-act="al-dipin" data-id="${i}" data-v="0">Ablehnen</button>`:''}</span></div>`}).join('')}</div>`:'')+
 `<table class="tbl"><tr><th>Allianz</th><th>Mitgl.</th><th style="text-align:right">Punkte</th><th>Status</th><th></th></tr>${a.diplo.map(d=>`<tr><td><b>[${esc(d.t)}]</b> ${esc(d.n)}</td><td>${d.mem}</td><td style="text-align:right">${fmt(d.pts)}</td><td><span class="al-ds ${d.s}">${DK[d.s]}</span>${d.pend?' <span class="mut">(angefragt)</span>':''}</td>
 <td><div class="acts">${can('diplo')&&!d.pend?(d.s==='none'?`<button class="btn sm ghost" data-act="al-dip" data-id="${d.t}" data-v="nap">NAP</button><button class="btn sm ghost bad" data-act="al-dip" data-id="${d.t}" data-v="war">Krieg</button>`:d.s==='nap'?`<button class="btn sm ghost" data-act="al-dip" data-id="${d.t}" data-v="bnd">Bündnis</button><button class="btn sm ghost" data-act="al-dip" data-id="${d.t}" data-v="none">Kündigen</button>`:`<button class="btn sm ghost" data-act="al-dip" data-id="${d.t}" data-v="none">${d.s==='war'?'Frieden':'Kündigen'}</button>`):''}</div></td></tr>`).join('')}</table>`}
function tabAdmin(a){const ld=myRank()==='leader';return`<div class="al-grid"><div class="box"><b>Profil</b><textarea id="aldesc" data-k="aldesc" maxlength="240" rows="3" ${ld?'':'disabled'}>${esc(a.desc)}</textarea>
 <div class="row" style="margin-top:6px"><span class="mut">Farbe</span>${EMC.map((c,i)=>`<button class="al-sw ${a.em.c===i?'on':''}" style="background:${c}" data-act="al-em" data-id="c" data-v="${i}"></button>`).join('')}</div>
 <div class="row" style="margin-top:6px"><span class="mut">Symbol</span>${EMS.map((s,i)=>`<button class="al-sy ${a.em.s===i?'on':''}" data-act="al-em" data-id="s" data-v="${i}">${emblem({c:a.em.c,s:i},26)}</button>`).join('')}</div>${ld?'<button class="btn sm" style="margin-top:6px" data-act="al-desc">Speichern</button>':''}</div>
 <div class="box"><b>Ankündigung</b><textarea id="alann" data-k="alann" maxlength="240" rows="3" ${can('announce')?'':'disabled'}>${esc(a.ann.txt)}</textarea>${can('announce')?'<button class="btn sm" style="margin-top:6px" data-act="al-ann">Veröffentlichen</button>':''}
 <div class="row" style="margin-top:8px"><span>Aufnahme</span><span class="spacer"></span><button class="btn sm ${a.open?'green':'ghost'}" data-act="al-open">${a.open?'Offen':'Geschlossen'}</button></div>
 <div class="row" style="margin-top:6px"><span>Mindestpunkte</span><span class="spacer"></span>${[0,1e4,5e4,2e5].map(v=>`<button class="btn sm ${a.minPts===v?'':'ghost'}" data-act="al-min" data-v="${v}">${fmt(v)}</button>`).join('')}</div></div>
 <div class="box" style="grid-column:1/-1"><div class="row"><b>Allianz verlassen</b><span class="spacer"></span><button class="btn sm ghost bad" data-act="al-leave">${ld&&a.members.length===1?'Allianz auflösen':'Verlassen'}</button></div><div class="desc">${ld&&a.members.length>1?'Als Anführer übergibst du die Führung automatisch an den ranghöchsten Mitspieler.':''}</div></div></div>`}
const TF={home:tabHome,mem:tabMem,apps:tabApps,chat:tabChat,res:tabRes,depot:tabDepot,diplo:tabDiplo,admin:tabAdmin};
const _old=window.renderAlly;
window.renderAlly=renderAlly=function(){const a=init();if(!a)return _old();const b=$('#allybody');b.className='vbody glass al';
 const c=EMC[a.em.c%EMC.length];const on=a.members.filter(online).length;
 const h=`<div class="al-head" style="--ac:${c}"><div class="al-banner"></div>${emblem(a.em,46)}<div class="al-ti"><div><b>${esc(a.name)}</b> <span class="badge own">[${esc(a.tag)}]</span></div><div class="mut al-dsc">${esc(a.desc)}</div></div>
 <div class="al-hs"><span>Stufe <b>${lvl(a)}</b></span><span><i class="al-dot on"></i>${on} online</span><span>${RK[myRank()]}</span></div></div>
 <div class="al-tabs">${TABS.map(([k,n])=>{const bd=k==='apps'?a.apps.length:k==='diplo'?a.inbox.length:0;return`<button class="${AL.tab===k?'on':''}" data-act="al-tab" data-v="${k}">${n}${bd?`<i class="al-bd">${bd}</i>`:''}</button>`}).join('')}</div>
 <div class="al-body" id="albody">${TF[AL.tab](a)}</div>`;
 const keepScroll=$('#albody')?$('#albody').scrollTop:0;const typing={};$$('#allybody input,#allybody textarea').forEach(i=>{if(i.dataset.k)typing[i.dataset.k]=[i.value,document.activeElement===i]});
 setHTML(b,h);for(const k in typing){const i=$(`#allybody [data-k="${k}"]`);if(i&&i.tagName==='INPUT'){i.value=typing[k][0];if(typing[k][1])i.focus()}}
 const bd=$('#albody');if(bd){bd.scrollTop=keepScroll}const cc=$('#alchat');if(cc&&AL.tab==='chat'){cc.scrollTop=cc.scrollHeight}a.unread=0};
const _nav=window.renderNav;window.renderNav=renderNav=function(){_nav();const a=S&&S.ally;if(a&&a.v===14){const n=a.apps.length+a.inbox.length;const btn=$('#nav [data-v="ally"]');if(btn&&n)btn.insertAdjacentHTML('beforeend',`<i class="al-nb">${n}</i>`)}};
function npcReply(a,txt){const npcs=a.members.filter(m=>!m.me&&online(m));if(!npcs.length)return;const m=pick(npcs);setTimeout(()=>{if(S.ally!==a)return;let r=pick(CHAT.reply);if(/hallo|hi|moin|servus/i.test(txt))r=`Hey ${S.cmdName||'Chef'}! 👋`;else if(/spend|depot/i.test(txt))r=pick(['Ich spende gleich was ins Depot.','Schon erledigt!','Mach ich nach der nächsten Expedition.']);else if(/angriff|krieg|attack/i.test(txt))r=pick(['Flotte ist bereit ⚔️','Gebt mir 10 Minuten, dann bin ich dabei.','Wen nehmen wir uns vor?']);say(a,m.n,r);AL.ping()},R(2500,7000))}
document.addEventListener('click',ev=>{const t=ev.target.closest('[data-act^="al-"]');if(!t||!S.ally)return;const a=init(),act=t.dataset.act,id=t.dataset.id,v=t.dataset.v;
 const mem=id&&a.members.find(m=>m.id===id);
 switch(act){
  case 'al-tab':AL.tab=v;break;
  case 'al-app':{const i=a.apps.findIndex(x=>x.id===id);if(i<0)break;const p=a.apps.splice(i,1)[0];if(v==='1'){if(a.members.length>=cap(a)){a.apps.splice(i,0,p);toast('Allianz ist voll – Rekrutierungsnetz erforschen','err');break}addMember(a,p.n,p.pts);toast(`${p.n} aufgenommen`,'ok')}else{log(a,`Bewerbung von ${p.n} abgelehnt`);toast('Bewerbung abgelehnt')}break}
  case 'al-invite':{const n=String(($('#alinv')||{}).value||'').trim().slice(0,20);if(n.length<2){toast('Spielername eingeben','err');break}if(a.members.some(m=>m.n===n)||a.inv.some(x=>x.n===n)){toast('Bereits Mitglied oder eingeladen','err');break}
   a.inv.push({n,due:now()+R(2e4,9e4),ok:Math.random()<.72,pts:Math.round(myPts()*R(.2,1.5)+5e3)});$('#alinv').value='';toast(`Einladung an ${n} gesendet`,'ok');break}
  case 'al-rank':if(mem){const i=RORD.indexOf(mem.rank)+(v==='up'?-1:1);if(i>=1&&i<=3){mem.rank=RORD[i];say(a,'System',`${mem.n} ist jetzt ${RK[mem.rank]}.`,1);log(a,`${mem.n} → ${RK[mem.rank]}`)}}break;
  case 'al-lead':if(mem&&confirm(`Führung an ${mem.n} übergeben? Du wirst Offizier.`)){a.members.find(m=>m.me).rank='officer';mem.rank='leader';say(a,'System',`${mem.n} führt jetzt die Allianz.`,1)}break;
  case 'al-kick':if(mem&&confirm(`${mem.n} aus der Allianz entfernen?`)){a.members.splice(a.members.indexOf(mem),1);say(a,'System',`${mem.n} wurde entfernt.`,1);log(a,`${mem.n} entfernt`)}break;
  case 'al-perm':if(myRank()==='leader'){a.perm[id][v]=a.perm[id][v]?0:1}break;
  case 'al-say':{const i=$('#almsg');const txt=String(i&&i.value||'').trim().slice(0,200);if(!txt)break;say(a,S.cmdName||'Du',txt);i.value='';npcReply(a,txt);break}
  case 'al-res':{const r=RES.find(x=>x.id===id),lv=a.res[id],c=rcost(r,lv);if(a.rp||!can('research'))break;if(!c.every((x,i)=>a.depot['mkg'[i]]>=x)){toast('Zu wenig im Depot','err');break}c.forEach((x,i)=>a.depot['mkg'[i]]-=x);const st=now();a.rp={id,start:st,end:st+rtime(r,lv)};say(a,'System',`Forschung gestartet: ${r.n} Stufe ${lv+1}`,1);break}
  case 'al-don':{const p=pl(),f=+v/100;const c={m:p.r.m*f,k:p.r.k*f,g:p.r.g*f};const got=donate(a,a.members.find(m=>m.me),c);if(got<=0){toast('Depot voll oder keine Rohstoffe','err');break}const sc=got/(c.m+c.k+c.g);for(const k of 'mkg')p.r[k]-=Math.floor(c[k]*sc);log(a,`${S.cmdName||'Du'} spendete ${fmt(got)}`);toast(`${fmt(got)} gespendet`,'ok');if(Math.random()<.6){const n=a.members.filter(m=>!m.me);if(n.length)setTimeout(()=>{say(a,pick(n).n,pick(['Danke für die Spende, Chef! 🙏','Stark, danke!','Wow, das bringt die Forschung voran.']));AL.ping()},R(2500,6000))}break}
  case 'al-take':{if(!can('depot'))break;const p=pl();const g={};for(const k of 'mkg'){g[k]=Math.floor(a.depot[k]*.1);a.depot[k]-=g[k];p.r[k]+=g[k]}log(a,`Auszahlung ${fmt(g.m+g.k+g.g)} an ${p.name}`);toast(`${fmt(g.m+g.k+g.g)} ausgezahlt`,'ok');break}
  case 'al-dip':{const d=a.diplo.find(x=>x.t===id);if(!d)break;if(v==='war'||v==='none'){d.s=v;say(a,'System',v==='war'?`Krieg gegen [${d.t}] erklärt!`:`Status mit [${d.t}]: Neutral.`,1)}else{d.pend={kind:v,due:now()+R(2e4,6e4),ok:Math.random()<(v==='nap'?.75:.5)};toast(`Anfrage an [${d.t}] gesendet`)}break}
  case 'al-dipin':{const x=a.inbox.splice(+id,1)[0];if(!x)break;const d=a.diplo.find(z=>z.t===x.t);if(v==='1'){d.s=x.kind;say(a,'System',`${DK[x.kind]} mit [${d.t}] geschlossen.`,1)}else log(a,`Anfrage von [${d.t}] abgelehnt`);break}
  case 'al-em':a.em[id]=+v;break;
  case 'al-desc':{const tx=$('#aldesc');a.desc=String(tx.value).trim().slice(0,240)||a.desc;toast('Profil gespeichert','ok');break}
  case 'al-ann':{const tx=$('#alann');const s=String(tx.value).trim().slice(0,240);if(s){a.ann={txt:s,t:now()};say(a,'System','Neue Ankündigung veröffentlicht.',1);toast('Ankündigung veröffentlicht','ok')}break}
  case 'al-open':a.open=!a.open;break;
  case 'al-min':a.minPts=+v;break;
  case 'al-leave':if(confirm(a.members.length===1?'Allianz wirklich auflösen?':'Allianz wirklich verlassen?')){S.ally=null;AL.tab='home';toast('Du hast die Allianz verlassen');save();renderAll();return}break}
 save();renderAlly();renderNav()});
setInterval(()=>{try{if(S&&S.ally&&AL.sim()){AL.ping()}}catch(e){console.error(e)}},1000);
})();
