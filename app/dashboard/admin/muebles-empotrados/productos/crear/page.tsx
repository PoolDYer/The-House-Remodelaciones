"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Alert } from "@/components/common/Alert";
import { Upload, X } from "lucide-react";

interface Categoria {
    id: string;
    nombre: string;
}

export default function CrearMuebleEmpotradoPage() {
    const router = useRouter();
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagenes, setImagenes] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        nombre: "",
        slug: "",
        descripcion: "",
        especificaciones: "",
        categoriaId: "",
    });

    useEffect(() => {
        fetchCategorias();
    }, []);

    const fetchCategorias = async () => {
        try {
            const response = await fetch("/api/categorias-muebles-empotrados");
            const data = await response.json();
            setCategorias(data.categorias || []);
            if (data.categorias && data.categorias.length > 0) {
                setFormData((prev) => ({
                    ...prev,
                    categoriaId: data.categorias[0].id,
                }));
            }
        } catch (err) {
            console.error("Error fetching categorías:", err);
            setError("Error al cargar categorías. Crea una categoría primero.");
        }
    };

    const generateSlug = (nombre: string) => {
        return nombre
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };
            if (name === "nombre") {
                updated.slug = generateSlug(value);
            }
            return updated;
        });
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

            setImagenes((prev) => [...prev, data.url]);
            setError(null);
        } catch (err) {
            console.error("Error uploading image:", err);
            setError("Error al subir imagen");
        } finally {
            setUploadingImage(false);
        }
    };

    const removeImage = (url: string) => {
        setImagenes((prev) => prev.filter((img) => img !== url));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nombre || !formData.slug || !formData.descripcion || !formData.categoriaId) {
            setError("Por favor completa todos los campos requeridos");
            return;
        }

        if (categorias.length === 0) {
            setError("Debes crear una categoría antes de crear un mueble");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/muebles-empotrados", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Error al crear mueble");
                return;
            }

            // Upload images for the new mueble
            if (imagenes.length > 0) {
                for (const imgUrl of imagenes) {
                    await fetch(`/api/muebles-empotrados/${data.mueble.id}/imagenes`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                        },
                        body: JSON.stringify({ url: imgUrl }),
                    });
                }
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/dashboard/admin/muebles-empotrados/productos");
            }, 1500);
        } catch (err) {
            console.error("Error creating mueble:", err);
            setError("Error al crear mueble");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <h1 className="text-3xl font-bold">Crear Nuevo Mueble Empotrado</h1>

            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
            {success && (
                <Alert
                    type="success"
                    title="¡Éxito!"
                    message="Mueble creado exitosamente. Redirigiendo..."
                />
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Información del Mueble</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name & Slug */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                placeholder="Nombre del mueble"
                                required
                            />
                            <Input
                                label="Slug"
                                name="slug"
                                value={formData.slug}
                                onChange={handleInputChange}
                                placeholder="nombre-del-mueble"
                                required
                                helperText="URL amigable"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Categoría
                            </label>
                            {categorias.length === 0 ? (
                                <p className="text-sm text-red-500">
                                    No hay categorías disponibles.{" "}
                                    <a
                                        href="/dashboard/admin/muebles-empotrados/categorias"
                                        className="underline font-semibold"
                                    >
                                        Crear una categoría primero
                                    </a>
                                </p>
                            ) : (
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
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descripción
                            </label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleInputChange}
                                placeholder="Descripción detallada del mueble"
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                required
                            />
                        </div>

                        {/* Specs */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Especificaciones
                            </label>
                            <textarea
                                name="especificaciones"
                                value={formData.especificaciones}
                                onChange={handleInputChange}
                                placeholder="Dimensiones, materiales, acabados, etc."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            />
                        </div>

                        {/* Images */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Imágenes del Mueble
                            </label>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploadingImage}
                                    className="hidden"
                                    id="mueble-image-input"
                                />
                                <label htmlFor="mueble-image-input" className="cursor-pointer">
                                    <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                                    <p className="text-gray-600">
                                        {uploadingImage ? "Subiendo..." : "Haz clic para subir una imagen"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">JPG, PNG o WebP - Máximo 5MB</p>
                                </label>
                            </div>

                            {imagenes.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium mb-2">Imágenes subidas:</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {imagenes.map((url, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={url}
                                                    alt={`Imagen ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(url)}
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
                                className="flex-1 !bg-white !text-black border border-black hover:!bg-black hover:!text-white hover:border-white"
                                loading={loading}
                                disabled={loading}
                            >
                                {loading ? "Creando..." : "Crear Mueble"}
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
