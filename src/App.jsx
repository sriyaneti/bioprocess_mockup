// uses other .jsx files and switches between them to create the final output

import React, { useState } from "react";
import Presentation from "./outer.jsx"; // outer website mock up
import Console from "./integration_layer/integration_layer.jsx"; // integration layer UI

export default function App() {
  const [mode, setMode] = useState("intro");
  return mode === "intro"
    ? <Presentation onLaunch={() => setMode("app")} />
    : <Console onBack={() => setMode("intro")} />;
}
