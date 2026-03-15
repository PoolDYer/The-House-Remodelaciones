import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(filePath: string): Promise<string | null> {
  try {
    const fullPath = join(process.cwd(), "public", filePath);

    // Check if file exists locally
    if (!existsSync(fullPath)) {
      console.log(`⚠️  Archivo no encontrado: ${fullPath}`);
      return null;
    }

    // Read file
    const buffer = await readFile(fullPath);

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "thehouse",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    return result.secure_url;
  } catch (error) {
    console.error(`Error subiendo archivo ${filePath}:`, error);
    return null;
  }
}

async function migrate() {
  console.log("🚀 Iniciando migración de imágenes a Cloudinary...\n");

  try {
    // Get all colors with images
    const colors = await prisma.color.findMany({
      where: {
        OR: [
          { imagenColor: { not: null } },
          { imagenReferencia: { not: null } },
        ],
      },
    });

    console.log(`📦 Total de colores con imágenes: ${colors.length}\n`);

    let successCount = 0;
    let failCount = 0;
    const updatePromises = [];

    for (const color of colors) {
      console.log(`\n📝 Procesando: ${color.nombre}`);

      let newImagenColor = color.imagenColor;
      let newImagenReferencia = color.imagenReferencia;

      // Migrate imagenColor
      if (color.imagenColor && color.imagenColor.startsWith("/uploads/")) {
        console.log(`  - Migrando imagen de color...`);
        const cloudinaryUrl = await uploadToCloudinary(color.imagenColor);

        if (cloudinaryUrl) {
          newImagenColor = cloudinaryUrl;
          console.log(`    ✅ URL: ${cloudinaryUrl.substring(0, 60)}...`);
          successCount++;
        } else {
          console.log(`    ❌ Falló la migración`);
          failCount++;
        }
      }

      // Migrate imagenReferencia
      if (
        color.imagenReferencia &&
        color.imagenReferencia.startsWith("/uploads/")
      ) {
        console.log(`  - Migrando imagen de referencia...`);
        const cloudinaryUrl = await uploadToCloudinary(color.imagenReferencia);

        if (cloudinaryUrl) {
          newImagenReferencia = cloudinaryUrl;
          console.log(`    ✅ URL: ${cloudinaryUrl.substring(0, 60)}...`);
          successCount++;
        } else {
          console.log(`    ❌ Falló la migración`);
          failCount++;
        }
      }

      // Queue update
      if (
        newImagenColor !== color.imagenColor ||
        newImagenReferencia !== color.imagenReferencia
      ) {
        updatePromises.push(
          prisma.color.update({
            where: { id: color.id },
            data: {
              imagenColor: newImagenColor,
              imagenReferencia: newImagenReferencia,
            },
          })
        );
      }
    }

    // Execute all updates
    if (updatePromises.length > 0) {
      console.log(`\n💾 Actualizando base de datos...`);
      await Promise.all(updatePromises);
      console.log(`✅ Base de datos actualizada`);
    }

    console.log(
      `\n📊 Estadísticas de migración:\n` +
        `   ✅ Imágenes migrantes: ${successCount}\n` +
        `   ❌ Imágenes fallidas: ${failCount}\n` +
        `   📝 Total: ${successCount + failCount}`
    );

    console.log(`\n✅ Migración completada`);
  } catch (error) {
    console.error("Error durante la migración:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
