// src/integration_layer/integration_layer.jsx
import React, { useState, useRef, useEffect } from "react";
import { C } from "./theme";
import ConnectionsPage from "./ConnectionsPage";
import PipelinesPage from "./PipelinesPage";
import GraphDatabasePage from "./GraphDatabase";
import DataBrowserPage from "./DataBrowser";
import InsightsPage from "./Insights";

const NAV = [
  { sect: "1 · ORCHESTRATE", items: [["pipelines", "Pipelines"]] },
  { sect: "2 · ANALYZE",     items: [["insights", "Insights"]] },
  { sect: "3 · COLLECT",     items: [["connections", "Connections"]] },
  { sect: "4 · STORE",       items: [["lineage", "Graph database"], ["browser", "Data browser"]] },
];
const TITLES = { connections: "Connections", pipelines: "Pipelines", lineage: "Graph database", browser: "Data browser", insights: "Insights" };

const PAGES = {
  connections: ConnectionsPage,
  pipelines: PipelinesPage,
  lineage: GraphDatabasePage,
  browser: DataBrowserPage,
  insights: InsightsPage,
};

const shellCss = `
.il{font-family:'Inter',system-ui,sans-serif;color:#1B2229;height:100vh;display:flex;overflow:hidden;background:#F6F7F9;-webkit-font-smoothing:antialiased;font-size:13px;}
.il *{box-sizing:border-box;}
.il-side{width:232px;background:#10171C;color:#9FAAB4;display:flex;flex-direction:column;flex-shrink:0;}
.il-side-top{padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.07);}
.il-logo{display:flex;align-items:center;gap:9px;}
.il-wordmark{color:#fff;font-weight:700;letter-spacing:.16em;font-size:13px;}
.il-home-btn{margin-top:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:8px 12px;color:#dfe5ea;font-weight:600;font-size:12.5px;cursor:pointer;text-align:left;width:100%;display:flex;align-items:center;gap:8px;font-family:inherit;}
.il-home-btn:hover{background:rgba(255,255,255,.1);color:#fff;}
.il-nav{padding:14px 12px;overflow-y:auto;flex:1;}
.il-sect{font-size:10px;letter-spacing:.14em;color:#5d6870;padding:14px 10px 6px;font-weight:600;}
.il-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:7px;cursor:pointer;color:#9FAAB4;font-weight:500;font-size:13px;}
.il-item:hover{background:#1A232B;color:#e6ebef;}
.il-item.on{background:rgba(37,99,235,.18);color:#93c5fd;}
.il-dot{width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.6;}
.il-foot{padding:12px 16px;border-top:1px solid rgba(255,255,255,.07);font-size:10.5px;color:#5d6870;line-height:1.4;}
.il-main{flex:1;display:flex;flex-direction:column;min-width:0;}
.il-top{height:52px;background:#fff;border-bottom:1px solid #E5E8EC;display:flex;align-items:center;padding:0 18px;gap:12px;flex-shrink:0;}
.il-back{font-size:12.5px;color:#69727C;background:none;border:1px solid #E5E8EC;border-radius:8px;padding:6px 11px;cursor:pointer;font-family:inherit;}
.il-back:hover{color:#1B2229;border-color:#D6DBE0;}
.il-crumb{font-size:13px;color:#69727C;}
.il-crumb b{color:#1B2229;font-weight:600;}
.il-search{margin-left:auto;display:flex;align-items:center;background:#F6F7F9;border:1px solid #E5E8EC;border-radius:8px;padding:0 10px;gap:7px;height:32px;width:280px;flex-shrink:0;}
.il-search:focus-within{border-color:#2563EB;background:#fff;box-shadow:0 0 0 3px rgba(37,99,235,.08);}
.il-search input{border:none;background:transparent;font-size:12.5px;color:#1B2229;outline:none;width:100%;font-family:inherit;}
.il-search input::placeholder{color:#9FAAB4;}
.il-profile-wrap{position:relative;flex-shrink:0;}
.il-av{width:28px;height:28px;border-radius:50%;background:#2563EB;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:11px;cursor:pointer;user-select:none;flex-shrink:0;}
.il-av:hover{background:#1d4ed8;}
.il-profile-popup{position:absolute;top:calc(100% + 10px);right:0;background:#fff;border:1px solid #E5E8EC;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.12);padding:16px;width:228px;z-index:200;}
.il-profile-popup .pp-avatar{width:40px;height:40px;border-radius:50%;background:#2563EB;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;margin-bottom:10px;}
.il-profile-popup .pp-name{font-weight:600;font-size:13.5px;color:#1B2229;}
.il-profile-popup .pp-email{font-size:11.5px;color:#69727C;margin-top:2px;}
.il-profile-popup .pp-divider{height:1px;background:#F0F2F5;margin:12px 0;}
.il-profile-popup .pp-item{font-size:12.5px;color:#1B2229;padding:7px 0;cursor:pointer;display:block;border:none;background:none;width:100%;text-align:left;font-family:inherit;}
.il-profile-popup .pp-item:hover{color:#2563EB;}
.il-profile-popup .pp-item.danger:hover{color:#E53935;}
.il-content{flex:1;overflow-y:auto;padding:24px 28px 56px;}
.il-stub{padding:8px;color:#69727C;}
.il-stub h2{font-size:18px;font-weight:600;color:#1B2229;margin:0;}
.il-stub p{font-size:13px;margin-top:8px;}
`;

function FormoMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 46" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path fill="#2563EB" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"/>
    </svg>
  );
}

function Stub({ name }) {
  return (
    <div className="il-stub">
      <h2>{name}</h2>
      <p>This page is next in the build — it'll drop into <code>integration_layer/</code> and register in <code>PAGES</code>.</p>
    </div>
  );
}

export default function IntegrationLayer({ onBack: onExit }) {
  const [screen, setScreen] = useState("pipelines");
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const Page = PAGES[screen];

  useEffect(() => {
    if (!profileOpen) return;
    function handleOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [profileOpen]);

  return (
    <>
      <style>{shellCss}</style>
      <div className="il">
        <aside className="il-side">
          <div className="il-side-top">
            <div className="il-logo">
              <FormoMark size={22} />
              <div className="il-wordmark">Formo</div>
            </div>
            <button className="il-home-btn" onClick={onExit}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 1.5L1.5 7H3v7h4v-4h2v4h4V7h1.5L8 1.5z" fill="currentColor"/>
              </svg>
              Home
            </button>
          </div>
          <nav className="il-nav">
            {NAV.map((g) => (
              <div key={g.sect}>
                <div className="il-sect">{g.sect}</div>
                {g.items.map(([k, l]) => (
                  <div key={k} className={"il-item" + (screen === k ? " on" : "")} onClick={() => setScreen(k)}>
                    <span className="il-dot" />{l}
                  </div>
                ))}
              </div>
            ))}
          </nav>
          <div className="il-foot">Simulated dataset · 12 strains · 36 batches.</div>
        </aside>

        <div className="il-main">
          <div className="il-top">
            {onExit && <button className="il-back" onClick={onExit}>‹ Back to site</button>}
            <div className="il-crumb">Formo / <b>{TITLES[screen]}</b></div>
            <div className="il-search">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="6.5" cy="6.5" r="4.75" stroke="#9FAAB4" strokeWidth="1.5"/>
                <path d="M10.5 10.5L14 14" stroke="#9FAAB4" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input type="text" placeholder="Search..." />
            </div>
            <div className="il-profile-wrap" ref={profileRef}>
              <div className="il-av" onClick={() => setProfileOpen(o => !o)}>JD</div>
              {profileOpen && (
                <div className="il-profile-popup">
                  <div className="pp-avatar">JD</div>
                  <div className="pp-name">John Doe</div>
                  <div className="pp-email">john.doe@formo.com</div>
                  <div className="pp-divider" />
                  <button className="pp-item">Account settings</button>
                  <button className="pp-item">Workspace settings</button>
                  <button className="pp-item">Keyboard shortcuts</button>
                  <div className="pp-divider" />
                  <button className="pp-item danger">Sign out</button>
                </div>
              )}
            </div>
          </div>
          <div className="il-content">
            {Page ? <Page /> : <Stub name={TITLES[screen]} />}
          </div>
        </div>
      </div>
    </>
  );
}
