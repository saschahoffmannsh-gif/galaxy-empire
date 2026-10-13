'use strict';
const E=window.ENGINE,A=window.ART;const KEY='ge_remake_save_v3';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=n=>{n=Math.floor(n||0);const a=Math.abs(n);return a>=1e9?(n/1e9).toFixed(2).replace('.',',')+' Mrd':a>=1e7?(n/1e6).toFixed(1).replace('.',',')+' Mio':n.toLocaleString('de-DE')};
const ft=ms=>{let s=Math.max(0,Math.ceil(ms/1000));const d=s/86400|0;s%=86400;const h=s/3600|0,m=(s%3600)/60|0,x=s%60;return d?`${d}T ${h}h`:h?`${h}h ${String(m).padStart(2,'0')}m`:m?`${m}m ${String(x).padStart(2,'0')}s`:`${x}s`};
const clock=t=>new Date(t).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
const SV=p=>`<svg viewBox="0 0 24 24">${p}</svg>`;
const IC={m:SV('<path d="M4 15l8 4 8-4M4 11l8-4 8 4-8 4z" stroke="#c9d4e3"/>'),k:SV('<path d="M12 3l6 6-6 12-6-12z M6 9h12" stroke="#7af0ff"/>'),g:SV('<path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z" stroke="#7dffb0"/>'),
 e:SV('<path d="M13 2L5 14h6l-1 8 8-12h-6z" stroke="#ffe066"/>'),dm:'<img class="dmi" src="assets/img/dm.png" alt="DM">',
 time:SV('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
 base:SV('<path d="M3 21h18M5 21V10l7-5 7 5v11"/><path d="M9 21v-6h6v6"/>'),sys:SV('<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-20 12 12)"/>'),
 gal:SV('<path d="M12 12c0-4 4-6 7-4M12 12c4 0 6 4 4 7M12 12c0 4-4 6-7 4M12 12c-4 0-6-4-4-7"/><circle cx="12" cy="12" r="1.2"/>'),fleet:SV('<path d="M12 2l3 8 6 3-6 2-3 7-3-7-6-2 6-3z"/>'),
 ally:SV('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>'),chat:SV('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>'),
 bld:SV('<path d="M3 21h18M6 21V8l6-4 6 4v13M10 21v-5h4v5"/>'),res:SV('<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/>'),yard:SV('<path d="M4 20h16M6 20V9l6-5 6 5v11"/><path d="M12 4v16"/>'),
 def:SV('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>'),store:SV('<path d="M4 7h16l-1.5 12h-13z"/><path d="M9 7a3 3 0 0 1 6 0"/>'),cmd:SV('<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>'),
 gem:SV('<path d="M6 3h12l3 6-9 12L3 9z M3 9h18"/>'),inv:SV('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5h8v2"/>'),mail:SV('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'),
 gear:SV('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'),task:SV('<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>'),
 attack:SV('<path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/>'),spy:SV('<circle cx="12" cy="12" r="3"/><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/>'),transport:SV('<rect x="2" y="7" width="13" height="10" rx="1"/><path d="M15 10h4l3 3v4h-7"/>'),
 deploy:SV('<path d="M12 3v14M5 10l7 7 7-7M4 21h16"/>'),recycle:SV('<path d="M7 19H4l3-5M17 19h3l-3-5M9 5l3-3 3 3M8 14l4-7 4 7"/>'),colonize:SV('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'),explore:SV('<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/>'),
 pen:SV('<path d="M4 20h4L19 9l-4-4L4 16z"/>'),up:SV('<path d="M12 19V5M5 12l7-7 7 7"/>'),bolt:SV('<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>'),x:SV('<path d="M6 6l12 12M18 6L6 18"/>'),play:SV('<path d="M7 4l13 8-13 8z"/>'),rank:SV('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/>')};
let S,view='base',panelStack=[],dirty=false;
const pl=()=>E.planet();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function load(){let raw=null;try{const imp=sessionStorage.getItem('ge_import');if(imp){sessionStorage.removeItem('ge_import');localStorage.setItem(KEY,imp)}raw=JSON.parse(localStorage.getItem(KEY))}catch(e){}
 if(raw&&raw.v===3){S=E.load(raw);const before=S.t,logN=S.log.length;E.tick();const away=Date.now()-before;
  if(away>60000){setTimeout(()=>toast(`Willkommen zurück! ${ft(away)} offline nachgeholt.`,'ok',5000),600)}}
 else{S=E.newGame({speed:10});}
 E.on((t,d)=>{if(t==='built')toast(`${GE.BUILD[d.q.id].n} Stufe ${d.q.lv} fertig`,'ok');if(t==='researched')toast(`${GE.TECH[d.id].n} Stufe ${d.lv} erforscht`,'ok');
  if(t==='report'&&d.type!=='transport')toast('Neuer Bericht: '+d.title);if(t==='raidwarn')toast('⚠ Radar: Piratenflotte im Anflug!','err',5000);dirty=true});}
function toast(msg,kind='',ms=2600){const el=document.createElement('div');el.className='toast glass '+kind;el.textContent=msg;$('#toasts').appendChild(el);setTimeout(()=>el.remove(),ms);while($('#toasts').children.length>3)$('#toasts').firstChild.remove()}
const err=e=>{if(e){toast(e,'err');return true}return false};
function morph(a,b){const an=a.childNodes,bn=[...b.childNodes];
 for(let i=0;i<bn.length;i++){const o=an[i],n=bn[i];
  if(!o){a.appendChild(n);continue}
  if(o.nodeType!==n.nodeType||o.nodeName!==n.nodeName||(o.nodeType===1&&o.tagName==='IMG'&&(o.dataset.osrc||o.getAttribute('src'))!==n.getAttribute('src'))){a.replaceChild(n,o);continue}
  if(o.tagName==='IMG'&&o.dataset.osrc)continue;
  if(o.nodeType===3){if(o.data!==n.data)o.data=n.data;continue}
  if(o.nodeType!==1)continue;
  for(const at of [...o.attributes])if(!n.hasAttribute(at.name)&&!(o.tagName==='IMG'&&at.name==='src'))o.removeAttribute(at.name);
  for(const at of n.attributes)if(o.getAttribute(at.name)!==at.value&&!(o.tagName==='INPUT'&&at.name==='value'))o.setAttribute(at.name,at.value);
  if(o.tagName!=='INPUT'&&!o.hasAttribute('data-end'))morph(o,n)}
 while(an.length>bn.length)a.removeChild(a.lastChild)}
function setHTML(el,h){if(!el)return;if(el._h!==h){if(el._h==null){el.innerHTML=h}else{const t=document.createElement('template');t.innerHTML=h;morph(el,t.content)}el._h=h;return true}return false}
function renderTop(){const p=pl();
 setHTML($('#plchip'),`<img src="${A.planetSrc(p.type)}" ${p.moon?'style="filter:grayscale(1)"':''}><div style="min-width:0;text-align:left"><div class="pn">${esc(p.name)}</div><div class="pc">[${p.g}:${p.s}:${p.p}]${p.moon?' Mond':''} ▾</div></div>`);
 setHTML($('#res'),['m','k','g'].map(r=>`<div class="rc" data-act="resinfo" title="${GE.RES[r]}">${IC[r]}<div><div class="rv"></div><div class="rr"></div></div><div class="rbar"><i></i></div></div>`).join('')+
 `<div class="rc" data-act="resinfo">${IC.e}<div><div class="rv"></div><div class="rr"></div></div></div><div class="rc" data-act="open" data-p="store">${IC.dm}<div><div class="rv"></div><div class="rr">DM</div></div></div>`);
 updRes();
 const unread=S.reports.filter(r=>!r.read).length;const done=E.taskDone();
 setHTML($('#topbtns'),`<button class="iconbtn" data-act="open" data-p="tasks" aria-label="Aufgaben">${IC.task}${done?'<span class="dot ok">!</span>':''}</button><button class="iconbtn" data-act="open" data-p="reports" aria-label="Berichte">${IC.mail}${unread?`<span class="dot">${unread>99?'99+':unread}</span>`:''}</button><button class="iconbtn" data-act="open" data-p="settings" aria-label="Einstellungen">${IC.gear}</button>`);}
function updRes(){const p=pl(),pi=E.prodInfo(p);const els=$$('#res .rc');if(els.length<5)return;
 ['m','k','g'].forEach((r,i)=>{const el=els[i],cap=E.storeCap(p,r);el.querySelector('.rv').textContent=fmt(p.r[r]);el.querySelector('.rr').textContent=(pi[r]>=0?'+':'')+fmt(pi[r])+'/h';el.classList.toggle('full',p.r[r]>=cap);el.querySelector('.rbar i').style.width=Math.min(100,p.r[r]/cap*100)+'%'});
 const e=pi.eProd-pi.eUse;els[3].querySelector('.rv').textContent=fmt(e);els[3].querySelector('.rr').textContent=fmt(pi.eProd)+' erz.';els[3].classList.toggle('neg',e<0);els[4].querySelector('.rv').textContent=fmt(S.dm)}
const TABS=[['base','Base',IC.base],['system','System',IC.sys],['galaxy','Galaxie',IC.gal],['fleet','Flotte',IC.fleet],['ally','Allianz',IC.ally],['chat','Chat',IC.chat]];
function renderNav(){$('#nav').innerHTML=TABS.map(t=>`<button data-act="tab" data-v="${t[0]}" class="${view===t[0]?'on':''}">${t[2]}${t[1]}</button>`).join('')}
function setView(v){view=v;$$('.view').forEach(e=>e.classList.remove('active'));$('#v-'+v).classList.add('active');$('#pano').classList.toggle('paused',v!=='base');if(v==='base'){layoutPano();if(!placePlates._ok)baseKey=null}renderNav();renderView()}
document.addEventListener('visibilitychange',()=>$('#pano').classList.toggle('paused',document.hidden||view!=='base'));
function renderView(){({base:renderBase,system:renderSystem,galaxy:renderGalaxy,fleet:renderFleet,ally:renderAlly,chat:renderChat})[view]()}
// Basis: Gelände mit 12 Plattformen (Pad-Zentren per Bildanalyse ermittelt, Quelle 1280×720)
// Basis-Panorama 2340×720 (zwei Hälften, weich überblendet). Pad-Zentren per Bildanalyse.
const PADS=[
 ['Bergbau',430,185,111],['Schmiede',598,188,111],['Raffinerie',758,222,117],['Kraftwerk',362,282,119],['@fusion',360,404,131],
 ['Forschung',552,304,122],['KI_Center',740,337,126],['Roboter_Labor',552,437,137],['Lager',746,480,137],
 ['Werft',1480,319,129],['Verteidigung',1392,478,139],['Waffen',1716,358,133],['Allianzzentrum',1663,524,146],['@radar',1972,368,139],['@stargate',2012,522,153]];
const BIMG={Bergbau:[600,450],Schmiede:[460,346],Raffinerie:[480,371],Kraftwerk:[500,374],Forschung:[420,292],Roboter_Labor:[480,357],KI_Center:[460,384],Lager:[500,374],Werft:[600,476],Verteidigung:[500,366],Waffen:[500,372],Allianzzentrum:[500,385]};
const SHORTN={metal_mine:'Metall',crystal_mine:'Kristall',gas_mine:'Gas',solar:'Solar',fusion:'Fusion',lab:'Labor',nanite:'Naniten',robotics:'Roboter','@store':'Lager',shipyard:'Werft','@defense':'Abwehr',galacto:'Galactonit',alliance:'Allianz',radar:'Radar',stargate:'Sternentor',moon_base:'Mondbasis',pioneer:'Pionier',eux:'EUX',wormhole:'Wurmloch'};
const PANO_W=2340,PANO_H=720;let baseKey=null,panoS=1,panoCentered=false;
function layoutPano(){const H=$('#pano').clientHeight||innerHeight;panoS=H/PANO_H;
 $('#world').style.transform=`scale(${panoS})`;$('#sizer').style.width=PANO_W*panoS+'px';
 if(!panoCentered&&$('#pano').clientWidth){panoCentered=true;$('#pano').scrollLeft=Math.max(0,580*panoS-$('#pano').clientWidth/2+40)}}
function placePlates(){if(!$('#pano').clientWidth){placePlates._ok=0;return}const ps=[...$$('#blds .plate')].map(el=>({el,x:+el.dataset.x,y:+el.dataset.y,w:el.offsetWidth+8,h:el.offsetHeight+4}));
 ps.sort((a,b)=>a.y-b.y);const done=[];
 for(const p of ps){let tries=0;const hit=()=>done.find(q=>Math.abs(q.x-p.x)<(q.w+p.w)/2&&Math.abs(q.y-p.y)<(q.h+p.h)/2);let o;
  while((o=hit())&&tries++<20){p.y=o.y+(o.h+p.h)/2}p.el.style.left=p.x+'px';p.el.style.top=p.y+'px';done.push(p)}}
function buildBase(p){const moonMap={Werft:'shipyard',Roboter_Labor:'robotics',Lager:'moon_base',Forschung:'pioneer',Verteidigung:'@defense',Kraftwerk:'eux',KI_Center:'wormhole','@stargate':'stargate','@radar':'radar'};
 let h='';for(const [img,cx,cy,pw] of PADS){const id=p.moon?moonMap[img]:(img[0]==='@'?img.slice(1):GE.PANO[img]);if(!id)continue;
  let w,hh,src;if(img[0]==='@'){w=pw*1.25;hh=w;src=`assets/img/${img.slice(1)}.png`}else{const [iw,ih]=BIMG[img];w=pw*1.32;hh=w*ih/iw;src=`assets/b/${img}.webp`}
  const top=img[0]==='@'?cy+pw*0.42-hh:cy+pw*0.30-hh;
  h+=`<div class="bld" data-act="bld" data-id="${id}" style="left:${cx-w/2}px;top:${top}px;width:${w}px;height:${hh}px"><div class="shadow" style="width:${pw*1.05}px;height:${pw*0.5}px;left:${(w-pw*1.05)/2}px;top:${hh-pw*0.42}px"></div><img src="${src}" alt="" draggable="false"><div class="hint">Bauen</div></div>
  <div class="plate" data-pl="${id}" data-act="bld" data-id="${id}" data-x="${cx}" data-y="${cy+pw*0.40}"><b></b><span></span><div class="prog"><i></i></div></div>`}
 $('#blds').innerHTML=h;}
function renderBase(){const p=pl();const key=p.id+(p.moon?'m':'');
 if(baseKey!==key){baseKey=key;$('#world').classList.toggle('moon',!!p.moon);buildBase(p);layoutPano();var _np=1}
 for(const el of $$('#blds .bld')){const id=el.dataset.id;let lv,name,busy=null;
  if(id==='@store'){lv=Math.max(E.lv(p,'metal_store'),E.lv(p,'crystal_store'),E.lv(p,'gas_store'));busy=p.bq.find(q=>GE.BUILD[q.id].grp==='store')}
  else if(id==='@defense'){lv=Object.values(p.def).reduce((a,b)=>a+b,0);busy=p.sq.find(q=>q.kind==='def')}
  else{lv=E.lv(p,id);busy=p.bq.find(q=>q.id===id)}name=SHORTN[id]||GE.BUILD[id].n;
  const ghost=!lv&&!busy;el.classList.toggle('ghost',ghost);el.classList.toggle('busy',!!busy);
  const pl_=$(`#blds .plate[data-pl="${id}"]`);pl_.classList.toggle('ghost',ghost);const b=pl_.querySelector('b'),sp=pl_.querySelector('span');
  const bt=ghost?'+':id==='@defense'?fmt(lv):String(lv);if(b.textContent!==bt)b.textContent=bt;if(sp.textContent!==name)sp.textContent=name;
  const pr=pl_.querySelector('.prog i');const act=busy&&busy===p.bq[0]&&busy.end;pl_.classList.toggle('run',!!act);
  if(act){pr.dataset.pstart=busy.start;pr.dataset.pend=busy.end}else{delete pr.dataset.pstart;delete pr.dataset.pend}}
 if(typeof _np!=='undefined'||!placePlates._ok){placePlates._ok=1;placePlates()}renderRail();renderQueues();renderAries();updTimers();}
function renderRail(){const it=[['buildings','Gebäude',IC.bld],['research','Forschung',IC.res],['yard','Werft',IC.yard],['defense','Abwehr',IC.def],['store','Store',IC.store],['cmd','Offiziere',IC.cmd],['galacto','Galact.',IC.gem],['inv','Inventar',IC.inv]];
 setHTML($('#rail'),it.map(i=>`<button data-act="open" data-p="${i[0]}">${i[2]}${i[1]}${i[0]==='store'&&E.giftReady()?'<span class="dot ok" style="top:-2px;right:6px">1</span>':''}</button>`).join(''))}
const qimg=id=>GE.BUILD[id]&&GE.BUILD[id].img?`<img src="assets/b/${GE.BUILD[id].img}.webp">`:A.img(id);
function renderQueues(){const p=pl();let h='';
 const q=p.bq[0];h+=q?`<div class="qcard glass" data-act="bld" data-id="${q.id}">${qimg(q.id)}<div style="flex:1;min-width:0"><div class="qt">${GE.BUILD[q.id].n} ${q.demo?'↓':''}${q.lv}</div><div class="qs"><span data-end="${q.end}"></span>${p.bq.length>1?`<span>+${p.bq.length-1}</span>`:''}</div><div class="bar"><i data-pstart="${q.start}" data-pend="${q.end}"></i></div></div></div>`
 :`<div class="qcard glass idle" data-act="open" data-p="buildings"><img src="assets/b/Roboter_Labor.webp"><div><div class="qt">Kein Bau</div><div class="qs"><span>Gebäude antippen</span></div></div></div>`;
 const r=S.rq;h+=r?`<div class="qcard glass" data-act="open" data-p="research">${A.img(r.id)}<div style="flex:1;min-width:0"><div class="qt">${GE.TECH[r.id].n} ${r.lv}</div><div class="qs"><span data-end="${r.end}"></span></div><div class="bar"><i data-pstart="${r.start}" data-pend="${r.end}"></i></div></div></div>`
 :E.maxB('lab')?`<div class="qcard glass idle" data-act="open" data-p="research">${A.img('energy')}<div><div class="qt">Keine Forschung</div><div class="qs"><span>Labor frei</span></div></div></div>`:'';
 const y=p.sq[0];if(y){const d=E.unitDef(y.kind,y.id);const end=E.sqEnd(p.sq[p.sq.length-1]);h+=`<div class="qcard glass" data-act="open" data-p="${y.kind==='def'?'defense':'yard'}">${A.img(y.id)}<div style="flex:1;min-width:0"><div class="qt">${fmt(y.n-y.done)}× ${d.n}</div><div class="qs"><span data-end="${end}"></span></div><div class="bar"><i data-pstart="${y.start}" data-pend="${E.sqEnd(y)}"></i></div></div></div>`}
 for(const f of S.fleets.filter(f=>f.npc&&E.raidVisible(f)))h+=`<div class="qcard glass warn" data-act="tab" data-v="fleet">${IC.attack}<div style="flex:1;min-width:0"><div class="qt" style="color:var(--bad)">Angriff!</div><div class="qs"><span data-end="${f.arrive}"></span></div></div></div>`;
 const own=S.fleets.filter(f=>!f.npc).length;if(own)h+=`<div class="qcard glass" data-act="tab" data-v="fleet">${A.img('sc')}<div><div class="qt">${own} Flotte${own>1?'n':''}</div><div class="qs"><span>unterwegs</span></div></div></div>`;
 setHTML($('#queues'),h)}
function renderAries(){if(S.task>=GE.TASKS.length){setHTML($('#aries'),'');return}const T=GE.TASKS[S.task],done=E.taskDone();
 setHTML($('#aries'),`<div class="ariescard glass ${done?'done':''}" data-act="${done?'claim':'open'}" data-p="tasks">${A.img('aries','av')}<div style="min-width:0"><div class="at">Aries ${S.task+1}/29</div><div class="ad">${esc(T.t)}</div><div class="as" style="color:${done?'var(--ok)':'var(--mut)'}">${done?'Abholen!':'Tippen für Details'}</div></div></div>`)}
function openPanel(kind,arg,push){if(!push)panelStack=[];panelStack.push([kind,arg]);$('#panel').classList.remove('hidden');renderPanel()}
function closePanel(){panelStack=[];$('#panel').classList.add('hidden');renderAll()}
function backPanel(){panelStack.pop();if(!panelStack.length)return closePanel();renderPanel()}
function renderPanel(keep){if(!panelStack.length)return;const [k,a]=panelStack[panelStack.length-1];const b=$('#panel .pbody');const st=keep?b.scrollTop:0;
 const vals={};if(keep)$$('#panel input,#panel textarea').forEach(i=>{if(i.dataset.k)vals[i.dataset.k]=i.value});
 const r=PANELS[k](a);setHTML($('#panel .ptitle'),r[0]);const ch=setHTML(b,r[1]);if(!ch&&keep)return;$('#panel .phead').classList.toggle('hasback',panelStack.length>1);
 if(keep){b.scrollTop=st;$$('#panel input').forEach(i=>{if(i.dataset.k&&vals[i.dataset.k]!=null&&i.type!=='range')i.value=vals[i.dataset.k]})}updTimers()}
const costHTML=(c,p)=>`<div class="costs">${c.map((v,i)=>v?`<span class="cost ${p&&p.r['mkg'[i]]<v?'no':''}">${IC['mkg'[i]]}${fmt(v)}</span>`:'').join('')}</div>`;
const reqHTML=list=>list.length?`<div class="reqs">${list.map(r=>`<span class="req ${r.ok?'':'no'}">${esc(r.n)} ${r.have}/${r.need}</span>`).join('')}</div>`:'';
function bImg(id){const b=GE.BUILD[id];return b.img?`<img src="assets/b/${b.img}.webp">`:A.img(id)}
function speedBtn(kind,end,pid){const c=E.speedCost(end-E.now());return`<button class="btn sm ${c?'dm':'green'}" data-act="speed" data-k="${kind}">${IC.bolt} ${c?`Beschleunigen · ${c} DM`:'Sofort fertig (gratis)'}</button>`}
const PANELS={};
