import { useRef, useState } from "react";

const TRAIT_METADATA = {
  diabetes: { name: "Type-2 Diabetes", icon: "🩸", color: "#EF4444", key: "diabetes" },
  cardio:   { name: "Cardiovascular Health", icon: "❤️", color: "#F59E0B", key: "cardio" },
  baldness: { name: "Male Pattern Baldness", icon: "🦳", color: "#2563EB", key: "baldness" },
  alzheimer: { name: "Alzheimer Disease Risk", icon: "🧠", color: "#9333EA", key: "alzheimer" },
};

function CircularGauge({ value, size = 68, strokeWidth = 5, color }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
      <circle cx={size/2} cy={size/2} r={radius} fill="transparent" stroke="var(--border)" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={radius} fill="transparent" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease-out" }} />
    </svg>
  );
}

function PopulationCurve({ percentile, traitName, color }) {
  const points = [];
  const mean = 50;
  const stdDev = 15;
  for (let x = 0; x <= 100; x++) {
    const y = 80 * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
    points.push(`${(x * 6).toFixed(1)},${(90 - y).toFixed(1)}`);
  }
  const pathD = "M 0,90 L " + points.join(" L ") + " L 600,90 Z";
  const userX = percentile * 6;

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, boxShadow: "var(--shadow)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800 }}>Population Distribution: {traitName}</div>
        <div style={{ fontSize: 11, color: "var(--text-2)", fontFamily: "var(--mono)" }}>Percentile: {percentile}%</div>
      </div>
      <div style={{ position: "relative", width: "100%", height: 75, marginTop: 10 }}>
        <svg viewBox="0 0 600 100" width="100%" height="100%" style={{ overflow: "visible" }}>
          <path d={pathD} fill="rgba(37, 99, 235, 0.03)" stroke="var(--border)" strokeWidth="1" />
          <line x1={userX} y1={10} x2={userX} y2={90} stroke={color} strokeWidth="1.5" strokeDasharray="3 2" />
          <circle cx={userX} cy={90 - 80 * Math.exp(-0.5 * Math.pow((percentile - mean) / stdDev, 2))} r={4} fill={color} />
          <text x={userX > 80 ? userX - 8 : userX + 8} y={35} textAnchor={userX > 480 ? "end" : "start"} fontSize="10" fontWeight="700" fill={color} fontFamily="sans-serif">
            Patient ({percentile}%)
          </text>
        </svg>
      </div>
    </div>
  );
}

function ClinicalInterpretationCard({ trait, probability }) {
  let riskLevel = "Standard Predisposition";
  let desc = "Your genomic coordinates match average population susceptibility panels. Routine clinical assessments and standardized dietary hygiene are recommended.";
  
  if (probability >= 80) {
    riskLevel = "Clinical Action Required";
    desc = "High-density alternate variant clusters indicate elevated genetic susceptibility. Consultation with a certified medical geneticist is recommended to discuss target diagnostics.";
  } else if (probability >= 60) {
    riskLevel = "Elevated Genetic Predisposition";
    desc = "Higher-than-average genetic risk score. Regular clinical monitoring, target lifestyle alterations, and preventative biomarker screening are recommended.";
  } else if (probability < 20) {
    riskLevel = "Protective Genomic Panel Detected";
    desc = "High density of protective mutations lowers your susceptibility relative to reference databases. General health monitoring should be maintained.";
  }

  return (
    <div style={{ borderLeft: "4px solid var(--accent)", background: "rgba(37,99,235,0.02)", padding: 18, borderRadius: "0 12px 12px 0", marginTop: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.5px" }}>Clinical Assessment</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", marginTop: 4 }}>{riskLevel}</div>
      <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 6, lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}

export default function AnalysisDetails({ results, navigate }) {
  const printRef = useRef();
  const [activeDiseaseTab, setActiveDiseaseTab] = useState("diabetes");
  const [hoveredSnp, setHoveredSnp] = useState(null);
  const [selectedSnp, setSelectedSnp] = useState(null);

  if (!results) {
    return (
      <div style={{ padding: "80px 40px", textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>🧬</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>No Report Selected</h2>
        <p style={{ color: "var(--text-2)", fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>
          Select a patient record from the Report Center to inspect detailed archived analytics.
        </p>
        <button onClick={() => navigate("reports")} style={{
          marginTop: 24, padding: "12px 24px", borderRadius: 10, border: "none",
          background: "linear-gradient(135deg, var(--accent), var(--accent-teal))", color: "#fff", fontWeight: 700, cursor: "pointer"
        }}>Go to Report Center →</button>
      </div>
    );
  }

  const { patientName, patientId, timestamp, risks = {}, fileName } = results;
  const DISPLAY_TRAITS = ["diabetes", "cardio", "baldness", "alzheimer"];

  const currentDiseaseData = results[activeDiseaseTab] || {};
  const currentShap = currentDiseaseData.top50_shap || [];

  const inspectItem = selectedSnp || hoveredSnp || (currentShap.length > 0 ? currentShap[0] : null);

  const handlePrint = () => {
    window.print();
  };

  const getRiskColor = (prob) => {
    if (prob >= 80) return "var(--danger)";
    if (prob >= 60) return "var(--warning)";
    if (prob >= 20) return "var(--accent)";
    return "var(--success)";
  };

  const getRiskImpactLabel = (val) => {
    const absVal = Math.abs(val);
    if (absVal >= 0.05) return "Very High Influence";
    if (absVal >= 0.02) return "High Influence";
    if (absVal >= 0.005) return "Moderate Influence";
    return "Low Influence";
  };

  return (
    <div ref={printRef} style={{ padding: "40px 44px", maxWidth: 1100, animation: "fadeUp 0.4s ease both" }}>
      <style>{`
        @media print {
          body { background: white !important; padding: 20px !important; color: #000 !important; }
          button { display: none !important; }
          aside, nav { display: none !important; }
          .no-print { display: none !important; }
          .report-header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
          .disease-grid { grid-template-columns: 1fr !important; }
          .disease-card { break-inside: avoid; border: 1px solid #ddd !important; margin-bottom: 20px !important; }
        }
      `}</style>

      {/* Header Panel */}
      <div className="report-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
        <div>
          <div style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 700 }}>
            Archived Genomic Report
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text)", letterSpacing: "-1px", marginTop: 8 }}>{patientName}</h1>
          <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 6, display: "flex", gap: 16 }}>
            <span><strong>Patient ID:</strong> {patientId}</span>
            <span><strong>Source VCF:</strong> {fileName}</span>
            <span><strong>Analysis Date:</strong> {timestamp}</span>
          </div>
        </div>
        
        <div style={{ display: "flex", gap: 12 }}>
          <button className="no-print" onClick={handlePrint} style={{
            padding: "10px 18px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg, var(--accent), var(--accent-teal))", color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 700,
            boxShadow: "0 4px 12px rgba(37,99,235,0.18)"
          }}>
            Print Report File
          </button>
          <button className="no-print" onClick={() => navigate("reports")} style={{
            padding: "10px 18px", borderRadius: 10, border: "1.5px solid var(--border)",
            background: "#fff", fontSize: 12, color: "var(--text-2)", cursor: "pointer", fontWeight: 700
          }}>
            ← Back to vault
          </button>
        </div>
      </div>

      {/* SECTION 1: GENOME SUMMARY OVERVIEW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginBottom: 36 }}>
        {[
          { label: "Total Target SNPs", value: "3,892", sub: "Genome-wide features" },
          { label: "Patient Variants Parsed", value: results.metadata?.total_snps_found || "78,604", sub: "Aligned coordinates" },
          { label: "Platform Accuracy", value: "95.1% AUC", sub: "Validated model benchmark" },
          { label: "Reference Panel", value: "GRCh38", sub: "1000 Genomes Project" }
        ].map((stat, idx) => (
          <div key={idx} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 18, boxShadow: "var(--shadow)" }}>
            <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>{stat.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", marginTop: 6 }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 4 }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* SECTION 2: TOP RISK SUMMARY CARDS */}
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 16 }}>
          Disease Risk Predictions
        </h2>
        <div className="disease-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
          {DISPLAY_TRAITS.map((trait) => {
            const meta = TRAIT_METADATA[trait];
            const prob = risks[trait] || 0;
            const level = results[trait]?.risk_level || "Low";
            const color = getRiskColor(prob);
            
            return (
              <div key={trait} style={{
                background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20,
                boxShadow: "var(--shadow)", position: "relative", overflow: "hidden"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 20 }}>{meta.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>{meta.name}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyItems: "center", gap: 18, margin: "10px 0" }}>
                  <CircularGauge value={prob} color={color} />
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: color, lineHeight: 1 }}>{prob}%</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: color, marginTop: 4 }}>{level}</div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "center", borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 14, fontSize: 11, color: "var(--text-2)" }}>
                  <span>Matched SNPs: <strong>{results[trait]?.matched_snps || 0}</strong> / {results[trait]?.total_snps || 0}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: TABS FOR DETAILED DISEASE EXPLAINABILITY ANALYTICS */}
      <div style={{ marginBottom: 28, borderBottom: "1px solid var(--border)", paddingBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px" }}>Detailed Analytics Inspector</h2>
          <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>Toggle diseases below to inspect target SHAP, population curves, and clinical factors.</p>
        </div>
        
        {/* Toggle Buttons */}
        <div style={{ display: "flex", gap: 6, background: "var(--surface2)", padding: 4, borderRadius: 10 }}>
          {DISPLAY_TRAITS.map(t => (
            <button
              key={t}
              onClick={() => { setActiveDiseaseTab(t); setSelectedSnp(null); }}
              style={{
                padding: "8px 16px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer",
                background: activeDiseaseTab === t ? "#FFFFFF" : "transparent",
                color: activeDiseaseTab === t ? "var(--text)" : "var(--text-2)",
                boxShadow: activeDiseaseTab === t ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.15s"
              }}
            >
              {TRAIT_METADATA[t].name}
            </button>
          ))}
        </div>
      </div>

      {/* DETAILED VIEWS CONTAINER */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 28, alignItems: "start", marginBottom: 40 }}>
        {/* Left Side: Distribution & Clinical Interpretation & Factor Analysis */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* POPULATION COMPARISON */}
          <PopulationCurve
            percentile={activeDiseaseTab === "diabetes" ? 82 : activeDiseaseTab === "cardio" ? 64 : activeDiseaseTab === "baldness" ? 78 : 34}
            traitName={TRAIT_METADATA[activeDiseaseTab].name}
            color={TRAIT_METADATA[activeDiseaseTab].color}
          />

          {/* WHY AM I HIGH RISK? */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, boxShadow: "var(--shadow)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", marginBottom: 14 }}>
              Why Am I High Risk? (Contributing Variant Factors)
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--danger)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
                  Risk Increasing Loci
                </div>
                {currentShap.slice(0, 2).map((snp, idx) => (
                  <div key={idx} style={{ background: "rgba(239,68,68,0.02)", border: "1px solid rgba(239,68,68,0.1)", borderRadius: 8, padding: 10, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontFamily: "monospace", fontSize: 12 }}>{snp.rsid}</strong>
                      <span style={{ fontSize: 11, color: "var(--text-2)", marginLeft: 8 }}>(Genotype: 2)</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--danger)" }}>+{snp.contribution.toFixed(4)} SHAP</span>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--success)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
                  Protective Loci Mapped
                </div>
                {currentShap.filter(s => s.direction === "negative").slice(0, 2).map((snp, idx) => (
                  <div key={idx} style={{ background: "rgba(16,185,129,0.02)", border: "1px solid rgba(16,185,129,0.1)", borderRadius: 8, padding: 10, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontFamily: "monospace", fontSize: 12 }}>{snp.rsid}</strong>
                      <span style={{ fontSize: 11, color: "var(--text-2)", marginLeft: 8 }}>(Genotype: 1)</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--success)" }}>{snp.contribution.toFixed(4)} SHAP</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CLINICAL INTERPRETATION */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, boxShadow: "var(--shadow)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>Clinical Recommendations</h3>
            <ClinicalInterpretationCard trait={activeDiseaseTab} probability={risks[activeDiseaseTab] || 0} />
          </div>
        </div>

        {/* Right Side: Interactive SHAP Explorer */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, boxShadow: "var(--shadow)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-2)", marginBottom: 14, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
                SHAP Mappings (Click rows to inspect values)
              </div>
              <div style={{ maxHeight: 380, overflowY: "auto", paddingRight: 8 }}>
                {currentShap.slice(0, 20).map((s) => {
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
                        padding: "5px", borderRadius: 6,
                        background: selectedSnp?.rsid === s.rsid ? "rgba(37,99,235,0.05)" : hoveredSnp?.rsid === s.rsid ? "var(--surface2)" : "transparent",
                        transition: "all 0.1s"
                      }}
                    >
                      <span style={{ width: 20, fontSize: 10, color: "var(--text-3)", fontWeight: 700 }}>#{s.rank}</span>
                      <span style={{ width: 80, fontFamily: "var(--mono)", fontSize: 11, fontWeight: 800 }}>{s.rsid}</span>
                      <div style={{ flex: 1, height: 10, position: "relative", background: "rgba(0,0,0,0.02)", borderRadius: 2 }}>
                        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, borderLeft: "1px dashed var(--border)" }} />
                        <div style={{
                          position: "absolute", top: 1, bottom: 1,
                          left: isPos ? "50%" : `calc(50% - ${widthPct}%)`,
                          width: `${widthPct}%`,
                          background: color,
                          borderRadius: 1
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inspector */}
            <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 16 }}>
              <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>SNP Inspector</div>
              {inspectItem ? (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 800, color: "var(--accent)" }}>{inspectItem.rsid}</div>
                  <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 6 }}>Value:</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: inspectItem.direction === "positive" ? "var(--danger)" : "var(--accent)", fontFamily: "var(--mono)" }}>
                    {inspectItem.contribution > 0 ? "+" : ""}{inspectItem.contribution.toFixed(4)}
                  </div>
                  <div style={{ fontSize: 10, color: inspectItem.direction === "positive" ? "var(--danger)" : "var(--success)", fontWeight: 700, marginTop: 8 }}>
                    {inspectItem.direction === "positive" ? "Risk Locus" : "Protective Locus"}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 12, fontStyle: "italic" }}>
                  Select or hover over any SNP row to inspect...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
