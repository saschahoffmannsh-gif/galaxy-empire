'use strict';
let D={ships:{},to:null,mission:null,pct:100,cargo:{m:0,k:0,g:0}},fleetTab='moves';
function dispatch(g,s,p,m){D={ships:{},to:{g,s,p,moon:false},mission:m,pct:100,cargo:{m:0,k:0,g:0}};const pp=pl();
 if(m==='spy'&&pp.ships.pr)D.ships.pr=Math.min(pp.ships.pr,Math.max(1,Math.min(5,pp.ships.pr)));
 if(m==='colonize'&&pp.ships.co)D.ships.co=1;
 if(m==='recycle'&&pp.ships.rc)D.ships.rc=pp.ships.rc;
 if(m==='explore')for(const k of['rc','lc','sc','pr'])if(pp.ships[k])D.ships[k]=pp.ships[k];
 if(m==='attack')for(const k in pp.ships)if(!['pr','co','ss','rc'].includes(k))D.ships[k]=pp.ships[k];
 fleetTab='send';setView('fleet')}
function renderFleet(){$('#fleettabs').innerHTML=[['moves','Bewegungen'],['send','Flotte senden'],['reports','Berichte']].map(t=>`<button class="${fleetTab===t[0]?'on':''}" data-act="ftab" data-v="${t[0]}">${t[1]}</button>`).join('');
 const b=$('#fleetbody');b.className='vbody glass';setHTML(b,fleetTab==='moves'?movesHTML():fleetTab==='send'?sendHTML():reportsList());updTimers()}
function movesHTML(){const fl=S.fleets.filter(f=>!f.npc||E.raidVisible(f));const p=pl();
 const head=`<div class="row" style="margin-bottom:8px"><b>Flottenslots ${E.slotsUsed()}/${E.fleetSlots()}</b><span class="mut">Nebelflotten ${p.moon?'–':E.nebulaUsed(p.id)+'/'+E.nebulaSlots()} (pro Planet, zählen nicht als Slot)</span><span class="spacer"></span><button class="btn sm" data-act="ftab" data-v="send">${IC.fleet} Neue Flotte</button></div>`;
 if(!fl.length)return head+'<div class="mut" style="padding:30px;text-align:center">Keine Flotten unterwegs.</div>';
 return head+fl.map(f=>{const st=f.phase==='hold'?f.arrive-f.hold:f.phase==='back'?f.arrive-f.dur:f.depart;const src=f.npc?'Piraten':S.planets[f.from]?.name||'?';
  const phase=f.npc?'Angriff auf '+esc(S.planets[f.target]?.name||''):f.phase==='out'?'Hinflug':f.phase==='hold'?'Erkundet den Nebel':'Rückflug';
  return`<div class="fl"><div class="mi ${f.mission==='attack'?'att':f.mission==='explore'?'neb':''}">${IC[f.mission]||IC.fleet}</div><div class="ft"><b>${E.MISSIONS[f.mission]} · ${phase}</b><div>${esc(src)} → [${f.to.g}:${f.to.s}:${f.to.p}]${f.to.p===16?' Nebel':''} · ${Object.entries(f.ships).map(([k,v])=>fmt(v)+'× '+GE.SHIP[k].n).join(', ')}</div><div class="bar"><i data-pstart="${st}" data-pend="${f.arrive}"></i></div></div><div style="text-align:right"><b data-end="${f.arrive}"></b><div class="mut" style="font-size:10.5px">${clock(f.arrive)}</div>${!f.npc&&f.phase!=='back'?`<button class="btn sm ghost" data-act="recall" data-id="${f.id}" style="margin-top:3px">Rückruf</button>`:''}</div></div>`}).join('')}
function selShips(){const p=pl(),o={};for(const k in D.ships)if(D.ships[k]>0)o[k]=Math.min(D.ships[k],p.ships[k]||0);for(const k in o)if(!o[k])delete o[k];return o}
function sendHTML(){const p=pl();const avail=Object.keys(p.ships).filter(k=>k!=='ss'&&p.ships[k]>0);
 if(!D.to)D.to={g:p.g,s:p.s,p:16,moon:false};const to=D.to;const ms=to.moon?['transport','deploy']:E.missionsFor(to.g,to.s,to.p);if(!ms.includes(D.mission))D.mission=ms[0]||null;
 const ships=selShips();const has=Object.keys(ships).length;const dur=has?E.flightTime(p,to,ships,D.pct)*1000:0;const fuel=has?E.fuel(p,to,ships,D.pct):0;const cap=E.cargoCap(ships);const sl=E.slot(to.g,to.s,to.p);
 const left=avail.length?avail.map(k=>`<div class="unitrow" style="padding:5px">${A.img(k).replace('class="gi','style="width:40px;height:40px" class="gi')}<div style="flex:1"><div class="un" style="font-size:12px">${GE.SHIP[k].n}</div><div class="us">Verfügbar: ${fmt(p.ships[k])}</div></div><div class="stepper"><input class="num" type="number" min="0" data-k="s_${k}" data-act="sinput" data-id="${k}" value="${ships[k]||''}" placeholder="0"><button data-act="sall" data-id="${k}" style="width:auto;padding:0 7px;font-size:11px">Alle</button></div></div>`).join('')+`<div class="row"><button class="btn sm ghost" data-act="sall" data-id="*">Alle Schiffe</button><button class="btn sm ghost" data-act="snone">Keine</button></div>`
  :`<div class="mut" style="padding:20px;text-align:center">Auf ${esc(p.name)} sind keine flugfähigen Schiffe stationiert.<br><br><button class="btn sm" data-act="open" data-p="yard">Zur Werft</button></div>`;
 const tname=to.moon?'Mond':sl.kind==='own'?sl.name:sl.kind==='nebula'?'Mysteriöser Nebel':sl.kind==='npc'?`${sl.name} (NPC Lv${sl.lv})`:sl.kind==='inactive'?`${sl.player} (inaktiv)`:sl.kind==='player'?`${sl.player} (geschützt)`:'Freie Position';
 const right=`<div class="box" style="margin-bottom:8px"><b>Ziel</b><div class="row" style="margin-top:5px"><input class="navin" type="number" data-k="tg" id="tg" value="${to.g}" min="1" max="9"><input class="navin" type="number" data-k="ts" id="ts" value="${to.s}" min="1" max="499"><input class="navin" type="number" data-k="tp" id="tp" value="${to.p}" min="1" max="16"><button class="btn sm ghost" data-act="settarget">OK</button></div>
  <div class="mut" style="font-size:11.5px;margin-top:4px">${esc(tname)}</div><div class="row" style="margin-top:5px;gap:4px">${E.planets().filter(x=>x.id!==p.id).map(x=>`<button class="btn sm ghost" data-act="quickt" data-id="${x.id}">${esc(x.name)}${x.moon?' (Mond)':''}</button>`).join('')}<button class="btn sm ghost" data-act="quickt" data-id="neb">Nebel</button></div></div>
 <div class="box" style="margin-bottom:8px"><b>Mission</b><div class="row" style="margin-top:5px;gap:4px">${ms.length?ms.map(m=>`<button class="btn sm ${D.mission===m?'':'ghost'}" data-act="mission" data-v="${m}">${E.MISSIONS[m]}</button>`).join(''):'<span class="mut">Keine Mission möglich</span>'}</div></div>
 <div class="box" style="margin-bottom:8px"><div class="row"><b>Geschwindigkeit</b><span class="spacer"></span><b>${D.pct} %</b></div><input class="slider" type="range" min="10" max="100" step="10" value="${D.pct}" data-act="fpct"></div>
 ${['transport','deploy','colonize'].includes(D.mission)?`<div class="box" style="margin-bottom:8px"><b>Ladung</b> <span class="mut">(frei ${fmt(Math.max(0,cap-fuel))})</span>${['m','k','g'].map(r=>`<div class="row" style="margin-top:4px">${IC[r]}<input class="num" style="flex:1" type="number" min="0" data-k="c_${r}" data-act="cinput" data-id="${r}" value="${D.cargo[r]||''}" placeholder="0"><button class="btn sm ghost" data-act="cmax" data-id="${r}">Max</button></div>`).join('')}</div>`:''}
 <div class="box sum"><span>Flugzeit</span><b>${has?ft(dur):'–'}</b>${D.mission==='explore'?`<span>Erkundung</span><b>${ft(30*60e3/S.speed)}</b>`:''}<span>Ankunft</span><b>${has?clock(E.now()+dur):'–'}</b><span>Rückkehr</span><b>${has&&D.mission!=='deploy'&&D.mission!=='colonize'?clock(E.now()+dur*2+(D.mission==='explore'?30*60e3/S.speed:0)):'–'}</b><span>Treibstoff</span><b class="${fuel>p.r.g?'negv':''}">${fmt(fuel)} Gas</b><span>Laderaum</span><b>${fmt(cap)}</b><span>Slots</span><b>${D.mission==='explore'?`Nebel ${E.nebulaUsed(p.id)}/${E.nebulaSlots()}`:`${E.slotsUsed()}/${E.fleetSlots()}`}</b></div>
 <button class="btn" style="width:100%;margin-top:8px" data-act="send">${IC.fleet} Flotte starten</button>`;
 return`<div class="disp"><div>${left}</div><div>${right}</div></div>`}
let sysG=null,sysS=null;
function renderSystem(){const p=pl();if(sysG==null){sysG=p.g;sysS=p.s}
 $('#sysbar').innerHTML=`<button class="iconbtn" data-act="sysnav" data-d="-1">‹</button><b>Sonnensystem ${sysG}:${sysS}</b><button class="iconbtn" data-act="sysnav" data-d="1">›</button><button class="btn sm ghost" data-act="syshome">Heimat</button>`;
 let h=`<div class="sun" data-act="sun">${A.img('sun')}</div>`;
 for(const sl of E.system(sysG,sysS)){const deb=S.debris[E.ck(sysG,sysS,sl.p)];
  if(sl.kind==='nebula'){h+=`<div class="nebula" data-act="sysplan" data-p="16">${A.img('nebula')}<div class="nl">Mysteriöser Nebel<div class="mut" style="font-size:10px;text-align:center">Position 16</div></div></div>`;continue}
  const own=sl.kind==='own'?sl.pl:null;const sz=sl.kind==='empty'?40+Math.round(sl.fields/7):own?Math.min(96,52+own.fields/6):sl.kind==='npc'?48+sl.lv*5:58+((sl.p*37)%28);const src=sl.type?A.planetSrc(sl.type):'';const cur=own&&own.id===p.id;
  h+=`<div class="orbit ${sl.kind} ${cur?'sel':''}" data-act="sysplan" data-p="${sl.p}"><div class="pnum">${sl.p}</div><img class="pimg" src="${src}" style="width:${sz}px;height:${sz}px">
   ${own&&own.moonId?'<img class="moonimg" src="assets/p/eisplanet.webp">':''}${deb?'<span class="debr" title="Trümmerfeld">✦</span>':''}
   <div class="pname">${sl.kind==='empty'?`Frei · ${sl.fields} Felder`:esc(sl.name)}</div><div class="powner">${own?esc(S.cmdName):sl.kind==='npc'?`NPC · Lv ${sl.lv}`:sl.kind==='inactive'?esc(sl.player)+' (i)':sl.kind==='player'?esc(sl.player):'<span class="colhint">Kolonisieren</span>'}</div></div>`}
 const st=$('#sysstrip').scrollLeft;$('#sysstrip').innerHTML=h;$('#sysstrip').scrollLeft=st}
function closePop(){const p=$('#pop');if(p)p.remove()}
function sysPop(pn,el){const sl=E.slot(sysG,sysS,pn);const ms=E.missionsFor(sysG,sysS,pn);closePop();const r=el.getBoundingClientRect();
 let info=sl.kind==='nebula'?`Rohstoffe, Wracks, Dunkle Materie und verlassene Schiffe – aber auch Piraten und Schwarze Löcher. Erkundung dauert ${ft(30*60e3/S.speed)}. Je mehr Sonden, desto mehr Schiffsfunde.`
 :sl.kind==='own'?`Dein Planet · Felder ${E.fieldsUsed(sl.pl)}/${sl.pl.fields} · ${sl.pl.temp} °C`:sl.kind==='npc'?`Feindlicher NPC-Planet „${esc(sl.de)}“, Stufe ${sl.lv}. Regeneriert Rohstoffe und Verteidigung, kann Galactonit-Splitter fallen lassen.`
 :sl.kind==='inactive'?`Inaktiver Spieler · ${fmt(sl.pts)} Punkte${sl.ally?' · ['+sl.ally+']':''}. Lohnendes Ziel für Raubzüge.`:sl.kind==='player'?`Aktiver Spieler · ${fmt(sl.pts)} Punkte${sl.ally?' · ['+sl.ally+']':''}. <span class="badge prot">Geschützt</span>`:`Freie Position · ca. ${E.colFields(sysG,sysS,pn)} Felder · ${220-(pn-1)*25} °C`;
 const deb=S.debris[E.ck(sysG,sysS,pn)];const d=document.createElement('div');d.className='pop glass';d.id='pop';
 d.innerHTML=`<h4>${sl.kind==='empty'?'Freie Position':esc(sl.name)} <span class="mut">[${sysG}:${sysS}:${pn}]</span></h4><div class="desc" style="font-size:11.5px">${info}</div>${deb?`<div class="mut" style="font-size:11px;margin-top:4px">Trümmerfeld: ${fmt(deb.m)} M · ${fmt(deb.k)} K</div>`:''}<div class="acts">${sl.kind==='own'&&sl.pl.id!==S.cur?`<button class="btn sm" data-act="switch" data-id="${sl.pl.id}">Besuchen</button>`:''}${ms.map(m=>`<button class="btn sm ${m==='attack'?'red':''}" data-act="dispatch" data-g="${sysG}" data-s="${sysS}" data-p="${pn}" data-m="${m}">${E.MISSIONS[m]}</button>`).join('')}</div>`;
 $('#app').appendChild(d);const w=d.offsetWidth,hh=d.offsetHeight;d.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2))+'px';d.style.top=Math.max(56,Math.min(innerHeight-hh-64,r.top+r.height*0.6))+'px'}
let galG=null,galS=null;
function renderGalList(){const p=pl();if(galG==null){galG=p.g;galS=p.s}
 $('#galbar').innerHTML=`<span class="mut">Galaxie</span><button class="iconbtn" data-act="galnav" data-k="g" data-d="-1">‹</button><input class="navin" id="gg" type="number" value="${galG}" min="1" max="9"><button class="iconbtn" data-act="galnav" data-k="g" data-d="1">›</button><span class="mut">System</span><button class="iconbtn" data-act="galnav" data-k="s" data-d="-1">‹</button><input class="navin" id="gs" type="number" value="${galS}" min="1" max="499"><button class="iconbtn" data-act="galnav" data-k="s" data-d="1">›</button><button class="btn sm" data-act="galgo">Los</button><button class="btn sm ghost" data-act="galhome">Heimat</button><span class="mut" style="font-size:11px">Sonden: ${fmt(p.ships.pr||0)}</span>`;
 $('#galtable').innerHTML=`<table class="gt"><tr><th>Pos</th><th></th><th>Planet</th><th>Spieler</th><th>Allianz</th><th>Trümmer</th><th>Aktionen</th></tr>${E.system(galG,galS).map(sl=>{const deb=S.debris[E.ck(galG,galS,sl.p)];const ms=E.missionsFor(galG,galS,sl.p);
  const img=sl.kind==='nebula'?A.img('nebula','pt'):sl.type?`<img class="pt" src="${A.planetSrc(sl.type)}" style="${sl.kind==='empty'?'opacity:.35;filter:grayscale(.6)':''}">`:'';
  const who=sl.kind==='own'?`<span class="badge own">${esc(S.cmdName)}</span>`:sl.kind==='npc'?`<span class="badge">NPC Lv${sl.lv}</span>`:sl.kind==='inactive'?`${esc(sl.player)} <span class="badge i">i</span>`:sl.kind==='player'?`${esc(sl.player)} <span class="badge prot">☮</span>`:'';
  return`<tr><td>${sl.p}</td><td>${img}</td><td>${sl.kind==='empty'?`<span class="mut">Frei · ${sl.fields} Felder</span>`:esc(sl.name)}${sl.kind==='own'&&sl.pl.moonId?' <span class="badge i">Mond</span>':''}</td><td>${who}</td><td>${sl.kind==='own'&&S.ally?esc(S.ally.tag):sl.ally?esc(sl.ally):''}</td><td>${deb?`<span class="mut">${fmt(deb.m+deb.k)}</span>`:''}</td><td><div class="acts">${ms.map(m=>`<button data-act="dispatch" data-g="${galG}" data-s="${galS}" data-p="${sl.p}" data-m="${m}" title="${E.MISSIONS[m]}" style="${m==='attack'?'color:var(--bad)':''}">${IC[m]}</button>`).join('')}</div></td></tr>`}).join('')}</table>`}
function renderAlly(){const b=$('#allybody');b.className='vbody glass';const pts=E.totalPoints();
 const rank=GE.FAKE_NAMES.map((n,i)=>({n,p:Math.round(2.4e6*Math.pow(0.82,i)+((i*7919)%5000))}));rank.push({n:S.cmdName+' (Du)',p:pts,me:1});rank.sort((a,b)=>b.p-a.p);const my=rank.findIndex(r=>r.me);
 let h='<div class="disp"><div>';
 if(!E.maxB('alliance'))h+=`<div class="box"><b>Allianzdepot benötigt</b><div class="desc" style="margin:6px 0">Baue zuerst ein Allianzdepot, um eine Allianz zu gründen.</div><button class="btn sm" data-act="bldopen" data-id="alliance">Allianzdepot öffnen</button></div>`;
 else if(!S.ally)h+=`<div class="box"><b>Allianz gründen</b><div class="row" style="margin-top:6px"><input id="an" data-k="an" placeholder="Name" maxlength="24" style="flex:1"><input id="at" data-k="at" placeholder="Kürzel" maxlength="5" style="width:80px"></div><button class="btn" style="margin-top:8px" data-act="mkally">${IC.ally} Gründen</button></div>`;
 else h+=`<div class="box"><div class="row">${IC.ally}<b style="font-size:16px">${esc(S.ally.name)}</b><span class="badge own">${esc(S.ally.tag)}</span></div><div class="desc" style="margin-top:6px">Gegründet am ${new Date(S.ally.created).toLocaleDateString('de-DE')} · Mitglieder: 1 (${esc(S.cmdName)}, Gründer)<br>Allianzpunkte: ${fmt(pts/1000)} (1.000 Spielerpunkte = 1 Allianzpunkt)</div></div>`;
 h+=`<div class="box" style="margin-top:8px;font-size:12px;color:var(--mut)">Mitglieder, Allianzkämpfe und Rohstoffhilfe kommen mit dem Mehrspielerserver.</div></div>`;
 h+=`<div class="box"><div class="row">${IC.rank}<b>Rangliste</b><span class="spacer"></span><span class="mut">Du: Platz ${my+1} · ${fmt(pts)} Punkte</span></div><table class="tbl" style="margin-top:4px">${rank.slice(0,12).map((r,i)=>`<tr class="${r.me?'cur':''}"><td>${i+1}</td><td>${esc(r.n)}</td><td style="text-align:right">${fmt(r.p)}</td></tr>`).join('')}${my>=12?`<tr class="cur"><td>${my+1}</td><td>${esc(rank[my].n)}</td><td style="text-align:right">${fmt(pts)}</td></tr>`:''}</table></div></div>`;
 setHTML(b,h)}
function renderChat(){const b=$('#chatbody');b.className='vbody glass';
 b.innerHTML=`<div class="row" style="margin-bottom:8px"><b>Galaxie-Funk</b><span class="mut" style="font-size:11px">Meldungen deines Imperiums · Mehrspieler-Chat folgt mit dem Server</span></div>`+(S.log.length?S.log.slice(0,60).map(l=>`<div class="chatmsg"><div class="cav">${l.kind==='task'?'A':l.kind==='warn'?'!':'S'}</div><div class="cb"><small>${l.kind==='task'?'Aries':'System'} · ${new Date(l.t).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}</small>${esc(l.txt)}</div></div>`).join(''):'<div class="mut">Noch keine Meldungen.</div>')}
function renderAll(){renderTop();renderNav();renderView()}
function after(){save();if(panelStack.length)renderPanel(true);renderAll()}
document.addEventListener('click',ev=>{const t=ev.target.closest('[data-act]');if(!t){if(!ev.target.closest('#pop'))closePop();return}const a=t.dataset.act,id=t.dataset.id;const p=pl();
 if(a!=='sysplan'&&!t.closest('#pop'))closePop();
 switch(a){
 case 'tab':closePanel();setView(t.dataset.v);break;
 case 'open':openPanel(t.dataset.p,null,!!t.dataset.push&&panelStack.length>0);break;
 case 'pclose':closePanel();break;case 'pback':backPanel();break;
 case 'bld':openPanel('bld',id);break;
 case 'bldopen':openPanel('bld',id);break;
 case 'pbld':openPanel('bld',id,panelStack.length>0);break;
 case 'ptech':openPanel('tech',id,true);break;
 case 'unit':openPanel('unit',[t.dataset.kind,id],true);break;
 case 'build':if(!err(E.build(p.id,id))){toast(`${GE.BUILD[id].n} wird gebaut`,'ok');after()}break;
 case 'demo':if(confirm(`${GE.BUILD[id].n} um eine Stufe abreißen?`)&&!err(E.demolish(p.id,id)))after();break;
 case 'cancelb':E.cancelBuild(p.id,+t.dataset.i);after();break;
 case 'research':if(!err(E.research(p.id,id))){toast(`Forschung gestartet: ${GE.TECH[id].n}`,'ok');after()}break;
 case 'cancelr':E.cancelResearch();after();break;
 case 'speed':{const k=t.dataset.k;if(!err(k==='sub'?E.speedupBuild(p.id):k==='res'?E.speedupResearch():E.speedupYard(p.id)))after();break}
 case 'umax':$('#u_'+id).value=t.dataset.max;break;
 case 'units':{const n=+($('#u_'+id).value||0);if(!err(E.buildUnits(p.id,t.dataset.kind,id,n))){toast(`${fmt(n)}× ${E.unitDef(t.dataset.kind,id).n} in Auftrag`,'ok');$('#u_'+id).value='';after()}break}
 case 'claim':if(!err(E.claimTask())){toast('Belohnung: '+E.rewardText(GE.TASKS[S.task-1].r),'ok',4000);after()}break;
 case 'rep':openPanel('rep',+id,panelStack.length>0);break;
 case 'readall':S.reports.forEach(r=>r.read=true);after();break;
 case 'replay':{const r=S.reports.find(x=>x.id===+id);window.REPLAY.play(r.battle||r.neb.battle);break}
 case 'gift':if(!err(E.claimGift())){toast('Tagesgeschenk erhalten!','ok');after()}break;
 case 'buy':{const it=E.STORE.find(x=>x.id===id);if(confirm(`${it.n} für ${it.dm} DM kaufen?`)&&!err(E.buy(id,p.id))){toast('Gekauft: '+it.n,'ok');after()}break}
 case 'hire':if(!err(E.hireCmd(id,+t.dataset.d))){toast(GE.COMMANDERS[id].n+' angeheuert','ok');after()}break;
 case 'use':if(!err(E.useItem(id))){toast(GE.ITEMS[id].n+' aktiviert','ok');after()}break;
 case 'fuse':if(!err(E.fuseShards(id))){toast('Edelstein erschaffen!','ok');after()}break;
 case 'gemsel':gemSel=+id;after();break;
 case 'gemfuse':{const g=S.gal.gems.find(x=>x.id===gemSel);if(g&&!err(E.fuseGems(g.col,g.star))){gemSel=null;toast('Edelstein verbessert!','ok');after()}break}
 case 'gemstr':if(gemSel&&!err(E.strengthen(gemSel)))after();break;
 case 'gemdec':if(gemSel&&confirm('Edelstein in Energie zerlegen?')&&!err(E.decompose(gemSel))){gemSel=null;after()}break;
 case 'equip':if(!gemSel){toast('Wähle zuerst unten einen Edelstein','err');break}if(!err(E.equip(p.id,gemSel))){gemSel=null;toast('Edelstein eingesetzt','ok');after()}break;
 case 'unequip':if(confirm('Edelstein für 2 DM ausbauen?')&&!err(E.unequip(p.id,+id)))after();break;
 case 'switch':S.cur=id;closePanel();sysG=galG=null;D.to=null;renderAll();toast('Planet: '+S.planets[id].name);break;
 case 'rename':{const n=prompt('Neuer Name für den Planeten:',S.planets[id].name);if(n!=null&&!err(E.rename(id,n))){toast('Planet umbenannt','ok');after()}break}
 case 'abandon':if(confirm(`${S.planets[id].name} wirklich aufgeben? Gebäude und Rohstoffe gehen verloren.`)&&!err(E.abandon(id)))after();break;
 case 'speedset':E.setSpeed(+t.dataset.v);toast(`Spieltempo ${t.dataset.v}×`,'ok');after();break;
 case 'raids':S.settings.raids=t.dataset.v==='1';after();break;
 case 'setname':{const v=$('#cmdname').value.trim();if(v.length<2){toast('Mindestens 2 Zeichen','err');break}S.cmdName=v.slice(0,18);S.flags.named=1;toast('Name gespeichert','ok');after();break}
 case 'export':{const box=$('#savebox');box.style.display='block';box.value=btoa(unescape(encodeURIComponent(JSON.stringify(S))));box.select();try{navigator.clipboard.writeText(box.value)}catch(e){}S.flags.exported=1;toast('Spielstand exportiert und kopiert','ok');save();renderTop();break}
 case 'import':{const box=$('#savebox');if(box.style.display!=='block'||!box.value){box.style.display='block';box.value='';box.placeholder='Spielstand-Code hier einfügen und erneut „Importieren“ tippen';box.focus();break}
  try{const o=JSON.parse(decodeURIComponent(escape(atob(box.value.trim()))));if(o.v!==3)throw 0;S=E.load(o);save();toast('Spielstand geladen','ok');closePanel()}catch(e){toast('Ungültiger Code','err')}break}
 case 'reset':if(confirm('Wirklich alles löschen und neu beginnen?')){localStorage.removeItem(KEY);S=E.newGame({speed:10});save();sysG=galG=null;D.to=null;closePanel();toast('Neues Spiel gestartet','ok')}break;
 case 'resinfo':openPanel('resinfo');break;
 case 'mkally':if(!err(E.createAlly($('#an').value,$('#at').value))){toast('Allianz gegründet!','ok');after()}break;
 case 'sun':toast('Zentralstern – Energiequelle für Solarkraftwerke und Satelliten. Innere Planeten sind heißer.','',4000);break;
 case 'sysplan':sysPop(+t.dataset.p,t);break;
 case 'sysnav':sysS=(sysS-1+ +t.dataset.d+499)%499+1;renderSystem();break;
 case 'syshome':sysG=p.g;sysS=p.s;renderSystem();break;
 case 'galnav':if(t.dataset.k==='g')galG=Math.min(9,Math.max(1,galG+ +t.dataset.d));else galS=(galS-1+ +t.dataset.d+499)%499+1;renderGalList();break;
 case 'galgo':galG=Math.min(9,Math.max(1,+$('#gg').value||1));galS=Math.min(499,Math.max(1,+$('#gs').value||1));renderGalList();break;
 case 'galhome':galG=p.g;galS=p.s;renderGalList();break;
 case 'dispatch':closePanel();dispatch(+t.dataset.g,+t.dataset.s,+t.dataset.p,t.dataset.m);break;
 case 'ftab':fleetTab=t.dataset.v;renderFleet();break;
 case 'recall':E.recall(+id);toast('Flotte zurückgerufen');renderFleet();break;
 case 'sall':if(id==='*'){for(const k in p.ships)if(k!=='ss')D.ships[k]=p.ships[k]}else D.ships[id]=p.ships[id];renderFleet();break;
 case 'snone':D.ships={};renderFleet();break;
 case 'settarget':D.to={g:Math.min(9,Math.max(1,+$('#tg').value||1)),s:Math.min(499,Math.max(1,+$('#ts').value||1)),p:Math.min(16,Math.max(1,+$('#tp').value||1)),moon:false};renderFleet();break;
 case 'quickt':if(id==='neb')D.to={g:p.g,s:p.s,p:16,moon:false};else{const x=S.planets[id];D.to={g:x.g,s:x.s,p:x.p,moon:!!x.moon};if(D.mission!=='deploy')D.mission='transport'}renderFleet();break;
 case 'mission':D.mission=t.dataset.v;renderFleet();break;
 case 'cmax':{const ships=selShips();const fuel=E.fuel(p,D.to,ships,D.pct);const free=E.cargoCap(ships)-fuel-(D.cargo.m+D.cargo.k+D.cargo.g-(D.cargo[id]||0));D.cargo[id]=Math.max(0,Math.floor(Math.min(id==='g'?p.r.g-fuel:p.r[id],free)));renderFleet();break}
 case 'send':{if(!D.mission){toast('Keine Mission gewählt','err');break}
  if(!err(E.send(p.id,selShips(),D.to,D.mission,D.pct,{...D.cargo}))){toast(`Flotte gestartet: ${E.MISSIONS[D.mission]}`,'ok');D.ships={};D.cargo={m:0,k:0,g:0};fleetTab='moves';save();renderAll()}break}
 }});
document.addEventListener('input',ev=>{const t=ev.target;const a=t.dataset.act;
 if(a==='pct'){E.setPct(pl().id,t.dataset.id,+t.value);const v=$('#pctv');if(v)v.textContent=t.value+' %';renderTop()}
 if(a==='fpct'){D.pct=+t.value;renderFleet()}
 if(a==='sinput')D.ships[t.dataset.id]=Math.max(0,Math.floor(+t.value||0));
 if(a==='cinput')D.cargo[t.dataset.id]=Math.max(0,Math.floor(+t.value||0))});
document.addEventListener('change',ev=>{const a=ev.target.dataset.act;if(a==='sinput'||a==='cinput')renderFleet()});
$('#plchip').addEventListener('click',()=>openPanel('planets'));
function updTimers(){const n=E.now();$$('[data-end]').forEach(el=>{el.textContent=ft(+el.dataset.end-n)});$$('[data-pend]').forEach(el=>{const s=+el.dataset.pstart,e=+el.dataset.pend;el.style.width=Math.max(0,Math.min(100,(n-s)/(e-s)*100))+'%'})}
let lastFull=0,lastSave=0;
function loop(){try{E.tick()}catch(e){console.error(e)}const n=Date.now();updRes();updTimers();
 if(dirty||n-lastFull>2000){dirty=false;lastFull=n;renderTop();
  const typing=document.activeElement&&['INPUT','TEXTAREA'].includes(document.activeElement.tagName);
  if(!typing){if(view==='base')renderBase();else if(view==='fleet'&&fleetTab!=='send')renderFleet();else if(view==='chat')renderChat();if(panelStack.length)renderPanel(true)}}
 if(n-lastSave>3000){lastSave=n;save()}}
load();A.stars($('#stars'));renderAll();setInterval(loop,250);if(window.WATER)WATER.init($('#waterhost'));
addEventListener('resize',()=>{A.stars($('#stars'));layoutPano()});addEventListener('orientationchange',()=>setTimeout(layoutPano,300));
document.addEventListener('visibilitychange',()=>{if(document.hidden)save();else{E.tick();renderAll()}});
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
window.GAME={E,get S(){return S},openPanel,setView,save,toast,dispatch};
