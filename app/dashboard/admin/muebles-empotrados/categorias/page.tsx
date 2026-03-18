"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Alert } from "@/components/common/Alert";
import { Plus, Edit2, Trash2, Upload, X } from "lucide-react";

interface Categoria {
    id: string;
    nombre: string;
    slug: string;
    descripcion?: string;
    imagen?: string;
    _count?: { muebles: number };
}

export default function CategoriasMueblesEmpotradosPage() {
    const router = useRouter();
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [formData, setFormData] = useState({
        nombre: "",
        slug: "",
        descripcion: "",
        imagen: "",
    });

    useEffect(() => {
        fetchCategorias();
    }, []);

    const fetchCategorias = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/categorias-muebles-empotrados");
            const data = await response.json();
            setCategorias(data.categorias || []);
        } catch (err) {
            console.error("Error fetching categorías:", err);
            setError("Error al cargar categorías");
        } finally {
            setLoading(false);
        }
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

            setFormData((prev) => ({ ...prev, imagen: data.url }));
            setError(null);
        } catch (err) {
            console.error("Error uploading image:", err);
            setError("Error al subir imagen");
        } finally {
            setUploadingImage(false);
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
                ? `/api/categorias-muebles-empotrados/${editingId}`
                : "/api/categorias-muebles-empotrados";

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

            setFormData({ nombre: "", slug: "", descripcion: "", imagen: "" });
            setEditingId(null);
            setShowForm(false);
            setError(null);
            fetchCategorias();
        } catch (err) {
            setError("Error al guardar categoría");
        }
    };

    const handleDelete = (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar esta categoría? Se eliminarán todos los muebles asociados.")) {
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

                const response = await fetch(`/api/categorias-muebles-empotrados/${id}`, {
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
            imagen: categoria.imagen || "",
        });
        setEditingId(categoria.id);
        setShowForm(true);
    };

    const generateSlug = (nombre: string) => {
        return nombre
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Categorías de Muebles Empotrados</h1>
                <Button
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingId(null);
                        setFormData({ nombre: "", slug: "", descripcion: "", imagen: "" });
                    }}
                    className="flex items-center gap-2 !bg-white !text-black border border-black hover:!bg-black hover:!text-white hover:border-white"
                >
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
                                onChange={(e) => {
                                    const nombre = e.target.value;
                                    setFormData((prev) => ({
                                        ...prev,
                                        nombre,
                                        slug: editingId ? prev.slug : generateSlug(nombre),
                                    }));
                                }}
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

                            {/* Image upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Imagen (Opcional)
                                </label>
                                {formData.imagen ? (
                                    <div className="relative inline-block">
                                        <img
                                            src={formData.imagen}
                                            alt="Preview"
                                            className="w-32 h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData((prev) => ({ ...prev, imagen: "" }))}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploadingImage}
                                            className="hidden"
                                            id="cat-image-input"
                                        />
                                        <label htmlFor="cat-image-input" className="cursor-pointer">
                                            <Upload className="mx-auto mb-1 text-gray-400" size={24} />
                                            <p className="text-sm text-gray-600">
                                                {uploadingImage ? "Subiendo..." : "Subir imagen"}
                                            </p>
                                        </label>
                                    </div>
                                )}
                            </div>

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
                                        setFormData({ nombre: "", slug: "", descripcion: "", imagen: "" });
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
                                {categoria.imagen && (
                                    <img
                                        src={categoria.imagen}
                                        alt={categoria.nombre}
                                        className="w-full h-32 object-cover rounded-lg mb-4"
                                    />
                                )}
                                <h3 className="text-lg font-bold mb-2">{categoria.nombre}</h3>
                                <p className="text-sm text-gray-600 mb-1">
                                    <span className="font-semibold">Slug:</span> {categoria.slug}
                                </p>
                                {categoria._count && (
                                    <p className="text-sm text-gray-600 mb-1">
                                        <span className="font-semibold">Muebles:</span> {categoria._count.muebles}
                                    </p>
                                )}
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
