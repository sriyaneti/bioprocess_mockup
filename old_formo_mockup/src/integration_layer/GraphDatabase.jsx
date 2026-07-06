// src/integration_layer/GraphDatabase.jsx — Step 3: STORE (graph database)
import React, { useState } from "react";
import { C } from "./theme";
import { D, PILLARS } from "../data";

const COLX = [86, 300, 514, 728, 918], ROWY = [120, 250, 380], NW = 152, NH = 58;

function badge(band) {
  const col = band ? C.gold : C.gray;
  return { display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 999, border: `1px solid ${col}66`, color: band ? C.gold : C.muted, background: col + "15" };
}

function LinNode({ cx, cy, type, id, metric, gold, sel, kind, onClick }) {
  let fill = "#fff", stroke = C.line, sw = 1;
  if (kind === "strain") { fill = "#EAF2F0"; stroke = C.primary; }
  if (gold) { fill = C.goldWeak; stroke = C.gold; }
  if (sel) { stroke = C.ink; sw = 2.4; }
  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      <rect x={cx - NW / 2} y={cy - NH / 2} width={NW} height={NH} rx={10} fill={fill} stroke={stroke} strokeWidth={sw} />
      <text x={cx - NW / 2 + 13} y={cy - 15} style={{ fontFamily: "Inter", fontSize: 9, letterSpacing: "0.08em", fontWeight: 600, fill: C.muted }}>{type}</text>
      <text x={cx - NW / 2 + 13} y={cy + 3} style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, fontWeight: 500, fill: C.ink }}>{id}</text>
      <text x={cx - NW / 2 + 13} y={cy + 19} style={{ fontFamily: "Inter", fontSize: 11, fill: C.muted }}>{metric}</text>
      {gold && <circle cx={cx + NW / 2 - 12} cy={cy - NH / 2 + 12} r={3.5} fill={C.gold} />}
    </g>
  );
}

function Lineage({ strain, sel, setSel }) {
  const rows = D.batches.filter((b) => b.strainId === strain.id);
  const E = (x1, y1, x2, y2, g) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={g ? C.gold : "#C7CED4"} strokeWidth={g ? 2 : 1.3} />;
  const is = (t, id) => sel && sel.type === t && sel.id === id;
  return (
    <svg viewBox="0 0 980 470" width="100%" style={{ display: "block" }}>
      {PILLARS.map((p, i) => (
        <g key={p.key}>
          <text x={COLX[i]} y={26} textAnchor="middle" style={{ fontFamily: "Inter", fontSize: 11.5, fontWeight: 600, fill: C.ink }}>{p.label}</text>
          <text x={COLX[i]} y={42} textAnchor="middle" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, fill: C.muted }}>{p.conn}</text>
        </g>
      ))}
      {rows.map((b, r) => { const y = ROWY[r]; return (
        <g key={"e" + b.id}>
          {E(COLX[0] + NW / 2, ROWY[1], COLX[1] - NW / 2, y, b.band)}
          {E(COLX[1] + NW / 2, y, COLX[2] - NW / 2, y, b.band)}
          {E(COLX[2] + NW / 2, y, COLX[3] - NW / 2, y, b.band)}
          {E(COLX[3] + NW / 2, y, COLX[4] - NW / 2, y, b.band)}
        </g>); })}
      <LinNode cx={COLX[0]} cy={ROWY[1]} kind="strain" type="STRAIN" id={strain.id} metric={strain.promoter + " promoter"} sel={is("strain", strain.id)} onClick={() => setSel({ type: "strain", id: strain.id })} />
      {rows.map((b, r) => {
        const y = ROWY[r];
        const lot = D.lots.find((l) => l.batchId === b.id);
        const fn = D.funcs.find((f) => f.lotId === lot.id);
        const ap = D.appts.find((a) => a.lotId === lot.id);
        return (
          <g key={"n" + b.id}>
            <LinNode cx={COLX[1]} cy={y} type="BATCH" id={b.id} metric={"DO " + b.doExp + "%"} gold={b.band} sel={is("batch", b.id)} onClick={() => setSel({ type: "batch", id: b.id })} />
            <LinNode cx={COLX[2]} cy={y} type="LOT" id={lot.id} metric={"recov " + lot.recovery + "%"} gold={b.band} sel={is("lot", lot.id)} onClick={() => setSel({ type: "lot", id: lot.id })} />
            <LinNode cx={COLX[3]} cy={y} type="FUNC TEST" id={fn.id} metric={"integ " + fn.integrity} gold={b.band} sel={is("func", fn.id)} onClick={() => setSel({ type: "func", id: fn.id })} />
            <LinNode cx={COLX[4]} cy={y} type="APP TEST" id={ap.id} metric={"melt " + ap.melt} gold={b.band} sel={is("app", ap.id)} onClick={() => setSel({ type: "app", id: ap.id })} />
          </g>
        );
      })}
    </svg>
  );
}

function Detail({ sel }) {
  let type, id, fields, note, band;
  if (sel.type === "strain") { const s = D.strains.find((x) => x.id === sel.id); type = "STRAIN"; id = s.id; fields = [["Host", s.host], ["Promoter", s.promoter], ["Copy number", s.copy], ["Codon", s.codon], ["Signal", s.signal], ["Engineer", s.engineer]]; }
  else if (sel.type === "batch") { const b = D.batches.find((x) => x.id === sel.id); band = b.band; type = "FERMENTATION BATCH"; id = b.id; fields = [["Reactor", b.reactor], ["Scale", b.scale + " L"], ["DO (exp.)", b.doExp + "%"], ["Titer", b.titer + " g/L"], ["pH", b.ph], ["Temp", b.temp + "°C"], ["Feed", b.feed]]; note = "Exponential-phase DO of " + b.doExp + "% " + (b.band ? "is inside" : "is outside") + " the 27–34% sweet spot."; }
  else if (sel.type === "lot") { const l = D.lots.find((x) => x.id === sel.id); type = "DOWNSTREAM LOT"; id = l.id; fields = [["Capture", l.resin], ["Recovery", l.recovery + "%"], ["Purity", l.purity + "%"], ["Endotoxin", l.endo + " EU/mg"], ["Mass", l.mass + " g"]]; }
  else if (sel.type === "func") { const f = D.funcs.find((x) => x.id === sel.id); type = "FUNCTIONALITY TEST"; id = f.id; fields = [["Instrument", f.instrument], ["Micelle integrity", f.integrity], ["Phosphorylation", f.phos + "%"], ["Solubility", f.sol + "%"], ["Gelation", f.gel + "°C"]]; }
  else { const a = D.appts.find((x) => x.id === sel.id); band = a.band; type = "APPLICATION TEST"; id = a.id; fields = [["Application", a.app], ["Meltability", a.melt], ["Stretch", a.stretch], ["Off-note", a.off], ["Source DO", a.doExp + "%"]]; note = "Traces back to a single fermentation choice — DO " + a.doExp + "%."; }
  return (
    <div className="gd-detail">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div><div className="gd-dtype">{type}</div><div className="gd-did">{id}</div></div>
        {band !== undefined && <span style={badge(band)}>{band ? "golden" : "off-band"}</span>}
      </div>
      <dl className="gd-dl">{fields.map(([k, v]) => <React.Fragment key={k}><dt>{k}</dt><dd style={{ fontFamily: typeof v === "string" && isNaN(parseFloat(v)) ? "Inter" : "'IBM Plex Mono',monospace" }}>{v}</dd></React.Fragment>)}</dl>
      {note && <div className="gd-dnote">{note}</div>}
    </div>
  );
}

const css = `
.gd{font-family:'Inter',system-ui,sans-serif;color:#1B2229;font-size:13px;}
.gd *{box-sizing:border-box;}
.gd-t{font-size:20px;font-weight:600;letter-spacing:-.01em;margin:0;}
.gd-d{font-size:13px;color:#69727C;max-width:660px;line-height:1.5;margin:5px 0 20px;}
.gd-d b{color:#1B2229;font-weight:600;}
.gd-grid{display:grid;grid-template-columns:218px 1fr 296px;gap:16px;}
@media(max-width:980px){.gd-grid{grid-template-columns:1fr;}}
.gd-rail{background:#fff;border:1px solid #E5E8EC;border-radius:12px;padding:12px;align-self:start;}
.gd-search{width:100%;background:#F6F7F9;border:1px solid #E5E8EC;border-radius:8px;padding:7px 10px;font-size:12px;outline:none;margin-bottom:10px;}
.gd-item{padding:8px 10px;border-radius:8px;cursor:pointer;border:1px solid transparent;}
.gd-item:hover{background:#F6F7F9;}
.gd-item.on{background:#E6F2EF;border-color:#cfe6df;}
.gd-li{font-family:'IBM Plex Mono',monospace;font-size:12.5px;font-weight:500;}
.gd-ls{font-size:10.5px;color:#69727C;margin-top:1px;}
.gd-canvas{background:#fff;border:1px solid #E5E8EC;border-radius:12px;padding:8px;overflow:hidden;}
.gd-detail{background:#fff;border:1px solid #E5E8EC;border-radius:12px;padding:16px;align-self:start;}
.gd-dtype{font-size:10.5px;letter-spacing:.1em;color:#69727C;font-weight:600;}
.gd-did{font-family:'IBM Plex Mono',monospace;font-size:17px;font-weight:500;margin-top:3px;}
.gd-dl{margin-top:14px;display:grid;grid-template-columns:1fr auto;gap:9px 10px;font-size:12.5px;}
.gd-dl dt{color:#69727C;}
.gd-dl dd{margin:0;text-align:right;}
.gd-dnote{font-size:11.5px;color:#69727C;line-height:1.5;margin-top:12px;background:#F6F7F9;border-radius:8px;padding:10px;}
.gd-er{background:#fff;border:1px solid #E5E8EC;border-radius:12px;padding:14px 16px;margin-top:16px;display:flex;align-items:center;gap:14px;}
.gd-erv{font-size:22px;font-weight:600;color:#1E9E6A;}
.gd-sim{margin-left:8px;font-size:10.5px;font-family:'IBM Plex Mono',monospace;color:#B5862B;border:1px solid #B5862B;border-radius:999px;padding:3px 9px;}
`;

export default function GraphDatabasePage() {
  const [strainId, setStrainId] = useState(D.strains[0].id);
  const [sel, setSel] = useState({ type: "strain", id: D.strains[0].id });
  const [q, setQ] = useState("");
  const strain = D.strains.find((s) => s.id === strainId);
  return (
    <div className="gd">
      <style>{css}</style>
      <div><h1 className="gd-t">Graph database</h1>
        <p className="gd-d">A graph database (Neo4j) — rather than a table database — stores each strain, batch, lot, and test as a <b>node</b>, with <b>edges</b> for the relationships between them. Select a node to trace it from strain to final application result.</p></div>

      <div className="gd-grid">
        <div className="gd-rail">
          <input className="gd-search" placeholder="Filter strains…" value={q} onChange={(e) => setQ(e.target.value)} />
          {D.strains.filter((s) => s.id.toLowerCase().includes(q.toLowerCase())).map((s) => {
            const gb = D.batches.filter((b) => b.strainId === s.id && b.band).length;
            return (
              <div key={s.id} className={"gd-item" + (s.id === strainId ? " on" : "")} onClick={() => { setStrainId(s.id); setSel({ type: "strain", id: s.id }); }}>
                <div className="gd-li">{s.id}</div><div className="gd-ls">{s.promoter} · {gb}/3 golden</div>
              </div>
            );
          })}
        </div>
        <div className="gd-canvas"><Lineage strain={strain} sel={sel} setSel={setSel} /></div>
        <Detail sel={sel} />
      </div>

      <div className="gd-er">
        <div className="gd-erv">100%</div>
        <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
          <b style={{ color: C.ink }}>Entity resolution</b> · {D.batches.length}/{D.batches.length} records auto-matched across systems by genealogy key. 0 in review.
          <span className="gd-sim">simulated</span>
        </div>
      </div>
    </div>
  );
}