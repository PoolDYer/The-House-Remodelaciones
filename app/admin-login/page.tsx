"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/public/LoginForm";
import { RegisterForm } from "@/components/public/RegisterForm";
import { Card, CardContent } from "@/components/common/Card";

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated && !authLoading) {
      router.push("/dashboard/admin");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    // Check if any admin is registered
    const checkAdmin = async () => {
      try {
        const response = await fetch("/api/auth/check-admin");
        const data = await response.json();
        setAdminExists(data.adminExists);

        // If no admin exists, show register form by default
        if (!data.adminExists) {
          setActiveTab("register");
        }
      } catch (error) {
        console.error("Error checking admin:", error);
        setAdminExists(false);
      }
    };

    checkAdmin();
  }, []);

  const handleTabChange = (tab: "login" | "register") => {
    setActiveTab(tab);
    const url = `/admin-login?tab=${tab}`;
    window.history.replaceState({}, "", url);
  };

  if (authLoading || adminExists === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-light py-12 px-4">
      <div className="w-full">
        {/* Tabs */}
        {adminExists && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white rounded-lg shadow-md p-1">
              <button
                onClick={() => handleTabChange("login")}
                className={`px-6 py-2 rounded-md transition-all border border-black ${
                  activeTab === "login"
                    ? "bg-gray-300 text-black"
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => handleTabChange("register")}
                className={`px-6 py-2 rounded-md transition-all border border-black ${
                  activeTab === "register"
                    ? "bg-gray-300 text-black"
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                Registrarse
              </button>
            </div>
          </div>
        )}

        {/* Forms */}
        <div className="flex justify-center">
          {!adminExists ? (
            <RegisterForm />
          ) : activeTab === "login" ? (
            <LoginForm />
          ) : (
            <RegisterForm />
          )}
        </div>
      </div>
    </div>
  );
}
