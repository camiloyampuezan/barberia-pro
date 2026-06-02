import { useState, useEffect, useRef } from "react";
import { getCitas, addCita, updateCita, deleteCita, getClientes, addCliente, getInventario, updateInventario, addInventario, getVentas, addVenta, getPersonal, addPersonal } from './db';

// ============================================================
// DATA & STATE
// ============================================================
const INITIAL_STATE = {
  clients: [
    { id: 1, name: "Carlos Martínez", phone: "311-234-5678", email: "carlos@mail.com", visits: 8, points: 240, lastVisit: "2026-05-15", birthday: "1990-03-12", notes: "Prefiere corte clásico" },
    { id: 2, name: "Andrés López", phone: "315-876-5432", email: "andres@mail.com", visits: 3, points: 90, lastVisit: "2026-05-18", birthday: "1995-07-22", notes: "Barba larga" },
    { id: 3, name: "Diego Ramírez", phone: "318-555-1234", email: "diego@mail.com", visits: 12, points: 360, lastVisit: "2026-05-10", birthday: "1988-11-05", notes: "Cliente VIP" },
  ],
  appointments: [
    { id: 1, clientId: 1, clientName: "Carlos Martínez", barberId: 1, service: "Corte + Barba", date: "2026-05-22", time: "10:00", duration: 45, price: 35000, status: "confirmed" },
    { id: 2, clientId: 2, clientName: "Andrés López", barberId: 2, service: "Corte Clásico", date: "2026-05-22", time: "11:00", duration: 30, price: 20000, status: "pending" },
    { id: 3, clientId: 3, clientName: "Diego Ramírez", barberId: 1, service: "Arreglo de Barba", date: "2026-05-22", time: "14:00", duration: 30, price: 18000, status: "confirmed" },
    { id: 4, clientId: 1, clientName: "Carlos Martínez", barberId: 2, service: "Corte Clásico", date: "2026-05-23", time: "09:00", duration: 30, price: 20000, status: "pending" },
  ],
  inventory: [
    { id: 1, name: "Aceite para Barba", category: "Cuidado", stock: 8, minStock: 5, price: 25000, cost: 12000, unit: "und" },
    { id: 2, name: "Cera Moldeadora", category: "Estilizado", stock: 3, minStock: 5, price: 18000, cost: 8000, unit: "und" },
    { id: 3, name: "Navajas Gillette", category: "Herramientas", stock: 45, minStock: 20, price: 1500, cost: 700, unit: "und" },
    { id: 4, name: "Shampoo Profesional", category: "Cuidado", stock: 2, minStock: 4, price: 32000, cost: 15000, unit: "und" },
    { id: 5, name: "Gel Fijador", category: "Estilizado", stock: 12, minStock: 6, price: 15000, cost: 6000, unit: "und" },
    { id: 6, name: "Toallas Desechables", category: "Consumibles", stock: 200, minStock: 50, price: 500, cost: 200, unit: "und" },
  ],
  staff: [
    { id: 1, name: "Miguel Ángel Torres", role: "Barbero Senior", schedule: "Lun-Sab", startTime: "09:00", endTime: "18:00", commission: 40, phone: "310-111-2222", sales: 850000 },
    { id: 2, name: "Juan Pablo Herrera", role: "Barbero", schedule: "Mar-Dom", startTime: "10:00", endTime: "19:00", commission: 35, phone: "312-333-4444", sales: 620000 },
  ],
  sales: [
    { id: 1, date: "2026-05-22", clientName: "Carlos Martínez", services: ["Corte + Barba"], products: [], total: 35000, payment: "efectivo", barberId: 1 },
    { id: 2, date: "2026-05-21", clientName: "Diego Ramírez", services: ["Corte Clásico"], products: ["Aceite para Barba"], total: 55000, payment: "tarjeta", barberId: 1 },
    { id: 3, date: "2026-05-20", clientName: "Andrés López", services: ["Arreglo de Barba"], products: [], total: 18000, payment: "efectivo", barberId: 2 },
  ],
  services: [
    { id: 1, name: "Corte Clásico", price: 20000, duration: 30 },
    { id: 2, name: "Corte + Barba", price: 35000, duration: 45 },
    { id: 3, name: "Arreglo de Barba", price: 18000, duration: 30 },
    { id: 4, name: "Afeitado Tradicional", price: 22000, duration: 40 },
    { id: 5, name: "Corte Niños", price: 15000, duration: 25 },
    { id: 6, name: "Keratina", price: 80000, duration: 90 },
  ]
};

// ============================================================
// ICONS
// ============================================================
const Icon = ({ name, size = 18 }) => {
  const icons = {
    calendar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    package: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    pos: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    staff: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    scissors: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    alert: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><triangle points="10.29 3.86 1.82 18 22.18 18"/><path d="M10.29 3.86L1.82 18 22.18 18 10.29 3.86z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    star: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    cash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    chart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    clock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    gift: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
  };
  return icons[name] || null;
};

// ============================================================
// MAIN APP
// ============================================================
export default function BarberiaApp({ onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [data, setData] = useState(INITIAL_STATE);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      const [citas, clientes, inventario, ventas, personal] = await Promise.all([
        getCitas(),
        getClientes(),
        getInventario(),
        getVentas(),
        getPersonal(),
      ]);
      setData(d => ({
        ...d,
        appointments: citas.length > 0 ? citas.map(c => ({ ...c, id: c.id, clientName: c.client_name, barberId: c.barber_id, status: c.status || 'pending' })) : d.appointments,
        clients: clientes.length > 0 ? clientes.map(c => ({ ...c, lastVisit: c.last_visit })) : d.clients,
        inventory: inventario.length > 0 ? inventario.map(i => ({ ...i, minStock: i.min_stock })) : d.inventory,
        sales: ventas.length > 0 ? ventas : d.sales,
        staff: personal.length > 0 ? personal.map(p => ({ ...p, startTime: p.start_time, endTime: p.end_time })) : d.staff,
      }));
      setLoading(false);
    };
    cargarDatos();
  }, []);

  if (loading) return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c8a96e', fontFamily: 'Oswald, sans-serif', fontSize: 20, letterSpacing: 4 }}>
      CARGANDO...
    </div>
  );

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const today = "2026-05-22";
  const todayApps = data.appointments.filter(a => a.date === today);
  const lowStock = data.inventory.filter(i => i.stock <= i.minStock);
  const todayRevenue = data.sales.filter(s => s.date === today).reduce((sum, s) => sum + s.total, 0);
  const monthRevenue = data.sales.reduce((sum, s) => sum + s.total, 0);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "chart" },
    { id: "agenda", label: "Agenda", icon: "calendar" },
    { id: "clientes", label: "Clientes", icon: "users" },
    { id: "pos", label: "Caja POS", icon: "pos" },
    { id: "inventario", label: "Inventario", icon: "package" },
    { id: "personal", label: "Personal", icon: "staff" },
  ];

  return (
    <div style={{ fontFamily: "'Bebas Neue', 'Oswald', sans-serif", background: "#0a0a0a", minHeight: "100vh", color: "#f0e6d3" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@300;400;500;600&family=Lato:wght@300;400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #1a1a1a; } ::-webkit-scrollbar-thumb { background: #c8a96e; border-radius: 2px; }
        .nav-btn { background: none; border: none; cursor: pointer; padding: 12px 16px; border-radius: 8px; color: #888; transition: all .2s; display: flex; flex-direction: column; align-items: center; gap: 4px; font-family: 'Oswald', sans-serif; font-size: 10px; letter-spacing: 1px; }
        .nav-btn:hover { background: rgba(200,169,110,0.1); color: #c8a96e; }
        .nav-btn.active { background: rgba(200,169,110,0.15); color: #c8a96e; border-bottom: 2px solid #c8a96e; }
        .card { background: #141414; border: 1px solid #222; border-radius: 12px; padding: 20px; }
        .card-gold { background: linear-gradient(135deg, #c8a96e, #e8c97e); color: #0a0a0a; border-radius: 12px; padding: 20px; }
        .btn { padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; font-family: 'Oswald', sans-serif; letter-spacing: 1px; font-size: 13px; transition: all .2s; }
        .btn-gold { background: linear-gradient(135deg, #c8a96e, #e8c97e); color: #0a0a0a; font-weight: 600; }
        .btn-gold:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(200,169,110,0.4); }
        .btn-outline { background: none; border: 1px solid #333; color: #888; }
        .btn-outline:hover { border-color: #c8a96e; color: #c8a96e; }
        .btn-danger { background: rgba(220,38,38,0.15); border: 1px solid rgba(220,38,38,0.3); color: #ef4444; }
        .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-family: 'Lato', sans-serif; font-weight: 700; letter-spacing: 0.5px; }
        .badge-green { background: rgba(34,197,94,0.15); color: #22c55e; }
        .badge-yellow { background: rgba(234,179,8,0.15); color: #eab308; }
        .badge-red { background: rgba(220,38,38,0.15); color: #ef4444; }
        .badge-blue { background: rgba(59,130,246,0.15); color: #60a5fa; }
        .input { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 10px 14px; color: #f0e6d3; font-family: 'Lato', sans-serif; font-size: 13px; width: 100%; transition: border .2s; outline: none; }
        .input:focus { border-color: #c8a96e; }
        .input option { background: #1a1a1a; }
        .label { font-size: 10px; letter-spacing: 1.5px; color: #666; margin-bottom: 6px; display: block; font-family: 'Oswald', sans-serif; }
        .table-row { display: grid; padding: 12px 16px; border-bottom: 1px solid #1a1a1a; align-items: center; transition: background .15s; font-family: 'Lato', sans-serif; font-size: 13px; }
        .table-row:hover { background: rgba(255,255,255,0.02); }
        .section-title { font-size: 28px; letter-spacing: 3px; color: #f0e6d3; margin-bottom: 4px; }
        .section-sub { font-size: 12px; color: #666; font-family: 'Lato', sans-serif; letter-spacing: 1px; margin-bottom: 24px; }
        .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
        .modal { background: #141414; border: 1px solid #2a2a2a; border-radius: 16px; padding: 28px; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; }
        .stat-num { font-size: 36px; letter-spacing: 2px; color: #c8a96e; line-height: 1; }
        .stat-label { font-size: 10px; letter-spacing: 2px; color: #555; margin-top: 4px; font-family: 'Lato', sans-serif; }
        .timeline-slot { padding: 10px 14px; border-left: 3px solid #222; margin-left: 12px; margin-bottom: 4px; position: relative; }
        .timeline-slot::before { content: ''; position: absolute; left: -7px; top: 50%; transform: translateY(-50%); width: 11px; height: 11px; border-radius: 50%; background: #222; border: 2px solid #444; }
        .timeline-slot.confirmed::before { background: #22c55e; border-color: #22c55e; }
        .timeline-slot.pending::before { background: #eab308; border-color: #eab308; }
        .progress-bar { height: 4px; background: #1a1a1a; border-radius: 2px; overflow: hidden; margin-top: 8px; }
        .progress-fill { height: 100%; border-radius: 2px; transition: width .5s; }
        .gold-line { width: 60px; height: 3px; background: linear-gradient(90deg, #c8a96e, #e8c97e); border-radius: 2px; margin-bottom: 20px; }
        .pos-key { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 14px; cursor: pointer; text-align: center; font-family: 'Oswald', sans-serif; font-size: 14px; letter-spacing: 1px; color: #888; transition: all .2s; }
        .pos-key:hover { border-color: #c8a96e; color: #c8a96e; background: rgba(200,169,110,0.05); }
        .pos-key.active { border-color: #c8a96e; color: #c8a96e; background: rgba(200,169,110,0.1); }
        .toast { position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); background: #1a1a1a; border: 1px solid #333; border-radius: 10px; padding: 12px 24px; font-family: 'Lato', sans-serif; font-size: 13px; z-index: 999; display: flex; align-items: center; gap: 10px; animation: slideUp .3s ease; }
        .toast.success { border-color: rgba(34,197,94,0.4); color: #22c55e; }
        .toast.error { border-color: rgba(220,38,38,0.4); color: #ef4444; }
        @keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      `}</style>

      {/* HEADER */}
      <div style={{ background: "#0d0d0d", borderBottom: "1px solid #1a1a1a", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #c8a96e, #e8c97e)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="scissors" size={18} />
          </div>
          <div>
            <div style={{ fontSize: 20, letterSpacing: 4, color: "#f0e6d3" }}>BARBERÍA PRO</div>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#555", fontFamily: "Lato, sans-serif" }}>SISTEMA DE GESTIÓN</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {lowStock.length > 0 && (
            <div style={{ background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 20, padding: "4px 12px", fontSize: 11, color: "#ef4444", fontFamily: "Lato, sans-serif", cursor: "pointer" }} onClick={() => setActiveTab("inventario")}>
              ⚠ {lowStock.length} stock bajo
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
  <div style={{ fontSize: 11, letterSpacing: 2, color: "#555", fontFamily: "Lato, sans-serif" }}>22 MAY 2026</div>
  <button onClick={onLogout} style={{ background: "none", border: "1px solid #333", borderRadius: 6, padding: "6px 12px", color: "#666", fontFamily: "Oswald, sans-serif", fontSize: 11, letterSpacing: 1, cursor: "pointer" }}>SALIR</button>
</div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ padding: "24px 20px", paddingBottom: 100, maxWidth: 900, margin: "0 auto" }}>
        {activeTab === "dashboard" && <Dashboard data={data} todayApps={todayApps} todayRevenue={todayRevenue} monthRevenue={monthRevenue} lowStock={lowStock} setActiveTab={setActiveTab} />}
        {activeTab === "agenda" && <Agenda data={data} setData={setData} showToast={showToast} />}
        {activeTab === "clientes" && <Clientes data={data} setData={setData} showToast={showToast} />}
        {activeTab === "pos" && <POS data={data} setData={setData} showToast={showToast} />}
        {activeTab === "inventario" && <Inventario data={data} setData={setData} showToast={showToast} />}
        {activeTab === "personal" && <Personal data={data} setData={setData} showToast={showToast} />}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0d0d0d", borderTop: "1px solid #1a1a1a", display: "flex", justifyContent: "space-around", padding: "4px 0", zIndex: 50 }}>
        {tabs.map(t => (
          <button key={t.id} className={`nav-btn ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
            <Icon name={t.icon} size={20} />
            {t.label}
          </button>
        ))}
      </div>

      {toast && <div className={`toast ${toast.type}`}><Icon name={toast.type === "success" ? "check" : "alert"} size={14} />{toast.msg}</div>}
    </div>
  );
}

// ============================================================
// DASHBOARD
// ============================================================
function Dashboard({ data, todayApps, todayRevenue, monthRevenue, lowStock, setActiveTab }) {
  const vipClients = data.clients.filter(c => c.visits >= 10);
  return (
    <div>
      <div className="section-title">DASHBOARD</div>
      <div className="gold-line" />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "CITAS HOY", val: todayApps.length, sub: "citas programadas" },
          { label: "INGRESOS HOY", val: `$${(todayRevenue/1000).toFixed(0)}K`, sub: "pesos colombianos" },
          { label: "INGRESOS MES", val: `$${(monthRevenue/1000).toFixed(0)}K`, sub: "total acumulado" },
          { label: "CLIENTES VIP", val: vipClients.length, sub: "10+ visitas" },
        ].map(s => (
          <div key={s.label} className="card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-num">{s.val}</div>
            <div style={{ fontSize: 10, color: "#444", fontFamily: "Lato", marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Today's timeline */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, letterSpacing: 2, color: "#888", marginBottom: 16 }}>AGENDA DE HOY</div>
        {todayApps.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#444", fontFamily: "Lato", fontSize: 13 }}>No hay citas para hoy</div>
        ) : (
          todayApps.sort((a,b) => a.time.localeCompare(b.time)).map(app => (
            <div key={app.id} className={`timeline-slot ${app.status}`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontFamily: "Lato", color: "#f0e6d3", fontWeight: 700 }}>{app.clientName}</div>
                  <div style={{ fontSize: 11, color: "#666", fontFamily: "Lato" }}>{app.service} · {app.duration}min</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, color: "#c8a96e" }}>{app.time}</div>
                  <div style={{ fontSize: 11, color: "#555", fontFamily: "Lato" }}>${app.price.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Alerts */}
      {lowStock.length > 0 && (
        <div className="card" style={{ borderColor: "rgba(220,38,38,0.3)" }}>
          <div style={{ fontSize: 14, letterSpacing: 2, color: "#ef4444", marginBottom: 12 }}>⚠ ALERTAS DE INVENTARIO</div>
          {lowStock.map(item => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a1a1a", fontFamily: "Lato", fontSize: 12 }}>
              <span style={{ color: "#888" }}>{item.name}</span>
              <span style={{ color: "#ef4444" }}>Stock: {item.stock} / Mín: {item.minStock}</span>
            </div>
          ))}
          <button className="btn btn-outline" style={{ marginTop: 12, fontSize: 11 }} onClick={() => setActiveTab("inventario")}>VER INVENTARIO</button>
        </div>
      )}

      {/* Quick services */}
      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ fontSize: 14, letterSpacing: 2, color: "#888", marginBottom: 16 }}>SERVICIOS POPULARES</div>
        {data.services.slice(0, 4).map(s => (
          <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1a1a1a", fontFamily: "Lato", fontSize: 13 }}>
            <span style={{ color: "#d0c0a0" }}>{s.name}</span>
            <div style={{ display: "flex", gap: 16 }}>
              <span style={{ color: "#555" }}><Icon name="clock" size={12} /> {s.duration}min</span>
              <span style={{ color: "#c8a96e", fontWeight: 700 }}>${s.price.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// AGENDA
// ============================================================
function Agenda({ data, setData, showToast }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState("2026-05-22");
  const [form, setForm] = useState({ clientName: "", barberId: "1", service: "", date: "2026-05-22", time: "10:00", price: "" });

  const filtered = data.appointments.filter(a => a.date === selectedDate).sort((a,b) => a.time.localeCompare(b.time));


  const addAppointment = async () => {
    if (!form.clientName || !form.service || !form.time) return showToast("Completa todos los campos", "error");
    const svc = data.services.find(s => s.name === form.service);
    const barber = data.staff.find(s => s.id === parseInt(form.barberId));
    const nueva = await addCita({
      client_name: form.clientName,
      barber_id: parseInt(form.barberId),
      barber_name: barber?.name,
      service: form.service,
      date: form.date,
      time: form.time,
      duration: svc?.duration || 30,
      price: svc?.price || parseInt(form.price),
      status: "pending",
    });
    if (nueva) {
      setData(d => ({ ...d, appointments: [...d.appointments, { ...nueva, clientName: nueva.client_name, barberId: nueva.barber_id }] }));
      setShowForm(false);
      showToast("Cita agendada correctamente");
      setForm({ clientName: "", barberId: "1", service: "", date: selectedDate, time: "10:00", price: "" });
    } else {
      showToast("Error al agendar cita", "error");
    }
  };

  const updateStatus = async (id, status) => {
    await updateCita(id, { status });
    setData(d => ({ ...d, appointments: d.appointments.map(a => a.id === id ? { ...a, status } : a) }));
    showToast(status === "confirmed" ? "Cita confirmada" : "Cita cancelada");
  };

  const deleteApp = async (id) => {
    await deleteCita(id);
    setData(d => ({ ...d, appointments: d.appointments.filter(a => a.id !== id) }));
    showToast("Cita eliminada");
  };

  const statusColors = { confirmed: "#22c55e", pending: "#eab308", cancelled: "#ef4444" };
  const statusLabels = { confirmed: "CONFIRMADA", pending: "PENDIENTE", cancelled: "CANCELADA" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div className="section-title">AGENDA</div>
        <button className="btn btn-gold" onClick={() => setShowForm(true)}><Icon name="plus" size={14} /> NUEVA CITA</button>
      </div>
      <div className="gold-line" />

      <div style={{ marginBottom: 20 }}>
        <label className="label">SELECCIONAR FECHA</label>
        <input type="date" className="input" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ maxWidth: 200 }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: "#555", fontFamily: "Lato" }}>{filtered.length} CITAS ENCONTRADAS</div>
        <div style={{ display: "flex", gap: 8 }}>
          <span className="badge badge-green">{filtered.filter(a => a.status === "confirmed").length} Conf.</span>
          <span className="badge badge-yellow">{filtered.filter(a => a.status === "pending").length} Pend.</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "#444", fontFamily: "Lato" }}>
          <Icon name="calendar" size={40} /><br /><br />No hay citas para esta fecha
        </div>
      ) : (
        filtered.map(app => {
          const barber = data.staff.find(s => s.id === app.barberId);
          return (
            <div key={app.id} className="card" style={{ marginBottom: 10, borderLeft: `3px solid ${statusColors[app.status] || "#444"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 16, letterSpacing: 1, color: "#f0e6d3" }}>{app.clientName}</div>
                  <div style={{ fontSize: 12, color: "#888", fontFamily: "Lato", marginTop: 4 }}>{app.service} · {app.duration}min · {barber?.name || "Barbero"}</div>
                  <div style={{ fontSize: 12, color: "#c8a96e", fontFamily: "Lato", fontWeight: 700, marginTop: 4 }}>${app.price?.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 22, color: "#c8a96e", letterSpacing: 1 }}>{app.time}</div>
                  <span className={`badge ${app.status === "confirmed" ? "badge-green" : app.status === "pending" ? "badge-yellow" : "badge-red"}`}>{statusLabels[app.status]}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                {app.status === "pending" && <button className="btn btn-gold" style={{ padding: "6px 14px", fontSize: 11 }} onClick={() => updateStatus(app.id, "confirmed")}>CONFIRMAR</button>}
                {app.status !== "cancelled" && <button className="btn btn-outline" style={{ padding: "6px 14px", fontSize: 11 }} onClick={() => updateStatus(app.id, "cancelled")}>CANCELAR</button>}
                <button className="btn btn-danger" style={{ padding: "6px 14px", fontSize: 11 }} onClick={() => deleteApp(app.id)}>ELIMINAR</button>
              </div>
            </div>
          );
        })
      )}

      {showForm && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 22, letterSpacing: 2 }}>NUEVA CITA</div>
              <button style={{ background: "none", border: "none", color: "#888", cursor: "pointer" }} onClick={() => setShowForm(false)}><Icon name="x" /></button>
            </div>
            {[
              { label: "CLIENTE", key: "clientName", type: "text", placeholder: "Nombre del cliente" },
              { label: "FECHA", key: "date", type: "date" },
              { label: "HORA", key: "time", type: "time" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label className="label">{f.label}</label>
                <input type={f.type} className="input" value={form[f.key]} placeholder={f.placeholder} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label className="label">SERVICIO</label>
              <select className="input" value={form.service} onChange={e => setForm(p => ({ ...p, service: e.target.value }))}>
                <option value="">Seleccionar servicio...</option>
                {data.services.map(s => <option key={s.id} value={s.name}>{s.name} — ${s.price.toLocaleString()}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="label">BARBERO</label>
              <select className="input" value={form.barberId} onChange={e => setForm(p => ({ ...p, barberId: e.target.value }))}>
                {data.staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <button className="btn btn-gold" style={{ width: "100%" }} onClick={addAppointment}>AGENDAR CITA</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// CLIENTES
// ============================================================
function Clientes({ data, setData, showToast }) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", birthday: "", notes: "" });

  const filtered = data.clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const addClient = async () => {
    if (!form.name || !form.phone) return showToast("Nombre y teléfono requeridos", "error");
    const nuevo = await addCliente({ ...form, visits: 0, points: 0, last_visit: "-" });
    if (nuevo) {
      setData(d => ({ ...d, clients: [...d.clients, { ...nuevo, lastVisit: nuevo.last_visit }] }));
      setShowForm(false);
      setForm({ name: "", phone: "", email: "", birthday: "", notes: "" });
      showToast("Cliente registrado");
    } else {
      showToast("Error al registrar cliente", "error");
    }
  };

  const getLevel = (points) => {
    if (points >= 300) return { label: "VIP", color: "#c8a96e" };
    if (points >= 150) return { label: "PLATA", color: "#94a3b8" };
    return { label: "BRONCE", color: "#b87333" };
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div className="section-title">CLIENTES</div>
        <button className="btn btn-gold" onClick={() => setShowForm(true)}><Icon name="plus" size={14} /> NUEVO</button>
      </div>
      <div className="gold-line" />

      <div style={{ position: "relative", marginBottom: 16 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#555" }}><Icon name="search" size={16} /></span>
        <input className="input" style={{ paddingLeft: 38 }} placeholder="Buscar por nombre o teléfono..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "TOTAL", val: data.clients.length },
          { label: "VIP", val: data.clients.filter(c => c.points >= 300).length },
          { label: "ACTIVOS", val: data.clients.filter(c => c.visits > 0).length },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: "center", padding: 14 }}>
            <div className="stat-num" style={{ fontSize: 28 }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {filtered.map(c => {
        const level = getLevel(c.points);
        return (
          <div key={c.id} className="card" style={{ marginBottom: 10, cursor: "pointer" }} onClick={() => setSelected(c)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${level.color}33, ${level.color}22)`, border: `2px solid ${level.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, letterSpacing: 1, color: level.color, flexShrink: 0 }}>
                  {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: 15, letterSpacing: 1, color: "#f0e6d3" }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "#666", fontFamily: "Lato", marginTop: 2 }}>{c.phone}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 10, color: level.color, letterSpacing: 2, padding: "3px 8px", border: `1px solid ${level.color}44`, borderRadius: 20 }}>{level.label}</span>
                <div style={{ fontSize: 11, color: "#555", fontFamily: "Lato", marginTop: 4 }}>{c.visits} visitas · {c.points} pts</div>
              </div>
            </div>
            {c.visits >= 10 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 10, color: "#555", fontFamily: "Lato", letterSpacing: 1 }}>FIDELIZACIÓN</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min((c.points / 500) * 100, 100)}%`, background: `linear-gradient(90deg, ${level.color}, ${level.color}aa)` }} />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Client detail modal */}
      {selected && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontSize: 20, letterSpacing: 2 }}>PERFIL CLIENTE</div>
              <button style={{ background: "none", border: "none", color: "#888", cursor: "pointer" }} onClick={() => setSelected(null)}><Icon name="x" /></button>
            </div>
            {(() => {
              const level = getLevel(selected.points);
              const clientApps = data.appointments.filter(a => a.clientId === selected.id || a.clientName === selected.name);
              return (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, padding: "16px", background: "#0a0a0a", borderRadius: 10 }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${level.color}, ${level.color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, letterSpacing: 1, color: "#0a0a0a", fontWeight: 900 }}>
                      {selected.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontSize: 18, letterSpacing: 2 }}>{selected.name}</div>
                      <div style={{ fontSize: 11, color: level.color, letterSpacing: 3, marginTop: 2 }}>{level.label}</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                    {[
                      { label: "TELÉFONO", val: selected.phone },
                      { label: "EMAIL", val: selected.email || "—" },
                      { label: "VISITAS", val: selected.visits },
                      { label: "PUNTOS", val: selected.points },
                      { label: "ÚLTIMA VISITA", val: selected.lastVisit },
                      { label: "CUMPLEAÑOS", val: selected.birthday || "—" },
                    ].map(f => (
                      <div key={f.label} style={{ background: "#0a0a0a", borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: 9, letterSpacing: 2, color: "#555", fontFamily: "Lato" }}>{f.label}</div>
                        <div style={{ fontSize: 13, color: "#d0c0a0", fontFamily: "Lato", marginTop: 4 }}>{f.val}</div>
                      </div>
                    ))}
                  </div>
                  {selected.notes && (
                    <div style={{ background: "rgba(200,169,110,0.08)", border: "1px solid rgba(200,169,110,0.2)", borderRadius: 8, padding: 12, marginBottom: 16 }}>
                      <div style={{ fontSize: 9, letterSpacing: 2, color: "#c8a96e", fontFamily: "Lato" }}>NOTAS</div>
                      <div style={{ fontSize: 12, color: "#888", fontFamily: "Lato", marginTop: 4 }}>{selected.notes}</div>
                    </div>
                  )}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, letterSpacing: 2, color: "#555", marginBottom: 8 }}>PROGRESO DE PUNTOS</div>
                    <div className="progress-bar" style={{ height: 8 }}>
                      <div className="progress-fill" style={{ width: `${Math.min((selected.points / 500) * 100, 100)}%`, background: `linear-gradient(90deg, ${level.color}, ${level.color}aa)` }} />
                    </div>
                    <div style={{ fontSize: 10, color: "#555", fontFamily: "Lato", marginTop: 4 }}>{selected.points} / 500 pts para nivel máximo</div>
                  </div>
                  {clientApps.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, letterSpacing: 2, color: "#555", marginBottom: 8 }}>CITAS RECIENTES</div>
                      {clientApps.slice(0, 3).map(a => (
                        <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a1a1a", fontFamily: "Lato", fontSize: 12 }}>
                          <span style={{ color: "#888" }}>{a.service}</span>
                          <span style={{ color: "#555" }}>{a.date} {a.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontSize: 22, letterSpacing: 2 }}>NUEVO CLIENTE</div>
              <button style={{ background: "none", border: "none", color: "#888", cursor: "pointer" }} onClick={() => setShowForm(false)}><Icon name="x" /></button>
            </div>
            {[
              { label: "NOMBRE COMPLETO *", key: "name", type: "text" },
              { label: "TELÉFONO *", key: "phone", type: "tel" },
              { label: "EMAIL", key: "email", type: "email" },
              { label: "CUMPLEAÑOS", key: "birthday", type: "date" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label className="label">{f.label}</label>
                <input type={f.type} className="input" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label className="label">NOTAS</label>
              <textarea className="input" rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ resize: "none" }} />
            </div>
            <button className="btn btn-gold" style={{ width: "100%" }} onClick={addClient}>REGISTRAR CLIENTE</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// POS - CAJA REGISTRADORA
// ============================================================
function POS({ data, setData, showToast }) {
  const [cart, setCart] = useState([]);
  const [clientName, setClientName] = useState("");
  const [barberId, setBarberId] = useState("1");
  const [payment, setPayment] = useState("efectivo");
  const [showReceipt, setShowReceipt] = useState(null);

  const addToCart = (item, type) => {
    const existing = cart.find(c => c.id === item.id && c.type === type);
    if (existing) {
      setCart(cart.map(c => c.id === item.id && c.type === type ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...item, type, qty: 1 }]);
    }
  };

  const removeFromCart = (id, type) => setCart(cart.filter(c => !(c.id === id && c.type === type)));
  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  const processSale = async () => {
    if (cart.length === 0) return showToast("Agrega servicios o productos", "error");
    if (!clientName) return showToast("Ingresa el nombre del cliente", "error");
    
    const today = new Date().toISOString().split("T")[0];
    const sale = {
      client_name: clientName,
      services: cart.filter(c => c.type === "service").map(c => c.name),
      products: cart.filter(c => c.type === "product").map(c => c.name),
      total,
      payment,
      barber_id: parseInt(barberId),
      date: today,
    };

    const nueva = await addVenta(sale);
    if (nueva) {
      // Actualizar inventario en Supabase
      for (const item of cart.filter(c => c.type === "product")) {
        const invItem = data.inventory.find(i => i.id === item.id);
        if (invItem) await updateInventario(item.id, { stock: invItem.stock - item.qty });
      }

      setData(d => {
        const updatedInventory = d.inventory.map(item => {
          const inCart = cart.find(c => c.id === item.id && c.type === "product");
          if (inCart) return { ...item, stock: item.stock - inCart.qty };
          return item;
        });
        const updatedClients = d.clients.map(c => {
          if (c.name === clientName) return { ...c, points: c.points + Math.floor(total / 1000), visits: c.visits + 1, lastVisit: today };
          return c;
        });
        return { ...d, sales: [...d.sales, { ...nueva, clientName: nueva.client_name }], inventory: updatedInventory, clients: updatedClients };
      });

      setShowReceipt({ ...nueva, clientName: nueva.client_name });
      setCart([]);
      setClientName("");
    } else {
      showToast("Error al procesar venta", "error");
    }
  };

  return (
    <div>
      <div className="section-title">CAJA POS</div>
      <div className="gold-line" />

      {/* Client & Barber */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div>
          <label className="label">CLIENTE</label>
          <input className="input" list="client-list" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Nombre del cliente" />
          <datalist id="client-list">{data.clients.map(c => <option key={c.id} value={c.name} />)}</datalist>
        </div>
        <div>
          <label className="label">BARBERO</label>
          <select className="input" value={barberId} onChange={e => setBarberId(e.target.value)}>
            {data.staff.map(s => <option key={s.id} value={s.id}>{s.name.split(" ")[0]}</option>)}
          </select>
        </div>
      </div>

      {/* Services */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, letterSpacing: 2, color: "#888", marginBottom: 12 }}>SERVICIOS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          {data.services.map(s => (
            <div key={s.id} className={`pos-key ${cart.find(c => c.id === s.id && c.type === "service") ? "active" : ""}`} onClick={() => addToCart(s, "service")}>
              <div style={{ fontSize: 12, marginBottom: 4 }}>{s.name}</div>
              <div style={{ fontSize: 14, color: "#c8a96e" }}>${s.price.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, letterSpacing: 2, color: "#888", marginBottom: 12 }}>PRODUCTOS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          {data.inventory.map(p => (
            <div key={p.id} className={`pos-key ${p.stock === 0 ? "btn-danger" : ""} ${cart.find(c => c.id === p.id && c.type === "product") ? "active" : ""}`}
              onClick={() => p.stock > 0 && addToCart(p, "product")}
              style={{ opacity: p.stock === 0 ? 0.4 : 1, cursor: p.stock === 0 ? "not-allowed" : "pointer" }}>
              <div style={{ fontSize: 11, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 14, color: "#c8a96e" }}>${p.price.toLocaleString()}</div>
              <div style={{ fontSize: 9, color: "#555", fontFamily: "Lato" }}>Stock: {p.stock}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <div className="card" style={{ marginBottom: 12, borderColor: "rgba(200,169,110,0.3)" }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: "#c8a96e", marginBottom: 12 }}>ORDEN ACTUAL</div>
          {cart.map(item => (
            <div key={`${item.id}-${item.type}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1a1a1a", fontFamily: "Lato", fontSize: 13 }}>
              <div>
                <span style={{ color: "#d0c0a0" }}>{item.name}</span>
                <span style={{ fontSize: 10, color: "#555", marginLeft: 8 }}>x{item.qty}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ color: "#c8a96e", fontWeight: 700 }}>${(item.price * item.qty).toLocaleString()}</span>
                <button style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }} onClick={() => removeFromCart(item.id, item.type)}><Icon name="x" size={14} /></button>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", fontSize: 18, letterSpacing: 1 }}>
            <span style={{ color: "#888" }}>TOTAL</span>
            <span style={{ color: "#c8a96e" }}>${total.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Payment */}
      <div style={{ marginBottom: 16 }}>
        <label className="label">MÉTODO DE PAGO</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {["efectivo", "tarjeta", "transferencia"].map(p => (
            <div key={p} className={`pos-key ${payment === p ? "active" : ""}`} onClick={() => setPayment(p)} style={{ padding: "10px 8px" }}>
              {p.toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-gold" style={{ width: "100%", padding: "16px", fontSize: 16 }} onClick={processSale}>
        <Icon name="cash" size={18} /> COBRAR ${total.toLocaleString()}
      </button>

      {/* Sales history */}
      <div className="card" style={{ marginTop: 20 }}>
        <div style={{ fontSize: 12, letterSpacing: 2, color: "#888", marginBottom: 12 }}>VENTAS RECIENTES</div>
        {data.sales.slice(-5).reverse().map(s => (
          <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1a1a1a", fontFamily: "Lato", fontSize: 12 }}>
            <div>
              <div style={{ color: "#d0c0a0", fontWeight: 700 }}>{s.clientName}</div>
              <div style={{ color: "#555", fontSize: 11 }}>{s.services.join(", ")} · {s.date}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#c8a96e", fontWeight: 700 }}>${s.total.toLocaleString()}</div>
              <div style={{ color: "#444", fontSize: 10, textTransform: "uppercase" }}>{s.payment}</div>
            </div>
          </div>
        ))}
      </div>

      {showReceipt && (
        <div className="modal-bg" onClick={() => setShowReceipt(null)}>
          <div className="modal" style={{ textAlign: "center" }}>
            <div style={{ width: 56, height: 56, background: "rgba(34,197,94,0.15)", border: "2px solid #22c55e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#22c55e" }}>
              <Icon name="check" size={28} />
            </div>
            <div style={{ fontSize: 24, letterSpacing: 3, marginBottom: 4 }}>PAGO EXITOSO</div>
            <div style={{ fontSize: 36, color: "#c8a96e", letterSpacing: 2, margin: "16px 0" }}>${showReceipt.total.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: "#666", fontFamily: "Lato", marginBottom: 4 }}>{showReceipt.clientName}</div>
            <div style={{ fontSize: 11, color: "#444", fontFamily: "Lato", marginBottom: 20 }}>{showReceipt.payment.toUpperCase()} · {showReceipt.date}</div>
            <div style={{ background: "#0a0a0a", borderRadius: 8, padding: 12, marginBottom: 16, textAlign: "left" }}>
              {showReceipt.services.map((s, i) => <div key={i} style={{ fontSize: 12, color: "#888", fontFamily: "Lato", padding: "4px 0" }}>✓ {s}</div>)}
              {showReceipt.products.map((p, i) => <div key={i} style={{ fontSize: 12, color: "#888", fontFamily: "Lato", padding: "4px 0" }}>📦 {p}</div>)}
            </div>
            <div style={{ fontSize: 11, color: "#22c55e", fontFamily: "Lato" }}>Se agregaron {Math.floor(showReceipt.total / 1000)} puntos de fidelización</div>
            <button className="btn btn-gold" style={{ width: "100%", marginTop: 20 }} onClick={() => setShowReceipt(null)}>CERRAR</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// INVENTARIO
// ============================================================
function Inventario({ data, setData, showToast }) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("todos");
  const [form, setForm] = useState({ name: "", category: "Cuidado", stock: "", minStock: "", price: "", cost: "", unit: "und" });

  const categories = ["todos", ...new Set(data.inventory.map(i => i.category))];
  const filtered = filter === "todos" ? data.inventory : data.inventory.filter(i => i.category === filter);

  const addItem = async () => {
    if (!form.name || !form.stock) return showToast("Completa los campos requeridos", "error");
    const nuevo = await addInventario({
      name: form.name,
      category: form.category,
      stock: parseInt(form.stock),
      min_stock: parseInt(form.minStock) || 0,
      price: parseInt(form.price) || 0,
      cost: parseInt(form.cost) || 0,
      unit: form.unit,
    });
    if (nuevo) {
      setData(d => ({ ...d, inventory: [...d.inventory, { ...nuevo, minStock: nuevo.min_stock }] }));
      setShowForm(false);
      setForm({ name: "", category: "Cuidado", stock: "", minStock: "", price: "", cost: "", unit: "und" });
      showToast("Producto agregado");
    } else {
      showToast("Error al agregar producto", "error");
    }
  };

  const updateStock = async (id, delta) => {
    const item = data.inventory.find(i => i.id === id);
    const newStock = Math.max(0, item.stock + delta);
    await updateInventario(id, { stock: newStock });
    setData(d => ({ ...d, inventory: d.inventory.map(i => i.id === id ? { ...i, stock: newStock } : i) }));
  };

  const totalValue = data.inventory.reduce((sum, i) => sum + i.stock * i.cost, 0);
  const lowItems = data.inventory.filter(i => i.stock <= i.minStock);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div className="section-title">INVENTARIO</div>
        <button className="btn btn-gold" onClick={() => setShowForm(true)}><Icon name="plus" size={14} /> AGREGAR</button>
      </div>
      <div className="gold-line" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "PRODUCTOS", val: data.inventory.length },
          { label: "STOCK BAJO", val: lowItems.length, danger: lowItems.length > 0 },
          { label: "VALOR TOTAL", val: `$${(totalValue/1000).toFixed(0)}K` },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: "center", padding: 14, borderColor: s.danger ? "rgba(220,38,38,0.3)" : "#222" }}>
            <div className="stat-num" style={{ fontSize: 24, color: s.danger ? "#ef4444" : "#c8a96e" }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {categories.map(c => (
          <button key={c} className={`btn ${filter === c ? "btn-gold" : "btn-outline"}`} style={{ padding: "6px 14px", fontSize: 11 }} onClick={() => setFilter(c)}>
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      {filtered.map(item => {
        const pct = Math.min((item.stock / Math.max(item.minStock * 2, 1)) * 100, 100);
        const isLow = item.stock <= item.minStock;
        return (
          <div key={item.id} className="card" style={{ marginBottom: 10, borderLeft: `3px solid ${isLow ? "#ef4444" : "#22c55e"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 15, letterSpacing: 1 }}>{item.name}</div>
                <div style={{ fontSize: 11, color: "#555", fontFamily: "Lato", marginTop: 2 }}>{item.category}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                {isLow && <div style={{ fontSize: 10, color: "#ef4444", marginBottom: 4 }}>⚠ STOCK BAJO</div>}
                <div style={{ fontSize: 13, color: "#c8a96e", fontFamily: "Lato" }}>Venta: ${item.price.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: "#555", fontFamily: "Lato" }}>Costo: ${item.cost.toLocaleString()}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 10, color: "#555", fontFamily: "Lato", letterSpacing: 1 }}>STOCK ACTUAL / MÍNIMO</div>
                <div style={{ fontSize: 20, letterSpacing: 2, color: isLow ? "#ef4444" : "#f0e6d3", marginTop: 2 }}>
                  {item.stock} <span style={{ fontSize: 12, color: "#444" }}>/ {item.minStock} {item.unit}</span>
                </div>
                <div className="progress-bar" style={{ width: 120, marginTop: 6 }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: isLow ? "#ef4444" : "#22c55e" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-outline" style={{ padding: "6px 14px", fontSize: 16 }} onClick={() => updateStock(item.id, -1)}>−</button>
                <button className="btn btn-gold" style={{ padding: "6px 14px", fontSize: 16 }} onClick={() => updateStock(item.id, 1)}>+</button>
              </div>
            </div>
          </div>
        );
      })}

      {showForm && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontSize: 22, letterSpacing: 2 }}>NUEVO PRODUCTO</div>
              <button style={{ background: "none", border: "none", color: "#888", cursor: "pointer" }} onClick={() => setShowForm(false)}><Icon name="x" /></button>
            </div>
            {[
              { label: "NOMBRE *", key: "name", type: "text" },
              { label: "STOCK INICIAL *", key: "stock", type: "number" },
              { label: "STOCK MÍNIMO", key: "minStock", type: "number" },
              { label: "PRECIO VENTA", key: "price", type: "number" },
              { label: "COSTO", key: "cost", type: "number" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label className="label">{f.label}</label>
                <input type={f.type} className="input" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label className="label">CATEGORÍA</label>
              <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {["Cuidado", "Estilizado", "Herramientas", "Consumibles"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button className="btn btn-gold" style={{ width: "100%" }} onClick={addItem}>AGREGAR PRODUCTO</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PERSONAL
// ============================================================
function Personal({ data, setData, showToast }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", role: "Barbero", phone: "", schedule: "Lun-Sab", startTime: "09:00", endTime: "18:00", commission: "35" });

  const addStaff = async () => {
    if (!form.name || !form.phone) return showToast("Nombre y teléfono requeridos", "error");
    const nuevo = await addPersonal({
      name: form.name,
      role: form.role,
      phone: form.phone,
      schedule: form.schedule,
      start_time: form.startTime,
      end_time: form.endTime,
      commission: parseInt(form.commission),
      sales: 0,
    });
    if (nuevo) {
      setData(d => ({ ...d, staff: [...d.staff, { ...nuevo, startTime: nuevo.start_time, endTime: nuevo.end_time }] }));
      setShowForm(false);
      setForm({ name: "", role: "Barbero", phone: "", schedule: "Lun-Sab", startTime: "09:00", endTime: "18:00", commission: "35" });
      showToast("Empleado registrado");
    } else {
      showToast("Error al registrar empleado", "error");
    }
  };

  const totalSales = data.staff.reduce((sum, s) => sum + s.sales, 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div className="section-title">PERSONAL</div>
        <button className="btn btn-gold" onClick={() => setShowForm(true)}><Icon name="plus" size={14} /> AGREGAR</button>
      </div>
      <div className="gold-line" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[
          { label: "EMPLEADOS", val: data.staff.length },
          { label: "VENTAS TOTAL", val: `$${(totalSales/1000).toFixed(0)}K` },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: "center", padding: 16 }}>
            <div className="stat-num">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {data.staff.map(emp => {
        const empApps = data.appointments.filter(a => a.barberId === emp.id);
        const commission = Math.floor(emp.sales * emp.commission / 100);
        return (
          <div key={emp.id} className="card" style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #c8a96e33, #c8a96e11)", border: "2px solid #c8a96e44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#c8a96e", letterSpacing: 1, flexShrink: 0 }}>
                  {emp.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: 15, letterSpacing: 1, color: "#f0e6d3" }}>{emp.name}</div>
                  <div style={{ fontSize: 11, color: "#c8a96e", letterSpacing: 2, marginTop: 2 }}>{emp.role.toUpperCase()}</div>
                  <div style={{ fontSize: 11, color: "#555", fontFamily: "Lato", marginTop: 2 }}>{emp.phone}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, color: "#c8a96e", letterSpacing: 1 }}>${(emp.sales/1000).toFixed(0)}K</div>
                <div style={{ fontSize: 10, color: "#555", fontFamily: "Lato", marginTop: 2 }}>EN VENTAS</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
              {[
                { label: "HORARIO", val: emp.schedule },
                { label: "JORNADA", val: `${emp.startTime}-${emp.endTime}` },
                { label: "COMISIÓN", val: `${emp.commission}%` },
              ].map(f => (
                <div key={f.label} style={{ background: "#0a0a0a", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 8, letterSpacing: 2, color: "#444", fontFamily: "Lato" }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: "#d0c0a0", fontFamily: "Lato", marginTop: 2 }}>{f.val}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "rgba(200,169,110,0.05)", border: "1px solid rgba(200,169,110,0.15)", borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#555", fontFamily: "Lato" }}>CITAS ASIGNADAS</div>
                <div style={{ fontSize: 16, letterSpacing: 1, color: "#f0e6d3", marginTop: 2 }}>{empApps.length}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#555", fontFamily: "Lato" }}>COMISIÓN GANADA</div>
                <div style={{ fontSize: 16, color: "#22c55e", letterSpacing: 1, marginTop: 2 }}>${commission.toLocaleString()}</div>
              </div>
            </div>
          </div>
        );
      })}

      {showForm && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontSize: 22, letterSpacing: 2 }}>NUEVO EMPLEADO</div>
              <button style={{ background: "none", border: "none", color: "#888", cursor: "pointer" }} onClick={() => setShowForm(false)}><Icon name="x" /></button>
            </div>
            {[
              { label: "NOMBRE COMPLETO *", key: "name", type: "text" },
              { label: "TELÉFONO *", key: "phone", type: "tel" },
              { label: "HORARIO (ej: Lun-Sab)", key: "schedule", type: "text" },
              { label: "HORA ENTRADA", key: "startTime", type: "time" },
              { label: "HORA SALIDA", key: "endTime", type: "time" },
              { label: "COMISIÓN (%)", key: "commission", type: "number" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label className="label">{f.label}</label>
                <input type={f.type} className="input" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label className="label">ROL</label>
              <select className="input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                {["Barbero Senior", "Barbero", "Aprendiz", "Recepcionista"].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <button className="btn btn-gold" style={{ width: "100%" }} onClick={addStaff}>REGISTRAR EMPLEADO</button>
          </div>
        </div>
      )}
    </div>
  );
}
