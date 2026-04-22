import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Encuesta de Satisfacción – Plan Embajadores",
  description: "Encuesta de satisfacción del Plan Embajadores · Conquistando el Punto de Venta",
  openGraph: {
    title: "Encuesta de Satisfacción – Plan Embajadores",
    description: "Conquistando el Punto de Venta",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
