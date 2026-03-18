import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

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
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
