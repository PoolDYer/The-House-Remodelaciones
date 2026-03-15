import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function seedColors() {
  try {
    console.log("🌱 Iniciando seed de colores de prueba...\n");

    // Crear categorías de colores
    const categoriasData = [
      {
        nombre: "Colores Mate",
        slug: "colores-mate",
        descripcion: "Acabado sin brillo, elegante y sofisticado",
      },
      {
        nombre: "Colores Brillantes",
        slug: "colores-brillantes",
        descripcion: "Acabado esmaltado, fácil de limpiar y duradero",
      },
      {
        nombre: "Colores Texturizados",
        slug: "colores-texturizados",
        descripcion: "Imitación de madera con relieve natural",
      },
    ];

    console.log("📁 Creando categorías de colores...");
    const categorias = await Promise.all(
      categoriasData.map((cat) =>
        db.categoriaColor.create({
          data: cat,
        })
      )
    );
    console.log(`✅ ${categorias.length} categorías creadas\n`);

    // Crear colores de prueba
    const coloresData = [
      {
        nombre: "Blanco Puro",
        slug: "blanco-puro",
        descripcion: "Color blanco limpio y elegante, versátil para cualquier ambiente",
        especificaciones: "Acabado: Mate\nReflexión: Sin brillo\nAplicaciones: Cocinas, baños, espacios modernos",
        imagenColor: "/uploads/blanco.png",
        imagenReferencia: "/uploads/blanco-ref.png",
        categoriColorId: categorias[0].id,
      },
      {
        nombre: "Negro Mate",
        slug: "negro-mate",
        descripcion: "Negro profundo y sofisticado, perfecto para estilos minimalistas",
        especificaciones: "Acabado: Mate\nReflexión: Sin brillo\nAplicaciones: Espacios modernos, minimalismo",
        imagenColor: "/uploads/negro.png",
        imagenReferencia: "/uploads/negro-ref.png",
        categoriColorId: categorias[0].id,
      },
      {
        nombre: "Gris Claro",
        slug: "gris-claro",
        descripcion: "Gris neutral y versátil, combina con cualquier decoración",
        especificaciones: "Acabado: Mate\nReflexión: Bajo\nAplicaciones: Cualquier ambiente",
        imagenColor: "/uploads/gris-claro.png",
        imagenReferencia: "/uploads/gris-claro-ref.png",
        categoriColorId: categorias[0].id,
      },
      {
        nombre: "Blanco Brillante",
        slug: "blanco-brillante",
        descripcion: "Blanco con acabado esmaltado, superficies limpias y brillosas",
        especificaciones: "Acabado: Brillo\nReflexión: Alta\nAplicaciones: Cocinas, baños, fácil limpieza",
        imagenColor: "/uploads/blanco-brillo.png",
        imagenReferencia: "/uploads/blanco-brillo-ref.png",
        categoriColorId: categorias[1].id,
      },
      {
        nombre: "Negro Brillante",
        slug: "negro-brillante",
        descripcion: "Negro espejo, sofisticado y llamativo con alto brillo",
        especificaciones: "Acabado: Brillo\nReflexión: Muy alta\nAplicaciones: Salas, dormitorios de lujo",
        imagenColor: "/uploads/negro-brillo.png",
        imagenReferencia: "/uploads/negro-brillo-ref.png",
        categoriColorId: categorias[1].id,
      },
      {
        nombre: "Roble Natural",
        slug: "roble-natural",
        descripcion: "Textura de madera roble natural, cálido y acogedor",
        especificaciones: "Acabado: Texturizado\nPatrón: Vetas naturales\nAplicaciones: Salones, dormitorios, espacios cálidos",
        imagenColor: "/uploads/roble.png",
        imagenReferencia: "/uploads/roble-ref.png",
        categoriColorId: categorias[2].id,
      },
      {
        nombre: "Nogal Oscuro",
        slug: "nogal-oscuro",
        descripcion: "Textura de madera nogal, elegante y clásico",
        especificaciones: "Acabado: Texturizado\nPatrón: Vetas pronunciadas\nAplicaciones: Espacios tradicionales, oficinas",
        imagenColor: "/uploads/nogal.png",
        imagenReferencia: "/uploads/nogal-ref.png",
        categoriColorId: categorias[2].id,
      },
      {
        nombre: "Madera Blanca",
        slug: "madera-blanca",
        descripcion: "Imitación de madera clara con relieve natural",
        especificaciones: "Acabado: Texturizado\nPatrón: Vetas claras\nAplicaciones: Ambientes luminosos, nórdico",
        imagenColor: "/uploads/madera-blanca.png",
        imagenReferencia: "/uploads/madera-blanca-ref.png",
        categoriColorId: categorias[2].id,
      },
    ];

    console.log("🎨 Creando colores de prueba...");
    const colores = await Promise.all(
      coloresData.map((color) =>
        db.color.create({
          data: color,
        })
      )
    );
    console.log(`✅ ${colores.length} colores creados\n`);

    console.log("✅ Seed completado exitosamente!");
    console.log("\n📊 Resumen:");
    console.log(`   - ${categorias.length} categorías de colores`);
    console.log(`   - ${colores.length} colores}`);
  } catch (error) {
    console.error("❌ Error durante seed:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

seedColors();
