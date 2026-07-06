// src/integration_layer/DataBrowser.jsx — Step 3: STORE (warehouse view)
import React, { useState, useMemo } from "react";
import { TABLES } from "../data";

const css = `
.db{font-family:'Inter',system-ui,sans-serif;color:#1B2229;font-size:13px;}
.db *{box-sizing:border-box;}
.db-t{font-size:20px;font-weight:600;letter-spacing:-.01em;margin:0 0 18px;}
.db-bar{display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;}
.db-tabs{display:flex;gap:4px;flex-wrap:wrap;}
.db-tab{font-size:12px;font-weight:500;padding:6px 12px;border-radius:7px;cursor:pointer;color:#69727C;border:1px solid transparent;}
.db-tab:hover{background:#fff;color:#1B2229;}
.db-tab.on{background:#1B2229;color:#fff;}
.db-search{margin-left:auto;width:200px;background:#F6F7F9;border:1px solid #E5E8EC;border-radius:8px;padding:7px 11px;font-size:12.5px;outline:none;}
.db-card{background:#fff;border:1px solid #E5E8EC;border-radius:12px;}
.db-card-h{padding:13px 16px;border-bottom:1px solid #E5E8EC;font-weight:600;font-size:13.5px;display:flex;justify-content:space-between;align-items:center;}
.db-card-h .sub{font-weight:400;color:#69727C;font-size:11.5px;}
.db-wrap{overflow:auto;max-height:520px;}
table.db-tbl{border-collapse:collapse;width:100%;font-size:12.5px;}
.db-tbl th{position:sticky;top:0;background:#FAFBFC;text-align:left;font-weight:600;color:#69727C;font-size:11px;padding:9px 12px;border-bottom:1px solid #E5E8EC;white-space:nowrap;}
.db-tbl td{padding:8px 12px;border-bottom:1px solid #E5E8EC;white-space:nowrap;}
.db-tbl tr:hover td{background:#FAFBFC;}
.db-tbl td.id{font-family:'IBM Plex Mono',monospace;color:#0B6E5F;}
.db-tbl td.num{font-family:'IBM Plex Mono',monospace;text-align:right;}
.db-gold{background:#F4EBD3!important;font-weight:600;}
`;

export default function DataBrowserPage() {
  const [tbl, setTbl] = useState("Fermentation_Batches");
  const [q, setQ] = useState("");
  const def = TABLES[tbl];
  const rows = useMemo(() => {
    const all = def.rows();
    if (!q) return all;
    const lc = q.toLowerCase();
    return all.filter((row) => def.cols.some((c) => String(row[c[0]]).toLowerCase().includes(lc)));
  }, [tbl, q, def]);

  return (
    <div className="db">
      <style>{css}</style>
      <h1 className="db-t">Data browser</h1>

      <div className="db-bar">
        <div className="db-tabs">
          {Object.keys(TABLES).map((t) => (
            <div key={t} className={"db-tab" + (t === tbl ? " on" : "")} onClick={() => { setTbl(t); setQ(""); }}>{t}</div>
          ))}
        </div>
        <input className="db-search" placeholder="Filter rows…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="db-card">
        <div className="db-card-h">{tbl}<span className="sub">{rows.length} of {def.rows().length} rows</span></div>
        <div className="db-wrap">
          <table className="db-tbl">
            <thead><tr>{def.cols.map((c) => <th key={c[0]}>{c[1]}</th>)}</tr></thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {def.cols.map((c) => {
                    const cls = c[2] === "id" ? "id" : c[2] === "num" ? "num" : "";
                    const gold = c[3] === "band" && row.band;
                    return <td key={c[0]} className={cls + (gold ? " db-gold" : "")}>{String(row[c[0]])}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}