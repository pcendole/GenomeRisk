import { useState } from "react";

const TRAIT_METADATA = {
  diabetes: { name: "Type-2 Diabetes", icon: "🩸", color: "#EF4444" },
  cardio:   { name: "Cardiovascular Health", icon: "❤️", color: "#F59E0B" },
  baldness: { name: "Male Pattern Baldness", icon: "🦳", color: "#2563EB" },
  alzheimer: { name: "Alzheimer Disease", icon: "🧠", color: "#9333EA" },
};

export default function ExplainabilityCenter({ results, navigate }) {
  const [activeDisease, setActiveDisease] = useState("diabetes");
  const [hoveredSnp, setHoveredSnp] = useState(null);
  const [selectedSnp, setSelectedSnp] = useState(null);

  if (!results) {
    return (
      <div style={{ padding: "80px 40px", textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>🧬</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>No Active Genome Analyzed</h2>
        <p style={{ color: "var(--text-2)", fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>
          You must submit a variant sequence file or execute a demo profile in the Ingest center to populate platform-wide analytics dashboards.
        </p>
        <button onClick={() => navigate("upload")} style={{
          marginTop: 24, padding: "12px 24px", borderRadius: 10, border: "none",
          background: "linear-gradient(135deg, var(--accent), var(--accent-teal))", color: "#fff", fontWeight: 700, cursor: "pointer"
        }}>Ingest Genome Sequence →</button>
      </div>
    );
  }

  const { patientName } = results;

  const currentDiseaseData = results[activeDisease] || {};
  const currentShap = currentDiseaseData.top50_shap || [];
  const positiveSnps = currentShap.filter(s => s.direction === "positive");
  const protectiveSnps = currentShap.filter(s => s.direction === "negative");

  const inspectItem = selectedSnp || hoveredSnp || (currentShap.length > 0 ? currentShap[0] : null);

  const getRiskImpactLabel = (val) => {
    const absVal = Math.abs(val);
    if (absVal >= 0.05) return "Very High Influence";
    if (absVal >= 0.02) return "High Influence";
    if (absVal >= 0.005) return "Moderate Influence";
    return "Low Influence";
  };

  return (
    <div style={{ padding: "40px 44px", maxWidth: 1100, animation: "fadeUp 0.4s ease both" }}>
      <div style={{ marginBottom: 36, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
            Explainable AI (XAI) Dashboard
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text)", letterSpacing: "-1.2px", marginBottom: 6 }}>
            Explainability Center
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>
            Detailed SHAP (Shapley Additive exPlanations) factors mapping variant coefficients for {patientName}.
          </p>
        </div>

        {/* Disease tab controls */}
        <div style={{ display: "flex", gap: 6, background: "var(--surface2)", padding: 4, borderRadius: 10 }}>
          {["diabetes", "cardio", "baldness", "alzheimer"].map(t => (
            <button
              key={t}
              onClick={() => { setActiveDisease(t); setSelectedSnp(null); }}
              style={{
                padding: "8px 16px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer",
                background: activeDisease === t ? "#FFFFFF" : "transparent",
                color: activeDisease === t ? "var(--text)" : "var(--text-2)",
                boxShadow: activeDisease === t ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.15s"
              }}
            >
              {TRAIT_METADATA[t].name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 28, alignItems: "start" }}>
        {/* Left Side: Interactive SHAP Grid */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, boxShadow: "var(--shadow)" }}>
          <div style={{ fontSize: 11, color: "var(--text-2)", marginBottom: 14, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
            Top 50 SNP Contributions (Click a row to pin details in the inspector)
          </div>
          <div style={{ maxHeight: 460, overflowY: "auto", paddingRight: 8 }}>
            {currentShap.map((s) => {
              const isPos = s.direction === "positive";
              const maxAbs = Math.max(...currentShap.map(item => Math.abs(item.contribution)), 0.0001);
              const widthPct = (Math.abs(s.contribution) / maxAbs) * 50;
              const color = isPos ? "var(--danger)" : "var(--accent)";
              
              return (
                <div key={s.rsid}
                  onClick={() => setSelectedSnp(s)}
                  onMouseEnter={() => setHoveredSnp(s)}
                  onMouseLeave={() => setHoveredSnp(null)}
                  style={{
                    display: "flex", alignItems: "center", margin: "6px 0", cursor: "pointer",
                    padding: "6px 8px", borderRadius: 8,
                    background: selectedSnp?.rsid === s.rsid ? "rgba(37,99,235,0.06)" : hoveredSnp?.rsid === s.rsid ? "var(--surface2)" : "transparent",
                    transition: "all 0.1s"
                  }}
                >
                  <span style={{ width: 28, fontSize: 10, color: "var(--text-3)", fontWeight: 700 }}>#{s.rank}</span>
                  <span style={{ width: 90, fontFamily: "var(--mono)", fontSize: 12, fontWeight: 800 }}>{s.rsid}</span>
                  <div style={{ flex: 1, height: 12, position: "relative", background: "rgba(0,0,0,0.02)", borderRadius: 2 }}>
                    <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, borderLeft: "1px dashed var(--border)" }} />
                    <div style={{
                      position: "absolute", top: 1, bottom: 1,
                      left: isPos ? "50%" : `calc(50% - ${widthPct}%)`,
                      width: `${widthPct}%`,
                      background: color,
                      borderRadius: 1
                    }} />
                  </div>
                  <span style={{ width: 80, textAlign: "right", fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: color, marginLeft: 10 }}>
                    {s.contribution > 0 ? "+" : ""}{s.contribution.toFixed(4)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: SNP Inspector Detail Card & Lists */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Detailed SNP Inspector */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, boxShadow: "var(--shadow)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              SNP Locus Inspector
            </h3>
            {inspectItem ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 12, color: "var(--text-2)" }}>Identifier</span>
                  <strong style={{ fontFamily: "var(--mono)", fontSize: 16, color: "var(--accent)" }}>{inspectItem.rsid}</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 12, color: "var(--text-2)" }}>SHAP Contribution</span>
                  <strong style={{ fontFamily: "var(--mono)", fontSize: 14, color: inspectItem.direction === "positive" ? "var(--danger)" : "var(--success)" }}>
                    {inspectItem.contribution > 0 ? "+" : ""}{inspectItem.contribution.toFixed(5)}
                  </strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 12, color: "var(--text-2)" }}>Effect Direction</span>
                  <span style={{
                    padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                    background: inspectItem.direction === "positive" ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)",
                    color: inspectItem.direction === "positive" ? "var(--danger)" : "var(--success)"
                  }}>
                    {inspectItem.direction === "positive" ? "↑ Risk Increasing" : "↓ Protective Locus"}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 12, color: "var(--text-2)" }}>Susceptibility Impact</span>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{getRiskImpactLabel(inspectItem.contribution)}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 12, color: "var(--text-2)" }}>Associated Trait</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{TRAIT_METADATA[activeDisease].name}</span>
                </div>

                <div style={{ marginTop: 10, padding: 12, background: "var(--surface2)", borderRadius: 8, fontSize: 11, color: "var(--text-2)", lineHeight: 1.5 }}>
                  <strong>Interpretation:</strong> This variant contributes an additive weight of {inspectItem.contribution.toFixed(5)} to the disease probability. Hover or click other elements to inspect.
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "var(--text-3)", fontStyle: "italic" }}>
                Hover or click any SNP row in the left grid to inspect details...
              </div>
            )}
          </div>

          {/* Positive vs Negative summaries */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, boxShadow: "var(--shadow)" }}>
              <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", fontWeight: 700 }}>Risk Variants</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "var(--danger)", marginTop: 6 }}>{positiveSnps.length}</div>
              <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 4 }}>Positive contributors</div>
            </div>
            
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, boxShadow: "var(--shadow)" }}>
              <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", fontWeight: 700 }}>Protective Variants</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "var(--success)", marginTop: 6 }}>{protectiveSnps.length}</div>
              <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 4 }}>Negative contributors</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
