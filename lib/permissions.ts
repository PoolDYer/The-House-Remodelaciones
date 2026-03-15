import { JWTPayload } from "@/types";
import { NextRequest } from "next/server";
import { verifyToken } from "./auth";

export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}

export function isAdminValid(payload: JWTPayload | null): boolean {
  if (!payload) return false;
  return payload.role === "admin";
}

export function verifyAdminFromToken(request: NextRequest): {
  valid: boolean;
  adminId?: string;
  email?: string;
} {
  const token = extractToken(request);
  if (!token) {
    return { valid: false };
  }

  const payload = verifyToken(token);
  if (!payload || !isAdminValid(payload)) {
    return { valid: false };
  }

  return {
    valid: true,
    adminId: payload.adminId,
    email: payload.email,
  };
}
