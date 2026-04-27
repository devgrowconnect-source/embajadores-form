import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm",
});

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
    <html lang="es" suppressHydrationWarning className={`${dmSans.variable} h-full`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col antialiased" style={{ fontFamily: "var(--font-dm), system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
