import emailjs from '@emailjs/browser';

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

// ── WHATSAPP ───────────────────────────────────────────────
export const enviarWhatsApp = async ({ phone, client_name, date, time, service, barber, price }) => {
  try {
    const mensaje = `Hola ${client_name} 👋\n\nTe confirmamos tu cita en *Pereira Barber*:\n\n📅 Fecha: ${date}\n⏰ Hora: ${time}\n✂️ Servicio: ${service}\n👤 Barbero: ${barber}\n💰 Total: $${price}\n\n¡Te esperamos!`;
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.REACT_APP_TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + btoa(`${process.env.REACT_APP_TWILIO_ACCOUNT_SID}:${process.env.REACT_APP_TWILIO_AUTH_TOKEN}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: process.env.REACT_APP_TWILIO_WHATSAPP_NUMBER,
          To: `whatsapp:+57${phone.replace(/\D/g, '')}`,
          Body: mensaje,
        }),
      }
    );
    return response.ok;
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