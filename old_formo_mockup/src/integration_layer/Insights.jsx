// src/integration_layer/Insights.jsx — Step 4: ANALYZE  (requires: npm install recharts)
import React, { useMemo } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceArea, Cell, BarChart, Bar,
} from "recharts";
import { C } from "./theme";
import { D, STATS, mean, r1 } from "../data";

const css = `
.in{font-family:'Inter',system-ui,sans-serif;color:#1B2229;font-size:13px;}
.in *{box-sizing:border-box;}
.in-t{font-size:20px;font-weight:600;letter-spacing:-.01em;margin:0;}
.in-d{font-size:13px;color:#69727C;max-width:680px;line-height:1.5;margin:5px 0 18px;}
.in-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
@media(max-width:900px){.in-kpis{grid-template-columns:repeat(2,1fr);}}
.in-kpi{background:#fff;border:1px solid #E5E8EC;border-radius:12px;padding:15px 16px;}
.in-kpi .k{font-size:11.5px;color:#69727C;}
.in-kpi .v{font-size:26px;font-weight:600;margin-top:8px;letter-spacing:-.02em;}
.in-kpi .v.gold{color:#B5862B;}
.in-kpi .v.green{color:#1E9E6A;}
.in-kpi .s{font-size:11px;color:#69727C;margin-top:4px;}
.in-charts{display:grid;grid-template-columns:1.5fr 1fr;gap:14px;margin-top:14px;}
@media(max-width:900px){.in-charts{grid-template-columns:1fr;}}
.in-card{background:#fff;border:1px solid #E5E8EC;border-radius:12px;}
.in-card-h{padding:13px 16px;border-bottom:1px solid #E5E8EC;font-weight:600;font-size:13.5px;display:flex;justify-content:space-between;align-items:center;}
.in-card-h .sub{font-weight:400;color:#69727C;font-size:11.5px;}
.in-finding{background:#10171C;color:#e7edf1;border-radius:12px;padding:20px 22px;margin-top:14px;}
.in-finding .fl{font-size:10.5px;letter-spacing:.14em;color:#7fe9cf;font-weight:600;}
.in-finding .ft{font-size:16px;line-height:1.45;margin-top:9px;}
`;

export default function InsightsPage() {
  const scatter = useMemo(() => D.appts.map((a) => ({ doExp: a.doExp, melt: a.melt, band: a.band, id: a.id })), []);
  const buckets = useMemo(() => [[14, 22], [22, 27], [27, 34], [34, 40], [40, 46]].map(([a, b]) => {
    const xs = D.appts.filter((p) => p.doExp >= a && p.doExp < b);
    return { range: a + "–" + b, melt: xs.length ? r1(mean(xs.map((p) => p.melt))) : 0, band: a === 27 };
  }), []);

  return (
    <div className="in">
      <style>{css}</style>
      <div><h1 className="in-t">Insights</h1>
        <p className="in-d">Python-based statistical models, tailored to Formo's metrics and KPIs, that discover optimization opportunities to augment human decision-making — here, correlating fermentation conditions with functionality in final application testing.</p></div>

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
    </div>
  );
}