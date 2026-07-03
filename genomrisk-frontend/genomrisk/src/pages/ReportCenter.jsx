import { useState, useEffect } from "react";
import { apiGet, apiDelete } from "../api";

const TRAIT_LABELS = {
  diabetes: "Type-2 Diabetes",
  cardio: "Cardiovascular Health",
  baldness: "Male Pattern Baldness",
  alzheimer: "Alzheimer Disease",
};

export default function ReportCenter({ navigate, setResults }) {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [reports, setReports] = useState([]);
  const [busyIndex, setBusyIndex] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    apiGet("/api/history")
      .then(data => setReports(data.history || []))
      .catch(err => console.error(err));
  };

  const getOverallRiskLevel = (p) => {
    // If any trait has risk probability > 70%, it is considered high risk overall
    const maxRisk = Math.max(...Object.values(p.risks || {}), 0);
    if (maxRisk >= 75) return "high";
    if (maxRisk <= 30) return "low";
    return "moderate";
  };

  const deleteReport = async (index) => {
    if (!window.confirm("Are you sure you want to delete this clinical report?")) return;
    setBusyIndex(index);
    try {
      await apiDelete(`/api/history/${index}`);
      fetchHistory();
    } catch (err) {
      alert("Unable to delete report");
    } finally {
      setBusyIndex(null);
    }
  };

  const viewDetails = (report) => {
    setResults(report);
    navigate("details");
  };

  // 1. Filter
  const filtered = reports.filter(p => {
    const matchesSearch = 
      (p.patientName || "").toLowerCase().includes(search.toLowerCase()) || 
      (p.patientId || "").toLowerCase().includes(search.toLowerCase());
    
    if (riskFilter === "all") return matchesSearch;
    const patientLevel = getOverallRiskLevel(p);
    return matchesSearch && patientLevel === riskFilter;
  });

  // 2. Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.timestamp) - new Date(a.timestamp);
    }
    if (sortOrder === "oldest") {
      return new Date(a.timestamp) - new Date(b.timestamp);
    }
    if (sortOrder === "name") {
      return (a.patientName || "").localeCompare(b.patientName || "");
    }
    return 0;
  });

  return (
    <div style={{ padding: "40px 44px", maxWidth: 1100, animation: "fadeUp 0.4s ease both" }}>
      <div style={{ marginBottom: 36, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
            Clinical Report Vault
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text)", letterSpacing: "-1.2px", marginBottom: 6 }}>
            Report Center
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>
            Access, search, filter, and review completed genomic susceptibility reports.
          </p>
        </div>
        <button onClick={() => navigate("upload")} style={{
          padding: "11px 20px", borderRadius: 10, border: "none",
          background: "linear-gradient(135deg, var(--accent), var(--accent-teal))",
          color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
          boxShadow: "0 4px 12px rgba(37,99,235,0.15)", transition: "transform 0.15s"
        }}
          onMouseEnter={e => e.target.style.transform = "translateY(-1px)"}
          onMouseLeave={e => e.target.style.transform = "none"}
        >
          + Ingest New DNA
        </button>
      </div>

      {/* Control bar */}
      <div style={{
        display: "flex", gap: 14, marginBottom: 24, padding: "16px 20px",
        background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "var(--shadow)"
      }}>
        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by patient name or ID..."
          style={filterInputStyle}
        />

        {/* Filter select */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase" }}>Risk Rating</span>
          <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} style={selectStyle}>
            <option value="all">All Cohorts</option>
            <option value="high">High Risk Only</option>
            <option value="moderate">Moderate Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>

        {/* Sort Select */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase" }}>Sort By</span>
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} style={selectStyle}>
            <option value="newest">Ingestion (Newest)</option>
            <option value="oldest">Ingestion (Oldest)</option>
            <option value="name">Patient Name</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
        {sorted.map((report, idx) => {
          const maxRisk = Math.max(...Object.values(report.risks || {}), 0);
          const traits = Object.keys(report.risks || {}).map(k => TRAIT_LABELS[k] || k).join(", ");
          
          let levelColor = "var(--success)";
          let levelText = "Standard Susceptibility";
          if (maxRisk >= 75) {
            levelColor = "var(--danger)";
            levelText = "High Risk Action Flag";
          } else if (maxRisk >= 50) {
            levelColor = "var(--warning)";
            levelText = "Moderate Suspicion";
          }

          return (
            <div key={idx} style={{
              background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px",
              boxShadow: "var(--shadow)", display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <div>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)" }}>{report.patientName}</h3>
                  <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--mono)" }}>ID: {report.patientId}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 6 }}>
                  Analyzed Traits: <strong>{traits || "None Selected"}</strong>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6 }}>
                  Ingested on {report.timestamp} from VCF resource: <span style={{ fontFamily: "var(--mono)" }}>{report.fileName}</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <span style={{
                  padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                  background: levelColor + "0A", color: levelColor, border: `1px solid ${levelColor}20`
                }}>{levelText}</span>

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => viewDetails(report)} style={actionButtonStyle}>Open Report</button>
                  <button onClick={() => deleteReport(idx)} disabled={busyIndex === idx} style={deleteButtonStyle}>
                    {busyIndex === idx ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 56, textAlign: "center", color: "var(--text-3)" }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>🔍</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-2)" }}>No clinical reports found matching filters</div>
          </div>
        )}
      </div>
    </div>
  );
}

const filterInputStyle = {
  flex: 1,
  padding: "9px 14px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "#FFFFFF",
  color: "var(--text)",
  fontSize: 13,
  outline: "none"
};

const selectStyle = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "#FFFFFF",
  color: "var(--text)",
  fontSize: 12,
  outline: "none",
  fontWeight: 600
};

const actionButtonStyle = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "1.5px solid var(--border)",
  background: "#FFFFFF",
  color: "var(--text-2)",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  transition: "all 0.15s"
};

const deleteButtonStyle = {
  padding: "8px 14px",
  borderRadius: 8,
  border: "1px solid rgba(239,68,68,0.15)",
  background: "rgba(239,68,68,0.02)",
  color: "var(--danger)",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  transition: "all 0.15s"
};
