"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Alert } from "@/components/common/Alert";
import { Upload, X } from "lucide-react";

interface Categoria {
    id: string;
    nombre: string;
}

interface ImagenMueble {
    id: string;
    url: string;
}

export default function EditarMuebleEmpotradoPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagenesExistentes, setImagenesExistentes] = useState<ImagenMueble[]>([]);
    const [nuevasImagenes, setNuevasImagenes] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        nombre: "",
        slug: "",
        descripcion: "",
        especificaciones: "",
        categoriaId: "",
    });

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoadingData(true);
            const [muebleRes, catRes] = await Promise.all([
                fetch(`/api/muebles-empotrados/${id}`),
                fetch("/api/categorias-muebles-empotrados"),
            ]);

            const muebleData = await muebleRes.json();
            const catData = await catRes.json();

            if (!muebleRes.ok) {
                setError("Mueble no encontrado");
                return;
            }

            const mueble = muebleData.mueble;
            setFormData({
                nombre: mueble.nombre,
                slug: mueble.slug,
                descripcion: mueble.descripcion,
                especificaciones: mueble.especificaciones || "",
                categoriaId: mueble.categoriaId,
            });
            setImagenesExistentes(mueble.imagenes || []);
            setCategorias(catData.categorias || []);
        } catch (err) {
            console.error("Error loading data:", err);
            setError("Error al cargar datos del mueble");
        } finally {
            setLoadingData(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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

            // Save image to the mueble immediately
            const imgResponse = await fetch(`/api/muebles-empotrados/${id}/imagenes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify({ url: data.url }),
            });

            if (imgResponse.ok) {
                const imgData = await imgResponse.json();
                setImagenesExistentes((prev) => [...prev, imgData.imagen]);
            }

            setError(null);
        } catch (err) {
            console.error("Error uploading image:", err);
            setError("Error al subir imagen");
        } finally {
            setUploadingImage(false);
        }
    };

    const removeExistingImage = async (imagenId: string) => {
        try {
            const response = await fetch(
                `/api/muebles-empotrados/${id}/imagenes?imagenId=${imagenId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );

            if (response.ok) {
                setImagenesExistentes((prev) => prev.filter((img) => img.id !== imagenId));
            }
        } catch (err) {
            console.error("Error removing image:", err);
            setError("Error al eliminar imagen");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nombre || !formData.slug || !formData.descripcion || !formData.categoriaId) {
            setError("Por favor completa todos los campos requeridos");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/muebles-empotrados/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Error al actualizar mueble");
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/dashboard/admin/muebles-empotrados/productos");
            }, 1500);
        } catch (err) {
            console.error("Error updating mueble:", err);
            setError("Error al actualizar mueble");
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando mueble...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <h1 className="text-3xl font-bold">Editar Mueble Empotrado</h1>

            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
            {success && (
                <Alert
                    type="success"
                    title="¡Éxito!"
                    message="Mueble actualizado exitosamente. Redirigiendo..."
                />
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Información del Mueble</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                helperText="URL amigable"
                            />
                        </div>

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
                                <option value="">Selecciona una categoría</option>
                                {categorias.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

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

                        {/* Images */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Imágenes del Mueble
                            </label>

                            {imagenesExistentes.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm font-medium mb-2">Imágenes actuales:</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {imagenesExistentes.map((img) => (
                                            <div key={img.id} className="relative">
                                                <img
                                                    src={img.url}
                                                    alt="Imagen mueble"
                                                    className="w-full h-24 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(img.id)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploadingImage}
                                    className="hidden"
                                    id="edit-mueble-image-input"
                                />
                                <label htmlFor="edit-mueble-image-input" className="cursor-pointer">
                                    <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                                    <p className="text-gray-600">
                                        {uploadingImage ? "Subiendo..." : "Agregar nueva imagen"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">JPG, PNG o WebP - Máximo 5MB</p>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button
                                type="submit"
                                className="flex-1 !bg-white !text-black border border-black hover:!bg-black hover:!text-white hover:border-white"
                                loading={loading}
                                disabled={loading}
                            >
                                {loading ? "Actualizando..." : "Actualizar Mueble"}
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
