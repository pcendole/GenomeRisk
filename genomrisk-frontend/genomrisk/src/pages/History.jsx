import { useState, useEffect } from "react";
import { apiGet, apiDelete } from "../api";

const TRAIT_LABELS = {
  diabetes: "Type-2 Diabetes",
  cardio: "Cardiovascular Health",
  baldness: "Male Pattern Baldness",
  alzheimer: "Alzheimer Disease",
};

export default function History({ navigate, setResults }) {
  const [search, setSearch] = useState("");
  const [historyData, setHistoryData] = useState([]);
  const [busyIndex, setBusyIndex] = useState(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    apiGet("/api/history")
      .then(data => setHistoryData(data.history || []))
      .catch(err => console.error(err));
  }, []);

  const filtered = historyData.filter(p => {
    const name = p.patientName || "";
    const id = p.patientId || "";
    return name.toLowerCase().includes(search.toLowerCase()) || id.toLowerCase().includes(search.toLowerCase());
  });

  const viewResult = (p) => {
    setResults(p);
    navigate("results");
  };

  const deleteRecord = async (index) => {
    if (!window.confirm("Are you sure you want to delete this patient record?")) return;
    setBusyIndex(index);
    try {
      await apiDelete(`/api/history/${index}`);
      const data = await apiGet("/api/history");
      setHistoryData(data.history || []);
    } catch (err) {
      alert(err.message || "Unable to delete record");
    } finally {
      setBusyIndex(null);
    }
  };

  const clearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all history records? This cannot be undone.")) return;
    setClearing(true);
    try {
      await apiDelete("/api/history");
      setHistoryData([]);
    } catch (err) {
      alert(err.message || "Unable to clear history");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div style={{ padding: "40px 44px", maxWidth: 1100, animation: "fadeUp 0.4s ease both" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
          Audit Trail
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text)", letterSpacing: "-1px", marginBottom: 6 }}>
          Clinical Prediction History
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: 14 }}>
          Historical logging of sequenced genome alignments and risk score profiles.
        </p>
      </div>

      {/* Filters & Actions */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by patient name or clinical ID..."
          style={{
            flex: 1, maxWidth: 360, padding: "11px 16px", borderRadius: 10,
            border: "1px solid var(--border)", background: "#FFFFFF",
            color: "var(--text)", fontSize: 13, outline: "none", transition: "border-color 0.2s"
          }}
          onFocus={e => e.target.style.borderColor = "var(--accent)"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />
        
        <button onClick={() => navigate("upload")} style={{
          marginLeft: "auto", padding: "11px 20px", borderRadius: 10, border: "none",
          background: "linear-gradient(135deg, var(--accent), var(--accent-teal))",
          color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
          boxShadow: "0 4px 12px rgba(37,99,235,0.15)", transition: "all 0.2s"
        }}
          onMouseEnter={e => e.target.style.transform = "translateY(-1px)"}
          onMouseLeave={e => e.target.style.transform = "none"}
        >
          + New Ingestion
        </button>
        
        <button onClick={clearAll} disabled={clearing || historyData.length === 0} style={{
          padding: "11px 18px", borderRadius: 10, border: "1px solid var(--border)",
          background: clearing || historyData.length === 0 ? "var(--surface2)" : "#FFFFFF",
          color: "var(--text-2)", fontWeight: 700, fontSize: 13, cursor: clearing || historyData.length === 0 ? "not-allowed" : "pointer",
          transition: "all 0.2s"
        }}>
          {clearing ? "Clearing..." : "Clear Database"}
        </button>
      </div>

      {/* Records Table */}
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface2)" }}>
              {["Patient ID", "Name", "Analyzed Traits", "Date of Analysis", "VCF Source", ""].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "14px 20px", fontSize: 10, color: "var(--text-2)", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--surface2)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "15px 20px", fontSize: 12, color: "var(--text-2)", fontFamily: "var(--mono)" }}>{p.patientId}</td>
                <td style={{ padding: "15px 20px", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{p.patientName}</td>
                <td style={{ padding: "15px 20px", fontSize: 12, color: "var(--text-2)" }}>
                  {Object.keys(p.risks || {}).map(k => TRAIT_LABELS[k] || k).join(", ") || "N/A"}
                </td>
                <td style={{ padding: "15px 20px", fontSize: 12, color: "var(--text-2)" }}>{p.timestamp}</td>
                <td style={{ padding: "15px 20px", fontSize: 12, color: "var(--text-3)", fontFamily: "var(--mono)" }}>{p.fileName}</td>
                <td style={{ padding: "15px 20px", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button onClick={() => viewResult(p)} style={{
                    padding: "7px 14px", borderRadius: 8, border: "1px solid var(--border)",
                    background: "#FFFFFF", fontSize: 11, color: "var(--text-2)", cursor: "pointer",
                    fontWeight: 700, transition: "all 0.15s"
                  }}
                    onMouseEnter={e => e.target.style.borderColor = "var(--accent)"}
                    onMouseLeave={e => e.target.style.borderColor = "var(--border)"}
                  >
                    View Card
                  </button>
                  <button onClick={() => deleteRecord(i)} disabled={busyIndex === i} style={{
                    padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.15)",
                    background: busyIndex === i ? "var(--surface2)" : "rgba(239,68,68,0.02)", fontSize: 11,
                    color: "var(--danger)", cursor: busyIndex === i ? "not-allowed" : "pointer",
                    fontWeight: 700, transition: "all 0.15s"
                  }}
                    onMouseEnter={e => e.target.style.background = "rgba(239,68,68,0.08)"}
                    onMouseLeave={e => e.target.style.background = "rgba(239,68,68,0.02)"}
                  >
                    {busyIndex === i ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "72px 40px", color: "var(--text-3)" }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🔍</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-2)" }}>No matched search results found</div>
          </div>
        )}
      </div>
    </div>
  );
}
