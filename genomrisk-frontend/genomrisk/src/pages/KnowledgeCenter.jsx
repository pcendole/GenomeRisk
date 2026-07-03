import { useState } from "react";

const DISEASE_PROFILES = {
  alzheimer: {
    name: "Alzheimer Disease Risk",
    icon: "🧠",
    color: "#9333EA",
    overview: "Alzheimer's disease is a progressive, neurodegenerative disorder characterized by cognitive decline, memory impairment, and neurofibrillary plaque build-up in brain tissue.",
    genetic: "High genetic predisposition, with herizability estimates ranging between 60% and 80%. Multi-locus risk profiles combine statistical susceptibility markers across critical sequence regions.",
    environmental: "Physical inactivity, cardiovascular risk factors (hypertension, hyperlipidemia), cognitive isolation, and chronic sleep deprivation are primary environmental modulators.",
    genes: ["APOE", "TREM2", "CLU", "ABCA7"],
    snps: ["rs429358 (APOE-ε4)", "rs7412 (APOE-ε2)", "rs75932628 (TREM2)"],
    stats: {
      accuracy: "88.04%",
      auc: "0.9576",
      precision: "0.6988",
      recall: "0.9134",
      f1: "0.7918",
      mcc: "0.7225"
    }
  },
  diabetes: {
    name: "Type-2 Diabetes Susceptibility",
    icon: "🩸",
    color: "#EF4444",
    overview: "Type-2 Diabetes mellitus is a metabolic syndrome characterized by chronic hyperglycemia, peripheral insulin resistance, and progressive beta-cell dysfunction.",
    genetic: "Moderate to high genetic heritability (~30% to 70%). Susceptibility is determined by multiple low-effect regulatory variants operating within insulin secretion pathways.",
    environmental: "Sedentary lifestyle, hypercaloric diets high in refined carbohydrates, central obesity, and chronic systemic inflammation act as major disease triggers.",
    genes: ["TCF7L2", "KCNQ1", "PPARG", "SLC30A8"],
    snps: ["rs7903146 (TCF7L2)", "rs2237892 (KCNQ1)", "rs1801282 (PPARG)"],
    stats: {
      accuracy: "81.57%",
      auc: "0.9145",
      precision: "0.5892",
      recall: "0.8583",
      f1: "0.6987",
      mcc: "0.5935"
    }
  },
  cardio: {
    name: "Cardiovascular Health",
    icon: "❤️",
    color: "#F59E0B",
    overview: "Cardiovascular disease refers to coronary artery disease, atherosclerosis, and myocardial infarction risk profiles modulated by circulating lipid particles.",
    genetic: "Polygenic herizability ranges between 40% and 60%. Genetic susceptibility markers regulate apolipoprotein levels, vascular elasticity, and plaque stability factors.",
    environmental: "Tobacco smoke exposure, high LDL cholesterol levels, hypertension, physical inactivity, chronic stress, and inflammatory dietary profiles.",
    genes: ["APOB", "LDLR", "PCSK9", "LPA"],
    snps: ["rs1042034 (ApoB)", "rs6511720 (LDLR)", "rs5050 (PCSK9)"],
    stats: {
      accuracy: "91.76%",
      auc: "0.9689",
      precision: "0.8058",
      recall: "0.8819",
      f1: "0.8421",
      mcc: "0.7880"
    }
  },
  baldness: {
    name: "Male Pattern Baldness",
    icon: "🦳",
    color: "#2563EB",
    overview: "Androgenetic alopecia is a localized hair thinning and hairline recession condition driven by the sensitivity of hair follicles to circulating androgenic hormones.",
    genetic: "High genetic heritability (~80%). Main susceptibility genes map directly onto the X chromosome, inherited maternally, and various autosomes.",
    environmental: "High androgen levels, chronic stress, localized scalp inflammation, microcirculation compromises, and nutritional deficiencies.",
    genes: ["AR (Androgen Receptor)", "EDA2R", "WNT10A", "SRD5A2"],
    snps: ["rs6152 (AR)", "rs1385699 (EDA2R)", "rs3088222 (WNT10A)"],
    stats: {
      accuracy: "93.12%",
      auc: "0.9742",
      precision: "0.8082",
      recall: "0.9516",
      f1: "0.8741",
      mcc: "0.8324"
    }
  }
};

export default function KnowledgeCenter({ navigate }) {
  const [selectedDisease, setSelectedDisease] = useState("alzheimer");

  const active = DISEASE_PROFILES[selectedDisease];

  return (
    <div style={{ padding: "40px 44px", maxWidth: 1100, animation: "fadeUp 0.4s ease both" }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
          Medical Knowledge Base
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text)", letterSpacing: "-1px", marginBottom: 6 }}>
          Disease Knowledge Center
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: 14 }}>
          Clinical summaries, genetic parameters, and key target SNPs evaluated by our platform.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 28, alignItems: "start" }}>
        {/* Left Side: Disease Card Selection */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {Object.entries(DISEASE_PROFILES).map(([key, data]) => {
            const isSelected = selectedDisease === key;
            return (
              <div
                key={key}
                onClick={() => setSelectedDisease(key)}
                style={{
                  background: "var(--surface)", border: `1.5px solid ${isSelected ? data.color : "var(--border)"}`,
                  borderRadius: 12, padding: 18, cursor: "pointer", transition: "all 0.15s ease",
                  boxShadow: isSelected ? `0 4px 20px ${data.color}08` : "var(--shadow)",
                  display: "flex", alignItems: "center", gap: 14
                }}
                onMouseEnter={e => { if(!isSelected) e.currentTarget.style.borderColor = "var(--text-3)"; }}
                onMouseLeave={e => { if(!isSelected) e.currentTarget.style.borderColor = "var(--border)"; }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: isSelected ? data.color + "15" : "var(--surface2)",
                  color: isSelected ? data.color : "var(--text-2)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
                }}>{data.icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>{data.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 2 }}>Click to inspect parameters</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Detailed Profile Viewer */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 28, boxShadow: "var(--shadow)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 20 }}>
            <span style={{ fontSize: 28 }}>{active.icon}</span>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>{active.name}</h2>
              <div style={{ fontSize: 10, color: active.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginTop: 2 }}>Clinically Mapped</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Overview */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Clinical Overview</h4>
              <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{active.overview}</p>
            </div>

            {/* Genetic vs Environmental splits */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Genetic Influence</h4>
                <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{active.genetic}</p>
              </div>
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Environmental Modulators</h4>
                <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{active.environmental}</p>
              </div>
            </div>

            {/* Model Performance Benchmarks */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
                Model Performance Benchmarks
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
                {[
                  { label: "Accuracy", value: active.stats.accuracy },
                  { label: "ROC-AUC", value: active.stats.auc },
                  { label: "Precision", value: active.stats.precision },
                  { label: "Recall", value: active.stats.recall },
                  { label: "F1-Score", value: active.stats.f1 },
                  { label: "MCC", value: active.stats.mcc }
                ].map((s, idx) => (
                  <div key={idx} style={{ background: "var(--surface2)", padding: "10px 12px", borderRadius: 8, textAlign: "center", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 9, color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2px" }}>{s.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", marginTop: 4, fontFamily: "var(--mono)" }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Genes & SNPs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, borderTop: "1px solid var(--border)", paddingTop: 20 }}>
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Primary Genes Mapped</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {active.genes.map(gene => (
                    <span key={gene} style={{
                      padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                      background: "var(--surface2)", color: "var(--text)"
                    }}>{gene}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Highest-Impact SNPs</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {active.snps.map(snp => (
                    <div key={snp} style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)" }}>
                      ✦ {snp}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
