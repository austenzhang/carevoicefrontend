import "./App.css";
import Landing from "./pages/Landing";
import { Route, Routes } from "react-router-dom";
import { useEffect, useMemo, useLayoutEffect } from "react";

import Record from "./pages/Record";
import PatientPage from "./pages/PatientPage";
import Transcript from "./pages/documents/Transcript";
import Summary from "./pages/documents/Summary";
import DARP from "./pages/documents/DARP";
import HeadToToe from "./pages/documents/HeadToToe";

function App() {
  return (
    <div className="AppWrapper  w-full flex flex-col flex-1 ">
      <div className="RouteWrapper  flex flex-col w-full mr-0 flex-1 justify-center items-center bg-zinc-700">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/record" element={<Record />} />
          <Route path="/patient/:patientId" element={<PatientPage />} /> 
          <Route path="/transcript/:transcriptId" element={<Transcript />} />
          <Route path="/summary/:summaryId" element={<Summary />} />
          <Route path="/head-to-toe/:head_to_toeId" element={<HeadToToe />} />
          <Route path="/DARP/:DARP_Id" element={<DARP />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
