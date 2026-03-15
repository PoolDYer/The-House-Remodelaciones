"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Alert } from "@/components/common/Alert";
import { Upload, X } from "lucide-react";

interface CategoriaColor {
  id: string;
  nombre: string;
}

interface FormData {
  nombre: string;
  slug: string;
  descripcion: string;
  especificaciones: string;
  categoriColorId: string;
  imagenColor: string;
  imagenReferencia: string;
}

export default function CrearColorPage() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<CategoriaColor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadingColorImage, setUploadingColorImage] = useState(false);
  const [uploadingRefImage, setUploadingRefImage] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    slug: "",
    descripcion: "",
    especificaciones: "",
    categoriColorId: "",
    imagenColor: "",
    imagenReferencia: "",
  });

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await fetch("/api/categorias-colores");
      const data = await response.json();
      setCategorias(data.categorias || []);
      if (data.categorias && data.categorias.length > 0) {
        setFormData((prev) => ({
          ...prev,
          categoriColorId: data.categorias[0].id,
        }));
      }
    } catch (err) {
      console.error("Error fetching categorías colores:", err);
      setError("Error al cargar categorías de colores");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isReference: boolean
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const setUploading = isReference ? setUploadingRefImage : setUploadingColorImage;
    setUploading(true);

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

      setFormData((prev) => ({
        ...prev,
        [isReference ? "imagenReferencia" : "imagenColor"]: data.url,
      }));
      setError(null);
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (isReference: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [isReference ? "imagenReferencia" : "imagenColor"]: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre || !formData.slug || !formData.categoriColorId) {
      setError("Por favor completa los campos requeridos (Nombre, Slug, Categoría)");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/colores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Error al crear color");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/admin/colores");
      }, 1500);
    } catch (err) {
      console.error("Error creating color:", err);
      setError("Error al crear color");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Crear Nuevo Color</h1>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && (
        <Alert
          type="success"
          title="¡Éxito!"
          message="Color creado exitosamente. Redirigiendo..."
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Información del Color</CardTitle>
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
                placeholder="Nombre del color"
                required
              />

              <Input
                label="Slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="nombre-del-color"
                required
                helperText="URL amigable"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría de Color
              </label>
              <select
                name="categoriColorId"
                value={formData.categoriColorId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Selecciona una categoría</option>
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
                placeholder="Descripción del color (opcional)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
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
                placeholder="Características del color (ej: Mate, Brillante, etc.) - Opcional"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Imagen del Color */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen del Color (1x1)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, false)}
                disabled={uploadingColorImage}
                className="hidden"
                id="color-upload"
              />
              <label
                htmlFor="color-upload"
                className="inline-block px-4 py-2 bg-gray-200 text-gray-800 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors"
              >
                {uploadingColorImage ? "Subiendo..." : "Seleccionar Imagen"}
              </label>
              <p className="text-xs text-gray-500 mt-2">PNG, JPG o WebP (máx 5MB)</p>

              {formData.imagenColor && (
                <div className="mt-4 relative inline-block">
                  <img
                    src={formData.imagenColor}
                    alt="Color preview"
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(false)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Imagen de Referencia */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen de Referencia (Mueble)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, true)}
                disabled={uploadingRefImage}
                className="hidden"
                id="ref-upload"
              />
              <label
                htmlFor="ref-upload"
                className="inline-block px-4 py-2 bg-gray-200 text-gray-800 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors"
              >
                {uploadingRefImage ? "Subiendo..." : "Seleccionar Imagen"}
              </label>
              <p className="text-xs text-gray-500 mt-2">PNG, JPG o WebP (máx 5MB)</p>

              {formData.imagenReferencia && (
                <div className="mt-4 relative inline-block">
                  <img
                    src={formData.imagenReferencia}
                    alt="Reference preview"
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(true)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 !bg-white !text-black border border-black hover:!bg-black hover:!text-white hover:border-white"
              >
                {loading ? "Creando..." : "Crear Color"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/dashboard/admin/colores")}
                className="flex-1"
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
