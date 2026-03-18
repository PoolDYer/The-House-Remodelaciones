import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminFromToken } from "@/lib/permissions";
import { categoriaMuebleEmpotradoSchema } from "@/lib/validation";
import { ZodError } from "zod";

export async function GET() {
    try {
        const categorias = await db.categoriaMuebleEmpotrado.findMany({
            select: {
                id: true,
                nombre: true,
                slug: true,
                descripcion: true,
                imagen: true,
                createdAt: true,
                _count: {
                    select: { muebles: true },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({ categorias }, { status: 200 });
    } catch (error) {
        console.error("Get categorías muebles empotrados error:", error);
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
        const validatedData = categoriaMuebleEmpotradoSchema.parse(body);

        const existing = await db.categoriaMuebleEmpotrado.findUnique({
            where: { slug: validatedData.slug },
        });

        if (existing) {
            return NextResponse.json(
                { message: "Ya existe una categoría con este slug" },
                { status: 400 }
            );
        }

        const categoria = await db.categoriaMuebleEmpotrado.create({
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

        console.error("Create categoría mueble empotrado error:", error);
        return NextResponse.json(
            { message: "Error al crear categoría" },
            { status: 500 }
        );
    }
}
