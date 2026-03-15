"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Color {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  especificaciones?: string;
  imagenColor?: string;
  imagenReferencia?: string;
  categoriaColor: {
    nombre: string;
  };
}

// Componente de lupa interactiva
function ImageZoom({ src, alt }: { src: string; alt: string }) {
  const [isHovering, setIsHovering] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (!isHovering) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  };

  return (
    <div
      className="bg-gray-100 rounded-lg overflow-hidden relative cursor-zoom-in h-full"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-contain transition-transform duration-200 ${
          isHovering ? "scale-[1.7]" : "scale-100"
        }`}
        style={
          isHovering
            ? {
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              }
            : {}
        }
      />
      {isHovering && (
        <div className="absolute inset-0 border-2 border-primary pointer-events-none opacity-50"></div>
      )}
    </div>
  );
}

export default function DetalleColorPage() {
  const params = useParams();
  const router = useRouter();
  const colorId = params.id as string;

  const [color, setColor] = useState<Color | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchColor = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/colores/${colorId}`);

        if (!response.ok) {
          setError("Color no encontrado");
          return;
        }

        const data = await response.json();
        setColor(data.color);
      } catch (err) {
        console.error("Error fetching color:", err);
        setError("Error al cargar el color");
      } finally {
        setLoading(false);
      }
    };

    fetchColor();
  }, [colorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando color...</p>
        </div>
      </div>
    );
  }

  if (error || !color) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          Volver
        </button>
        <div className="text-center py-12">
          <p className="text-red-600 text-lg">{error || "Color no encontrado"}</p>
          <Link href="/colores-melamine" className="text-primary mt-4 inline-block">
            Volver a Colores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
      >
        <ArrowLeft size={20} />
        Volver
      </button>

      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:min-h-[700px]">
          {/* Columna Izquierda - Información e Imagen del Color */}
          <div className="space-y-6">
            {/* Header y Descripción */}
            <div className="mb-6">
              <div className="inline-block px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-medium mb-4">
                {color.categoriaColor.nombre}
              </div>

              <h1 className="text-4xl font-bold mb-4">{color.nombre}</h1>

              {color.descripcion && (
                <p className="text-gray-600 text-lg leading-relaxed">
                  {color.descripcion}
                </p>
              )}
            </div>

            {/* Imagen del Color - Debajo de la descripción */}
            {color.imagenColor && (
              <div className="bg-gray-100 rounded-lg overflow-hidden h-80 w-80">
                <img
                  src={color.imagenColor}
                  alt={`Color ${color.nombre}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Especificaciones */}
            {color.especificaciones && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">Especificaciones</h3>
                <div className="text-gray-700 whitespace-pre-wrap text-sm">
                  {color.especificaciones}
                </div>
              </div>
            )}

            {/* Acabados Disponibles */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-3">Acabados Disponibles</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
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
          </div>

          {/* Columna Derecha - Imagen Referencial */}
          {color.imagenReferencia ? (
            <div className="h-full">
              <ImageZoom src={color.imagenReferencia} alt={`Referencia ${color.nombre}`} />
            </div>
          ) : (
            <div className="bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 h-full">
              <p>No hay imagen de referencia disponible</p>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="space-y-3 max-w-sm mt-8">
          <Link href="/muebles-venta">
            <button className="w-full px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-light transition-colors">
              Ver Productos con este Color
            </button>
          </Link>
          <Link href="/colores-melamine">
            <button className="w-full px-6 py-3 border-2 border-gray-300 text-gray-800 rounded-lg font-bold hover:bg-gray-50 transition-colors">
              Ver Todos los Colores
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
