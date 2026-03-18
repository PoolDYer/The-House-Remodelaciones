"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Alert } from "@/components/common/Alert";
import { Plus, Edit2, Trash2, Package } from "lucide-react";

interface Categoria {
    id: string;
    nombre: string;
}

interface MuebleEmpotrado {
    id: string;
    nombre: string;
    slug: string;
    descripcion: string;
    categoria: Categoria;
    imagenes: { id: string; url: string }[];
    createdAt: string;
}

export default function ProductosMueblesEmpotradosPage() {
    const router = useRouter();
    const [muebles, setMuebles] = useState<MuebleEmpotrado[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtroCategoria, setFiltroCategoria] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [mueRes, catRes] = await Promise.all([
                fetch("/api/muebles-empotrados"),
                fetch("/api/categorias-muebles-empotrados"),
            ]);
            const mueData = await mueRes.json();
            const catData = await catRes.json();
            setMuebles(mueData.muebles || []);
            setCategorias(catData.categorias || []);
        } catch (err) {
            console.error("Error loading data:", err);
            setError("Error al cargar datos");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este mueble?")) return;

        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                router.push("/admin-login");
                return;
            }

            const response = await fetch(`/api/muebles-empotrados/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const data = await response.json();
            if (!response.ok) {
                setError(data.message);
                return;
            }

            loadData();
        } catch (err) {
            setError("Error al eliminar mueble");
        }
    };

    const filteredMuebles = filtroCategoria
        ? muebles.filter((m) => m.categoria.id === filtroCategoria)
        : muebles;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Muebles Empotrados</h1>
                <Link href="/dashboard/admin/muebles-empotrados/productos/crear">
                    <Button className="flex items-center gap-2 !bg-white !text-black border border-black hover:!bg-black hover:!text-white hover:border-white">
                        <Plus size={20} />
                        Nuevo Mueble
                    </Button>
                </Link>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

            {/* Filter */}
            <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Filtrar por categoría:</label>
                <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                >
                    <option value="">Todas</option>
                    {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.nombre}
                        </option>
                    ))}
                </select>
                <span className="text-sm text-gray-500">
                    {filteredMuebles.length} mueble{filteredMuebles.length !== 1 ? "s" : ""}
                </span>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando muebles...</p>
                </div>
            ) : filteredMuebles.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center text-gray-600">
                        <Package size={48} className="mx-auto mb-4 text-gray-400" />
                        <p>No hay muebles empotrados creados.</p>
                        <Link
                            href="/dashboard/admin/muebles-empotrados/productos/crear"
                            className="text-primary font-semibold hover:underline mt-2 inline-block"
                        >
                            Crear tu primer mueble →
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Imagen
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Nombre
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Categoría
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Fecha
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredMuebles.map((mueble) => (
                                <tr key={mueble.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        {mueble.imagenes.length > 0 ? (
                                            <img
                                                src={mueble.imagenes[0].url}
                                                alt={mueble.nombre}
                                                className="w-16 h-12 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                                                <Package size={20} className="text-gray-400" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{mueble.nombre}</div>
                                        <div className="text-sm text-gray-500 line-clamp-1">{mueble.descripcion}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                            {mueble.categoria.nombre}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(mueble.createdAt).toLocaleDateString("es-PE")}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Link href={`/dashboard/admin/muebles-empotrados/productos/${mueble.id}`}>
                                                <Button size="sm" variant="secondary" className="flex items-center gap-1">
                                                    <Edit2 size={14} />
                                                    Editar
                                                </Button>
                                            </Link>
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => handleDelete(mueble.id)}
                                                className="flex items-center gap-1"
                                            >
                                                <Trash2 size={14} />
                                                Eliminar
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
