// Envía confirmaciones de cita por WhatsApp usando la API de Meta (Cloud API).
// El token vive como secreto en Supabase, nunca en el navegador.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { phone, client_name, date, time, service, barber, price } = await req.json();

    const token = Deno.env.get("WHATSAPP_TOKEN")!;
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")!;
    const template = Deno.env.get("WHATSAPP_TEMPLATE_NAME") ?? "confirmacion_cita";
    const lang = Deno.env.get("WHATSAPP_TEMPLATE_LANG") ?? "es";

    // Colombia: agrega 57 si el número viene de 10 dígitos
    let to = String(phone ?? "").replace(/\D/g, "");
    if (to.length === 10) to = "57" + to;
    if (!to) return json({ error: "Teléfono inválido" }, 400);

    const p = (text: unknown) => ({ type: "text", text: String(text ?? "-") });

    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: template,
          language: { code: lang },
          components: [
            {
              type: "body",
              parameters: [
                p(client_name), p(date), p(time), p(service), p(barber), p(price),
              ],
            },
          ],
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) console.error("Meta error:", JSON.stringify(data));
    return json(data, res.ok ? 200 : 502);
  } catch (e) {
    console.error(e);
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
