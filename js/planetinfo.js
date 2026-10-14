// v23: Bauplätze & Temperatur – Anzeige, Effekte, Planeten-Guide
(function(){const E=window.ENGINE;
const tcol=T=>T>=120?'#ff6b4a':T>=60?'#ffb547':T>=0?'#9be37a':T>=-60?'#5fd0ff':'#8fa8ff';
const icF='<svg class="pi-ic" viewBox="0 0 16 16"><path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
const icT=T=>`<svg class="pi-ic" viewBox="0 0 16 16"><path d="M6.2 9.2V3a1.8 1.8 0 0 1 3.6 0v6.2a3.4 3.4 0 1 1-3.6 0z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="11.9" r="1.9" fill="${tcol(T)}"/><path d="M8 11V${T>=120?4.5:T>=40?6.5:T>=-40?8.3:9.8}" stroke="${tcol(T)}" stroke-width="1.6" stroke-linecap="round"/></svg>`;
const zone=p=>p<=3?'inner':p<=6?'mid':p<=9?'big':p<=12?'mid2':'outer';
const ZN={inner:'Innerer Ring – klein & heiß',mid:'Mittlerer Ring – mittelgroß & warm',big:'Grüner Gürtel – größte Planeten',mid2:'Äußerer Gürtel – mittelgroß & kühl',outer:'Äußerer Rand – klein & eisig'};
const REC={inner:'Heiß: Solarsatelliten liefern hier am meisten Energie. Wenig Platz – ideal als Energie- oder Flottenbasis.',mid:'Ausgewogen: solide Größe, Energie und Gas im Mittelfeld.',big:'Die größten Planeten (bis 240 Felder): beste Wahl für eine vollwertige Kolonie.',mid2:'Kühler: mehr Gas, etwas weniger Satellitenenergie.',outer:'Kalt: maximale Gasförderung, aber wenig Platz und schwache Satelliten.'};
const pct=x=>Math.round(x*100)+' %';
const fx=T=>({g:E.gasFactor(T),e:E.satEnergy(T)});
function info(p,known){const tr=E.tempRange(p),T=tr[1],f=fx(T),fr=E.fieldRange(p);
 return{p,tr,T,f,fr,fields:known,zone:zone(p)}}
function chips(p,fields,used,T){T=T??E.tempOf(p);const fr=E.fieldRange(p);
 return`<div class="pi-chips"><span>${icF}${fields!=null?(used!=null?used+'/':'')+fields:fr[0]+'–'+fr[1]}</span><span style="color:${tcol(T)}">${icT(T)}${T}°</span></div>`}
function block(p,{fields,used,T,rec=true}={}){const tr=T!=null?[T-40,T]:E.tempRange(p);T=tr[1];const f=fx(T),fr=E.fieldRange(p),z=zone(p);
 return`<div class="pi-box"><div class="pi-row"><span class="pi-k">${icF} Bauplätze</span><b>${fields!=null?(used!=null?used+' / ':'')+fields:fr[0]+' – '+fr[1]}</b>${fields==null?'<span class="mut"> erwartet</span>':''}</div>
 <div class="pi-row"><span class="pi-k" style="color:${tcol(T)}">${icT(T)} Temperatur</span><b>${tr[0]} bis ${tr[1]} °C</b></div>
 <div class="pi-row"><span class="pi-k">Gasförderung</span><b class="${f.g>=1?'pos':'neg'}">${pct(f.g)}</b><span class="pi-k" style="margin-left:10px">Solarsatellit</span><b>${Math.round(f.e)} Energie</b></div>
 ${rec?`<div class="pi-rec"><b>${ZN[z]}</b> · ${REC[z]}</div>`:''}</div>`}
// Infografik: Position → Größe → Temperatur → Gas/Energie
function infographic(hl){let c='';
 for(let p=1;p<=15;p++){const T=E.tempOf(p),fr=E.fieldRange(p),f=fx(T);
  c+=`<div class="pi-c ${hl===p?'hl':''}"><div class="pi-cb"><i style="height:${Math.round(fr[1]/240*100)}%"><b style="height:${Math.round(fr[0]/fr[1]*100)}%"></b></i></div><div class="pi-cf">${fr[0]}–${fr[1]}</div><div class="pi-ct" style="color:${tcol(T)}"><s style="background:${tcol(T)}"></s>${T}°</div><div class="pi-cg">${Math.round(f.g*100)}%</div><div class="pi-cs">${Math.round(f.e)}</div><div class="pi-cp">${p}</div></div>`}
 return`<div class="pi-ig2"><div class="pi-lab"><span></span><span>${icF}Felder</span><span>${icT(40)}Temp.</span><span>Gas</span><span>Sat.</span><span>Pos.</span></div>${c}</div>`}
const guideHTML=hl=>`<div class="desc" style="margin-bottom:6px;font-size:11.5px">Jede Position im Sonnensystem bestimmt <b>Größe</b> und <b>Temperatur</b> eines Planeten – und damit, wofür er taugt. Bauplätze sind deine Gebäude-Felder: jede Gebäudestufe belegt eines.</div>${infographic(hl)}
 <div class="pi-leg"><span>🔥 <b>Innen (1–3)</b> klein, heiß → Solarsatelliten</span><span>🌿 <b>Mitte (7–9)</b> größte Planeten</span><span>❄️ <b>Außen (13–15)</b> klein, kalt → viel Gas</span></div>
 <div class="mut" style="font-size:10.5px;margin-top:6px">Gas = 1,44 − 0,004 × Max.-Temperatur · Satellit = (Max.-Temp. + 160) / 6 Energie. Die genaue Feldzahl erfährst du erst nach der Kolonisierung.</div>`;
window.PI={icF,icT,tcol,chips,block,infographic,guideHTML,zone};
PANELS.pguide=()=>['Planeten-Guide',guideHTML()];
// Systemansicht
const rs0=window.renderSystem;window.renderSystem=function(){rs0.apply(this,arguments);
 document.querySelectorAll('#sysstrip .orbit').forEach(o=>{const p=+o.dataset.p;const sl=E.slot(sysG,sysS,p);if(sl.kind==='nebula')return;const own=sl.kind==='own'?sl.pl:null;
  o.insertAdjacentHTML('beforeend',chips(p,own?E.fieldsMax(own):null,own?E.fieldsUsed(own):null,own?own.temp:null))});
 const b=$('#sysbar');if(b&&!b.querySelector('[data-act=open][data-p=pguide]'))b.insertAdjacentHTML('beforeend',`<button class="btn sm ghost pi-gb" data-act="open" data-p="pguide">${icF} Planeten-Guide</button>`)};
const sp0=window.sysPop;window.sysPop=function(pn,el){sp0.apply(this,arguments);const d=$('#pop');if(!d)return;const sl=E.slot(sysG,sysS,pn);if(sl.kind==='nebula')return;
 const own=sl.kind==='own'?sl.pl:null;const desc=d.querySelector('.desc');
 if(sl.kind==='empty'){desc.innerHTML='Freie Position – hier kannst du mit einem Kolonieschiff siedeln.';}
 else if(own)desc.innerHTML='Dein Planet.';
 desc.insertAdjacentHTML('afterend',block(pn,own?{fields:E.fieldsMax(own),used:E.fieldsUsed(own),T:own.temp,rec:false}:{rec:sl.kind==='empty'}));
 const w=d.offsetWidth,hh=d.offsetHeight,r=el.getBoundingClientRect();d.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2))+'px';d.style.top=Math.max(56,Math.min(innerHeight-hh-64,r.top+r.height*0.6))+'px'};
// Flotte senden: Ziel-Infos bei Kolonisierung / freier Position
const rf0=window.renderFleet;window.renderFleet=function(){rf0.apply(this,arguments);try{if(fleetTab!=='send'||!D.to||D.to.p>15)return;const sl=E.slot(D.to.g,D.to.s,D.to.p);
 if(sl.kind!=='empty'&&D.mission!=='colonize')return;const tg=document.querySelector('#tg');const box=tg&&tg.closest('.box');if(!box||document.querySelector('.pi-fleet'))return;
 box.insertAdjacentHTML('afterend',`<div class="box pi-fleet" style="margin-bottom:8px"><b>Zielplanet [${D.to.g}:${D.to.s}:${D.to.p}]</b>${block(D.to.p)}</div>`)}catch(e){}};
})();
