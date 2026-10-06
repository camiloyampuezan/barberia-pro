import { useState, useEffect, useMemo } from "react";
import { supabase } from "./supabase";

const hoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const ESTADO = {
  pending:   { txt: "Pendiente",  color: "#f59e0b" },
  confirmed: { txt: "Confirmada", color: "#22c55e" },
  cancelled: { txt: "Cancelada",  color: "#ef4444" },
};
const S = {
  page: { fontFamily: "Lato, sans-serif", background: "#0a0a0a", minHeight: "100vh", color: "#f0e6d3", padding: 20 },
  card: { background: "#141414", border: "1px solid #222", borderRadius: 12, padding: 18, marginBottom: 12 },
  input: { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "12px 14px", color: "#f0e6d3", width: "100%", fontSize: 14, outline: "none", marginBottom: 12 },
  btn: { background: "linear-gradient(135deg,#c8a96e,#e8c97e)", color: "#0a0a0a", border: "none", borderRadius: 8, padding: "12px 18px", fontFamily: "Oswald, sans-serif", letterSpacing: 2, fontWeight: 600, cursor: "pointer" },
  ghost: { background: "none", color: "#c8a96e", border: "1px solid #c8a96e55", borderRadius: 8, padding: "8px 14px", cursor: "pointer" },
};

function Footer() {
  return (
    <div style={{ background: "#000000", borderTop: "1px solid #2a2a2a", padding: "16px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 9, letterSpacing: 3, color: "#ffffff", fontFamily: "Lato, sans-serif" }}>
        © 2026 PEREIRA BARBER · DESARROLLADO POR YAMPZ SOFTWARE
      </div>
    </div>
  );
}

function LoginBarbero({ onLogin }) {
  const [f, setF] = useState({ usuario: "", clave: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const entrar = async () => {
    if (!f.usuario || !f.clave || loading) return;
    setLoading(true); setErr("");
    const { data, error } = await supabase.rpc("login_barbero", { p_usuario: f.usuario, p_clave: f.clave });
    setLoading(false);
    if (error || !data?.length) return setErr("Usuario o contraseña incorrectos");
    const sesion = { id: data[0].barber_id, name: data[0].barber_name };
    localStorage.setItem("barbero_sesion", JSON.stringify(sesion));
    onLogin(sesion);
  };

  return (
    <div style={{ ...S.page, padding: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={{ textAlign: "center", marginBottom: 24, fontFamily: "Oswald", fontSize: 26, letterSpacing: 5 }}>PANEL DEL BARBERO</div>
          <div style={S.card}>
            <input style={S.input} placeholder="Usuario" value={f.usuario} onChange={e => setF(p => ({ ...p, usuario: e.target.value }))} />
            <input style={S.input} type="password" placeholder="Contraseña" value={f.clave}
              onChange={e => setF(p => ({ ...p, clave: e.target.value }))} onKeyDown={e => e.key === "Enter" && entrar()} />
            {err && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{err}</div>}
            <button style={{ ...S.btn, width: "100%" }} onClick={entrar}>{loading ? "ENTRANDO..." : "ENTRAR"}</button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function BarberoPanel() {
  const [sesion, setSesion] = useState(() => {
    try { return JSON.parse(localStorage.getItem("barbero_sesion")); } catch { return null; }
  });
  const [citas, setCitas] = useState([]);
  const [fecha, setFecha] = useState(hoy());
  const [tab, setTab] = useState("agenda");

  useEffect(() => {
    if (!sesion) return;
    supabase.from("citas")
      .select("id, client_name, client_phone, service, date, time, status, notes")
      .eq("barber_id", sesion.id).order("date", { ascending: false }).order("time")
      .then(({ data, error }) => { if (error) console.error(error); setCitas(data || []); });
  }, [sesion]);

  const delDia = useMemo(() => citas.filter(c => c.date === fecha).sort((a, b) => a.time.localeCompare(b.time)), [citas, fecha]);

  // Reporte diario: se calcula desde las citas, por eso el historial se conserva solo
  const reporte = useMemo(() => {
    const m = {};
    citas.forEach(c => {
      const d = (m[c.date] ||= { fecha: c.date, total: 0, confirmed: 0, pending: 0, cancelled: 0 });
      d.total++; d[c.status] = (d[c.status] || 0) + 1;
    });
    return Object.values(m).sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [citas]);

  const salir = () => { localStorage.removeItem("barbero_sesion"); setSesion(null); setCitas([]); };
  if (!sesion) return <LoginBarbero onLogin={setSesion} />;

  const tabBtn = (k, t) => (
    <button onClick={() => setTab(k)} style={{ ...S.ghost, ...(tab === k ? { background: "#c8a96e", color: "#0a0a0a" } : {}) }}>{t}</button>
  );

  return (
    <div style={{ ...S.page, padding: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, padding: 20 }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: "Oswald", fontSize: 22, letterSpacing: 3 }}>{sesion.name.toUpperCase()}</div>
              <div style={{ fontSize: 12, color: "#777" }}>Panel del barbero</div>
            </div>
            <button style={S.ghost} onClick={salir}>Salir</button>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>{tabBtn("agenda", "Mi agenda")}{tabBtn("reportes", "Reportes")}</div>

          {tab === "agenda" && (<>
            <input type="date" style={S.input} value={fecha} onChange={e => setFecha(e.target.value)} />
            <div style={{ fontSize: 13, color: "#c8a96e", marginBottom: 10 }}>
              {delDia.length} cita{delDia.length !== 1 && "s"} {fecha === hoy() ? "para hoy" : `el ${fecha}`}
            </div>
            {delDia.length === 0 && <div style={{ ...S.card, color: "#777", textAlign: "center" }}>No tienes clientes asignados este día.</div>}
            {delDia.map(c => {
              const e = ESTADO[c.status] || { txt: c.status, color: "#888" };
              return (
                <div key={c.id} style={{ ...S.card, opacity: c.status === "cancelled" ? 0.5 : 1, display: "flex", gap: 14 }}>
                  <div style={{ fontFamily: "Oswald", fontSize: 20, color: "#c8a96e", minWidth: 60 }}>{c.time?.slice(0, 5)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15 }}>{c.client_name}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{c.service}{c.client_phone ? ` · ${c.client_phone}` : ""}</div>
                    {c.notes && <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>📝 {c.notes}</div>}
                  </div>
                  <div style={{ fontSize: 11, color: e.color, alignSelf: "flex-start" }}>{e.txt}</div>
                </div>
              );
            })}
          </>)}

          {tab === "reportes" && (
            <div style={{ ...S.card, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ color: "#c8a96e", textAlign: "left" }}>
                  <th style={{ padding: 8 }}>Fecha</th><th>Citas</th><th>Confirmadas</th><th>Pendientes</th><th>Canceladas</th>
                </tr></thead>
                <tbody>
                  {reporte.map(r => (
                    <tr key={r.fecha} style={{ borderTop: "1px solid #222" }}>
                      <td style={{ padding: 8 }}>{r.fecha}</td><td>{r.total}</td>
                      <td>{r.confirmed}</td><td>{r.pending}</td><td>{r.cancelled}</td>
                    </tr>
                  ))}
                  {reporte.length === 0 && <tr><td colSpan={5} style={{ padding: 16, color: "#777", textAlign: "center" }}>Aún no hay citas registradas.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
