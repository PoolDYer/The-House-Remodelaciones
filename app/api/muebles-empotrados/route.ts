import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminFromToken } from "@/lib/permissions";
import { muebleEmpotradoSchema } from "@/lib/validation";
import { ZodError } from "zod";

export async function GET() {
    try {
        const muebles = await db.muebleEmpotrado.findMany({
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

        return NextResponse.json({ muebles }, { status: 200 });
    } catch (error) {
        console.error("Get muebles empotrados error:", error);
        return NextResponse.json(
            { message: "Error al obtener muebles empotrados" },
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
        const validatedData = muebleEmpotradoSchema.parse(body);

        // Verify category exists
        const categoria = await db.categoriaMuebleEmpotrado.findUnique({
            where: { id: validatedData.categoriaId },
        });

        if (!categoria) {
            return NextResponse.json(
                { message: "Categoría no encontrada" },
                { status: 404 }
            );
        }

        const existingSlug = await db.muebleEmpotrado.findUnique({
            where: { slug: validatedData.slug },
        });

        if (existingSlug) {
            return NextResponse.json(
                { message: "Ya existe un mueble con este slug" },
                { status: 400 }
            );
        }

        const mueble = await db.muebleEmpotrado.create({
            data: {
                nombre: validatedData.nombre,
                slug: validatedData.slug,
                descripcion: validatedData.descripcion,
                especificaciones: validatedData.especificaciones,
                categoriaId: validatedData.categoriaId,
            },
            include: {
                categoria: true,
                imagenes: true,
            },
        });

        return NextResponse.json(
            { success: true, mueble },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { message: "Validación fallida", errors: error.issues },
                { status: 400 }
            );
        }

        console.error("Create mueble empotrado error:", error);
        return NextResponse.json(
            { message: "Error al crear mueble empotrado" },
            { status: 500 }
        );
    }
}
