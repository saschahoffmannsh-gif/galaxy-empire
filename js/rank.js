'use strict';
// Rangliste (v15): Spieler & Allianzen nach Punkten. NPC-Spieler deterministisch aus dem Spielstand-Seed,
// Punkte wachsen über Echtzeit-Tage (eigene Wachstumsrate, Tagesrauschen, Inaktive stagnieren).
// Eigene Punkte nach OGame-Regel: 1 Punkt je 1.000 ausgegebene Rohstoffe (Gebäude, Forschung, Flotte, Verteidigung).
(function(){
const RK={mode:'p',sort:'tot',cache:null};window.RANK=RK;
const DAY=864e5,EPOCH=Date.UTC(2026,8,1);
function h32(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const hn=(i,d)=>(h32(i+':'+d)%10000)/10000;
const PRE=['Dark','Star','Nova','Iron','Shadow','Frost','Void','Sky','Storm','Night','Solar','Astro','Cyber','Nebel','Stern','Eis','Sturm','Blitz','Mond','Kosmo','Black','Red','Silent','Grim','Lunar'];
const SUF=['Wolf','Rider','Hunter','Lord','Blade','Fox','Hawk','Knight','Pilot','Fürst','Jäger','Falke','Reiter','Walker','Byte','Core','Raven','Titan','Viper','Storm'];
const FIRST=['Markus','Julia','Tobias','Lisa','Jonas','Anna','Felix','Laura','Leon','Sophie','Niklas','Marie','Lukas','Emma','Tim','Lea','Paul','Mia','Ben','Hanna','Erik','Nina','Sven','Kim','Jan','Clara','Dennis','Sarah','Florian','Katja'];
const AL_EXTRA={DARK:'Dark Matter',GEF:'Galaktische Einheitsfront',NOVA:'Nova Imperium',ORB:'Orbitale Wacht',PAX:'Pax Galactica',RED:'Red Dawn',SOL:'Sol Invictus',VOID:'Void Walkers',WOLF:'Wolfsrudel',XEN:'Xenon Syndikat'};
const ARCH=[[.55,.25,.1,.1],[.3,.25,.4,.05],[.4,.2,.1,.3],[.35,.45,.15,.05]];
const CAT=[['tot','Gesamt'],['f','Flotte'],['t','Forschung'],['b','Gebäude'],['d','Verteidigung']],ACAT=[['tot','Gesamt'],['n','Mitglieder'],['avg','Durchschnitt']];
function gen(){const seed=h32('rank'+(S.seed||'ge'));const r=rng(seed);const names=[];const used=new Set([S.cmdName]);
 const base=(window.GE&&GE.FAKE_NAMES||[]).concat(['Lena_K','DarkVoid','MaxPower88','Kommandant Rex','NebelFee','Taurus','Kai.Weber','Ironclad','Zenturio','Sternenwolf','Mira Solis','Graf Zahl','Nachtfalke','ColdFusion','Jule94','Admiral Krause','Valkyrie','Sky_Hunter','Bernstein','Polarlicht','Orbitalis','TomTheTank','Selene','KaiserBlau','Nova_Prime','Frostbite','Hagen','Lyra Vex','Commander Jo','Eisenherz','Saphira','Rotfuchs','Quantum_Q','Bjarne','Luna Lux','Steelrain','Mondkind','Odysseus','Kometenjäger','Fenja','Vex','Raumpirat','Ember_7','Lord Stahl','Pixelkrieger','Andromeda','Silberpfeil','Nordstern','Tessa_R','Gravitas']);
 const add=n=>{if(!used.has(n)){used.add(n);names.push(n)}};base.forEach(add);
 while(names.length<340){const k=r();if(k<.45)add(PRE[r()*PRE.length|0]+SUF[r()*SUF.length|0]+(r()<.5?(r()*99|0):''));else if(k<.8)add(FIRST[r()*FIRST.length|0]+(r()<.5?'_':'.')+(r()<.6?(70+(r()*35|0))%100:String.fromCharCode(65+(r()*26|0))));else add((r()<.5?'Commander ':'Admiral ')+SUF[r()*SUF.length|0])}
 const tags=((window.ALLY&&ALLY.NPC)||[]).map(([n,t])=>({t,n})).concat(Object.entries(AL_EXTRA).map(([t,n])=>({t,n})));
 const own=S.ally?S.ally.tag:null;const atags=tags.filter(x=>x.t!==own);
 const npcs=names.map((n,i)=>{const st=r();const P0=120*Math.exp(Math.pow(st,1.15)*10.2);const g=.003+r()*.028*(1-st*.5);const act=r()<.84;const a=ARCH[r()*4|0].map(v=>v*(.75+r()*.5));const sm=a.reduce((x,y)=>x+y);
  let tag=null;if(r()<.62){const w=Math.min(atags.length-1,Math.floor(Math.pow(r(),1+st*2.5)*atags.length));tag=atags[w].t}
  let G,Sy,Pp;for(let k=0;k<8;k++){G=1+(r()*9|0);Sy=1+(r()*499|0);Pp=4+(r()*9|0);const np=E.npcAt(G,Sy);if(!np.includes(Pp))break}
  return{id:'n'+i,n,P0,g,act,fr:a.map(v=>v/sm),tag,home:[G,Sy,Pp],hue:r()*360|0}});
 return{npcs,tags,key:(S.seed||'')+'|'+own,homes:Object.fromEntries(npcs.map(x=>[x.home.join(':'),x]))}}
function data(){if(!RK.g||RK.g.key!==(S.seed||'')+'|'+(S.ally?S.ally.tag:null))RK.g=gen();return RK.g}
function npcPts(x,t){const d=(t-EPOCH)/DAY;const dd=x.act?d:Math.min(d,12);const f=Math.floor(dd),fr=dd-f;const nz=1+.025*((hn(x.id,f)*(1-fr)+hn(x.id,f+1)*fr)-.5);return Math.round(x.P0*Math.pow(1+x.g,dd)*nz)}
function myBreak(){let f=0,d=0;const add=(o,T)=>{let v=0;for(const k in o){const u=T[k];if(u)v+=o[k]*(u.c[0]+u.c[1]+u.c[2])/1000}return v};
 for(const id of S.order){const p=S.planets[id];f+=add(p.ships,GE.SHIP);d+=add(p.def,GE.DEF)}for(const fl of S.fleets)if(!fl.npc)f+=add(fl.ships,GE.SHIP);
 const b=S.pts.b||0,t=S.pts.t||0;return{b:Math.floor(b),t:Math.floor(t),f:Math.floor(f),d:Math.floor(d),tot:Math.floor(b+t+f+d)}}
function list(t){const D=data();const out=[];const my=myBreak();const home=S.planets[S.home];
 const ownMem=S.ally&&S.ally.members?S.ally.members.filter(m=>!m.me):[];const skip=new Set(ownMem.map(m=>m.n));
 for(const x of D.npcs){if(skip.has(x.n))continue;const tot=npcPts(x,t);out.push({id:x.id,n:x.n,tag:x.tag,act:x.act,home:x.home,hue:x.hue,tot,b:Math.round(tot*x.fr[0]),t:Math.round(tot*x.fr[1]),f:Math.round(tot*x.fr[2]),d:Math.round(tot*x.fr[3])})}
 for(const m of ownMem){const hh=h32(m.n);const fr=ARCH[hh%4];const tot=Math.round(m.pts*(t<Date.now()-DAY/2?.97:1));out.push({id:'m'+m.id,n:m.n,tag:S.ally.tag,act:true,home:[1+hh%9,1+(hh>>4)%499,4+(hh>>9)%9],hue:hh%360,tot,b:Math.round(tot*fr[0]),t:Math.round(tot*fr[1]),f:Math.round(tot*fr[2]),d:Math.round(tot*fr[3]),mem:1})}
 const mine=Object.assign({id:'me',n:S.cmdName||'Kommandant',tag:S.ally?S.ally.tag:null,act:true,me:1,home:[home.g,home.s,home.p],hue:190},my);
 if(t<Date.now()-DAY/2){const k=.93;for(const c of ['b','t','f','d','tot'])mine[c]=Math.floor(mine[c]*k)}out.push(mine);return out}
function players(sort){const now=Date.now();const cur=list(now),old=list(now-DAY);const key=sort||'tot';
 const ord=(a,b)=>b[key]-a[key]||(a.id<b.id?-1:1);old.sort(ord);const orank=new Map(old.map((x,i)=>[x.id,i+1]));cur.sort(ord);cur.forEach((x,i)=>{x.rank=i+1;x.d1=(orank.get(x.id)||x.rank)-x.rank});return cur}
function allies(sort,cur){cur=cur||players('tot');const D=data();const map={};const meta=Object.fromEntries(D.tags.map(x=>[x.t,x.n]));
 for(const p of cur){if(!p.tag)continue;const a=map[p.tag]||(map[p.tag]={tag:p.tag,name:meta[p.tag]||(S.ally&&S.ally.tag===p.tag?S.ally.name:p.tag),tot:0,n:0,mem:[],own:S.ally&&S.ally.tag===p.tag});a.tot+=p.tot;a.n++;a.mem.push(p)}
 const arr=Object.values(map);arr.forEach(a=>{a.avg=Math.round(a.tot/a.n);a.em={c:h32(a.tag)%6,s:(h32(a.tag)>>>3)%6};if(a.own&&S.ally.em)a.em=S.ally.em});
 const key=sort||'tot';arr.sort((a,b)=>b[key]-a[key]);arr.forEach((a,i)=>{a.rank=i+1;a.d1=(h32(a.tag+Math.floor(Date.now()/DAY))%5)-2});return arr}
RK.players=players;RK.allies=allies;RK.ally=tag=>allies('tot').find(a=>a.tag===tag);
E.slotHook=(g,s,p)=>{if(!S)return null;const x=data().homes[g+':'+s+':'+p];if(!x)return null;const tot=npcPts(x,Date.now());return{kind:x.act?'player':'inactive',player:x.n,pts:tot,ally:x.tag,name:'Heimatplanet'}};
// --- UI ---
const av=(p,sz)=>`<div class="rk-av" style="--h:${p.hue};width:${sz}px;height:${sz}px;font-size:${sz*.42}px">${esc((p.n.replace(/^(Commander|Admiral) /,'')[0]||'?').toUpperCase())}</div>`;
const em=(a,sz)=>window.ALLY?ALLY.emblem(a.em,sz):'';
const crown=`<svg class="rk-crown" viewBox="0 0 64 40"><defs><linearGradient id="rkg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c8"/><stop offset=".45" stop-color="#ffc93c"/><stop offset="1" stop-color="#a8650a"/></linearGradient></defs><path d="M6 36L2 10l15 12L32 2l15 20 15-12-4 26z" fill="url(#rkg)" stroke="#7a4a05" stroke-width="1.5"/><circle cx="32" cy="22" r="4" fill="#ff4f6d" stroke="#fff3" /><circle cx="17" cy="27" r="2.6" fill="#59e1ff"/><circle cx="47" cy="27" r="2.6" fill="#59e1ff"/><rect x="6" y="32" width="52" height="4" rx="2" fill="#ffe08a" opacity=".8"/></svg>`;
const laurel=(c1,c2,id)=>`<svg class="rk-laurel" viewBox="0 0 100 100"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><g fill="url(#${id})">${[0,1,2,3,4,5].map(i=>{const a=(112+i*19)*Math.PI/180,x=50+44*Math.cos(a),y=52+44*Math.sin(a);return`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="8" ry="3.6" transform="rotate(${(i*19+112+90)%360} ${x.toFixed(1)} ${y.toFixed(1)})"/><ellipse cx="${(100-x).toFixed(1)}" cy="${y.toFixed(1)}" rx="8" ry="3.6" transform="rotate(${-(i*19+112+90)%360} ${(100-x).toFixed(1)} ${y.toFixed(1)})"/>`}).join('')}</g></svg>`;
const arrow=d=>d>0?`<span class="rk-up">▲${d}</span>`:d<0?`<span class="rk-dn">▼${-d}</span>`:`<span class="rk-eq">–</span>`;
function podium(top,isA,key){const pos=[1,0,2];const cls=['gold','silver','bronze'];
 return`<div class="rk-pod">${pos.map(i=>{const x=top[i];if(!x)return'<div></div>';const v=x[key];
  return`<div class="rk-pc ${cls[i]} ${x.me||x.own?'me':''}" data-act="rk-open" data-id="${isA?'a:'+x.tag:x.id}"><div class="rk-medal">${i===0?crown:''}${isA?`<div class="rk-emw">${em(x,i===0?58:46)}</div>`:`<div class="rk-avw">${av(x,i===0?52:42)}</div>`}${i?laurel(i===1?'#f4f7ff':'#ffd2a8',i===1?'#8892a8':'#9a5a2a','rkl'+i):laurel('#fff1b0','#c8860e','rkl0')}</div>
  <div class="rk-nm">${isA?`[${esc(x.tag)}]`:esc(x.n)}</div><div class="rk-sub">${isA?esc(x.name):x.tag?`[${esc(x.tag)}]`:'&nbsp;'}</div><div class="rk-big">${fmt(v)}</div><div class="rk-step"><b>${i+1}</b></div></div>`}).join('')}</div>`}
function row(x,isA,key){return`<div class="rk-row ${x.me||x.own?'me':''}" data-act="rk-open" data-id="${isA?'a:'+x.tag:x.id}"><span class="rk-n">${x.rank}</span>${arrow(x.d1)}${isA?em(x,26):av(x,26)}<span class="rk-name">${isA?`<b>[${esc(x.tag)}]</b> ${esc(x.name)}`:`${esc(x.n)}${x.me?' <i class="rk-du">Du</i>':''}${x.tag?` <span class="mut">[${esc(x.tag)}]</span>`:''}${x.act?'':' <span class="rk-i">i</span>'}`}</span><span class="rk-p">${fmt(x[key])}${isA&&key!=='tot'?'':''}</span></div>`}
PANELS.rank=()=>{const isA=RK.mode==='a';const cats=isA?ACAT:CAT;if(!cats.some(c=>c[0]===RK.sort))RK.sort='tot';
 const P=players(isA?'tot':RK.sort);const L=isA?allies(RK.sort,P):P;const key=RK.sort;
 const mine=isA?L.find(a=>a.own):L.find(x=>x.me);const top=L.slice(0,3),rest=L.slice(3,103);
 const pin=mine?`<div class="rk-pin">${mine.rank>103||mine.rank<=3?'':'<span class="mut" style="font-size:10px">Dein Platz</span>'}${row(mine,isA,key)}</div>`:isA?`<div class="rk-pin"><div class="rk-row"><span class="mut">Du bist in keiner Allianz.</span></div></div>`:'';
 return[`${IC.trophy} Rangliste`,`<div class="rk"><div class="rk-left"><div class="rk-tabs"><button class="${!isA?'on':''}" data-act="rk-mode" data-v="p">Spieler</button><button class="${isA?'on':''}" data-act="rk-mode" data-v="a">Allianzen</button></div>
 <div class="rk-cats">${cats.map(([k,n])=>`<button class="${key===k?'on':''}" data-act="rk-sort" data-v="${k}">${n}</button>`).join('')}</div>${podium(top,isA,key)}</div>
 <div class="rk-right"><div class="rk-head"><span>#</span><span></span><span>${isA?'Allianz':'Spieler'}</span><span>${cats.find(c=>c[0]===key)[1]}</span></div><div class="rk-list">${rest.map(x=>row(x,isA,key)).join('')}</div>${pin}</div></div>`]};
function bar(n,v,tot,c){return`<div class="rk-br"><span>${n}</span><div><i style="width:${tot?Math.max(1.5,v/tot*100):0}%;background:${c}"></i></div><b>${fmt(v)}</b></div>`}
PANELS.rkprof=id=>{const P=players('tot');
 if(id.startsWith('a:')){const a=allies('tot',P).find(x=>x.tag===id.slice(2));if(!a)return['Allianz','<div class="mut">Nicht gefunden</div>'];const mem=a.mem.slice().sort((x,y)=>y.tot-x.tot);
  const act=a.own?`<button class="btn sm" data-act="rk-ally">${IC.ally} Zum Allianz-Portal</button>`:S.ally?`<button class="btn sm ghost" disabled>Du bist bereits in [${esc(S.ally.tag)}]</button>`:RK.applied===a.tag?`<button class="btn sm ghost" disabled>Bewerbung läuft…</button>`:`<button class="btn sm" data-act="rk-apply" data-id="${esc(a.tag)}">${IC.ally} Bewerben</button>`;
  return[`[${esc(a.tag)}] ${esc(a.name)}`,`<div class="rk-prof"><div class="rk-ph">${em(a,64)}<div><div class="rk-pn">[${esc(a.tag)}] ${esc(a.name)}</div><div class="mut">Platz ${a.rank} · ${a.n} Mitglieder · Ø ${fmt(a.avg)}</div><div class="rk-big" style="text-align:left">${fmt(a.tot)}</div></div></div>
  <div class="row" style="gap:6px;margin:6px 0">${act}</div><div class="box"><b>Mitglieder</b>${mem.slice(0,25).map((p,i)=>`<div class="rk-row ${p.me?'me':''}" data-act="rk-open" data-id="${p.id}" data-push="1"><span class="rk-n">${i+1}</span>${av(p,22)}<span class="rk-name">${esc(p.n)}${p.me?' <i class="rk-du">Du</i>':''}</span><span class="rk-p">${fmt(p.tot)}</span></div>`).join('')}</div></div>`]}
 const x=P.find(p=>p.id===id);if(!x)return['Spieler','<div class="mut">Nicht gefunden</div>'];const a=x.tag?allies('tot',P).find(z=>z.tag===x.tag):null;const max=Math.max(x.b,x.t,x.f,x.d);
 return[esc(x.n),`<div class="rk-prof"><div class="rk-ph">${av(x,60)}<div><div class="rk-pn">${esc(x.n)}${x.me?' <i class="rk-du">Du</i>':''}${x.act?'':' <span class="rk-i">inaktiv</span>'}</div><div class="mut">Platz ${x.rank} ${arrow(x.d1)} · Heimat [${x.home.join(':')}]</div>
 <div class="mut">${a?`Allianz: <a data-act="rk-open" data-id="a:${esc(a.tag)}" data-push="1" class="rk-link">[${esc(a.tag)}] ${esc(a.name)}</a> · Platz ${a.rank}`:'Keine Allianz'}</div><div class="rk-big" style="text-align:left">${fmt(x.tot)}</div></div></div>
 <div class="box">${bar('Gebäude',x.b,max,'linear-gradient(90deg,#38e1ff,#3a7bff)')}${bar('Forschung',x.t,max,'linear-gradient(90deg,#a66bff,#6b4bff)')}${bar('Flotte',x.f,max,'linear-gradient(90deg,#ff9f43,#ff5d73)')}${bar('Verteidigung',x.d,max,'linear-gradient(90deg,#5cf2a0,#18a3a8)')}<div class="mut" style="font-size:10.5px;margin-top:4px">1 Punkt je 1.000 ausgegebene Rohstoffe</div></div>
 ${x.me?'':`<div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap"><button class="btn sm" data-act="rk-gal" data-id="${x.id}">${IC.gal} In Galaxie zeigen</button>${a&&!a.own&&!S.ally?`<button class="btn sm ghost" data-act="rk-apply" data-id="${esc(a.tag)}">${IC.ally} Bei [${esc(a.tag)}] bewerben</button>`:''}</div>
 <div class="row" style="margin-top:8px"><input id="rkmsg" data-k="rkmsg" placeholder="Nachricht an ${esc(x.n)}…" maxlength="200" style="flex:1"><button class="btn sm ghost" data-act="rk-msg" data-id="${x.id}">${IC.mail} Senden</button></div>`}</div>`]};
const REPL=['Danke für die Nachricht! Viel Erfolg da draußen.','Hi! Gern, lass uns in Kontakt bleiben.','Kein Interesse, sorry.','Haha, wir sehen uns im Kampf 😉','Interessant – meld dich, wenn du Kristall brauchst.','Bin gerade auf Expedition, schreibe später mehr.'];
document.addEventListener('click',ev=>{const t=ev.target.closest('[data-act^="rk-"]');if(!t)return;const a=t.dataset.act,id=t.dataset.id;
 switch(a){case 'rk-mode':RK.mode=t.dataset.v;RK.sort='tot';renderPanel();{const l=$('.rk-list');if(l)l.scrollTop=0}break;
  case 'rk-sort':RK.sort=t.dataset.v;renderPanel();{const l=$('.rk-list');if(l)l.scrollTop=0}break;
  case 'rk-open':openPanel('rkprof',id,true);break;
  case 'rk-ally':closePanel();if(window.ALLY)ALLY.tab='home';setView('ally');break;
  case 'rk-gal':{const x=players('tot').find(p=>p.id===id);if(!x)break;closePanel();setView('galaxy');setTimeout(()=>{if(GX.goto)GX.goto(x.home[0],x.home[1],x.home[2])},60);break}
  case 'rk-msg':{const x=players('tot').find(p=>p.id===id);const i=$('#rkmsg');const txt=String(i&&i.value||'').trim();if(!txt||!x){toast('Nachricht eingeben','err');break}i.value='';toast(`Nachricht an ${x.n} gesendet`,'ok');
   S.log.unshift({t:Date.now(),kind:'msg',txt:`Du → ${x.n}: ${txt}`});setTimeout(()=>{S.log.unshift({t:Date.now(),kind:'msg',txt:`${x.n}: ${REPL[h32(x.n+txt)%REPL.length]}`});toast(`Antwort von ${x.n} (Chat)`);save()},4000+Math.random()*6000);save();break}
  case 'rk-apply':{if(S.ally){toast('Du bist bereits in einer Allianz','err');break}if(!E.maxB('alliance')){toast('Allianzdepot benötigt','err');break}const al=allies('tot').find(z=>z.tag===id);if(!al)break;RK.applied=id;toast(`Bewerbung an [${id}] gesendet`,'ok');renderPanel(true);
   setTimeout(()=>{RK.applied=null;if(S.ally)return;if(Math.random()<.65){S.ally={name:al.name,tag:al.tag,created:Date.now()-30*DAY,em:al.em};const A=ALLY.init();A.members[0].rank='recruit';
     al.mem.filter(m=>!m.me).sort((x,y)=>y.tot-x.tot).slice(0,14).forEach((m,i)=>A.members.push({id:'r'+m.id,n:m.n,rank:i===0?'leader':i<3?'officer':'member',pts:m.tot,joined:Date.now()-DAY*(5+i),don:Math.round(m.tot*20),on:Date.now()-(i%3)*20*60000}));
     A.chat.push({t:Date.now(),from:'System',txt:`${S.cmdName} ist der Allianz beigetreten.`,sys:true});RK.g=null;toast(`[${al.tag}] hat dich aufgenommen!`,'ok')}else toast(`[${al.tag}] hat deine Bewerbung abgelehnt`,'err');save();renderAll()},8000+Math.random()*12000);break}}});
})();
