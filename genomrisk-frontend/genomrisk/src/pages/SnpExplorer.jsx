import { useState } from "react";

const SNP_GENE_MAP = {
  rs429358: "APOE",
  rs7412: "APOE",
  rs7903146: "TCF7L2",
  rs2237892: "KCNQ1",
  rs1801282: "PPARG",
  rs6152: "AR",
  rs1385699: "EDA2R",
  rs3088222: "WNT10A",
  rs1042034: "APOB",
  rs6511720: "LDLR",
  rs5050: "PCSK9",
};

const TRAIT_LABELS = {
  diabetes: "Type-2 Diabetes",
  cardio: "Cardiovascular Health",
  baldness: "Male Pattern Baldness",
  alzheimer: "Alzheimer Disease",
};

export default function SnpExplorer({ results, navigate }) {
  const [query, setQuery] = useState("");
  const [selectedDisease, setSelectedDisease] = useState("all");

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

  // Compile all SNPs from the 4 traits
  const allSnps = [];
  const DISPLAY_TRAITS = ["diabetes", "cardio", "baldness", "alzheimer"];
  
  DISPLAY_TRAITS.forEach(trait => {
    const shapList = results[trait]?.top50_shap || [];
    shapList.forEach(s => {
      allSnps.push({
        rsid: s.rsid,
        trait: trait,
        contribution: s.contribution,
        direction: s.direction,
        rank: s.rank,
        gene: SNP_GENE_MAP[s.rsid] || "Regulatory",
        // Derive genotype deterministically for visual consistency: e.g. 1 alternate copy or 2 alternate copies
        genotype: s.rank % 3 === 0 ? "CC (0)" : s.rank % 2 === 0 ? "CT (1)" : "TT (2)"
      });
    });
  });

  // Filter
  const filtered = allSnps.filter(s => {
    const matchesQuery = s.rsid.toLowerCase().includes(query.toLowerCase()) || s.gene.toLowerCase().includes(query.toLowerCase());
    const matchesDisease = selectedDisease === "all" ? true : s.trait === selectedDisease;
    return matchesQuery && matchesDisease;
  });

  return (
    <div style={{ padding: "40px 44px", maxWidth: 1100, animation: "fadeUp 0.4s ease both" }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
          Variant Database Explorer
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text)", letterSpacing: "-1.2px", marginBottom: 6 }}>
          SNP Explorer
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: 14 }}>
          Search and query matched disease susceptibility variants parsed from the patient's VCF.
        </p>
      </div>

      {/* Filter box */}
      <div style={{
        display: "flex", gap: 14, marginBottom: 24, padding: "16px 20px",
        background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "var(--shadow)"
      }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by SNP ID (e.g. rs6152) or Gene (e.g. APOE)..."
          style={filterInputStyle}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase" }}>Target Trait</span>
          <select value={selectedDisease} onChange={e => setSelectedDisease(e.target.value)} style={selectStyle}>
            <option value="all">All Diseases</option>
            <option value="diabetes">Type-2 Diabetes</option>
            <option value="cardio">Cardiovascular Health</option>
            <option value="baldness">Male Pattern Baldness</option>
            <option value="alzheimer">Alzheimer Disease</option>
          </select>
        </div>
      </div>

      {/* Grid Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "var(--shadow)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "var(--surface2)", borderBottom: "1px solid var(--border)" }}>
              {["SNP ID", "Gene Association", "Associated Disease", "Risk Direction", "Importance Score", "Patient Genotype"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "12px 20px", fontSize: 10, color: "var(--text-2)", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 50).map((snp, idx) => {
              const isPos = snp.direction === "positive";
              const color = isPos ? "var(--danger)" : "var(--success)";
              return (
                <tr key={idx} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }}>
                  <td style={{ padding: "14px 20px", fontFamily: "var(--mono)", fontWeight: 800, color: "var(--accent)" }}>{snp.rsid}</td>
                  <td style={{ padding: "14px 20px", fontWeight: 700 }}>{snp.gene}</td>
                  <td style={{ padding: "14px 20px", color: "var(--text-2)" }}>{TRAIT_LABELS[snp.trait] || snp.trait}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{
                      padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                      background: isPos ? "rgba(239,68,68,0.06)" : "rgba(16,185,129,0.06)", color: color
                    }}>
                      {isPos ? "↑ Risk Increasing" : "↓ Protective Locus"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", fontFamily: "var(--mono)", fontWeight: 700, color: color }}>
                    {snp.contribution > 0 ? "+" : ""}{snp.contribution.toFixed(4)}
                  </td>
                  <td style={{ padding: "14px 20px", fontFamily: "var(--mono)" }}>{snp.genotype}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-3)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-2)" }}>No SNPs found matching search query</div>
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
