import emailjs from '@emailjs/browser';
import { supabase } from './supabase';

// ── EMAIL GENÉRICO ─────────────────────────────────────────
const enviarEmailA = async ({ to_email, to_name, message, date, time, service, barber_name, price }) => {
  try {
    await emailjs.send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID,
      process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
      { to_email, to_name, message, date, time, service, barber_name, price },
      process.env.REACT_APP_EMAILJS_PUBLIC_KEY
    );
    return true;
  } catch (error) {
    console.error('Error enviando email a', to_email, error);
    return false;
  }
};

// ── WHATSAPP (API de Meta, vía Supabase Edge Function) ─────
export const enviarWhatsApp = async ({ phone, client_name, date, time, service, barber, price }) => {
  try {
    const { data, error } = await supabase.functions.invoke('enviar-whatsapp', {
      body: { phone, client_name, date, time, service, barber, price },
    });
    if (error) throw error;
    return !data?.error;
  } catch (error) {
    console.error('Error enviando WhatsApp:', error);
    return false;
  }
};

// ── ENVIAR A TODOS ─────────────────────────────────────────
export const enviarNotificaciones = async ({ client_name, phone, email, date, time, service, barber, barber_email, price }) => {

  const promises = [];

  // 1. Email al cliente
  if (email) {
    promises.push(enviarEmailA({
      to_email: email,
      to_name: client_name,
      message: `Te confirmamos tu cita en Pereira Barber.`,
      date, time, service, barber_name: barber, price
    }));
  }

  // 2. Email al barbero
  if (barber_email) {
    promises.push(enviarEmailA({
      to_email: barber_email,
      to_name: barber,
      message: `Tienes una nueva cita asignada. Cliente: ${client_name} — WhatsApp: ${phone}`,
      date, time, service, barber_name: barber, price
    }));
  }

  // 3. Email al dueño
  promises.push(enviarEmailA({
    to_email: process.env.REACT_APP_OWNER_EMAIL,
    to_name: 'Dueño',
    message: `Nueva cita agendada. Cliente: ${client_name} — WhatsApp: ${phone}`,
    date, time, service, barber_name: barber, price
  }));

  // 4. WhatsApp al cliente
  if (phone) {
    promises.push(enviarWhatsApp({ phone, client_name, date, time, service, barber, price }));
  }

  await Promise.all(promises);
 
};
 // ── CONFIRMACIÓN DE CITA ───────────────────────────────────
export const enviarConfirmacionCita = async ({ client_name, email, phone, date, time, service, barber, price }) => {
  await enviarEmailA({
    to_email: email,
    to_name: client_name,
    message: `¡Tu cita ha sido confirmada! Te esperamos en Pereira Barber.`,
    date, time, service, barber_name: barber, price
  });
};

// ── CANCELACIÓN DE CITA ────────────────────────────────────
export const enviarCancelacionCita = async ({ client_name, email, phone, date, time, service, barber, price, motivo }) => {
  await enviarEmailA({
    to_email: email,
    to_name: client_name,
    message: `Tu cita ha sido cancelada. Motivo: ${motivo}. Disculpa los inconvenientes, puedes reagendar cuando quieras.`,
    date, time, service, barber_name: barber, price
  });
};