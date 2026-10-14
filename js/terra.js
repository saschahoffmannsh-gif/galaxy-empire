// v27: Terraformer – eigene Optik (umgefärbter Turm in Türkis/Grün + Nebel, Ring, ergrünende Flächen); Stufen-Look alle 5 Stufen
(function(){if(!window.B3||!window.TFX)return;
for(let t=1;t<=4;t++){const k='fusion_t'+t;if(B3.v[k])B3.v['terraformer_t'+t]=B3.v[k].map(v=>v.slice());
 if(TFX[k])TFX['terraformer_t'+t]=TFX[k].map(x=>Object.assign(JSON.parse(JSON.stringify(x)),{m:'tring',e:'tcore'}))}
const r=(i,s)=>((Math.sin(i*127.1+s*311.7)*43758.5453)%1+1)%1;
window.TERRA_FX=function(T,tier){const W=T.W,H=T.H,X=v=>(v/W*100).toFixed(2)+'%',Y=v=>(v/H*100).toFixed(2)+'%';
 const cx=T.cx||W/2,cy=T.cy||H*.82,mc=(T.mc&&T.mc[0])||[W/2,H*.5];let h='';
 // ergrünende Flächen rund um den Sockel
 const nG=3+tier*2;for(let i=0;i<nG;i++){const a=(i/nG)*Math.PI*2+r(i,1)*.6,rx=W*(.30+r(i,2)*.12),ry=H*(.08+r(i,3)*.04);const s=(10+r(i,4)*10+tier*2.5);
  h+=`<span class="tf-gr" style="left:${X(cx+Math.cos(a)*rx)};top:${Y(cy+Math.sin(a)*ry)};width:${s}%;animation-delay:-${(r(i,5)*6).toFixed(2)}s"></span>`}
 // aufsteigender Nebel
 const nM=2+tier;for(let i=0;i<nM;i++)h+=`<span class="tf-mi" style="left:${X(cx+(r(i,6)-.5)*W*.5)};top:${Y(cy-H*.05)};--dx:${((r(i,7)-.5)*30).toFixed(0)}%;animation-duration:${(6+r(i,8)*4).toFixed(1)}s;animation-delay:-${(r(i,9)*8).toFixed(1)}s"></span>`;
 // rotierender Terraform-Ring (zweiter, gegenläufiger Ring) + Sporen
 h+=`<span class="tf-rg" style="left:${X(mc[0])};top:${Y(mc[1])};width:${(62+tier*6)}%"><i></i><b></b></span>`;
 for(let i=0;i<3+tier*2;i++)h+=`<span class="tf-sp" style="left:${X(cx+(r(i,10)-.5)*W*.6)};top:${Y(cy-H*.02)};animation-duration:${(3+r(i,11)*3).toFixed(1)}s;animation-delay:-${(r(i,12)*6).toFixed(1)}s"></span>`;
 return h};
})();
