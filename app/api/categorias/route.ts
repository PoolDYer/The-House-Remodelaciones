import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminFromToken } from "@/lib/permissions";
import { categoriaSchema } from "@/lib/validation";
import { ZodError } from "zod";

export async function GET() {
  try {
    const categorias = await db.categoria.findMany({
      select: {
        id: true,
        nombre: true,
        slug: true,
        descripcion: true,
        imagen: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ categorias }, { status: 200 });
  } catch (error) {
    console.error("Get categorías error:", error);
    return NextResponse.json(
      { message: "Error al obtener categorías" },
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
    const validatedData = categoriaSchema.parse(body);

    const existingCategoria = await db.categoria.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingCategoria) {
      return NextResponse.json(
        { message: "Ya existe una categoría con este slug" },
        { status: 400 }
      );
    }

    const categoria = await db.categoria.create({
      data: {
        nombre: validatedData.nombre,
        slug: validatedData.slug,
        descripcion: validatedData.descripcion,
        imagen: validatedData.imagen,
      },
    });

    return NextResponse.json(
      { success: true, categoria },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Validación fallida", errors: error.issues },
        { status: 400 }
      );
    }

    console.error("Create categoria error:", error);
    return NextResponse.json(
      { message: "Error al crear categoría" },
      { status: 500 }
    );
  }
}
