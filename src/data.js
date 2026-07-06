// simulated data values (for the dataset)

// src/data.js — shared simulated dataset for the outer site + integration layer.
// All data is SIMULATED. Production reads real systems via OPC UA, AnIML + SiLA, APIs.

export function mulberry32(a){return function(){a|=0;a=(a+0x6d2b79f5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
export const clamp=(x,lo,hi)=>Math.max(lo,Math.min(hi,x));
export const r1=x=>Math.round(x*10)/10;
export const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
function pearson(xs,ys){const mx=mean(xs),my=mean(ys);let nu=0,dx=0,dy=0;for(let i=0;i<xs.length;i++){nu+=(xs[i]-mx)*(ys[i]-my);dx+=(xs[i]-mx)**2;dy+=(ys[i]-my)**2;}return nu/Math.sqrt(dx*dy);}

function build(){
  const rng=mulberry32(7);
  const proms=["T7","tac","araBAD","T7lac","rhaBAD"], sigs=["pelB","OmpA","DsbA","cytoplasmic","PhoA"];
  const modz=["DnaK/DnaJ co-expr","trxB/gor host","SpyTag fusion","high-copy RBS","native"];
  const copies=["low (5–10)","medium (15–20)","high (>50)"], codon=["optimized","native"];
  const engs=["A. Roth","M. Lindqvist","J. Okafor","S. Park"], feeds=["exponential","DO-stat","pH-stat","constant"];
  const rx=["BR-2L-01","BR-2L-02","BR-10L-01","BR-10L-02"], resins=["Protein-affinity","IEX-Q","MMC"], apps=["mozzarella analog","cream cheese","process cheese","barista milk"];
  const strains=[],batches=[],lots=[],funcs=[],appts=[]; let n=0;
  for(let i=0;i<12;i++){
    const sid="S"+String(i+1).padStart(2,"0");
    strains.push({id:sid,host:"E. coli BL21",promoter:proms[(rng()*proms.length)|0],signal:sigs[(rng()*sigs.length)|0],mod:modz[(rng()*modz.length)|0],copy:copies[(rng()*copies.length)|0],codon:codon[(rng()*codon.length)|0],engineer:engs[(rng()*engs.length)|0]});
    for(let b=0;b<3;b++){
      n++; const bid="B"+String(n).padStart(3,"0"),lid="L"+String(n).padStart(3,"0"),fid="F"+String(n).padStart(3,"0"),aid="A"+String(n).padStart(3,"0");
      const doExp=16+rng()*28, ph=6.8+rng()*0.5, temp=30+rng()*7, indod=0.6+rng()*1.8, titer=2.0+rng()*4.5;
      const feed=feeds[(rng()*feeds.length)|0], scale=[2,2,10][(rng()*3)|0], runh=28+((rng()*24)|0);
      const yld=clamp(55+(titer-2)*4+rng()*10,40,93), pur=clamp(88+rng()*9,85,99);
      const integ=clamp(96-2.1*Math.abs(doExp-30)+rng()*6,28,100), sol=clamp(70+integ*0.22+rng()*7,58,99), gel=clamp(58+rng()*10,52,72);
      const melt=clamp(88-2.4*Math.abs(doExp-30)+0.12*(pur-90)+(rng()-0.5)*8,34,100), stretch=clamp(melt*0.7+rng()*15,20,100);
      const band=doExp>=27&&doExp<=34;
      batches.push({id:bid,strainId:sid,doExp:r1(doExp),ph:r1(ph),temp:r1(temp),indod:r1(indod),titer:r1(titer),feed,scale,runh,reactor:rx[(rng()*rx.length)|0],band});
      lots.push({id:lid,batchId:bid,resin:resins[(rng()*resins.length)|0],recovery:r1(yld),purity:r1(pur),endo:r1(clamp(0.5+rng()*4,0.1,6)),mass:r1(clamp(titer*scale*yld/100,1,400))});
      funcs.push({id:fid,lotId:lid,instrument:["LabX-HPLC","Octet-BLI","DLS-ZetaSizer"][(rng()*3)|0],integrity:r1(integ),phos:r1(clamp(integ*0.8+rng()*8,20,95)),sol:r1(sol),gel:r1(gel)});
      appts.push({id:aid,lotId:lid,app:apps[(rng()*apps.length)|0],melt:r1(melt),stretch:r1(stretch),off:rng()<0.15?"yes":"no",doExp:r1(doExp),band});
    }
  }
  return {strains,batches,lots,funcs,appts};
}

export const D = build();

export const SOURCES=[
  {sys:"StrainBase ELN",pillar:"Strain engineering",std:"API",type:"ELN records",freq:"on change",records:12,status:"connected",sync:"6m ago"},
  {sys:"BioCommand SCADA",pillar:"Fermentation",std:"OPC UA",type:"temp · pH · DO · feed rates",freq:"1 Hz",records:36,status:"connected",sync:"2m ago"},
  {sys:"PuriTrack MES",pillar:"Downstream",std:"OPC UA / API",type:"purification steps",freq:"per step",records:36,status:"connected",sync:"4m ago"},
  {sys:"LabX Analytics",pillar:"Functionality",std:"AnIML + SiLA",type:"lab instrument results",freq:"per run",records:36,status:"syncing",sync:"now"},
  {sys:"AppPanel Sheets",pillar:"Application",std:"API",type:"spreadsheets · LIMS",freq:"per study",records:36,status:"connected",sync:"31m ago"},
];

export const PILLARS=[
  {key:"strain",label:"Strain engineering",conn:"API"},
  {key:"ferm",label:"Fermentation",conn:"OPC UA"},
  {key:"down",label:"Downstream",conn:"OPC UA / MES"},
  {key:"func",label:"Functionality",conn:"AnIML + SiLA"},
  {key:"app",label:"Application",conn:"API"},
];

export const STATS=(()=>{const inB=D.appts.filter(a=>a.band).map(a=>a.melt),outB=D.appts.filter(a=>!a.band).map(a=>a.melt);const r=pearson(D.appts.map(a=>Math.abs(a.doExp-30)),D.appts.map(a=>a.melt));return{inMean:r1(mean(inB)),outMean:r1(mean(outB)),lift:r1(mean(inB)-mean(outB)),r2:Math.round(r*r*100)/100,nIn:inB.length};})();

export const TABLES={
  Strains:{rows:()=>D.strains,cols:[["id","strain_id","id"],["host","host_strain"],["promoter","promoter"],["copy","copy_number"],["codon","codon_opt"],["signal","signal_peptide"],["engineer","engineer"]]},
  Fermentation_Batches:{rows:()=>D.batches,cols:[["id","batch_id","id"],["strainId","strain_id"],["reactor","bioreactor_id"],["scale","scale_L","num"],["feed","feed_strategy"],["doExp","do_exp_pct","num","band"],["ph","ph","num"],["temp","temp_C","num"],["titer","titer_g_L","num"]]},
  Downstream_Lots:{rows:()=>D.lots,cols:[["id","lot_id","id"],["batchId","batch_id"],["resin","capture_resin"],["recovery","recovery_pct","num"],["purity","purity_pct","num"],["endo","endotoxin_EU_mg","num"],["mass","final_mass_g","num"]]},
  Functionality_Tests:{rows:()=>D.funcs,cols:[["id","test_id","id"],["lotId","lot_id"],["instrument","instrument"],["integrity","micelle_integrity","num"],["phos","phosphorylation_pct","num"],["sol","solubility_pct","num"],["gel","gelation_temp_C","num"]]},
  Application_Tests:{rows:()=>D.appts,cols:[["id","app_id","id"],["lotId","lot_id"],["app","application"],["melt","meltability","num"],["stretch","stretch","num"],["off","off_note_flag"],["doExp","src_do_exp_pct","num","band"]]},
};