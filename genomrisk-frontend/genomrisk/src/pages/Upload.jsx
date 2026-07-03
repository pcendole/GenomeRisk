import { useState, useRef, useEffect } from "react";
import { apiPostForm } from "../api";

const TRAITS = [
  { id: "diabetes", name: "Type-2 Diabetes", icon: "🩸", desc: "Sequence-derived metabolic trait probability from learned genomic patterns." },
  { id: "cardio",   name: "Cardiovascular Health", icon: "❤️", desc: "Sequence-aware prediction of cardiovascular trait probability from high-impact SNPs." },
  { id: "baldness", name: "Male Pattern Baldness", icon: "🦳", desc: "DNA sequence signal extraction for androgenic alopecia risk estimation." },
  { id: "alzheimer", name: "Alzheimer Disease", icon: "🧠", desc: "Genetic risk estimate for Alzheimer disease (population-calibrated model score)." },
];

async function runInference(file, selectedTraits, patientName, patientId, patientGender) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("patient_name", patientName);
  formData.append("patient_id", patientId);
  formData.append("patient_gender", patientGender);
  formData.append("selected_traits", JSON.stringify(selectedTraits));

  try {
    const data = await apiPostForm("/api/analyze", formData);
    return data;
  } catch (error) {
    console.error("Inference Error:", error);
    return { error: error.message };
  }
}

export default function Upload({ navigate, setResults }) {
  const [selectedTraits, setSelectedTraits] = useState([]);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [gender, setGender] = useState("male");
  const [stage, setStage] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  


  const fileRef = useRef();

  const steps = [
    "Uploading Genome File",
    "Extracting Target Variants",
    "Matching Disease SNPs",
    "Running Deep Machine Learning Engines",
    "Generating Explainability Mappings",
    "Creating Clinical Report"
  ];

  const handleTraitToggle = (id) => {
    if (id === "baldness" && gender === "female") return;
    setSelectedTraits(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (gender === "female" && selectedTraits.includes("baldness")) {
      setSelectedTraits(prev => prev.filter(t => t !== "baldness"));
    }
  }, [gender]);

  const handleFile = (f) => {
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (ext === "vcf") setFile(f);
    else alert("Please upload a .vcf file");
  };

  const handleAnalyze = async () => {
    if (!file) { alert("Please upload a VCF file."); return; }
    if (!patientName.trim()) { alert("Patient Name is required."); return; }
    if (!patientId.trim()) { alert("Patient ID is required."); return; }
    if (selectedTraits.length === 0) { alert("Please select at least one trait."); return; }
    
    setStage("loading");
    setProgress(0);
    setCurrentStepIndex(0);

    // Dynamic step loader timer
    for (let i = 0; i < steps.length; i++) {
        setCurrentStepIndex(i);
        await new Promise(r => setTimeout(r, 600));
        setProgress(Math.round(((i + 1) / steps.length) * 100));
    }

    const res = await runInference(file, selectedTraits, patientName, patientId, gender);
    if (res.error) {
        alert(res.error);
        setStage("idle");
    } else {
        setResults(res);
        setStage("done");
        setTimeout(() => navigate("results"), 500);
    }
  };

  const handleLoadDemo = async (profile) => {
    setStage("loading");
    setProgress(0);
    setCurrentStepIndex(0);

    for (let i = 0; i < steps.length; i++) {
        setCurrentStepIndex(i);
        await new Promise(r => setTimeout(r, 500));
        setProgress(Math.round(((i + 1) / steps.length) * 100));
    }

    try {
        const res = await apiPostForm(`/api/analyze/demo/${profile}`, new FormData());
        setResults(res);
        setStage("done");
        setTimeout(() => navigate("results"), 500);
    } catch (e) {
        alert(e.message || "Error running demo analysis");
        setStage("idle");
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = 2;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div style={{ padding: "40px 44px", maxWidth: 1000, animation: "fadeUp 0.4s ease both" }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
          New Pipeline
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text)", letterSpacing: "-1.2px", marginBottom: 6 }}>
          Ingest Genomic Sample
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: 14 }}>
          Map individual raw sequence variants onto predictive ML classifiers for disease risk assessment.
        </p>
      </div>

      {stage === "loading" ? (
        <div style={{
          background: "var(--surface)",
          borderRadius: "var(--radius)",
          padding: "64px 48px",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 56, marginBottom: 20, animation: "pulse-glow 2s infinite" }}>🧬</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>Analyzing DNA Sequence</h2>
          <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 700, marginBottom: 36, fontFamily: "var(--mono)" }}>
            {steps[currentStepIndex]}...
          </div>
          
          <div style={{ maxWidth: 500, margin: "0 auto 48px", height: 8, background: "var(--surface2)", borderRadius: 99, overflow: "hidden" }}>
             <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent)", transition: "width 0.3s" }} />
          </div>

          {/* Timeline steps representation */}
          <div style={{ display: "flex", justifyContent: "space-between", maxWidth: 680, margin: "0 auto", position: "relative" }}>
            <div style={{ position: "absolute", top: 12, left: 16, right: 16, height: 2, background: "var(--border)", zIndex: 1 }} />
            <div style={{ position: "absolute", top: 12, left: 16, width: `${(currentStepIndex / (steps.length - 1)) * 100}%`, height: 2, background: "var(--accent)", zIndex: 1, transition: "width 0.4s" }} />
            
            {steps.map((st, idx) => {
              const active = idx <= currentStepIndex;
              return (
                <div key={idx} style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", width: 60 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: active ? "var(--accent)" : "var(--surface)",
                    border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`,
                    color: active ? "#FFFFFF" : "var(--text-3)",
                    fontSize: 10, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.3s"
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 600, color: active ? "var(--text)" : "var(--text-3)", marginTop: 8, textAlign: "center", whiteSpace: "normal" }}>
                    {st.split(" ")[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 28 }}>
          {/* Left panel: Patient & Traits select */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Patient Info */}
            <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", padding: "28px", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
              <h3 style={{ fontWeight: 800, fontSize: 15, color: "var(--text)", marginBottom: 18 }}>1. Patient Clinical Records</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-2)", marginBottom: 8 }}>Full Name</label>
                  <input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Sarah Jenkins" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-2)", marginBottom: 8 }}>Patient ID</label>
                  <input value={patientId} onChange={e => setPatientId(e.target.value)} placeholder="GMC-9941" style={inputStyle} />
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-2)", marginBottom: 8 }}>Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 160 }}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>



            {/* Disease target checklists */}
            <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", padding: "28px", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
              <h3 style={{ fontWeight: 800, fontSize: 15, color: "var(--text)", marginBottom: 16 }}>2. Target Trait Mappings</h3>
              {TRAITS.map(t => {
                const disabled = t.id === "baldness" && gender === "female";
                const isSelected = selectedTraits.includes(t.id);
                return (
                  <div key={t.id} onClick={() => handleTraitToggle(t.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "14px", borderRadius: 12,
                      cursor: disabled ? "not-allowed" : "pointer",
                      border: `1.5px solid ${isSelected ? "rgba(37,99,235,0.4)" : "var(--border)"}`,
                      background: isSelected ? "rgba(37,99,235,0.03)" : "transparent",
                      marginBottom: 10, transition: "0.2s", opacity: disabled ? 0.45 : 1
                    }}>
                    <div style={{ fontSize: 24 }}>{t.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                        {t.name}{disabled ? " (N/A for Female)" : ""}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 2, lineHeight: 1.4 }}>{t.desc}</div>
                    </div>
                    <input type="checkbox" checked={isSelected} readOnly disabled={disabled} style={{ accentColor: "var(--accent)", scale: "1.1" }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right panel: File Drop & Demo Gallery */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Ingest Card */}
            <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", padding: "28px", border: "1px solid var(--border)", boxShadow: "var(--shadow)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: 15, color: "var(--text)", marginBottom: 18 }}>3. Ingest Variant Sequence</h3>
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
                  onClick={() => fileRef.current.click()}
                  style={{
                    border: `2px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: 14, padding: "52px 20px", textAlign: "center",
                    background: dragging ? "rgba(37,99,235,0.03)" : "var(--surface2)",
                    cursor: "pointer", transition: "all 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
                  onMouseLeave={e => { if(!dragging) e.currentTarget.style.borderColor = "var(--border)"; }}
                >
                  <div style={{ fontSize: 44, marginBottom: 12, filter: "grayscale(20%)" }}>{file ? "📄" : "🧬"}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                    {file ? file.name : "Select raw VCF sequence"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 6 }}>
                    {file ? formatBytes(file.size) : "Drag and drop clinical genomic file"}
                  </div>
                  <input ref={fileRef} type="file" accept=".vcf" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
                </div>

                <div style={{ marginTop: 24, padding: 18, borderRadius: 12, background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.15)", color: "var(--text-2)", fontSize: 12, lineHeight: 1.6 }}>
                  <strong>Ingestion Notice:</strong> The pipeline extracts genetic alternate dosage markers (0/1/2 encoding) relative to reference genome assembly version GRCh38.
                </div>
              </div>
              
              <button onClick={handleAnalyze} disabled={!file || selectedTraits.length === 0}
                style={{
                  width: "100%", marginTop: 32, padding: "14px", borderRadius: 12, border: "none",
                  background: (!file || selectedTraits.length === 0) ? "var(--surface2)" : "linear-gradient(135deg, var(--accent), var(--accent-teal))",
                  color: (!file || selectedTraits.length === 0) ? "var(--text-3)" : "#FFFFFF",
                  fontWeight: 700, cursor: (!file || selectedTraits.length === 0) ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  boxShadow: (!file || selectedTraits.length === 0) ? "none" : "0 4px 16px rgba(37,99,235,0.2)"
                }}
                onMouseEnter={e => { if (file && selectedTraits.length > 0) e.target.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.target.style.transform = "none"; }}
              >
                Execute Analysis →
              </button>
            </div>

            {/* Demo Gallery Card */}
            <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", padding: "28px", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
              <h3 style={{ fontWeight: 800, fontSize: 15, color: "var(--text)", marginBottom: 12 }}>4. Live Presentation Demo Gallery</h3>
              <p style={{ fontSize: 11, color: "var(--text-2)", marginBottom: 20 }}>Load reference sequences to demo dynamic machine learning predictions immediately.</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { id: "diabetes", label: "High Diabetes Profile", icon: "🩸", color: "#EF4444" },
                  { id: "alzheimer", label: "High Alzheimer Profile", icon: "🧠", color: "#9333EA" },
                  { id: "baldness", label: "High Baldness Profile", icon: "🦳", color: "#2563EB" },
                  { id: "balanced", label: "Balanced Risk Profile", icon: "⚖️", color: "var(--accent-teal)" }
                ].map(demo => (
                  <button
                    key={demo.id}
                    onClick={() => handleLoadDemo(demo.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "12px", borderRadius: 10,
                      border: "1px solid var(--border)", background: "#FFFFFF", cursor: "pointer",
                      fontSize: 12, fontWeight: 700, color: "var(--text)", transition: "all 0.15s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = demo.color; e.currentTarget.style.background = "var(--surface2)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "#FFFFFF"; }}
                  >
                    <span style={{ fontSize: 16 }}>{demo.icon}</span>
                    <span style={{ textAlign: "left", lineHeight: 1.2 }}>{demo.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "#FFFFFF",
  color: "var(--text)",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s, box-shadow 0.2s"
};
