// src/integration_layer/PipelinesPage.jsx — Step 1: ORCHESTRATE (centerpiece)
import React from "react";
import { C } from "./theme";
import { SOURCES } from "../data";
import { Pill } from "./ui";

// Each stage's last 5 run attempts, oldest → newest. "retry" = failed then
// auto-retried within the same run; "fail" = failed and required a rerun.
const STAGES = [
  { name: "Ingest",      detail: "5 sources",       runs: ["ok", "ok", "ok", "ok", "ok"] },
  { name: "Resolve IDs", detail: "entity match",     runs: ["ok", "ok", "retry", "ok", "ok"] },
  { name: "Thread",      detail: "genealogy graph",  runs: ["ok", "fail", "retry", "ok", "ok"] },
  { name: "Load",        detail: "graph + warehouse",runs: ["ok", "ok", "ok", "ok", "ok"] },
  { name: "Analyze",     detail: "models refresh",   runs: ["ok", "ok", "ok", "retry", "ok"] },
];
const SCHEDULES = ["*/1 * * * *", "@1Hz→1m", "per step", "per run", "*/15 * * * *"];

const STATUS_COLOR = { ok: C.green, retry: C.amber, fail: C.red };
const STATUS_LABEL = { ok: "Succeeded", retry: "Succeeded after retry", fail: "Failed, rerun required" };

const BEFORE_AFTER = [
  ["Trigger", "Someone remembers to run it", "Runs on a fixed schedule, unattended"],
  ["Failure handling", "Fails silently, found downstream", "Stage-level retry, then alerts on-call"],
  ["Consistency", "Steps vary by whoever ran it", "Same flow, same order, every run"],
  ["Latency", "Hours to days between imports", "Minutes, end to end"],
];

const css = `
.pp{font-family:'Inter',system-ui,sans-serif;color:#1B2229;font-size:13px;}
.pp *{box-sizing:border-box;}
.pp .mono{font-family:'IBM Plex Mono',monospace;}
.pp-t{font-size:20px;font-weight:600;letter-spacing:-.01em;margin:0 0 18px;}
.pp-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:0 0 18px;}
@media(max-width:760px){.pp-stats{grid-template-columns:repeat(2,1fr);}}
.pp-stat{background:#fff;border:1px solid #E5E8EC;border-radius:12px;padding:13px 15px;}
.pp-stat .v{font-size:22px;font-weight:600;letter-spacing:-.02em;}
.pp-stat .k{font-size:11.5px;color:#69727C;margin-top:4px;}
.pp-sec-h{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#69727C;font-weight:600;margin:22px 0 10px;}
.pp-flow{display:flex;align-items:flex-start;flex-wrap:wrap;margin-bottom:6px;}
.pp-node{background:#fff;border:1px solid #E5E8EC;border-radius:9px;padding:10px 14px;min-width:136px;}
.pp-node .dl{font-weight:600;font-size:12.5px;display:flex;align-items:center;gap:7px;}
.pp-node .dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
.pp-node .ds{font-size:11px;color:#69727C;margin-top:3px;}
.pp-node .status{font-size:10.5px;margin-top:7px;font-weight:500;}
.pp-hist{display:flex;gap:3px;margin-top:6px;}
.pp-hist span{width:14px;height:5px;border-radius:2px;}
.pp-arrow{color:#D6DBE0;padding:0 4px;font-size:18px;align-self:center;}
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
.pp-ba{display:grid;grid-template-columns:1fr 1fr;border:1px solid #E5E8EC;border-radius:12px;overflow:hidden;background:#fff;}
@media(max-width:700px){.pp-ba{grid-template-columns:1fr;}}
.pp-ba-col{padding:14px 16px;}
.pp-ba-col + .pp-ba-col{border-left:1px solid #E5E8EC;}
@media(max-width:700px){.pp-ba-col + .pp-ba-col{border-left:none;border-top:1px solid #E5E8EC;}}
.pp-ba-h{font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:700;margin-bottom:10px;}
.pp-ba-h.before{color:#C8453B;}
.pp-ba-h.after{color:#0B6E5F;}
.pp-ba-row{display:flex;justify-content:space-between;gap:10px;font-size:12.5px;padding:8px 0;border-bottom:1px solid #F4F5F6;}
.pp-ba-row:last-child{border-bottom:none;}
.pp-ba-k{color:#69727C;flex-shrink:0;width:110px;}
.pp-ba-v{text-align:right;}
.pp-ba-v.before{color:#8a3830;}
.pp-ba-v.after{color:#0B6E5F;font-weight:500;}
`;

function StageNode({ s }) {
  const last = s.runs[s.runs.length - 1];
  return (
    <div className="pp-node">
      <div className="dl"><span className="dot" style={{ background: STATUS_COLOR[last] }} />{s.name}</div>
      <div className="ds">{s.detail}</div>
      <div className="pp-hist">
        {s.runs.map((r, i) => <span key={i} style={{ background: STATUS_COLOR[r] }} title={r} />)}
      </div>
      <div className="status" style={{ color: STATUS_COLOR[last] }}>{STATUS_LABEL[last]}</div>
    </div>
  );
}

export default function PipelinesPage() {
  const healthy = SOURCES.filter((s) => s.status !== "error").length;
  const avg = (SOURCES.reduce((n, _, i) => n + (0.4 + i * 0.3), 0) / SOURCES.length).toFixed(1);
  return (
    <div className="pp">
      <style>{css}</style>
      <h1 className="pp-t">Pipelines</h1>

      <div className="pp-stats">
        <div className="pp-stat"><div className="v">{SOURCES.length}</div><div className="k">Active jobs</div></div>
        <div className="pp-stat"><div className="v" style={{ color: C.green }}>{healthy}</div><div className="k">Healthy</div></div>
        <div className="pp-stat"><div className="v mono">{avg}s</div><div className="k">Avg run time</div></div>
        <div className="pp-stat"><div className="v mono">02:14</div><div className="k">Last full cycle</div></div>
      </div>

      <div className="pp-sec-h">Before · after</div>
      <div className="pp-ba">
        <div className="pp-ba-col">
          <div className="pp-ba-h before">Before — manual import</div>
          {BEFORE_AFTER.map(([k, before]) => (
            <div key={k} className="pp-ba-row"><span className="pp-ba-k">{k}</span><span className="pp-ba-v before">{before}</span></div>
          ))}
        </div>
        <div className="pp-ba-col">
          <div className="pp-ba-h after">After — automated schedule</div>
          {BEFORE_AFTER.map(([k, , after]) => (
            <div key={k} className="pp-ba-row"><span className="pp-ba-k">{k}</span><span className="pp-ba-v after">{after}</span></div>
          ))}
        </div>
      </div>

      <div className="pp-sec-h">Pipeline · last 5 runs per stage</div>
      <div className="pp-flow">
        {STAGES.map((s, i) => (
          <React.Fragment key={s.name}>
            <StageNode s={s} />
            {i < STAGES.length - 1 && <span className="pp-arrow">→</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="pp-card" style={{ marginTop: 18 }}>
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
