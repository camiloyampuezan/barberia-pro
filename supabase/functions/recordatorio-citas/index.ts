import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Fecha de mañana
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowISO = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2,'0')}-${String(tomorrow.getDate()).padStart(2,'0')}`;

  // Buscar citas de mañana
  const { data: citas, error } = await supabase
    .from("citas")
    .select("*")
    .eq("date", tomorrowISO)
    .neq("status", "cancelled");

  if (error) return new Response(JSON.stringify({ error }), { status: 500 });
  if (!citas || citas.length === 0) return new Response("No hay citas mañana", { status: 200 });

  const EMAILJS_SERVICE_ID = Deno.env.get("EMAILJS_SERVICE_ID")!;
  const EMAILJS_TEMPLATE_ID = Deno.env.get("EMAILJS_TEMPLATE_ID")!;
  const EMAILJS_PUBLIC_KEY = Deno.env.get("EMAILJS_PUBLIC_KEY")!;
  const OWNER_EMAIL = Deno.env.get("OWNER_EMAIL")!;
  const BARBER_1_EMAIL = Deno.env.get("BARBER_1_EMAIL")!;
  const BARBER_2_EMAIL = Deno.env.get("BARBER_2_EMAIL")!;

  for (const cita of citas) {
    const barberEmail = cita.barber_id === 1 ? BARBER_1_EMAIL : BARBER_2_EMAIL;

    const enviarEmail = async (to_email: string, to_name: string, message: string) => {
      await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            to_email,
            to_name,
            message,
            date: cita.date,
            time: cita.time,
            service: cita.service,
            barber_name: cita.barber_name,
            price: cita.price?.toLocaleString(),
          },
        }),
      });
    };

    // Email al cliente
    if (cita.client_phone) {
      await enviarEmail(
        cita.client_phone,
        cita.client_name,
        `Recuerda que mañana tienes una cita en Pereira Barber.`
      );
    }

    // Email al barbero
    await enviarEmail(
      barberEmail,
      cita.barber_name,
      `Recuerda que mañana tienes una cita. Cliente: ${cita.client_name}`
    );

    // Email al dueño
    await enviarEmail(
      OWNER_EMAIL,
      "Dueño",
      `Recordatorio: mañana hay cita. Cliente: ${cita.client_name} — Barbero: ${cita.barber_name}`
    );
  }

  return new Response(`Recordatorios enviados: ${citas.length} citas`, { status: 200 });
});