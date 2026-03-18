"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  imagen?: string;
}

interface MuebleEmpotrado {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  categoria: {
    id: string;
    nombre: string;
    slug: string;
  };
  imagenes: { id: string; url: string }[];
}

export default function MueblesEmpotradosPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [muebles, setMuebles] = useState<MuebleEmpotrado[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, mueRes] = await Promise.all([
          fetch("/api/categorias-muebles-empotrados"),
          fetch("/api/muebles-empotrados"),
        ]);
        const catData = await catRes.json();
        const mueData = await mueRes.json();
        setCategorias(catData.categorias || []);
        setMuebles(mueData.muebles || []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredMuebles = filtroCategoria
    ? muebles.filter((m) => m.categoria.id === filtroCategoria)
    : muebles;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Muebles Empotrados</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Descubre nuestra colección de muebles empotrados elaborados en melamine de alta calidad
        </p>
      </div>

      {/* Category Filter */}
      {categorias.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => setFiltroCategoria("")}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all border ${filtroCategoria === ""
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFiltroCategoria(cat.id)}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all border ${filtroCategoria === cat.id
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando muebles...</p>
        </div>
      ) : filteredMuebles.length === 0 ? (
        <div className="text-center py-20">
          <Package size={64} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">
            {filtroCategoria
              ? "No hay muebles en esta categoría."
              : "Próximamente agregaremos nuestro catálogo de muebles empotrados."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMuebles.map((mueble) => (
            <Link
              key={mueble.id}
              href={`/muebles-empotrados/${mueble.id}`}
              className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="aspect-video bg-gray-100 overflow-hidden">
                {mueble.imagenes.length > 0 ? (
                  <img
                    src={mueble.imagenes[0].url}
                    alt={mueble.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <Package size={48} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 mb-3">
                  {mueble.categoria.nombre}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                  {mueble.nombre}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">{mueble.descripcion}</p>
                <div className="mt-4 text-primary font-semibold text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Ver detalles →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-16 text-center">
        <p className="text-gray-600 mb-6">
          ¿Buscas productos de melamine en venta? Visita nuestro catálogo.
        </p>
        <Link
          href="/muebles-venta"
          className="inline-block px-8 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors"
        >
          Ver Catálogo de Venta
        </Link>
      </div>
    </div>
  );
}
