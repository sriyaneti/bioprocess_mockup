// // full integration layer UI 

// import React, { useState, useMemo } from "react";
// import {
//   ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
//   ResponsiveContainer, ReferenceArea, Cell, BarChart, Bar,
// } from "recharts";

// /* =================================================================
//  * AI Integration Layer — operating console.
//  * Collect → Orchestrate → Store (graph) → Analyze.
//  * All data is SIMULATED. Production reads real systems via
//  * OPC UA, AnIML + SiLA, and APIs.
//  * ================================================================= */

// const C = {
//   primary:"#0B6E5F", green:"#1E9E6A", amber:"#C98A12", red:"#C8453B",
//   gold:"#B5862B", goldWeak:"#F4EBD3", gray:"#9AA6AF", ink:"#1B2229",
//   muted:"#69727C", line:"#E5E8EC",
// };
// function mulberry32(a){return function(){a|=0;a=(a+0x6d2b79f5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
// const clamp=(x,lo,hi)=>Math.max(lo,Math.min(hi,x));
// const r1=x=>Math.round(x*10)/10;

// function build(){
//   const rng=mulberry32(7);
//   const proms=["T7","tac","araBAD","T7lac","rhaBAD"], sigs=["pelB","OmpA","DsbA","cytoplasmic","PhoA"];
//   const modz=["DnaK/DnaJ co-expr","trxB/gor host","SpyTag fusion","high-copy RBS","native"];
//   const copies=["low (5–10)","medium (15–20)","high (>50)"], codon=["optimized","native"];
//   const engs=["A. Roth","M. Lindqvist","J. Okafor","S. Park"], feeds=["exponential","DO-stat","pH-stat","constant"];
//   const rx=["BR-2L-01","BR-2L-02","BR-10L-01","BR-10L-02"], resins=["Protein-affinity","IEX-Q","MMC"], apps=["mozzarella analog","cream cheese","process cheese","barista milk"];
//   const strains=[],batches=[],lots=[],funcs=[],appts=[]; let n=0;
//   for(let i=0;i<12;i++){
//     const sid="S"+String(i+1).padStart(2,"0");
//     strains.push({id:sid,host:"E. coli BL21",promoter:proms[(rng()*proms.length)|0],signal:sigs[(rng()*sigs.length)|0],mod:modz[(rng()*modz.length)|0],copy:copies[(rng()*copies.length)|0],codon:codon[(rng()*codon.length)|0],engineer:engs[(rng()*engs.length)|0]});
//     for(let b=0;b<3;b++){
//       n++; const bid="B"+String(n).padStart(3,"0"),lid="L"+String(n).padStart(3,"0"),fid="F"+String(n).padStart(3,"0"),aid="A"+String(n).padStart(3,"0");
//       const doExp=16+rng()*28, ph=6.8+rng()*0.5, temp=30+rng()*7, indod=0.6+rng()*1.8, titer=2.0+rng()*4.5;
//       const feed=feeds[(rng()*feeds.length)|0], scale=[2,2,10][(rng()*3)|0], runh=28+((rng()*24)|0);
//       const yld=clamp(55+(titer-2)*4+rng()*10,40,93), pur=clamp(88+rng()*9,85,99);
//       const integ=clamp(96-2.1*Math.abs(doExp-30)+rng()*6,28,100), sol=clamp(70+integ*0.22+rng()*7,58,99), gel=clamp(58+rng()*10,52,72);
//       const melt=clamp(88-2.4*Math.abs(doExp-30)+0.12*(pur-90)+(rng()-0.5)*8,34,100), stretch=clamp(melt*0.7+rng()*15,20,100);
//       const band=doExp>=27&&doExp<=34;
//       batches.push({id:bid,strainId:sid,doExp:r1(doExp),ph:r1(ph),temp:r1(temp),indod:r1(indod),titer:r1(titer),feed,scale,runh,reactor:rx[(rng()*rx.length)|0],band});
//       lots.push({id:lid,batchId:bid,resin:resins[(rng()*resins.length)|0],recovery:r1(yld),purity:r1(pur),endo:r1(clamp(0.5+rng()*4,0.1,6)),mass:r1(clamp(titer*scale*yld/100,1,400))});
//       funcs.push({id:fid,lotId:lid,instrument:["LabX-HPLC","Octet-BLI","DLS-ZetaSizer"][(rng()*3)|0],integrity:r1(integ),phos:r1(clamp(integ*0.8+rng()*8,20,95)),sol:r1(sol),gel:r1(gel)});
//       appts.push({id:aid,lotId:lid,app:apps[(rng()*apps.length)|0],melt:r1(melt),stretch:r1(stretch),off:rng()<0.15?"yes":"no",doExp:r1(doExp),band});
//     }
//   }
//   return {strains,batches,lots,funcs,appts};
// }
// const D=build();
// const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
// function pearson(xs,ys){const mx=mean(xs),my=mean(ys);let nu=0,dx=0,dy=0;for(let i=0;i<xs.length;i++){nu+=(xs[i]-mx)*(ys[i]-my);dx+=(xs[i]-mx)**2;dy+=(ys[i]-my)**2;}return nu/Math.sqrt(dx*dy);}
// const STATS=(()=>{const inB=D.appts.filter(a=>a.band).map(a=>a.melt),outB=D.appts.filter(a=>!a.band).map(a=>a.melt);const r=pearson(D.appts.map(a=>Math.abs(a.doExp-30)),D.appts.map(a=>a.melt));return{inMean:r1(mean(inB)),outMean:r1(mean(outB)),lift:r1(mean(inB)-mean(outB)),r2:Math.round(r*r*100)/100,nIn:inB.length};})();

// const SOURCES=[
//   {sys:"StrainBase ELN",pillar:"Strain engineering",std:"API",type:"ELN records",freq:"on change",records:12,status:"connected",sync:"6m ago"},
//   {sys:"BioCommand SCADA",pillar:"Fermentation",std:"OPC UA",type:"temp · pH · DO · feed rates",freq:"1 Hz",records:36,status:"connected",sync:"2m ago"},
//   {sys:"PuriTrack MES",pillar:"Downstream",std:"OPC UA / API",type:"purification steps",freq:"per step",records:36,status:"connected",sync:"4m ago"},
//   {sys:"LabX Analytics",pillar:"Functionality",std:"AnIML + SiLA",type:"lab instrument results",freq:"per run",records:36,status:"syncing",sync:"now"},
//   {sys:"AppPanel Sheets",pillar:"Application",std:"API",type:"spreadsheets · LIMS",freq:"per study",records:36,status:"connected",sync:"31m ago"},
// ];
// const PILLARS=[
//   {key:"strain",label:"Strain engineering",conn:"API"},
//   {key:"ferm",label:"Fermentation",conn:"OPC UA"},
//   {key:"down",label:"Downstream",conn:"OPC UA / MES"},
//   {key:"func",label:"Functionality",conn:"AnIML + SiLA"},
//   {key:"app",label:"Application",conn:"API"},
// ];
// const NAV=[
//   {sect:"1 · COLLECT",items:[["connections","Connections"]]},
//   {sect:"2 · ORCHESTRATE",items:[["pipelines","Pipelines"]]},
//   {sect:"3 · STORE",items:[["lineage","Graph database"],["browser","Data browser"]]},
//   {sect:"4 · ANALYZE",items:[["insights","Insights"]]},
// ];

// const css=`
// @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
// .cons{--bg:#F6F7F9;--surface:#fff;--side:#10171C;--side2:#1A232B;--stext:#9FAAB4;--ink:#1B2229;--muted:#69727C;
//   --line:#E5E8EC;--line2:#D6DBE0;--primary:#0B6E5F;--pweak:#E6F2EF;--gold:#B5862B;--goldw:#F4EBD3;
//   font-family:'Inter',system-ui,sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased;
//   height:100vh;display:flex;overflow:hidden;font-size:13px;background:var(--bg);}
// .cons *{box-sizing:border-box;}
// .mono{font-family:'IBM Plex Mono',monospace;}
// .side{width:232px;background:var(--side);color:var(--stext);flex-shrink:0;display:flex;flex-direction:column;}
// .side-top{padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.07);}
// .logo{display:flex;align-items:center;gap:9px;}
// .logo-mark{width:22px;height:22px;border-radius:6px;background:linear-gradient(135deg,#16b894,#0B6E5F);position:relative;}
// .logo-mark:after{content:"";position:absolute;inset:6px;border:1.6px solid #fff;border-radius:2px;opacity:.85;}
// .logo-txt{color:#fff;font-weight:700;letter-spacing:.16em;font-size:13px;}
// .ws{margin-top:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:8px 10px;}
// .ws-name{color:#dfe5ea;font-weight:600;font-size:12.5px;}
// .ws-sub{color:#6b7780;font-size:10.5px;margin-top:1px;}
// .nav{padding:14px 12px;overflow-y:auto;flex:1;}
// .nav-sect{font-size:10px;letter-spacing:.14em;color:#5d6870;padding:14px 10px 6px;font-weight:600;}
// .nav-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:7px;cursor:pointer;color:var(--stext);font-weight:500;font-size:13px;}
// .nav-item:hover{background:var(--side2);color:#e6ebef;}
// .nav-item.on{background:rgba(22,184,148,.14);color:#7fe9cf;}
// .nav-dot{width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.6;}
// .side-foot{padding:12px 16px;border-top:1px solid rgba(255,255,255,.07);font-size:10.5px;color:#5d6870;line-height:1.4;}
// .main{flex:1;display:flex;flex-direction:column;min-width:0;}
// .top{height:52px;background:var(--surface);border-bottom:1px solid var(--line);display:flex;align-items:center;padding:0 18px;gap:14px;flex-shrink:0;}
// .crumb{font-size:13px;color:var(--muted);}
// .crumb b{color:var(--ink);font-weight:600;}
// .search{margin-left:auto;width:200px;background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:7px 11px;font-size:12.5px;color:var(--ink);outline:none;}
// .env{display:flex;align-items:center;gap:7px;font-size:11.5px;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:5px 11px;white-space:nowrap;}
// .env .dot2{width:7px;height:7px;border-radius:50%;background:var(--green);}
// .avatar{width:28px;height:28px;border-radius:50%;background:#cfd6db;color:#4a555d;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:11px;}
// .content{flex:1;overflow-y:auto;padding:24px 28px 56px;}
// .page-t{font-size:20px;font-weight:600;letter-spacing:-.01em;}
// .page-d{font-size:13px;color:var(--muted);margin-top:4px;max-width:640px;line-height:1.5;}
// .page-d b{color:var(--ink);font-weight:600;}
// .pill{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:500;padding:3px 9px;border-radius:999px;border:1px solid;}
// .pdot{width:6px;height:6px;border-radius:50%;}
// .std{display:inline-block;font-size:10.5px;font-family:'IBM Plex Mono',monospace;background:var(--pweak);color:var(--primary);border:1px solid #cfe6df;border-radius:6px;padding:2px 7px;}
// .kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
// @media(max-width:900px){.kpi-row{grid-template-columns:repeat(2,1fr);}}
// .kpi{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:15px 16px;}
// .kpi .k{font-size:11.5px;color:var(--muted);}
// .kpi .v{font-size:26px;font-weight:600;margin-top:8px;letter-spacing:-.02em;}
// .kpi .v.gold{color:var(--gold);}.kpi .v.green{color:var(--green);}
// .kpi .s{font-size:11px;color:var(--muted);margin-top:4px;}
// .card{background:var(--surface);border:1px solid var(--line);border-radius:12px;}
// .card-h{padding:13px 16px;border-bottom:1px solid var(--line);font-weight:600;font-size:13.5px;display:flex;align-items:center;justify-content:space-between;}
// .card-h .sub{font-weight:400;color:var(--muted);font-size:11.5px;}
// .grid-conn{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;}
// .conn{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px;}
// .conn:hover{border-color:var(--line2);}
// .conn-top{display:flex;align-items:center;justify-content:space-between;}
// .conn-name{font-weight:600;font-size:13.5px;}
// .conn-pillar{font-size:11.5px;color:var(--muted);margin-top:2px;}
// .conn-meta{display:flex;justify-content:space-between;margin-top:10px;font-size:11.5px;color:var(--muted);}
// .conn-meta .mono{color:var(--ink);}
// .tbl-wrap{overflow:auto;}
// table.tbl{border-collapse:collapse;width:100%;font-size:12.5px;}
// .tbl th{position:sticky;top:0;background:#FAFBFC;text-align:left;font-weight:600;color:var(--muted);font-size:11px;padding:9px 12px;border-bottom:1px solid var(--line);white-space:nowrap;}
// .tbl td{padding:8px 12px;border-bottom:1px solid var(--line);white-space:nowrap;}
// .tbl tr:hover td{background:#FAFBFC;}
// .tbl td.id{font-family:'IBM Plex Mono',monospace;color:var(--primary);}
// .tbl td.num{font-family:'IBM Plex Mono',monospace;text-align:right;}
// .cell-gold{background:var(--goldw)!important;font-weight:600;}
// .tabbar{display:flex;gap:4px;flex-wrap:wrap;}
// .tabchip{font-size:12px;font-weight:500;padding:6px 12px;border-radius:7px;cursor:pointer;color:var(--muted);border:1px solid transparent;}
// .tabchip:hover{background:#fff;color:var(--ink);}
// .tabchip.on{background:var(--ink);color:#fff;}
// .dag{display:flex;align-items:center;flex-wrap:wrap;}
// .dag-node{background:var(--surface);border:1px solid var(--line);border-radius:9px;padding:10px 14px;min-width:120px;}
// .dag-node .dl{font-weight:600;font-size:12.5px;}
// .dag-node .ds{font-size:11px;color:var(--muted);margin-top:3px;}
// .dag-arrow{color:var(--line2);padding:0 4px;font-size:18px;}
// .lin-grid{display:grid;grid-template-columns:218px 1fr;gap:16px;}
// .lin-grid.with-detail{grid-template-columns:218px 1fr 296px;}
// @media(max-width:980px){.lin-grid,.lin-grid.with-detail{grid-template-columns:1fr;}}
// .lin-rail{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px;align-self:start;}
// .lin-search{width:100%;background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:7px 10px;font-size:12px;outline:none;margin-bottom:10px;}
// .lin-item{padding:8px 10px;border-radius:8px;cursor:pointer;border:1px solid transparent;}
// .lin-item:hover{background:var(--bg);}
// .lin-item.on{background:var(--pweak);border-color:#cfe6df;}
// .lin-item .li{font-family:'IBM Plex Mono',monospace;font-size:12.5px;font-weight:500;}
// .lin-item .ls{font-size:10.5px;color:var(--muted);margin-top:1px;}
// .canvas{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:8px;overflow:hidden;}
// .detail{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px;align-self:start;}
// .detail-type{font-size:10.5px;letter-spacing:.1em;color:var(--muted);font-weight:600;}
// .detail-id{font-family:'IBM Plex Mono',monospace;font-size:17px;font-weight:500;margin-top:3px;}
// .dl-list{margin-top:14px;display:grid;grid-template-columns:1fr auto;gap:9px 10px;font-size:12.5px;}
// .dl-list dt{color:var(--muted);}
// .dl-list dd{margin:0;font-family:'IBM Plex Mono',monospace;text-align:right;}
// .dnote{font-size:11.5px;color:var(--muted);line-height:1.5;margin-top:12px;background:var(--bg);border-radius:8px;padding:10px;}
// .er{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px 16px;margin-top:16px;display:flex;align-items:center;gap:14px;}
// .er .erv{font-size:22px;font-weight:600;color:var(--green);}
// .sim{margin-left:8px;font-size:10.5px;font-family:'IBM Plex Mono',monospace;color:var(--gold);border:1px solid var(--gold);border-radius:999px;padding:3px 9px;}
// .finding{background:var(--side);color:#e7edf1;border-radius:12px;padding:20px 22px;}
// .finding .fl{font-size:10.5px;letter-spacing:.14em;color:#7fe9cf;font-weight:600;}
// .finding .ft{font-size:16px;line-height:1.45;margin-top:9px;}
// `;

// function Pill({status}){const map={connected:[C.green,"Connected"],syncing:[C.amber,"Syncing"],error:[C.red,"Error"],success:[C.green,"Success"]};const[col,txt]=map[status]||[C.gray,status];return <span className="pill" style={{borderColor:col+"55",color:col,background:col+"12"}}><span className="pdot" style={{background:col}}/>{txt}</span>;}
// function Spark({seed}){const rng=mulberry32(seed);const pts=[];let y=10+rng()*8;for(let i=0;i<16;i++){y=clamp(y+(rng()-0.5)*7,2,22);pts.push((i/15*96).toFixed(1)+","+(24-y).toFixed(1));}return <svg width="96" height="26" style={{display:"block"}}><polyline points={pts.join(" ")} fill="none" stroke={C.primary} strokeWidth="1.4"/></svg>;}

// const COLX=[86,300,514,728,918], ROWY=[120,250,380], NW=152, NH=58;
// function LinNode({cx,cy,type,id,metric,gold,sel,kind,onClick}){let fill="#fff",stroke=C.line,sw=1;if(kind==="strain"){fill="#EAF2F0";stroke=C.primary;}if(gold){fill=C.goldWeak;stroke=C.gold;}if(sel){stroke=C.ink;sw=2.4;}return(<g onClick={onClick} style={{cursor:"pointer"}}><rect x={cx-NW/2} y={cy-NH/2} width={NW} height={NH} rx={10} fill={fill} stroke={stroke} strokeWidth={sw}/><text x={cx-NW/2+13} y={cy-15} style={{fontFamily:"Inter",fontSize:9,letterSpacing:"0.08em",fontWeight:600,fill:C.muted}}>{type}</text><text x={cx-NW/2+13} y={cy+3} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:500,fill:C.ink}}>{id}</text><text x={cx-NW/2+13} y={cy+19} style={{fontFamily:"Inter",fontSize:11,fill:C.muted}}>{metric}</text>{gold&&<circle cx={cx+NW/2-12} cy={cy-NH/2+12} r={3.5} fill={C.gold}/>}</g>);}
// function Lineage({strain,sel,setSel}){const rows=D.batches.filter(b=>b.strainId===strain.id);const E=(x1,y1,x2,y2,g)=><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={g?C.gold:"#C7CED4"} strokeWidth={g?2:1.3}/>;const is=(t,id)=>sel&&sel.type===t&&sel.id===id;return(<svg viewBox="0 0 980 470" width="100%" style={{display:"block"}}>{PILLARS.map((p,i)=>(<g key={p.key}><text x={COLX[i]} y={26} textAnchor="middle" style={{fontFamily:"Inter",fontSize:11.5,fontWeight:600,fill:C.ink}}>{p.label}</text><text x={COLX[i]} y={42} textAnchor="middle" style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9.5,fill:C.muted}}>{p.conn}</text></g>))}{rows.map((b,r)=>{const y=ROWY[r];return(<g key={"e"+b.id}>{E(COLX[0]+NW/2,ROWY[1],COLX[1]-NW/2,y,b.band)}{E(COLX[1]+NW/2,y,COLX[2]-NW/2,y,b.band)}{E(COLX[2]+NW/2,y,COLX[3]-NW/2,y,b.band)}{E(COLX[3]+NW/2,y,COLX[4]-NW/2,y,b.band)}</g>);})}<LinNode cx={COLX[0]} cy={ROWY[1]} kind="strain" type="STRAIN" id={strain.id} metric={strain.promoter+" promoter"} sel={is("strain",strain.id)} onClick={()=>setSel({type:"strain",id:strain.id})}/>{rows.map((b,r)=>{const y=ROWY[r];const lot=D.lots.find(l=>l.batchId===b.id);const fn=D.funcs.find(f=>f.lotId===lot.id);const ap=D.appts.find(a=>a.lotId===lot.id);return(<g key={"n"+b.id}><LinNode cx={COLX[1]} cy={y} type="BATCH" id={b.id} metric={"DO "+b.doExp+"%"} gold={b.band} sel={is("batch",b.id)} onClick={()=>setSel({type:"batch",id:b.id})}/><LinNode cx={COLX[2]} cy={y} type="LOT" id={lot.id} metric={"recov "+lot.recovery+"%"} gold={b.band} sel={is("lot",lot.id)} onClick={()=>setSel({type:"lot",id:lot.id})}/><LinNode cx={COLX[3]} cy={y} type="FUNC TEST" id={fn.id} metric={"integ "+fn.integrity} gold={b.band} sel={is("func",fn.id)} onClick={()=>setSel({type:"func",id:fn.id})}/><LinNode cx={COLX[4]} cy={y} type="APP TEST" id={ap.id} metric={"melt "+ap.melt} gold={b.band} sel={is("app",ap.id)} onClick={()=>setSel({type:"app",id:ap.id})}/></g>);})}</svg>);}
// function LinDetail({sel}){let type,id,fields,note,band;if(sel.type==="strain"){const s=D.strains.find(x=>x.id===sel.id);type="STRAIN";id=s.id;fields=[["Host",s.host],["Promoter",s.promoter],["Copy number",s.copy],["Codon",s.codon],["Signal",s.signal],["Engineer",s.engineer]];}else if(sel.type==="batch"){const b=D.batches.find(x=>x.id===sel.id);band=b.band;type="FERMENTATION BATCH";id=b.id;fields=[["Reactor",b.reactor],["Scale",b.scale+" L"],["DO (exp.)",b.doExp+"%"],["Titer",b.titer+" g/L"],["pH",b.ph],["Temp",b.temp+"°C"],["Feed",b.feed]];note="Exponential-phase DO of "+b.doExp+"% "+(b.band?"is inside":"is outside")+" the 27–34% sweet spot.";}else if(sel.type==="lot"){const l=D.lots.find(x=>x.id===sel.id);type="DOWNSTREAM LOT";id=l.id;fields=[["Capture",l.resin],["Recovery",l.recovery+"%"],["Purity",l.purity+"%"],["Endotoxin",l.endo+" EU/mg"],["Mass",l.mass+" g"]];}else if(sel.type==="func"){const f=D.funcs.find(x=>x.id===sel.id);type="FUNCTIONALITY TEST";id=f.id;fields=[["Instrument",f.instrument],["Micelle integrity",f.integrity],["Phosphorylation",f.phos+"%"],["Solubility",f.sol+"%"],["Gelation",f.gel+"°C"]];}else{const a=D.appts.find(x=>x.id===sel.id);band=a.band;type="APPLICATION TEST";id=a.id;fields=[["Application",a.app],["Meltability",a.melt],["Stretch",a.stretch],["Off-note",a.off],["Source DO",a.doExp+"%"]];note="Traces back to a single fermentation choice — DO "+a.doExp+"%.";}return(<div className="detail"><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div className="detail-type">{type}</div><div className="detail-id">{id}</div></div>{band!==undefined&&<span className="pill" style={{borderColor:(band?C.gold:C.gray)+"66",color:band?C.gold:C.muted,background:(band?C.gold:C.gray)+"15"}}>{band?"golden":"off-band"}</span>}</div><dl className="dl-list">{fields.map(([k,v])=><React.Fragment key={k}><dt>{k}</dt><dd style={{fontFamily:typeof v==="string"&&isNaN(parseFloat(v))?"Inter":undefined}}>{v}</dd></React.Fragment>)}</dl>{note&&<div className="dnote">{note}</div>}</div>);}

// const TABLES={
//   Strains:{rows:()=>D.strains,cols:[["id","strain_id","id"],["host","host_strain"],["promoter","promoter"],["copy","copy_number"],["codon","codon_opt"],["signal","signal_peptide"],["engineer","engineer"]]},
//   Fermentation_Batches:{rows:()=>D.batches,cols:[["id","batch_id","id"],["strainId","strain_id"],["reactor","bioreactor_id"],["scale","scale_L","num"],["feed","feed_strategy"],["doExp","do_exp_pct","num","band"],["ph","ph","num"],["temp","temp_C","num"],["titer","titer_g_L","num"]]},
//   Downstream_Lots:{rows:()=>D.lots,cols:[["id","lot_id","id"],["batchId","batch_id"],["resin","capture_resin"],["recovery","recovery_pct","num"],["purity","purity_pct","num"],["endo","endotoxin_EU_mg","num"],["mass","final_mass_g","num"]]},
//   Functionality_Tests:{rows:()=>D.funcs,cols:[["id","test_id","id"],["lotId","lot_id"],["instrument","instrument"],["integrity","micelle_integrity","num"],["phos","phosphorylation_pct","num"],["sol","solubility_pct","num"],["gel","gelation_temp_C","num"]]},
//   Application_Tests:{rows:()=>D.appts,cols:[["id","app_id","id"],["lotId","lot_id"],["app","application"],["melt","meltability","num"],["stretch","stretch","num"],["off","off_note_flag"],["doExp","src_do_exp_pct","num","band"]]},
// };

// export default function App(){
//   const [screen,setScreen]=useState("connections");
//   const [strainId,setStrainId]=useState(D.strains[0].id);
//   const [sel,setSel]=useState({type:"strain",id:D.strains[0].id});
//   const [tbl,setTbl]=useState("Fermentation_Batches");
//   const [q,setQ]=useState("");
//   const strain=D.strains.find(s=>s.id===strainId);
//   const scatter=useMemo(()=>D.appts.map(a=>({doExp:a.doExp,melt:a.melt,band:a.band,id:a.id})),[]);
//   const buckets=useMemo(()=>[[14,22],[22,27],[27,34],[34,40],[40,46]].map(([a,b])=>{const xs=D.appts.filter(p=>p.doExp>=a&&p.doExp<b);return{range:a+"–"+b,melt:xs.length?r1(mean(xs.map(p=>p.melt))):0,band:a===27};}),[]);
//   const title={connections:"Connections",pipelines:"Pipelines",lineage:"Graph database",browser:"Data browser",insights:"Insights"}[screen];
//   return(<><style>{css}</style><div className="cons">
//     <aside className="side">
//       <div className="side-top"><div className="logo"><div className="logo-mark"/><div className="logo-txt">THREAD</div></div>
//         <div className="ws"><div className="ws-name">Formo</div><div className="ws-sub">AI Integration Layer</div></div></div>
//       <nav className="nav">{NAV.map(g=>(<div key={g.sect}><div className="nav-sect">{g.sect}</div>{g.items.map(([k,l])=>(<div key={k} className={"nav-item"+(screen===k?" on":"")} onClick={()=>setScreen(k)}><span className="nav-dot"/>{l}</div>))}</div>))}</nav>
//       <div className="side-foot">Simulated dataset · 12 strains · {D.batches.length} batches.</div>
//     </aside>
//     <div className="main">
//       <div className="top">
//         <div className="crumb">Formo / <b>{title}</b></div>
//         <input className="search" placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)}/>
//         <div className="env" style={{borderColor:"#cfe6df",color:C.primary}}><span className="dot2" style={{background:C.primary}}/>Open source · self-hosted</div>
//         <div className="env"><span className="dot2"/>Production · EU-Frankfurt</div>
//         <div className="avatar">SN</div>
//       </div>
//       <div className="content">
//         {screen==="connections"&&<>
//           <div style={{marginBottom:20}}><div className="page-t">Connections</div><div className="page-d">Collecting data from every part of the process — strain engineering through downstream — over open standards, sitting on top of existing systems so nothing is replaced. <b>OPC UA</b> for bioreactor data (temperature, pH, dissolved oxygen, feed rates), <b>AnIML + SiLA</b> for lab instruments, and <b>APIs</b> for ELNs, spreadsheets, and LIMS.</div></div>
//           <div className="grid-conn">{SOURCES.map(s=>(<div key={s.sys} className="conn"><div className="conn-top"><div><div className="conn-name">{s.sys}</div><div className="conn-pillar">{s.pillar}</div></div><Pill status={s.status}/></div><div style={{marginTop:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}><span className="std">{s.std}</span><Spark seed={s.sys.length*7+s.records}/></div><div style={{fontSize:11.5,color:C.muted,marginTop:10}}>{s.type}</div><div className="conn-meta"><span>last sync <span className="mono">{s.sync}</span></span><span><span className="mono">{s.records}</span> records · {s.freq}</span></div></div>))}</div>
//         </>}
//         {screen==="pipelines"&&<>
//           <div style={{marginBottom:20}}><div className="page-t">Pipelines</div><div className="page-d">Orchestration tools (Prefect / Airflow) keep the data continually updated — scheduled jobs ingest from each source, resolve IDs, load the graph, and refresh the analytics, with no manual upkeep.</div></div>
//           <div className="dag" style={{marginBottom:18}}>{[["Ingest","5 sources"],["Resolve IDs","entity match"],["Thread","genealogy graph"],["Load","graph + warehouse"],["Analyze","models refresh"]].map((d,i,arr)=>(<React.Fragment key={d[0]}><div className="dag-node"><div className="dl">{d[0]}</div><div className="ds">{d[1]}</div></div>{i<arr.length-1&&<span className="dag-arrow">→</span>}</React.Fragment>))}</div>
//           <div className="card"><div className="card-h">Sync jobs<span className="sub">all healthy · last cycle 02:14</span></div><div className="tbl-wrap"><table className="tbl"><thead><tr><th>Job</th><th>Source</th><th>Schedule</th><th>Last run</th><th>Duration</th><th>Records</th><th>Status</th></tr></thead><tbody>{SOURCES.map((s,i)=>(<tr key={s.sys}><td className="id">job_{s.pillar.slice(0,4).toLowerCase()}</td><td>{s.sys}</td><td className="mono">{["*/1 * * * *","@1Hz→1m","per step","per run","*/15 * * * *"][i]}</td><td>{s.sync}</td><td className="num">{(0.4+i*0.3).toFixed(1)}s</td><td className="num">{s.records}</td><td><Pill status={s.status==="syncing"?"syncing":"success"}/></td></tr>))}</tbody></table></div></div>
//         </>}
//         {screen==="lineage"&&<>
//           <div style={{marginBottom:20}}><div className="page-t">Graph database</div><div className="page-d">A graph database (Neo4j) — rather than a table database — stores each strain, batch, lot, and test as a <b>node</b>, with <b>edges</b> for the relationships between them. Select a node to trace it from strain to final application result.</div></div>
//           <div className={"lin-grid"+(sel?" with-detail":"")}>
//             <div className="lin-rail"><input className="lin-search" placeholder="Filter strains…" value={q} onChange={e=>setQ(e.target.value)}/>{D.strains.filter(s=>s.id.toLowerCase().includes(q.toLowerCase())).map(s=>{const gb=D.batches.filter(b=>b.strainId===s.id&&b.band).length;return(<div key={s.id} className={"lin-item"+(s.id===strainId?" on":"")} onClick={()=>{setStrainId(s.id);setSel({type:"strain",id:s.id});}}><div className="li">{s.id}</div><div className="ls">{s.promoter} · {gb}/3 golden</div></div>);})}</div>
//             <div className="canvas"><Lineage strain={strain} sel={sel} setSel={setSel}/></div>
//             {sel&&<LinDetail sel={sel}/>}
//           </div>
//           <div className="er"><div className="erv">100%</div><div style={{fontSize:12.5,color:C.muted,lineHeight:1.5}}><b style={{color:C.ink}}>Entity resolution</b> · {D.batches.length}/{D.batches.length} records auto-matched across systems by genealogy key. 0 in review.<span className="sim">simulated</span></div></div>
//         </>}
//         {screen==="browser"&&<>
//           <div style={{marginBottom:20}}><div className="page-t">Data browser</div><div className="page-d">The underlying records behind the graph — the warehouse view that holds the high-volume numbers. Gold marks fermentation runs inside the DO sweet spot.</div></div>
//           <div className="tabbar" style={{marginBottom:14}}>{Object.keys(TABLES).map(t=>(<div key={t} className={"tabchip"+(t===tbl?" on":"")} onClick={()=>setTbl(t)}>{t}</div>))}</div>
//           <div className="card"><div className="card-h">{tbl}<span className="sub">{TABLES[tbl].rows().length} rows</span></div><div className="tbl-wrap" style={{maxHeight:460}}><table className="tbl"><thead><tr>{TABLES[tbl].cols.map(c=><th key={c[0]}>{c[1]}</th>)}</tr></thead><tbody>{TABLES[tbl].rows().map((row,ri)=>(<tr key={ri}>{TABLES[tbl].cols.map(c=>{const cls=c[2]==="id"?"id":c[2]==="num"?"num":"";const gold=c[3]==="band"&&row.band;return<td key={c[0]} className={cls+(gold?" cell-gold":"")}>{String(row[c[0]])}</td>;})}</tr>))}</tbody></table></div></div>
//         </>}
//         {screen==="insights"&&<>
//           <div style={{marginBottom:20}}><div className="page-t">Insights</div><div className="page-d">Python-based statistical models, tailored to Formo's metrics and KPIs, that discover optimization opportunities to augment human decision-making — here, correlating fermentation conditions with functionality in final application testing.</div></div>
//           <div className="kpi-row">
//             <div className="kpi"><div className="k">Meltability lift, in-band</div><div className="v gold">+{STATS.lift}</div><div className="s">{STATS.inMean} vs {STATS.outMean} off-band</div></div>
//             <div className="kpi"><div className="k">R² · DO distance → melt</div><div className="v">{STATS.r2}</div><div className="s">across {D.appts.length} batches</div></div>
//             <div className="kpi"><div className="k">DO sweet spot</div><div className="v">27–34<span style={{fontSize:15}}>%</span></div><div className="s">exponential-phase O₂</div></div>
//             <div className="kpi"><div className="k">Golden batches</div><div className="v green">{STATS.nIn}</div><div className="s">of {D.batches.length} runs</div></div>
//           </div>
//           <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:14,marginTop:14}}>
//             <div className="card"><div className="card-h">Exponential-phase DO vs meltability<span className="sub">gold = in sweet spot</span></div><div style={{padding:"14px 12px 6px"}}><ResponsiveContainer width="100%" height={300}><ScatterChart margin={{top:6,right:18,bottom:24,left:0}}><CartesianGrid stroke={C.line}/><ReferenceArea x1={27} x2={34} fill={C.goldWeak} fillOpacity={0.7}/><XAxis type="number" dataKey="doExp" domain={[14,46]} tick={{fontSize:11,fill:C.muted}} label={{value:"DO (%)",position:"bottom",offset:6,fontSize:11,fill:C.muted}}/><YAxis type="number" dataKey="melt" domain={[30,100]} tick={{fontSize:11,fill:C.muted}} width={34}/><Tooltip cursor={{strokeDasharray:"3 3"}} contentStyle={{fontSize:12,borderRadius:8,border:"1px solid "+C.line}}/><Scatter data={scatter}>{scatter.map((p,i)=><Cell key={i} fill={p.band?C.gold:C.gray}/>)}</Scatter></ScatterChart></ResponsiveContainer></div></div>
//             <div className="card"><div className="card-h">Avg meltability by DO band</div><div style={{padding:"14px 12px 6px"}}><ResponsiveContainer width="100%" height={300}><BarChart data={buckets} margin={{top:6,right:10,bottom:24,left:0}}><CartesianGrid stroke={C.line} vertical={false}/><XAxis dataKey="range" tick={{fontSize:10.5,fill:C.muted}} label={{value:"DO (%)",position:"bottom",offset:6,fontSize:11,fill:C.muted}}/><YAxis domain={[0,100]} tick={{fontSize:11,fill:C.muted}} width={34}/><Tooltip contentStyle={{fontSize:12,borderRadius:8,border:"1px solid "+C.line}} cursor={{fill:"#00000008"}}/><Bar dataKey="melt" radius={[4,4,0,0]}>{buckets.map((b,i)=><Cell key={i} fill={b.band?C.gold:C.gray}/>)}</Bar></BarChart></ResponsiveContainer></div></div>
//           </div>
//           <div className="finding" style={{marginTop:14}}><div className="fl">FINDING</div><div className="ft">No single system holds this. Fermentation logs dissolved oxygen; the application lab logs meltability weeks later. Only once they're threaded does the sweet spot appear — a control lever, surfaced automatically.</div></div>
//         </>}
//       </div>
//     </div>
//   </div></>);
// }