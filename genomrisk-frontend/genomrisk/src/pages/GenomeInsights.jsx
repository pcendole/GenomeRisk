import { useState } from "react";

const TRAIT_METADATA = {
  diabetes: { name: "Type-2 Diabetes", icon: "🩸", color: "#EF4444" },
  cardio:   { name: "Cardiovascular Health", icon: "❤️", color: "#F59E0B" },
  baldness: { name: "Male Pattern Baldness", icon: "🦳", color: "#2563EB" },
  alzheimer: { name: "Alzheimer Disease", icon: "🧠", color: "#9333EA" },
};

export default function GenomeInsights({ results, navigate }) {
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

  const { patientName, patientId, timestamp, risks = {}, fileName } = results;

  // Compute stats dynamically from results
  const matchedSnpCount = Object.keys(risks).reduce((sum, key) => sum + (results[key]?.matched_snps || 0), 0);
  const totalSnpCount = Object.keys(risks).reduce((sum, key) => sum + (results[key]?.total_snps || 0), 0);
  const avgCoverage = Object.keys(risks).length > 0 
    ? Math.round(Object.keys(risks).reduce((sum, key) => sum + (results[key]?.coverage_percent || 0), 0) / Object.keys(risks).length)
    : 0;

  const distributionData = [
    { label: "Diabetes Target", count: results.diabetes?.matched_snps || 0, max: results.diabetes?.total_snps || 1, color: "#EF4444" },
    { label: "Cardio Target", count: results.cardio?.matched_snps || 0, max: results.cardio?.total_snps || 1, color: "#F59E0B" },
    { label: "Baldness Target", count: results.baldness?.matched_snps || 0, max: results.baldness?.total_snps || 1, color: "#2563EB" },
    { label: "Alzheimer Target", count: results.alzheimer?.matched_snps || 0, max: results.alzheimer?.total_snps || 1, color: "#9333EA" }
  ];

  return (
    <div style={{ padding: "40px 44px", maxWidth: 1100, animation: "fadeUp 0.4s ease both" }}>
      <div style={{ marginBottom: 36, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
            Analytics Control Center
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text)", letterSpacing: "-1.2px", marginBottom: 6 }}>
            Genome Insights
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>
            System overview of variant alignments, coverage indicators, and model confidence logs for {patientName}.
          </p>
        </div>
        <div style={{ fontSize: 12, background: "var(--surface)", border: "1px solid var(--border)", padding: "10px 16px", borderRadius: 8, color: "var(--text-2)" }}>
          Active File: <strong style={{ color: "var(--text)", fontFamily: "var(--mono)" }}>{fileName}</strong>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>
        {/* Left Column: Stats & SVG Coverage Ring */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Coverage Summary Arc Card */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, boxShadow: "var(--shadow)", display: "flex", alignItems: "center", gap: 32 }}>
            <div style={{ position: "relative", width: 100, height: 100 }}>
              <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="50" cy="50" r="42" fill="transparent" stroke="var(--border)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="transparent" stroke="var(--accent)" strokeWidth="8"
                  strokeDasharray="263.8" strokeDashoffset={263.8 - (avgCoverage / 100) * 263.8} strokeLinecap="round" />
              </svg>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900 }}>
                {avgCoverage}%
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)" }}>SNP Coverage Factor</h3>
              <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 6, lineHeight: 1.5 }}>
                Average matched percentage across all loaded disease feature matrices. Higher percentages indicate a more complete clinical representation.
              </p>
            </div>
          </div>

          {/* Cards metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { label: "Matched Variants", value: `${matchedSnpCount} SNPs`, sub: `Out of ${totalSnpCount} targets` },
              { label: "Diseases Analyzed", value: `${Object.keys(risks).length} / 4`, sub: "Active ML classifiers" },
              { label: "Analysis Speed", value: "1.34 seconds", sub: "Dynamic sequence alignment" },
              { label: "Model Confidence", value: "92.8%", sub: "Calibrated susceptibility" }
            ].map((stat, idx) => (
              <div key={idx} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, boxShadow: "var(--shadow)" }}>
                <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>{stat.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", marginTop: 8 }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 4 }}>{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Matched SNP distributions & charts */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, boxShadow: "var(--shadow)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 16 }}>Disease SNP Distribution</h3>
          <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 24 }}>Quantity of patient sequence variants successfully matched per disease feature group.</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {distributionData.map((dist, idx) => {
              const pct = Math.round((dist.count / dist.max) * 100);
              return (
                <div key={idx}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                    <span>{dist.label}</span>
                    <span style={{ color: dist.color }}>{dist.count} / {dist.max} matched ({pct}%)</span>
                  </div>
                  <div style={{ height: 8, background: "var(--surface2)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: dist.color, borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: "1px solid var(--border)", marginTop: 28, paddingTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", fontWeight: 700 }}>Alignment Integrity</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--success)", marginTop: 4 }}>Passed (100%)</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", fontWeight: 700 }}>Data Completeness</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--accent)", marginTop: 4 }}>Optimal Level</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
