// v22 Story-Kampagne mit Aries (Kapitel, Haupt-/Nebenmissionen, Freischaltungen, Hologramm-Guide mit Spotlight)
(function(){
// Progression v1 (2026-10): Tutorial T01–T24 mit bedarfsorientierten Zuschüssen, Freischaltungen nach Bedingungen,
// danach parallele Kampagnenstränge. Belohnung R = floor(min(Anteil·C, max(0, C − Vorrat))) über die Kosten der nächsten zwei Aufgaben.
const home=()=>S.planets[S.home];
const mB=o=>Object.entries(o).every(([k,v])=>E.maxB(k)>=v);const eBal=()=>{const pi=E.prodInfo(home());return pi.eProd>=pi.eUse};
const bu=(id,n)=>(S.built[id]||0)>=n;
// R: B=Gebäude (Heimatwelt bzw. max), T=Forschung, U=selbst gebaute Einheiten; p=Zuschussanteil; f=feste Belohnung
// Review V2 (B1): Grundausbildung endet nach der Rückkehr der sicheren Trainingserkundung; danach frei wählbare Aufbaupfade.
// Zuschussstaffel 65/60/55/50/45 → Pfade 40/35/30/25 %, beim Freischalten festgeschrieben (B2).
const TT=[
 {id:'T01',g:'basic',t:'Willkommen, Kommandant',d:'Öffne die Einführung: Metall, Kristall, Gas und Energie – dein Startvorrat (1.000/1.000/250) und zwei 10-Minuten-Gutscheine.',c:()=>true,f:{}},
 {id:'T02',g:'basic',t:'Erste Minen',d:'Metallmine 1 und Kristallmine 1. Produktion läuft auch offline weiter.',R:{B:{metal_mine:1,crystal_mine:1}},p:.65},
 {id:'T03',g:'basic',t:'Strom',d:'Kraftwerk auf Stufe 2 – Minen brauchen Energie.',R:{B:{power:2}},p:.65},
 {id:'T04',g:'basic',t:'Gas',d:'Gasförderung 1: Gas brauchst du für Forschung und Flüge.',R:{B:{gas_mine:1}},p:.65},
 {id:'T05',g:'basic',t:'Produktionsregler',d:'Ändere einmal einen Produktionsregler und stelle ihn wieder auf 100 %.',c:()=>!!S.flags.pctTouched&&S.order.every(id=>{const p=S.planets[id];return p.moon||Object.values(p.pct||{}).every(v=>v===100)}),f:{}},
 {id:'T07',g:'basic',t:'Solide Basis',d:'Metallmine 4, Kristallmine 3, Gasförderung 2 – mit positiver Energie. Nutze Wartezeiten für den nächsten bezahlbaren Ausbau.',R:{B:{metal_mine:4,crystal_mine:3,gas_mine:2}},c:()=>mB({metal_mine:4,crystal_mine:3,gas_mine:2})&&eBal(),p:.60},
 {id:'B01',g:'basic',t:'Bau & Forschung',d:'Roboterfabrik 1, Forschungslabor 1 und Energietechnik 1.',R:{B:{robotics:1,lab:1},T:{energy:1}},p:.55},
 {id:'B02',g:'basic',t:'Werft & Antrieb',d:'Roboterfabrik 2, Raumschiffwerft 2 und Verbrennungstriebwerk 2.',R:{B:{robotics:2,shipyard:2},T:{combustion:2}},p:.50},
 {id:'T13',g:'basic',t:'Erster Frachter',d:'Baue selbst einen Kleinen Transporter.',R:{U:{sc:1}},p:.45},
 {id:'X01',g:'basic',t:'Trainingserkundung',d:'Schicke genau einen Kleinen Transporter in den Nebel deines Systems (Position 16) und warte die Rückkehr ab. Einmalig, sicher, ohne Astrophysik; zählt zu den 25 Starts.',c:()=>(S.flags.expBack||0)>=1,f:{}},
 // Pfad Aufklärung/Kampf
 {id:'T14',g:'fight',t:'Staffel',d:'Baue mindestens drei Leichte Jäger.',R:{U:{lf:3}},p:.40},
 {id:'T15',g:'fight',t:'Aufklärung vorbereiten',d:'Labor 3, Spionage 2, Werft 3, Verbrennung 3 und eine Spionagesonde.',R:{B:{lab:3,shipyard:3},T:{espionage:2,combustion:3},U:{pr:1}},p:.40},
 {id:'T16',g:'fight',t:'Spionage',d:'Spioniere den Trainings-NPC (Stufe 1) in deinem Sonnensystem aus.',c:()=>!!S.flags.spyDeportees,f:{}},
 {id:'T17',g:'fight',t:'Erster Angriff',d:'Greife den Trainings-NPC erfolgreich an und warte die Rückkehr ab.',c:()=>!!S.flags.trainWin,p:.35},
 // Pfad regulärer Nebel
 {id:'T18',g:'neb',t:'Astrophysik',d:'Für den regulären Nebel: Labor 3, Spionage 3 und Impulstriebwerk 2 (Voraussetzungen), dann Astrophysik 1.',R:{B:{lab:3},T:{espionage:3,impulse:2,astro:1}},p:.35},
 {id:'T19',g:'neb',t:'Erste reguläre Expedition',d:'Schicke eine Flotte in den Nebel (Position 16) und warte die Rückkehr ab. Ab jetzt gelten die normalen Nebelregeln.',c:()=>!!S.flags.expRegBack,f:{}},
 // Pfad Kolonisation
 {id:'T21',g:'col',t:'Kolonisation vorbereiten',d:'Werft 4, Impulstriebwerk 3 und Astrophysik 2.',R:{B:{shipyard:4},T:{impulse:3,astro:2}},p:.30},
 {id:'T22',g:'col',t:'Kolonieschiff',d:'Baue selbst ein Kolonieschiff.',R:{U:{co:1}},p:.25},
 {id:'T23',g:'col',t:'Neue Welt',d:'Gründe deine erste Kolonie (Startpaket 500 Metall, 300 Kristall, 100 Gas).',c:()=>E.colonies()>=1,f:{}},
 {id:'T24',g:'col',t:'Versorgung',d:'Ein eigener Transport bringt mindestens 1.000 Rohstoffe zu deiner Kolonie.',c:()=>!!S.flags.supply,f:{ships:{sc:1}}},
 // Wirtschafts-Empfehlung (kein Pflichtschritt)
 {id:'T20',g:'eco',t:'Nachhaltige Basis',d:'Empfehlung: Metallmine 10, Kristallmine 8, Gasförderung 6 mit genug Energie.',R:{B:{metal_mine:10,crystal_mine:8,gas_mine:6}},c:()=>mB({metal_mine:10,crystal_mine:8,gas_mine:6})&&eBal(),p:.30}];
const PATHS=[{k:'Aufklärung & Kampf',ic:'📡',g:'fight'},{k:'Regulärer Nebel',ic:'🌌',g:'neb'},{k:'Kolonisation',ic:'🌍',g:'col'},{k:'Wirtschaft (Empfehlung)',ic:'🏭',g:'eco'}];
const TI={};TT.forEach((x,i)=>{TI[x.id]=x;x.i=i});
const CH_OLD=[
 {t:'Ankunft',ic:'🪐',intro:'Willkommen auf deiner neuen Heimatwelt. Rohstoffe, Energie, Gas – wir legen das Fundament.',outro:'Minen, Strom und Lager laufen. Deine Kolonie lebt!',main:['T01','T02','T03','T04','T05','T06','T07','T08'],side:[],bonus:{}},
 {t:'Forschung',ic:'🔬',intro:'Wissen ist global: Forschung wirkt auf allen Planeten. Gebäude bleiben lokal.',outro:'Labor, Roboter und Werft stehen bereit.',main:['T09','T10','T11','T12'],side:[],bonus:{}},
 {t:'Flotte',ic:'🚀',intro:'Baue deine ersten Schiffe selbst – und lerne Spionage und Kampf an einem Trainingsziel.',outro:'Dein erster Sieg! Die Flotte ist zurück.',main:['T13','T14','T15','T16','T17'],side:[],bonus:{}},
 {t:'Raumfahrt',ic:'🌌',intro:'Astrophysik öffnet den Nebel – und später neue Kolonien.',outro:'Die Basis trägt. Zeit für eine zweite Welt.',main:['T18','T19','T20','T21'],side:[],bonus:{}},
 {t:'Erste Kolonie',ic:'🌍',intro:'Ein Planet allein ist zu klein. Gründe eine Kolonie und versorge sie.',outro:'Tutorial abgeschlossen! Bauschleife jetzt 1 aktiv + 3 vorgemerkt – und ein Kleiner Transporter extra.',main:['T22','T23','T24'],side:[],bonus:{}}];
// Kampagnenstränge nach dem Tutorial (parallel, kleine feste Belohnungen ohne Rohstoffe)
const CH=[
 {t:'Grundwirtschaft',ic:'🪐',intro:'Willkommen auf deiner neuen Heimatwelt. Minen, Strom, Gas – wir legen das Fundament.',outro:'Die Grundwirtschaft läuft.',main:['T01','T02','T03','T04','T05','T07'],side:[],bonus:{}},
 {t:'Bau & Forschung',ic:'🔬',intro:'Roboter, Labor und Werft – Forschung wirkt auf allen Planeten.',outro:'Werft und Antrieb stehen bereit.',main:['B01','B02'],side:[],bonus:{}},
 {t:'Erste Transportfähigkeit',ic:'🚀',intro:'Baue deinen ersten Frachter und schicke ihn auf eine sichere Trainingserkundung.',outro:'Grundausbildung abgeschlossen! Bauschleife jetzt 1 aktiv + 3 vorgemerkt. Wähle frei: Aufklärung, Nebel oder Kolonisation.',main:['T13','X01'],side:[],bonus:{}}];
const STR=[
 {k:'Kolonien',ic:'🌍',m:[{id:'k1',t:'Kolonie ausbauen',d:'Auf einer Kolonie: Metallmine 6, Kristallmine 5, Gasförderung 3.',c:()=>S.order.some(id=>id!==S.home&&!S.planets[id].moon&&E.lv(S.planets[id],'metal_mine')>=6&&E.lv(S.planets[id],'crystal_mine')>=5&&E.lv(S.planets[id],'gas_mine')>=3),r:{dm:5}},
  {id:'k2',t:'Drei Welten',d:'Besitze 3 Planeten.',c:()=>E.colonies()>=2,r:{dm:8}},{id:'k3',t:'Vier Welten',d:'Besitze 4 Planeten.',c:()=>E.colonies()>=3,r:{dm:10}}]},
 {k:'Aufklärung',ic:'📡',m:[{id:'a1',t:'Radar',d:'Baue eine Radaranlage.',c:()=>E.maxB('radar')>=1,r:{dm:5}},{id:'a2',t:'Saveflug',d:'Bringe deine Flotte vor einem Piratenangriff in Sicherheit.',c:()=>!!S.flags.fleetSaved,r:{dm:5}}]},
 {k:'Industrie',ic:'🏭',m:[{id:'i1',t:'Automatisierung',d:'Roboterfabrik 8 und Computertechnik 8.',c:()=>E.maxB('robotics')>=8&&E.tl('computer')>=8,r:{dm:8}},{id:'i2',t:'Naniten',d:'Baue die Nanitenfabrik.',c:()=>E.maxB('nanite')>=1,r:{dm:15}}]},
 {k:'Forschung',ic:'🔬',m:[{id:'f1',t:'Labor 6',d:'Forschungslabor Stufe 6.',c:()=>E.maxB('lab')>=6,r:{dm:5}},{id:'f2',t:'Labor 8',d:'Forschungslabor Stufe 8.',c:()=>E.maxB('lab')>=8,r:{dm:8}},{id:'f3',t:'Ionen & Hyperraum',d:'Ionentechnik 1 und Hyperraumtechnik 1.',c:()=>E.tl('ion')>=1&&E.tl('hyper')>=1,r:{dm:8}},{id:'f4',t:'Plasma',d:'Plasmatechnik 1.',c:()=>E.tl('plasma')>=1,r:{dm:10}}]},
 {k:'Galactonit',ic:'💎',m:[{id:'g1',t:'Forschungszentrum',d:'Baue das Galactonit-Forschungszentrum. Belohnung: dein einziger geschenkter Galactonit-Stein.',c:()=>E.maxB('galacto')>=1,r:{dm:5,gal:1}},{id:'g2',t:'Trümmer & Monde',d:'Öffne „Was ist Galactonit?“ und lerne, wie PvP-Trümmerfelder Steine und Monde bringen.',c:()=>!!S.flags.galinfo,r:{dm:3}},{id:'g3',t:'Erster Kern',d:'Sammle 5 Steine aus PvP-Kämpfen und setze einen Galactonit-Kern ein (Langzeitziel).',c:()=>!!S.flags.fused,r:{dm:10}}]},
 {k:'Flottenmacht',ic:'⚔️',m:[{id:'s1',t:'Kreuzer',d:'Baue einen Kreuzer.',c:()=>(S.built.cr||0)>=1,r:{dm:5}},{id:'s2',t:'Schlachtflotte',d:'Baue insgesamt 10 Schlachtschiffe.',c:()=>(S.built.bs||0)>=10,r:{dm:15}}]},
 {k:'Raum',ic:'🪐',m:[{id:'r1',t:'Terraformer',d:'Baue einen Terraformer (+5 Felder je Stufe).',c:()=>E.maxB('terraformer')>=1,r:{dm:10}}]},
 {k:'Gemeinschaft',ic:'🤝',m:[{id:'c1',t:'Allianz',d:'Gründe oder betritt eine Allianz.',c:()=>!!S.ally,r:{dm:5}},{id:'c2',t:'Ruhmeshalle',d:'Öffne die Rangliste.',c:()=>!!S.flags.rankSeen,r:{dm:2}}]}];
const STRM={};STR.forEach(x=>x.m.forEach(m=>{STRM[m.id]=m;m.k=x.k}));
// ---------- Bedarfsrechnung ----------
const qB=(id)=>{const p=home();return Math.max(E.lv(p,id),...p.bq.filter(q=>q.id===id&&!q.demo).map(q=>q.lv))};
const qT=id=>Math.max(E.tl(id),S.rq&&S.rq.id===id?S.rq.lv:0);
function needCost(R){const c=[0,0,0];const B={},Tn={};const addB=(k,n)=>{if(GE.TECH[k])return addT(k,n);if((B[k]||0)<n){B[k]=n;const d=GE.BUILD[k];if(d&&d.req)for(const r in d.req)(GE.TECH[r]?addT:addB)(r,d.req[r])}};
 const addT=(k,n)=>{if((Tn[k]||0)>=n)return;Tn[k]=n;const d=GE.TECH[k];if(!d)return;for(let L=1;L<=n;L++){addB('lab',E.techLabNeed(L,k))}if(d.req)for(const r in d.req)(GE.TECH[r]?addT:addB)(r,d.req[r])};
 for(const k in R.B||{})addB(k,R.B[k]);for(const k in R.T||{})addT(k,R.T[k]);
 for(const k in R.U||{}){const d=GE.SHIP[k]||GE.DEF[k];const miss=Math.max(0,R.U[k]-(S.built[k]||0)-home().sq.filter(q=>q.id===k).reduce((a,q)=>a+q.n-q.done,0));for(let j=0;j<3;j++)c[j]+=miss*d.c[j];if(d.req)for(const r in d.req)(GE.TECH[r]?addT:addB)(r,d.req[r])}
 for(const k in B){if(!GE.BUILD[k])continue;for(let L=qB(k)+1;L<=B[k];L++){const x=E.bCost(k,L);for(let j=0;j<3;j++)c[j]+=x[j]}}
 for(const k in Tn){for(let L=qT(k)+1;L<=Tn[k];L++){const x=E.tCost(k,L);for(let j=0;j<3;j++)c[j]+=x[j]}}return c}
function storeFor(id){const R=TI[id].R;const cap=E.storeCap(home());for(const k in R.B||{})for(let L=qB(k)+1;L<=R.B[k];L++)if(E.bCost(k,L).some(v=>v>cap))return false;for(const k in R.T||{})for(let L=qT(k)+1;L<=R.T[k];L++)if(E.tCost(k,L).some(v=>v>cap))return false;return true}
function nextTwo(i){const c=C();const o=[];const g=TI[i].g;for(let j=TI[i].i+1;j<TT.length&&o.length<2;j++)if(TT[j].g===g&&!c.cl[TT[j].id])o.push(TT[j]);return o}
// Review B2: Zuschuss = Anteil × fehlende eindeutige Kosten der nächsten zwei Schritte (gemeinsame Voraussetzungen einmal), beim Freischalten festgeschrieben
function tReward(i){const x=TI[i];if(x.f)return Object.assign({},x.f);const M={B:{},T:{},U:{}};for(const n of nextTwo(i))if(n.R)for(const k of['B','T','U'])for(const id in n.R[k]||{})M[k][id]=Math.max(M[k][id]||0,n.R[k][id]);
 const C2=needCost(M);const o={};['m','k','g'].forEach((k,j)=>{const v=Math.floor(x.p*C2[j]);if(v>0)o[k]=v});return o}
const T=i=>TI[i]||STRM[i]||{t:String(i),d:'',c:()=>false};
// Fortschritt je Mission (für Aries-Panel)
function prog(i){const x=TI[i];const P=x&&x.R;if(!P){const d=safe(()=>done(i));return{cur:d?1:0,max:1,parts:[]}}let cur=0,max=0;const parts=[];
 const add=(n,h,need)=>{cur+=Math.min(h,need);max+=need;parts.push({n,h:Math.min(h,need),need})};
 for(const k in P.B||{})add(GE.BUILD[k].n,E.maxB(k),P.B[k]);for(const k in P.T||{})add(GE.TECH[k].n,E.tl(k),P.T[k]);
 for(const k in P.U||{})add((GE.SHIP[k]||GE.DEF[k]).n,S.built[k]||0,P.U[k]);return{cur,max,parts}}
window.CAMP_PROG=prog;window.CAMP_SCALE=r=>r;
const doneR=R=>{for(const k in R.B||{})if(E.maxB(k)<R.B[k])return false;for(const k in R.T||{})if(E.tl(k)<R.T[k])return false;for(const k in R.U||{})if((S.built[k]||0)<R.U[k])return false;return true};
const done=i=>{const x=TI[i];if(x)return x.c?x.c():doneR(x.R);const m=STRM[i];return !!(m&&m.c())};
// Freischaltungen nach Bedingungen (nicht nach Kapiteln)
const FEATN={research:'Forschung',yard:'Werft',defense:'Abwehr',system:'Sonnensystem',galaxy:'Galaxie',fleet:'Flotte',galacto:'Galactonit',ally:'Allianz',chat:'Chat',rank:'Rangliste'};
const FEATH={research:'Baue ein Forschungslabor.',yard:'Baue eine Raumschiffwerft.',defense:'Baue eine Raumschiffwerft.',fleet:'Baue eine Raumschiffwerft.',system:'Schließe Aufgabe „Werft & Antrieb“ ab.',galaxy:'Schließe Aufgabe „Werft & Antrieb“ ab.',galacto:'Nach dem Tutorial.',ally:'Schließe Aufgabe „Solide Basis“ ab.',chat:'Schließe Aufgabe „Solide Basis“ ab.',rank:'Schließe Aufgabe „Solide Basis“ ab.'};
const FEATC={research:()=>E.maxB('lab')>=1,yard:()=>E.maxB('shipyard')>=1,defense:()=>E.maxB('shipyard')>=1,fleet:()=>E.maxB('shipyard')>=1||S.order.some(id=>Object.keys(S.planets[id].ships||{}).some(k=>k!=='ss'&&S.planets[id].ships[k]>0)),
 system:()=>!!C().cl.B02,galaxy:()=>!!C().cl.B02,galacto:()=>E.tutDone(),ally:()=>!!C().cl.T07,chat:()=>!!C().cl.T07,rank:()=>!!C().cl.T07};
const BLOCKC={galacto:()=>E.tutDone()};
const FEAT={},BLOCK={galacto:'Tutorial'};
window.CAMP={CH,FEAT,BLOCK,TT,STR,reward:i=>tReward(i)};
const C=()=>S.camp;
function init(){if(S.camp&&S.camp.rv2){if(!S.camp.rv3)migrateV3c();return}migrateV2c();migrateV3c()}
function safe(f){try{return f()}catch(e){return false}}
// Migration alter Kampagnen: erledigten Fortschritt behalten, keine rückwirkenden Belohnungen
function migrateV2c(){const old=S.camp;const c={ch:0,cl:{},side:{},seen:{},skip:old?old.skip||0:0,rv2:1,rs:{}};S.camp=c;
 const veteran=!!old||(S.task||0)>0;
 if(veteran){let last=-1;TT.forEach((x,j)=>{if(safe(()=>done(x.id)))last=j});
  const oc=old&&old.cl||{};if(oc[15]||S.flags.spyDeportees)last=Math.max(last,TI.T16.i);if((S.flags.npcWins||0)>0)last=Math.max(last,TI.T17.i);if(S.flags.nebula)last=Math.max(last,TI.T19.i);if(S.flags.transportCol)last=Math.max(last,TI.T24.i);
  for(let j=0;j<=last;j++)c.cl[TT[j].id]=1;
  if(old){if(old.wk)c.wk=old.wk;if(old.cl&&old.cl.rank)c.side.c2=1}
  if(c.cl.T24)S.flags.tutDone=1;
  // bereits erledigte Kampagnenstränge still als abgeholt markieren (keine Nachzahlung)
  for(const id in STRM)if(safe(()=>STRM[id].c()))c.side[id]=1}
 c.ch=chapterFrom(c);for(let k=0;k<c.ch;k++){c.seen['i'+k]=1;c.seen['o'+k]=1}if(c.ch>=CH.length)c.seen.fin=1;try{save()}catch(e){}}
// Review V2: alte Kapitel (T06/T08–T12) auf die neue Grundausbildung abbilden; nichts zurücknehmen, keine Nachzahlung
function migrateV3c(){const c=S.camp;if(!c||c.rv3)return;c.rv3=1;const cl=c.cl||(c.cl={});const was=k=>!!cl[k];
 if(!cl.B01&&(was('T11')||(was('T06')&&was('T09')&&was('T10'))||was('T12')||was('T13')))cl.B01=1;if(!cl.B02&&(was('T12')||was('T13')))cl.B02=1;
 if(!cl.X01&&(was('T19')||was('T24')||(S.flags.expBack||0)>=1&&was('T13')))cl.X01=1;
 if(cl.X01||S.flags.tutDone){if(!S.flags.tutDone){S.flags.tutDone=1}if(!S.flags.tutEnd)S.flags.tutEnd=S.created||S.t||Date.now();for(const x of TT)if(x.g==='basic')cl[x.id]=1}
 c.ch=chapterFrom(c);for(let k=0;k<c.ch;k++){c.seen['i'+k]=1;c.seen['o'+k]=1}if(c.ch>=CH.length)c.seen.fin=1;try{save()}catch(e){}}
function chapterFrom(c){for(let k=0;k<CH.length;k++)if(CH[k].main.some(i=>!c.cl[i]))return k;return CH.length}
const free=()=>!S.camp||S.camp.skip||S.camp.ch>=CH.length;
const locked=f=>!(S.camp&&S.camp.skip)&&!E.tutDone()&&FEATC[f]&&!safe(FEATC[f]);
const bLocked=id=>!(S.camp&&S.camp.skip)&&BLOCKC[id]&&!safe(BLOCKC[id]);
window.CAMP.locked=locked;window.CAMP.bLocked=bLocked;
function curMain(){const c=C();if(!c||c.ch>=CH.length)return null;return CH[c.ch].main.find(i=>!c.cl[i])}
const rwOf=i=>{if(TI[i]){const c=C();if(!c.rs[i]&&!c.cl[i])c.rs[i]=tReward(i);return c.rs[i]||tReward(i)}return STRM[i]?STRM[i].r:{}};
function claim(i,paid){const c=C();if(c.cl[i]||!safe(()=>done(i)))return 'Mission noch nicht erfüllt';const r=rwOf(i);c.rs[i]=r;if(!paid)E.giveReward(r,'c:'+i);c.cl[i]=1;
 if(i==='X01'&&!S.flags.tutDone){S.flags.tutDone=1;S.flags.tutEnd=Date.now()}
 (E.addLog||(()=>{}))(`Aries: Mission „${T(i).t}“ abgeschlossen`+(E.rewardText(r)?' – Belohnung erhalten!':''),'task');if(!paid&&E.rewardText(r))toast('Belohnung: '+E.rewardText(r),'ok',3500);
 const ch=CH[c.ch];if(ch&&ch.main.every(k=>c.cl[k])){c.seen['o'+c.ch]=0;c.ch++;if(c.ch<CH.length)c.seen['i'+c.ch]=0}
 save();renderAll();return null}
function claimSide(id,paid){const c=C();const m=STRM[id];if(!m||c.side[id]||!m.c())return 'Noch nicht erfüllt';if(!paid)E.giveReward(m.r,'c:'+id);c.side[id]=1;toast('Kampagne: '+E.rewardText(m.r),'ok',3500);save();renderAll();return null}
// ---------- Missionslog ----------
const rw=r=>`<span class="cp-rw">${E.rewardText(r)}</span>`;
const vBtns=()=>S.voucher>0?`<div class="box" style="margin:6px 0"><b>⚡ Beschleunigungsgutschein</b> <span class="mut">(${S.voucher}× · bis 10 Min.)</span><div class="row" style="gap:6px;margin-top:6px"><button class="btn sm" data-act="cp-vb">Für aktuellen Bau</button><button class="btn sm ghost" data-act="cp-vr">Für Forschung</button></div></div>`:'';
function pathRows(){const c=C();return`<div class="cp-sub">Aufbaupfade <span class="mut">· frei wählbar</span></div>`+PATHS.map(P=>{const L=TT.filter(x=>x.g===P.g);const open=L.filter(x=>!c.cl[x.id]);const m=open[0];const d=m&&safe(()=>done(m.id));
 return`<div class="cp-m side ${m?'':'cl'}"><div class="cp-mi">${m?(d?'!':P.ic):'✓'}</div><div class="ft"><b>${esc(P.k)}${m?': '+esc(m.t):''}</b><div>${m?esc(m.d):'Pfad abgeschlossen'} <span class="mut">(${L.length-open.length}/${L.length})</span></div>${m?rw(rwOf(m.id)):''}</div>${m?(d?`<button class="btn sm green" data-act="cp-claim" data-id="${m.id}">Abholen</button>`:GUIDE[m.id]?`<button class="btn sm ghost" data-act="cp-guide" data-id="${m.id}">Zeig es mir</button>`:''):''}</div>`}).join('')}
window.CAMP.PATHS=PATHS;
function strandRows(){const c=C();return`<div class="cp-sub">Kampagnenstränge</div>`+STR.map(x=>{const open=x.m.filter(m=>!c.side[m.id]);const m=open[0];return`<div class="cp-m side ${m?'':'cl'}"><div class="cp-mi">${m?(safe(m.c)?'!':x.ic):'✓'}</div><div class="ft"><b>${esc(x.k)}${m?': '+esc(m.t):''}</b><div>${m?esc(m.d):'Strang abgeschlossen'} <span class="mut">(${x.m.length-open.length}/${x.m.length})</span></div>${m?rw(m.r):''}</div>${m&&safe(m.c)?`<button class="btn sm green" data-act="cp-side" data-id="${m.id}">Abholen</button>`:''}</div>`}).join('')}
PANELS.camp=()=>{init();const c=C();let h=`<div class="cp-head">${holo('p3','cp-av')}<div><div class="cp-k">${free()?'Kampagne':`Tutorial · Kapitel ${c.ch+1} von ${CH.length}`}</div><b>${free()?'Das Universum gehört dir':CH[c.ch].t}</b><div class="cp-prog"><i style="width:${Math.round(TT.filter(x=>c.cl[x.id]).length/TT.length*100)}%"></i></div></div></div>`+vBtns();
 CH.forEach((ch,k)=>{const st=k<c.ch?'done':k===c.ch?'cur':'todo';
  h+=`<div class="cp-ch ${st}"><div class="cp-cht"><span class="cp-n">${st==='done'?'✓':k+1}</span>${ch.ic} ${esc(ch.t)}<span class="spacer"></span><span class="mut">${ch.main.filter(i=>c.cl[i]).length+'/'+ch.main.length}</span></div>`;
  if(st==='cur'||(st==='done'&&k===c.ch-1&&c.ch<CH.length)){
   h+=ch.main.map(i=>{const t=T(i),cl=c.cl[i],d=!cl&&safe(()=>done(i)),cur=i===curMain();return`<div class="cp-m ${cl?'cl':''} ${cur?'cur':''}"><div class="cp-mi">${cl?'✓':d?'!':'•'}</div><div class="ft"><b>${t.id} · ${esc(t.t)}</b><div>${esc(t.d)}</div>${cl?'':rw(rwOf(i))}</div>${cl?'':d?`<button class="btn sm green" data-act="cp-claim" data-id="${i}">Abholen</button>`:cur&&GUIDE[i]?`<button class="btn sm ghost" data-act="cp-guide" data-id="${i}">Zeig es mir</button>`:''}</div>`}).join('')}
  h+='</div>'});
 if(E.tutDone()||free())h+=pathRows()+strandRows();
 if(c.ch>=3||free())h+=`<div class="cp-sub">Wissen</div><div class="cp-m side"><div class="cp-mi">📘</div><div class="ft"><b>Planeten-Guide</b><div>Bauplätze, Temperatur und ihre Wirkung auf Gas und Energie – nach Position.</div></div><button class="btn sm ghost" data-act="open" data-p="pguide">Lesen</button></div>`;
 h+=`<div class="cp-sub">Tutorial</div><div class="row" style="gap:6px;margin:4px 0 8px"><button class="btn sm ghost" data-act="cp-restart">↻ Kapitel-Tutorial neu starten</button>${c.skip?'<button class="btn sm" data-act="cp-skip">Tutorial fortsetzen</button>':''}</div>`;
 return['Missionslog',`<div class="camp">${h}</div>`]};
PANELS.tasks=PANELS.camp;
// v26: Wochenziele (nach Kapitel 7 / im freien Spiel) – drei Ziele je Spielwoche, relativ zum Stand bei Wochenbeginn
// Review V2 (B3): genau drei Ziele je Woche aus Wirtschaft / Erkundung / Logistik-Kampf, alle ohne PvP erfüllbar, 3–5 DM.
// Gezählt wird nur selbst bezahlter, abgeschlossener Fortschritt (keine Funde, kein Abriss/Neubau, Werft nach Bauwert statt Stückzahl).
const PG=()=>S.prog||{b:0,t:0,u:0,bv:0};
const WK_DEF=[
 {id:'bl',cat:0,t:'Baumeister',d:n=>`Schließe ${n} bezahlte Gebäudestufen ab.`,n:[6,10,14],v:()=>PG().b||0,r:{dm:4}},
 {id:'rs',cat:0,t:'Wissensdurst',d:n=>`Schließe ${n} Forschungsstufen ab.`,n:[3,4,6],v:()=>PG().t||0,r:{dm:4}},
 {id:'nb',cat:1,t:'Nebelpilot',d:n=>`Schließe ${n} reguläre Nebel-Erkundungen ab.`,n:[5,8,12],v:()=>(S.nebL&&S.nebL.r)||0,r:{dm:4}},
 {id:'sh',cat:2,t:'Werftbetrieb',d:n=>`Baue Schiffe oder Verteidigung im Wert von ${E.fmtN?E.fmtN(n):n} Rohstoffen (selbst bezahlt).`,n:[20000,80000,250000],v:()=>PG().u||0,r:{dm:3}},
 {id:'pt',cat:2,t:'Aufstieg',d:n=>`Gewinne ${E.fmtN?E.fmtN(n):n} Entwicklungspunkte hinzu.`,n:[2000,5000,10000],v:()=>{const p=E.devPoints();return Math.floor(p.b+p.t)},r:{dm:5}}];
const WEEK=7*24*3600e3;
function wk(){const c=C();if(!c)return null;const w=Math.floor((S.t||Date.now())/WEEK);if(!c.wk||c.wk.w!==w||!c.wk.v2){const keep=c.wk&&c.wk.w===w?c.wk.cl||{}:{};const tier=Math.min(2,Math.floor((c.ch>=CH.length?1:0)+E.colonies()/3));const pick=[];let h=w;const pool=WK_DEF.slice();
  for(let cat=0;cat<3;cat++){const P=pool.filter(d=>d.cat===cat);h=(h*9301+49297)%233280;pick.push(P[h%P.length])}
  c.wk={w,v2:1,g:pick.map(d=>({id:d.id,n:d.n[tier],b:d.v()})),cl:keep};save()}return c.wk}
const wkShow=()=>{const c=C();return c&&E.tutDone()}; // Progression v1: Wochenziele ohne Rohstoffe
function wkRows(){const W=wk();if(!W)return'';const left=(W.w+1)*WEEK-(S.t||Date.now());
 return`<div class="cp-sub">Wochenziele <span class="mut">· noch ${Math.max(1,Math.ceil(left/864e5))} Tg.</span></div>`+W.g.map(g=>{const d=WK_DEF.find(x=>x.id===g.id);const p=Math.max(0,d.v()-g.b),ok=p>=g.n,cl=W.cl[g.id];
  return`<div class="cp-m side ${cl?'cl':''}"><div class="cp-mi">${cl?'✓':ok?'!':'⟳'}</div><div class="ft"><b>${esc(d.t)}</b><div>${esc(d.d(g.n))} <span class="mut">(${Math.min(p,g.n).toLocaleString('de-DE')}/${g.n.toLocaleString('de-DE')})</span></div>${rw(d.r)}</div>${cl?'':ok?`<button class="btn sm green" data-act="cp-week" data-id="${g.id}">Abholen</button>`:''}</div>`}).join('')}
const _cp=PANELS.camp;PANELS.camp=()=>{const r=_cp();if(wkShow())r[1]=r[1].replace('<div class="cp-sub">Tutorial</div>',wkRows()+'<div class="cp-sub">Tutorial</div>');return r};PANELS.tasks=PANELS.camp;
async function claimWeek(id){const W=wk();const g=W&&W.g.find(x=>x.id===id);if(!g||W.cl[id])return;const d=WK_DEF.find(x=>x.id===id);if(d.v()-g.b<g.n)return err('Noch nicht erfüllt');
 const r=d.r;E.giveReward(r,'w:'+W.w+':'+id);W.cl[id]=1;save();if(window.RWD)await RWD.flow(r,'Wochenziel: '+d.t,true);if(GAME.panel)renderPanel(true);renderAll()}
document.addEventListener('click',e=>{const t=e.target.closest('[data-act="cp-week"]');if(!t)return;e.stopPropagation();claimWeek(t.dataset.id)},true);
// ---------- HUD-Kachel ----------
window.renderAries=function(){init();const el=$('#aries');if(!el)return;const c=C();if(c.skip&&hshow&&!spotSel){if(pend){const f=pend;pend=null;f(null)}hide()}
 const i=curMain();const sOpen=c.ch>=CH.length?(TT.filter(x=>x.g!=='basic'&&!c.cl[x.id]).find(x=>safe(()=>done(x.id)))||TT.find(x=>x.g!=='basic'&&!c.cl[x.id])||STR.flatMap(x=>x.m).find(m=>!c.side[m.id])):null;const anyDone=c.ch<CH.length?CH[c.ch].main.some(k=>!c.cl[k]&&safe(()=>done(k))):!!(sOpen&&safe(()=>TI[sOpen.id]?done(sOpen.id):sOpen.c()));const pg=i!=null?prog(i):null;const pct=pg?Math.round(pg.cur/Math.max(1,pg.max)*100):100;
 setHTML(el,`<div class="ariescard glass ${anyDone?'done':''} ${c.skip?'muted':''}" data-act="open" data-p="aries" aria-label="Aries – aktuelle Mission">${A.img('aries','av')}<div style="min-width:0"><div class="at">${c.ch>=CH.length?'Kampagne':'Tutorial '+(i||'')}</div><div class="ad">${i!=null?esc(T(i).t):sOpen?esc(sOpen.t):'Wochenziele'}</div><div class="ap"><i style="width:${pct}%"></i></div></div></div>`)};
// v41: kompaktes Aries-Panel: aktuelles Kapitel + aktuelle Mission mit Fortschritt
PANELS.aries=()=>{init();const c=C();const i=curMain();let h=`<div class="cp-head">${holo('p3','cp-av')}<div><div class="cp-k">${c.ch>=CH.length?'Kampagne':`Tutorial · Kapitel ${c.ch+1} von ${CH.length}`}</div><b>${c.ch>=CH.length?'Das Universum gehört dir':esc(CH[c.ch].t)}</b>${c.ch<CH.length?`<div class="cp-prog"><i style="width:${Math.round(CH[c.ch].main.filter(k=>c.cl[k]).length/CH[c.ch].main.length*100)}%"></i></div><div class="mut" style="font-size:11px">${CH[c.ch].main.filter(k=>c.cl[k]).length}/${CH[c.ch].main.length} Missionen in diesem Kapitel</div>`:''}</div></div>`;
 if(i!=null){const t=T(i),pg=prog(i),d=safe(()=>done(i));
  h+=`<div class="box aq"><div class="cp-k">Aktuelle Mission</div><b>${t.id||''} · ${esc(t.t)}</b><div style="margin:3px 0 6px">${esc(t.d)}</div>
  <div class="aq-bar"><i style="width:${Math.round(pg.cur/Math.max(1,pg.max)*100)}%"></i><span>${pg.cur}/${pg.max}</span></div>
  ${pg.parts.length>1?`<div class="aq-parts">${pg.parts.map(x=>`<span class="${x.h>=x.need?'ok':''}">${x.h>=x.need?'✓':'•'} ${esc(x.n)} ${x.h}/${x.need}</span>`).join('')}</div>`:''}
  <div class="mut" style="margin-top:6px">${E.rewardText(rwOf(i))?'Belohnung: '+rw(rwOf(i)):'Keine Rohstoffbelohnung'}</div>
  <div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap">${d?`<button class="btn sm green" data-act="cp-claim" data-id="${i}">Belohnung abholen</button>`:GUIDE[i]?`<button class="btn sm" data-act="cp-guide" data-id="${i}">Zeig es mir</button>`:''}${c.skip?'<button class="btn sm ghost" data-act="cp-skip">Tutorial fortsetzen</button>':''}<button class="btn sm ghost" data-act="open" data-p="camp">Missionslog</button></div></div>`}
 else h+=pathRows()+strandRows()+`<div class="box">Grundausbildung abgeschlossen. Kampagnenstränge und Wochenziele findest du im Missionslog.<div class="row" style="margin-top:8px"><button class="btn sm ghost" data-act="open" data-p="camp">Missionslog</button></div></div>`;
 return['Aries',`<div class="camp">${vBtns()}${h}</div>`]};
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
function placeSpot(){if(!spotSel){document.querySelectorAll('.cp-target').forEach(e=>e.classList.remove('cp-target'));if(lastFit){lastFit='';H.style.bottom='';H.classList.remove('fitmini','nofig')}return}const el=typeof spotSel==='function'?spotSel():document.querySelector(spotSel);if(spotEl&&spotEl!==el)spotEl.classList.remove('cp-target');spotEl=el;if(el)el.classList.add('cp-target');if(!el){SP.classList.add('wait');return}SP.classList.remove('wait');
 const r=el.getBoundingClientRect();const pad=6;const hole=SP.querySelector('.sp-hole'),ring=SP.querySelector('.sp-ring'),ar=SP.querySelector('.sp-arrow');
 Object.assign(hole.style,{left:r.left-pad+'px',top:r.top-pad+'px',width:r.width+pad*2+'px',height:r.height+pad*2+'px'});for(const k of['left','top','width','height'])ring.style[k]=hole.style[k];
 const right=r.left+r.width/2>innerWidth/2;ar.style.left=(right?r.left-46:r.right+8)+'px';ar.style.top=r.top+r.height/2-16+'px';ar.classList.toggle('flip',right);
 // Aries weicht auf die andere Seite aus
 fitAries(r)}
// Aries + Sprechblase so platzieren, dass sie den Spotlight-Ausschnitt nie schneiden
let lastFit='';
function fitAries(r){const av=[r];
 // v44: im Platzierungsmodus auch Bestätigungsleiste, Geist und Zieh-Hinweis meiden
 if(window.B2&&B2.placing){for(const q of['#b2bar','#cp-drag.on .dg-ghost','#cp-drag.on .dg-hand']){const e=document.querySelector(q);if(e&&e.offsetParent!==null){const b=e.getBoundingClientRect();if(b.width)av.push(b)}}
  try{const P=B2.placing,c=B2.cam,rt=document.querySelector('#b2').getBoundingClientRect(),x=rt.left+c.x+P.x*c.s,y=rt.top+c.y+P.y*c.s,w=90*c.s+40;av.push({left:x-w,right:x+w,top:y-w*1.2,bottom:y+w*.6})}catch(e){}}
 const key=av.map(q=>[q.left,q.top,q.right,q.bottom].map(v=>Math.round(v/6)).join(':')).join('|')+','+[innerWidth,innerHeight,H.classList.contains('show'),H.classList.contains('mini')].join(',');if(key===lastFit)return;lastFit=key;
 const pad=10,holes=av.map(q=>({l:q.left-pad,t:q.top-pad,r:q.right+pad,b:q.bottom+pad})),hole=holes[0];
 const hit=el=>{if(getComputedStyle(el).display==='none')return false;const q=el.getBoundingClientRect();return holes.some(h=>!(q.right<h.l||q.left>h.r||q.bottom<h.t||q.top>h.b))};
 const fig=H.querySelector('.ah-fig'),bub=H.querySelector('.ah-bub');const nav=($('#nav')||{getBoundingClientRect:()=>({top:innerHeight})}).getBoundingClientRect().top;
 const cx=av.reduce((a,q)=>a+(q.left+q.right)/2,0)/av.length;
 const pref=cx<innerWidth*0.5?'right':'left',alt=pref==='right'?'left':'right';
 const cands=[[pref,null,0],[alt,null,0],[pref,null,1],[alt,null,1]];
 const top=Math.min(...holes.map(h=>h.t)),bot=Math.max(...holes.map(h=>h.b));
 const above=innerHeight-top+4,below=Math.max(4,innerHeight-bot-4-(bub.offsetHeight+10));
 for(const sd of[pref,alt])for(const m of[0,1]){cands.push([sd,above,m]);cands.push([sd,null,m,below])}
 // ganz oben (unter der Ressourcenleiste)
 for(const sd of[pref,alt])for(const m of[1,2])cands.push([sd,'top',m]);
 for(const sd of[pref,alt])cands.push([sd,null,2]);
 for(const [sd,bt,mini,bl] of cands){H.classList.toggle('right',sd==='right');H.classList.toggle('fitmini',mini>=1);H.classList.toggle('nofig',mini===2);
  let b=bt==='top'?innerHeight-H.offsetHeight-48:bt!=null?bt:bl!=null?bl:null;H.style.bottom=b!=null?Math.max(4,Math.min(innerHeight-60,b))+'px':'';
  const q=H.getBoundingClientRect();if(q.top<4&&b!=null)continue;
  if(!hit(bub)&&!hit(fig))return}
 H.classList.add('fitmini','nofig');H.style.bottom='';H.classList.toggle('right',pref==='right')}
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
  case 'speed':return['Der Bau läuft! Unter 30 Sekunden Restzeit ist das Fertigstellen gratis – tippe auf „Gratis fertigstellen“.','#panel [data-act=speed][data-k=sub]','point']}}
function buildFlow(id,open,tg){const tgt=tg||qLv(id)+1;let key=null;return new Promise(res=>{let iv=0;const fin=ok=>{clearInterval(iv);dragHint(false);spot(null);res(ok)};
 const tick=()=>{if(abort)return fin(false);const st=bStage(id,tgt,open);dragHint(st==='drag'||st==='blocked');if(st==='done')return fin(true);
  const t=bText(st,id);const k=st+'|'+t[0];if(k!==key){key=k;spot(t[1]);say(t[0],{p:t[2],btns:[['Überspringen','skip']]}).then(v=>{if(v==='skip')abort=true})}};
 iv=setInterval(tick,150);tick()})}
// Bau bis Stufe L (jede fehlende Stufe einzeln über das Menü), danach ggf. gratis fertigstellen
async function buildTo(id,L){while(qLv(id)<L){if(!await buildFlow(id))return false}
 const p=pl();const q=p.bq.find(x=>x.id===id);if(q&&E.lv(p,id)<L){if(q.end-Date.now()<=E.FREE_MS&&p.bq[0]===q){if(!await buildFlow(id,'speed',L))return false}}
 return true}
const GUIDE={
 T01:[['Deine Willkommensmission wartet. Tippe auf mein Bild.','#aries .ariescard',panelIs('aries'),{p:'pointdl'}],['Oben siehst du Metall, Kristall, Gas und Energie. Tippe auf „Belohnung abholen“ – du erhältst einen Beschleunigungsgutschein (10 Min.).','#panel [data-act=cp-claim][data-id="T01"]',()=>C().cl.T01]],
 T02:[['__build','metal_mine',1],['__build','crystal_mine',1]],T03:[['__build','power',2]],T04:[['__build','gas_mine',1]],
 T05:[['__open','gas_mine'],['Schiebe den Regler „Produktionsleistung“ auf einen anderen Wert …','#panel [data-act=pct]',()=>!!S.flags.pctTouched],['… und wieder zurück auf 100 %.','#panel [data-act=pct]',()=>done('T05')]],
 T06:[['__build','robotics',1]],T07:[['__build','metal_mine',4],['__build','crystal_mine',3],['__build','gas_mine',2]],T08:[['__build','store',1]],
 T09:[['__build','lab',1]],T10:[['__res','energy',1]],T11:[['__build','lab',2],['__build','robotics',2]],T12:[['__build','shipyard',2],['__res','combustion',2]],
 B01:[['__build','robotics',1],['__build','lab',1],['__res','energy',1]],B02:[['__build','robotics',2],['__build','shipyard',2],['__res','combustion',2]],
 T13:[['__unit','sc',1]],T14:[['__unit','lf',3]],T15:[['__build','lab',3],['__build','shipyard',3],['__res','espionage',2],['__res','combustion',3],['__unit','pr',1]],
 T16:[['Öffne das Sonnensystem. Der Trainings-NPC (Stufe 1) ist hier – wähle ihn und „Spionage“ mit einer Sonde.','#nav [data-v=system]',()=>document.querySelector('#v-system.active'),{p:'pointdl'}],['Tippe auf den NPC-Planeten und sende eine Spionagesonde.','__info',()=>true,{p:'explain'}]],
 T17:[['Der Spionagebericht zeigt: nur ein Raketenwerfer. Sende deine Leichten Jäger mit „Angriff“ und warte die Rückkehr ab.','#nav [data-v=system]',()=>document.querySelector('#v-system.active'),{p:'pointdl'}]],
 T18:[['__build','lab',3],['__res','espionage',3],['__res','impulse',2],['__res','astro',1]],
 X01:[['Schicke genau einen Kleinen Transporter über die Flotten-Ansicht in den Nebel (Position 16). Diese Trainingserkundung ist sicher und braucht keine Astrophysik.','#nav [data-v=fleet]',()=>document.querySelector('#v-fleet.active')]],
 T19:[['Schicke Schiffe über die Flotten-Ansicht in den Nebel (Position 16). Ab jetzt gelten die normalen Nebelregeln.','#nav [data-v=fleet]',()=>document.querySelector('#v-fleet.active')]],
 T20:[['__build','metal_mine',10],['__build','crystal_mine',8],['__build','gas_mine',6]],
 T21:[['__build','shipyard',4],['__res','impulse',3],['__res','astro',2]],
 T22:[['__unit','co',1]],
 T23:[['Bevor du kolonisierst: Öffne die System-Ansicht.','#nav [data-v=system]',()=>document.querySelector('#v-system.active'),{p:'pointdl'}],
  ['Tippe auf eine freie Position.',()=>{const o=document.querySelector('#sysstrip .orbit.empty');if(o&&!o.dataset.cps){o.dataset.cps=1;o.scrollIntoView({inline:'center',block:'nearest'})}return o},()=>!!document.querySelector('#pop'),{p:'point'}],
  ['__pg'],
  ['Tippe auf eine freie Position und wähle „Kolonisieren“ mit deinem Kolonieschiff. Deine erste Kolonie startet mit 500 Metall, 300 Kristall und 100 Gas.','__info',()=>true,{p:'explain'}]],
 T24:[['Schicke einen Transport mit mindestens 1.000 Rohstoffen zu deiner Kolonie (Flotte → Kolonie wählen → „Transport“).','#nav [data-v=fleet]',()=>document.querySelector('#v-fleet.active')]]
};
async function resFlow(id,L){while(qT(id)<L){if(S.rq&&S.rq.id!==id){await say(`Gerade läuft schon eine Forschung. Sobald sie fertig ist, erforsche „${GE.TECH[id].n}“.`,{p:'think',btns:[['Verstanden',null]]});return false}
  if(S.rq)return true;if(!panelIs('research')()){if(!await step('Hier geht es zur Forschung.','#rail [data-p=research]',panelIs('research')))return false}
  const er=E.canResearch(pl(),id);if(!await step(er?`„${GE.TECH[id].n}“ geht gerade noch nicht: ${er}`:`Erforsche „${GE.TECH[id].n}“.`,()=>{const e=document.querySelector(`#panel [data-act=research][data-id="${id}"]`);if(e&&!e.dataset.cps){e.dataset.cps=1;e.scrollIntoView({block:'nearest'})}return e},()=>qT(id)>=L||!!S.rq))return false}return true}
async function unitFlow(id,n){const have=()=>(S.built[id]||0)+pl().sq.filter(q=>q.id===id).reduce((a,q)=>a+q.n-q.done,0);if(have()>=n)return true;
 if(!panelIs('yard')()){if(!await step('Öffne die Raumschiffwerft.','#rail [data-p=yard]',panelIs('yard')))return false}
 return await step(`Gib bei „${GE.SHIP[id].n}“ die Anzahl ${n-have()} ein und tippe auf „Bauen“.`,()=>{const e=document.querySelector(`#panel #u_${id}`);const row=e&&e.closest('.unitrow');if(row&&!row.dataset.cps){row.dataset.cps=1;row.scrollIntoView({block:'nearest'})}return row},()=>have()>=n)}
window.CAMP.GUIDE=GUIDE;
async function pgSeq(){const pop=document.querySelector('#pop .pi-box');if(pop){spot('#pop .pi-box')}
 let v=await say('Jede Position hat zwei Werte: Bauplätze – wie viele Gebäudestufen hineinpassen – und die Temperatur.',{p:'explain',btns:[['Weiter',null],['Überspringen','skip']]});if(v==='skip'){abort=true;return}
 v=await say('Die Temperatur verändert deine Wirtschaft: Kalte Planeten fördern mehr Gas, heiße liefern mehr Energie aus Solarsatelliten.',{p:'think',btns:[['Weiter',null],['Überspringen','skip']]});if(v==='skip'){abort=true;return}
 spot(null);hide();const p=document.querySelector('#pop');const pn=p&&(p.querySelector('h4 .mut')||{}).textContent;const hl=pn?+pn.split(':')[2]:0;if(typeof closePop==='function')closePop();
 await card(`<div class="cc-k">Wissen</div><div class="cc-t">🪐 Planeten-Guide</div>${PI.guideHTML(hl)}<button class="btn" data-cc style="margin-top:10px">Verstanden</button>`,'wide')}
window.CAMP.pgSeq=pgSeq;
async function guide(i){if(busy)return;busy=true;abort=false;closePanelSafe();const g=GUIDE[i]||[];
 for(const s of g){if(s[0]==='__build'){if(!await buildTo(s[1],s[2]))break;continue}if(s[0]==='__res'){if(!await resFlow(s[1],s[2]))break;continue}if(s[0]==='__unit'){if(!await unitFlow(s[1],s[2]))break;continue}if(s[0]==='__open'){if(!await buildFlow(s[1],true))break;continue}if(s[0]==='__pg'){S.camp.seen.pg=1;save();await pgSeq();if(abort)break;continue}if(s[0]==='__info2'){spot(null);await say(s[1],{p:'explain'});continue}if(s[1]==='__info'){spot(null);await say(s[0],{p:'explain',btns:[['Verstanden',null]]});continue}if(!await step(...s))break}
 spot(null);const c=C();if(!abort&&!c.cl[i]&&safe(()=>done(i))){c.seen['d'+i]=1;hide();closePanelSafe();pose('cheer');await claimFx(i)}hide();busy=false;setTimeout(loop,300)}
function closePanelSafe(){if(window.GAME&&GAME.panel&&GAME.closePanel)GAME.closePanel()}
window.CAMP.guide=guide;
// ---------- Kapitelkarten ----------
function card(html,cls){return new Promise(r=>{CARD.innerHTML=`<div class="cc glass ${cls||''}">${html}</div>`;CARD.classList.add('on');CARD.querySelector('[data-cc]').onclick=()=>{CARD.classList.remove('on');setTimeout(r,300)}})}
async function intro(k){const ch=CH[k];const un=[];
 await card(`<div class="cc-k">Kapitel ${k+1}</div><div class="cc-t">${ch.ic} ${esc(ch.t)}</div><div class="cc-d">${esc(ch.intro)}</div>${un.length?`<div class="cc-u">🔓 Neu freigeschaltet: <b>${un.join(', ')}</b></div>`:''}<div class="cc-m">${ch.main.map(i=>`<span>${esc(T(i).t)}</span>`).join('')}</div><button class="btn" data-cc>Los geht's</button>`)}
async function outro(k){const ch=CH[k];await card(`<div class="cc-k">Kapitel ${k+1} abgeschlossen</div><div class="cc-t">✦ ${esc(ch.t)}</div><div class="cc-d">${esc(ch.outro)}</div><button class="btn" data-cc>Weiter</button>`)}
async function finale(){await card(`<div class="cc-k">Tutorial abgeschlossen</div><div class="cc-t">👑 Das Universum gehört dir</div><div class="cc-d">Alle Funktionen sind frei. Deine Bauschleife fasst jetzt 1 aktiven und 3 vorgemerkte Aufträge. Im Missionslog warten parallele Kampagnenstränge.</div><button class="btn" data-cc>Weiter</button>`)}
let looping=false;
async function loop(){if(looping||busy||!S||!S.camp||S.camp.skip)return;if(document.querySelector('#loader,#mplogin'))return;looping=true;try{const c=C();
 for(let k=0;k<CH.length;k++)if(c.seen['o'+k]===0){c.seen['o'+k]=1;save();pose('cheer');await outro(k);if(k===CH.length-1){c.seen.fin=1;save();await finale()}}
 if(c.ch<CH.length&&!c.seen['i'+c.ch]){c.seen['i'+c.ch]=1;save();await intro(c.ch);
  const i=curMain();const t=T(i);c.seen['a'+i]=1;save();
  if(c.ch===0)await say('Hallo, Kommandant! Ich bin Aries, deine Bordintelligenz. Ich führe dich Schritt für Schritt durch den Aufbau deines Imperiums.',{p:'wave'});
  const v=await say(`Erste Mission: „${t.t}“ – ${t.d}`,{p:'explain',until:()=>done(i),btns:GUIDE[i]?[['Zeig es mir','g'],['Selbst machen',null]]:[['Verstanden',null]]});
  hide();if(v==='g'){looping=false;return guide(i)}}
 // Hinweis: negative Energie
 {const pi=E.prodInfo(pl());const now=Date.now();if(c.cl.T03&&!pl().moon&&pi.eUse>pi.eProd+0.5&&now-(c.eh||0)>8*60e3&&!GAME.panel){c.eh=now;save();const v=await say('Achtung: Deine Energie ist negativ – Minen fördern dann weniger. Baue das Kraftwerk aus.',{p:'alert',btns:[['Zeig es mir','g'],['Später',null]]});hide();if(v==='g'){busy=true;looping=false;abort=false;await buildFlow('power');spot(null);hide();busy=false}return}}
 // erfüllte Mission melden
 const i=curMain();if(i!=null&&!c.cl[i]&&safe(()=>done(i))&&!GAME.panel&&!(window.B2&&B2.placing)){c.seen['d'+i]=1;save();pose('cheer');await claimFx(i);
  // gleich die nächste Mission ankündigen
  const n2=curMain();if(n2!=null&&c.ch<CH.length&&c.seen['i'+c.ch]){delete c.seen['a'+n2]}return}
 // Nebenmissionen: automatisch abholen
 const n=curMain();if(n!=null&&c.seen['i'+c.ch]&&!c.seen['a'+n]){c.seen['a'+n]=1;save();const t=T(n);if(safe(()=>done(n))){looping=false;return}const w=await say(`Nächste Mission: „${t.t}“ – ${t.d}`,{p:'explain',until:()=>done(n),btns:GUIDE[n]?[['Zeig es mir','g'],['Selbst machen',null]]:[['Verstanden',null]]});hide();if(w==='g'){looping=false;return guide(n)}}
}finally{looping=false}}
setInterval(()=>{try{loop()}catch(e){}},1200);
// ---------- Sperren ----------
const LOCKSEL={research:'[data-p=research]',store:'[data-p=store]',cmd:'[data-p=cmd]',inv:'[data-p=inv]',yard:'[data-p=yard]',defense:'[data-p=defense]',system:'[data-v=system]',galaxy:'[data-v=galaxy]',fleet:'[data-v=fleet]',galacto:'[data-p=galacto]',ally:'[data-v=ally]',chat:'[data-v=chat]',rank:'[data-p=rank]'};
function applyLocks(){for(const f in LOCKSEL){const L=locked(f);document.querySelectorAll(`#rail ${LOCKSEL[f]},#nav ${LOCKSEL[f]},#topbtns ${LOCKSEL[f]}`).forEach(b=>{b.classList.toggle('cp-lock',L);if(L)b.dataset.lockch=f;else delete b.dataset.lockch})}
 document.querySelectorAll('#panel [data-act=padbuild]').forEach(b=>{const id=b.dataset.id;const L=bLocked(id);const row=b.closest('.unitrow');if(L&&!b.dataset.cplock){b.dataset.cplock=1;b.disabled=true;b.innerHTML='🔒 nach dem Tutorial';row&&row.classList.add('cp-lockrow')}})}
setInterval(()=>{if(!document.hidden){applyLocks();if(window.S||window.GAME)try{window.renderAries()}catch(e){}}},900);
document.addEventListener('click',e=>{const b=e.target.closest('.cp-lock');if(b){e.stopPropagation();e.preventDefault();const k=b.dataset.lockch;toast(`🔒 ${FEATN[k]||''}: ${FEATH[k]||'Noch gesperrt'}`,'',2600);return}
 if(e.target.closest('[data-act=cp-vb],[data-act=cp-vr]')){e.stopPropagation();const r=e.target.closest('[data-act=cp-vr]')?E.useVoucher('r'):E.useVoucher('b',S.cur);if(r)err(r);else{toast('Gutschein eingelöst: bis zu 10 Minuten schneller','ok');save();renderAll();if(GAME.panel)renderPanel(true)}return}
 const t=e.target.closest('[data-act]');if(!t)return;const a=t.dataset.act;
 if(a==='open'&&t.dataset.p==='rank'){S.flags.rankSeen=1}
 if(a==='cp-claim'){e.stopPropagation();claimFx(t.dataset.id)}
 if(a==='cp-side'){e.stopPropagation();claimSideFx(t.dataset.id)}
 if(a==='cp-guide'){e.stopPropagation();guide(t.dataset.id)}
 if(a==='cp-restart'){e.stopPropagation();init();const c=C();c.skip=0;abort=true;busy=false;looping=false;spot(null);hide();if(c.ch<CH.length){delete c.seen['i'+c.ch];CH[c.ch].main.forEach(k=>{delete c.seen['a'+k];delete c.seen['d'+k]})}save();closePanelSafe();renderAll();toast('Tutorial startet neu – Kapitel '+(c.ch+1),'ok');setTimeout(()=>{abort=false;loop()},700);return}
 if(a==='cp-skip'){e.stopPropagation();init();S.camp.skip=S.camp.skip?0:1;abort=true;busy=false;looping=false;spot(null);save();hide();if(!S.camp.skip){const n=curMain();if(n!=null){delete S.camp.seen['a'+n];delete S.camp.seen['d'+n]}save()}setTimeout(()=>{abort=false;if(!S.camp.skip){closePanelSafe();loop()}},600);renderAll();if(GAME.panel)renderPanel(true);toast(S.camp.skip?'Tutorial übersprungen – alle Funktionen frei':'Tutorial wieder aktiv','ok')}
},true);
// Nebel-Zähler
E.on&&E.on((ev)=>{});
const _sf=E.send;if(_sf)E.send=function(...a){const r=_sf.apply(this,a);if(!r&&a[3]==='explore')S.flags.nebN=(S.flags.nebN||0)+1;return r};
// Einstellungen: Tutorial überspringen
const _st=PANELS.settings;PANELS.settings=()=>{const r=_st();init();r[1]=`<div class="box" style="margin-bottom:8px"><div class="row"><b>Kampagne / Tutorial</b><span class="spacer"></span><button class="btn sm ${S.camp.skip?'':'ghost'}" data-act="cp-skip">${S.camp.skip?'Tutorial fortsetzen':'Tutorial überspringen'}</button></div><div class="mut" style="font-size:11px">${S.camp.skip?'Alle Funktionen frei, Aries ist stumm.':'Überspringen schaltet sofort alle Funktionen frei. Missionen und Belohnungen bleiben im Missionslog abholbar.'}</div></div>`+r[1];return r};
// Review A3: Belohnung und Erledigtmarker werden zuerst gebucht, die Animation zeigt danach das bestätigte Ergebnis
async function claimFx(i){const c=C();if(c.cl[i]||!safe(()=>done(i)))return err('Mission noch nicht erfüllt');const r=rwOf(i);if(err(claim(i)))return;if(window.RWD&&E.rewardText(r))await RWD.flow(r,T(i).t,true);if(GAME.panel)renderPanel(true)}
async function claimSideFx(id){const c=C();const m=STRM[id];if(!m||c.side[id]||!m.c())return err('Noch nicht erfüllt');if(err(claimSide(id)))return;if(window.RWD)await RWD.flow(m.r,'Kampagne: '+m.t,true);if(GAME.panel)renderPanel(true)}
window.CAMP.claimFx=claimFx;
window.CAMP.init=init;window.CAMP.claim=claim;window.CAMP.loop=loop;
})();
