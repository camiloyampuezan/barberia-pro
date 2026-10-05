import { useState, useEffect } from "react";
import { getConfig } from "./db";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ user: "", pass: "" });
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState({ user: "admin", pass: "barberia2026" });

  useEffect(() => {
    const loadCredentials = async () => {
      const user = await getConfig("admin_user");
      const pass = await getConfig("admin_pass");
      if (user && pass) setCredentials({ user, pass });
      setLoading(false);
    };
    loadCredentials();
  }, []);

  const handleLogin = () => {
    if (form.user === credentials.user && form.pass === credentials.pass) {
      localStorage.setItem("barberia_auth", "true");
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  if (loading) return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#c8a96e", fontFamily: "Oswald, sans-serif", fontSize: 20, letterSpacing: 4 }}>
      CARGANDO...
    </div>
  );

  return (
    <div style={{ fontFamily: "'Oswald', sans-serif", background: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600&family=Lato:wght@300;400;700&display=swap');`}</style>
      <div style={{ width: "100%", maxWidth: 380, padding: "0 20px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, background: "linear-gradient(135deg, #c8a96e, #e8c97e)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2">
              <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
              <line x1="20" y1="4" x2="8.12" y2="15.88"/>
              <line x1="14.47" y1="14.48" x2="20" y2="20"/>
              <line x1="8.12" y1="8.12" x2="12" y2="12"/>
            </svg>
          </div>
          <div style={{ fontSize: 28, letterSpacing: 6, color: "#f0e6d3" }}>PEREIRA BARBER</div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#555", fontFamily: "Lato", marginTop: 4 }}>PANEL DE ADMINISTRACIÓN</div>
        </div>

        {/* Form */}
        <div style={{ background: "#141414", border: "1px solid #222", borderRadius: 12, padding: 28 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 10, letterSpacing: 2, color: "#666", fontFamily: "Lato", display: "block", marginBottom: 8 }}>USUARIO</label>
            <input
              type="text"
              value={form.user}
              onChange={e => setForm(p => ({ ...p, user: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ background: "#1a1a1a", border: `1px solid ${error ? "#ef4444" : "#2a2a2a"}`, borderRadius: 8, padding: "12px 16px", color: "#f0e6d3", fontFamily: "Lato", fontSize: 14, width: "100%", outline: "none" }}
              placeholder="Usuario"
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 10, letterSpacing: 2, color: "#666", fontFamily: "Lato", display: "block", marginBottom: 8 }}>CONTRASEÑA</label>
            <input
              type="password"
              value={form.pass}
              onChange={e => setForm(p => ({ ...p, pass: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ background: "#1a1a1a", border: `1px solid ${error ? "#ef4444" : "#2a2a2a"}`, borderRadius: 8, padding: "12px 16px", color: "#f0e6d3", fontFamily: "Lato", fontSize: 14, width: "100%", outline: "none" }}
              placeholder="••••••••"
            />
          </div>
          {error && (
            <div style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#ef4444", fontFamily: "Lato", textAlign: "center" }}>
              Usuario o contraseña incorrectos
            </div>
          )}
          <button onClick={handleLogin} style={{ background: "linear-gradient(135deg, #c8a96e, #e8c97e)", color: "#0a0a0a", border: "none", borderRadius: 8, padding: "14px", width: "100%", fontFamily: "Oswald", fontSize: 14, letterSpacing: 2, cursor: "pointer", fontWeight: 600 }}>
            INGRESAR
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "#333", fontFamily: "Lato", letterSpacing: 1 }}>
          ¿Eres cliente? <a href="/" style={{ color: "#c8a96e", textDecoration: "none" }}>Agenda tu cita aquí</a>
        </div>
      </div>
    </div>
  );
}