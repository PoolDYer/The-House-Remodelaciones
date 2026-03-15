"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* Logo placeholder - reemplazar con imagen real */}
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all overflow-hidden">
              <Image
                src="/logo.svg"
                alt="The House Remodelaciones"
                width={56}
                height={56}
                className="w-full h-full"
                priority
              />
            </div>
            {/* Brand Name */}
            <div className="flex flex-col">
              <span className="text-base sm:text-xl font-bold text-gray-900">
                The House
              </span>
              <span className="text-xs sm:text-sm text-primary font-semibold">
                Remodelaciones
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-4 items-center">
            <Link
              href="/muebles-melamine"
              className={`px-4 py-2 font-medium text-sm rounded-lg border border-black transition-colors duration-200 ${
                isActive("/muebles-melamine")
                  ? "bg-gray-400 text-black"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Muebles de Melamine
            </Link>
            <Link
              href="/muebles-venta"
              className={`px-4 py-2 font-medium text-sm rounded-lg border border-black transition-colors duration-200 ${
                isActive("/muebles-venta")
                  ? "bg-gray-400 text-black"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Muebles en Venta
            </Link>
            <Link
              href="/colores-melamine"
              className={`px-4 py-2 font-medium text-sm rounded-lg border border-black transition-colors duration-200 ${
                isActive("/colores-melamine")
                  ? "bg-gray-400 text-black"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Colores
            </Link>
            <Link
              href="/admin-login"
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm border border-black transition-all duration-300 hover:shadow-lg ${
                isActive("/admin-login")
                  ? "bg-gray-400 text-black"
                  : "bg-primary text-black hover:bg-gray-300"
              }`}
            >
              ¿Eres administrador?
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-gray-200/50">
            <Link
              href="/muebles-melamine"
              className={`block px-4 py-2.5 font-medium rounded-lg border border-black transition-colors ${
                isActive("/muebles-melamine")
                  ? "bg-gray-400 text-black"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Muebles de Melamine
            </Link>
            <Link
              href="/muebles-venta"
              className={`block px-4 py-2.5 font-medium rounded-lg border border-black transition-colors ${
                isActive("/muebles-venta")
                  ? "bg-gray-400 text-black"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Muebles en Venta
            </Link>
            <Link
              href="/colores-melamine"
              className={`block px-4 py-2.5 font-medium rounded-lg border border-black transition-colors ${
                isActive("/colores-melamine")
                  ? "bg-gray-400 text-black"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Colores
            </Link>
            <Link
              href="/admin-login"
              className={`block px-4 py-2.5 rounded-lg font-semibold text-center border border-black transition-all ${
                isActive("/admin-login")
                  ? "bg-gray-400 text-black"
                  : "bg-primary text-black hover:bg-gray-300"
              }`}
            >
              ¿Eres administrador?
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
