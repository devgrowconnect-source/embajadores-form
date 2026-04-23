import { put } from "@vercel/blob";
import { Resend } from "resend";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const PARTICIPANTE_LABEL: Record<string, string> = {
  dueno: "Dueño / Administrador",
  dependiente: "Dependiente",
};

const SAT_LABEL: Record<number, string> = {
  1: "Muy insatisfecho", 2: "Insatisfecho", 3: "Neutral",
  4: "Satisfecho", 5: "Muy satisfecho",
};

function buildEmailHtml(data: Record<string, unknown>): string {
  const row = (label: string, value: unknown) =>
    `<tr><td style="padding:8px 12px;color:#555;font-size:13px;border-bottom:1px solid #eee;width:60%">${label}</td><td style="padding:8px 12px;font-weight:600;font-size:13px;border-bottom:1px solid #eee">${value}</td></tr>`;

  const section = (title: string, rows: string) =>
    `<tr><td colspan="2" style="padding:14px 12px 6px;font-weight:700;font-size:14px;background:#f8f8f8;border-bottom:1px solid #ddd">${title}</td></tr>${rows}`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;background:#f0f0f0;padding:32px 16px;margin:0">
  <div style="max-width:580px;margin:0 auto;background:#fff;border:1px solid #ddd">
    <div style="background:#0B1929;padding:20px 24px;display:flex;align-items:center;gap:12px">
      <div>
        <p style="color:#00C46E;font-size:11px;font-weight:700;letter-spacing:.08em;margin:0 0 4px">NUEVA RESPUESTA</p>
        <p style="color:#fff;font-weight:700;font-size:16px;margin:0">Encuesta de Satisfacción</p>
        <p style="color:#4a7a9b;font-size:12px;margin:4px 0 0">Plan Embajadores · ${new Date(data.fechaEnvio as string).toLocaleString("es-CO")}</p>
      </div>
    </div>

    <table style="width:100%;border-collapse:collapse">
      ${section("1. Perfil", row("Tipo de participante", PARTICIPANTE_LABEL[data.participante as string] ?? data.participante))}
      ${section("2. Presentación y mecánica del plan",
        row("Claridad en la explicación", `${data.s2_1} / 5`) +
        row("Facilidad para participar", `${data.s2_2} / 5`) +
        row("Comprensión de reglas y condiciones", `${data.s2_3} / 5`)
      )}
      ${section("3. Equipo y acompañamiento",
        row("Disponibilidad del asesor", `${data.s3_1} / 5`) +
        row("Experiencia del coordinador", `${data.s3_2} / 5`) +
        row("Calidad del servicio al cliente", `${data.s3_3} / 5`)
      )}
      ${section("4. Comunicación y gestión",
        row("Información a tiempo", `${data.s4_1} / 5`) +
        row("Frecuencia de comunicación", `${data.s4_2} / 5`) +
        row("Facilidad para resolver dudas", `${data.s4_3} / 5`)
      )}
      ${section("5. Pagos e incentivos",
        row("Cumplimiento en los pagos", `${data.s5_1} / 5`) +
        row("Claridad en la liquidación", `${data.s5_2} / 5`) +
        row("Atractivo de los incentivos", `${data.s5_3} / 5`)
      )}
      ${section("6. Satisfacción general",
        row("Nivel de satisfacción", SAT_LABEL[data.s6_satisfaccion as number] ?? data.s6_satisfaccion)
      )}
      ${section("7. Comentarios adicionales",
        row("¿Qué más le gusta?", data.s7_1 || "—") +
        row("¿Qué mejoraría?", data.s7_2 || "—") +
        row("Otros comentarios", data.s7_3 || "—")
      )}
    </table>

    <div style="padding:16px 24px;background:#f8f8f8;border-top:1px solid #eee">
      <p style="color:#aaa;font-size:11px;margin:0">© 2025 Plan Embajadores · Enviado automáticamente</p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const results = await Promise.allSettled([
      // ── Vercel Blob ──
      process.env.BLOB_READ_WRITE_TOKEN
        ? put(`respuesta-${Date.now()}.json`, JSON.stringify(data, null, 2), {
            access: "public",
            contentType: "application/json",
            addRandomSuffix: false,
          })
        : Promise.resolve(null),

      // ── Resend email ──
      process.env.RESEND_API_KEY && process.env.NOTIFICATION_EMAIL
        ? new Resend(process.env.RESEND_API_KEY).emails.send({
            from: "Encuesta Plan Embajadores <onboarding@resend.dev>",
            to: process.env.NOTIFICATION_EMAIL,
            subject: `Nueva respuesta – Plan Embajadores (${new Date().toLocaleDateString("es-CO")})`,
            html: buildEmailHtml(data),
          })
        : Promise.resolve(null),
    ]);

    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      failed.forEach((r) => console.error("submit partial error:", (r as PromiseRejectedResult).reason));
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("submit error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
