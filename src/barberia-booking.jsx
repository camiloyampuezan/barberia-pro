import { useState, useEffect } from "react";
import { enviarNotificaciones } from './notificaciones';
import { addCita, getCitasByDate } from './db';
import logo from "./assets/logo.jpeg";
import barbero1 from "./assets/barbero1.jpg";
//import barbero2 from "./assets/barbero2.jpg";

// ─── DATA ────────────────────────────────────────────────────
const SERVICES = [
  { id: 1, cat: "Cabello", name: "Corte de Cabello", price: 25000, duration: 30, desc: "Corte cabello" },
  { id: 2, cat: "Cabello", name: "Corte + Barba", price: 30000, duration: 45, desc: "Corte completo más arreglo de barba" },
  { id: 3, cat: "Barba", name: "Delineado de Barba", price: 12000, duration: 30, desc: "Perfilado y arreglo de barba" },
  { id: 4, cat: "Barba", name: "Delineado de Barba Premium", price: 15000, duration: 40, desc: "Perfilado y arreglo de barba premium" },
  { id: 5, cat: "Rostro", name: "Limpieza Facial", price: 20000, duration: 30, desc: "Limpieza facial" },
  { id: 6, cat: "Rostro", name: "Limpieza de Cejas", price: 4000, duration: 45, desc: "Limpieza de cejas" },
  { id: 7, cat: "Barba", name: "Afeitado de Barba", price: 18000, duration: 30, desc: "Afeitado de barba" },
  { id: 8, cat: "Color", name: "Rayitos Blanco o Platinado", price: 150000, duration: 40, desc: "Rayitos blanco y platinado" },
];

const CATEGORIES = ["Cabello", "Barba", "Rostro", "Color"];

const BARBERS = [
  { id: 1, name: "Deivy Pereira", role: "Barbero Senior", exp: "8 años de experiencia", image: barbero1, initials: "DP", specialties: ["Corte Clásico", "Afeitado Tradicional"] },
  //{ id: 2, name: "Juan Pablo Herrera", role: "Barbero", exp: "4 años de experiencia", image: barbero2, initials: "JP", specialties: ["Corte + Barba", "Arreglo de Barba", "Corte Niños"] },
];

// Horas en formato 24h (así la comparación con getHours() funciona bien)
const HOURS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

const DAYS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const TOTAL_STEPS = 5;
const DAYS_AHEAD = 30;
// 0 = permite citas hoy (las horas ya pasadas se bloquean solas). Cambia a 1 para empezar desde mañana.
const FIRST_DAY_OFFSET = 0;

function getNextDays() {
  const days = [];
  const base = new Date();
  for (let i = FIRST_DAY_OFFSET; i < FIRST_DAY_OFFSET + DAYS_AHEAD; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const iso = `${y}-${m}-${day}`;
    days.push({ iso, day: DAYS[d.getDay()], num: d.getDate(), month: MONTHS[d.getMonth()], disabled: d.getDay() === 0 });
  }
  return days;
}

// ─── DATOS DE LA EMPRESA (cambia estos valores) ──────────────
const ADDRESS = "Calle 00 # 00-00, Barrio, Pereira, Risaralda";
const SOCIALS = [
  { key: "facebook",  label: "Facebook",  url: "https://www.facebook.com/TU_PAGINA" },
  { key: "instagram", label: "Instagram", url: "https://www.instagram.com/TU_USUARIO" },
  { key: "tiktok",    label: "TikTok",    url: "https://www.tiktok.com/@TU_USUARIO" },
];
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`;

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
        facebook: <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    instagram: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>,
    tiktok: <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
    pin: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  };
  return m[n] || null;
};

// ─── MAIN ────────────────────────────────────────────────────
export default function BookingPage() {
  // 1=servicio 2=barbero 3=fecha/hora 4=datos 5=confirmación
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState({ service: null, barber: null, date: null, time: null });
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [confirmId, setConfirmId] = useState("");

  const days = getNextDays();

  // Cargar horas ocupadas cuando cambia la fecha
  useEffect(() => {
    if (!selected.date) return;
    let cancelled = false;
    setBookedSlots([]);
    getCitasByDate(selected.date)
      .then(citas => {
        if (cancelled) return;
        setBookedSlots((citas || []).map(c => c.time));
      })
      .catch(err => console.error("Error cargando citas:", err));
    return () => { cancelled = true; };
  }, [selected.date]);

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  const confirm = async () => {
    if (!form.name || !form.phone || loading) return;
    setLoading(true);
    setError("");

    try {
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

      setConfirmId(Date.now().toString().slice(-6));
      setBooked(true);
      setStep(5);
    } catch (err) {
      console.error("Error al confirmar la cita:", err);
      setError("No pudimos agendar tu cita. Intenta de nuevo en un momento.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSelected({ service: null, barber: null, date: null, time: null });
    setForm({ name: "", phone: "", email: "", notes: "" });
    setBookedSlots([]);
    setBooked(false);
    setError("");
  };

  // Fecha y hora actuales (para bloquear horas pasadas de hoy)
  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return (
    <div style={{ fontFamily: "'Playfair Display', Georgia, serif", background: "#000000", minHeight: "100vh", color: "#c61313" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .sans { font-family: 'DM Sans', sans-serif; }
        .btn-primary { background: #fffbf5; color: #000000; border: none; padding: 14px 32px; border-radius: 4px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; transition: all .2s; width: 100%; }
        .btn-primary:hover { background: #cf0b0b; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(155, 255, 4, 0.2); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .btn-back { background: none; border: 1px solid #d4c4a8; color: #8a7560; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; letter-spacing: 1px; display: flex; align-items: center; gap: 6px; transition: all .2s; }
        .btn-back:hover { border-color: #1a1209; color: #1a1209; }
        .welcome { background: #0f0f0f; border: 1px solid rgba(200,160,96,0.55); border-radius: 12px; padding: 28px 24px; position: sticky; top: 20px; }
        .welcome-list { display: flex; flex-direction: column; gap: 16px; margin: 24px 0 20px; }
        .welcome-item { display: flex; gap: 14px; align-items: flex-start; }
        .welcome-icon { width: 38px; height: 38px; border-radius: 50%; border: 1px solid rgba(200,160,96,0.6); color: #c8a060; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .welcome-foot { display: flex; gap: 10px; align-items: center; border-top: 1px solid #2a2a2a; padding-top: 16px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: #cdbfa8; line-height: 1.5; }
        .svc-layout { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: 32px; align-items: start; }
        .cat-title { font-size: 20px; font-weight: 600; color: #ffffff; display: flex; align-items: center; gap: 14px; margin-bottom: 12px; }
        .cat-title::after { content: ""; flex: 1; height: 1px; background: #4a1a1a; }
        .svc { background: #fffbf5; color: #1a1209; border: 1.5px solid #e8ddd0; border-radius: 10px; padding: 16px 18px; cursor: pointer; display: flex; align-items: center; gap: 14px; transition: border-color .2s, box-shadow .2s, background .2s; }
        .svc:hover { border-color: #c8a060; }
        .svc:focus-visible { outline: 2px solid #c8a060; outline-offset: 2px; }
        .svc.selected { background: #ffffff; border-color: #ce0909; box-shadow: 0 0 0 3px rgba(206,9,9,0.22); }
        .svc-check { width: 22px; height: 22px; border-radius: 50%; border: 1.5px solid #cdbfa8; color: #ffffff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all .2s; }
        .svc.selected .svc-check { background: #ce0909; border-color: #ce0909; }
        .svc-time { display: inline-flex; align-items: center; gap: 5px; margin-top: 8px; background: #f5ede0; color: #6f5d49; border-radius: 20px; padding: 3px 10px; font-family: 'DM Sans', sans-serif; font-size: 12px; }
        .svc-price { font-size: 19px; font-weight: 700; color: #8a5a12; white-space: nowrap; }
        .action-bar { position: sticky; bottom: 12px; z-index: 5; display: flex; align-items: center; gap: 14px; background: #111111; border: 1px solid #c8a060; border-radius: 12px; padding: 12px 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); }
        @media (max-width: 820px) {
          .svc-layout { grid-template-columns: 1fr; gap: 24px; }
          .welcome { position: static; }
        }
        .barber-card { background: white; border: 1.5px solid #e8ddd0; border-radius: 10px; padding: 22px; cursor: pointer; transition: all .25s; text-align: center; }
        .barber-card:hover { border-color: #c8a060; transform: translateY(-3px); box-shadow: 0 12px 32px rgba(200,160,96,0.2); }
        .barber-card.selected { border-color: #c8a060; background: #fffbf5; box-shadow: 0 0 0 3px rgba(200,160,96,0.15); }
        .day-chip { background: white; border: 1.5px solid #e8ddd0; border-radius: 8px; padding: 10px 6px; cursor: pointer; text-align: center; min-width: 52px; transition: all .15s; }
        .day-chip:hover:not(.disabled) { border-color: #c8a060; }
        .day-chip.selected { background: #1a1209; border-color: #1a1209; color: white; }
        .day-chip.disabled { opacity: 0.35; cursor: not-allowed; }
        .time-chip { background: white; border: 1.5px solid #d8e8d0; border-radius: 6px; padding: 10px; text-align: center; cursor: pointer; transition: all .15s; font-family: 'DM Sans', sans-serif; font-size: 13px; }
        .time-chip:hover:not(.disabled) { border-color: #c8a060; color: #c8a060; }
        .time-chip.selected { background: #1a1209; border-color: #1a1209; color: white; }
        .time-chip.disabled { opacity: 0.35; cursor: not-allowed; }
        .input { background: white; border: 1.5px solid #e0d4c0; border-radius: 6px; padding: 12px 16px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #1a1209; width: 100%; outline: none; transition: border .2s; }
        .input:focus { border-color: #c8a060; }
        .step-dot { width: 8px; height: 8px; border-radius: 50%; background: #d4c4a8; transition: all .3s; }
        .step-dot.active { background: #1a1209; transform: scale(1.3); }
        .step-dot.done { background: #c8a060; }
        .label { font-family: 'DM Sans', sans-serif; font-size: 11px; letter-spacing: 1.5px; color: #a09080; text-transform: uppercase; margin-bottom: 8px; display: block; }
        .check-circle { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #c8a060, #e8c080); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: white; box-shadow: 0 8px 24px rgba(200,160,96,0.4); }
        .ornament { color: #c8a060; font-size: 20px; letter-spacing: 8px; }
        .social-link { width: 42px; height: 42px; border-radius: 50%; border: 1px solid rgba(200,160,96,0.6); color: #ffffff; display: flex; align-items: center; justify-content: center; transition: all .2s; text-decoration: none; }
        .social-link:hover { background: #ce0909; border-color: #ce0909; transform: translateY(-2px); }
        .address-link { display: inline-flex; align-items: center; gap: 8px; color: #cdbfa8; text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 13px; transition: color .2s; }
        .address-link:hover { color: #ffffff; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade { animation: fadeIn .35s ease; }
        .summary-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0e8dc; font-family: 'DM Sans', sans-serif; font-size: 13px; }
        .tag { background: #f5ede0; color: #a07840; border-radius: 20px; padding: 3px 12px; font-family: 'DM Sans', sans-serif; font-size: 11px; letter-spacing: 1px; display: inline-block; }
      `}</style>

      {/* HEADER */}
      <div style={{
        background: "linear-gradient(135deg, #000000, #000000)",
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
        boxShadow: "0 6px 24px rgba(0,0,0,0.25)",
      }}>
        {/* LEFT: LOGO + BRAND */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 122,
            height: 122,
            borderRadius: 120,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
          }}>
            <img src={logo} alt="Logo barbería" style={{ width: "100%", objectFit: "contain" }} />
          </div>

          <div>
            <div style={{ fontSize: 38, letterSpacing: 4, color: "#ffffff", fontWeight: 600 }}>
              PEREIRA BARBER
            </div>
            <div style={{ fontSize: 15, letterSpacing: 2, color: "#ffffff", fontFamily: "DM Sans" }}>
              RESERVA EN SEGUNDOS
            </div>
          </div>
        </div>

        {/* RIGHT: STEP + PROGRESS */}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#ffffff", fontFamily: "DM Sans", marginBottom: 4 }}>
            Paso {step} de {TOTAL_STEPS}
          </div>

          <div style={{ width: 80, height: 6, background: "#ce0909", borderRadius: 10, overflow: "hidden", marginLeft: "auto" }}>
            <div style={{
              width: `${(step / TOTAL_STEPS) * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg, #ffffff, #ce0909)",
              transition: "width 0.3s ease",
            }} />
          </div>

          <div style={{ display: "flex", gap: 5, marginTop: 6, justifyContent: "flex-end" }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: step === i ? "#fff" : step > i ? "#ce0909" : "#555555",
                transition: "all 0.3s",
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* DECORATIVE BAR */}
      <div style={{ height: 3, background: "#ce0909" }} />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px 60px" }}>

        {/* ── STEP 1: SERVICE ── */}
        {step === 1 && (
          <div className="fade">
            <div style={{ textAlign: "right", marginBottom: 32 }}>
              <div className="ornament"> ✦ </div>
              <h1 style={{ fontSize: 30, fontWeight: 700, marginTop: 12, marginBottom: 8, letterSpacing: 1 }}>"Elige tu experiencia de corte"</h1>
            </div>

            <div className="svc-layout">

              {/* Izquierda: tarjeta de bienvenida */}
              <aside className="welcome">
                <div className="ornament" style={{ textAlign: "center" }}>✦ </div>

                <h2 style={{ fontSize: 26, lineHeight: 1.25, textAlign: "center", color: "#ffffff", margin: "10px 0 14px" }}>
                  Bienvenido a nuestra barbería
                </h2>

                <p style={{ fontFamily: "DM Sans", fontSize: 15, lineHeight: 1.7, color: "#f0e6d6", textAlign: "center" }}>
                  Tu estilo habla por ti y cada detalle cuenta. Aquí cada corte es una expresión de confianza, personalidad y actitud.
                </p>

                <div className="welcome-list">
                  {[
                    { icon: "scissors", title: "Calidad", text: "Cortes precisos y acabados limpios." },
                    { icon: "star", title: "Estilo", text: "Las últimas tendencias, adaptadas a ti." },
                    { icon: "user", title: "Profesionalismo", text: "Atención de barberos con experiencia." },
                  ].map(item => (
                    <div key={item.title} className="welcome-item">
                      <span className="welcome-icon"><Ico n={item.icon} s={18} /></span>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#ffffff" }}>{item.title}</div>
                        <div style={{ fontFamily: "DM Sans", fontSize: 13, color: "#cdbfa8", lineHeight: 1.5 }}>{item.text}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="welcome-foot">
                  <span style={{ color: "#c8a060", display: "flex" }}><Ico n="calendar" s={16} /></span>
                  <span>Atendemos de lunes a sábado. Reserva en menos de un minuto.</span>
                </div>
              </aside>

              {/* Derecha: servicios agrupados por categoría */}
              <div>
                {CATEGORIES.map(cat => (
                  <section key={cat} style={{ marginBottom: 24 }}>
                    <h2 className="cat-title">{cat}</h2>
                    <div role="radiogroup" aria-label={`Servicios de ${cat}`} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {SERVICES.filter(s => s.cat === cat).map(s => {
                        const isSel = selected.service?.id === s.id;
                        const pick = () => setSelected(p => ({ ...p, service: s }));
                        return (
                          <div
                            key={s.id}
                            role="radio"
                            aria-checked={isSel}
                            tabIndex={0}
                            className={`svc ${isSel ? "selected" : ""}`}
                            onClick={pick}
                            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } }}
                          >
                            <span className="svc-check">{isSel && <Ico n="check" s={13} />}</span>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 16, fontWeight: 600 }}>{s.name}</div>
                              <div style={{ fontSize: 13, color: "#6f5d49", fontFamily: "DM Sans", marginTop: 2 }}>{s.desc}</div>
                              <div className="svc-time">
                                <Ico n="clock" s={12} /> {s.duration} min
                              </div>
                            </div>

                            <div className="svc-price">${s.price.toLocaleString()}</div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}

                {/* Barra de acción: resumen + continuar */}
                <div className="action-bar">
                  <div style={{ flex: 1, minWidth: 0, fontFamily: "DM Sans" }}>
                    {selected.service ? (
                      <>
                        <div style={{ fontSize: 14, color: "#ffffff", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {selected.service.name}
                        </div>
                        <div style={{ fontSize: 12, color: "#cdbfa8" }}>
                          {selected.service.duration} min · ${selected.service.price.toLocaleString()}
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: 13, color: "#cdbfa8" }}>Selecciona un servicio para continuar</div>
                    )}
                  </div>
                  <button className="btn-primary" style={{ width: "auto", flexShrink: 0, padding: "12px 24px" }} disabled={!selected.service} onClick={next}>
                    CONTINUAR <Ico n="arrow" s={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: BARBER ── */}
        {step === 2 && (
          <div className="fade" style={{ maxWidth: 560, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div className="ornament">✦ ✦ ✦</div>
              <h1 style={{ fontSize: 30, fontWeight: 700, marginTop: 12, marginBottom: 8, letterSpacing: 1 }}>Elige tu barbero</h1>
              <p style={{ color: "#ffffff", fontFamily: "DM Sans", fontSize: 14 }}>Nuestros profesionales te atenderán</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 260px))", justifyContent: "center", gap: 14, marginBottom: 28 }}>
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
                      border: selected.barber?.id === b.id ? "3px solid #c8a060" : "2px solid #e8ddd0",
                    }}
                  />
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{b.name.split(" ")[0]} {b.name.split(" ")[1]}</div>
                  <div style={{ fontSize: 11, color: "#c8a060", letterSpacing: 1, fontFamily: "DM Sans", textTransform: "uppercase", marginBottom: 6 }}>{b.role}</div>
                  <div style={{ fontSize: 11, color: "#a09080", fontFamily: "DM Sans", marginBottom: 10 }}>{b.exp}</div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {[1, 2, 3, 4, 5].map(i => <span key={i} style={{ color: "#c8a060", fontSize: 10 }}><Ico n="star" s={10} /></span>)}
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
          <div className="fade" style={{ maxWidth: 560, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div className="ornament">✦ ✦ ✦</div>
              <h1 style={{ fontSize: 30, fontWeight: 700, marginTop: 12, marginBottom: 8, letterSpacing: 1 }}>Fecha y hora</h1>
              <p style={{ color: "#8a7560", fontFamily: "DM Sans", fontSize: 14 }}>Selecciona cuándo quieres tu cita</p>
            </div>

            {/* Date picker */}
            <label className="label">Selecciona el día</label>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 24 }}>
              {days.map(d => (
                <div
                  key={d.iso}
                  className={`day-chip ${selected.date === d.iso ? "selected" : ""} ${d.disabled ? "disabled" : ""}`}
                  onClick={() => !d.disabled && setSelected(p => ({ ...p, date: d.iso, time: null }))}
                >
                  <div style={{ fontSize: 9, letterSpacing: 1, fontFamily: "DM Sans", opacity: 0.7, marginBottom: 4 }}>{d.day}</div>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>{d.num}</div>
                  <div style={{ fontSize: 8, fontFamily: "DM Sans", opacity: 0.6, marginTop: 2 }}>{d.month.slice(0, 3)}</div>
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
                    const [slotHours, slotMinutes] = h.split(":").map(Number);
                    const isPastHour =
                      selected.date === todayIso &&
                      (slotHours < now.getHours() || (slotHours === now.getHours() && slotMinutes <= now.getMinutes()));
                    const disabled = taken || isPastHour;
                    return (
                      <div
                        key={h}
                        className={`time-chip ${disabled ? "disabled" : ""} ${selected.time === h ? "selected" : ""}`}
                        onClick={() => !disabled && setSelected(p => ({ ...p, time: h }))}
                      >
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
          <div className="fade" style={{ maxWidth: 560, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div className="ornament">✦ ✦ ✦</div>
              <h1 style={{ fontSize: 30, fontWeight: 700, marginTop: 12, marginBottom: 8, letterSpacing: 1 }}>Tus datos</h1>
              <p style={{ color: "#8a7560", fontFamily: "DM Sans", fontSize: 14 }}>Para confirmar y enviarte el recordatorio</p>
            </div>

            {/* Form */}
            {[
              { label: "Nombre completo *", key: "name", type: "text", icon: "user" },
              { label: "WhatsApp *", key: "phone", type: "tel", icon: "phone" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label className="label">{f.label}</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#c0b0a0" }}><Ico n={f.icon} s={16} /></span>
                  <input
                    type={f.type}
                    className="input"
                    style={{ paddingLeft: 40 }}
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.label.replace(" *", "").replace(" (opcional)", "")}
                  />
                </div>
              </div>
            ))}

            <div style={{ marginBottom: 24 }}>
              <label className="label">Notas adicionales (opcional)</label>
              <textarea
                className="input"
                rows={3}
                style={{ resize: "none" }}
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="¿Alguna preferencia o indicación especial?"
              />
            </div>

            <div style={{ background: "#f5ede0", borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontFamily: "DM Sans", fontSize: 12, color: "#8a7060", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ color: "#c8a060", marginTop: 1 }}><Ico n="wa" s={16} /></span>
              <span>Te enviaremos la confirmación por <strong>WhatsApp</strong> cuando el barbero confirme tu cita.</span>
            </div>

            {error && (
              <div style={{ background: "#fff1f1", border: "1px solid #f5b5b5", color: "#b91c1c", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontFamily: "DM Sans", fontSize: 13 }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-back" onClick={back} disabled={loading}><Ico n="back" s={14} /> Atrás</button>
              <button className="btn-primary" disabled={!form.name || !form.phone || loading} onClick={confirm}>
                {loading ? "ENVIANDO..." : "CONFIRMAR CITA"}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: CONFIRMATION ── */}
        {step === 5 && booked && (
          <div className="fade" style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
            <div style={{ marginBottom: 28, paddingTop: 20 }}>
              <div className="check-circle"><Ico n="check" s={36} /></div>
              <div className="ornament">✦ ✦ ✦</div>
              <h1 style={{ fontSize: 32, fontWeight: 700, marginTop: 12, marginBottom: 8, letterSpacing: 1 }}>¡Cita Confirmada!</h1>
              <p style={{ color: "#8a7560", fontFamily: "DM Sans", fontSize: 14, lineHeight: 1.6 }}>
                Tu cita ha sido agendada exitosamente.<br />Te enviaremos un recordatorio.
              </p>
            </div>

            {/* Confirmation card */}
            <div style={{ background: "white", border: "1.5px solid #e8ddd0", borderRadius: 12, padding: 24, marginBottom: 20, textAlign: "left", boxShadow: "0 8px 32px rgba(200,160,96,0.1)" }}>
              <div style={{ textAlign: "center", marginBottom: 18 }}>
                <div style={{ fontSize: 11, letterSpacing: 3, color: "#c8a060", fontFamily: "DM Sans" }}>PEREIRA BARBER</div>
                <div style={{ fontSize: 11, color: "#a09080", fontFamily: "DM Sans", marginTop: 4 }}>Confirmación #{confirmId}</div>
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
              <div style={{ flex: 1, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: 12, textAlign: "center" }}>
                <div style={{ color: "#22c55e", marginBottom: 4 }}><Ico n="wa" s={20} /></div>
                <div style={{ fontSize: 11, fontFamily: "DM Sans", color: "#16a34a" }}>WhatsApp<br />{form.phone}</div>
              </div>
            </div>

            <div style={{ background: "#fffbf5", border: "1px solid #e8d0a0", borderRadius: 8, padding: "14px 16px", marginBottom: 24, fontFamily: "DM Sans", fontSize: 12, color: "#8a7060", lineHeight: 1.6 }}>
              📋 <strong>Recuerda:</strong> Si necesitas cancelar o reprogramar, contáctanos con al menos 2 horas de anticipación al número de WhatsApp de la barbería.
            </div>

            <button className="btn-primary" onClick={reset}>AGENDAR OTRA CITA</button>
          </div>
        )}
      </div>

      {/* FOOTER */}
           {/* FOOTER */}
      <div style={{ background: "#000000", borderTop: "1px solid #2a2a2a", padding: "28px 24px 18px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 18 }}>
          {SOCIALS.map(s => (
            <a key={s.key} className="social-link" href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}>
              <Ico n={s.key} s={18} />
            </a>
          ))}
        </div>

        <a className="address-link" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
          <span style={{ color: "#c8a060", display: "flex" }}><Ico n="pin" s={16} /></span>
          {ADDRESS}
        </a>

        <div style={{ fontSize: 9, letterSpacing: 3, color: "#ffffff", fontFamily: "DM Sans", marginTop: 20 }}>
          © 2026 PEREIRA BARBER · DESARROLLADO POR YAMPZ SOFTWARE
        </div>
      </div>
    </div>
  );
}
