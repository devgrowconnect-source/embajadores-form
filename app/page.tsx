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

const SAT_LABELS: Record<number, string> = {
  1: "Muy insatisfecho", 2: "Insatisfecho", 3: "Neutral",
  4: "Satisfecho", 5: "Muy satisfecho",
};

function RatingScale({ value, onChange, labels }: {
  value: number;
  onChange: (v: number) => void;
  labels?: Record<number, string>;
}) {
  return (
    <div className="flex flex-wrap gap-3 mt-3">
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n} className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => onChange(n)}
            className={`rating-btn${value === n ? " selected" : ""}`}
          >
            {n}
          </button>
          {labels && (
            <span className="text-xs text-center leading-tight" style={{ color: "#4a6a8a", maxWidth: 68 }}>
              {labels[n]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="section-badge">{number}</div>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
    </div>
  );
}

function Q({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-4">
      <p className="text-sm font-medium" style={{ color: "#94a3b8" }}>{label}</p>
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
    <main style={{ background: "var(--bg-dark)", minHeight: "100vh" }}>
      {/* Sticky header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-sm"
        style={{ borderBottom: "1px solid var(--border-color)", background: "rgba(9,24,42,0.95)" }}
      >
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Image src="/logo.jpeg" alt="Plan Embajadores" width={44} height={44} className="rounded-lg object-cover" />
          <div>
            <p className="font-bold text-sm leading-tight text-white">PLAN EMBAJADORES</p>
            <p className="text-xs leading-tight" style={{ color: "#4a7a9b" }}>Conquistando el Punto de Venta</p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
          <span className="gradient-text">Encuesta de Satisfacción</span>
        </h1>
        <p className="text-base max-w-lg mx-auto" style={{ color: "#64849e" }}>
          Tu opinión nos ayuda a mejorar el Plan Embajadores. La encuesta toma menos de 3 minutos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 pb-16 flex flex-col gap-6">

        {/* 1 – Perfil */}
        <div className="section-card">
          <SectionHeader number="1" title="Perfil del participante" />
          <p className="text-sm mb-4" style={{ color: "#94a3b8" }}>¿Cuál es tu rol en el negocio?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([
              { val: "dueno", label: "Dueño / Administrador" },
              { val: "dependiente", label: "Dependiente" },
            ] as const).map(({ val, label }) => (
              <button
                key={val}
                type="button"
                onClick={() => set("participante", val)}
                className={`participant-radio${form.participante === val ? " selected" : ""}`}
              >
                <span
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{
                    borderColor: form.participante === val ? "#00c46e" : "#1a3554",
                    background: form.participante === val ? "#00c46e" : "transparent",
                  }}
                >
                  {form.participante === val && <span className="w-2 h-2 rounded-full bg-white block" />}
                </span>
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2 – Presentación */}
        <div className="section-card">
          <SectionHeader number="2" title="Presentación y mecánica del plan de beneficios" />
          <p className="text-xs mb-1" style={{ color: "#4a6a8a" }}>Califica del 1 al 5 &nbsp;·&nbsp; 1 = muy bajo &nbsp;·&nbsp; 5 = excelente</p>
          <Q label="2.1 Claridad en la explicación del plan de beneficios">
            <RatingScale value={form.s2_1} onChange={(v) => set("s2_1", v)} />
          </Q>
          <hr className="divider" />
          <Q label="2.2 Facilidad para participar en el plan de beneficios">
            <RatingScale value={form.s2_2} onChange={(v) => set("s2_2", v)} />
          </Q>
          <hr className="divider" />
          <Q label="2.3 Comprensión en las reglas y condiciones">
            <RatingScale value={form.s2_3} onChange={(v) => set("s2_3", v)} />
          </Q>
        </div>

        {/* 3 – Equipo */}
        <div className="section-card">
          <SectionHeader number="3" title="Equipo y acompañamiento" />
          <p className="text-xs mb-1" style={{ color: "#4a6a8a" }}>Califica del 1 al 5 &nbsp;·&nbsp; 1 = muy bajo &nbsp;·&nbsp; 5 = excelente</p>
          <Q label="3.1 Gestión del transferencista">
            <RatingScale value={form.s3_1} onChange={(v) => set("s3_1", v)} />
          </Q>
          <hr className="divider" />
          <Q label="3.2 Experiencia del coordinador">
            <RatingScale value={form.s3_2} onChange={(v) => set("s3_2", v)} />
          </Q>
          <hr className="divider" />
          <Q label="3.3 Servicio al cliente">
            <RatingScale value={form.s3_3} onChange={(v) => set("s3_3", v)} />
          </Q>
        </div>

        {/* 4 – Comunicación */}
        <div className="section-card">
          <SectionHeader number="4" title="Comunicación y gestión" />
          <p className="text-xs mb-1" style={{ color: "#4a6a8a" }}>Califica del 1 al 5 &nbsp;·&nbsp; 1 = muy bajo &nbsp;·&nbsp; 5 = excelente</p>
          <Q label="4.1 Claridad de la información (cambios, novedades)">
            <RatingScale value={form.s4_1} onChange={(v) => set("s4_1", v)} />
          </Q>
          <hr className="divider" />
          <Q label="4.2 Frecuencia de comunicación">
            <RatingScale value={form.s4_2} onChange={(v) => set("s4_2", v)} />
          </Q>
          <hr className="divider" />
          <Q label="4.3 Facilidad para resolver dudas">
            <RatingScale value={form.s4_3} onChange={(v) => set("s4_3", v)} />
          </Q>
        </div>

        {/* 5 – Pagos */}
        <div className="section-card">
          <SectionHeader number="5" title="Pagos e incentivos" />
          <p className="text-xs mb-1" style={{ color: "#4a6a8a" }}>Califica del 1 al 5 &nbsp;·&nbsp; 1 = muy bajo &nbsp;·&nbsp; 5 = excelente</p>
          <Q label="5.1 Cumplimiento en los pagos">
            <RatingScale value={form.s5_1} onChange={(v) => set("s5_1", v)} />
          </Q>
          <hr className="divider" />
          <Q label="5.2 Claridad en la liquidación de incentivos">
            <RatingScale value={form.s5_2} onChange={(v) => set("s5_2", v)} />
          </Q>
          <hr className="divider" />
          <Q label="5.3 Atractivo de los incentivos">
            <RatingScale value={form.s5_3} onChange={(v) => set("s5_3", v)} />
          </Q>
        </div>

        {/* 6 – Impacto */}
        <div className="section-card">
          <SectionHeader number="6" title="Impacto del plan" />
          <Q label="6.1 En general, ¿qué tan satisfecho estás con el Plan Embajadores?">
            <RatingScale value={form.s6_satisfaccion} onChange={(v) => set("s6_satisfaccion", v)} labels={SAT_LABELS} />
          </Q>
        </div>

        {/* 7 – Abiertas */}
        <div className="section-card">
          <SectionHeader number="7" title="Preguntas abiertas" />
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>
                7.1 ¿Qué es lo que más valoras del Plan Embajadores?
              </p>
              <textarea
                className="open-textarea"
                placeholder="Escribe tu respuesta aquí..."
                value={form.s7_1}
                onChange={(e) => set("s7_1", e.target.value)}
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>
                7.2 ¿Qué es lo que menos te gusta o te genera dificultad en el plan?
              </p>
              <textarea
                className="open-textarea"
                placeholder="Escribe tu respuesta aquí..."
                value={form.s7_2}
                onChange={(e) => set("s7_2", e.target.value)}
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>
                7.3 Si pudieras mejorar una sola cosa del plan, ¿cuál sería?
              </p>
              <textarea
                className="open-textarea"
                placeholder="Escribe tu respuesta aquí..."
                value={form.s7_3}
                onChange={(e) => set("s7_3", e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && (
          <div
            className="rounded-xl px-5 py-4 text-sm"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="gradient-btn w-full py-4 rounded-2xl text-white font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Enviando..." : "Enviar encuesta →"}
        </button>
      </form>
    </main>
  );
}
