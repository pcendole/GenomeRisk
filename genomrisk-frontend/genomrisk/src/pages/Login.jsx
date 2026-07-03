import { useState } from "react";

export default function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 900));
    onLogin({
      name: name.startsWith("Dr.") ? name : "Dr. " + name,
      email,
      hospital: "Government Medical College"
    });
    setLoading(false);
  };

  const handleDemoClick = () => {
    setName("Sarah Jenkins");
    setEmail("demo@genomrisk.ai");
    setPassword("password123");
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "var(--bg)",
      fontFamily: "var(--font)",
      color: "var(--text)"
    }}>
      <style>{`
        @keyframes dnaRotate {
          0% { transform: translateY(0px); }
          50% { transform: translateY(12px); }
          100% { transform: translateY(0px); }
        }
        @keyframes strandRotate {
          0% { transform: scaleY(1); opacity: 0.8; }
          50% { transform: scaleY(-1); opacity: 0.4; }
          100% { transform: scaleY(1); opacity: 0.8; }
        }
        .dna-node {
          animation: dnaRotate 2.5s ease-in-out infinite;
        }
        .dna-bar {
          animation: strandRotate 2.5s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>

      {/* Left panel: Product Landing & DNA Illustration */}
      <div style={{
        flex: 1.2,
        background: "linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "52px 64px",
        borderRight: "1px solid var(--border)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Soft decorative background glows */}
        <div style={{
          position: "absolute",
          top: -100,
          left: -100,
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(37,99,235,0.04) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute",
          bottom: -100,
          right: -100,
          width: 350,
          height: 350,
          background: "radial-gradient(circle, rgba(8,145,178,0.03) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />

        {/* Header Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: "linear-gradient(135deg, var(--accent), var(--accent-teal))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 800,
            color: "#fff",
            boxShadow: "0 4px 12px rgba(37,99,235,0.18)"
          }}>G</div>
          <div>
            <div style={{ color: "var(--text)", fontWeight: 800, fontSize: 16, letterSpacing: "-0.4px" }}>GenomeRisk</div>
            <div style={{ color: "var(--accent-teal)", fontSize: 9, letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 700 }}>Clinical AI</div>
          </div>
        </div>

        {/* Center Illustration + Marketing Copy */}
        <div style={{ maxWidth: 520, margin: "40px 0", animation: "fadeUp 0.6s ease both" }}>
          <div style={{ display: "inline-block", background: "rgba(37,99,235,0.08)", color: "var(--accent)", padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 20 }}>
            🔬 Sequence Intelligence 2026
          </div>
          
          <h1 style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.15, color: "var(--text)", letterSpacing: "-1.8px", marginBottom: 20 }}>
            AI-Powered<br />
            <span style={{ background: "linear-gradient(90deg, var(--accent), var(--accent-teal))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Genomic Risk Prediction
            </span>
          </h1>

          <p style={{ color: "var(--text-2)", lineHeight: 1.6, fontSize: 15, marginBottom: 36 }}>
            Transform raw genomic data into interpretable multi-disease risk insights using machine learning and explainable AI.
          </p>

          {/* DNA Rotating Helix CSS Illustration */}
          <div style={{
            display: "flex",
            gap: 12,
            height: 120,
            alignItems: "center",
            background: "#FFFFFF",
            padding: "24px 32px",
            borderRadius: 16,
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow)",
            width: "fit-content",
            marginBottom: 36
          }}>
            {Array.from({ length: 9 }).map((_, i) => {
              const delay = i * 0.15;
              const color = i % 2 === 0 ? "var(--accent)" : "var(--accent-teal)";
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", width: 12, height: 70 }}>
                  {/* Top dot */}
                  <div className="dna-node" style={{
                    width: 8, height: 8, borderRadius: "50%", background: color,
                    animationDelay: `${delay}s`, position: "absolute", top: 0
                  }} />
                  {/* Connector bar */}
                  <div className="dna-bar" style={{
                    width: 2, height: 50, background: "var(--border)",
                    animationDelay: `${delay}s`, position: "absolute", top: 8
                  }} />
                  {/* Bottom dot */}
                  <div className="dna-node" style={{
                    width: 8, height: 8, borderRadius: "50%", background: color === "var(--accent)" ? "var(--accent-teal)" : "var(--accent)",
                    animationDelay: `${delay + 1.25}s`, position: "absolute", bottom: 0
                  }} />
                </div>
              );
            })}
            <div style={{ marginLeft: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>Sequence Alignment Engine</div>
              <div style={{ fontSize: 10, color: "var(--text-2)", marginTop: 2 }}>Extracting high-impact SNPs...</div>
            </div>
          </div>

          <button onClick={() => document.getElementById("patient-name-input")?.focus()} style={{
            padding: "12px 24px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg, var(--accent), var(--accent-teal))", color: "#fff",
            fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 16px rgba(37,99,235,0.2)",
            transition: "transform 0.2s"
          }}
            onMouseEnter={e => e.target.style.transform = "translateY(-1px)"}
            onMouseLeave={e => e.target.style.transform = "none"}
          >
            Analyze Genome →
          </button>
        </div>

        {/* Footer Metrics */}
        <div style={{ display: "flex", gap: 36, paddingTop: 28, borderTop: "1px solid var(--border)" }}>
          {[
            ["0.951", "Avg. Model AUC"],
            ["< 2s", "Inference Speed"],
            ["XGBoost Engine", "Disease Predictors"]
          ].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px" }}>{v}</div>
              <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel: Login Card Portal */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 80px"
      }}>
        <div style={{ width: "100%", maxWidth: 400, animation: "fadeUp 0.5s ease 0.1s both" }}>
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.8px", marginBottom: 8 }}>
              Clinical Portal
            </h2>
            <p style={{ color: "var(--text-2)", fontSize: 14 }}>Sign in to access genomic interpretations</p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 8 }}>
                Your Name
              </label>
              <input
                id="patient-name-input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Dr. Sarah Jenkins"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)"; }}
                onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 8 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="sarah.j@gmc.org"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)"; }}
                onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 8 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)"; }}
                onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {error && (
              <div style={{
                padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.15)", color: "var(--danger)", fontSize: 13, marginBottom: 20
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "none",
              background: loading ? "var(--border)" : "linear-gradient(135deg, var(--accent), var(--accent-teal))",
              color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "default" : "pointer",
              transition: "all 0.2s", boxShadow: loading ? "none" : "0 4px 16px rgba(37,99,235,0.18)"
            }}
              onMouseEnter={e => { if (!loading) { e.target.style.transform = "translateY(-1px)"; }}}
              onMouseLeave={e => { e.target.style.transform = "none"; }}
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div onClick={handleDemoClick} style={{
            marginTop: 28, padding: "16px 20px", borderRadius: 12, background: "var(--surface)",
            border: "1px solid var(--border)", cursor: "pointer", transition: "0.2s",
            boxShadow: "var(--shadow)"
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 11, color: "var(--accent-teal)", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>Demo Credentials</div>
              <span style={{ fontSize: 11, color: "var(--accent)" }}>Auto-fill ⚡</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 6, lineHeight: 1.6 }}>
              Role: <strong style={{ color: "var(--text)" }}>GMC Geneticist</strong><br />
              Secure local sandbox bypass.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "#FFFFFF",
  color: "var(--text)",
  fontSize: 14,
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s"
};
