import { NextRequest, NextResponse } from "next/server";
import { verifyAdminFromToken } from "@/lib/permissions";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const UPLOADS_DIR = join(process.cwd(), "public/uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const auth = verifyAdminFromToken(request);

    if (!auth.valid) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "No se proporcionó archivo" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return NextResponse.json(
        { message: "Tipo de archivo no permitido. Use JPG, PNG o WebP" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "El archivo es demasiado grande. Máximo 5MB" },
        { status: 400 }
      );
    }

    // Ensure uploads directory exists
    if (!existsSync(UPLOADS_DIR)) {
      await mkdir(UPLOADS_DIR, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const ext = file.name.split(".").pop();
    const filename = `${timestamp}-${random}.${ext}`;

    // Read file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write file
    const filepath = join(UPLOADS_DIR, filename);
    await writeFile(filepath, buffer);

    // Return public URL
    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json(
      {
        success: true,
        filename,
        url: publicUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "Error al subir archivo" },
      { status: 500 }
    );
  }
}
