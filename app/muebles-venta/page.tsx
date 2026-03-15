"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import Link from "next/link";

interface Producto {
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
    url: string;
  }>;
  createdAt: string;
}

export default function MuebleVentaPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch products
      const productsRes = await fetch("/api/productos");
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProductos(productsData.productos || []);
      }

      // Fetch categories
      const categoriesRes = await fetch("/api/categorias");
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategorias(categoriesData.categorias || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error al cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory
    ? productos.filter((p) => p.categoria.nombre === selectedCategory)
    : productos;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="section-title">Muebles en Venta</h1>
        <p className="section-subtitle">
          Explora nuestro catálogo de productos disponibles
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <h3 className="font-bold mb-4">Filtrar por Categoría</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className={`${
              selectedCategory === null
                ? "!bg-black !text-white border border-white"
                : "!bg-white !text-black border border-black hover:!bg-black hover:!text-white hover:border-white"
            }`}
          >
            Todas
          </Button>
          {categorias.map((cat) => (
            <Button
              key={cat.id}
              variant="secondary"
              size="sm"
              onClick={() => setSelectedCategory(cat.nombre)}
              className={`${
                selectedCategory === cat.nombre
                  ? "!bg-black !text-white border border-white"
                  : "!bg-white !text-black border border-black hover:!bg-black hover:!text-white hover:border-white"
              }`}
            >
              {cat.nombre}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error}</p>
          <Button onClick={fetchData} className="mt-4">
            Reintentar
          </Button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">
            {selectedCategory
              ? `No hay productos en la categoría "${selectedCategory}"`
              : "No hay productos disponibles"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((producto) => (
            <Card
              key={producto.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Product Image */}
              <div className="aspect-video bg-gray-200 flex items-center justify-center overflow-hidden">
                {producto.imagenes && producto.imagenes.length > 0 ? (
                  <img
                    src={producto.imagenes[0].url}
                    alt={producto.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500">Sin imagen</span>
                )}
              </div>

              <CardContent className="pt-6">
                <div className="text-sm text-gray-500 mb-2">
                  {producto.categoria.nombre}
                </div>
                <h3 className="text-lg font-bold mb-2">{producto.nombre}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {producto.descripcion}
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary">
                    ${producto.precio}
                  </span>
                  <Link href={`/muebles-venta/${producto.id}`}>
                    <Button
                      size="sm"
                      className="!bg-white !text-black border border-black hover:!bg-black hover:!text-white hover:border-white"
                    >
                      Ver Más
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
