import { useState, useEffect } from "react";
import { enviarNotificaciones } from './notificaciones';
import { addCita, getCitasByDate } from './db';
import logo from "./assets/logo.jpeg";
import barbero1 from "./assets/barbero1.jpg"
//import barbero2 from "./assets/barbero2.jpg"

// ─── DATA ────────────────────────────────────────────────────
const SERVICES = [
  { id: 1, name: "Corte de Cabello", price: 25000, duration: 30, desc: "Corte cabello " },
  { id: 2, name: "Corte + Barba", price: 30000, duration: 45, desc: "Corte completo mas arreglo de barba" },
  { id: 3, name: "Delineado de Barba", price: 12000, duration: 30, desc: "Perfilado y arreglo de barba" },
  { id: 4, name: "Delineado de Barba Premium", price: 15000, duration: 40, desc: "Perfilado y arreglo de barba premium" },
  { id: 1, name: "Limpieza Facial", price: 20000, duration: 30, desc: "Limpieza facial" },
  { id: 2, name: "Limpieza de Cejas", price: 4000, duration: 45, desc: "Limpieza de cejas" },
  { id: 3, name: "Afeitado de Barba", price: 18000, duration: 30, desc: "Afeitado de Barba" },
  { id: 4, name: "Rayitos Blanco o Platinado", price: 150000, duration: 40, desc: "Rayitos Blanco y Platinado" },
];

const BARBERS = [
  { id: 1, name: "Deivy pereira", role: "Barbero Senior", exp: "8 años de experiencia", image: barbero1, initials: "MA", specialties: ["Corte Clásico", "Afeitado Tradicional"] },
  //{ id: 2, name: "Juan Pablo Herrera", role: "Barbero", exp: "4 años de experiencia",image: barbero2, initials: "JP", specialties: ["Corte + Barba", "Arreglo de Barba", "Corte Niños"] },
];

const HOURS = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","02:00","02:30","03:00","03:30","04:00","04:30","05:00","05:30",];

const DAYS = ["DOM","LUN","MAR","MIÉ","JUE","VIE","SÁB"];
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function getNext14Days() {
  const days = [];
  const base = new Date();
  for (let i = 1; i <= 30; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const iso = `${y}-${m}-${day}`;
    days.push({ iso, day: DAYS[d.getDay()], num: d.getDate(), month: MONTHS[d.getMonth()], disabled: d.getDay() === 0 });
  }
  return days;
}

// ─── ICONS ───────────────────────────────────────────────────
const Ico = ({ n, s = 18 }) => {
  const m = {
    scissors: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>,
    check: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    clock: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    arrow: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    back: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    user: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    phone: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    mail: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    calendar: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    star: <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    wa: <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  };
  return m[n] || null;
};

// ─── MAIN ────────────────────────────────────────────────────
export default function BookingPage() {
  const [step, setStep] = useState(1); // 1=service 2=barber 3=datetime 4=form 5=confirm
  const [selected, setSelected] = useState({ service: null, barber: null, date: null, time: null });
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [booked, setBooked] = useState(false);
  useEffect(() => {
  if (selected.date) {
    getCitasByDate(selected.date).then(citas => {
      console.log("Citas encontradas:", citas);
      const slots = citas.map(c => c.time);
      console.log("Slots ocupados:", slots);
      setBookedSlots(slots);
    });
  }
}, [selected.date]);
  const [loading, setLoading] = useState(false); // eslint-disable-line
  const [bookedSlots, setBookedSlots] = useState([]);
  const days = getNext14Days();

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);



  const confirm = async () => {
    if (!form.name || !form.phone) return;

    await addCita({
      client_name: form.name,
      client_phone: form.phone,
      barber_id: selected.barber?.id,
      barber_name: selected.barber?.name,
      service: selected.service?.name,
      date: selected.date,
      time: selected.time,
      duration: selected.service?.duration,
      price: selected.service?.price,
      status: "pending",
      notes: form.notes,
    });

    await enviarNotificaciones({
      client_name: form.name,
      phone: form.phone,
      email: form.email,
      date: selected.date,
      time: selected.time,
      service: selected.service?.name,
      barber: selected.barber?.name,
      barber_email: selected.barber?.id === 1 
        ? process.env.REACT_APP_BARBER_1_EMAIL 
        : process.env.REACT_APP_BARBER_2_EMAIL,
      price: selected.service?.price.toLocaleString(),
    });

    setBooked(true);
    setStep(5);
  };


  const reset = () => {
    setStep(1); setSelected({ service: null, barber: null, date: null, time: null });
    setForm({ name: "", phone: "", email: "", notes: "" }); setBooked(false);
  };

  return (
    <div style={{ fontFamily: "'Playfair Display', Georgia, serif", background: "#706e6ec8", minHeight: "100vh", color: "#000000" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .sans { font-family: 'DM Sans', sans-serif; }
        .btn-primary { background: #706e6ec8; color: #ffffff; border: none; padding: 14px 32px; border-radius: 4px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; transition: all .2s; width: 100%; }
        .btn-primary:hover { background: #bbb09f; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(26,18,9,0.2); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .btn-back { background: none; border: 1px solid #d4c4a8; color: #8a7560; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; letter-spacing: 1px; display: flex; align-items: center; gap: 6px; transition: all .2s; }
        .btn-back:hover { border-color: #1a1209; color: #1a1209; }
        .service-card { background: white; border: 1.5px solid #aa5e00; border-radius: 8px; padding: 18px; cursor: pointer; transition: all .2s; position: relative; }
        .service-card:hover { border-color: #c8a060; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(200,160,96,0.15); }
        .service-card.selected { border-color: #c8a060; background: #fffbf5; box-shadow: 0 0 0 3px rgba(200,160,96,0.15); }
        .barber-card { background: white; border: 1.5px solid #e8ddd0; border-radius: 10px; padding: 22px; cursor: pointer; transition: all .25s; text-align: center; }
        .barber-card:hover { border-color: #c8a060; transform: translateY(-3px); box-shadow: 0 12px 32px rgba(200,160,96,0.2); }
        .barber-card.selected { border-color: #c8a060; background: #fffbf5; box-shadow: 0 0 0 3px rgba(200,160,96,0.15); }
        .day-chip { background: white; border: 1.5px solid #e8ddd0; border-radius: 8px; padding: 10px 6px; cursor: pointer; text-align: center; min-width: 52px; transition: all .15s; }
        .day-chip:hover:not(.disabled) { border-color: #c8a060; }
        .day-chip.selected { background: #1a1209; border-color: #1a1209; color: white; }
        .day-chip.disabled { opacity: 0.35; cursor: not-allowed; }
        .time-chip { background: white; border: 1.5px solid #d8e8d0; border-radius: 6px; padding: 10px; text-align: center; cursor: pointer; transition: all .15s; font-family: 'DM Sans', sans-serif; font-size: 13px; }
        .time-chip:hover { border-color: #c8a060; color: #c8a060; }
        .time-chip.selected { background: #1a1209; border-color: #1a1209; color: white; }
        .input { background: white; border: 1.5px solid #e0d4c0; border-radius: 6px; padding: 12px 16px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #1a1209; width: 100%; outline: none; transition: border .2s; }
        .input:focus { border-color: #c8a060; }
        .step-dot { width: 8px; height: 8px; border-radius: 50%; background: #d4c4a8; transition: all .3s; }
        .step-dot.active { background: #1a1209; transform: scale(1.3); }
        .step-dot.done { background: #c8a060; }
        .label { font-family: 'DM Sans', sans-serif; font-size: 11px; letter-spacing: 1.5px; color: #a09080; text-transform: uppercase; margin-bottom: 8px; display: block; }
        .check-circle { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #c8a060, #e8c080); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: white; box-shadow: 0 8px 24px rgba(200,160,96,0.4); }
        .ornament { color: #c8a060; font-size: 20px; letter-spacing: 8px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade { animation: fadeIn .35s ease; }
        .summary-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0e8dc; font-family: 'DM Sans', sans-serif; font-size: 13px; }
        .tag { background: #f5ede0; color: #a07840; border-radius: 20px; padding: 3px 12px; font-family: 'DM Sans', sans-serif; font-size: 11px; letter-spacing: 1px; display: inline-block; }
      `}</style>

      <div style={{
  background: "linear-gradient(135deg, #000000, #000000)",
  padding: "18px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  boxShadow: "0 6px 24px rgba(0,0,0,0.25)"
}}>

  {/* LEFT: LOGO + BRAND */}
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

    {/* LOGO REAL */}
    <div style={{
  width: 122,
  height: 122,
  borderRadius: 120,
  background: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden"
}}>
  <img 
    src={logo} 
    alt="Logo barbería"
    style={{ width: "100%", objectFit: "contain" }}
  />
</div>
    

    {/* TEXT */}
    <div>
      <div style={{
        fontSize: 38,
        letterSpacing: 4,
        color: "#ffffff",
        fontWeight: 600
      }}>
        PEREIRA BARBER
      </div>

      <div style={{
        fontSize: 15,
        letterSpacing: 2,
        color: "#ffffff",
        fontFamily: "DM Sans"
      }}>
        RESERVA EN SEGUNDOS
      </div>
    </div>
  </div>

  {/* RIGHT: STEP + PROGRESS */}
  <div style={{ textAlign: "right" }}>

    {/* TEXTO DE PASO */}
    <div style={{
      fontSize: 12,
      color: "#ffffff",
      fontFamily: "DM Sans",
      marginBottom: 4
    }}>
      Paso {step} de 4
    </div>

    {/* BARRA PROGRESO */}
    <div style={{
      width: 80,
      height: 6,
      background: "#FFD700",
      borderRadius: 10,
      overflow: "hidden"
    }}>
      <div style={{
        width: `${(step / 4) * 100}%`,
        height: "100%",
        background: "linear-gradient(90deg, #ffffff, #FFD700)",
        transition: "width 0.3s ease"
      }} />
    </div>

    {/* DOTS */}
    <div style={{ display: "flex", gap: 5, marginTop: 6, justifyContent: "flex-end" }}>
      {[1,2,3,4].map(i => (
        <div key={i} style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: step === i 
            ? "#fff" 
            : step > i 
              ? "#000000" 
              : "#000000",
          transition: "all 0.3s"
        }} />
      ))}
    </div>

  </div>
</div>

      {/* DECORATIVE BAR */}
      <div style={{ height: 3, background: "#FFD700" }} />

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px 60px" }}>

        {/* ── STEP 1: SERVICE ── */}
        {step === 1 && (
          <div className="fade">
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div className="ornament">✦ ✦ ✦</div>
              <h1 style={{ fontSize: 30, fontWeight: 700, marginTop: 12, marginBottom: 8, letterSpacing: 1 }}>¿Qué servicio deseas?</h1>
              <p style={{ color: "#8a7560", fontFamily: "DM Sans", fontSize: 14 }}>Selecciona uno de nuestros servicios</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>

  {/* Información de la barbería */}
  <div
    style={{
      background: "white",
      border: "1.5px solid #e8ddd0",
      borderRadius: "10px",
      padding: "24px",
      marginBottom: "10px",
      textAlign: "center"
    }}
  >
    <div className="ornament">✦ ✦ ✦</div>

    <h2
      style={{
        fontSize: 24,
        marginTop: 10,
        marginBottom: 10,
        color: "#1a1209"
      }}
    >
      Bienvenido a Nuestra Barbería
    </h2>

    <p
      style={{
        fontFamily: "DM Sans",
        color: "#8a7560",
        fontSize: 14,
        lineHeight: 1.7,
        maxWidth: "700px",
        margin: "0 auto"
      }}
    >
      Bienvenido a una experiencia de barbería exclusiva.

Tu estilo habla por ti, y cada detalle cuenta. Aquí transformamos cada corte en una expresión de confianza, personalidad y actitud, combinando precisión, profesionalismo y las últimas tendencias en barbería.

Ya sea que busques renovar tu imagen o mantener tu estilo favorito, nuestro compromiso es brindarte un servicio de excelencia en un ambiente cómodo y moderno.

Descubre el arte de la barbería moderna y lleva tu imagen al siguiente nivel.
    </p>

    <div style={{ marginTop: 15 }}>
      <span className="tag">✂ Calidad • Estilo • Profesionalismo</span>
    </div>
  </div>
</div>
              {SERVICES.map(s => (
                <div key={s.id} className={`service-card ${selected.service?.id === s.id ? "selected" : ""}`} onClick={() => setSelected(p => ({ ...p, service: s }))}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{s.name}</div>
                      <div style={{ fontSize: 13, color: "#8a7560", fontFamily: "DM Sans" }}>{s.desc}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                        <span style={{ color: "#a09080" }}><Ico n="clock" s={13} /></span>
                        <span style={{ fontSize: 12, color: "#a09080", fontFamily: "DM Sans" }}>{s.duration} min</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", marginLeft: 16 }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: "#c8a060" }}>${s.price.toLocaleString()}</div>
                      {selected.service?.id === s.id && (
                        <div style={{ color: "#c8a060", marginTop: 4 }}><Ico n="check" s={18} /></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-primary" disabled={!selected.service} onClick={next}>
              CONTINUAR <Ico n="arrow" s={16} />
            </button>
          </div>
        )}

        {/* ── STEP 2: BARBER ── */}
        {step === 2 && (
          <div className="fade">
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div className="ornament">✦ ✦ ✦</div>
              <h1 style={{ fontSize: 30, fontWeight: 700, marginTop: 12, marginBottom: 8, letterSpacing: 1 }}>Elige tu barbero</h1>
              <p style={{ color: "#ffffff", fontFamily: "DM Sans", fontSize: 14 }}>Nuestros profesionales te atenderán</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
              {BARBERS.map(b => (
                <div key={b.id} className={`barber-card ${selected.barber?.id === b.id ? "selected" : ""}`} onClick={() => setSelected(p => ({ ...p, barber: b }))}>
                  <img
  src={b.image}
  alt={b.name}
  style={{
    width: 70,
    height: 70,
    borderRadius: "50%",
    objectFit: "cover",
    margin: "0 auto 12px",
    display: "block",
    border: selected.barber?.id === b.id
      ? "3px solid #c8a060"
      : "2px solid #e8ddd0"
  }}
/>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{b.name.split(" ")[0]} {b.name.split(" ")[1]}</div>
                  <div style={{ fontSize: 11, color: "#c8a060", letterSpacing: 1, fontFamily: "DM Sans", textTransform: "uppercase", marginBottom: 6 }}>{b.role}</div>
                  <div style={{ fontSize: 11, color: "#a09080", fontFamily: "DM Sans", marginBottom: 10 }}>{b.exp}</div>
                  <div style={{ display: "flex", flex: 1, justifyContent: "center" }}>
                    {[1,2,3,4,5].map(i => <span key={i} style={{ color: "#c8a060", fontSize: 10 }}><Ico n="star" s={10} /></span>)}
                  </div>
                  <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center" }}>
                    {b.specialties.slice(0, 2).map(sp => <span key={sp} className="tag">{sp}</span>)}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-back" onClick={back}><Ico n="back" s={14} /> Atrás</button>
              <button className="btn-primary" disabled={!selected.barber} onClick={next}>CONTINUAR</button>
            </div>
          </div>
        )}

        {/* ── STEP 3: DATE & TIME ── */}
        {step === 3 && (
          <div className="fade">
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div className="ornament">✦ ✦ ✦</div>
              <h1 style={{ fontSize: 30, fontWeight: 700, marginTop: 12, marginBottom: 8, letterSpacing: 1 }}>Fecha y hora</h1>
              <p style={{ color: "#8a7560", fontFamily: "DM Sans", fontSize: 14 }}>Selecciona cuándo quieres tu cita</p>
            </div>

            {/* Date picker */}
            <label className="label">Selecciona el día</label>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 24 }}>
              {days.map(d => (
                <div key={d.iso} className={`day-chip ${selected.date === d.iso ? "selected" : ""} ${d.disabled ? "disabled" : ""}`}
                  onClick={() => !d.disabled && setSelected(p => ({ ...p, date: d.iso, time: null }))}>
                  <div style={{ fontSize: 9, letterSpacing: 1, fontFamily: "DM Sans", opacity: 0.7, marginBottom: 4 }}>{d.day}</div>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>{d.num}</div>
                  <div style={{ fontSize: 8, fontFamily: "DM Sans", opacity: 0.6, marginTop: 2 }}>{d.month.slice(0,3)}</div>
                </div>
              ))}
            </div>

            {/* Time picker */}
            {selected.date && (
              <>
                <label className="label">Horarios disponibles</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 24 }}>
                  {HOURS.map(h => {
  const taken = bookedSlots.includes(h);
  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const nowHours = now.getHours();
  const nowMinutes = now.getMinutes();
  const [slotHours, slotMinutes] = h.split(':').map(Number);
  const isPastHour = selected.date === todayIso && 
  (slotHours < nowHours || (slotHours === nowHours && slotMinutes <= nowMinutes));
  const disabled = taken || isPastHour;
  return (
    <div key={h}
      className={`time-chip ${disabled ? "disabled" : ""} ${selected.time === h ? "selected" : ""}`}
      style={{ opacity: disabled ? 0.35 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
      onClick={() => !disabled && setSelected(p => ({ ...p, time: h }))}>
      {h}
    </div>
  );
})}
                </div>
              </>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-back" onClick={back}><Ico n="back" s={14} /> Atrás</button>
              <button className="btn-primary" disabled={!selected.date || !selected.time} onClick={next}>CONTINUAR</button>
            </div>
          </div>
        )}

        {/* ── STEP 4: FORM ── */}
        {step === 4 && (
          <div className="fade">
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div className="ornament">✦ ✦ ✦</div>
              <h1 style={{ fontSize: 30, fontWeight: 700, marginTop: 12, marginBottom: 8, letterSpacing: 1 }}>Tus datos</h1>
              <p style={{ color: "#8a7560", fontFamily: "DM Sans", fontSize: 14 }}>Para confirmar y enviarte el recordatorio</p>
            </div>

            {/* Summary card */}
            <div style={{ background: "#1a1209", borderRadius: 10, padding: "16px 20px", marginBottom: 24, color: "#f0e0c0" }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#c8a060", fontFamily: "DM Sans", marginBottom: 12 }}>RESUMEN DE TU CITA</div>
              {[
                { label: "Servicio", val: selected.service?.name },
                { label: "Barbero", val: selected.barber?.name },
                { label: "Fecha", val: selected.date },
                { label: "Hora", val: selected.time },
                { label: "Duración", val: `${selected.service?.duration} min` },
                { label: "Total", val: `$${selected.service?.price.toLocaleString()}` },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #2d2010", fontFamily: "DM Sans", fontSize: 13 }}>
                  <span style={{ color: "#8a7060" }}>{r.label}</span>
                  <span style={{ color: r.label === "Total" ? "#c8a060" : "#f0e0c0", fontWeight: r.label === "Total" ? 700 : 400 }}>{r.val}</span>
                </div>
              ))}
            </div>

            {/* Form */}
            {[
              { label: "Nombre completo *", key: "name", type: "text", icon: "user" },
              { label: "WhatsApp *", key: "phone", type: "tel", icon: "phone" },
              { label: "Correo electrónico (opcional)", key: "email", type: "email", icon: "mail" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label className="label">{f.label}</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#c0b0a0" }}><Ico n={f.icon} s={16} /></span>
                  <input type={f.type} className="input" style={{ paddingLeft: 40 }} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.label.replace(" *", "").replace(" (opcional)", "")} />
                </div>
              </div>
            ))}
            <div style={{ marginBottom: 24 }}>
              <label className="label">Notas adicionales (opcional)</label>
              <textarea className="input" rows={3} style={{ resize: "none" }} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="¿Alguna preferencia o indicación especial?" />
            </div>

            <div style={{ background: "#f5ede0", borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontFamily: "DM Sans", fontSize: 12, color: "#8a7060", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ color: "#c8a060", marginTop: 1 }}><Ico n="wa" s={16} /></span>
              <span>Recibirás un recordatorio por <strong>WhatsApp</strong>{form.email ? " y correo electrónico" : ""} 24 horas antes de tu cita.</span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-back" onClick={back}><Ico n="back" s={14} /> Atrás</button>
              <button className="btn-primary" disabled={!form.name || !form.phone} onClick={confirm}>CONFIRMAR CITA</button>
            </div>
          </div>
        )}

        {/* ── STEP 5: CONFIRMATION ── */}
        {step === 5 && booked && (
          <div className="fade" style={{ textAlign: "center" }}>
            <div style={{ marginBottom: 28, paddingTop: 20 }}>
              <div className="check-circle"><Ico n="check" s={36} /></div>
              <div className="ornament">✦ ✦ ✦</div>
              <h1 style={{ fontSize: 32, fontWeight: 700, marginTop: 12, marginBottom: 8, letterSpacing: 1 }}>¡Cita Confirmada!</h1>
              <p style={{ color: "#8a7560", fontFamily: "DM Sans", fontSize: 14, lineHeight: 1.6 }}>
                Tu cita ha sido agendada exitosamente.<br />Te enviaremos un recordatorio.
              </p>
            </div>

            {/* Confirmation card */}
            <div style={{ background: "white", border: "1.5px solid #e8ddd0", borderRadius: 12, padding: "24px", marginBottom: 20, textAlign: "left", boxShadow: "0 8px 32px rgba(200,160,96,0.1)" }}>
              <div style={{ textAlign: "center", marginBottom: 18 }}>
                <div style={{ fontSize: 11, letterSpacing: 3, color: "#c8a060", fontFamily: "DM Sans" }}>BARBERÍA PRO</div>
                <div style={{ fontSize: 11, color: "#a09080", fontFamily: "DM Sans", marginTop: 4 }}>Confirmación #{Date.now().toString().slice(-6)}</div>
              </div>
              {[
                { label: "Cliente", val: form.name },
                { label: "Servicio", val: selected.service?.name },
                { label: "Barbero", val: selected.barber?.name },
                { label: "Fecha", val: selected.date },
                { label: "Hora", val: selected.time },
                { label: "Duración", val: `${selected.service?.duration} minutos` },
                { label: "Total a pagar", val: `$${selected.service?.price.toLocaleString()} COP` },
              ].map(r => (
                <div key={r.label} className="summary-row">
                  <span style={{ color: "#16ac3b" }}>{r.label}</span>
                  <span style={{ fontWeight: r.label === "Total a pagar" ? 700 : 500, color: r.label === "Total a pagar" ? "#c8a060" : "#1a1209", fontFamily: "DM Sans" }}>{r.val}</span>
                </div>
              ))}
            </div>

            {/* Notifications */}
            <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
              <div style={{ flex: 1, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "12px", textAlign: "center" }}>
                <div style={{ color: "#22c55e", marginBottom: 4 }}><Ico n="wa" s={20} /></div>
                <div style={{ fontSize: 11, fontFamily: "DM Sans", color: "#16a34a" }}>WhatsApp<br />{form.phone}</div>
              </div>
              {form.email && (
                <div style={{ flex: 1, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "12px", textAlign: "center" }}>
                  <div style={{ color: "#3b82f6", marginBottom: 4 }}><Ico n="mail" s={20} /></div>
                  <div style={{ fontSize: 11, fontFamily: "DM Sans", color: "#2563eb" }}>Email<br />{form.email}</div>
                </div>
              )}
            </div>

            <div style={{ background: "#fffbf5", border: "1px solid #e8d0a0", borderRadius: 8, padding: "14px 16px", marginBottom: 24, fontFamily: "DM Sans", fontSize: 12, color: "#8a7060", lineHeight: 1.6 }}>
              📋 <strong>Recuerda:</strong> Si necesitas cancelar o reprogramar, contáctanos con al menos 2 horas de anticipación al número de WhatsApp de la barbería.
            </div>

            <button className="btn-primary" onClick={reset}>AGENDAR OTRA CITA</button>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ background: "#000000", padding: "16px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: "#ffffff", fontFamily: "DM Sans" }}>© 2026 BARBERÍA PRO · TODOS LOS DERECHOS RESERVADOS</div>
      </div>
    </div>
  );
}
