"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Alert } from "@/components/common/Alert";
import { Edit2, Trash2, Plus } from "lucide-react";
import Link from "next/link";

interface Color {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  imagenColor?: string;
  categoriaColor: {
    nombre: string;
  };
  createdAt: string;
}

interface CategoriaColor {
  id: string;
  nombre: string;
}

export default function ColoresPage() {
  const router = useRouter();
  const [colores, setColores] = useState<Color[]>([]);
  const [categorias, setCategorias] = useState<CategoriaColor[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coloresRes, categoriasRes] = await Promise.all([
        fetch("/api/colores"),
        fetch("/api/categorias-colores"),
      ]);

      const coloresData = await coloresRes.json();
      const categoriasData = await categoriasRes.json();

      setColores(coloresData.colores || []);
      setCategorias(categoriasData.categorias || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este color?")) {
      return;
    }

    const performDelete = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await fetch(`/api/colores/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.message);
          return;
        }

        fetchData();
      } catch (err) {
        setError("Error al eliminar color");
      }
    };

    performDelete();
  };

  const filteredColores = selectedCategory
    ? colores.filter((c) => c.categoriaColor.nombre === selectedCategory)
    : colores;

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
        <h1 className="text-3xl font-bold">Gestionar Colores</h1>
        <Link href="/dashboard/admin/colores/crear">
          <Button className="flex items-center gap-2 !bg-white !text-black border border-black hover:!bg-black hover:!text-white hover:border-white">
            <Plus size={20} />
            Crear Nuevo Color
          </Button>
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
              Todos ({colores.length})
            </Button>
            {categorias.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.nombre ? "primary" : "secondary"}
                size="sm"
                onClick={() => setSelectedCategory(cat.nombre)}
              >
                {cat.nombre} (
                {colores.filter((c) => c.categoriaColor.nombre === cat.nombre).length}
                )
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Colors Grid */}
      {loading ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando colores...</p>
          </CardContent>
        </Card>
      ) : filteredColores.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-600">
            {selectedCategory
              ? `No hay colores en la categoría "${selectedCategory}"`
              : "No hay colores creados"}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredColores.map((color) => (
            <Card key={color.id}>
              <CardContent className="pt-4">
                {color.imagenColor && (
                  <div className="mb-4">
                    <img
                      src={color.imagenColor}
                      alt={color.nombre}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                )}
                <h3 className="text-lg font-bold mb-2">{color.nombre}</h3>
                <p className="text-xs text-gray-600 mb-2">
                  <span className="font-semibold">Categoría:</span> {color.categoriaColor.nombre}
                </p>
                {color.descripcion && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {color.descripcion}
                  </p>
                )}
                <p className="text-xs text-gray-500 mb-4">
                  {formatDate(color.createdAt)}
                </p>

                <div className="flex gap-2">
                  <Link href={`/dashboard/admin/colores/${color.id}`} className="flex-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex items-center justify-center gap-1 w-full"
                    >
                      <Edit2 size={16} />
                      Editar
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(color.id)}
                    className="flex items-center justify-center gap-1 flex-1"
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
