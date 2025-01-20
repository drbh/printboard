import { useState } from "react";
import "./App.css";
import Spreadsheet from "./Spreadsheet";
import CubeGrid from "./CubeGrid";
import { SelectionProvider } from "./SelectionContext";

const CombinedView = () => {
  return (
    <SelectionProvider>
      <div className="bg-[var(--bg)] flex h-full-content w-full">
        <div className="w-1/2 h-full overflow-auto border-r border-[var(--border-color)]">
          <Spreadsheet />
        </div>
        <div className="w-1/2 h-full">
          <CubeGrid />
        </div>
      </div>
    </SelectionProvider>
  );
};

const Topbar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-[var(--bg)] flex justify-between items-center h-12 border-b border-[var(--border-color)]">
      <div className="flex items-center">
        <div className="ml-4 text-lg font-bold">Printboard Playground</div>
        <div className="ml-4 bg-purple-500 text-white text-xs px-2 py-1 rounded-full mr-4">
          BETA
        </div>
      </div>

      <div className="mr-4 flex items-center space-x-4">
        <button disabled className="btn">
          Export GLB*
        </button>
        <button className="btn">Export 3MF*</button>
        <button
          className="btn"
          onClick={() => {
            // go to /specification.html page in a new tab
            window.open("/beta/specification.html", "_blank");
          }}
        >
          Specification
        </button>
        <button
          className="btn"
          onClick={() => {
            window.open("https://github.com/drbh/printboard", "_blank");
          }}
        >
          Source
        </button>
      </div>
    </div>
  );
};

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Topbar />
      <CombinedView />
    </>
  );
}

export default App;
