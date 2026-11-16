"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function PublicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard/")) return <>{children}</>;
  return <><Navbar /><main className="flex-grow">{children}</main><Footer /></>;
}
