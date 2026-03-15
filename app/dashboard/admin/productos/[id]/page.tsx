"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Alert } from "@/components/common/Alert";
import { Upload, X, ArrowLeft } from "lucide-react";

interface Categoria {
  id: string;
  nombre: string;
}

interface Imagen {
  id: string;
  url: string;
}

interface FormData {
  nombre: string;
  slug: string;
  descripcion: string;
  precio: string;
  especificaciones: string;
  stock: number;
  categoriaId: string;
}

export default function EditarProductoPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagenes, setImagenes] = useState<Imagen[]>([]);
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    slug: "",
    descripcion: "",
    precio: "",
    especificaciones: "",
    stock: 0,
    categoriaId: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productRes, categoriasRes] = await Promise.all([
          fetch(`/api/productos/${productId}`),
          fetch("/api/categorias"),
        ]);

        if (!productRes.ok) {
          setError("Producto no encontrado");
          return;
        }

        const productData = await productRes.json();
        const categoriasData = await categoriasRes.json();

        setCategorias(categoriasData.categorias || []);
        setFormData({
          nombre: productData.producto.nombre,
          slug: productData.producto.slug,
          descripcion: productData.producto.descripcion,
          precio: productData.producto.precio,
          especificaciones: productData.producto.especificaciones || "",
          stock: productData.producto.stock,
          categoriaId: productData.producto.categoriaId,
        });
        setImagenes(productData.producto.imagenes || []);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Error al cargar el producto");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "stock" ? parseInt(value) || 0 : value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: uploadFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Error al subir imagen");
        return;
      }

      // Add image to database
      const imageRes = await fetch(`/api/productos/${productId}/imagenes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ url: data.url }),
      });

      if (imageRes.ok) {
        setImagenes((prev) => [...prev, { id: Date.now().toString(), url: data.url }]);
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Error al subir imagen");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = async (imageId: string) => {
    try {
      const response = await fetch(
        `/api/productos/${productId}/imagenes/${imageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.ok) {
        setImagenes((prev) => prev.filter((img) => img.id !== imageId));
      }
    } catch (err) {
      console.error("Error deleting image:", err);
      setError("Error al eliminar imagen");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre || !formData.slug || !formData.descripcion || !formData.precio) {
      setError("Por favor completa todos los campos requeridos");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/productos/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Error al actualizar producto");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/admin/lista-productos");
      }, 1500);
    } catch (err) {
      console.error("Error updating product:", err);
      setError("Error al actualizar producto");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando producto...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold">Editar Producto</h1>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && (
        <Alert
          type="success"
          title="¡Éxito!"
          message="Producto actualizado correctamente. Redirigiendo..."
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Información del Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Básico */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
              />

              <Input
                label="Slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                name="categoriaId"
                value={formData.categoriaId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                required
              >
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>

            {/* Especificaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especificaciones
              </label>
              <textarea
                name="especificaciones"
                value={formData.especificaciones}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Precio y Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Precio"
                name="precio"
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={handleInputChange}
                required
              />

              <Input
                label="Stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Imágenes del Producto
              </label>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                  id="image-input"
                />
                <label htmlFor="image-input" className="cursor-pointer">
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-gray-600">
                    {uploadingImage ? "Subiendo..." : "Haz clic para subir una imagen"}
                  </p>
                </label>
              </div>

              {imagenes.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Imágenes:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagenes.map((img) => (
                      <div key={img.id} className="relative">
                        <img
                          src={img.url}
                          alt="Imagen del producto"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(img.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                className="flex-1"
                loading={saving}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
