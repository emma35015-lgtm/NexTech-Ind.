import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexTech Industries — Modelos de Inventario",
  description: "Métodos Cuantitativos | Universidad La Salle Bajío | Ingeniería Industrial",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
