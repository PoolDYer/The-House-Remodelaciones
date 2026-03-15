"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Color {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  imagenColor?: string;
  categoriaColor: {
    id: string;
    nombre: string;
  };
}

interface CategoriaColor {
  id: string;
  nombre: string;
}

export default function ColoresMelaminePage() {
  const [colores, setColores] = useState<Color[]>([]);
  const [categorias, setCategorias] = useState<CategoriaColor[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategorias();
    fetchColores();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await fetch("/api/categorias-colores");
      const data = await response.json();
      setCategorias(data.categorias || []);
    } catch (err) {
      console.error("Error fetching categorias:", err);
    }
  };

  const fetchColores = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/colores");
      const data = await response.json();
      setColores(data.colores || []);
    } catch (err) {
      console.error("Error fetching colores:", err);
      setError("Error al cargar los colores");
    } finally {
      setLoading(false);
    }
  };

  const filteredColores = selectedCategoria
    ? colores.filter((color) => color.categoriaColor.id === selectedCategoria)
    : colores;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="section-title">Colores Disponibles en Melamine</h1>
        <p className="section-subtitle">
          Explora nuestra amplia variedad de colores y acabados para tus muebles
        </p>
      </div>

      {/* Filtros por Categoría */}
      {categorias.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setSelectedCategoria(null)}
            className={`px-6 py-2 rounded-full font-medium transition-colors border ${
              selectedCategoria === null
                ? "!bg-black !text-white border-white"
                : "!bg-white !text-black border-black hover:!bg-black hover:!text-white hover:border-white"
            }`}
          >
            Todos
          </button>
          {categorias.map((categoria) => (
            <button
              key={categoria.id}
              onClick={() => setSelectedCategoria(categoria.id)}
              className={`px-6 py-2 rounded-full font-medium transition-colors border ${
                selectedCategoria === categoria.id
                  ? "!bg-black !text-white border-white"
                  : "!bg-white !text-black border-black hover:!bg-black hover:!text-white hover:border-white"
              }`}
            >
              {categoria.nombre}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando colores...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 py-12">
          <p>{error}</p>
        </div>
      ) : filteredColores.length === 0 ? (
        <div className="text-center text-gray-600 py-12">
          <p>No hay colores disponibles en esta categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredColores.map((color) => (
            <Link key={color.id} href={`/colores-melamine/${color.id}`}>
              <div className="text-center cursor-pointer group">
                <div className="relative w-full aspect-square rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-gray-200 mb-3 overflow-hidden bg-gray-100">
                  {color.imagenColor ? (
                    <img
                      src={color.imagenColor}
                      alt={color.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No imagen
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-sm md:text-base mb-1 group-hover:text-primary transition-colors">
                  {color.nombre}
                </h3>
                {color.descripcion && (
                  <p className="text-xs text-gray-600 line-clamp-1">{color.descripcion}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">{color.categoriaColor.nombre}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h3 className="font-bold text-lg mb-3">Personalización de Colores</h3>
        <p className="text-gray-700 mb-4">
          Nuestros colores están disponibles en diferentes acabados:
        </p>
        <ul className="space-y-2 text-gray-700">
          <li>
            <strong>Mate:</strong> Acabado sin brillo, elegante y sofisticado
          </li>
          <li>
            <strong>Semibrillo:</strong> Balance perfecto entre reflejo y suavidad
          </li>
          <li>
            <strong>Brillo:</strong> Acabado esmaltado, fácil de limpiar y duradero
          </li>
          <li>
            <strong>Texturizado:</strong> Imitación de madera con relieve natural
          </li>
        </ul>
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-6">
          ¿No encuentras el color que buscas? Contáctanos para obtener colores personalizados.
        </p>
        <a
          href="/muebles-venta"
          className="inline-block px-8 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-light transition-colors"
        >
          Ver Productos con Estos Colores
        </a>
      </div>
    </div>
  );
}
