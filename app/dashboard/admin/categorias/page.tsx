"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Alert } from "@/components/common/Alert";
import { Plus, Edit2, Trash2 } from "lucide-react";

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
}

export default function CategoriasPage() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    slug: "",
    descripcion: "",
  });

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/categorias");
      const data = await response.json();
      setCategorias(data.categorias || []);
    } catch (err) {
      console.error("Error fetching categorías:", err);
      setError("Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre || !formData.slug) {
      setError("Nombre y slug son requeridos");
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setError("Sesión expirada. Vuelve a iniciar sesión");
        router.push("/admin-login");
        return;
      }

      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/categorias/${editingId}`
        : "/api/categorias";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      setFormData({ nombre: "", slug: "", descripcion: "" });
      setEditingId(null);
      setShowForm(false);
      setError(null);
      fetchCategorias();
    } catch (err) {
      setError("Error al guardar categoría");
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      return;
    }

    const performDelete = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          setError("Sesión expirada. Vuelve a iniciar sesión");
          router.push("/admin-login");
          return;
        }

        const response = await fetch(`/api/categorias/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message);
          return;
        }

        fetchCategorias();
      } catch (err) {
        setError("Error al eliminar categoría");
      }
    };

    performDelete();
  };

  const handleEdit = (categoria: Categoria) => {
    setFormData({
      nombre: categoria.nombre,
      slug: categoria.slug,
      descripcion: categoria.descripcion || "",
    });
    setEditingId(categoria.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestionar Categorías</h1>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ nombre: "", slug: "", descripcion: "" });
          }}
        className="flex items-center gap-2 !bg-white !text-black border border-black hover:!bg-black hover:!text-white hover:border-white">
        
          <Plus size={20} />
          Nueva Categoría
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? "Editar Categoría" : "Crear Nueva Categoría"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nombre: e.target.value }))
                }
                required
              />

              <Input
                label="Slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                required
                helperText="URL amigable (sin espacios)"
              />

              <Input
                label="Descripción"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    descripcion: e.target.value,
                  }))
                }
                placeholder="Opcional"
              />

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1 !bg-white !text-black border border-black hover:!bg-black hover:!text-white hover:border-white"
                >
                  {editingId ? "Actualizar" : "Crear"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ nombre: "", slug: "", descripcion: "" });
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando categorías...</p>
        </div>
      ) : categorias.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-600">
            No hay categorías creadas. Crea tu primera categoría con el botón "Nueva Categoría".
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categorias.map((categoria) => (
            <Card key={categoria.id}>
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold mb-2">{categoria.nombre}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Slug:</span> {categoria.slug}
                </p>
                {categoria.descripcion && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {categoria.descripcion}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEdit(categoria)}
                    className="flex items-center gap-1 flex-1"
                  >
                    <Edit2 size={16} />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(categoria.id)}
                    className="flex items-center gap-1 flex-1"
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
