"use client";

import Link from "next/link";
import { ArrowRight, Package, Palette, Zap } from "lucide-react";
import { BackgroundVideo } from "@/components/common/BackgroundVideo";

export default function Home() {
  return (
    <div className="w-full relative">
      <BackgroundVideo />
      {/* Hero Section */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        {/* Overlay Elegante con Gradiente */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>

        {/* Contenido del Hero */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Logo/Brand */}
          <div className="mb-8 animate-fade-in">
            <div className="inline-block">
              <span className="text-white/80 text-sm sm:text-base tracking-widest uppercase font-light">
                Bienvenido a
              </span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-delay-1">
            The House
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-100">
              Remodelaciones
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed font-light animate-fade-in-delay-2">
            Muebles y productos de melamine de calidad premium para transformar
            tu hogar
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center animate-fade-in-delay-3">
            <Link
              href="/muebles-venta"
              className="inline-flex items-center justify-center px-8 sm:px-10 py-3 sm:py-4 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 transition-all hover:scale-105 gap-2 group"
            >
              Ver Catálogo
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href="/muebles-melamine"
              className="inline-flex items-center justify-center px-8 sm:px-10 py-3 sm:py-4 bg-white/20 text-white border border-white/50 rounded-lg font-semibold hover:bg-white/30 transition-all hover:border-white backdrop-blur-sm"
            >
              Explorar Colecciones
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="text-white/60 text-xs uppercase tracking-widest">
              Desplázate
            </div>
            <svg
              className="w-5 h-5 text-white/60 mx-auto mt-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 md:py-28 bg-black/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16 md:mb-20">
            <span className="text-amber-300 text-sm uppercase tracking-widest font-semibold">
              Nuestros Servicios
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
              ¿Por qué elegir The House?
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-amber-300 to-amber-100 mx-auto"></div>
          </div>

          {/* Features Grid - Minimalista */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Feature 1 */}
            <div className="group">
              <div className="mb-6 inline-block p-4 bg-white/10 backdrop-blur-sm rounded-xl group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Package size={32} className="text-white group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                Catálogo Extenso
              </h3>
              <p className="text-gray-200 leading-relaxed">
                Contamos con una variedad extensa de productos en melamine para todos
                los estilos y necesidades de tu hogar.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group">
              <div className="mb-6 inline-block p-4 bg-white/10 backdrop-blur-sm rounded-xl group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Palette size={32} className="text-white group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                Colores Premium
              </h3>
              <p className="text-gray-200 leading-relaxed">
                Múltiples opciones de colores y acabados para personalizar tus espacios
                según tu estilo y preferencias.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group">
              <div className="mb-6 inline-block p-4 bg-white/10 backdrop-blur-sm rounded-xl group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Zap size={32} className="text-white group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                Calidad Garantizada
              </h3>
              <p className="text-gray-200 leading-relaxed">
                Productos duraderos y de excelente calidad con atención personalizada
                para cada cliente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Minimalista */}
      <section className="relative py-20 md:py-28 bg-black/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Explora nuestras colecciones
            </h2>
            <p className="text-gray-200 text-lg max-w-2xl mx-auto">
              Descubre los mejores productos de melamine para tu proyecto
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {/* Collection 1 */}
            <Link
              href="/muebles-melamine"
              className="group relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 shadow-sm hover:shadow-2xl transition-all duration-300 border border-white/20"
            >
              <div className="aspect-video bg-gradient-to-br from-primary/30 to-primary-light/30 flex items-center justify-center">
                <Package size={48} className="text-white opacity-70" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                  Muebles de Melamine
                </h3>
                <p className="text-gray-200 text-sm mt-2">
                  Encuentra nuestro catálogo completo de muebles
                </p>
                <div className="mt-4 flex items-center text-amber-300 font-semibold">
                  Explorar
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Collection 2 */}
            <Link
              href="/muebles-venta"
              className="group relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 shadow-sm hover:shadow-2xl transition-all duration-300 border border-white/20"
            >
              <div className="aspect-video bg-gradient-to-br from-primary/30 to-primary-light/30 flex items-center justify-center">
                <Zap size={48} className="text-white opacity-70" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                  Productos en Venta
                </h3>
                <p className="text-gray-200 text-sm mt-2">
                  Ofertas especiales y productos destacados
                </p>
                <div className="mt-4 flex items-center text-amber-300 font-semibold">
                  Ver Ofertas
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Collection 3 */}
            <Link
              href="/colores-melamine"
              className="group relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 shadow-sm hover:shadow-2xl transition-all duration-300 border border-white/20"
            >
              <div className="aspect-video bg-gradient-to-br from-primary/30 to-primary-light/30 flex items-center justify-center">
                <Palette size={48} className="text-white opacity-70" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                  Guía de Colores
                </h3>
                <p className="text-gray-200 text-sm mt-2">
                  Descubre todos nuestros colores disponibles
                </p>
                <div className="mt-4 flex items-center text-amber-300 font-semibold">
                  Ver Colores
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Admin Section */}
      <section className="relative py-32 md:py-40 bg-gradient-to-r from-primary to-primary-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-12">
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6">
              ¿Eres administrador?
            </h2>
            <p className="text-xl sm:text-2xl text-white/95 max-w-2xl mx-auto mb-10 font-semibold">
              Accede al panel de administración para gestionar productos, categorías e inventario
            </p>
          </div>
          <Link
            href="/admin-login"
            className="inline-flex items-center justify-center px-12 py-5 !bg-white !text-black rounded-lg font-bold text-lg hover:!bg-black hover:!text-white transition-all hover:shadow-xl gap-3 group border border-black hover:border-white"
          >
            Iniciar Sesión Admin
            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
