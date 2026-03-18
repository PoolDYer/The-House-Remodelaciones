import { NextRequest, NextResponse } from "next/server";
import { verifyAdminFromToken } from "@/lib/permissions";
import { db as prisma } from "@/lib/db";
import { ConfiguracionEmpresaSchema } from "@/lib/validation-presupuesto";

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAdminFromToken(request);
    if (!auth.valid) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    let config = await prisma.configuracionEmpresa.findFirst();

    // Si no existe, crear con valores por defecto
    if (!config) {
      config = await prisma.configuracionEmpresa.create({
        data: {
          nombreEmpresa: "The House Remodelaciones",
          ruc: "",
          direccion: "",
          telefono: "",
          email: "",
          website: "",
        },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error obteniendo configuración:", error);
    return NextResponse.json(
      { message: "Error obteniendo configuración" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = verifyAdminFromToken(request);
    if (!auth.valid) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = ConfiguracionEmpresaSchema.parse(body);

    let config = await prisma.configuracionEmpresa.findFirst();

    if (!config) {
      config = await prisma.configuracionEmpresa.create({
        data: validatedData,
      });
    } else {
      config = await prisma.configuracionEmpresa.update({
        where: { id: config.id },
        data: validatedData,
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error actualizando configuración:", error);
    return NextResponse.json(
      { message: "Error actualizando configuración" },
      { status: 500 }
    );
  }
}
