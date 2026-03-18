"use client";

import { useEffect, useState, useRef } from "react";
import {
  Plus,
  Trash2,
  ImageIcon,
  Film,
  X,
  Upload,
  Calendar,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";

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

interface PendingMedia {
  url: string;
  tipo: "imagen" | "video";
  preview: string;
}

export default function PublicacionesAdminPage() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [contenido, setContenido] = useState("");
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getToken = () => localStorage.getItem("accessToken") || "";

  useEffect(() => {
    loadPublicaciones();
  }, []);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    setError("");

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.message || "Error al subir archivo");
          continue;
        }

        const data = await res.json();
        const tipo = file.type.startsWith("video/") ? "video" : "imagen";

        setPendingMedia((prev) => [
          ...prev,
          {
            url: data.url,
            tipo: tipo as "imagen" | "video",
            preview: tipo === "imagen" ? data.url : "",
          },
        ]);
      } catch (err) {
        setError("Error al subir archivo");
      }
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePendingMedia = (index: number) => {
    setPendingMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!contenido.trim()) {
      setError("El contenido es requerido");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/publicaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          contenido: contenido.trim(),
          media: pendingMedia.map((m) => ({
            url: m.url,
            tipo: m.tipo,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Error al crear publicación");
        return;
      }

      setContenido("");
      setPendingMedia([]);
      setSuccess("Publicación creada exitosamente");
      setTimeout(() => setSuccess(""), 3000);
      await loadPublicaciones();
    } catch (err) {
      setError("Error al crear publicación");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setShowDeleteConfirm(null);
    setDeletingId(id);
    try {
      const res = await fetch(`/api/publicaciones/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Error al eliminar publicación");
        return;
      }

      setSuccess("Publicación eliminada");
      setTimeout(() => setSuccess(""), 3000);
      await loadPublicaciones();
    } catch (err) {
      setError("Error al eliminar publicación");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Publicaciones
        </h1>
        <p className="text-gray-600">
          Gestiona las publicaciones de la sección Conócenos. Las publicaciones
          son visibles para todos los visitantes.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Create Publication Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Plus size={20} />
          Nueva Publicación
        </h2>

        <div className="space-y-4">
          <textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="Escribe sobre un trabajo realizado, un proyecto nuevo, o comparte novedades de la empresa..."
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none text-sm"
          />

          {/* Pending Media Preview */}
          {pendingMedia.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {pendingMedia.map((m, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200">
                  {m.tipo === "imagen" ? (
                    <img
                      src={m.url}
                      alt="Preview"
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-900 flex items-center justify-center">
                      <Film size={32} className="text-white" />
                      <span className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-0.5 rounded">
                        Video
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => removePendingMedia(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-300 disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Upload size={16} />
                )}
                {uploading ? "Subiendo..." : "Agregar media"}
              </button>
              <span className="text-xs text-gray-400">
                JPG, PNG, WebP (5MB) o MP4 (100MB)
              </span>
            </div>

            <button
              onClick={handleCreate}
              disabled={creating || !contenido.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              {creating ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </div>
      </div>

      {/* Publications List */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Publicaciones existentes ({publicaciones.length})
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 size={32} className="animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Cargando publicaciones...</p>
          </div>
        ) : publicaciones.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <ImageIcon size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">
              No hay publicaciones aún. ¡Crea la primera!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {publicaciones.map((pub) => (
              <div
                key={pub.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                        <User size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {pub.admin.name}
                        </p>
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <Calendar size={11} />
                          <span>{formatDate(pub.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowDeleteConfirm(pub.id)}
                      disabled={deletingId === pub.id}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Eliminar publicación"
                    >
                      {deletingId === pub.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>

                  {/* Content */}
                  <p className="text-gray-700 text-sm whitespace-pre-wrap mb-3">
                    {pub.contenido}
                  </p>

                  {/* Media */}
                  {pub.media.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {pub.media.map((m) => (
                        <div
                          key={m.id}
                          className="rounded-lg overflow-hidden border border-gray-100"
                        >
                          {m.tipo === "imagen" ? (
                            <img
                              src={m.url}
                              alt="Media"
                              className="w-full h-24 object-cover"
                            />
                          ) : (
                            <div className="w-full h-24 bg-gray-900 flex items-center justify-center relative">
                              <Film size={24} className="text-white" />
                              <span className="absolute bottom-1 left-1 text-white text-xs bg-black/50 px-1.5 py-0.5 rounded">
                                MP4
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 text-red-600 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Eliminar publicación
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6 px-1">
              ¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer y los archivos multimedia asociados serán borrados de forma permanente.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-lg hover:bg-gray-200 transition-colors"
                disabled={deletingId !== null}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                disabled={deletingId !== null}
              >
                {deletingId === showDeleteConfirm ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
