// src/integration_layer/ui.jsx — shared presentational bits used across pages.
import React from "react";
import { C } from "./theme";

function prng(a){return function(){a|=0;a=(a+0x6d2b79f5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
const clamp=(x,lo,hi)=>Math.max(lo,Math.min(hi,x));

// Status pill — inline styled so it works on any page without shared CSS.
export function Pill({ status }) {
  const map = {
    connected: [C.green, "Connected"],
    syncing:   [C.amber, "Syncing"],
    error:     [C.red,   "Error"],
    success:   [C.green, "Success"],
  };
  const [col, txt] = map[status] || [C.gray, status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 500,
      padding: "3px 9px", borderRadius: 999, border: `1px solid ${col}55`, color: col,
      background: col + "12", fontFamily: "Inter, system-ui, sans-serif", whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: col }} />
      {txt}
    </span>
  );
}

// Tiny throughput sparkline.
export function Spark({ seed }) {
  const rng = prng(seed);
  const pts = [];
  let y = 10 + rng() * 8;
  for (let i = 0; i < 16; i++) {
    y = clamp(y + (rng() - 0.5) * 7, 2, 22);
    pts.push((i / 15 * 96).toFixed(1) + "," + (24 - y).toFixed(1));
  }
  return (
    <svg width="96" height="26" style={{ display: "block" }}>
      <polyline points={pts.join(" ")} fill="none" stroke={C.primary} strokeWidth="1.4" />
    </svg>
  );
}