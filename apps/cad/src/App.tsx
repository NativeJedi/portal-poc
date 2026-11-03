import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { PORTAL_NODE_ID, useAuth, useLayout } from "@portal/contracts";
import { useMfCheck } from "./useMfCheck";

// The four CAD reports from overview.md
const REPORTS = ["class-summary", "analysis", "kpis", "inference"];

// FR-11a: breadcrumb via the shell's layout context, removed on unmount
function useCadBreadcrumbs(reportId?: string) {
  const { setBreadcrumbs } = useLayout();
  useEffect(() => {
    setBreadcrumbs(["App Hub", "CAD", ...(reportId ? [reportId] : [])]);
    return () => setBreadcrumbs([]);
  }, [setBreadcrumbs, reportId]);
}

function Dashboard() {
  useCadBreadcrumbs();
  return (
    <ul>
      {/* FR-10: relative Links -> /app-hub/cad/reports/:reportId */}
      {REPORTS.map((id) => (
        <li key={id}>
          <Link to={`reports/${id}`}>{id}</Link>
        </li>
      ))}
    </ul>
  );
}

function Report() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  useCadBreadcrumbs(reportId);
  return (
    <p>
      Report: {reportId}{" "}
      {/* FR-10: programmatic navigation back to the CAD dashboard */}
      <button onClick={() => navigate("../..", { relative: "path" })}>Back to dashboard</button>
    </p>
  );
}

// FR-09: exposed as "./App". FR-10: NO Router here — relative <Routes> under App Hub's cad/*
export default function App() {
  const { user } = useAuth(); // FR-09: the shell's auth context
  useMfCheck(); // FR-13

  const portalNode = document.getElementById(PORTAL_NODE_ID);

  return (
    <div style={{ border: "4px solid green", padding: 12 }}>
      <b>CAD</b> | user from shell: {user.name}
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="reports/:reportId" element={<Report />} />
      </Routes>
      {/* FR-11b: render into the shell's DOM node; removed when CAD unmounts */}
      {portalNode &&
        createPortal(<span style={{ border: "2px solid green", padding: 2 }}>CAD actions</span>, portalNode)}
    </div>
  );
}
