// src/integration_layer/PipelinesPage.jsx — Step 2: ORCHESTRATE
import React from "react";
import { C } from "./theme";
import { SOURCES } from "../data";
import { Pill } from "./ui";

const STAGES = [
  ["Ingest", "5 sources"], ["Resolve IDs", "entity match"], ["Thread", "genealogy graph"],
  ["Load", "graph + warehouse"], ["Analyze", "models refresh"],
];
const SCHEDULES = ["*/1 * * * *", "@1Hz→1m", "per step", "per run", "*/15 * * * *"];

const css = `
.pp{font-family:'Inter',system-ui,sans-serif;color:#1B2229;font-size:13px;}
.pp *{box-sizing:border-box;}
.pp .mono{font-family:'IBM Plex Mono',monospace;}
.pp-t{font-size:20px;font-weight:600;letter-spacing:-.01em;margin:0;}
.pp-d{font-size:13px;color:#69727C;max-width:660px;line-height:1.5;margin:5px 0 0;}
.pp-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:18px 0;}
@media(max-width:760px){.pp-stats{grid-template-columns:repeat(2,1fr);}}
.pp-stat{background:#fff;border:1px solid #E5E8EC;border-radius:12px;padding:13px 15px;}
.pp-stat .v{font-size:22px;font-weight:600;letter-spacing:-.02em;}
.pp-stat .k{font-size:11.5px;color:#69727C;margin-top:4px;}
.pp-dag{display:flex;align-items:center;flex-wrap:wrap;margin-bottom:18px;}
.pp-node{background:#fff;border:1px solid #E5E8EC;border-radius:9px;padding:10px 14px;min-width:124px;}
.pp-node .dl{font-weight:600;font-size:12.5px;display:flex;align-items:center;gap:7px;}
.pp-node .dl .ok{width:7px;height:7px;border-radius:50%;background:#1E9E6A;}
.pp-node .ds{font-size:11px;color:#69727C;margin-top:3px;}
.pp-arrow{color:#D6DBE0;padding:0 4px;font-size:18px;}
.pp-card{background:#fff;border:1px solid #E5E8EC;border-radius:12px;}
.pp-card-h{padding:13px 16px;border-bottom:1px solid #E5E8EC;font-weight:600;font-size:13.5px;display:flex;justify-content:space-between;align-items:center;}
.pp-card-h .sub{font-weight:400;color:#69727C;font-size:11.5px;}
.pp-wrap{overflow:auto;}
table.pp-tbl{border-collapse:collapse;width:100%;font-size:12.5px;}
.pp-tbl th{position:sticky;top:0;background:#FAFBFC;text-align:left;font-weight:600;color:#69727C;font-size:11px;padding:9px 12px;border-bottom:1px solid #E5E8EC;white-space:nowrap;}
.pp-tbl td{padding:8px 12px;border-bottom:1px solid #E5E8EC;white-space:nowrap;}
.pp-tbl tr:hover td{background:#FAFBFC;}
.pp-tbl td.id{font-family:'IBM Plex Mono',monospace;color:#0B6E5F;}
.pp-tbl td.num{font-family:'IBM Plex Mono',monospace;text-align:right;}
`;

export default function PipelinesPage() {
  const healthy = SOURCES.filter((s) => s.status !== "error").length;
  const avg = (SOURCES.reduce((n, _, i) => n + (0.4 + i * 0.3), 0) / SOURCES.length).toFixed(1);
  return (
    <div className="pp">
      <style>{css}</style>
      <div><h1 className="pp-t">Pipelines</h1>
        <p className="pp-d">Orchestration tools (Prefect / Airflow) keep the data continually updated — scheduled jobs ingest from each source, resolve IDs, load the graph, and refresh the analytics, with no manual upkeep.</p></div>

      <div className="pp-stats">
        <div className="pp-stat"><div className="v">{SOURCES.length}</div><div className="k">Active jobs</div></div>
        <div className="pp-stat"><div className="v" style={{ color: C.green }}>{healthy}</div><div className="k">Healthy</div></div>
        <div className="pp-stat"><div className="v mono">{avg}s</div><div className="k">Avg run time</div></div>
        <div className="pp-stat"><div className="v mono">02:14</div><div className="k">Last full cycle</div></div>
      </div>

      <div className="pp-dag">
        {STAGES.map((d, i) => (
          <React.Fragment key={d[0]}>
            <div className="pp-node"><div className="dl"><span className="ok" />{d[0]}</div><div className="ds">{d[1]}</div></div>
            {i < STAGES.length - 1 && <span className="pp-arrow">→</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="pp-card">
        <div className="pp-card-h">Sync jobs<span className="sub">all healthy · last cycle 02:14</span></div>
        <div className="pp-wrap">
          <table className="pp-tbl">
            <thead><tr><th>Job</th><th>Source</th><th>Schedule</th><th>Last run</th><th>Duration</th><th>Records</th><th>Status</th></tr></thead>
            <tbody>
              {SOURCES.map((s, i) => (
                <tr key={s.sys}>
                  <td className="id">job_{s.pillar.slice(0, 4).toLowerCase()}</td>
                  <td>{s.sys}</td>
                  <td className="mono">{SCHEDULES[i]}</td>
                  <td>{s.sync}</td>
                  <td className="num">{(0.4 + i * 0.3).toFixed(1)}s</td>
                  <td className="num">{s.records}</td>
                  <td><Pill status={s.status === "syncing" ? "syncing" : "success"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}