'use strict';
// Gebäude-Animationen (v17): pro Gebäude eigene Effekt-Ebene, deckungsgleich mit dem Sprite (gleiche Box, gleicher Skew).
// Koordinaten normiert (u,v) auf die Sprite-Box. Masken nutzen das Sprite selbst (nur Gebäudepixel leuchten).
(function(){
const P=(u,v)=>`left:${u*100}%;top:${v*100}%`;
const G=(u,v,s,c,d,dl=0)=>`<b class="fx-g" style="${P(u,v)};width:${s*100}%;--c:${c};animation-duration:${d}s;animation-delay:-${dl}s"></b>`;
const SP=(u,v,c,n=7,dl=0)=>`<span class="fx-sp" style="${P(u,v)};--c:${c}">${Array.from({length:n},(_,i)=>{const a=(-160+i*(140/n)+((i*37)%17))*Math.PI/180,r=10+((i*53)%9);return`<i style="--dx:${(Math.cos(a)*r).toFixed(1)}px;--dy:${(Math.sin(a)*r).toFixed(1)}px;animation-delay:-${((i*.31+dl)%1.6).toFixed(2)}s"></i>`}).join('')}</span>`;
const ST=(u,v,dl=0)=>`<span class="fx-st" style="${P(u,v)}">${[0,1,2,3].map(i=>`<i style="animation-delay:-${(i*1.1+dl).toFixed(1)}s"></i>`).join('')}</span>`;
const BL=(u,v,c,dl=0,d=1.8)=>`<b class="fx-bl" style="${P(u,v)};--c:${c};animation-delay:-${dl}s;animation-duration:${d}s"></b>`;
const SW=(c,d,dir='h',dl=0)=>`<b class="fx-sw ${dir}" style="--c:${c};animation-duration:${d}s;animation-delay:-${dl}s"></b>`;
const RING=(u,v,rx,ry,c,d,rev)=>`<svg class="fx-ring" viewBox="0 0 100 100" preserveAspectRatio="none" style="left:${(u-rx)*100}%;top:${(v-ry)*100}%;width:${rx*200}%;height:${ry*200}%"><ellipse cx="50" cy="50" rx="48" ry="44" style="--c:${c};animation-duration:${d}s;animation-direction:${rev?'reverse':'normal'}" pathLength="100"/></svg>`;
const VX=(u,v,rx,ry)=>`<span class="fx-vx" style="left:${(u-rx)*100}%;top:${(v-ry)*100}%;width:${rx*200}%;height:${ry*200}%"><i></i><i></i></span>`;
const PING=(u,v,c)=>`<span class="fx-pg" style="${P(u,v)};--c:${c}"><i></i><i></i></span>`;
const BUB=(u,v,w,h,c)=>`<span class="fx-bb" style="left:${u*100}%;top:${v*100}%;width:${w*100}%;height:${h*100}%;--c:${c}">${[0,1,2,3,4,5].map(i=>`<i style="left:${10+i*15}%;animation-delay:-${(i*.47).toFixed(2)}s;animation-duration:${(1.8+(i%3)*.5).toFixed(1)}s"></i>`).join('')}</span>`;
const FLOW=(c,d)=>`<b class="fx-fl" style="--c:${c};animation-duration:${d}s"></b>`;
const SHAFT=(u,v,c,dl=0)=>`<b class="fx-sh" style="${P(u,v)};--c:${c};animation-delay:-${dl}s"></b>`;
const HOIST=(u,v0,v1)=>`<b class="fx-ho" style="left:${u*100}%;top:${v0*100}%;--h:${(v1-v0)*100}%"><i></i></b>`;
const SHIELD=(u,v,rx,ry)=>`<span class="fx-shd" style="left:${(u-rx)*100}%;top:${(v-ry)*100}%;width:${rx*200}%;height:${ry*200}%"><i></i></span>`;
const RAYS=(u,v,s,c)=>`<span class="fx-ry" style="${P(u,v)};width:${s*100}%;--c:${c}"><i></i></span>`;
const WAVE=(x0,y0,x1,y1,dl)=>`<b class="fx-wv" style="clip-path:inset(${y0*100}% ${(1-x1)*100}% ${(1-y1)*100}% ${x0*100}%);transform-origin:${(x0+x1)*50}% ${y0*100}%;animation-delay:-${dl}s"></b>`;
const FLK=(u,v,c,dl=0)=>`<b class="fx-fk" style="${P(u,v)};--c:${c};animation-delay:-${dl}s"></b>`;
const FX={
 metal_mine:()=>HOIST(.425,.16,.5)+G(.6,.58,.24,'#ff9a3c',2.4)+SP(.6,.55,'#ffc070',8)+ST(.42,.03)+ST(.7,.3,1.7)+BL(.425,.02,'#ff4a4a'),
 crystal_mine:()=>SHAFT(.3,.36,'#8ff0ff')+SHAFT(.71,.5,'#8ff0ff',1.4)+G(.3,.34,.2,'#58d8ff',3)+G(.71,.5,.17,'#58d8ff',3.6,1)+G(.5,.52,.14,'#7fe8ff',2.8,.5)+SW('#d6f8ff',7)+BL(.5,.08,'#ffd050',.4),
 gas_mine:()=>G(.47,.5,.32,'#59ff8a',3)+BUB(.39,.34,.15,.32,'#c8ffd8')+ST(.27,.1)+ST(.78,.15,1.4)+BL(.6,.07,'#7fffa0',.6),
 solar:()=>SW('#fff3c8',5.5)+BL(.2,.55,'#ff5050',.3,2.6)+BL(.85,.2,'#ff5050',1.2,2.6),
 fusion:()=>G(.5,.42,.34,'#ffb640',1.6)+RING(.5,.36,.47,.1,'#ffd27a',5)+RING(.5,.36,.42,.085,'#ff9a3c',3.2,1)+SP(.5,.45,'#ffe0a0',6)+BL(.5,.03,'#ffd080',.2),
 lab:()=>BL(.2,.07,'#ff5050',0)+BL(.29,.1,'#ffd050',.7)+BL(.43,.02,'#50c8ff',1.3)+SW('#8fe8ff',6,'v')+G(.6,.6,.12,'#7fe0ff',4)+G(.27,.68,.08,'#7fe0ff',3,1),
 robotics:()=>FLK(.27,.24,'#bff0ff')+FLK(.72,.28,'#bff0ff',.9)+SP(.27,.24,'#bfefff',7)+SP(.72,.28,'#bfefff',7,.8)+BL(.5,.38,'#ffb030',.3)+BL(.12,.55,'#ff5050',1.1),
 nanite:()=>FLOW('#c77dff',3.2)+G(.5,.8,.38,'#b060ff',3)+G(.5,.06,.09,'#e8c0ff',2,.6)+G(.3,.22,.07,'#e0b0ff',2.4,1.1)+G(.68,.2,.07,'#e0b0ff',2.2,.3),
 store:()=>BL(.45,.12,'#ff4040')+BL(.68,.08,'#ffd050',.8)+BL(.22,.25,'#50ff90',1.5)+SW('#ffffff',9),
 shipyard:()=>SP(.38,.62,'#ffd38a',7)+SP(.55,.52,'#bfefff',7,.6)+SP(.7,.44,'#ffd38a',7,1.1)+FLK(.55,.52,'#bfefff',.4)+BL(.08,.12,'#ff4040')+BL(.92,.18,'#ff4040',.5)+BL(.5,.04,'#ffd050',1)+G(.3,.56,.2,'#6fdcff',4),
 defense:()=>G(.45,.45,.32,'#5aa8ff',3)+SHIELD(.45,.38,.17,.22)+BL(.15,.5,'#ff5050',.4)+BL(.8,.48,'#ff5050',1.3),
 galacto:()=>RAYS(.47,.46,.42,'#9fd8ff')+G(.47,.48,.26,'#8fd8ff',2.6)+SP(.47,.4,'#e0f4ff',5),
 alliance:()=>WAVE(.06,.28,.18,.6,0)+WAVE(.18,.3,.3,.62,.7)+WAVE(.3,.32,.43,.64,1.4)+BL(.85,.2,'#ffd050')+BL(.6,.14,'#ff5050',.9),
 stargate:()=>VX(.47,.5,.17,.24)+G(.47,.5,.32,'#5ab8ff',3)+BL(.18,.2,'#50c8ff',.3)+BL(.78,.18,'#50c8ff',1.1),
 radar:()=>PING(.5,.27,'#8ff0ff')+BL(.53,.15,'#ff4040')+SW('#e0faff',8,'h',2)+BL(.3,.62,'#50ff90',.8)};
const ALIAS={moon_base:'lab',pioneer:'nanite',eux:'radar',wormhole:'stargate'};
window.BFX={html:n=>{const f=FX[n]||FX[ALIAS[n]];return f?f():''}};
})();
