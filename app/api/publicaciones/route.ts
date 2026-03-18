import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminFromToken } from "@/lib/permissions";
import { publicacionSchema } from "@/lib/validation";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

// GET - Public: List all publications
export async function GET() {
  try {
    const publicaciones = await db.publicacion.findMany({
      include: {
        admin: {
          select: {
            id: true,
            name: true,
          },
        },
        media: {
          select: {
            id: true,
            url: true,
            tipo: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ publicaciones }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener publicaciones:", error);
    return NextResponse.json(
      { message: "Error al obtener publicaciones" },
      { status: 500 }
    );
  }
}

// POST - Protected: Create a new publication
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
    const validatedData = publicacionSchema.parse(body);

    const publicacion = await db.publicacion.create({
      data: {
        contenido: validatedData.contenido,
        adminId: auth.adminId!,
        media: {
          createMany: {
            data: validatedData.media.map((m) => ({
              url: m.url,
              tipo: m.tipo,
            })),
          },
        },
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
          },
        },
        media: true,
      },
    });

    return NextResponse.json(
      { success: true, publicacion },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Validación fallida", errors: error.issues },
        { status: 400 }
      );
    }

    console.error("Error al crear publicación:", error);
    return NextResponse.json(
      { message: "Error al crear publicación" },
      { status: 500 }
    );
  }
}
