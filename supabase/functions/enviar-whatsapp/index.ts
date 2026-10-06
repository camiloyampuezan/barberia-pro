// Envía la confirmación de cita por WhatsApp (API de Meta).
// El token vive como secreto en Supabase, nunca en el navegador.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { cita_id } = await req.json();
    if (!cita_id) return json({ error: "Falta cita_id" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: cita, error } = await supabase
      .from("citas")
      .select("client_name, client_phone, date, time, service, barber_name, price, status, confirmacion_enviada")
      .eq("id", cita_id)
      .single();

    if (error || !cita) return json({ error: "Cita no encontrada" }, 404);
    if (cita.status !== "confirmed") return json({ error: "La cita no está confirmada" }, 403);
    if (cita.confirmacion_enviada) return json({ ok: true, ya_enviado: true });

    // Colombia: agrega 57 si el número viene de 10 dígitos
    let to = String(cita.client_phone ?? "").replace(/\D/g, "");
    if (to.length === 10) to = "57" + to;
    if (!to) return json({ error: "Teléfono inválido" }, 400);

    const p = (t: unknown) => ({ type: "text", text: String(t ?? "-") });
    const precio = Number(cita.price ?? 0).toLocaleString("es-CO");

    const res = await fetch(
      `https://graph.facebook.com/v21.0/${Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("WHATSAPP_TOKEN")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: {
            name: "confirmacion_cita",
            language: { code: "es_CO" },
            components: [{
              type: "body",
              parameters: [
                p(cita.client_name), p(cita.date), p(cita.time),
                p(cita.service), p(cita.barber_name), p(precio),
              ],
            }],
          },
        }),
      },
    );

    const data = await res.json();
    if (!res.ok) {
      console.error("Meta error:", JSON.stringify(data));
      return json({ error: data }, 502);
    }

    await supabase.from("citas").update({ confirmacion_enviada: true }).eq("id", cita_id);
    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ error: String(e) }, 500);
  }
});