'use strict';
// v41: Welt-Chat als seitliche Schublade + Privatchat (Posteingang, ungelesen-Zähler) + Spielerprofil. Server: /api/chat, /api/dm, /api/inbox, /api/profile.
// Nur echte, angemeldete Spieler schreiben; Bots/NPC können weder schreiben noch Privatnachrichten empfangen. DOM bleibt klein (max. 60 Nachrichten).
(function(){
const CH={open:false,tab:'world',with:null,msgs:{},pw:{},inbox:[],unread:0,timer:0,last:0,sending:false};window.CHAT=CH;
const on=()=>window.NET&&NET.on;const me=()=>on()?NET.cfg.name:'';
const D=document.createElement('div');D.id='chatdr';D.innerHTML=`<div class="cd-bg" data-cd="close"></div><aside class="cd-panel glass"><header class="cd-head"><div class="cd-tabs"></div><button class="cd-x" data-cd="close" aria-label="Schließen">✕</button></header><div class="cd-sub"></div><div class="cd-list"></div><form class="cd-in"><input maxlength="200" placeholder="Nachricht…" autocomplete="off" enterkeyhint="send"><button class="btn sm" type="submit">Senden</button></form></aside>`;
document.body.appendChild(D);const $l=D.querySelector('.cd-list'),$in=D.querySelector('.cd-in input'),$tabs=D.querySelector('.cd-tabs'),$sub=D.querySelector('.cd-sub');
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmtP=n=>n>=1e6?(n/1e6).toFixed(1).replace('.0','')+'M':n>=1e3?(n/1e3).toFixed(1).replace('.0','')+'k':String(n|0);
const tm=t=>new Date(t).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
const chKey=()=>CH.tab==='world'?'global':CH.tab==='ally'?'ally:'+(NET.ally&&NET.ally.tag):'dm:'+(CH.with||'');
function open(tab,withName){if(tab)CH.tab=tab;if(withName!==undefined)CH.with=withName;CH.open=true;D.classList.add('on');render();poll(true);if(CH.tab==='dm'&&CH.with)setTimeout(()=>{if(CH.open)try{$in.focus({preventScroll:true})}catch(_){}},380);clearInterval(CH.timer);CH.timer=setInterval(()=>{if(!document.hidden)poll()},5000)}
function close(){CH.open=false;D.classList.remove('on');clearInterval(CH.timer);$in.blur()}
CH.open_=open;CH.close=close;CH.dm=n=>open('dm',n);
function render(){if(!CH.open)return;const A=on()&&NET.ally;
 $tabs.innerHTML=[['world','🌐 Welt'],A?['ally','🛡 Allianz']:null,['dm','✉ Privat'+(CH.unread?` <i class="cd-badge">${CH.unread}</i>`:'')]].filter(Boolean).map(([k,n])=>`<button class="${CH.tab===k?'on':''}" data-cd="tab" data-k="${k}">${n}</button>`).join('');
 const form=D.querySelector('.cd-in');
 if(!on()){$sub.innerHTML='';$l.innerHTML='<div class="cd-empty">Der Chat ist nur im Online-Spiel verfügbar. Melde dich in den Einstellungen an.</div>';form.style.display='none';return}
 if(CH.tab==='dm'&&!CH.with){$sub.innerHTML='<b>Posteingang</b>';form.style.display='none';
  $l.innerHTML=CH.inbox.length?CH.inbox.map(c=>`<div class="cd-conv" data-cd="conv" data-n="${esc(c.with)}"><div class="cd-av">${esc((c.with||'?')[0])}</div><div class="cd-cb"><div class="cd-cn"><b>${esc(c.with)}</b> <span class="cd-pw">⚔ ${fmtP(c.pw||0)}</span><span class="cd-t">${tm(c.last.t)}</span></div><div class="cd-cl">${c.last.name===me()?'Du: ':''}${esc(c.last.txt)}</div></div>${c.unread?`<i class="cd-badge">${c.unread}</i>`:''}</div>`).join(''):'<div class="cd-empty">Noch keine Unterhaltungen. Tippe im Welt-Chat, in der Rangliste oder in der Galaxie auf einen Spieler, um ihm zu schreiben.</div>';return}
 form.style.display='';
 $sub.innerHTML=CH.tab==='dm'?`<button class="cd-back" data-cd="inbox">‹</button> <b data-pn="${esc(CH.with)}" class="cd-name">${esc(CH.with)}</b> <span class="mut">Privat</span>`:CH.tab==='ally'?`<b>[${esc(A&&A.tag)}] ${esc(A&&A.name)}</b>`:'<b>Universum</b> <span class="mut">· nur echte Spieler</span>';
 const arr=(CH.msgs[chKey()]||[]).slice(-60);const pw=CH.pw;
 $l.innerHTML=arr.length?arr.map(m=>m.name==='System'?`<div class="cd-sys">${esc(m.txt)}</div>`:`<div class="cd-m ${m.name===me()?'me':''}"><div class="cd-mh"><b class="cd-name" data-pn="${esc(m.name)}">${esc(m.name)}</b>${pw[m.name]!=null?` <span class="cd-pw">⚔ ${fmtP(pw[m.name])}</span>`:''}<span class="cd-t">${tm(m.t)}</span></div><div class="cd-tx">${esc(m.txt)}</div></div>`).join(''):'<div class="cd-empty">Noch keine Nachrichten.</div>';
 $l.scrollTop=$l.scrollHeight}
async function poll(force){if(!on())return;try{
 if(CH.tab==='dm'&&!CH.with){await inbox();render();return}
 const k=chKey();const arr=CH.msgs[k]||(CH.msgs[k]=[]);const since=arr.length?arr[arr.length-1].id:0;
 const r=CH.tab==='dm'?await NET.api('dm?with='+encodeURIComponent(CH.with)+'&since='+since):await NET.api('chat?ch='+encodeURIComponent(k)+'&since='+since);
 if(r.bot){const n=CH.with;CH.with=null;close();profile(n);return}
 if(r.pw)Object.assign(CH.pw,r.pw);const lid=arr.length?arr[arr.length-1].id:0;const nw=(r.msgs||[]).filter(m=>m.id>lid);if(nw.length){arr.push(...nw);if(arr.length>120)arr.splice(0,arr.length-120);render()}else if(force)render();
 if(CH.tab==='dm'){const u=CH.unread;await inbox();if(CH.unread!==u)render()}}catch(e){if(force){$l.innerHTML=`<div class="cd-empty">Chat nicht erreichbar: ${esc(e.message)}</div>`}}}
async function inbox(){if(!on())return;try{const r=await NET.api('inbox');CH.inbox=r.convs||[];CH.unread=r.unread||0;badge()}catch(e){}}
CH.inbox_=inbox;
function badge(){const b=document.querySelector('#nav [data-v=chat]');if(!b)return;let d=b.querySelector('.dot');if(CH.unread){if(!d){d=document.createElement('span');d.className='dot';b.appendChild(d)}d.textContent=CH.unread>99?'99+':CH.unread}else if(d)d.remove()}
setInterval(()=>{if(on()&&!document.hidden&&!(CH.open&&CH.tab==='dm'))inbox()},30000);
// v51: offenes Chatfenster live aktualisieren (vorher kamen neue Nachrichten erst nach erneutem Öffnen an)
let _pl=false;setInterval(async()=>{if(!on()||document.hidden||!CH.open||_pl||CH.sending)return;_pl=true;try{await poll()}finally{_pl=false}},4000);setTimeout(()=>inbox(),4000);
const _rn=window.renderNav;if(_rn)window.renderNav=function(){_rn.apply(this,arguments);badge()};
D.querySelector('.cd-in').addEventListener('submit',async e=>{e.preventDefault();const txt=$in.value.trim();if(!txt||CH.sending)return;if(txt.length>200)return toast('Max. 200 Zeichen','err');CH.sending=true;
 try{if(CH.tab==='dm')await NET.api('dm',{body:{to:CH.with,txt}});else await NET.api('chat',{body:{ch:chKey(),txt}});$in.value='';await poll()}catch(err){toast(err.message,'err',3500)}finally{CH.sending=false}});
D.addEventListener('click',e=>{const t=e.target.closest('[data-cd],[data-pn]');if(!t)return;e.stopPropagation();
 if(t.dataset.pn){const n=t.dataset.pn;if(CH.tab==='dm'&&nl(n)===nl(CH.with)){profile(n);return}CH.tap(n);return}const a=t.dataset.cd;
 if(a==='close')close();else if(a==='tab'){CH.tab=t.dataset.k;if(CH.tab==='dm')CH.with=null;render();poll(true)}else if(a==='conv'){CH.with=t.dataset.n;render();poll(true);setTimeout(()=>{try{$in.focus({preventScroll:true})}catch(_){}},200)}else if(a==='inbox'){CH.with=null;render();poll(true)}});
// Nav-Button „Chat“ öffnet die Schublade statt einer eigenen Ansicht
document.addEventListener('click',e=>{const b=e.target.closest('#nav [data-v=chat]');if(!b||b.classList.contains('cp-lock'))return;e.stopPropagation();e.preventDefault();CH.open?close():open()},true);
// ---------- Profil (überall: Chat, Rangliste, Galaxie, System) ----------
const P=document.createElement('div');P.id='pprof';document.body.appendChild(P);
// v51: ein Helfer für alle Spielernamen – echte Spieler → Privatchat, Bots → Profil, eigener Name → eigenes Profil
const nl=s=>String(s||'').trim().toLowerCase();
CH.kind=function(name){const n=nl(name);if(!n)return 'none';const S0=window.GAME&&GAME.S;if((on()&&n===nl(me()))||(S0&&n===nl(S0.cmdName))||n==='du')return 'me';
 const U=on()&&NET.uni;if(U){if((U.players||[]).some(p=>nl(p.name)===n))return 'real';if((U.npcs||[]).some(x=>nl(x.n)===n))return 'bot'}
 if(window.RANK&&RANK.find&&RANK.find(name))return on()&&!U?'real?':'bot';
 // online & unbekannt (z. B. gerade erst registriert): Privatchat versuchen – der Server meldet Bots (→ Profil)
 return on()?'real?':'none'};
CH.show=open;
CH.tap=function(name){const k=CH.kind(name);if(k==='me'){profile(on()?me():name,true);return}
 if((k==='real'||k==='real?')&&on()){try{if(typeof closePop==='function')closePop()}catch(_){}P.classList.remove('on');open('dm',name);return}profile(name)};
async function profile(name,self){if(!name)return;if(on()&&nl(name)===nl(me()))self=true;
 P.innerHTML=`<div class="pp-bg" data-pp="x"></div><div class="pp-card glass"><div class="mut">Lade…</div></div>`;P.classList.add('on');
 let x=null;try{x=on()?await NET.api('profile?name='+encodeURIComponent(name)):null}catch(e){}
 const loc=!x&&window.RANK&&RANK.find?RANK.find(name):null;if(!x)x=loc||{name,real:!!self};if(self){x.real=true;x.self=true;if(!x.pts){try{x.pts=ENGINE.totalPoints()}catch(_){}}}
 const pts=x.pts||{};const tot=typeof pts==='number'?pts:Math.floor((pts.b||0)+(pts.t||0)+(pts.f||0)+(pts.d||0));
 P.querySelector('.pp-card').innerHTML=`<div class="pp-h"><div class="cd-av big">${esc((x.name||'?')[0])}</div><div><b>${esc(x.name)}</b>${x.self?' <span class="pp-bot" style="background:rgba(56,225,255,.15)">Du</span>':x.real?'':' <span class="pp-bot">🤖 Bot</span>'}<div class="mut">⚔ Stärke ${fmtP(tot)}${x.tag?` · [${esc(x.tag)}]`:''}${x.home?` · [${x.home.join(':')}]`:''}</div></div></div>
 <div class="row" style="gap:6px;margin-top:10px;flex-wrap:wrap">${x.self?'<span class="mut" style="font-size:11px">Das ist dein Profil.</span>':x.real&&on()?`<button class="btn sm" data-pp="dm" data-n="${esc(x.name)}">✉ Nachricht</button>`:`<span class="mut" style="font-size:11px">${on()?'Bots können keine Privatnachrichten empfangen.':'Privatnachrichten nur online.'}</span>`}${x.home?`<button class="btn sm ghost" data-pp="gal" data-h="${x.home.join(':')}">In Galaxie zeigen</button>`:''}<button class="btn sm ghost" data-pp="x">Schließen</button></div>`}
CH.profile=profile;
P.addEventListener('click',e=>{const t=e.target.closest('[data-pp]');if(!t)return;const a=t.dataset.pp;P.classList.remove('on');
 if(a==='dm'){if(window.closePanel)try{closePanel()}catch(_){}open('dm',t.dataset.n)}
 else if(a==='gal'){const [g,s,p]=t.dataset.h.split(':').map(Number);close();try{if(window.closePanel)closePanel();if(window.GX&&GX.goto){setView&&setView('galaxy');GX.goto(g,s,p)}}catch(_){}}});
// Spielernamen überall antippbar
document.addEventListener('click',e=>{const t=e.target.closest('[data-pn]');if(!t||D.contains(t))return;e.stopPropagation();e.preventDefault();CH.tap(t.dataset.pn)},true);
})();
