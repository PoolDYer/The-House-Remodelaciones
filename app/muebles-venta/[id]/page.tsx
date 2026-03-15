"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";

interface ProductoDetalle {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  precio: string;
  stock: number;
  especificaciones?: string;
  categoria: {
    nombre: string;
  };
  imagenes: Array<{
    id: string;
    url: string;
  }>;
}

export default function ProductoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [producto, setProducto] = useState<ProductoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/productos/${productId}`);

        if (!response.ok) {
          setError("Producto no encontrado");
          return;
        }

        const data = await response.json();
        setProducto(data.producto);
      } catch (err) {
        setError("Error al cargar el producto");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProducto();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando producto...</p>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-6">
          <p className="text-red-700">{error || "Producto no encontrado"}</p>
        </div>
        <Button
          onClick={() => router.push("/muebles-venta")}
          className="!bg-white !text-black border border-black hover:!bg-black hover:!text-white hover:border-white"
        >
          Volver a Muebles en Venta
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-black bg-white text-black hover:bg-black hover:text-white hover:border-white transition-all"
      >
        <ArrowLeft size={18} />
        Volver
      </button>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              {producto.imagenes && producto.imagenes.length > 0 ? (
                <img
                  src={producto.imagenes[0].url}
                  alt={producto.nombre}
                  className="w-full h-80 object-cover rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-full h-80 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-500">
                  Sin imagen
                </div>
              )}
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-500">Categoría: {producto.categoria.nombre}</p>
              <h1 className="text-3xl font-bold text-gray-900">{producto.nombre}</h1>
              <p className="text-gray-700 leading-relaxed">{producto.descripcion}</p>

              <div className="pt-2">
                <p className="text-3xl font-bold text-primary">${producto.precio}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-sm text-gray-500">Stock</p>
                  <p className="text-xl font-bold text-gray-900">{producto.stock} unidades</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-sm text-gray-500">Slug</p>
                  <p className="text-lg font-semibold text-gray-900">{producto.slug}</p>
                </div>
              </div>

              {producto.especificaciones && (
                <div className="pt-2">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Especificaciones</h3>
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 whitespace-pre-wrap">
                    {producto.especificaciones}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
