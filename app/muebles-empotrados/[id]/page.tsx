"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";

interface ImagenMueble {
    id: string;
    url: string;
}

interface MuebleEmpotrado {
    id: string;
    nombre: string;
    slug: string;
    descripcion: string;
    especificaciones?: string;
    categoria: {
        id: string;
        nombre: string;
        slug: string;
    };
    imagenes: ImagenMueble[];
}

export default function DetalleMuebleEmpotradoPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [mueble, setMueble] = useState<MuebleEmpotrado | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        const loadMueble = async () => {
            try {
                const response = await fetch(`/api/muebles-empotrados/${id}`);
                const data = await response.json();
                if (response.ok) {
                    setMueble(data.mueble);
                }
            } catch (error) {
                console.error("Error loading mueble:", error);
            } finally {
                setLoading(false);
            }
        };
        loadMueble();
    }, [id]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando...</p>
            </div>
        );
    }

    if (!mueble) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <Package size={64} className="mx-auto mb-4 text-gray-300" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Mueble no encontrado</h2>
                <Link
                    href="/muebles-empotrados"
                    className="text-primary font-semibold hover:underline"
                >
                    ← Volver a Muebles Empotrados
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            {/* Breadcrumb */}
            <div className="mb-8">
                <Link
                    href="/muebles-empotrados"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Volver a Muebles Empotrados
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Image Gallery */}
                <div>
                    {mueble.imagenes.length > 0 ? (
                        <div>
                            {/* Main Image */}
                            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
                                <img
                                    src={mueble.imagenes[selectedImage].url}
                                    alt={mueble.nombre}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Thumbnails */}
                            {mueble.imagenes.length > 1 && (
                                <div className="grid grid-cols-4 gap-3">
                                    {mueble.imagenes.map((img, index) => (
                                        <button
                                            key={img.id}
                                            onClick={() => setSelectedImage(index)}
                                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                                                    ? "border-gray-900 shadow-md"
                                                    : "border-transparent hover:border-gray-300"
                                                }`}
                                        >
                                            <img
                                                src={img.url}
                                                alt={`${mueble.nombre} - ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center">
                            <Package size={80} className="text-gray-400" />
                        </div>
                    )}
                </div>

                {/* Details */}
                <div>
                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-700 mb-4">
                        {mueble.categoria.nombre}
                    </span>

                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                        {mueble.nombre}
                    </h1>

                    <div className="prose prose-gray max-w-none mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                            {mueble.descripcion}
                        </p>
                    </div>

                    {mueble.especificaciones && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Especificaciones</h3>
                            <div className="bg-gray-50 rounded-lg p-6">
                                <p className="text-gray-600 whitespace-pre-line">{mueble.especificaciones}</p>
                            </div>
                        </div>
                    )}

                    <div className="border-t pt-6">
                        <p className="text-gray-500 text-sm mb-4">
                            ¿Interesado en este mueble? Contáctanos para una cotización personalizada.
                        </p>
                        <Link
                            href="/muebles-empotrados"
                            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                        >
                            Ver más muebles
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
