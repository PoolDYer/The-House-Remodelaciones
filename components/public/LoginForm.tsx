"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Alert } from "@/components/common/Alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card";

export const LoginForm = () => {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setFormError("Por favor completa todos los campos");
      return;
    }

    const success = await login(formData.email, formData.password);
    if (success) {
      router.push("/dashboard/admin");
    } else {
      setFormError(error || "Error al iniciar sesión");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Iniciar Sesión - Administrador</CardTitle>
      </CardHeader>
      <CardContent>
        {(formError || error) && (
          <Alert
            type="error"
            message={formError || error || "Error desconocido"}
            className="mb-4"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Contraseña"
            type="password"
            name="password"
            placeholder="••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Button
            type="submit"
            className="w-full !bg-white !text-black border border-black hover:!bg-black hover:!text-white hover:border-white"
            loading={loading}
            disabled={loading}
          >
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes cuenta?{" "}
            <a href="/admin-login?tab=register" className="text-primary hover:underline">
              Regístrate aquí
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
