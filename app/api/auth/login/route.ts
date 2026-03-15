import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword, generateToken, generateRefreshToken, storeRefreshToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = loginSchema.parse(body);

    // Find admin by email
    const admin = await db.admin.findUnique({
      where: { email: validatedData.email },
    });

    if (!admin) {
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordValid = await comparePassword(validatedData.password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Generate tokens
    const token = generateToken({
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    });

    const refreshToken = generateRefreshToken(admin.id);
    await storeRefreshToken(admin.id, refreshToken);

    return NextResponse.json(
      {
        success: true,
        message: "Inicio de sesión exitoso",
        token,
        refreshToken,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          createdAt: admin.createdAt,
          updatedAt: admin.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Validación fallida", errors: error.issues },
        { status: 400 }
      );
    }

    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Error en el servidor" },
      { status: 500 }
    );
  }
}
