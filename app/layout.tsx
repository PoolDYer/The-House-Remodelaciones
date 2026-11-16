import type { Metadata } from "next";
import "./globals.css";
import { PublicShell } from "@/components/public/PublicShell";

export const metadata: Metadata = {
  title: "The House Remodelaciones - Muebles Premium en Melamine",
  description: "The House Remodelaciones: Especialistas en muebles y productos de melamine de alta calidad para tu hogar y oficina",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen relative bg-white" suppressHydrationWarning>
        <div className="relative z-0">
          <PublicShell>{children}</PublicShell>
        </div>
      </body>
    </html>
  );
}
