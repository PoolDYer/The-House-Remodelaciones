"use client";

import { useEffect, useState } from "react";
import { Calendar, User, ImageIcon, Film } from "lucide-react";

interface MediaItem {
  id: string;
  url: string;
  tipo: "imagen" | "video";
}

interface Publicacion {
  id: string;
  contenido: string;
  admin: {
    id: string;
    name: string;
  };
  media: MediaItem[];
  createdAt: string;
}

export default function ConocenosPage() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPublicaciones = async () => {
      try {
        const res = await fetch("/api/publicaciones", {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache"
        },
        cache: "no-store"
      });
        const data = await res.json();
        setPublicaciones(data.publicaciones || []);
      } catch (error) {
        console.error("Error loading publicaciones:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPublicaciones();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Conócenos
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Descubre nuestros trabajos, proyectos y el compromiso que ponemos en
            cada remodelación. Tu hogar merece lo mejor.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-amber-300 to-amber-100 mx-auto mt-8"></div>
        </div>
      </section>

      {/* Feed Section */}
      <section className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-gray-200 rounded"></div>
                    <div className="w-24 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="w-full h-4 bg-gray-200 rounded"></div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-full h-48 bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : publicaciones.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ImageIcon size={40} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Próximamente
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Estamos preparando contenido sobre nuestros trabajos y proyectos.
              ¡Vuelve pronto!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {publicaciones.map((pub) => (
              <article
                key={pub.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                {/* Post Header */}
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-600 rounded-full flex items-center justify-center">
                      <User size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {pub.admin.name}
                      </p>
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <Calendar size={12} />
                        <span>{formatDate(pub.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {pub.contenido}
                  </p>
                </div>

                {/* Media Gallery */}
                {pub.media.length > 0 && (
                  <div
                    className={`${
                      pub.media.length === 1
                        ? ""
                        : "grid grid-cols-2 gap-0.5"
                    }`}
                  >
                    {pub.media.map((m) => (
                      <div key={m.id} className="relative overflow-hidden">
                        {m.tipo === "imagen" ? (
                          <img
                            src={m.url}
                            alt="Trabajo realizado"
                            className="w-full h-auto max-h-[500px] object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <video
                            src={m.url}
                            controls
                            className="w-full max-h-[500px]"
                            preload="metadata"
                          >
                            Tu navegador no soporta videos.
                          </video>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Post Footer */}
                <div className="px-6 py-3 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    {pub.media.some((m) => m.tipo === "imagen") && (
                      <span className="flex items-center gap-1">
                        <ImageIcon size={12} />
                        {pub.media.filter((m) => m.tipo === "imagen").length}{" "}
                        {pub.media.filter((m) => m.tipo === "imagen").length ===
                        1
                          ? "imagen"
                          : "imágenes"}
                      </span>
                    )}
                    {pub.media.some((m) => m.tipo === "video") && (
                      <span className="flex items-center gap-1">
                        <Film size={12} />
                        {pub.media.filter((m) => m.tipo === "video").length}{" "}
                        {pub.media.filter((m) => m.tipo === "video").length ===
                        1
                          ? "video"
                          : "videos"}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
