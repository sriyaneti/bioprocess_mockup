// scrollable outer website showcases the simulated data 
// and brief overview of mock up

import React, { useState, useRef, useEffect } from "react";
import { D, STATS, r1 } from "./data.js"; // simulated dataset and stats

const siteCss = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
body{margin:0;}
.site{background:#F6F7F9;color:#1B2229;font-family:'Inter',system-ui,sans-serif;overflow-x:hidden;-webkit-font-smoothing:antialiased;font-size:13px;}
.site *{box-sizing:border-box;}
.s-reveal{opacity:0;transform:translateY(12px);transition:opacity 0.45s ease,transform 0.45s ease;}
.s-reveal.s-vis{opacity:1;transform:translateY(0);}
.sd1{transition-delay:0.05s;}.sd2{transition-delay:0.1s;}.sd3{transition-delay:0.15s;}.sd4{transition-delay:0.2s;}.sd5{transition-delay:0.25s;}
.s-header{background:#10171C;padding:0 18px;height:52px;display:flex;align-items:center;gap:9px;border-bottom:1px solid rgba(255,255,255,.07);}
.s-header-title{font-family:'Inter',sans-serif;font-size:13px;font-weight:700;color:#fff;letter-spacing:0.16em;margin:0;text-transform:uppercase;}
.s-banner{display:flex;align-items:center;gap:9px;background:#E6F2EF;border-bottom:1px solid #cfe6df;color:#0B6E5F;font-size:12.5px;font-weight:500;padding:10px 28px;line-height:1.4;}
.s-banner b{font-weight:700;}
.s-part{display:flex;flex-direction:column;padding:24px 28px 32px;}
.s-part1{background:#F5EFE6;}
.s-part2{background:#10171C;padding:32px 28px 40px;}
.s-part-h{font-size:20px;font-weight:600;color:#1B2229;letter-spacing:-0.01em;margin:0 0 6px;}
.s-part-sub{font-size:13px;color:#69727C;line-height:1.55;white-space:nowrap;margin:0 0 16px;}
.s-part-h2{font-size:20px;font-weight:600;color:#dfe5ea;letter-spacing:-0.01em;margin:0 0 20px;}
.s-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
@media(max-width:820px){.s-cards{grid-template-columns:1fr;}}
.s-card{background:#fff;border:1px solid #E5E8EC;border-radius:12px;overflow:hidden;}
.s-card:hover{border-color:#D6DBE0;}
.s-card-hd{padding:13px 15px;border-bottom:1px solid #E5E8EC;}
.s-card-title{font-weight:600;font-size:13.5px;color:#1B2229;}
.s-card-conn{font-family:'IBM Plex Mono',monospace;font-size:10px;color:#0B6E5F;margin-top:3px;letter-spacing:0.05em;}
.s-card-row{display:flex;justify-content:space-between;align-items:baseline;padding:7px 15px;border-bottom:1px solid #F1F3F5;font-size:12.5px;}
.s-card-row:last-child{border-bottom:none;}
.s-rk{color:#69727C;}
.s-rv{font-family:'IBM Plex Mono',monospace;color:#1B2229;font-size:11.5px;}
.s-analysis{font-size:12.5px;color:#69727C;line-height:1.6;margin-top:14px;padding:13px 15px;background:#fff;border:1px solid #E5E8EC;border-radius:12px;}
.s-note{font-size:11.5px;color:#9FAAB4;margin-top:10px;line-height:1.5;}
.s-note .mono{color:#69727C;}
.s-btn-cta{display:inline-flex;align-items:center;gap:9px;font-size:15px;font-weight:600;background:#0B6E5F;color:#fff;border:none;border-radius:11px;padding:15px 26px;cursor:pointer;transition:background 0.2s;}
.s-btn-cta:hover{background:#0a5d51;}
@keyframes sRiseUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
`;

function useReveal(){
  const ref=useRef(null);
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    const el=ref.current;
    if(!el)return;
    const obs=new IntersectionObserver(
      ([entry])=>{if(entry.isIntersecting){setVisible(true);obs.disconnect();}},
      {threshold:0.1,rootMargin:"0px 0px -50px 0px"}
    );
    obs.observe(el);
    return()=>obs.disconnect();
  },[]);
  return[ref,visible];
}

export default function Presentation({onLaunch}){
  const s0=D.strains[0],b0=D.batches.find(b=>b.strainId===s0.id),l0=D.lots.find(l=>l.batchId===b0.id);
  const cards=[
    {t:"Strain Engineering",c:"StrainBase ELN · REST API",rows:[
      ["Strain ID",s0.id],["Host organism",s0.host],["Promoter",s0.promoter],
      ["Signal peptide",s0.signal],["Modification",s0.mod],["Copy number",s0.copy],
      ["Codon opt.",s0.codon],["Growth rate (μ)","~0.42 h⁻¹"],
      ["Plasmid size","~5.4 kb"],["Antibiotic sel.","Ampicillin 100 μg/mL"],
      ["Engineer",s0.engineer],
    ]},
    {t:"Fermentation",c:"BioCommand SCADA · OPC-UA",rows:[
      ["Batch ID",b0.id],["Bioreactor",b0.reactor],["Scale",b0.scale+" L"],
      ["DO (exp. phase)",b0.doExp+"%"],["Induction OD600",b0.indod],
      ["Titer",b0.titer+" g/L"],["pH",b0.ph],["Temperature",b0.temp+" °C"],
      ["Feed strategy",b0.feed],["Run duration",b0.runh+" h"],
      ["Vol. productivity",r1(b0.titer/b0.runh)+" g/L/h"],
    ]},
    {t:"Downstream Processing",c:"PuriTrack MES · OPC-UA / API",rows:[
      ["Lot ID",l0.id],["Capture resin",l0.resin],["Step recovery",l0.recovery+"%"],
      ["Purity",l0.purity+"%"],["Endotoxin",l0.endo+" EU/mg"],
      ["Final mass",l0.mass+" g"],["Buffer","PBS pH 7.4"],
      ["Concentration",r1(l0.mass/0.05)+" mg/mL"],["Aggregate content","<2%"],
      ["Storage temp.","-80 °C"],["Shelf life est.","18 months"],
    ]},
  ];
  const analysis=`Across ${D.batches.length} fermentation batches derived from 12 engineered E. coli BL21 strains, exponential-phase dissolved oxygen proved the strongest predictor of downstream meltability (R² = ${STATS.r2}). Batches held within the 27–34% DO sweet spot produced casein with a mean meltability score of ${STATS.inMean} — ${STATS.lift} points above off-band runs — demonstrating that a single fermentation control lever propagates measurable quality differences through to the application panel. Threading records across five source systems via a shared genealogy key surfaced this cross-pillar insight automatically, achieving 100% entity resolution across all ${D.batches.length} records.`;
  const [sec1Ref,sec1Vis]=useReveal();
  const [sec2Ref,sec2Vis]=useReveal();
  return(<>
    <style>{siteCss}</style>
    <div className="site">
      <header className="s-header">
        <h1 className="s-header-title">AI-Integration Layer Mock Up</h1>
      </header>
      <div className="s-banner"><b>Adapted based on Formo's existing platform</b> — focused on orchestration + analytics as the highest-impact areas.</div>
      <section className="s-part s-part1" ref={sec1Ref}>
        <div className={"s-reveal"+(sec1Vis?" s-vis":"")}>
          <h2 className="s-part-h">Simulated Dataset</h2>
          <p className="s-part-sub">The following AI-driven integration layer demo utilizes a simulated dataset based on metrics I created. Below you can find the data specifications.</p>
        </div>
        <div className="s-cards">
          {cards.map((c,i)=>(<div key={c.t} className={"s-card s-reveal"+(sec1Vis?" s-vis":"")+" sd"+(i+1)}>
            <div className="s-card-hd"><div className="s-card-title">{c.t}</div><div className="s-card-conn">{c.c}</div></div>
            {c.rows.map(([k,v])=>(<div key={k} className="s-card-row"><span className="s-rk">{k}</span><span className="s-rv">{v}</span></div>))}
          </div>))}
        </div>
        <p className={"s-analysis s-reveal"+(sec1Vis?" s-vis":"")+" sd4"}>{analysis}</p>
      </section>
      <section className="s-part s-part2" ref={sec2Ref}>
        <div className={"s-reveal"+(sec2Vis?" s-vis":"")}>
          <h2 className="s-part-h2">The Integration Layer</h2>
          <button className="s-btn-cta" onClick={onLaunch}>Launch Demo</button>
        </div>
      </section>
    </div>
  </>);
}
