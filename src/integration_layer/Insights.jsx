// src/integration_layer/Insights.jsx — Step 2: ANALYZE  (requires: npm install recharts)
import React, { useMemo, useState } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceArea, ReferenceLine, Cell, BarChart, Bar,
  LineChart, Line,
} from "recharts";
import { C } from "./theme";
import { D, STATS, mean, r1 } from "../data";

const TABS = ["Descriptive", "PLS Regression", "Random Forest"];

// Simulated PLS coefficients — signed contribution to predicted titer.
// Illustrative numbers consistent with the dataset's ranges, not a fitted model.
const PLS_LOADINGS = [
  { name: "DO (exp. phase)", value: 0.62 },
  { name: "Temperature", value: 0.24 },
  { name: "Feed strategy", value: 0.18 },
  { name: "pH", value: -0.11 },
];

// Simulated Random Forest feature importances (sum to 100), sorted descending.
const RF_IMPORTANCE = [
  { name: "DO (exp. phase)", value: 38 },
  { name: "Feed strategy", value: 22 },
  { name: "Temperature", value: 19 },
  { name: "Induction OD600", value: 13 },
  { name: "pH", value: 8 },
];

// Simulated partial dependence of predicted outcome on DO — the nonlinear
// rise / plateau / decline a tree model would surface, vs. a straight line.
const RF_PDP = [
  { doExp: 14, pred: 55 }, { doExp: 18, pred: 62 }, { doExp: 22, pred: 70 },
  { doExp: 26, pred: 80 }, { doExp: 27, pred: 86 }, { doExp: 30, pred: 88 },
  { doExp: 34, pred: 87 }, { doExp: 38, pred: 78 }, { doExp: 42, pred: 68 },
  { doExp: 46, pred: 58 },
];

const css = `
.in{font-family:'Inter',system-ui,sans-serif;color:#1B2229;font-size:13px;}
.in *{box-sizing:border-box;}
.in-t{font-size:20px;font-weight:600;letter-spacing:-.01em;margin:0 0 18px;}
.in-tabs{display:flex;gap:5px;margin-bottom:18px;}
.in-tab{font-size:12px;font-weight:500;padding:6px 12px;border-radius:7px;cursor:pointer;color:#69727C;border:1px solid #E5E8EC;background:#fff;}
.in-tab:hover{color:#1B2229;}
.in-tab.on{background:#1B2229;color:#fff;border-color:#1B2229;}
.in-tab-d{font-size:12.5px;color:#69727C;line-height:1.5;max-width:680px;margin:0 0 14px;}
.in-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
@media(max-width:900px){.in-kpis{grid-template-columns:repeat(2,1fr);}}
.in-kpis3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:14px;}
@media(max-width:900px){.in-kpis3{grid-template-columns:1fr;}}
.in-kpi{background:#fff;border:1px solid #E5E8EC;border-radius:12px;padding:15px 16px;}
.in-kpi .k{font-size:11.5px;color:#69727C;}
.in-kpi .v{font-size:26px;font-weight:600;margin-top:8px;letter-spacing:-.02em;}
.in-kpi .v.gold{color:#B5862B;}
.in-kpi .v.green{color:#1E9E6A;}
.in-kpi .s{font-size:11px;color:#69727C;margin-top:4px;}
.in-charts{display:grid;grid-template-columns:1.5fr 1fr;gap:14px;margin-top:14px;}
@media(max-width:900px){.in-charts{grid-template-columns:1fr;}}
.in-charts-eq{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
@media(max-width:900px){.in-charts-eq{grid-template-columns:1fr;}}
.in-card{background:#fff;border:1px solid #E5E8EC;border-radius:12px;}
.in-card-h{padding:13px 16px;border-bottom:1px solid #E5E8EC;font-weight:600;font-size:13.5px;display:flex;justify-content:space-between;align-items:center;}
.in-card-h .sub{font-weight:400;color:#69727C;font-size:11.5px;}
.in-finding{background:#10171C;color:#e7edf1;border-radius:12px;padding:20px 22px;margin-top:14px;}
.in-finding .fl{font-size:10.5px;letter-spacing:.14em;color:#7fe9cf;font-weight:600;}
.in-finding .ft{font-size:16px;line-height:1.45;margin-top:9px;}
.in-sim{margin-left:8px;font-size:10.5px;font-family:'IBM Plex Mono',monospace;color:#B5862B;border:1px solid #B5862B;border-radius:999px;padding:3px 9px;}
.in-cap{font-size:11.5px;color:#69727C;line-height:1.5;padding:0 16px 16px;}
`;

function StatCard({ k, v, s, big = true }) {
  return (
    <div className="in-kpi">
      <div className="k">{k}</div>
      <div className="v" style={{ fontSize: big ? 26 : 18 }}>{v}</div>
      {s && <div className="s">{s}</div>}
    </div>
  );
}

export default function InsightsPage() {
  const [tab, setTab] = useState("Descriptive");
  const scatter = useMemo(() => D.appts.map((a) => ({ doExp: a.doExp, melt: a.melt, band: a.band, id: a.id })), []);
  const buckets = useMemo(() => [[14, 22], [22, 27], [27, 34], [34, 40], [40, 46]].map(([a, b]) => {
    const xs = D.appts.filter((p) => p.doExp >= a && p.doExp < b);
    return { range: a + "–" + b, melt: xs.length ? r1(mean(xs.map((p) => p.melt))) : 0, band: a === 27 };
  }), []);

  return (
    <div className="in">
      <style>{css}</style>
      <h1 className="in-t">Insights</h1>

      <div className="in-tabs">
        {TABS.map((t) => (
          <div key={t} className={"in-tab" + (tab === t ? " on" : "")} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>

      {tab === "Descriptive" && (
        <>
          <div className="in-kpis">
            <div className="in-kpi"><div className="k">Meltability lift, in-band</div><div className="v gold">+{STATS.lift}</div><div className="s">{STATS.inMean} vs {STATS.outMean} off-band</div></div>
            <div className="in-kpi"><div className="k">R² · DO distance → melt</div><div className="v">{STATS.r2}</div><div className="s">across {D.appts.length} batches</div></div>
            <div className="in-kpi"><div className="k">DO sweet spot</div><div className="v">27–34<span style={{ fontSize: 15 }}>%</span></div><div className="s">exponential-phase O₂</div></div>
            <div className="in-kpi"><div className="k">Golden batches</div><div className="v green">{STATS.nIn}</div><div className="s">of {D.batches.length} runs</div></div>
          </div>

          <div className="in-charts">
            <div className="in-card">
              <div className="in-card-h">Exponential-phase DO vs meltability<span className="sub">gold = in sweet spot</span></div>
              <div style={{ padding: "14px 12px 6px" }}>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart margin={{ top: 6, right: 18, bottom: 24, left: 0 }}>
                    <CartesianGrid stroke={C.line} />
                    <ReferenceArea x1={27} x2={34} fill={C.goldWeak} fillOpacity={0.7} />
                    <XAxis type="number" dataKey="doExp" domain={[14, 46]} tick={{ fontSize: 11, fill: C.muted }} label={{ value: "DO (%)", position: "bottom", offset: 6, fontSize: 11, fill: C.muted }} />
                    <YAxis type="number" dataKey="melt" domain={[30, 100]} tick={{ fontSize: 11, fill: C.muted }} width={34} />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid " + C.line }} />
                    <Scatter data={scatter}>{scatter.map((p, i) => <Cell key={i} fill={p.band ? C.gold : C.gray} />)}</Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="in-card">
              <div className="in-card-h">Avg meltability by DO band</div>
              <div style={{ padding: "14px 12px 6px" }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={buckets} margin={{ top: 6, right: 10, bottom: 24, left: 0 }}>
                    <CartesianGrid stroke={C.line} vertical={false} />
                    <XAxis dataKey="range" tick={{ fontSize: 10.5, fill: C.muted }} label={{ value: "DO (%)", position: "bottom", offset: 6, fontSize: 11, fill: C.muted }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: C.muted }} width={34} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid " + C.line }} cursor={{ fill: "#00000008" }} />
                    <Bar dataKey="melt" radius={[4, 4, 0, 0]}>{buckets.map((b, i) => <Cell key={i} fill={b.band ? C.gold : C.gray} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="in-finding">
            <div className="fl">FINDING</div>
            <div className="ft">No single system holds this. Fermentation logs dissolved oxygen; the application lab logs meltability weeks later. Only once they're threaded does the sweet spot appear — a control lever, surfaced automatically.</div>
          </div>
        </>
      )}

      {tab === "PLS Regression" && (
        <>
          <p className="in-tab-d">Partial Least Squares regression — the standard method in bioprocessing for relating multiple correlated sensor variables (DO, temp, pH, feed strategy) to outcomes, without the multicollinearity problems of simple linear regression.</p>

          <div className="in-kpis3">
            <StatCard k="Variance explained (R²)" v="0.87" />
            <StatCard k="Latent components used" v="2" />
            <StatCard k="Top predictor" v="DO (exp. phase)" big={false} />
          </div>

          <div className="in-card">
            <div className="in-card-h">PLS coefficients · predicting titer<span className="sub">signed contribution<span className="in-sim">simulated</span></span></div>
            <div style={{ padding: "14px 16px 6px" }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={PLS_LOADINGS} layout="vertical" margin={{ top: 6, right: 24, bottom: 6, left: 8 }}>
                  <CartesianGrid stroke={C.line} horizontal={false} />
                  <ReferenceLine x={0} stroke={C.line2} />
                  <XAxis type="number" domain={[-1, 1]} tick={{ fontSize: 11, fill: C.muted }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: C.ink }} width={120} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid " + C.line }} cursor={{ fill: "#00000008" }} />
                  <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={22}>
                    {PLS_LOADINGS.map((d, i) => <Cell key={i} fill={d.value >= 0 ? C.primary : C.red} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="in-cap">Accounts for correlation between sensor variables — unlike single-variable correlation views.</div>
          </div>
        </>
      )}

      {tab === "Random Forest" && (
        <>
          <p className="in-tab-d">Random Forest — captures nonlinear relationships and interaction effects between variables (e.g., "DO only matters when temp is also in range") that linear/PLS models can miss.</p>

          <div className="in-kpis3">
            <StatCard k="Model accuracy (R²)" v="0.91" />
            <StatCard k="Batches used" v={D.batches.length} />
            <StatCard k="Top predictor" v="DO (exp. phase)" big={false} />
          </div>

          <div className="in-charts-eq">
            <div className="in-card">
              <div className="in-card-h">Feature importance<span className="sub">predicting meltability<span className="in-sim">simulated</span></span></div>
              <div style={{ padding: "14px 16px 6px" }}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={RF_IMPORTANCE} layout="vertical" margin={{ top: 6, right: 24, bottom: 6, left: 8 }}>
                    <CartesianGrid stroke={C.line} horizontal={false} />
                    <XAxis type="number" domain={[0, "dataMax"]} tick={{ fontSize: 11, fill: C.muted }} unit="%" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: C.ink }} width={120} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid " + C.line }} cursor={{ fill: "#00000008" }} formatter={(v) => v + "%"} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18} fill={C.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="in-card">
              <div className="in-card-h">Partial dependence · DO<span className="sub">top feature<span className="in-sim">simulated</span></span></div>
              <div style={{ padding: "14px 12px 6px" }}>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={RF_PDP} margin={{ top: 6, right: 18, bottom: 6, left: 0 }}>
                    <CartesianGrid stroke={C.line} vertical={false} />
                    <ReferenceArea x1={27} x2={34} fill={C.goldWeak} fillOpacity={0.7} />
                    <XAxis dataKey="doExp" type="number" domain={[14, 46]} tick={{ fontSize: 11, fill: C.muted }} label={{ value: "DO (%)", position: "bottom", offset: 6, fontSize: 11, fill: C.muted }} />
                    <YAxis domain={[40, 95]} tick={{ fontSize: 11, fill: C.muted }} width={30} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid " + C.line }} />
                    <Line type="monotone" dataKey="pred" stroke={C.primary} strokeWidth={2} dot={{ r: 3, fill: C.primary }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="in-cap" style={{ padding: "10px 0 0" }}>Surfaces thresholds and interaction effects — e.g., DO's effect may depend on temperature — that PLS and simple correlation cannot detect.</div>
        </>
      )}
    </div>
  );
}
