import Image from "next/image";
import Link from "next/link";

export default function GraciasPage() {
  return (
    <main
      style={{ background: "var(--bg-dark)", minHeight: "100vh" }}
      className="flex flex-col items-center justify-center px-6 text-center"
    >
      <Image src="/logo.jpeg" alt="Plan Embajadores" width={80} height={80} className="rounded-2xl mb-8 object-cover" />

      {/* Checkmark */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ background: "rgba(0,196,110,0.12)", border: "2px solid rgba(0,196,110,0.4)" }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M10 21L17 28L30 14" stroke="#00c46e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold mb-3">
        <span className="gradient-text">¡Gracias por tu respuesta!</span>
      </h1>
      <p className="text-base max-w-sm" style={{ color: "#64849e" }}>
        Tu opinión fue registrada exitosamente. Nos ayuda a seguir mejorando el Plan Embajadores.
      </p>

      <Link
        href="/"
        className="mt-10 px-8 py-3 rounded-full text-sm font-semibold"
        style={{ border: "1px solid var(--border-color)", color: "#94a3b8" }}
      >
        Volver al inicio
      </Link>
    </main>
  );
}
