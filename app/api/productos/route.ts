import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminFromToken } from "@/lib/permissions";
import { productoSchema } from "@/lib/validation";
import { ZodError } from "zod";

export async function GET() {
  try {
    const productos = await db.producto.findMany({
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true,
            slug: true,
          },
        },
        imagenes: {
          select: {
            id: true,
            url: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ productos }, { status: 200 });
  } catch (error) {
    console.error("Get productos error:", error);
    return NextResponse.json(
      { message: "Error al obtener productos" },
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
    const validatedData = productoSchema.parse(body);

    const existingProducto = await db.producto.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingProducto) {
      return NextResponse.json(
        { message: "Ya existe un producto con este slug" },
        { status: 400 }
      );
    }

    const producto = await db.producto.create({
      data: {
        nombre: validatedData.nombre,
        slug: validatedData.slug,
        descripcion: validatedData.descripcion,
        precio: validatedData.precio,
        especificaciones: validatedData.especificaciones,
        stock: validatedData.stock,
        categoriaId: validatedData.categoriaId,
      },
      include: {
        categoria: true,
        imagenes: true,
      },
    });

    return NextResponse.json(
      { success: true, producto },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Validación fallida", errors: error.issues },
        { status: 400 }
      );
    }

    console.error("Create producto error:", error);
    return NextResponse.json(
      { message: "Error al crear producto" },
      { status: 500 }
    );
  }
}
