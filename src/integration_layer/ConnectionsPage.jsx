import React, { useState, useMemo } from "react";
import { C } from "./theme";
import { SOURCES } from "../data";
import { Pill, Spark } from "./ui";

/* =================================================================
 * Connections — Step 1 of the integration layer: COLLECT.
 * Shows every source system feeding the layer, the open standard it
 * speaks, and (in the drawer) how its raw fields map into the
 * canonical schema. Depends on the shared core:
 *   theme.js     -> C (palette)
 *   data.js      -> SOURCES
 *   components/ui -> Pill, Spark
 * ================================================================= */

/* Per-source connection detail (endpoint, field mappings, sync history).
   In production this comes from the connector config; here it's mock
   detail that lives with the page. */
const DETAILS = {
  "StrainBase ELN": {
    endpoint: "https://strainbase.internal/api/v1",
    schedule: "on change (webhook)",
    mappings: [
      ["meta.id", "strain_id", "key"],
      ["construct.promoter", "promoter", "text"],
      ["construct.copyNumber", "copy_number", "text"],
      ["host.strain", "host_strain", "text"],
    ],
    history: [["6m ago", "success", "12 records"], ["3h 6m ago", "success", "12 records"], ["1d ago", "success", "11 records"]],
  },
  "BioCommand SCADA": {
    endpoint: "opc.tcp://biocommand.internal:4840",
    schedule: "1 Hz stream → 1 min rollup",
    mappings: [
      ["batch.id", "batch_id", "key"],
      ["ns=2;s=R1.Temperature", "temp_C", "float"],
      ["ns=2;s=R1.pH", "ph", "float"],
      ["ns=2;s=R1.DO", "do_exp_pct", "float"],
      ["ns=2;s=R1.FeedRate", "feed_rate_mL_h", "float"],
    ],
    history: [["2m ago", "success", "36 batches"], ["1h 2m ago", "success", "36 batches"], ["3h 2m ago", "success", "35 batches"]],
  },
  "PuriTrack MES": {
    endpoint: "opc.tcp://puritrack.internal:4840",
    schedule: "per process step",
    mappings: [
      ["lot.id", "lot_id", "key"],
      ["step.capture.resin", "capture_resin", "text"],
      ["step.yield", "recovery_pct", "float"],
      ["qc.purity", "purity_pct", "float"],
      ["qc.endotoxin", "endotoxin_EU_mg", "float"],
    ],
    history: [["4m ago", "success", "36 lots"], ["2h 4m ago", "success", "36 lots"], ["5h ago", "success", "36 lots"]],
  },
  "LabX Analytics": {
    endpoint: "sila://labx.internal:50051",
    schedule: "per instrument run",
    mappings: [
      ["SiLA:Instrument.RunId", "test_id", "key"],
      ["AnIML:.../Series[MicelleIntegrity]", "micelle_integrity", "float"],
      ["AnIML:.../Series[Solubility]", "solubility_pct", "float"],
      ["AnIML:.../Series[Phosphorylation]", "phosphorylation_pct", "float"],
    ],
    history: [["running…", "syncing", "— records"], ["52m ago", "success", "36 tests"], ["4h ago", "success", "35 tests"]],
  },
  "AppPanel Sheets": {
    endpoint: "sheets://apppanel/Meltability2026",
    schedule: "every 15 min",
    mappings: [
      ["Sheet1!LotRef", "lot_id", "key"],
      ["Sheet1!Meltability", "meltability_score", "float"],
      ["Sheet1!Stretch", "stretch_score", "float"],
      ["Sheet1!OffNote", "off_note_flag", "text"],
    ],
    history: [["31m ago", "success", "36 panels"], ["46m ago", "success", "36 panels"], ["1h 1m ago", "success", "36 panels"]],
  },
};

const ADD_OPTIONS = [
  ["REST API", "ELNs, LIMS, internal services"],
  ["Spreadsheet / CSV", "Sheets, exports, manual logs"],
  ["Custom script / parser", "Proprietary formats, vendor SDKs, one-off exports"],
  ["OPC UA", "Bioreactors, SCADA, MES equipment (where supported)"],
  ["SiLA 2", "Lab instruments (control + data, where supported)"],
  ["AnIML", "Analytical instrument results"],
];

const pageCss = `
.cp{font-family:'Inter',system-ui,sans-serif;color:#1B2229;position:relative;}
.cp *{box-sizing:border-box;}
.cp .mono{font-family:'IBM Plex Mono',monospace;}
.cp-head{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:18px;}
.cp-t{font-size:20px;font-weight:600;letter-spacing:-.01em;margin:0;}
.cp-add{flex-shrink:0;font-size:13px;font-weight:600;background:#0B6E5F;color:#fff;border:none;border-radius:9px;padding:9px 16px;cursor:pointer;}
.cp-add:hover{background:#0a5d51;}
.cp-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px;}
@media(max-width:760px){.cp-stats{grid-template-columns:repeat(2,1fr);}}
.cp-stat{background:#fff;border:1px solid #E5E8EC;border-radius:12px;padding:13px 15px;}
.cp-stat .v{font-size:22px;font-weight:600;letter-spacing:-.02em;}
.cp-stat .k{font-size:11.5px;color:#69727C;margin-top:4px;}
.cp-bar{display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;}
.cp-chips{display:flex;gap:5px;}
.cp-chip{font-size:12px;font-weight:500;padding:6px 12px;border-radius:7px;cursor:pointer;color:#69727C;border:1px solid #E5E8EC;background:#fff;}
.cp-chip:hover{color:#1B2229;}
.cp-chip.on{background:#1B2229;color:#fff;border-color:#1B2229;}
.cp-search{margin-left:auto;width:200px;background:#F6F7F9;border:1px solid #E5E8EC;border-radius:8px;padding:7px 11px;font-size:12.5px;outline:none;}
.cp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(282px,1fr));gap:14px;}
.cp-card{background:#fff;border:1px solid #E5E8EC;border-radius:12px;padding:16px;cursor:pointer;transition:box-shadow .15s,border-color .15s;}
.cp-card:hover{border-color:#D6DBE0;box-shadow:0 2px 12px rgba(20,30,40,.06);}
.cp-card-top{display:flex;align-items:center;justify-content:space-between;}
.cp-name{font-weight:600;font-size:13.5px;}
.cp-pillar{font-size:11.5px;color:#69727C;margin-top:2px;}
.cp-std{display:inline-block;font-size:10.5px;font-family:'IBM Plex Mono',monospace;background:#E6F2EF;color:#0B6E5F;border:1px solid #cfe6df;border-radius:6px;padding:2px 7px;}
.cp-type{font-size:11.5px;color:#69727C;margin-top:10px;}
.cp-meta{display:flex;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:1px solid #F1F3F5;font-size:11.5px;color:#69727C;}
.cp-meta .mono{color:#1B2229;}
.cp-view{font-size:11px;color:#0B6E5F;margin-top:10px;font-weight:500;}
/* drawer */
.cp-overlay{position:fixed;inset:0;background:rgba(20,28,36,.32);z-index:40;}
.cp-drawer{position:fixed;top:0;right:0;height:100%;width:min(460px,94vw);background:#fff;z-index:41;box-shadow:-10px 0 36px rgba(0,0,0,.14);display:flex;flex-direction:column;}
.cp-dhead{padding:18px 20px;border-bottom:1px solid #E5E8EC;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;}
.cp-dtype{font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:#69727C;font-weight:600;}
.cp-did{font-size:18px;font-weight:600;margin-top:3px;}
.cp-close{background:none;border:1px solid #E5E8EC;border-radius:8px;width:30px;height:30px;cursor:pointer;color:#69727C;font-size:16px;line-height:1;}
.cp-close:hover{color:#1B2229;border-color:#D6DBE0;}
.cp-dbody{padding:6px 20px 24px;overflow-y:auto;}
.cp-sec{margin-top:20px;}
.cp-sec-h{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#69727C;font-weight:600;margin-bottom:9px;}
.cp-kv{display:flex;justify-content:space-between;gap:12px;font-size:12.5px;padding:6px 0;border-bottom:1px solid #F4F5F6;}
.cp-kv .k{color:#69727C;}
.cp-kv .v{font-family:'IBM Plex Mono',monospace;text-align:right;word-break:break-all;}
.map-row{display:grid;grid-template-columns:1fr 16px 1fr;gap:8px;align-items:center;font-size:11.5px;padding:7px 0;border-bottom:1px solid #F4F5F6;}
.map-raw{font-family:'IBM Plex Mono',monospace;color:#69727C;word-break:break-all;}
.map-arrow{color:#C7CED4;text-align:center;}
.map-canon{font-family:'IBM Plex Mono',monospace;color:#0B6E5F;text-align:right;word-break:break-all;}
.map-key{color:#B5862B!important;}
.hist-row{display:flex;justify-content:space-between;align-items:center;font-size:12px;padding:7px 0;border-bottom:1px solid #F4F5F6;}
.cp-note{font-size:11.5px;color:#69727C;line-height:1.5;margin-top:18px;background:#F6F7F9;border-radius:8px;padding:11px 12px;}
.add-row{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #F4F5F6;}
.add-row .nm{font-family:'IBM Plex Mono',monospace;font-size:12.5px;font-weight:500;}
.add-row .ds{font-size:11.5px;color:#69727C;margin-top:2px;}
.add-btn{font-size:12px;font-weight:500;border:1px solid #cfe6df;background:#E6F2EF;color:#0B6E5F;border-radius:7px;padding:6px 12px;cursor:pointer;}
`;

function Drawer({ which, onClose }) {
  const isAdd = which === "__add__";
  const src = !isAdd ? SOURCES.find((s) => s.sys === which) : null;
  const det = !isAdd ? DETAILS[which] : null;
  return (
    <>
      <div className="cp-overlay" onClick={onClose} />
      <div className="cp-drawer">
        <div className="cp-dhead">
          <div>
            <div className="cp-dtype">{isAdd ? "New connection" : src.pillar}</div>
            <div className="cp-did">{isAdd ? "Add a source" : src.sys}</div>
          </div>
          <button className="cp-close" onClick={onClose}>×</button>
        </div>
        <div className="cp-dbody">
          {isAdd ? (
            <>
              <p style={{ fontSize: 12.5, color: "#69727C", lineHeight: 1.5, marginTop: 12 }}>
                Connect a new system through whatever protocol it already speaks — an open standard where one's available, or a custom parser where it's not. The layer sits on top either way, nothing gets replaced.
              </p>
              <div style={{ marginTop: 8 }}>
                {ADD_OPTIONS.map(([nm, ds]) => (
                  <div key={nm} className="add-row">
                    <div><div className="nm">{nm}</div><div className="ds">{ds}</div></div>
                    <button className="add-btn">Connect</button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="cp-sec">
                <div className="cp-sec-h">Connection</div>
                <div className="cp-kv"><span className="k">Standard</span><span className="v">{src.std}</span></div>
                <div className="cp-kv"><span className="k">Endpoint</span><span className="v">{det.endpoint}</span></div>
                <div className="cp-kv"><span className="k">Schedule</span><span className="v">{det.schedule}</span></div>
                <div className="cp-kv"><span className="k">Status</span><span className="v"><Pill status={src.status} /></span></div>
              </div>

              <div className="cp-sec">
                <div className="cp-sec-h">Field mapping · raw → canonical</div>
                {det.mappings.map(([raw, canon, type]) => (
                  <div key={canon} className="map-row">
                    <span className="map-raw">{raw}</span>
                    <span className="map-arrow">→</span>
                    <span className={"map-canon" + (type === "key" ? " map-key" : "")}>{canon}{type === "key" ? " 🔑" : ""}</span>
                  </div>
                ))}
                <div className="cp-note">This is the semantic layer: each system's own field names are translated into one shared schema, so <span className="mono">DO</span>, <span className="mono">do_exp_pct</span>, and any vendor's label all resolve to the same canonical field.</div>
              </div>

              <div className="cp-sec">
                <div className="cp-sec-h">Recent syncs</div>
                {det.history.map((h, i) => (
                  <div key={i} className="hist-row">
                    <span style={{ color: "#69727C" }}>{h[0]}</span>
                    <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <span className="mono" style={{ fontSize: 11.5, color: "#69727C" }}>{h[2]}</span>
                      <Pill status={h[1]} />
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function ConnectionsPage() {
  const [drawer, setDrawer] = useState(null);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  const shown = useMemo(
    () => SOURCES.filter(
      (s) => (filter === "all" || s.status === filter) &&
        (s.sys + " " + s.pillar).toLowerCase().includes(q.toLowerCase())
    ),
    [filter, q]
  );
  const stats = useMemo(() => ({
    total: SOURCES.length,
    connected: SOURCES.filter((s) => s.status === "connected").length,
    syncing: SOURCES.filter((s) => s.status === "syncing").length,
    records: SOURCES.reduce((n, s) => n + s.records, 0),
  }), []);

  return (
    <div className="cp">
      <style>{pageCss}</style>

      <div className="cp-head">
        <h1 className="cp-t">Connections</h1>
        <button className="cp-add" onClick={() => setDrawer("__add__")}>+ Add source</button>
      </div>

      <div className="cp-stats">
        <div className="cp-stat"><div className="v">{stats.total}</div><div className="k">Connected sources</div></div>
        <div className="cp-stat"><div className="v" style={{ color: C.green }}>{stats.connected}</div><div className="k">Healthy</div></div>
        <div className="cp-stat"><div className="v" style={{ color: C.amber }}>{stats.syncing}</div><div className="k">Syncing now</div></div>
        <div className="cp-stat"><div className="v mono">{stats.records}</div><div className="k">Records ingested</div></div>
      </div>

      <div className="cp-bar">
        <div className="cp-chips">
          {[["all", "All"], ["connected", "Connected"], ["syncing", "Syncing"]].map(([k, l]) => (
            <button key={k} className={"cp-chip" + (filter === k ? " on" : "")} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
        <input className="cp-search" placeholder="Filter sources…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="cp-grid">
        {shown.map((s) => (
          <div key={s.sys} className="cp-card" onClick={() => setDrawer(s.sys)}>
            <div className="cp-card-top">
              <div><div className="cp-name">{s.sys}</div><div className="cp-pillar">{s.pillar}</div></div>
              <Pill status={s.status} />
            </div>
            <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className="cp-std">{s.std}</span>
              <Spark seed={s.sys.length * 7 + s.records} />
            </div>
            <div className="cp-type">{s.type}</div>
            <div className="cp-meta">
              <span>last sync <span className="mono">{s.sync}</span></span>
              <span><span className="mono">{s.records}</span> records · {s.freq}</span>
            </div>
            <div className="cp-view">View field mapping →</div>
          </div>
        ))}
        {shown.length === 0 && <div style={{ color: C.muted, fontSize: 13, padding: 20 }}>No sources match.</div>}
      </div>

      {drawer && <Drawer which={drawer} onClose={() => setDrawer(null)} />}
    </div>
  );
}