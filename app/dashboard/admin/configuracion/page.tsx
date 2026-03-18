"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Alert } from "@/components/common/Alert";
import { ConfiguracionEmpresaInput } from "@/lib/validation-presupuesto";
import { Save, Edit, X, Phone, Mail, Globe, MapPin, Building2, FileText, Upload } from "lucide-react";

interface ConfiguracionEmpresa {
  id: string;
  nombreEmpresa: string;
  ruc: string | null;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  website: string | null;
  logo: string | null;
}

export default function Page() {
  const [config, setConfig] = useState<ConfiguracionEmpresa | null>(null);
  const [formData, setFormData] = useState<ConfiguracionEmpresaInput>({
    nombreEmpresa: "",
    ruc: undefined,
    direccion: undefined,
    telefono: undefined,
    email: undefined,
    website: undefined,
    logo: undefined,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch("/api/configuracion", {
          headers: {
            "Authorization": `Bearer ${token || ""}`,
          },
        });
        if (!response.ok) throw new Error("Error cargando configuración");
        const data = await response.json();
        setConfig(data);
        setFormData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setIsLoading(false);
      }
    };

    cargar();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || undefined,
    }));
    setError(null);
  };

  const handleCancel = () => {
    if (config) {
        setFormData(config);
    }
    setIsEditing(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch("/api/configuracion", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ""}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error guardando configuración");
      }

      const updated = await response.json();
      setConfig(updated);
      setSuccess("Configuración guardada correctamente");
      setIsEditing(false); // Switch back to view mode
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex -mt-20 items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-slate-900 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Perfil de la Empresa</h1>
          <p className="text-slate-500 mt-1">
            Gestiona la información corporativa que aparecerá en tus documentos y presupuestos.
          </p>
        </div>
        {!isEditing && (
          <Button 
            onClick={() => setIsEditing(true)} 
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white shrink-0 shadow-md hover:shadow-lg transition-all"
          >
            <Edit size={16} /> Editar Perfil
          </Button>
        )}
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {!isEditing ? (
        // --- VIEW MODE ---
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Cover Photo / Banner */}
          <div className="h-40 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          </div>
          
          <div className="px-6 sm:px-10 pb-10 relative">
            {/* Logo */}
            <div className="absolute -top-16 left-6 sm:left-10 p-1.5 bg-white rounded-2xl shadow-lg border border-slate-100">
              <div className="w-28 h-28 bg-slate-50 flex items-center justify-center rounded-xl overflow-hidden">
                <img
                  src="/logo.svg"
                  alt="Logo"
                  className="w-20 h-20 object-contain drop-shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<div class="text-slate-400 font-bold text-xl">LOGO</div>';
                  }}
                />
              </div>
            </div>

            {/* Header Info */}
            <div className="pt-16 pb-6 border-b border-slate-100">
               <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                 {config?.nombreEmpresa || "Nombre no configurado"}
               </h2>
               <div className="flex items-center gap-2 text-slate-500 mt-2 font-medium">
                 <FileText size={16} className="text-slate-400" />
                 <span>RUC: {config?.ruc || "No especificado"}</span>
               </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
               {/* Contact Block */}
               <div className="space-y-6">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Building2 size={16} /> Información de Contacto
                 </h3>
                 
                 <div className="space-y-5">
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-blue-50/80 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100/50">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Teléfono</p>
                        <p className="text-slate-900 font-medium mt-0.5">{config?.telefono || "No especificado"}</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-emerald-50/80 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100/50">
                        <Mail size={18} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Correo Electrónico</p>
                        <p className="text-slate-900 font-medium mt-0.5">{config?.email || "No especificado"}</p>
                      </div>
                    </div>
                 </div>
               </div>

               {/* Location Block */}
               <div className="space-y-6">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <MapPin size={16} /> Ubicación & Digital
                 </h3>
                 
                 <div className="space-y-5">
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-purple-50/80 flex items-center justify-center text-purple-600 shrink-0 border border-purple-100/50">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Dirección Principal</p>
                        <p className="text-slate-900 font-medium mt-0.5 leading-snug">{config?.direccion || "No especificada"}</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-orange-50/80 flex items-center justify-center text-orange-600 shrink-0 border border-orange-100/50">
                        <Globe size={18} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Sitio Web</p>
                        <p className="text-slate-900 font-medium mt-0.5">
                          {config?.website ? (
                            <a href={config.website.startsWith('http') ? config.website : `https://${config.website}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                              {config.website}
                            </a>
                          ) : "No especificado"}
                        </p>
                      </div>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      ) : (
        // --- EDIT MODE ---
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 sm:p-8 space-y-8">
            <h2 className="text-xl font-bold text-slate-900 border-b pb-4">Editar Información</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
              <div className="col-span-1 md:col-span-2">
                <Input
                  label="Nombre de la Empresa"
                  name="nombreEmpresa"
                  value={formData.nombreEmpresa}
                  onChange={handleChange}
                  required
                  placeholder="Ej. The House Remodelaciones"
                />
              </div>

              <Input
                label="RUC"
                name="ruc"
                value={formData.ruc || ""}
                onChange={handleChange}
                placeholder="20XXXXXXXXX"
              />

              <Input
                label="Sitio Web"
                name="website"
                value={formData.website || ""}
                onChange={handleChange}
                placeholder="https://tuempresa.com"
              />

              <div className="col-span-1 md:col-span-2">
                <Input
                  label="Dirección Físico / Local"
                  name="direccion"
                  value={formData.direccion || ""}
                  onChange={handleChange}
                  placeholder="Av. Principal 123, Ciudad"
                />
              </div>

              <Input
                label="Teléfono de Contacto"
                name="telefono"
                value={formData.telefono || ""}
                onChange={handleChange}
                placeholder="(+51) 995 123 456"
              />

              <Input
                label="Correo Corporativo / Email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                placeholder="contacto@tuempresa.com"
              />
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-dashed border-slate-300">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white border rounded-lg flex items-center justify-center shrink-0">
                   <img src="/logo.svg" alt="Logo" className="w-10 h-10 object-contain" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Logo Corporativo</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    El logo se carga directamente desde los archivos del sistema <code className="bg-white px-1.5 py-0.5 rounded border text-xs text-slate-600">/public/logo.svg</code>. 
                    Si deseas cambiarlo, debes reemplazar el archivo en el servidor.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 p-6 border-t flex flex-col sm:flex-row gap-3 items-center justify-end">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 border border-transparent rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
