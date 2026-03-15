import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminFromToken } from "@/lib/permissions";
import { colorSchema } from "@/lib/validation";
import { ZodError } from "zod";

export async function GET() {
  try {
    const colores = await db.color.findMany({
      select: {
        id: true,
        nombre: true,
        slug: true,
        descripcion: true,
        especificaciones: true,
        imagenColor: true,
        imagenReferencia: true,
        categoriaColor: {
          select: {
            id: true,
            nombre: true,
            slug: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ colores }, { status: 200 });
  } catch (error) {
    console.error("Get colores error:", error);
    return NextResponse.json(
      { message: "Error al obtener colores" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = verifyAdminFromToken(request);

    if (!auth.valid) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = colorSchema.parse(body);

    // Verify that the color category exists
    const categoriaColor = await db.categoriaColor.findUnique({
      where: { id: validatedData.categoriColorId },
    });

    if (!categoriaColor) {
      return NextResponse.json(
        { message: "Categoría de color no encontrada" },
        { status: 404 }
      );
    }

    const existingColor = await db.color.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingColor) {
      return NextResponse.json(
        { message: "Ya existe un color con este slug" },
        { status: 400 }
      );
    }

    const color = await db.color.create({
      data: {
        nombre: validatedData.nombre,
        slug: validatedData.slug,
        descripcion: validatedData.descripcion,
        especificaciones: validatedData.especificaciones,
        imagenColor: validatedData.imagenColor,
        imagenReferencia: validatedData.imagenReferencia,
        categoriColorId: validatedData.categoriColorId,
      },
      include: {
        categoriaColor: {
          select: {
            id: true,
            nombre: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, color },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Validación fallida", errors: error.issues },
        { status: 400 }
      );
    }

    console.error("Create color error:", error);
    return NextResponse.json(
      { message: "Error al crear color" },
      { status: 500 }
    );
  }
}
