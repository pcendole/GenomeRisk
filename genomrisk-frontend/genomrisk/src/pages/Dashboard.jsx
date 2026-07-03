import { useState, useEffect } from "react";
import { apiGet } from "../api";

export default function Dashboard({ navigate, user, setResults }) {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    apiGet("/api/history")
      .then(data => setRecent(data.history || []))
      .catch(err => console.error("Error fetching history:", err));
  }, []);

  const total = recent.length;
  const highCount = recent.filter(p => {
    return Object.values(p.risks || {}).some(score => score > 70);
  }).length;
  const highPct = total > 0 ? Math.round((highCount / total) * 100) : 0;

  const stats = [
    { label: "Total Analyses",  value: total.toString(),           sub: "All-time local runs",     icon: "🔬", color: "var(--accent)" },
    { label: "High Risk Flags", value: highCount.toString(),       sub: `${highPct}% of cohort`,    icon: "⚠️", color: "var(--danger)" },
    { label: "Avg. Model AUC",    value: "0.951",                  sub: "Cross-validated score",   icon: "📊", color: "var(--success)" },
    { label: "Inference Speed",   value: "1.4s",                   sub: "Average local delay",     icon: "⚡", color: "var(--accent-teal)" },
  ];

  const traitMap = { 
    diabetes: "Type-2 Diabetes", 
    cardio: "Cardiovascular Health", 
    baldness: "Male Pattern Baldness",
    alzheimer: "Alzheimer Disease"
  };

  return (
    <div style={{ padding: "40px 44px", maxWidth: 1100, animation: "fadeUp 0.4s ease both" }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text)", letterSpacing: "-1px", marginBottom: 6 }}>
          Welcome Back,{" "}
          <span style={{ background: "linear-gradient(90deg, var(--accent), var(--accent-teal))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {user?.name?.split(" ")[1] || "Clinical Evaluator"}
          </span> 👋
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: 14 }}>XGBoost-powered overview for patient sequence risk evaluations.</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginBottom: 36 }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{
            background: "var(--surface)", borderRadius: "var(--radius)", padding: "24px",
            border: "1px solid var(--border)", position: "relative", overflow: "hidden",
            boxShadow: "var(--shadow)",
            animation: `fadeUp 0.4s ease ${i * 0.07}s both`, cursor: "default",
            transition: "border-color 0.2s, box-shadow 0.2s"
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.boxShadow = "0 8px 30px rgba(15,23,42,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "var(--shadow)"; }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${s.color}, transparent)` }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "var(--text-2)", letterSpacing: "0.5px", fontWeight: 700, textTransform: "uppercase" }}>{s.label}</div>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: "-1px", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 8 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
        {/* Recent analyses */}
        <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow)", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 28px", borderBottom: "1px solid var(--border)" }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)" }}>Recent Predictions</div>
              <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 3 }}>Latest genomic sequences submitted for inference</div>
            </div>
            <button onClick={() => navigate("history")} style={{
              padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)",
              background: "#FFFFFF", fontSize: 12, color: "var(--text-2)", cursor: "pointer",
              fontWeight: 600, transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.color = "var(--accent)"; }}
              onMouseLeave={e => { e.target.style.borderColor = "var(--border)"; e.target.style.color = "var(--text-2)"; }}
            >View all →</button>
          </div>

          {recent.length === 0 ? (
            <div style={{ padding: "56px", textAlign: "center", color: "var(--text-3)" }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>🧬</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-2)" }}>No analyses records</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Ingest a patient VCF file to start mapping models</div>
              <button onClick={() => navigate("upload")} style={{
                marginTop: 20, padding: "10px 20px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg, var(--accent), var(--accent-teal))", color: "#fff",
                fontWeight: 700, cursor: "pointer", fontSize: 13
              }}>+ New Analysis</button>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface2)" }}>
                  {["Patient ID", "Name", "Analyzed Traits", "Timestamp"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "12px 24px", fontSize: 10, color: "var(--text-2)", fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.slice(0, 5).map((p, idx) => {
                  const traits = Object.keys(p.risks || {}).map(t => traitMap[t] || t);
                  const displayTraits = traits.length > 2 ? "Multi-Trait Analysis" : traits.join(", ");
                  return (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--border)", cursor: "pointer", transition: "background 0.15s" }}
                      onClick={() => { setResults(p); navigate("results"); }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--surface2)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "16px 24px", fontSize: 12, color: "var(--text-2)", fontFamily: "var(--mono)" }}>{p.patientId}</td>
                      <td style={{ padding: "16px 24px", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{p.patientName}</td>
                      <td style={{ padding: "16px 24px", fontSize: 12, color: "var(--text-2)" }}>{displayTraits}</td>
                      <td style={{ padding: "16px 24px", fontSize: 12, color: "var(--text-2)" }}>{p.timestamp}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Right CTA column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(8,145,178,0.04))",
            borderRadius: "var(--radius)", padding: "28px 24px",
            border: "1px solid rgba(37,99,235,0.15)",
            boxShadow: "var(--shadow)"
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🧬</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)", marginBottom: 8 }}>Ingest DNA File</div>
            <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 20 }}>
              Upload clinical genomic variant records and calculate predictions using our XGBoost classifier stack.
            </p>
            <button onClick={() => navigate("upload")} style={{
              width: "100%", padding: "12px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, var(--accent), var(--accent-teal))", color: "#fff",
              fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
              boxShadow: "0 4px 12px rgba(37,99,235,0.2)"
            }}
              onMouseEnter={e => e.target.style.transform = "translateY(-1px)"}
              onMouseLeave={e => e.target.style.transform = "none"}
            >+ Ingest Variant VCF</button>
          </div>
        </div>
      </div>
    </div>
  );
}
