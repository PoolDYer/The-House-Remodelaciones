import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, generateToken, generateRefreshToken, storeRefreshToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if admin already exists
    const existingAdmin = await db.admin.findUnique({
      where: { email: validatedData.email },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { message: "El email ya está registrado" },
        { status: 400 }
      );
    }

    // Check if this is the first admin (allow first registration)
    const adminCount = await db.admin.count();
    if (adminCount > 0) {
      return NextResponse.json(
        { message: "No se pueden crear más administradores. Contacte al administrador existente." },
        { status: 403 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create admin
    const admin = await db.admin.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: "admin",
      },
    });

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
        message: "Registro exitoso",
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
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Validación fallida", errors: error.issues },
        { status: 400 }
      );
    }

    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Error en el servidor" },
      { status: 500 }
    );
  }
}
