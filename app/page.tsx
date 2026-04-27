"use client";

import Image from "next/image";
import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type FormData = {
  participante: "" | "dueno" | "dependiente";
  s2_1: number; s2_2: number; s2_3: number;
  s3_1: number; s3_2: number; s3_3: number;
  s4_1: number; s4_2: number; s4_3: number;
  s5_1: number; s5_2: number; s5_3: number;
  s6_satisfaccion: number;
  s7_1: string; s7_2: string; s7_3: string;
  s8_contacto: string[];
  s9_apoyo_reportes: "" | "si" | "no";
};

const INITIAL: FormData = {
  participante: "",
  s2_1: 0, s2_2: 0, s2_3: 0,
  s3_1: 0, s3_2: 0, s3_3: 0,
  s4_1: 0, s4_2: 0, s4_3: 0,
  s5_1: 0, s5_2: 0, s5_3: 0,
  s6_satisfaccion: 0,
  s7_1: "", s7_2: "", s7_3: "",
  s8_contacto: [],
  s9_apoyo_reportes: "",
};

const CONTACTO_OPTIONS = [
  { val: "telefono", label: "Teléfono" },
  { val: "whatsapp", label: "WhatsApp" },
  { val: "correo", label: "Correo electrónico" },
  { val: "presencial", label: "Presencial" },
];

const SAT_OPTIONS = [
  { val: 5, label: "Muy satisfecho" },
  { val: 4, label: "Satisfecho" },
  { val: 3, label: "Neutral" },
  { val: 2, label: "Insatisfecho" },
  { val: 1, label: "Muy insatisfecho" },
];

function RatingScale({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="rating-row">
      <span className="rating-tag">Malo</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={`rating-btn${value === n ? " active" : ""}`}>
          {n}
        </button>
      ))}
      <span className="rating-tag right">Excelente</span>
    </div>
  );
}

function Question({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="q-label">{label}</p>
      {children}
    </div>
  );
}

function SectionTitle({ title, complete }: { title: string; complete: boolean }) {
  return (
    <div className="section-title-row">
      <p className="section-title">{title}</p>
      {complete && (
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="8.5" cy="8.5" r="8" stroke="var(--accent)" />
          <path d="M5.5 8.8L7.5 10.8L11.5 6.2" stroke="var(--accent)" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

function CharCount({ value, max = 500 }: { value: string; max?: number }) {
  return <p className="char-count">{value.length} / {max}</p>;
}

export default function EncuestaPage() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const router = useRouter();

  const set = useCallback(<K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  }, []);

  const toggleContacto = useCallback((val: string) => {
    setForm((prev) => ({
      ...prev,
      s8_contacto: prev.s8_contacto.includes(val)
        ? prev.s8_contacto.filter((v) => v !== val)
        : [...prev.s8_contacto, val],
    }));
  }, []);

  // Section completion flags
  const c1 = form.participante !== "";
  const c2 = form.s2_1 > 0 && form.s2_2 > 0 && form.s2_3 > 0;
  const c3 = form.s3_1 > 0 && form.s3_2 > 0 && form.s3_3 > 0;
  const c4 = form.s4_1 > 0 && form.s4_2 > 0 && form.s4_3 > 0;
  const c5 = form.s5_1 > 0 && form.s5_2 > 0 && form.s5_3 > 0;
  const c6 = form.s6_satisfaccion > 0;
  const c7 = form.s7_1.trim() !== "" && form.s7_2.trim() !== "" && form.s7_3.trim() !== "";
  const c8 = form.s8_contacto.length > 0 && form.s9_apoyo_reportes !== "";

  const requiredRatings: (keyof FormData)[] = [
    "s2_1","s2_2","s2_3","s3_1","s3_2","s3_3",
    "s4_1","s4_2","s4_3","s5_1","s5_2","s5_3","s6_satisfaccion",
  ];

  const totalRequired = requiredRatings.length + 3;
  const filled =
    (c1 ? 1 : 0) +
    requiredRatings.filter((k) => (form[k] as number) > 0).length +
    (form.s8_contacto.length > 0 ? 1 : 0) +
    (form.s9_apoyo_reportes !== "" ? 1 : 0);
  const progress = Math.round((filled / totalRequired) * 100);

  const isValid = c1 && c2 && c3 && c4 && c5 && c6 && c7 && c8;

  // Auto-scroll to next section when a section is completed
  const prev = useRef({ c1, c2, c3, c4, c5, c6, c7, c8 });
  useEffect(() => {
    const pairs: [boolean, boolean, number][] = [
      [c1, prev.current.c1, 2],
      [c2, prev.current.c2, 3],
      [c3, prev.current.c3, 4],
      [c4, prev.current.c4, 5],
      [c5, prev.current.c5, 6],
      [c6, prev.current.c6, 7],
      [c7, prev.current.c7, 8],
    ];
    for (const [curr, was, nextId] of pairs) {
      if (curr && !was) {
        const el = document.getElementById(`section-${nextId}`);
        if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 130);
        break;
      }
    }
    prev.current = { c1, c2, c3, c4, c5, c6, c7, c8 };
  }, [c1, c2, c3, c4, c5, c6, c7, c8]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      setShowErrors(true);
      setError("Por favor completa tu perfil, todas las calificaciones y los comentarios adicionales.");
      const incomplete = [
        { id: "section-1", ok: c1 },
        { id: "section-2", ok: c2 },
        { id: "section-3", ok: c3 },
        { id: "section-4", ok: c4 },
        { id: "section-5", ok: c5 },
        { id: "section-6", ok: c6 },
        { id: "section-7", ok: c7 },
        { id: "section-8", ok: c8 },
      ].find((s) => !s.ok);
      if (incomplete) {
        document.getElementById(incomplete.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }
    setError("");
    setShowErrors(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, fechaEnvio: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error("server error");
      router.push("/gracias");
    } catch {
      setError("Hubo un problema al enviar. Por favor intenta de nuevo.");
      setSubmitting(false);
    }
  }

  const card = (ok: boolean) => `card${showErrors && !ok ? " card--error" : ""}`;

  return (
    <main style={{ background: "var(--page-bg)", minHeight: "100vh" }}>

      {/* ── Navbar ── */}
      <nav style={{ background: "var(--navy)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <Image src="/logo.jpeg" alt="Plan Embajadores" width={32} height={32} style={{ borderRadius: 4, objectFit: "cover" }} />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.04em" }}>
            PLAN EMBAJADORES
          </span>
        </div>
        <div style={{ height: 3, background: "rgba(255,255,255,0.1)" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent)", transition: "width 0.4s ease" }} />
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 20px 20px" }}>
        <p style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
          Encuesta de Satisfacción
        </p>
        <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          Tu opinión es fundamental para seguir fortaleciendo nuestra alianza estratégica.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px 60px", display: "flex", flexDirection: "column", gap: 12 }}
      >

        {/* ── 1. Perfil ── */}
        <div id="section-1" className={card(c1)}>
          <SectionTitle title="Perfil del participante" complete={c1} />
          <p className="section-sub">Seleccione su rol actual dentro del establecimiento.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {([
              { val: "dueno", label: "Dueño / Administrador" },
              { val: "dependiente", label: "Dependiente" },
            ] as const).map(({ val, label }) => (
              <button key={val} type="button" onClick={() => set("participante", val)}
                className={`radio-option${form.participante === val ? " active" : ""}`}>
                <span className="radio-dot">
                  {form.participante === val && <span className="radio-dot-inner" />}
                </span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 2. Presentación ── */}
        <div id="section-2" className={card(c2)}>
          <SectionTitle title="Presentación y mecánica del plan" complete={c2} />
          <p className="section-sub">Califique de 1 (Malo) a 5 (Excelente) los siguientes aspectos.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <Question label="¿Qué tan clara fue la explicación inicial del plan?">
              <RatingScale value={form.s2_1} onChange={(v) => set("s2_1", v)} />
            </Question>
            <hr className="q-divider" />
            <Question label="¿Qué tan fácil es participar en el plan de beneficios?">
              <RatingScale value={form.s2_2} onChange={(v) => set("s2_2", v)} />
            </Question>
            <hr className="q-divider" />
            <Question label="¿Comprende claramente las reglas y condiciones?">
              <RatingScale value={form.s2_3} onChange={(v) => set("s2_3", v)} />
            </Question>
          </div>
        </div>

        {/* ── 3. Equipo ── */}
        <div id="section-3" className={card(c3)}>
          <SectionTitle title="Equipo y acompañamiento" complete={c3} />
          <p className="section-sub">Califique de 1 (Malo) a 5 (Excelente) el soporte recibido.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <Question label="Disponibilidad de su asesor asignado">
              <RatingScale value={form.s3_1} onChange={(v) => set("s3_1", v)} />
            </Question>
            <hr className="q-divider" />
            <Question label="Experiencia y conocimiento del coordinador">
              <RatingScale value={form.s3_2} onChange={(v) => set("s3_2", v)} />
            </Question>
            <hr className="q-divider" />
            <Question label="Calidad del servicio al cliente">
              <RatingScale value={form.s3_3} onChange={(v) => set("s3_3", v)} />
            </Question>
          </div>
        </div>

        {/* ── 4. Comunicación ── */}
        <div id="section-4" className={card(c4)}>
          <SectionTitle title="Comunicación y gestión" complete={c4} />
          <p className="section-sub">Frecuencia y calidad de la información compartida.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <Question label="¿Recibe la información sobre cambios y novedades a tiempo?">
              <RatingScale value={form.s4_1} onChange={(v) => set("s4_1", v)} />
            </Question>
            <hr className="q-divider" />
            <Question label="¿Con qué frecuencia se comunica el equipo con usted?">
              <RatingScale value={form.s4_2} onChange={(v) => set("s4_2", v)} />
            </Question>
            <hr className="q-divider" />
            <Question label="¿Qué tan fácil es resolver sus dudas con el equipo?">
              <RatingScale value={form.s4_3} onChange={(v) => set("s4_3", v)} />
            </Question>
          </div>
        </div>

        {/* ── 5. Pagos ── */}
        <div id="section-5" className={card(c5)}>
          <SectionTitle title="Pagos e incentivos" complete={c5} />
          <p className="section-sub">Evaluación de la puntualidad y monto de incentivos.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <Question label="Cumplimiento en los pagos">
              <RatingScale value={form.s5_1} onChange={(v) => set("s5_1", v)} />
            </Question>
            <hr className="q-divider" />
            <Question label="Claridad en la liquidación de incentivos">
              <RatingScale value={form.s5_2} onChange={(v) => set("s5_2", v)} />
            </Question>
            <hr className="q-divider" />
            <Question label="Atractivo de los incentivos ofrecidos">
              <RatingScale value={form.s5_3} onChange={(v) => set("s5_3", v)} />
            </Question>
          </div>
        </div>

        {/* ── 6. Impacto ── */}
        <div id="section-6" className={card(c6)}>
          <SectionTitle title="Impacto del plan" complete={c6} />
          <p className="section-sub">Nivel de satisfacción general con el programa.</p>
          <div className="sat-bar" />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-light)" }}>Muy insatisfecho</span>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-light)" }}>Muy satisfecho</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {SAT_OPTIONS.map(({ val, label }) => (
              <button key={val} type="button" onClick={() => set("s6_satisfaccion", val)}
                className={`sat-option${form.s6_satisfaccion === val ? " active" : ""}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 7. Abiertas ── */}
        <div id="section-7" className={card(c7)}>
          <SectionTitle title="Comentarios adicionales" complete={c7} />
          <p className="section-sub">Sus sugerencias nos ayudan a mejorar continuamente.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <p className="q-label">¿Qué es lo que más le gusta del Plan Embajadores? <span style={{ color: "var(--accent)" }}>*</span></p>
              <textarea className="open-textarea" placeholder="Escriba su respuesta aquí..."
                value={form.s7_1} onChange={(e) => set("s7_1", e.target.value)} maxLength={500} />
              <CharCount value={form.s7_1} />
            </div>
            <div>
              <p className="q-label">¿Qué aspectos cree que deberíamos mejorar? <span style={{ color: "var(--accent)" }}>*</span></p>
              <textarea className="open-textarea" placeholder="Escriba su respuesta aquí..."
                value={form.s7_2} onChange={(e) => set("s7_2", e.target.value)} maxLength={500} />
              <CharCount value={form.s7_2} />
            </div>
            <div>
              <p className="q-label">Otros comentarios o sugerencias <span style={{ color: "var(--accent)" }}>*</span></p>
              <textarea className="open-textarea" placeholder="Escriba su respuesta aquí..."
                value={form.s7_3} onChange={(e) => set("s7_3", e.target.value)} maxLength={500} />
              <CharCount value={form.s7_3} />
            </div>
          </div>
        </div>

        {/* ── 8. Preferencias ── */}
        <div id="section-8" className={card(c8)}>
          <SectionTitle title="Preferencias de atención" complete={c8} />
          <p className="section-sub">Ayúdenos a mejorar la forma en que nos comunicamos con usted.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            <div>
              <p className="q-label">
                ¿Por qué medio le gustaría recibir la atención del plan?{" "}
                <span style={{ color: "var(--accent)" }}>*</span>
              </p>
              <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginBottom: 10 }}>
                Puede seleccionar más de una opción.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {CONTACTO_OPTIONS.map(({ val, label }) => {
                  const active = form.s8_contacto.includes(val);
                  return (
                    <button key={val} type="button" onClick={() => toggleContacto(val)}
                      className={`check-option${active ? " active" : ""}`}>
                      <span className="check-box">
                        {active && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="q-divider" style={{ margin: "4px 0" }} />

            <div>
              <p className="q-label">
                ¿Le gustaría tener a una persona del equipo que lo apoye en la descarga de los reportes de ventas mes a mes?{" "}
                <span style={{ color: "var(--accent)" }}>*</span>
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {([{ val: "si", label: "Sí" }, { val: "no", label: "No" }] as const).map(({ val, label }) => (
                  <button key={val} type="button" onClick={() => set("s9_apoyo_reportes", val)}
                    className={`radio-option${form.s9_apoyo_reportes === val ? " active" : ""}`}>
                    <span className="radio-dot">
                      {form.s9_apoyo_reportes === val && <span className="radio-dot-inner" />}
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <button type="submit" disabled={submitting} className="submit-btn">
          {submitting ? "Enviando..." : "Enviar encuesta →"}
        </button>
      </form>

      {/* ── Footer ── */}
      <footer style={{ background: "var(--navy)", padding: "28px 20px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
          <Image src="/logo.jpeg" alt="Plan Embajadores" width={28} height={28} style={{ borderRadius: 4, objectFit: "cover" }} />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.04em" }}>PLAN EMBAJADORES</span>
        </div>
        <p style={{ color: "#4a6a8a", fontSize: "0.72rem", letterSpacing: "0.04em" }}>
          © 2025 PLAN EMBAJADORES · TODOS LOS DERECHOS RESERVADOS
        </p>
      </footer>
    </main>
  );
}
