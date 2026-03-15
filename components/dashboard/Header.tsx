"use client";

import { useAuth } from "@/hooks/useAuth";
import { Bell, User } from "lucide-react";

export const DashboardHeader = () => {
  const { admin } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-600">Bienvenido al panel de administración</p>
        </div>

        <div className="flex items-center gap-6">
          <button className="text-gray-600 hover:text-gray-900">
            <Bell size={24} />
          </button>

          <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{admin?.name}</p>
              <p className="text-xs text-gray-600">{admin?.email}</p>
            </div>
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
