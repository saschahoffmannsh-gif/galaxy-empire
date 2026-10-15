'use strict';
const E=window.ENGINE,A=window.ART;let KEY=window.NET_KEY||'ge_remake_save_v3';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// v51: Spielernamen überall gleich antippbar (Klick → CHAT.tap: Privatchat / Bot-Profil / eigenes Profil)
window.PN=(n,label,cls)=>n?`<span class="pnm ${cls||''}" data-pn="${esc(n)}">${esc(label==null?n:label)}</span>`:'';
// Namen aus Berichten („Name 👤“, „Name (Du)“, „Name (inaktiv)“) – nur Spieler/Bots werden antippbar, NPC-Planeten/Piraten nicht
window.PNx=raw=>{const s0=String(raw==null?'':raw);const c=s0.replace(/ 👤$/,'').replace(/ \((Du|inaktiv)\)$/,'').trim();const k=window.CHAT&&CHAT.kind?CHAT.kind(c):'none';return k==='none'?esc(s0):`<span class="pnm" data-pn="${esc(k==='me'&&c==='Du'&&window.NET&&NET.on?NET.cfg.name:c)}">${esc(s0)}</span>`};
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
 trophy:SV('<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4" stroke="#ffd27a"/>'),
 gear:SV('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'),task:SV('<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>'),
 attack:SV('<path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/>'),spy:SV('<circle cx="12" cy="12" r="3"/><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/>'),transport:SV('<rect x="2" y="7" width="13" height="10" rx="1"/><path d="M15 10h4l3 3v4h-7"/>'),
 deploy:SV('<path d="M12 3v14M5 10l7 7 7-7M4 21h16"/>'),recycle:SV('<path d="M7 19H4l3-5M17 19h3l-3-5M9 5l3-3 3 3M8 14l4-7 4 7"/>'),colonize:SV('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'),explore:SV('<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/>'),
 pen:SV('<path d="M4 20h4L19 9l-4-4L4 16z"/>'),up:SV('<path d="M12 19V5M5 12l7-7 7 7"/>'),bolt:SV('<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>'),x:SV('<path d="M6 6l12 12M18 6L6 18"/>'),play:SV('<path d="M7 4l13 8-13 8z"/>'),rank:SV('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/>')};
let S,view='base',panelStack=[],dirty=false;
const pl=()=>E.planet();
function save(){if(window.__noSave)return;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
// Test-Ressourcen (v19): einmalig für neue und bestehende Spielstände, plus Knopf in den Einstellungen
function grantTest(){/* v41: Test-Ressourcen entfernt (Fortschrittsbremse) */}
window.GE_REBOOT=function(key){try{save()}catch(e){}KEY=key;load();try{closePanel()}catch(e){}renderAll()};
function load(){let raw=null;try{const imp=sessionStorage.getItem('ge_import');if(imp){sessionStorage.removeItem('ge_import');localStorage.setItem(KEY,imp)}raw=JSON.parse(localStorage.getItem(KEY))}catch(e){}
 if(raw&&raw.v===3){S=E.load(raw);const before=S.t,logN=S.log.length;E.tick();const away=Date.now()-before;
  if(away>60000){setTimeout(()=>toast(`Willkommen zurück! ${ft(away)} offline nachgeholt.`,'ok',5000),600)}}
 else{S=E.newGame({speed:10});window.GE_FRESH=1;if(window.NET&&NET.on)NET.initNew(S)}
if(window.NET&&NET.on)NET.enforce(S);else grantTest(false);
 if(load._on)return;load._on=1;E.on((t,d)=>{if(t==='built')toast(`${GE.BUILD[d.q.id].n} Stufe ${d.q.lv} fertig`,'ok');if(t==='researched')toast(`${GE.TECH[d.id].n} Stufe ${d.lv} erforscht`,'ok');
  if(t==='report'&&d.type!=='transport')toast('Neuer Bericht: '+d.title);if(t==='raidwarn'){toast('⚠ Piratenflotte im Anflug! „Flotte retten“ bringt deine Schiffe in Sicherheit.','err',6000);renderRaid()}dirty=true});}
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
function renderRaid(){let b=document.getElementById('raidbar');const L=(E.raidsIncoming?E.raidsIncoming():[]);const pend={};for(const f of L){const t=S.planets[f.target];if(!t)continue;const n=Object.entries(t.ships).filter(([k,v])=>k!=='ss'&&v>0).reduce((a,[,v])=>a+v,0);if(!pend[f.target]||f.arrive<pend[f.target].a)pend[f.target]={a:f.arrive,n,pl:t,who:f.who}}
 const ks=Object.keys(pend);document.body.classList.toggle('raid',!!ks.length);if(!ks.length){if(b)b.remove();return}if(!b){b=document.createElement('div');b.id='raidbar';b.className='glass';document.body.appendChild(b)}
 const sig=ks.map(k=>k+pend[k].n).join();if(b.dataset.sig===sig)return;b.dataset.sig=sig;
 b.innerHTML=ks.map(k=>{const x=pend[k];return`<div class="rb-row"><span class="rb-ic">⚠</span><div class="rb-t"><b>${esc(x.who||"Piraten")} → ${esc(x.pl.name)}</b> <span data-end="${x.a}"></span></div>${x.n?`<button class="btn sm red" data-act="fsave" data-id="${k}">Flotte retten</button>`:'<span class="mut">keine Schiffe</span>'}</div>`}).join('')}
window.renderRaid=renderRaid;
function renderTop(){const p=pl();try{renderRaid()}catch(e){}
 setHTML($('#plchip'),`<img src="${A.planetSrc(p.type)}" ${p.moon?'style="filter:grayscale(1)"':''}><div style="min-width:0;text-align:left"><div class="pn">${esc(p.name)}</div><div class="pc">[${p.g}:${p.s}:${p.p}]${p.moon?' Mond':''} ${window.PI?`<span class="pcf">${PI.icF}${E.fieldsUsed(p)}/${E.fieldsMax(p)}</span> <span class="pct">${PI.icT(p.temp)}${p.temp}°</span> `:""}▾</div></div>`);
 setHTML($('#res'),['m','k','g'].map(r=>`<div class="rc" data-act="resinfo" title="${GE.RES[r]}">${IC[r]}<div><div class="rv"></div><div class="rr"></div></div><div class="rbar"><i></i></div></div>`).join('')+
 `<div class="rc" data-act="resinfo">${IC.e}<div><div class="rv"></div><div class="rr"></div></div></div><div class="rc" data-act="open" data-p="store">${IC.dm}<div><div class="rv"></div><div class="rr">DM</div></div></div>`);
 updRes();
 const unread=S.reports.filter(r=>!r.read).length;const done=E.taskDone();
 setHTML($('#topbtns'),`<button class="iconbtn" data-act="open" data-p="rank" aria-label="Rangliste">${IC.trophy}</button><button class="iconbtn" data-act="open" data-p="tasks" aria-label="Aufgaben">${IC.task}${done?'<span class="dot ok">!</span>':''}</button><button class="iconbtn" data-act="open" data-p="reports" aria-label="Berichte">${IC.mail}${unread?`<span class="dot">${unread>99?'99+':unread}</span>`:''}</button><button class="iconbtn" data-act="open" data-p="settings" aria-label="Einstellungen">${IC.gear}</button>`);}
// v41: kompakte Zahlen für die Ressourcenleiste (12,3k · 4,5M) – nie breiter als ~6 Zeichen
const fmtS=n=>{n=Math.floor(n||0);const a=Math.abs(n),f=(v,u)=>(v>=100?Math.round(v):v.toFixed(1).replace(/\.0$/,'')).toString().replace('.',',')+u;return a>=1e9?f(n/1e9,'G'):a>=1e6?f(n/1e6,'M'):a>=1e4?f(n/1e3,'k'):n.toLocaleString('de-DE')};window.fmtS=fmtS;
function updRes(){const p=pl(),pi=E.prodInfo(p);const els=$$('#res .rc');if(els.length<5)return;
 ['m','k','g'].forEach((r,i)=>{const el=els[i],cap=E.storeCap(p,r);el.querySelector('.rv').textContent=fmtS(p.r[r]);el.querySelector('.rr').textContent=(pi[r]>=0?'+':'')+fmtS(pi[r])+'/h';el.title=GE.RES[r]+': '+fmt(p.r[r])+' / '+fmt(cap);el.classList.toggle('full',p.r[r]>=cap);el.querySelector('.rbar i').style.width=Math.min(100,p.r[r]/cap*100)+'%'});
 const e=pi.eProd-pi.eUse;els[3].querySelector('.rv').textContent=fmtS(e);els[3].querySelector('.rr').textContent=fmtS(pi.eProd)+' erz.';els[3].classList.toggle('neg',e<0);{let bd=els[3].querySelector('.ebadge');if(e<0&&!p.moon){if(!bd){bd=document.createElement('span');bd.className='ebadge';els[3].appendChild(bd)}const fx='power';bd.dataset.act='pbld';bd.dataset.id=fx;bd.textContent='!';bd.title='Energie negativ – '+GE.BUILD[fx].n+' ausbauen'}else if(bd)bd.remove()}els[4].querySelector('.rv').textContent=fmtS(S.dm)}
const TABS=[['base','Base',IC.base],['system','System',IC.sys],['galaxy','Galaxie',IC.gal],['fleet','Flotte',IC.fleet],['ally','Allianz',IC.ally],['chat','Chat',IC.chat]];
function renderNav(){$('#nav').innerHTML=TABS.map(t=>`<button data-act="tab" data-v="${t[0]}" class="${view===t[0]?'on':''}">${t[2]}${t[1]}</button>`).join('')}
function setView(v){view=v;$$('.view').forEach(e=>e.classList.remove('active'));$('#v-'+v).classList.add('active');$('#pano').classList.toggle('paused',v!=='base');if(v==='base'){layoutPano()}renderNav();renderView()}
document.addEventListener('visibilitychange',()=>$('#pano').classList.toggle('paused',document.hidden||view!=='base'));
function renderView(){({base:renderBase,system:renderSystem,galaxy:renderGalaxy,fleet:renderFleet,ally:renderAlly,chat:renderChat})[view]()}
// Basis: Gelände mit 12 Plattformen (Pad-Zentren per Bildanalyse ermittelt, Quelle 1280×720)
// Basis-Panorama 2360×800 (unten 80px gespiegelt/abgedunkelt als Rand unter dem Menü).
// 17 bebaubare Pads per Bildanalyse: [cx, cy (Mitte Oberseite), Breite, Höhe der Oberseite]. Index 17 = großer Vordergrund-Pad (v14 wieder bebaubar; Kamera zeigt ihn ganz über dem Menü).
const PADS=[[558,349,155,46],[445,501,182,55],[846,405,165,50],[976,467,176,53],[1237,499,181,54],[749,539,188,56],[1002,602,199,60],[1346,635,205,62],[1602,410,166,50],[1755,451,173,52],[2016,418,167,50],[2174,368,159,48],[2157,490,180,54],[2000,565,193,58],[1582,565,193,58]];
const PAD_PREF={metal_mine:6,crystal_mine:7,gas_mine:14,power:4,store:3,robotics:5,lab:2,nanite:1,shipyard:9,'@defense':13,galacto:0,alliance:8,radar:12,terraformer:11,stargate:10,
 moon_base:4,pioneer:2,eux:8,wormhole:10};
const RIMG={'@defense':'defense'};
// v34: Kraftwerk nutzt die Fusions-Grafik, Lager die Speicher-Grafik (Stufenbilder)
const ART={power:'fusion',store:'metal_store'};
const rimg=id=>RIMG[id]||id;
const TIERED=new Set(['metal_mine','crystal_mine','gas_mine','power','store','lab','robotics','nanite','shipyard','defense','galacto','alliance','stargate','radar','terraformer']);
const tierOf=lv=>lv<5?1:lv<10?2:lv<15?3:lv<20?4:5;const ROMAN=['','I','II','III','IV','V'];
const timg=(id,lv)=>{const b=id==='@defense'?'defense':id;return TIERED.has(b)?`${ART[b]||b}_t${Math.min(4,tierOf(Math.max(1,lv)))}`:rimg(id)};
const PANO_W=2400,PANO_Y0=48,PANO_VIS1=760;let baseKey=null,panoS=1,panoCentered=false;
function navH(){const n=$('#nav');return n?n.offsetHeight+10:64}
// Basis-Trefferflächen: mind. 46×36 Bildschirm-Pixel, damit auch kleine, weit hinten liegende Pads sicher antippbar sind
function sizeHits(){const k=1/(panoS||1);$$('#padhits .bh').forEach(e=>{const [cx,cy,w,hh]=PADS[+e.dataset.i];const g=Math.max(hh,w*.16);const W=Math.max(w*1.05,52*k),H=Math.max(g*1.05,40*k);
 Object.assign(e.style,{left:cx-W/2+'px',top:cy-g*.1-H/2+'px',width:W+'px',height:H+'px'})})}
function layoutPano(){const H=($('#pano').clientHeight||innerHeight);const vis=H-navH();panoS=vis/(PANO_VIS1-PANO_Y0);window.panoS=panoS;window.PANO_Y0v=PANO_Y0;
 $('#world').style.transform=`translate(0,${-PANO_Y0*panoS}px) scale(${panoS})`;$('#sizer').style.width=PANO_W*panoS+'px';
 if(!panoCentered&&$('#pano').clientWidth){panoCentered=true;$('#pano').scrollLeft=Math.max(0,1200*panoS-$('#pano').clientWidth/2)}
 sizeHits();if(window.WATER)WATER.resize(panoS);if(window.AMBIENT)AMBIENT.place()}
// Perspektiv-Variante: Gebäude ohne eigenes Pad, Fuß per Spalte auf die Pad-Neigung verschoben (Aufbau bleibt unverzerrt).
const IMP={terraformer:1.38,lab:1.4,shipyard:1.38,robotics:1.38,power:1.4,fusion:1.4,alliance:1.36,stargate:1.42,nanite:1.42,galacto:1.28,radar:1.3,defense:1.22,solar:1.12,metal_mine:1.18,crystal_mine:1.18,gas_mine:1.18,store:1.12,moon_base:1.36,pioneer:1.36,eux:1.26,wormhole:1.4};
// Freiraum je Pad: Oberkante darf die Vorderkante (Basis) überlappender, weiter hinten liegender Pads nicht verdecken.
const PAD_HMAX=PADS.map(([cx,cy,w,h],i)=>{let m=1e9;PADS.forEach(([cx2,cy2,w2,h2],j)=>{if(j===i||cy2>=cy)return;if(Math.abs(cx2-cx)<(w*.8+w2)/2)m=Math.min(m,cy-(cy2+Math.max(h2,w2*.16)*.55))});return m});
// v33: geringere Tiefenstaffelung (hinten nur moderat kleiner), Breite gegen Nachbarn begrenzt (max. ~12 % Überlappung)
const EW=(()=>{const W=PADS.map(([,,w])=>1.22*170*Math.pow(w/170,.55));for(let it=0;it<10;it++)PADS.forEach(([cx,cy],i)=>PADS.forEach(([cx2,cy2],j)=>{if(j<=i||Math.abs(cy-cy2)>=70)return;const dx=Math.abs(cx-cx2),need=(W[i]+W[j])*.8*1.2/2;if(need>dx*1.4){const k=dx*1.4/need;W[i]*=Math.sqrt(k);W[j]*=Math.sqrt(k)}}));return W.map((v,i)=>Math.max(v,PADS[i][2]*1.08))})();
// v34: neue Gebäudegrafik (assets/b4) mit eigenem Achteck-Fundament – Fundament deckt das Pano-Pad exakt ab
const tier5=lv=>lv<5?1:lv<10?2:lv<15?3:lv<20?4:5;
function b4Geo(i,m,ft){const [cx,cy,w,h]=PADS[i];let [W,H,ox,oy,ow]=m;let k=1;if(ft){k=ft[0];ox+=ft[2]*ow;oy+=ft[3]*ow}const s=w*1.02/(ow*k);return{vi:0,src:'',left:cx-ox*s,top:cy-oy*s,width:W*s,height:H*s,ox:ox*s,oy:oy*s,sk:0,cx,cy,w,h:Math.max(h,w*.16)}}
function padGeo(i,name,lv){const [cx,cy,w,h]=PADS[i];const vi=2;
 const v=B3.v[name][vi];const bn=name.replace(/_t\d$/,'');const ew=EW[i];let s=ew/288*(IMP[bn]||IMP[rimg(bn)]||1)*(1+Math.min(lv||0,20)*.008);const hm=PAD_HMAX[i]*1.35;if(v[3]*s>hm)s=Math.max(ew/288*.9,hm/v[3]);const sk=0;
 return{vi,src:`assets/b3/${name}_${vi}.webp`,left:cx-v[2]*s,top:cy-v[3]*s,width:v[0]*s,height:v[1]*s,ox:v[2]*s,oy:v[3]*s,sk,cx,cy,w,h:Math.max(h,w*.16)}}

// v22: Leben je Ausbaustufe (bewegliche Teile, Leuchtschicht, Masken-Effekte, Signallichter, Dampf, Kran, Drohnen)
function tfxHTML(T,src,tier){const W=T.W,H=T.H,pre=src.replace('.webp','');const X=v=>(v/W*100).toFixed(2)+'%',Y=v=>(v/H*100).toFixed(2)+'%';let h='';
 const kids=id=>T.p.filter(q=>q.par===id);
 const part=(p,ox,oy,pw,ph)=>{const pos=`left:${((p.x-ox)/pw*100).toFixed(2)}%;top:${((p.y-oy)/ph*100).toFixed(2)}%;width:${(p.w/pw*100).toFixed(2)}%;height:${(p.h/ph*100).toFixed(2)}%`;const u=`${pre}_${p.id}.webp`;
  if(p.anim==='wave'){const N=8;return`<span class="pw tw" style="${pos}">${Array.from({length:N},(_,k)=>`<i style="top:${k/N*100}%;height:calc(${100/N}% + 1px);background-image:url(${u});background-position:0 ${k/(N-1)*100}%;--x:${(p.amp*(k+1)/N/p.w*100).toFixed(2)}%;animation-duration:${p.dur}s;animation-delay:-${(k*.13).toFixed(2)}s"></i>`).join('')}</span>`}
  const o=`transform-origin:${((p.px-p.x)/p.w*100).toFixed(1)}% ${((p.py-p.y)/p.h*100).toFixed(1)}%`;
  return`<span class="tp tp-${p.anim}" style="${pos};${o};--a:${p.amp}deg;animation-duration:${p.dur}s"><img src="${u}" alt="">${kids(p.id).map(c=>part(c,p.x,p.y,p.w,p.h)).join('')}</span>`};
 h+=T.p.filter(p=>!p.par).map(p=>part(p,0,0,W,H)).join('');
 h+='<span class="tsw"></span>';
 if(T.e)h+=`<span class="te te-${T.e}" style="background-image:url(${pre}_e.webp)"></span>`;
 if(T.m){const c=T.mc&&T.mc[0];h+=`<span class="tm tm-${T.m}" style="-webkit-mask-image:url(${pre}_m.webp);mask-image:url(${pre}_m.webp)"><i style="${c?`left:${X(c[0])};top:${Y(c[1])}`:''}"></i></span>`}
 (T.bc||[]).forEach(([x,y],k)=>h+=`<span class="tb ${k%2?'w':''}" style="left:${X(x)};top:${Y(y)};animation-delay:-${(k*.7).toFixed(1)}s"></span>`);
 (T.st||[]).forEach(([x,y],k)=>{for(let j=0;j<3;j++)h+=`<span class="ts" style="left:${X(x)};top:${Y(y)};animation-delay:-${(j*1.3+k*.6).toFixed(1)}s"></span>`});
 if(T.tr){const [[x1,y1],[x2,y2]]=T.tr;h+=`<span class="tt" style="--x1:${X(x1)};--y1:${Y(y1)};--x2:${X(x2)};--y2:${Y(y2)}"><i></i></span><span class="tk" style="left:${X(x1+(x2-x1)*.6)};top:${Y(y1+(y2-y1)*.6+H*.18)}"></span>`}
 if(tier>=2&&T.top){const [x,y]=T.top[0];const n=tier>=4?3:tier>=3?2:1;for(let k=0;k<n;k++)h+=`<span class="td" style="left:${X(x)};top:${Y(Math.max(4,y-H*.08))};--r:${(2.4+k*1.1).toFixed(1)};animation-duration:${(9+k*3.5).toFixed(1)}s;animation-delay:-${(k*2.7).toFixed(1)}s"><i></i></span>`}
 if(pre.includes('terraformer_')&&window.TERRA_FX)h+=TERRA_FX(T,tier);
 return h}
// Bewegliche Teile (assets/b3/{name}_{v}_{id}.webp), Pivot in Sprite-Pixeln
function partsHTML(PT,src){const W=PT.W,H=PT.H;return PT.p.map(p=>{const pos=`left:${p.x/W*100}%;top:${p.y/H*100}%;width:${p.w/W*100}%;height:${p.h/H*100}%`;const u=src.replace('.webp',`_${p.id}.webp`);
 if(p.anim==='wave'){const N=8;return`<span class="pw" style="${pos}">${Array.from({length:N},(_,k)=>`<i style="top:${k/N*100}%;height:calc(${100/N}% + 1px);background-image:url(${u});background-position:0 ${k/(N-1)*100}%;--x:${(p.amp*(k+1)/N/p.w*100).toFixed(2)}%;animation-duration:${p.dur}s;animation-delay:-${(k*.13).toFixed(2)}s"></i>`).join('')}</span>`}
 const o=`transform-origin:${((p.px-p.x)/p.w*100).toFixed(1)}% ${((p.py-p.y)/p.h*100).toFixed(1)}%`;
 return`<img class="pt pt-${p.anim}" src="${u}" alt="" style="${pos};${o};--a:${p.amp}deg;--d:${(p.amp/p.h*100).toFixed(1)}%;animation-duration:${p.dur}s">`}).join('')}
function busyOf(p,id){return id[0]==='@'?null:p.bq.find(q=>q.id===id)}
function lvOf(p,id){return id==='@defense'?((p.def.sdome||0)+(p.def.ldome||0)>0?1:0):E.lv(p,id)}
function placed(p,id){return lvOf(p,id)>0||!!busyOf(p,id)}
function ensurePads(p){if(!p.pads)p.pads={};const P=p.pads;let ch=false;
 for(const k in P)if(+k>=PADS.length||!placed(p,P[k])){delete P[k];ch=true}
 if(p.padsV!==15){p.padsV=15;for(const k in P)delete P[k];ch=true}
 const list=(p.moon?GE.MOON_B:GE.PLANET_B).concat(p.moon?[]:['@defense']);const used=new Set(Object.values(P));
 for(const id of list){if(!placed(p,id)||used.has(id))continue;let i=PAD_PREF[id];if(i==null||P[i]!=null){i=PADS.findIndex((_,j)=>P[j]==null)}if(i<0)continue;P[i]=id;used.add(id);ch=true}
 return ch}
// Gerüst: Stangen an den Hex-Ecken, Querriegel, Diagonalen, kleiner Kran – als SVG in Welt-Koordinaten
function scaffoldSVG(i){const [cx,cy,w,hh]=PADS[i];const h=Math.max(hh,w*.16);const H=w*.62;const pts=[[-.5,0],[-.25,-.5],[.25,-.5],[.5,0],[.25,.5],[-.25,.5]].map(([x,y])=>[cx+x*w*.9,cy+y*h*.9]);
 const X0=cx-w*.6,Y0=cy-H-w*.3,VW=w*1.2,VH=H+w*.3+h;const L=(a,b,c,d,k)=>`<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" class="${k}"/>`;let s='';
 const lev=[0,.34,.68,1];const back=[1,2],front=[0,5,4,3];
 for(const [x,y] of pts)s+=L(x,y,x,y-H,'pole');
 for(const f of lev){const yy=f*H;for(let k=0;k<6;k++){const a=pts[k],b=pts[(k+1)%6];s+=L(a[0],a[1]-yy,b[0],b[1]-yy,back.includes(k)||back.includes((k+1)%6)?'beam bk':'beam')}}
 for(let k of [5,4,0]){const a=pts[k],b=pts[(k+1)%6];for(let q=0;q<3;q++){const y1=lev[q]*H,y2=lev[q+1]*H;s+=L(a[0],a[1]-y1,b[0],b[1]-y2,'brace')}}
 const m=pts[1];const top=m[1]-H*1.25;s+=L(m[0],m[1],m[0],top,'mast');s+=`<g class="jib" style="transform-origin:${m[0]}px ${top}px">${L(m[0]-w*.12,top,m[0]+w*.55,top,'jibl')}${L(m[0]+w*.42,top,m[0]+w*.42,top+H*.45,'cable')}<rect x="${m[0]+w*.42-3}" y="${top+H*.45}" width="6" height="5" class="hook"/></g>`;
 return`<svg class="scaf" viewBox="${X0} ${Y0-H*.3} ${VW} ${VH+H*.3}" style="left:${X0}px;top:${Y0-H*.3}px;width:${VW}px;height:${VH+H*.3}px">${s}</svg>`}
// v34: Kristall-/Pflanzenbüschel aus dem Pano vor der Vorderkante des Fundaments (überlappen das Gebäude)
const CLS=[0,1,2,3,4,5,6,8,9];
function clumpsHTML(cx,cy,w,i){if(!window.B4CL)return'';let h='';const xs=[[-.42,.27],[-.02,.33],[.38,.26]];
 xs.forEach(([fx,fy],j)=>{const c=CLS[(i*3+j*4)%CLS.length];const [cw,ch]=B4CL[c];const H=w*(.30+((i+j)%3)*.04),W=H*cw/ch;const fl=(i+j)%2?'transform:scaleX(-1);':'';
  h+=`<img class="fgov clump" alt="" draggable="false" src="assets/b4/clump_${c}.webp?v=1" style="${fl}left:${cx+fx*w-W/2}px;top:${cy+fy*w-H}px;width:${W}px;height:${H}px">`});return h}
function buildBase(p){let h='';PADS.forEach(([cx,cy,w,hh],i)=>{const g={cx,cy,w,h:Math.max(hh,w*.16)};
  h+=`<div class="pad" data-act="pad" data-i="${i}" style="z-index:${Math.round(cy)};--hz:${Math.max(0,Math.min(1,(520-cy)/180)).toFixed(2)}"><div class="shadow"></div><img class="pb" alt="" draggable="false"><div class="fx"></div>${window.B4FG&&B4FG[i]?`<img class="fgov" alt="" draggable="false" src="assets/b4/fg_${i}.webp?v=1" style="left:${B4FG[i][0]}px;top:${B4FG[i][1]}px;width:${B4FG[i][2]}px;height:${B4FG[i][3]}px">`:''}${clumpsHTML(cx,cy,w,i)}<div class="scafw"></div><svg class="ring" viewBox="0 0 100 100" preserveAspectRatio="none"><ellipse cx="50" cy="50" rx="47" ry="44" class="rbg"/><ellipse cx="50" cy="50" rx="47" ry="44" class="rfg" pathLength="100"/></svg><span class="ptime" style="left:${cx}px;top:${cy+g.h*.62}px"></span><div class="hit" style="--l1:${cx-w*.37}px;--w1:${w*.74}px;--l0:${cx-w*.55}px;--w0:${w*1.1}px;--t1:${cy-w*.45}px;--h1:${w*.45+g.h*.9}px;--t0:${cy-g.h*.15}px;--h0:${g.h*1.45}px"></div></div>`});
 h+=`<div id="padhits">${PADS.map((p,i)=>[p,i]).sort((a,b)=>a[0][1]-b[0][1]).map(([[cx,cy,w,hh],i])=>`<div class="bh" data-act="pad" data-i="${i}"></div>`).join('')}</div>`;
 $('#blds').innerHTML=h;}
function renderBase(){const p=pl();const key=p.id+(p.moon?'m':'');if(ensurePads(p))save();
 if(baseKey!==key){baseKey=key;$('#world').classList.toggle('moon',!!p.moon);buildBase(p);layoutPano()}
 const pads=$$('#blds .pad');PADS.forEach((pd,i)=>{const el=pads[i];const id=p.pads[i];const lv=id?lvOf(p,id):0;const busy=id?busyOf(p,id):null;
  const state=!id?'empty':busy&&!lv?'new':busy?'up':'done';const k=(id||'')+state+Math.min(lv,20);el.classList.toggle('t5',!!id&&lv>=20);el.classList.toggle('t4',!!id&&lv>=15&&lv<20);const pb=el.querySelector('.pb');
  if(el.dataset.k!==k){el.dataset.k=k;el.dataset.id=id||'';el.className='pad '+state;const sh=el.querySelector('.shadow');
   if(!id){pb.removeAttribute('src');const fx=el.querySelector('.fx');fx.innerHTML='';fx.dataset.n=''}
   else{const b4k=id==='@defense'?'defense':id;const B4m=window.B4&&!p.moon&&B4[b4k];const tn=B4m?(state==='new'?'build':'t'+tier5(lv)):null;let tk,g,TF=null,PT=null,src;
    if(B4m){tk='b4_'+b4k+'_'+tn;g=b4Geo(i,B4m[tn],window.B4FIT&&B4FIT[b4k]&&B4FIT[b4k][tn]);src=`assets/b4/${b4k}_${tn}.webp?v=5`;g.src=src}
    else{tk=timg(id,lv);g=padGeo(i,tk,lv);TF=window.TFX&&TFX[tk]&&state!=='new'?TFX[tk][g.vi]:null;PT=!TF&&window.B3P&&B3P[tk]&&state!=='new'?B3P[tk][g.vi]:null;src=(PT||(TF&&TF.p.length))?g.src.replace('.webp','b.webp'):g.src}if(pb.getAttribute('src')!==src)pb.src=src;const bs={left:g.left+'px',top:g.top+'px',width:g.width+'px',height:g.height+'px',transformOrigin:`${g.ox}px ${g.oy}px`,transform:'none'};Object.assign(pb.style,bs);
    const fx=el.querySelector('.fx');Object.assign(fx.style,bs);fx.style.setProperty('--m',`url(${g.src})`);fx.style.fontSize=(g.width/25).toFixed(2)+'px';const fh=B4m?'<span class="b4glow"></span><span class="b4haze"></span>':state==='new'?'':TF?tfxHTML(TF,g.src,tierOf(Math.max(1,lv))):(PT?partsHTML(PT,g.src):'')+(window.BFX?BFX.html(rimg(id),g.oy/g.height):'');if(fx.dataset.n!==tk+state+g.vi){fx.dataset.n=tk+state+g.vi;fx.innerHTML=fh}
    const ht=el.querySelector('.hit');ht.style.setProperty('--t1',g.top+g.height*.08+'px');ht.style.setProperty('--h1',(g.cy+g.h*.55)-(g.top+g.height*.08)+'px');ht.style.setProperty('--l1',g.left+g.width*.12+'px');ht.style.setProperty('--w1',g.width*.76+'px');
    Object.assign(sh.style,{left:g.cx-g.w*.5+g.w*.08+'px',top:g.cy-g.h*.45+'px',width:g.w*1.08+'px',height:g.h*1.5+'px'})}
   el.querySelector('.scafw').innerHTML=(state==='new'||state==='up')&&!(window.B4&&!p.moon&&B4[id==='@defense'?'defense':id])?scaffoldSVG(i):'';el.classList.toggle('b4',!!(id&&window.B4&&!p.moon&&B4[id==='@defense'?'defense':id]));
   const r=el.querySelector('.ring');const [cx,cy,w,hh]=PADS[i];const h2=Math.max(hh,w*.16);Object.assign(r.style,{left:cx-w*.56+'px',top:cy-h2*.62+'px',width:w*1.12+'px',height:h2*1.24+'px'})}
  const tm=el.querySelector('.ptime');if(busy&&busy.end){if(tm.dataset.end!=String(busy.end))tm.dataset.end=busy.end}else if(tm.dataset.end)tm.removeAttribute('data-end');
  const fg=el.querySelector('.rfg');let pr=0;if(busy&&busy===p.bq[0]&&busy.end)pr=Math.max(0,Math.min(1,(E.now()-busy.start)/(busy.end-busy.start)));
  fg.style.strokeDashoffset=(100-pr*100).toFixed(1);
  if(state==='new'){const c=`inset(${((1-pr)*100*.85+5).toFixed(1)}% 0 0 0)`;if(pb.style.clipPath!==c)pb.style.clipPath=c}else if(pb.style.clipPath)pb.style.clipPath=''});
 renderRail();renderQueues();(window.renderAries||renderAries)();updTimers();}
const galNew=()=>!S.flags.galinfo&&(Object.values(S.gal.shards).some(n=>n>0)||E.maxB('galacto')>0||S.task>=25);
function renderRail(){if(galNew()&&!S.flags.galhint){S.flags.galhint=1;setTimeout(()=>toast('Neu: Galactonit! Tippe links auf „Galact.“ – dort wird alles erklärt.'),600)}const it=[['buildings','Gebäude',IC.bld],['research','Forschung',IC.res],['yard','Werft',IC.yard],['defense','Abwehr',IC.def],['store','Store',IC.store],['cmd','Offiziere',IC.cmd],['galacto','Galact.',IC.gem],['inv','Inventar',IC.inv]];
 setHTML($('#rail'),it.map(i=>`<button data-act="open" data-p="${i[0]}">${i[2]}${i[1]}${i[0]==='store'&&E.giftReady()?'<span class="dot ok" style="top:-2px;right:6px">1</span>':''}${i[0]==='galacto'&&galNew()?'<span class="dot" style="top:-2px;right:6px;background:var(--v)">!</span>':''}</button>`).join(''))}
const qimg=id=>GE.BUILD[id]&&GE.BUILD[id].img?`<img src="assets/b/${GE.BUILD[id].img}.webp">`:A.img(id);
function renderQueues(){const p=pl();let h='';
 const q=p.bq[0];h+=q?`<div class="qcard glass" data-act="bld" data-id="${q.id}">${qimg(q.id)}<div style="flex:1;min-width:0"><div class="qt">${GE.BUILD[q.id].n} ${q.demo?'↓':''}${q.lv}</div><div class="qs"><span data-end="${q.end}"></span>${p.bq.length>1?`<span>+${p.bq.length-1} vorgemerkt</span>`:''}</div><div class="bar"><i data-pstart="${q.start}" data-pend="${q.end}"></i></div></div><button class="qsp ${E.speedCost(q.end-E.now())?'':'free'}" data-act="speed" data-k="sub">${IC.bolt}${E.speedCost(q.end-E.now())||'Gratis'}</button></div>`
 :`<div class="qcard glass idle" data-act="open" data-p="buildings"><img src="assets/b/Roboter_Labor.webp"><div><div class="qt">Kein Bau</div><div class="qs"><span>Gebäude antippen</span></div></div></div>`;
 const r=S.rq;h+=r?`<div class="qcard glass" data-act="open" data-p="research">${A.img(r.id)}<div style="flex:1;min-width:0"><div class="qt">${GE.TECH[r.id].n} ${r.lv}</div><div class="qs"><span data-end="${r.end}"></span></div><div class="bar"><i data-pstart="${r.start}" data-pend="${r.end}"></i></div></div><button class="qsp ${E.speedCost(r.end-E.now())?'':'free'}" data-act="speed" data-k="res">${IC.bolt}${E.speedCost(r.end-E.now())||'Gratis'}</button></div>`
 :E.maxB('lab')?`<div class="qcard glass idle" data-act="open" data-p="research">${A.img('energy')}<div><div class="qt">Keine Forschung</div><div class="qs"><span>Labor frei</span></div></div></div>`:'';
 const y=p.sq[0];if(y){const d=E.unitDef(y.kind,y.id);const end=E.sqEnd(p.sq[p.sq.length-1]);h+=`<div class="qcard glass" data-act="open" data-p="${y.kind==='def'?'defense':'yard'}">${A.img(y.id)}<div style="flex:1;min-width:0"><div class="qt">${fmt(y.n-y.done)}× ${d.n}</div><div class="qs"><span data-end="${end}"></span></div><div class="bar"><i data-pstart="${y.start}" data-pend="${E.sqEnd(y)}"></i></div></div><button class="qsp ${E.speedCost(end-E.now())?'':'free'}" data-act="speed" data-k="yard">${IC.bolt}${E.speedCost(end-E.now())||'Gratis'}</button></div>`}
 for(const f of S.fleets.filter(f=>f.npc&&E.raidVisible(f)))h+=`<div class="qcard glass warn" data-act="tab" data-v="fleet">${IC.attack}<div style="flex:1;min-width:0"><div class="qt" style="color:var(--bad)">Angriff!</div><div class="qs"><span data-end="${f.arrive}"></span></div></div></div>`;
 const own=S.fleets.filter(f=>!f.npc).length;if(own)h+=`<div class="qcard glass" data-act="tab" data-v="fleet">${A.img('sc')}<div><div class="qt">${own} Flotte${own>1?'n':''}</div><div class="qs"><span>unterwegs</span></div></div></div>`;
 setHTML($('#queues'),h)}
function renderAries(){if(window.renderAries&&window.renderAries!==renderAries)return window.renderAries();if(!window.CAMP_PROG)return;if(S.task>=GE.TASKS.length){setHTML($('#aries'),'');return}const T=GE.TASKS[S.task],done=E.taskDone();
 setHTML($('#aries'),`<div class="ariescard glass ${done?'done':''}" data-act="${done?'claim':'open'}" data-p="tasks">${A.img('aries','av')}<div style="min-width:0"><div class="at">Aries ${S.task+1}/29</div><div class="ad">${esc(T.t)}</div><div class="as" style="color:${done?'var(--ok)':'var(--mut)'}">${done?'Abholen!':'Tippen für Details'}</div></div></div>`)}
function openPanel(kind,arg,push){if(!push)panelStack=[];panelStack.push([kind,arg]);$('#panel').classList.remove('hidden');renderPanel()}
function closePanel(){panelStack=[];$('#panel').classList.add('hidden');renderAll()}
function backPanel(){panelStack.pop();if(!panelStack.length)return closePanel();renderPanel()}
function renderPanel(keep){if(!panelStack.length)return;const [k,a]=panelStack[panelStack.length-1];const b=$('#panel .pbody');const st=keep?b.scrollTop:0;
 const vals={};if(keep)$$('#panel input,#panel textarea').forEach(i=>{if(i.dataset.k)vals[i.dataset.k]=i.value});
 const r=PANELS[k](a);setHTML($('#panel .ptitle'),r[0]);const ch=setHTML(b,r[1]);if(!ch&&keep)return;$('#panel .phead').classList.toggle('hasback',panelStack.length>1);
 if(keep){b.scrollTop=st;$$('#panel input').forEach(i=>{if(i.dataset.k&&vals[i.dataset.k]!=null&&i.type!=='range')i.value=vals[i.dataset.k]})}updTimers()}
const costHTML=(c,p)=>`<div class="costs">${c.map((v,i)=>v?`<span class="cost ${p&&p.r['mkg'[i]]<v?'no':''}">${IC['mkg'[i]]}${fmt(v)}</span>`:'').join('')}</div>`;
const reqHTML=(list,lbl)=>list.length?`<div class="reqs">${lbl?`<span class="mut" style="font-size:11px">${lbl}</span>`:''}${list.map(r=>`<span class="req ${r.ok?'ok':'no'}">${r.ok?'✓':'✗'} ${esc(r.n)} ${r.have}/${r.need}</span>`).join('')}</div>`:'';
function bImg(id){const b=GE.BUILD[id];return b.img?`<img src="assets/b/${b.img}.webp">`:A.img(id)}
function speedBtn(kind,end,pid){const c=E.speedCost(end-E.now());return c===0?`<button class="btn sm green freefin" data-act="speed" data-k="${kind}">${IC.bolt} Gratis fertigstellen</button>`:`<button class="btn sm dm" data-act="speed" data-k="${kind}">${IC.bolt} Beschleunigen · ${c} DM</button>`}
const PANELS={};
