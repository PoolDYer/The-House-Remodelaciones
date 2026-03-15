"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Alert } from "@/components/common/Alert";
import { Edit2, Trash2, Eye } from "lucide-react";
import Link from "next/link";

interface Producto {
  id: string;
  nombre: string;
  slug: string;
  precio: string;
  stock: number;
  categoria: {
    nombre: string;
  };
  createdAt: string;
}

interface Categoria {
  id: string;
  nombre: string;
}

export default function ListaProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/productos"),
        fetch("/api/categorias"),
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      setProductos(productsData.productos || []);
      setCategorias(categoriesData.categorias || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      return;
    }

    const performDelete = async () => {
      try {
        const response = await fetch(`/api/productos/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.message);
          return;
        }

        fetchData();
      } catch (err) {
        setError("Error al eliminar producto");
      }
    };

    performDelete();
  };

  const filteredProductos = selectedCategory
    ? productos.filter((p) => p.categoria.nombre === selectedCategory)
    : productos;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Lista de Productos</h1>
        <Link href="/dashboard/admin/productos/crear">
          <Button>Crear Nuevo Producto</Button>
        </Link>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtrar por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "primary" : "secondary"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Todas ({productos.length})
            </Button>
            {categorias.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.nombre ? "primary" : "secondary"}
                size="sm"
                onClick={() => setSelectedCategory(cat.nombre)}
              >
                {cat.nombre} (
                {productos.filter((p) => p.categoria.nombre === cat.nombre)
                  .length}
                )
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      {loading ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando productos...</p>
          </CardContent>
        </Card>
      ) : filteredProductos.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-600">
            {selectedCategory
              ? `No hay productos en la categoría "${selectedCategory}"`
              : "No hay productos creados"}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Nombre</th>
                  <th className="text-left py-3 px-4 font-semibold">Categoría</th>
                  <th className="text-left py-3 px-4 font-semibold">Fecha de Creación</th>
                  <th className="text-left py-3 px-4 font-semibold">Precio</th>
                  <th className="text-left py-3 px-4 font-semibold">Stock</th>
                  <th className="text-left py-3 px-4 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProductos.map((producto) => (
                  <tr key={producto.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{producto.nombre}</td>
                    <td className="py-3 px-4 text-gray-600">
                      <span className="bg-gray-200 px-2 py-1 rounded text-xs">
                        {producto.categoria.nombre}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatDate(producto.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-primary">
                      ${producto.precio}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          producto.stock > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {producto.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Link href={`/dashboard/admin/productos/${producto.id}`}>
                          <Button
                            size="sm"
                            variant="secondary"
                            title="Editar"
                            className="p-2"
                          >
                            <Edit2 size={16} />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(producto.id)}
                          title="Eliminar"
                          className="p-2"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
