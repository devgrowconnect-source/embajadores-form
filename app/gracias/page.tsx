import Image from "next/image";
import Link from "next/link";

export default function GraciasPage() {
  return (
    <main style={{ background: "var(--page-bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <nav style={{ background: "var(--navy)", borderBottom: "3px solid var(--accent)" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <Image src="/logo.jpeg" alt="Plan Embajadores" width={32} height={32} style={{ borderRadius: 4, objectFit: "cover" }} />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.04em" }}>
            PLAN EMBAJADORES
          </span>
        </div>
      </nav>

      {/* Content */}
      <div className="slide-up" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", textAlign: "center" }}>
        {/* Check icon — circle style from Figma */}
        <svg
          width="72"
          height="72"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ marginBottom: 28 }}
        >
          <circle cx="12" cy="12" r="12" fill="#00C46E" />
          <path
            d="M8.5 12l2.5 2.5L16.5 9"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <p style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
          Encuesta completada
        </p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: 12, letterSpacing: "-0.02em" }}>
          ¡Gracias por tu respuesta!
        </h1>
        <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6, maxWidth: 340, marginBottom: 36 }}>
          Tu opinión fue registrada exitosamente. Nos ayuda a seguir mejorando el Plan Embajadores.
        </p>

        <Link
          href="/"
          style={{
            display: "inline-block", padding: "12px 28px",
            border: "1px solid var(--border)", background: "#fff",
            color: "var(--text-mid)", fontSize: "0.85rem", fontWeight: 600,
            textDecoration: "none", letterSpacing: "0.02em",
            transition: "border-color 0.12s",
          }}
        >
          Volver al inicio
        </Link>
      </div>

      {/* Footer */}
      <footer style={{ background: "var(--navy)", padding: "24px 20px", textAlign: "center" }}>
        <p style={{ color: "#4a6a8a", fontSize: "0.72rem", letterSpacing: "0.04em" }}>
          © 2025 PLAN EMBAJADORES · TODOS LOS DERECHOS RESERVADOS
        </p>
      </footer>
    </main>
  );
}
