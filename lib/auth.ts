import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { JWTPayload } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "secret-key-change-in-production";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "refresh-secret-key-change-in-production";
const JWT_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

// Hash password with bcrypt
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Compare password with hash
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(payload: Omit<JWTPayload, "iat" | "exp">) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

// Generate refresh token
export function generateRefreshToken(adminId: string) {
  return jwt.sign({ adminId }, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Verify refresh token
export function verifyRefreshToken(token: string): { adminId: string } | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { adminId: string };
  } catch {
    return null;
  }
}

// Store refresh token in database
export async function storeRefreshToken(
  adminId: string,
  token: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.refreshToken.create({
    data: {
      token,
      adminId,
      expiresAt,
    },
  });
}

// Revoke refresh token
export async function revokeRefreshToken(token: string): Promise<void> {
  await db.refreshToken.updateMany({
    where: { token },
    data: { revoked: true },
  });
}

// Check if refresh token is valid
export async function isRefreshTokenValid(token: string): Promise<boolean> {
  const refreshToken = await db.refreshToken.findUnique({
    where: { token },
  });

  if (!refreshToken || refreshToken.revoked) {
    return false;
  }

  if (refreshToken.expiresAt < new Date()) {
    return false;
  }

  return true;
}
