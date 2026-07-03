import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Results from "./pages/Results";
import GenomeInsights from "./pages/GenomeInsights";
import ExplainabilityCenter from "./pages/ExplainabilityCenter";
import ReportCenter from "./pages/ReportCenter";
import SnpExplorer from "./pages/SnpExplorer";
import KnowledgeCenter from "./pages/KnowledgeCenter";
import AnalysisDetails from "./pages/AnalysisDetails";

export default function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state && e.state.page) {
        setPage(e.state.page);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (p) => {
    setPage(p);
    window.history.pushState({ page: p }, "", "#" + p);
  };

  if (page === "login")
    return <Login onLogin={(u) => { 
      setUser(u); 
      setPage("dashboard"); 
      window.history.pushState({ page: "dashboard" }, "", "#dashboard");
    }} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font)" }}>
      <Sidebar page={page} navigate={navigate} user={user} onLogout={() => { setUser(null); setPage("login"); window.history.pushState({ page: "login" }, "", "#login"); }} />
      <main style={{ flex: 1, overflow: "auto" }}>
        {page === "dashboard"      && <Dashboard navigate={navigate} user={user} setResults={setResults} />}
        {page === "upload"         && <Upload navigate={navigate} setResults={setResults} />}
        {page === "results"        && <Results results={results} navigate={navigate} />}
        {page === "insights"       && <GenomeInsights results={results} navigate={navigate} />}
        {page === "explainability" && <ExplainabilityCenter results={results} navigate={navigate} />}
        {page === "reports"        && <ReportCenter navigate={navigate} setResults={setResults} />}
        {page === "details"        && <AnalysisDetails results={results} navigate={navigate} />}
        {page === "snp_explorer"   && <SnpExplorer results={results} navigate={navigate} />}
        {page === "knowledge"      && <KnowledgeCenter navigate={navigate} />}
      </main>
    </div>
  );
}

function Sidebar({ page, navigate, user, onLogout }) {
  const links = [
    { id: "dashboard",      icon: "◈", label: "Dashboard",             desc: "Overview" },
    { id: "upload",         icon: "⌃", label: "Ingest Genome",         desc: "Upload VCF" },
    { id: "insights",       icon: "✦", label: "Genome Insights",       desc: "Metrics" },
    { id: "explainability", icon: "⚙", label: "Explainability Center", desc: "XAI Features" },
    { id: "reports",        icon: "≡", label: "Patient Reports",       desc: "Records" },
    { id: "snp_explorer",   icon: "🔍", label: "SNP Explorer",          desc: "Gene Map" },
    { id: "knowledge",      icon: "📖", label: "Knowledge Base",        desc: "Encyclopedia" },
  ];

  return (
    <aside style={{
      width: 240, background: "var(--surface)", display: "flex", flexDirection: "column",
      borderRight: "1px solid var(--border)", position: "sticky", top: 0,
      height: "100vh", flexShrink: 0
    }}>
      {/* Logo */}
      <div style={{ padding: "28px 20px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: "linear-gradient(135deg, var(--accent), var(--accent-teal))",
            display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center",
            fontSize: 17, fontWeight: 800, color: "#fff",
            boxShadow: "0 4px 12px rgba(37,99,235,0.2)", flexShrink: 0
          }}>G</div>
          <div>
            <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px" }}>GenomeRisk</div>
            <div style={{ color: "var(--accent-teal)", fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600, marginTop: 1 }}>Clinical AI</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
        <div style={{ fontSize: 9, color: "var(--text-3)", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600, padding: "0 8px 10px" }}>Navigation</div>
        {links.map(l => (
          <button key={l.id} onClick={() => navigate(l.id)} style={{
            display: "flex", alignItems: "center", gap: 12, width: "100%",
            padding: "11px 12px", borderRadius: 10, border: "none", cursor: "pointer",
            marginBottom: 2, transition: "all 0.15s ease",
            background: page === l.id || (l.id === "reports" && page === "details")
              ? "rgba(37, 99, 235, 0.06)"
              : "transparent",
            color: page === l.id || (l.id === "reports" && page === "details") ? "var(--accent)" : "var(--text-2)",
            outline: "none",
            boxShadow: page === l.id || (l.id === "reports" && page === "details") ? "inset 0 0 0 1px rgba(37,99,235,0.15)" : "none"
          }}
            onMouseEnter={e => { if (page !== l.id && !(l.id === "reports" && page === "details")) { e.currentTarget.style.background = "var(--surface2)"; e.currentTarget.style.color = "var(--text)"; }}}
            onMouseLeave={e => { if (page !== l.id && !(l.id === "reports" && page === "details")) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; }}}
          >
            <span style={{ fontSize: 18, width: 22, textAlign: "center", lineHeight: 1 }}>{l.icon}</span>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: page === l.id || (l.id === "reports" && page === "details") ? 600 : 500 }}>{l.label}</div>
            </div>
            {(page === l.id || (l.id === "reports" && page === "details")) && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }} />}
          </button>
        ))}

        {/* Models section */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 9, color: "var(--text-3)", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600, padding: "0 8px 10px" }}>Models</div>
          {[
            { name: "Type 2 Diabetes", auc: "0.915", live: true },
            { name: "Cardiovascular", auc: "0.969", live: true },
            { name: "Male Pattern Baldness", auc: "0.974", live: true },
            { name: "Alzheimer Disease", auc: "0.958", live: true },
          ].map(m => (
            <div key={m.name} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "9px 12px", borderRadius: 9, marginBottom: 2,
              background: "var(--surface2)"
            }}>
              <div>
                <div style={{ fontSize: 12, color: m.live ? "var(--text)" : "var(--text-3)", fontWeight: 500 }}>{m.name}</div>
                {m.auc && <div style={{ fontSize: 10, color: "var(--text-2)", marginTop: 1, fontFamily: "var(--mono)" }}>AUC {m.auc}</div>}
              </div>
              <span style={{
                fontSize: 8, letterSpacing: "1.5px", padding: "3px 7px", borderRadius: 6, fontWeight: 700,
                background: m.live ? "rgba(37,99,235,0.08)" : "rgba(0,0,0,0.04)",
                color: m.live ? "var(--accent)" : "var(--text-3)",
                border: m.live ? "1px solid rgba(37,99,235,0.15)" : "1px solid transparent"
              }}>{m.live ? "LIVE" : "SOON"}</span>
            </div>
          ))}
        </div>
      </nav>

      {/* User */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "var(--surface2)" }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), var(--accent-teal))",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0
          }}>{user?.name?.[0] || "D"}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "var(--text)", fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name || "Dr. User"}</div>
            <div style={{ color: "var(--text-2)", fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.hospital || "Hospital"}</div>
          </div>
          <button onClick={onLogout} style={{
            background: "none", border: "none", color: "var(--text-3)", cursor: "pointer",
            fontSize: 14, padding: "4px", borderRadius: 6, transition: "color 0.15s"
          }}
            onMouseEnter={e => e.target.style.color = "var(--danger)"}
            onMouseLeave={e => e.target.style.color = "var(--text-3)"}
            title="Sign out"
          >⏻</button>
        </div>
      </div>
    </aside>
  );
}
