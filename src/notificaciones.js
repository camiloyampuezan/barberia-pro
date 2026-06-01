import emailjs from '@emailjs/browser';

// ── EMAIL ──────────────────────────────────────────
export const enviarEmail = async ({ client_name, email, date, time, service, barber, price }) => {
  try {
    await emailjs.send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID,
      process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
      { client_name, email, date, time, service, barber, price },
      process.env.REACT_APP_EMAILJS_PUBLIC_KEY
    );
    console.log('Email enviado correctamente');
    return true;
  } catch (error) {
    console.error('Error enviando email:', error);
    return false;
  }
};

// ── WHATSAPP ───────────────────────────────────────
export const enviarWhatsApp = async ({ phone, client_name, date, time, service, barber, price }) => {
  try {
    const mensaje = `Hola ${client_name} 👋\n\nTe confirmamos tu cita en *Barbería Pro*:\n\n📅 Fecha: ${date}\n⏰ Hora: ${time}\n✂️ Servicio: ${service}\n👤 Barbero: ${barber}\n💰 Total: $${price}\n\n¡Te esperamos!`;

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

    if (response.ok) {
      console.log('WhatsApp enviado correctamente');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error enviando WhatsApp:', error);
    return false;
  }
};

// ── ENVIAR AMBOS ───────────────────────────────────
export const enviarNotificaciones = async (datos) => {
  const resultados = await Promise.all([
    enviarWhatsApp(datos),
    datos.email ? enviarEmail(datos) : Promise.resolve(false),
  ]);
  return { whatsapp: resultados[0], email: resultados[1] };
};