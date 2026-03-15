"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Alert } from "@/components/common/Alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card";

export const RegisterForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Error al registrarse");
        return;
      }

      setSuccess(true);
      localStorage.setItem("accessToken", data.token);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      setTimeout(() => {
        router.push("/dashboard/admin");
      }, 1000);
    } catch (err) {
      setError("Error en la conexión");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <Alert
            type="success"
            title="¡Registro exitoso!"
            message="Tu cuenta ha sido creada. Redirigiendo al dashboard..."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Crear Cuenta - Administrador</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert type="error" message={error} className="mb-4" />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            type="text"
            name="name"
            placeholder="Tu nombre completo"
            value={formData.name}
            onChange={handleChange}
            required
          />

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
            helperText="Mínimo 6 caracteres"
          />

          <Input
            label="Confirmar Contraseña"
            type="password"
            name="confirmPassword"
            placeholder="••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <Button
            type="submit"
            className="w-full !bg-white !text-black border border-black hover:!bg-black hover:!text-white hover:border-white"
            loading={loading}
            disabled={loading}
          >
            {loading ? "Registrando..." : "Crear Cuenta"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <a href="/admin-login?tab=login" className="text-primary hover:underline">
              Inicia sesión aquí
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
