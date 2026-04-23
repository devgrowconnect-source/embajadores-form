"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type FormData = {
  participante: "" | "dueno" | "dependiente";
  s2_1: number; s2_2: number; s2_3: number;
  s3_1: number; s3_2: number; s3_3: number;
  s4_1: number; s4_2: number; s4_3: number;
  s5_1: number; s5_2: number; s5_3: number;
  s6_satisfaccion: number;
  s7_1: string; s7_2: string; s7_3: string;
};

const INITIAL: FormData = {
  participante: "",
  s2_1: 0, s2_2: 0, s2_3: 0,
  s3_1: 0, s3_2: 0, s3_3: 0,
  s4_1: 0, s4_2: 0, s4_3: 0,
  s5_1: 0, s5_2: 0, s5_3: 0,
  s6_satisfaccion: 0,
  s7_1: "", s7_2: "", s7_3: "",
};

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
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`rating-btn${value === n ? " active" : ""}`}
        >
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

export default function EncuestaPage() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const set = useCallback(<K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  }, []);

  const requiredRatings: (keyof FormData)[] = [
    "s2_1","s2_2","s2_3","s3_1","s3_2","s3_3",
    "s4_1","s4_2","s4_3","s5_1","s5_2","s5_3","s6_satisfaccion",
  ];

  const totalRequired = requiredRatings.length + 1; // +1 for participante
  const filled =
    (form.participante !== "" ? 1 : 0) +
    requiredRatings.filter((k) => (form[k] as number) > 0).length;
  const progress = Math.round((filled / totalRequired) * 100);

  const isValid =
    form.participante !== "" &&
    requiredRatings.every((k) => (form[k] as number) > 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      setError("Por favor completa tu perfil y todas las preguntas de calificación.");
      return;
    }
    setError("");
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
        {/* Progress bar */}
        <div style={{ height: 3, background: "rgba(255,255,255,0.1)" }}>
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "var(--accent)",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 20px 20px" }}>
        <p style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
          Encuesta de Satisfacción
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px 60px", display: "flex", flexDirection: "column", gap: 12 }}
      >

        {/* ── 1. Perfil ── */}
        <div className="card">
          <p className="section-title">Perfil del participante</p>
          <p className="section-sub">Seleccione su rol actual dentro del establecimiento.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {([
              { val: "dueno", label: "Dueño / Administrador" },
              { val: "dependiente", label: "Dependiente" },
            ] as const).map(({ val, label }) => (
              <button
                key={val}
                type="button"
                onClick={() => set("participante", val)}
                className={`radio-option${form.participante === val ? " active" : ""}`}
              >
                <span className="radio-dot">
                  {form.participante === val && <span className="radio-dot-inner" />}
                </span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 2. Presentación ── */}
        <div className="card">
          <p className="section-title">Presentación y mecánica del plan</p>
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
        <div className="card">
          <p className="section-title">Equipo y acompañamiento</p>
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
        <div className="card">
          <p className="section-title">Comunicación y gestión</p>
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
        <div className="card">
          <p className="section-title">Pagos e incentivos</p>
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
        <div className="card">
          <p className="section-title">Impacto del plan</p>
          <p className="section-sub">Nivel de satisfacción general con el programa.</p>
          <div className="sat-bar" />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-light)" }}>Muy insatisfecho</span>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-light)" }}>Muy satisfecho</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {SAT_OPTIONS.map(({ val, label }) => (
              <button
                key={val}
                type="button"
                onClick={() => set("s6_satisfaccion", val)}
                className={`sat-option${form.s6_satisfaccion === val ? " active" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 7. Abiertas ── */}
        <div className="card">
          <p className="section-title">Comentarios adicionales</p>
          <p className="section-sub">Sus sugerencias nos ayudan a mejorar continuamente.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <p className="q-label">¿Qué es lo que más le gusta del Plan Embajadores?</p>
              <textarea
                className="open-textarea"
                placeholder="Escriba su respuesta aquí..."
                value={form.s7_1}
                onChange={(e) => set("s7_1", e.target.value)}
              />
            </div>
            <div>
              <p className="q-label">¿Qué aspectos cree que deberíamos mejorar?</p>
              <textarea
                className="open-textarea"
                placeholder="Escriba su respuesta aquí..."
                value={form.s7_2}
                onChange={(e) => set("s7_2", e.target.value)}
              />
            </div>
            <div>
              <p className="q-label">Otros comentarios o sugerencias</p>
              <textarea
                className="open-textarea"
                placeholder="Escriba su respuesta aquí..."
                value={form.s7_3}
                onChange={(e) => set("s7_3", e.target.value)}
              />
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
