// v22 Story-Kampagne mit Aries (Kapitel, Haupt-/Nebenmissionen, Freischaltungen, Hologramm-Guide mit Spotlight)
(function(){
const CH=[
 {t:'Ankunft',ic:'🪐',intro:'Willkommen auf deiner neuen Heimatwelt, Kommandant. Alles beginnt mit Rohstoffen: Metall, Kristall, Gas – und der Energie, um sie zu fördern.',outro:'Die ersten Minen laufen, die Energie fließt. Deine Kolonie lebt!',main:[0,1,2,3,4,5,'c1a','c1b'],
  side:[{id:'s1a',t:'Fleißige Bergleute',d:'Metallmine auf Stufe 4.',c:()=>E.maxB('metal_mine')>=4,r:{m:1500,k:600}},{id:'s1b',t:'Volle Kraft',d:'Kraftwerk auf Stufe 4.',c:()=>E.maxB('power')>=4,r:{m:1200,k:800,dm:2}}],bonus:{dm:5}},
 {t:'Wachstum',ic:'🏗️',intro:'Eine Kolonie, die wächst, braucht Lager, Automatisierung und Wissen. Zeit, dein Fundament auszubauen.',outro:'Lager, Roboter und dein erstes Labor – das Fundament eines Imperiums steht.',main:[6,10,13,9,8,11,'c2a','c2b'],
  side:[{id:'s2a',t:'Kristallklar',d:'Kristallmine auf Stufe 5.',c:()=>E.maxB('crystal_mine')>=5,r:{m:3000,k:3000}},{id:'s2b',t:'Forscherdrang',d:'Spionagetechnik Stufe 2.',c:()=>E.tl('espionage')>=2,r:{k:4000,g:2000}}],bonus:{dm:8}},
 {t:'Flotte',ic:'🚀',intro:'Der Weltraum ist weit – und nicht jeder dort ist freundlich. Bauen wir eine Werft und die ersten Schiffe.',outro:'Deine ersten Schiffe stehen bereit. Jetzt können wir hinausfliegen.',main:[7,14,'c3a','c3b'],
  side:[{id:'s3a',t:'Staffel',d:'Baue insgesamt 10 Leichte Jäger.',c:()=>(S.built.lf||0)>=10,r:{m:6000,k:3000,g:1000}},{id:'s3b',t:'Bollwerk',d:'Besitze 25 Raketenwerfer.',c:()=>(S.planets[S.home].def.rl||0)>=25,r:{m:5000,k:2000}}],bonus:{dm:8}},
 {t:'Erster Kontakt',ic:'🛰️',intro:'Unsere Sensoren melden fremde Planeten im System. Erst spionieren, dann zuschlagen – und die Trümmer verwerten.',outro:'Die Nachbarn kennen jetzt deinen Namen. Gut gemacht, Kommandant.',main:[15,16,23,25,'c4a'],
  side:[{id:'s4a',t:'Plünderer',d:'Gewinne 3 Angriffe gegen NPC-Planeten.',c:()=>(S.flags.npcWins||0)>=3,r:{m:15000,k:10000,g:5000}},{id:'s4b',t:'Augen überall',d:'Baue insgesamt 5 Spionagesonden.',c:()=>(S.built.pr||0)>=5,r:{k:5000,g:5000}}],bonus:{dm:10}},
 {t:'Nebel',ic:'🌌',intro:'Am Rand des Systems wabert ein mysteriöser Nebel. Dort finden Mutige Schätze – und Galactonit.',outro:'Galactonit glüht in deinen Sockeln. Der Nebel hat dir seine Geheimnisse gezeigt.',main:[17,26,27,28,'c5a'],
  side:[{id:'s5a',t:'Nebelläufer',d:'Schicke 3 Expeditionen in den Nebel.',c:()=>(S.flags.nebN||0)>=3,r:{m:20000,k:20000,g:10000}}],bonus:{dm:10,gal:6}},
 {t:'Kolonie',ic:'🌍',intro:'Ein Planet allein ist zu klein für deine Pläne. Mit Astrophysik erreichst du neue Welten.',outro:'Deine zweite Welt ist bewohnt – dein Reich erstreckt sich über die Sterne.',main:[20,21,22,24],
  side:[{id:'s6a',t:'Kolonialreich',d:'Besitze 2 Kolonien.',c:()=>E.colonies()>=2,r:{m:40000,k:40000,g:20000}}],bonus:{dm:15}},
 {t:'Allianz',ic:'🤝',intro:'Gemeinsam ist man stärker. Gründe eine Allianz und miss dich mit den Besten der Galaxie.',outro:'Deine Allianz steht, dein Name steht in den Ranglisten.',main:[12,'rank',18,19,'c7a'],
  side:[{id:'s7a',t:'Aufsteiger',d:'Erreiche 5.000 Punkte.',c:()=>(S.pts?Object.values(S.pts).reduce((a,b)=>a+(+b||0),0):0)>=5000,r:{dm:10}}],bonus:{dm:20}},
 {t:'Nanotechnik',ic:'🧬',intro:'Deine Fabriken stoßen an Grenzen. Mit Naniten baust du schneller als je zuvor – und Monde öffnen neue Wege.',outro:'Naniten schwärmen durch deine Werkhallen. Bauzeiten halbieren sich!',main:['c8a','c8b','c8c'],
  side:[{id:'s8a',t:'Saveflug',d:'Bringe deine Flotte vor einem Piratenangriff in Sicherheit.',c:()=>!!S.flags.fleetSaved,r:{m:30000,k:20000,g:10000,dm:5}},{id:'s8b',t:'Mondlicht',d:'Besitze einen Mond.',c:()=>S.order.some(id=>S.planets[id].moon),r:{m:50000,k:50000,g:20000}}],bonus:{dm:25,gal:6}},
 {t:'Flottenmacht',ic:'🚀',intro:'Ein Imperium braucht Raum und eine Flotte, die ihn verteidigt. Forme deine Welt um und baue Schlachtschiffe.',outro:'Deine Schlachtschiffe beherrschen den Raum. Du bist eine echte Großmacht – ab jetzt warten Wochenziele auf dich.',main:['c9a','c9b','c9c'],
  side:[{id:'s9a',t:'Großreich',d:'Besitze 4 Kolonien.',c:()=>E.colonies()>=4,r:{m:150000,k:100000,g:50000}}],bonus:{dm:30,gal:9}}
];
const mB=o=>Object.entries(o).every(([k,v])=>E.maxB(k)>=v);const eBal=()=>{const pi=E.prodInfo(S.planets[S.home]);return pi.eProd>=pi.eUse};
const EXTRA={rank:{t:'Ruhmeshalle',d:'Öffne die Rangliste (Pokal oben rechts).',c:()=>!!S.flags.rankSeen,r:{m:5000,k:5000,dm:3}},
 c1a:{t:'Solide Basis',d:'Metallmine Stufe 4, Kristallmine Stufe 3 und Kraftwerk Stufe 4.',c:()=>mB({metal_mine:4,crystal_mine:3,power:4}),r:{m:1500,k:800,g:300}},
 c1b:{t:'Im Gleichgewicht',d:'Gasförderung Stufe 2, Kraftwerk Stufe 5 – und keine negative Energie.',c:()=>mB({gas_mine:2,power:5})&&eBal(),r:{m:2000,k:1200,g:600,dm:5}},
 c2a:{t:'Industrie',d:'Metallmine 7, Kristallmine 6 und Gasförderung 4.',c:()=>mB({metal_mine:7,crystal_mine:6,gas_mine:4}),r:{m:8000,k:5000,g:2500}},
 c2b:{t:'Automatisierung',d:'Roboterfabrik Stufe 3 und Kraftwerk Stufe 9.',c:()=>mB({robotics:3,power:9}),r:{m:6000,k:4000,g:2000,dm:5}},
 c3a:{t:'Schutzschild',d:'Werft Stufe 3 und 10 Raketenwerfer auf dem Heimatplaneten.',c:()=>E.maxB('shipyard')>=3&&(S.planets[S.home].def.rl||0)>=10,r:{m:12000,k:6000,g:3000}},
 c3b:{t:'Aufklärung',d:'Forschungslabor Stufe 4 und Spionagetechnik Stufe 2.',c:()=>E.maxB('lab')>=4&&E.tl('espionage')>=2,r:{m:10000,k:15000,g:5000,dm:5}},
 c4a:{t:'Schwerindustrie',d:'Metallmine 10, Kristallmine 9 und Gasförderung 7.',c:()=>mB({metal_mine:10,crystal_mine:9,gas_mine:7}),r:{m:40000,k:25000,g:15000,dm:5}},
 c5a:{t:'Rohstoffmacht',d:'Metallmine 11 und Kristallmine 10.',c:()=>mB({metal_mine:11,crystal_mine:10}),r:{m:80000,k:50000,g:30000,dm:10}},
 c8a:{t:'Naniten',d:'Baue die Nanitenfabrik (Roboterfabrik 8, Computertechnik 8).',c:()=>E.maxB('nanite')>=1,r:{m:200000,k:120000,g:60000,dm:10}},
 c8b:{t:'Weitblick',d:'Computertechnik Stufe 10 und Astrophysik Stufe 4.',c:()=>E.tl('computer')>=10&&E.tl('astro')>=4,r:{m:120000,k:150000,g:60000,dm:10}},
 c8c:{t:'Forschungsmacht',d:'Forschungslabor Stufe 10 und Roboterfabrik Stufe 10.',c:()=>mB({lab:10,robotics:10}),r:{m:250000,k:200000,g:100000,dm:10}},
 c9a:{t:'Neue Welten',d:'Baue einen Terraformer (+5 Felder je Stufe).',c:()=>E.maxB('terraformer')>=1,r:{m:150000,k:200000,g:150000,dm:10}},
 c9b:{t:'Sprungantrieb',d:'Hyperraumantrieb Stufe 3.',c:()=>E.tl('hyperdrive')>=3,r:{m:200000,k:300000,g:100000,dm:10}},
 c9c:{t:'Schlachtflotte',d:'Baue insgesamt 10 Schlachtschiffe.',c:()=>(S.built.bs||0)>=10,r:{m:400000,k:300000,g:150000,dm:15}},
 c7a:{t:'Imperiale Größe',d:'Roboterfabrik Stufe 5 und Forschungslabor Stufe 6.',c:()=>E.maxB('robotics')>=5&&E.maxB('lab')>=6,r:{m:100000,k:80000,g:40000,dm:15}}};
// v24: Belohnungen wachsen mit der Produktion (mind. Basiswert, sonst ~45 Min. aktuelle Förderung, max. 10×)
function scaleR(r,h=0.4){const o=Object.assign({},r);try{const pi=E.prodInfo(S.planets[S.home]);const nice=x=>{const e=Math.pow(10,Math.max(1,Math.floor(Math.log10(x))-1));return Math.round(x/e)*e};
 for(const [k,v] of [['m',pi.m],['k',pi.k],['g',pi.g]]){if(!r[k])continue;const d=Math.max(0,v)*h;if(d>r[k])o[k]=nice(Math.min(r[k]*3,d))}}catch(e){}return o}
window.CAMP_SCALE=scaleR;
const T=i=>typeof i==='string'?EXTRA[i]:GE.TASKS[i];
// v41: Fortschritt je Mission (für Aries-Panel): B=Gebäude (max. Stufe), T=Forschung, U=gebaute Einheiten, D=Verteidigung Heimat, F=Flags
const PR={1:{B:{metal_mine:1,crystal_mine:1}},2:{B:{metal_mine:2}},3:{B:{power:2}},4:{B:{gas_mine:1}},6:{B:{robotics:2}},7:{B:{shipyard:1},U:{rl:1}},10:{B:{store:1}},12:{B:{alliance:1},F:['@ally']},13:{B:{lab:2},T:{energy:1}},
 14:{B:{shipyard:2},T:{combustion:2},U:{sc:1}},17:{T:{astro:1},F:['nebula']},20:{T:{astro:2},F:['@col']},25:{B:{radar:1}},26:{B:{galacto:1},T:{discoverer:1}},
 c1a:{B:{metal_mine:4,crystal_mine:3,power:4}},c1b:{B:{gas_mine:2,power:5}},c2a:{B:{metal_mine:7,crystal_mine:6,gas_mine:4}},c2b:{B:{robotics:3,power:9}},c3a:{B:{shipyard:3},D:{rl:10}},c3b:{B:{lab:4},T:{espionage:2}},
 c4a:{B:{metal_mine:10,crystal_mine:9,gas_mine:7}},c5a:{B:{metal_mine:11,crystal_mine:10}},c7a:{B:{robotics:5,lab:6}},c8a:{B:{nanite:1}},c8b:{T:{computer:10,astro:4}},c8c:{B:{lab:10,robotics:10}},
 c9a:{B:{terraformer:1}},c9b:{T:{hyperdrive:3}},c9c:{U:{bs:10}}};
function prog(i){const P=PR[i];if(!P){const d=safe(()=>done(i));return{cur:d?1:0,max:1,parts:[]}}let cur=0,max=0;const parts=[];
 const add=(n,h,need)=>{cur+=Math.min(h,need);max+=need;parts.push({n,h:Math.min(h,need),need})};
 for(const k in P.B||{})add(GE.BUILD[k].n,E.maxB(k),P.B[k]);for(const k in P.T||{})add(GE.TECH[k].n,E.tl(k),P.T[k]);
 for(const k in P.U||{})add((GE.SHIP[k]||GE.DEF[k]).n,S.built[k]||0,P.U[k]);for(const k in P.D||{})add(GE.DEF[k].n,(S.planets[S.home].def[k]||0),P.D[k]);
 for(const f of P.F||[]){const v=f==='@ally'?!!S.ally:f==='@col'?E.colonies()>0:!!S.flags[f];add(f==='@ally'?'Allianz':f==='@col'?'Kolonie':'Aktion',v?1:0,1)}return{cur,max,parts}}
window.CAMP_PROG=prog;
const done=i=>typeof i==='string'?EXTRA[i].c():E.COND[i]();
// Freischaltungen: Kapitel-Index (1-basiert), ab dem verfügbar
const FEAT={research:2,store:2,cmd:2,inv:2,yard:3,defense:3,system:4,galaxy:4,fleet:4,galacto:5,ally:7,chat:7,rank:7};
const FEATN={research:'Forschung',store:'Space Store',cmd:'Offiziere',inv:'Inventar',yard:'Werft',defense:'Abwehr',system:'Sonnensystem',galaxy:'Galaxie',fleet:'Flotte',galacto:'Galactonit',ally:'Allianz',chat:'Chat',rank:'Rangliste'};
const BLOCK={lab:2,shipyard:3,radar:4,galacto:5,stargate:6,alliance:7};
window.CAMP={CH,FEAT,BLOCK};
const C=()=>S.camp;
function init(){if(S.camp){migrate24();migrate26();return}const c={ch:0,cl:{},side:{},seen:{},skip:0,v24:(S.task||0)>0?0:1};
 // Bestehender Spielstand: bisherige Aries-Aufgaben übernehmen, bereits erfüllte nachtragen
 for(let i=0;i<Math.min(S.task||0,GE.TASKS.length);i++)c.cl[i]=1;
 if((S.task||0)>=GE.TASKS.length){c.cl.rank=1;c.seen.fin=1}
 S.camp=c;let gave=0;
 if((S.task||0)>0){for(const ch of CH)for(const i of ch.main)if(!c.cl[i]&&safe(()=>done(i))){E.giveReward(T(i).r);c.cl[i]=1;gave++}
  if(gave)toast(`Aries: ${gave} bereits erfüllte Missionen nachgetragen`,'ok',4000)}
 c.ch=chapterFrom(c);for(let k=0;k<c.ch;k++){c.seen['i'+k]=1;c.seen['o'+k]=1}if(c.ch>0)c.seen['i'+c.ch]=0;save();migrate24()}
function migrate26(){const c=S.camp;if(!c||c.v26)return;c.v26=1;if(c.ch===7&&!c.skip)c.seen.i7=0;save()}
function safe(f){try{return f()}catch(e){return false}}
function migrate24(){const c=S.camp;if(!c||c.v24)return;
 // Kapitel, deren ursprüngliche Missionen schon erledigt sind, bekommen die neuen Zusatzmissionen geschenkt (kein Rückfall)
 for(let k=0;k<CH.length;k++){const num=CH[k].main.filter(i=>typeof i==='number'||i==='rank');if(!num.every(i=>c.cl[i]))break;if(k>=c.ch&&!num.length)break;CH[k].main.forEach(i=>{if(typeof i==='string'&&i!=='rank')c.cl[i]=1})}
 const nc=chapterFrom(c);if(nc>c.ch){for(let k=c.ch;k<nc;k++){c.seen['i'+k]=1;c.seen['o'+k]=1}c.ch=nc}c.v24=1;save()}
function chapterFrom(c){for(let k=0;k<CH.length;k++)if(CH[k].main.some(i=>!c.cl[i]))return k;return CH.length}
const free=()=>!S.camp||S.camp.skip||S.camp.ch>=CH.length;
const chN=()=>S.camp?S.camp.ch+1:99;
const locked=f=>!free()&&FEAT[f]&&chN()<FEAT[f];
const bLocked=id=>!free()&&BLOCK[id]&&chN()<BLOCK[id];
window.CAMP.locked=locked;window.CAMP.bLocked=bLocked;
function curMain(){const c=C();if(!c||c.ch>=CH.length)return null;return CH[c.ch].main.find(i=>!c.cl[i])}
function claim(i,paid){const c=C();if(c.cl[i]||!safe(()=>done(i)))return 'Mission noch nicht erfüllt';if(i===5)setTimeout(()=>{for(const id of S.order){const p=S.planets[id];if(p.pct.gas_mine===60)p.pct.gas_mine=100}renderAll();toast('Gasförderung wieder auf 100 %','ok')},1500);if(!paid)E.giveReward(scaleR(T(i).r));c.cl[i]=1;S.task=Object.keys(c.cl).filter(k=>/^\d+$/.test(k)).length;
 (E.addLog||(()=>{}))(`Aries: Mission „${T(i).t}“ abgeschlossen – Belohnung erhalten!`,'task');if(!paid)toast('Belohnung: '+E.rewardText(scaleR(T(i).r)),'ok',3500);
 const ch=CH[c.ch];if(ch&&ch.main.every(k=>c.cl[k])){const bt='Kapitelbonus: '+ch.t;if(window.RWD)setTimeout(()=>RWD.flow(ch.bonus,bt).then(ok=>{if(!ok)E.giveReward(ch.bonus)}),500);else E.giveReward(ch.bonus);c.seen['o'+c.ch]=0;c.ch++;if(c.ch<CH.length)c.seen['i'+c.ch]=0}
 save();renderAll();return null}
function claimSide(id,paid){const c=C();const m=CH.flatMap(x=>x.side).find(x=>x.id===id);if(!m||c.side[id]||!m.c())return 'Noch nicht erfüllt';if(!paid)E.giveReward(scaleR(m.r,0.5));c.side[id]=1;toast('Nebenmission: '+E.rewardText(m.r),'ok',3500);save();renderAll();return null}
// ---------- Missionslog ----------
const rw=r=>`<span class="cp-rw">${E.rewardText(r)}</span>`;
PANELS.camp=()=>{init();const c=C();let h=`<div class="cp-head">${holo('p3','cp-av')}<div><div class="cp-k">${free()?'Freies Spiel':`Kapitel ${c.ch+1} von ${CH.length}`}</div><b>${free()?'Das Universum gehört dir':CH[c.ch].t}</b><div class="cp-prog"><i style="width:${Math.round(CH.slice(0,c.ch).length/CH.length*100+(c.ch<CH.length?CH[c.ch].main.filter(i=>c.cl[i]).length/CH[c.ch].main.length/CH.length*100:0))}%"></i></div></div></div>`;
 CH.forEach((ch,k)=>{const st=k<c.ch?'done':k===c.ch?'cur':'todo';
  h+=`<div class="cp-ch ${st}"><div class="cp-cht"><span class="cp-n">${st==='done'?'✓':k+1}</span>${ch.ic} ${esc(ch.t)}<span class="spacer"></span><span class="mut">${st==='todo'?'🔒 gesperrt':ch.main.filter(i=>c.cl[i]).length+'/'+ch.main.length}</span></div>`;
  if(st==='cur'||(st==='done'&&k===c.ch-1)){
   h+=ch.main.map(i=>{const t=T(i),cl=c.cl[i],d=!cl&&safe(()=>done(i)),cur=i===curMain();return`<div class="cp-m ${cl?'cl':''} ${cur?'cur':''}"><div class="cp-mi">${cl?'✓':d?'!':'•'}</div><div class="ft"><b>${esc(t.t)}</b><div>${esc(t.d)}</div>${rw(scaleR(t.r))}</div>${cl?'':d?`<button class="btn sm green" data-act="cp-claim" data-id="${i}">Abholen</button>`:cur&&GUIDE[i]?`<button class="btn sm ghost" data-act="cp-guide" data-id="${i}">Zeig es mir</button>`:''}</div>`}).join('');
   h+=`<div class="cp-sub">Nebenmissionen</div>`+ch.side.map(m=>{const cl=c.side[m.id],d=!cl&&m.c();return`<div class="cp-m side ${cl?'cl':''}"><div class="cp-mi">${cl?'✓':'◇'}</div><div class="ft"><b>${esc(m.t)}</b><div>${esc(m.d)}</div>${rw(scaleR(m.r,0.5))}</div>${cl?'':d?`<button class="btn sm green" data-act="cp-side" data-id="${m.id}">Abholen</button>`:''}</div>`}).join('');
   if(st==='cur')h+=`<div class="cp-sub">Kapitelbonus: ${rw(ch.bonus)}</div>`}
  h+='</div>'});
 if(c.ch>=5||free())h+=`<div class="cp-sub">Wissen</div><div class="cp-m side"><div class="cp-mi">📘</div><div class="ft"><b>Planeten-Guide</b><div>Bauplätze, Temperatur und ihre Wirkung auf Gas und Energie – nach Position.</div></div><button class="btn sm ghost" data-act="open" data-p="pguide">Lesen</button></div>`;
 h+=`<div class="cp-sub">Tutorial</div><div class="row" style="gap:6px;margin:4px 0 8px"><button class="btn sm ghost" data-act="cp-restart">↻ Kapitel-Tutorial neu starten</button>${c.skip?'<button class="btn sm" data-act="cp-skip">Tutorial fortsetzen</button>':''}</div>`;
 return['Missionslog',`<div class="camp">${h}</div>`]};
PANELS.tasks=PANELS.camp;
// v26: Wochenziele (nach Kapitel 7 / im freien Spiel) – drei Ziele je Spielwoche, relativ zum Stand bei Wochenbeginn
const WK_DEF=[
 {id:'bl',t:'Baumeister',d:n=>`Baue ${n} Gebäudestufen aus.`,n:[8,12,16],v:()=>S.order.reduce((a,id)=>a+Object.values(S.planets[id].b).reduce((x,y)=>x+y,0),0),r:{m:60000,k:40000,g:20000,dm:4}},
 {id:'rs',t:'Wissensdurst',d:n=>`Schließe ${n} Forschungsstufen ab.`,n:[3,4,6],v:()=>Object.values(S.tech).reduce((a,b)=>a+b,0),r:{m:40000,k:60000,g:30000,dm:4}},
 {id:'nb',t:'Nebelpilot',d:n=>`Schicke ${n} Expeditionen in den Nebel.`,n:[5,8,12],v:()=>S.flags.nebN||0,r:{m:50000,k:50000,g:25000,gal:3}},
 {id:'sh',t:'Werftbetrieb',d:n=>`Baue ${n} Schiffe oder Verteidigungsanlagen.`,n:[40,80,150],v:()=>Object.values(S.built).reduce((a,b)=>a+b,0),r:{m:70000,k:40000,g:20000,dm:3}},
 {id:'pt',t:'Aufstieg',d:n=>`Gewinne ${E.fmtN?E.fmtN(n):n} Punkte hinzu.`,n:[2000,5000,10000],v:()=>E.totalPoints(),r:{m:80000,k:60000,g:30000,dm:5}}];
const WEEK=7*24*3600e3;
function wk(){const c=C();if(!c)return null;const w=Math.floor((S.t||Date.now())/WEEK);if(!c.wk||c.wk.w!==w){const tier=Math.min(2,Math.floor((c.ch>=CH.length?1:0)+E.colonies()/3));const pick=[];let h=w;const pool=WK_DEF.slice();
  for(let i=0;i<3;i++){h=(h*9301+49297)%233280;pick.push(pool.splice(h%pool.length,1)[0])}
  c.wk={w,g:pick.map(d=>({id:d.id,n:d.n[tier],b:d.v()})),cl:{}};save()}return c.wk}
const wkShow=()=>{const c=C();return c&&(free()||c.ch>=7)};
function wkRows(){const W=wk();if(!W)return'';const left=(W.w+1)*WEEK-(S.t||Date.now());
 return`<div class="cp-sub">Wochenziele <span class="mut">· noch ${Math.max(1,Math.ceil(left/864e5))} Tg.</span></div>`+W.g.map(g=>{const d=WK_DEF.find(x=>x.id===g.id);const p=Math.max(0,d.v()-g.b),ok=p>=g.n,cl=W.cl[g.id];
  return`<div class="cp-m side ${cl?'cl':''}"><div class="cp-mi">${cl?'✓':ok?'!':'⟳'}</div><div class="ft"><b>${esc(d.t)}</b><div>${esc(d.d(g.n))} <span class="mut">(${Math.min(p,g.n).toLocaleString('de-DE')}/${g.n.toLocaleString('de-DE')})</span></div>${rw(scaleR(d.r,1))}</div>${cl?'':ok?`<button class="btn sm green" data-act="cp-week" data-id="${g.id}">Abholen</button>`:''}</div>`}).join('')}
const _cp=PANELS.camp;PANELS.camp=()=>{const r=_cp();if(wkShow())r[1]=r[1].replace('<div class="cp-sub">Tutorial</div>',wkRows()+'<div class="cp-sub">Tutorial</div>');return r};PANELS.tasks=PANELS.camp;
async function claimWeek(id){const W=wk();const g=W&&W.g.find(x=>x.id===id);if(!g||W.cl[id])return;const d=WK_DEF.find(x=>x.id===id);if(d.v()-g.b<g.n)return err('Noch nicht erfüllt');
 const r=scaleR(d.r,1);if(window.RWD){const ok=await RWD.flow(r,'Wochenziel: '+d.t);if(!ok)return}else E.giveReward(r);W.cl[id]=1;save();if(GAME.panel)renderPanel(true);renderAll()}
document.addEventListener('click',e=>{const t=e.target.closest('[data-act="cp-week"]');if(!t)return;e.stopPropagation();claimWeek(t.dataset.id)},true);
// ---------- HUD-Kachel ----------
window.renderAries=function(){init();const el=$('#aries');if(!el)return;const c=C();if(c.skip&&hshow&&!spotSel){if(pend){const f=pend;pend=null;f(null)}hide()}
 const i=curMain();const anyDone=c.ch<CH.length&&CH[c.ch].main.some(k=>!c.cl[k]&&safe(()=>done(k)));const pg=i!=null?prog(i):null;const pct=pg?Math.round(pg.cur/Math.max(1,pg.max)*100):100;
 setHTML(el,`<div class="ariescard glass ${anyDone?'done':''} ${c.skip?'muted':''}" data-act="open" data-p="aries" aria-label="Aries – aktuelle Mission">${A.img('aries','av')}<div style="min-width:0"><div class="at">${c.ch>=CH.length?'Freies Spiel':'Kapitel '+(c.ch+1)}</div><div class="ad">${i!=null?esc(T(i).t):'Wochenziele'}</div><div class="ap"><i style="width:${pct}%"></i></div></div></div>`)};
// v41: kompaktes Aries-Panel: aktuelles Kapitel + aktuelle Mission mit Fortschritt
PANELS.aries=()=>{init();const c=C();const i=curMain();let h=`<div class="cp-head">${holo('p3','cp-av')}<div><div class="cp-k">${c.ch>=CH.length?'Freies Spiel':`Kapitel ${c.ch+1} von ${CH.length}`}</div><b>${c.ch>=CH.length?'Das Universum gehört dir':esc(CH[c.ch].t)}</b>${c.ch<CH.length?`<div class="cp-prog"><i style="width:${Math.round(CH[c.ch].main.filter(k=>c.cl[k]).length/CH[c.ch].main.length*100)}%"></i></div><div class="mut" style="font-size:11px">${CH[c.ch].main.filter(k=>c.cl[k]).length}/${CH[c.ch].main.length} Missionen in diesem Kapitel</div>`:''}</div></div>`;
 if(i!=null){const t=T(i),pg=prog(i),d=safe(()=>done(i));
  h+=`<div class="box aq"><div class="cp-k">Aktuelle Mission</div><b>${esc(t.t)}</b><div style="margin:3px 0 6px">${esc(t.d)}</div>
  <div class="aq-bar"><i style="width:${Math.round(pg.cur/Math.max(1,pg.max)*100)}%"></i><span>${pg.cur}/${pg.max}</span></div>
  ${pg.parts.length>1?`<div class="aq-parts">${pg.parts.map(x=>`<span class="${x.h>=x.need?'ok':''}">${x.h>=x.need?'✓':'•'} ${esc(x.n)} ${x.h}/${x.need}</span>`).join('')}</div>`:''}
  <div class="mut" style="margin-top:6px">Belohnung: ${rw(scaleR(t.r))}</div>
  <div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap">${d?`<button class="btn sm green" data-act="cp-claim" data-id="${i}">Belohnung abholen</button>`:GUIDE[i]?`<button class="btn sm" data-act="cp-guide" data-id="${i}">Zeig es mir</button>`:''}${c.skip?'<button class="btn sm ghost" data-act="cp-skip">Tutorial fortsetzen</button>':''}<button class="btn sm ghost" data-act="open" data-p="camp">Missionslog</button></div></div>`}
 else h+=`<div class="box">Alle Kapitel abgeschlossen. Wochenziele findest du im Missionslog.<div class="row" style="margin-top:8px"><button class="btn sm ghost" data-act="open" data-p="camp">Missionslog</button></div></div>`;
 return['Aries',`<div class="camp">${h}</div>`]};
// ---------- Hologramm ----------
const POSE={wave:0,point:1,pointdl:2,explain:3,think:4,cheer:5,alert:6,idle:7};
function holo(p,cls){return`<span class="holo ${cls||''}"><img src="assets/aries/${p}.webp" alt=""></span>`}
const H=document.createElement('div');H.id='aries-h';H.innerHTML=`<div class="ah-fig">${[0,1,2,3,4,5,6,7].map(i=>`<img data-p="${i}" src="assets/aries/p${i}.webp" alt="">`).join('')}<div class="ah-scan"></div></div><div class="ah-bub glass"><div class="ah-name">Aries</div><div class="ah-txt"></div><div class="ah-btns"></div></div>`;
document.body.appendChild(H);
const SP=document.createElement('div');SP.id='cp-spot';SP.innerHTML='<div class="sp-hole"></div><div class="sp-ring"></div><div class="sp-arrow">➜</div>';document.body.appendChild(SP);
const CARD=document.createElement('div');CARD.id='cp-card';document.body.appendChild(CARD);
let typer=null,hshow=false,curPose=-1;
function pose(n){const k=POSE[n]??n;if(k===curPose)return;curPose=k;H.querySelectorAll('.ah-fig img').forEach(im=>im.classList.toggle('on',+im.dataset.p===k))}
let pend=null;
function say(text,{p='explain',btns=[['Weiter',null]],side,until}={}){if(pend){const f=pend;pend=null;f(null)}if(S&&S.camp&&S.camp.skip){H.classList.remove('show');return Promise.resolve(null)}return new Promise(res0=>{const res=v=>{if(pend===res)pend=null;res0(v)};pend=res;if(until){const iv=setInterval(()=>{if(pend!==res){clearInterval(iv);return}if(safe(until)){clearInterval(iv);res(null)}},500)}pose(p);H.classList.toggle('right',side==='right');H.classList.add('show');hshow=true;
 const tx=H.querySelector('.ah-txt');clearInterval(typer);const full=text;tx.textContent=full;tx.classList.remove('fade');void tx.offsetWidth;tx.classList.add('fade');lastFit='';
 const bb=H.querySelector('.ah-btns');bb.innerHTML=btns.map((b,i)=>`<button class="btn sm ${i?'ghost':''}" data-cpb="${i}">${b[0]}</button>`).join('');
 const finish=i=>{clearInterval(typer);tx.textContent=full;res(btns[i]&&btns[i][1]||i)};
 bb.querySelectorAll('button').forEach(b=>b.onclick=e=>{e.stopPropagation();finish(+b.dataset.cpb)});
 H.querySelector('.ah-bub').onclick=e=>{if(e.target.closest('button'))return;if(btns.length===1&&btns[0][0]==='Weiter')finish(0)};
})}
function hide(){H.classList.remove('show');hshow=false;spot(null);if(pend){const f=pend;pend=null;f(null)}}
window.CAMP.say=say;window.CAMP.hide=hide;
// ---------- Spotlight ----------
let spotSel=null,spotEl=null;
function spot(sel){spotSel=sel;SP.classList.toggle('on',!!sel);document.body.classList.toggle('cp-guided',!!sel);placeSpot()}
function placeSpot(){if(!spotSel){document.querySelectorAll('.cp-target').forEach(e=>e.classList.remove('cp-target'));if(lastFit){lastFit='';H.style.bottom='';H.classList.remove('fitmini')}return}const el=typeof spotSel==='function'?spotSel():document.querySelector(spotSel);if(spotEl&&spotEl!==el)spotEl.classList.remove('cp-target');spotEl=el;if(el)el.classList.add('cp-target');if(!el){SP.classList.add('wait');return}SP.classList.remove('wait');
 const r=el.getBoundingClientRect();const pad=6;const hole=SP.querySelector('.sp-hole'),ring=SP.querySelector('.sp-ring'),ar=SP.querySelector('.sp-arrow');
 Object.assign(hole.style,{left:r.left-pad+'px',top:r.top-pad+'px',width:r.width+pad*2+'px',height:r.height+pad*2+'px'});for(const k of['left','top','width','height'])ring.style[k]=hole.style[k];
 const right=r.left+r.width/2>innerWidth/2;ar.style.left=(right?r.left-46:r.right+8)+'px';ar.style.top=r.top+r.height/2-16+'px';ar.classList.toggle('flip',right);
 // Aries weicht auf die andere Seite aus
 fitAries(r)}
// Aries + Sprechblase so platzieren, dass sie den Spotlight-Ausschnitt nie schneiden
let lastFit='';
function fitAries(r){const key=[r.left,r.top,r.width,r.height,innerWidth,innerHeight,H.classList.contains('show'),H.classList.contains('mini')].map(v=>Math.round(+v/4)).join(',');if(key===lastFit)return;lastFit=key;
 const pad=10,hole={l:r.left-pad,t:r.top-pad,r:r.right+pad,b:r.bottom+pad};
 const hit=el=>{const q=el.getBoundingClientRect();return!(q.right<hole.l||q.left>hole.r||q.bottom<hole.t||q.top>hole.b)};
 const fig=H.querySelector('.ah-fig'),bub=H.querySelector('.ah-bub');const nav=($('#nav')||{getBoundingClientRect:()=>({top:innerHeight})}).getBoundingClientRect().top;
 const pref=r.left+r.width/2<innerWidth*0.5?'right':'left',alt=pref==='right'?'left':'right';
 const base=innerHeight-nav+6;
 const cands=[[pref,null,0],[alt,null,0],[pref,null,1],[alt,null,1]];
 // oberhalb bzw. unterhalb des Ziels
 const above=innerHeight-hole.t+4,below=Math.max(4,innerHeight-hole.b-4-(bub.offsetHeight+10));
 for(const sd of[pref,alt])for(const m of[0,1]){cands.push([sd,above,m]);cands.push([sd,null,m,below])}
 for(const [sd,bt,mini,bl] of cands){H.classList.toggle('right',sd==='right');H.classList.toggle('fitmini',!!mini);
  let b=bt!=null?bt:bl!=null?bl:null;H.style.bottom=b!=null?Math.max(4,Math.min(innerHeight-60,b))+'px':'';
  const q=H.getBoundingClientRect();if(q.top<4&&b!=null)continue;
  if(!hit(bub)&&!hit(fig))return}
 // Notfall: Figur ausblenden, Blase an freie Ecke
 H.classList.add('fitmini');H.style.bottom='';H.classList.toggle('right',pref==='right')}
let tickT=0;function spotTick(){const pn=!!(window.GAME&&GAME.panel);if(H.classList.contains('mini')!==pn)H.classList.toggle('mini',pn);if(pn&&!spotSel&&!H.classList.contains('right'))H.classList.add('right');if(spotSel||spotEl)placeSpot()}
setInterval(()=>{if(!document.hidden&&(hshow||spotSel))spotTick()},200);addEventListener('resize',placeSpot);
// Eingaben während geführter Schritte blockieren (außer Ziel und Aries)
for(const ev of['click','pointerdown','touchstart','mousedown'])document.addEventListener(ev,e=>{if(!spotSel)return;if(e.target.closest('#aries-h,#rwd,#aries,#panel [data-p=camp],#panel [data-act^=cp-]'))return;if(window.B2&&B2.placing&&e.target.closest('#b2'))return;if(spotEl&&spotEl.contains(e.target))return;e.stopPropagation();if(ev==='click')e.preventDefault()},true);
const wait=(f,ms=60000)=>new Promise(r=>{const t0=Date.now();const iv=setInterval(()=>{if(safe(f)||Date.now()-t0>ms){clearInterval(iv);r(safe(f))}},150)});
const panelIs=(k,a)=>()=>window.GAME&&GAME.panel&&GAME.panel[0]===k&&(a===undefined||GAME.panel[1]===a);
const padOf=id=>{const p=pl();for(const k in p.pads)if(p.pads[k]===id)return +k;return PAD_PREF[id]};
function scrollToPad(i){if(window.B2&&B2.on())return;const b=document.querySelector(`#padhits .bh[data-i="${i}"]`);const pano=$('#pano');if(!b||!pano)return;const r=b.getBoundingClientRect();pano.scrollLeft+=r.left+r.width/2-innerWidth/2}
async function step(text,sel,until,o={}){if(o.pad!=null){if(!GAME.panel)scrollToPad(o.pad);await new Promise(r=>setTimeout(r,250))}
 spot(sel);say(text,{p:o.p||'point',btns:[['Überspringen','skip']]}).then(v=>{if(v==='skip')abort=true});
 const ok=await wait(()=>abort||until());spot(null);return ok&&!abort}
let abort=false,busy=false;
const padStep=id=>[window.B2&&B2.on()?`Tippe auf diesen freien Platz.`:`Tippe auf diesen Bauplatz.`,()=>window.B2&&B2.on()?B2.hintEl(id):document.querySelector(`#padhits .bh[data-i="${padOf(id)}"]`),()=>GAME.panel&&(GAME.panel[0]==='padbuild'||GAME.panel[0]==='bld'),{pad:padOf(id)}];
const buildOn=id=>[`Wähle „${GE.BUILD[id].n}“ und tippe auf „Hier bauen“ bzw. „Ausbauen“.`,()=>document.querySelector(`#panel [data-act=padbuild][data-id="${id}"],#panel [data-act=build][data-id="${id}"]`),()=>pl().bq.some(q=>q.id===id)||E.lv(pl(),id)>0&&!GAME.panel||!!(window.B2&&B2.placing&&B2.placing.id===id)];
const placeStep=id=>[`Zieh das Gebäude an einen freien Platz (grün) und tippe auf ✓.`,'#b2ok',()=>!(window.B2&&B2.placing)||pl().bq.some(q=>q.id===id)];
// ===== v43: Bau-Führung immer über das Menü: „Gebäude“ → Gebäude → „Jetzt bauen“/„Ausbauen“ → verschieben → „Hier bauen“ =====
const DRAG=document.createElement('div');DRAG.id='cp-drag';DRAG.innerHTML='<div class="dg-ghost"></div><div class="dg-hand">👆</div>';document.body.appendChild(DRAG);
function dragHint(on){const P=on&&window.B2&&B2.placing;if(!P){DRAG.classList.remove('on');return}const c=B2.cam,rt=document.querySelector('#b2');if(!c||!rt){DRAG.classList.remove('on');return}
 const rr=rt.getBoundingClientRect();const x=rr.left+c.x+P.x*c.s,y=rr.top+c.y+(P.y-55)*c.s;DRAG.style.transform=`translate(${Math.round(x-60)}px,${Math.round(y-60)}px)`;DRAG.classList.add('on')}
const qLv=id=>{const p=pl();return Math.max(E.lv(p,id),...p.bq.filter(q=>q.id===id&&!q.demo).map(q=>q.lv))};
const placedB=id=>{const p=pl();return !!(p.pos&&p.pos[id])||E.lv(p,id)>0};
function bStage(id,tgt,open){const p=pl();
 if(open==='speed'){if(E.lv(p,id)>=tgt)return 'done'}else if(!open&&qLv(id)>=tgt)return 'done';
 if(window.B2&&B2.placing&&B2.placing.id===id){const P=B2.placing;if(P._sx==null){P._sx=P.x;P._sy=P.y}if(Math.hypot(P.x-P._sx,P.y-P._sy)>6)P._mv=1;return !P._mv?'drag':P.ok===false?'blocked':'confirm'}
 if(GAME.panel&&GAME.panel[0]==='bld'&&GAME.panel[1]===id)return open==='speed'?'speed':open?'done':'btn';
 if(GAME.panel&&GAME.panel[0]==='buildings')return 'card';
 if(GAME.panel&&GAME.panel[0]==='bld'&&backVis())return 'back';
 if(GAME.panel)return 'close';
 return 'menu'}
const backVis=()=>{const b=document.querySelector('#panel [data-act=pback]');return !!(b&&b.offsetParent&&getComputedStyle(b).visibility!=='hidden')};
const cardEl=id=>{const e=document.querySelector(`#panel [data-act=pbld][data-id="${id}"]`);if(e&&!e.dataset.cps){e.dataset.cps=1;e.scrollIntoView({block:'nearest',inline:'nearest'})}return e};
function bText(st,id){const n=GE.BUILD[id].n;const er=st==='btn'?E.canBuild(pl(),id):null;
 switch(st){case 'menu':return[`Öffne links im Menü „Gebäude“.`,'#rail [data-p=buildings]','pointdl'];
  case 'back':return['Zurück zur Gebäudeliste.','#panel [data-act=pback]','point'];
  case 'close':return['Schließe dieses Fenster – wir gehen über das Gebäude-Menü.','#panel [data-act=pclose]','point'];
  case 'card':return[`Tippe auf „${n}“.`,()=>cardEl(id),'point'];
  case 'btn':return[er?`„${n}“ geht gerade noch nicht: ${er}`:placedB(id)?`Tippe auf „Ausbauen“.`:`Tippe auf „Jetzt bauen“.`,`#panel [data-act=build][data-id="${id}"]`,er?'think':'point'];
  case 'drag':return['Schieb es an den richtigen Platz: Zieh das Gebäude mit dem Finger auf einen freien Platz.',()=>DRAG.classList.contains('on')?DRAG:document.querySelector('#b2ok'),'explain'];
  case 'blocked':return['Dieser Platz ist belegt (rot) – schieb das Gebäude weiter auf einen freien Platz.',()=>DRAG.classList.contains('on')?DRAG:document.querySelector('#b2ok'),'think'];
  case 'confirm':return['Gut so! Tippe jetzt auf „✓ Hier bauen“.','#b2ok','point'];
  case 'speed':return['Der Bau läuft! Unter 5 Minuten Restzeit ist das Fertigstellen gratis – tippe auf „Gratis fertigstellen“.','#panel [data-act=speed][data-k=sub]','point']}}
function buildFlow(id,open,tg){const tgt=tg||qLv(id)+1;let key=null;return new Promise(res=>{let iv=0;const fin=ok=>{clearInterval(iv);dragHint(false);spot(null);res(ok)};
 const tick=()=>{if(abort)return fin(false);const st=bStage(id,tgt,open);dragHint(st==='drag'||st==='blocked');if(st==='done')return fin(true);
  const t=bText(st,id);const k=st+'|'+t[0];if(k!==key){key=k;spot(t[1]);say(t[0],{p:t[2],btns:[['Überspringen','skip']]}).then(v=>{if(v==='skip')abort=true})}};
 iv=setInterval(tick,150);tick()})}
// Bau bis Stufe L (jede fehlende Stufe einzeln über das Menü), danach ggf. gratis fertigstellen
async function buildTo(id,L){while(qLv(id)<L){if(!await buildFlow(id))return false}
 const p=pl();const q=p.bq.find(x=>x.id===id);if(q&&E.lv(p,id)<L){if(q.end-Date.now()<=E.FREE_MS&&p.bq[0]===q){if(!await buildFlow(id,'speed',L))return false}}
 return true}
const GUIDE={
 0:[['Deine Willkommensbelohnung wartet. Tippe auf mein Bild.','#aries .ariescard',panelIs('aries'),{p:'pointdl'}],['Tippe auf „Abholen“.','#panel [data-act=cp-claim][data-id="0"]',()=>C().cl[0]]],
 1:[['__build','metal_mine',1],['__build','crystal_mine',1]],
 2:[['__build','metal_mine',2]],3:[['__build','power',2]],4:[['__build','gas_mine',1]],
 5:[['__open','gas_mine'],['Schiebe den Regler „Produktionsleistung“ auf 60 %.','#panel [data-act=pct]',()=>E.COND[5]()],['__info2','Gut! Merke: Unter 100 % fördert die Mine weniger, spart aber Energie. Nach der Belohnung stelle ich sie für dich wieder auf 100 %.']],
 6:[['__build','robotics',2]],
 10:[['__build','store',1]],
 8:[['Tippe auf den Blitz an der Bau-Kachel: unter 5 Minuten Restzeit gratis, darüber kostet es Dunkle Materie.','#queues .qsp',()=>!!S.flags.speedup,{p:'point'}]],
 9:[['Der Space Store – hier in der Leiste.','#rail [data-p=store]',()=>!!S.flags.store]],
 13:[['__build','lab',2],['Hier geht es zur Forschung.','#rail [data-p=research]',panelIs('research')],['Erforsche „Energietechnik“.','#panel [data-act=research][data-id=energy]',()=>!!S.rq||E.tl('energy')>0]],
 7:[['__build','shipyard',1],['Die Abwehr (Raketenwerfer) baust du hier.','#rail [data-p=defense],#rail [data-p=yard]',()=>!!GAME.panel]],
 15:[['Öffne die Galaxie-Ansicht.','#nav [data-v=galaxy],#nav [data-v=system]',()=>document.querySelector('#v-galaxy.active,#v-system.active')]],
 17:[['Schicke Schiffe über die Flotten-Ansicht in den Nebel (Position 16).','#nav [data-v=fleet]',()=>document.querySelector('#v-fleet.active')]],
 26:[['Galactonit verwaltest du hier.','#rail [data-p=galacto]',()=>!!GAME.panel]],
 12:[['__build','alliance',1],['Hier geht es zur Allianz.','#nav [data-v=ally]',()=>document.querySelector('#v-ally.active')]],
 20:[['Bevor du kolonisierst: Öffne die System-Ansicht.','#nav [data-v=system]',()=>document.querySelector('#v-system.active'),{p:'pointdl'}],
  ['Tippe auf eine freie Position.',()=>{const o=document.querySelector('#sysstrip .orbit.empty');if(o&&!o.dataset.cps){o.dataset.cps=1;o.scrollIntoView({inline:'center',block:'nearest'})}return o},()=>!!document.querySelector('#pop'),{p:'point'}],
  ['__pg'],
  ['Baue in der Werft ein Kolonieschiff. Dann tippst du hier auf eine freie Position und wählst „Kolonisieren“.','__info',()=>true,{p:'explain'}]],
 rank:[['Der Pokal öffnet die Rangliste.','#topbtns [data-p=rank]',()=>!!S.flags.rankSeen]]
};
window.CAMP.GUIDE=GUIDE;
async function pgSeq(){const pop=document.querySelector('#pop .pi-box');if(pop){spot('#pop .pi-box')}
 let v=await say('Jede Position hat zwei Werte: Bauplätze – wie viele Gebäudestufen hineinpassen – und die Temperatur.',{p:'explain',btns:[['Weiter',null],['Überspringen','skip']]});if(v==='skip'){abort=true;return}
 v=await say('Die Temperatur verändert deine Wirtschaft: Kalte Planeten fördern mehr Gas, heiße liefern mehr Energie aus Solarsatelliten.',{p:'think',btns:[['Weiter',null],['Überspringen','skip']]});if(v==='skip'){abort=true;return}
 spot(null);hide();const p=document.querySelector('#pop');const pn=p&&(p.querySelector('h4 .mut')||{}).textContent;const hl=pn?+pn.split(':')[2]:0;if(typeof closePop==='function')closePop();
 await card(`<div class="cc-k">Wissen</div><div class="cc-t">🪐 Planeten-Guide</div>${PI.guideHTML(hl)}<button class="btn" data-cc style="margin-top:10px">Verstanden</button>`,'wide')}
window.CAMP.pgSeq=pgSeq;
async function guide(i){if(busy)return;busy=true;abort=false;closePanelSafe();const g=GUIDE[i]||[];
 for(const s of g){if(s[0]==='__build'){if(!await buildTo(s[1],s[2]))break;continue}if(s[0]==='__open'){if(!await buildFlow(s[1],true))break;continue}if(s[0]==='__pg'){S.camp.seen.pg=1;save();await pgSeq();if(abort)break;continue}if(s[0]==='__info2'){spot(null);await say(s[1],{p:'explain'});continue}if(s[1]==='__info'){spot(null);await say(s[0],{p:'explain',btns:[['Verstanden',null]]});continue}if(!await step(...s))break}
 spot(null);const c=C();if(!abort&&!c.cl[i]&&safe(()=>done(i))){c.seen['d'+i]=1;hide();closePanelSafe();pose('cheer');await claimFx(i)}hide();busy=false;setTimeout(loop,300)}
function closePanelSafe(){if(window.GAME&&GAME.panel&&GAME.closePanel)GAME.closePanel()}
window.CAMP.guide=guide;
// ---------- Kapitelkarten ----------
function card(html,cls){return new Promise(r=>{CARD.innerHTML=`<div class="cc glass ${cls||''}">${html}</div>`;CARD.classList.add('on');CARD.querySelector('[data-cc]').onclick=()=>{CARD.classList.remove('on');setTimeout(r,300)}})}
async function intro(k){const ch=CH[k];const un=Object.keys(FEAT).filter(f=>FEAT[f]===k+1).map(f=>FEATN[f]).concat(Object.keys(BLOCK).filter(b=>BLOCK[b]===k+1).map(b=>GE.BUILD[b].n));
 await card(`<div class="cc-k">Kapitel ${k+1}</div><div class="cc-t">${ch.ic} ${esc(ch.t)}</div><div class="cc-d">${esc(ch.intro)}</div>${un.length?`<div class="cc-u">🔓 Neu freigeschaltet: <b>${un.join(', ')}</b></div>`:''}<div class="cc-m">${ch.main.map(i=>`<span>${esc(T(i).t)}</span>`).join('')}</div><button class="btn" data-cc>Los geht's</button>`)}
async function outro(k){const ch=CH[k];await card(`<div class="cc-k">Kapitel ${k+1} abgeschlossen</div><div class="cc-t">✦ ${esc(ch.t)}</div><div class="cc-d">${esc(ch.outro)}</div><div class="cc-u">Kapitelbonus: <b>${E.rewardText(ch.bonus)}</b></div><button class="btn" data-cc>Weiter</button>`)}
async function finale(){await card(`<div class="cc-k">Kampagne abgeschlossen</div><div class="cc-t">👑 Das Universum gehört dir</div><div class="cc-d">Du hast alles gelernt, was ich dir zeigen kann. Ab jetzt sind alle Funktionen frei – baue, forsche, erobere. Ich bin stolz auf dich, Kommandant.</div><button class="btn" data-cc>Freies Spiel</button>`)}
let looping=false;
async function loop(){if(looping||busy||!S||!S.camp||S.camp.skip)return;if(document.querySelector('#loader,#mplogin'))return;looping=true;try{const c=C();
 for(let k=0;k<CH.length;k++)if(c.seen['o'+k]===0){c.seen['o'+k]=1;save();pose('cheer');await outro(k);if(k===CH.length-1){c.seen.fin=1;save();await finale()}}
 if(c.ch<CH.length&&!c.seen['i'+c.ch]){c.seen['i'+c.ch]=1;save();await intro(c.ch);
  const i=curMain();const t=T(i);c.seen['a'+i]=1;save();
  if(c.ch===5){await say('Neue Welten warten! Doch nicht jeder Planet ist gleich – ich zeige dir, worauf du bei der Wahl achten solltest.',{p:'alert'});hide();looping=false;return guide(i)}
  if(c.ch===0)await say('Hallo, Kommandant! Ich bin Aries, deine Bordintelligenz. Ich führe dich Schritt für Schritt durch den Aufbau deines Imperiums.',{p:'wave'});
  const v=await say(`Erste Mission: „${t.t}“ – ${t.d}`,{p:'explain',until:()=>done(i),btns:GUIDE[i]?[['Zeig es mir','g'],['Selbst machen',null]]:[['Verstanden',null]]});
  hide();if(v==='g'){looping=false;return guide(i)}}
 // Hinweis: negative Energie
 {const pi=E.prodInfo(pl());const now=Date.now();if(c.cl[3]&&!pl().moon&&pi.eUse>pi.eProd+0.5&&now-(c.eh||0)>8*60e3&&!GAME.panel){c.eh=now;save();const v=await say('Achtung: Deine Energie ist negativ – Minen fördern dann weniger. Baue das Kraftwerk aus.',{p:'alert',btns:[['Zeig es mir','g'],['Später',null]]});hide();if(v==='g'){busy=true;looping=false;abort=false;await buildFlow('power');spot(null);hide();busy=false}return}}
 // erfüllte Mission melden
 const i=curMain();if(i!=null&&!c.cl[i]&&safe(()=>done(i))&&!GAME.panel&&!(window.B2&&B2.placing)){c.seen['d'+i]=1;save();pose('cheer');await claimFx(i);
  // gleich die nächste Mission ankündigen
  const n2=curMain();if(n2!=null&&c.ch<CH.length&&c.seen['i'+c.ch]){delete c.seen['a'+n2]}return}
 // Nebenmissionen: automatisch abholen
 if(c.ch<CH.length&&!GAME.panel){const sm=CH.slice(0,c.ch+1).flatMap(x=>x.side).find(m=>!c.side[m.id]&&safe(m.c));if(sm){await claimSideFx(sm.id);return}}
 const n=curMain();if(n!=null&&c.seen['i'+c.ch]&&!c.seen['a'+n]){c.seen['a'+n]=1;save();const t=T(n);if(safe(()=>done(n))){looping=false;return}const w=await say(`Nächste Mission: „${t.t}“ – ${t.d}`,{p:'explain',until:()=>done(n),btns:GUIDE[n]?[['Zeig es mir','g'],['Selbst machen',null]]:[['Verstanden',null]]});hide();if(w==='g'){looping=false;return guide(n)}}
}finally{looping=false}}
setInterval(()=>{try{loop()}catch(e){}},1200);
// ---------- Sperren ----------
const LOCKSEL={research:'[data-p=research]',store:'[data-p=store]',cmd:'[data-p=cmd]',inv:'[data-p=inv]',yard:'[data-p=yard]',defense:'[data-p=defense]',system:'[data-v=system]',galaxy:'[data-v=galaxy]',fleet:'[data-v=fleet]',galacto:'[data-p=galacto]',ally:'[data-v=ally]',chat:'[data-v=chat]',rank:'[data-p=rank]'};
function applyLocks(){for(const f in LOCKSEL){const L=locked(f);document.querySelectorAll(`#rail ${LOCKSEL[f]},#nav ${LOCKSEL[f]},#topbtns ${LOCKSEL[f]}`).forEach(b=>{b.classList.toggle('cp-lock',L);if(L)b.dataset.lockch=FEAT[f];else delete b.dataset.lockch})}
 document.querySelectorAll('#panel [data-act=padbuild]').forEach(b=>{const id=b.dataset.id;const L=bLocked(id);const row=b.closest('.unitrow');if(L&&!b.dataset.cplock){b.dataset.cplock=1;b.disabled=true;b.innerHTML=`🔒 Kapitel ${BLOCK[id]}`;row&&row.classList.add('cp-lockrow')}})}
setInterval(()=>{if(!document.hidden){applyLocks();if(window.S||window.GAME)try{window.renderAries()}catch(e){}}},900);
document.addEventListener('click',e=>{const b=e.target.closest('.cp-lock');if(b){e.stopPropagation();e.preventDefault();const k=b.dataset.lockch;toast(`🔒 Freischaltung in Kapitel ${k}: ${CH[k-1].t}`,'',2600);return}
 const t=e.target.closest('[data-act]');if(!t)return;const a=t.dataset.act;
 if(a==='open'&&t.dataset.p==='rank'){S.flags.rankSeen=1}
 if(a==='cp-claim'){e.stopPropagation();const id=/^\d+$/.test(t.dataset.id)?+t.dataset.id:t.dataset.id;claimFx(id)}
 if(a==='cp-side'){e.stopPropagation();claimSideFx(t.dataset.id)}
 if(a==='cp-guide'){e.stopPropagation();const id=/^\d+$/.test(t.dataset.id)?+t.dataset.id:t.dataset.id;guide(id)}
 if(a==='cp-restart'){e.stopPropagation();init();const c=C();c.skip=0;abort=true;busy=false;looping=false;spot(null);hide();if(c.ch<CH.length){delete c.seen['i'+c.ch];CH[c.ch].main.forEach(k=>{delete c.seen['a'+k];delete c.seen['d'+k]})}save();closePanelSafe();renderAll();toast('Tutorial startet neu – Kapitel '+(c.ch+1),'ok');setTimeout(()=>{abort=false;loop()},700);return}
 if(a==='cp-skip'){e.stopPropagation();init();S.camp.skip=S.camp.skip?0:1;abort=true;busy=false;looping=false;spot(null);save();hide();if(!S.camp.skip){const n=curMain();if(n!=null){delete S.camp.seen['a'+n];delete S.camp.seen['d'+n]}save()}setTimeout(()=>{abort=false;if(!S.camp.skip){closePanelSafe();loop()}},600);renderAll();if(GAME.panel)renderPanel(true);toast(S.camp.skip?'Tutorial übersprungen – alle Funktionen frei':'Tutorial wieder aktiv','ok')}
},true);
// Nebel-Zähler
E.on&&E.on((ev)=>{});
const _sf=E.send;if(_sf)E.send=function(...a){const r=_sf.apply(this,a);if(!r&&a[3]==='explore')S.flags.nebN=(S.flags.nebN||0)+1;return r};
// Einstellungen: Tutorial überspringen
const _st=PANELS.settings;PANELS.settings=()=>{const r=_st();init();r[1]=`<div class="box" style="margin-bottom:8px"><div class="row"><b>Kampagne / Tutorial</b><span class="spacer"></span><button class="btn sm ${S.camp.skip?'':'ghost'}" data-act="cp-skip">${S.camp.skip?'Tutorial fortsetzen':'Tutorial überspringen'}</button></div><div class="mut" style="font-size:11px">${S.camp.skip?'Alle Funktionen frei, Aries ist stumm.':'Überspringen schaltet sofort alle Funktionen frei. Missionen und Belohnungen bleiben im Missionslog abholbar.'}</div></div>`+r[1];return r};
async function claimFx(i){const c=C();if(c.cl[i]||!safe(()=>done(i)))return err('Mission noch nicht erfüllt');if(window.RWD){const ok=await RWD.flow(scaleR(T(i).r),T(i).t);if(!ok)return;err(claim(i,true))}else err(claim(i));if(GAME.panel)renderPanel(true)}
async function claimSideFx(id){const c=C();const m=CH.flatMap(x=>x.side).find(x=>x.id===id);if(!m||c.side[id]||!m.c())return err('Noch nicht erfüllt');if(window.RWD){const ok=await RWD.flow(scaleR(m.r,0.5),'Nebenmission: '+m.t);if(!ok)return;err(claimSide(id,true))}else err(claimSide(id));if(GAME.panel)renderPanel(true)}
window.CAMP.claimFx=claimFx;
window.CAMP.init=init;window.CAMP.claim=claim;window.CAMP.loop=loop;
})();
