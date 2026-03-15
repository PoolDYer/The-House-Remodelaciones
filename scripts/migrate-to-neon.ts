import { PrismaClient } from "@prisma/client";
import Database from "better-sqlite3";

const prismaNeon = new PrismaClient();

// Conectar a SQLite local
const sqliteDb = new Database("./prisma/dev.db");

async function migrate() {
  try {
    console.log("🔄 Iniciando migración de SQLite a Neon...\n");

    // Función auxiliar para verificar si una tabla existe
    const tableExists = (tableName: string): boolean => {
      try {
        sqliteDb.prepare(`SELECT 1 FROM ${tableName} LIMIT 1`).get();
        return true;
      } catch {
        return false;
      }
    };

    // 1. Migrar Categorías de Colores
    if (tableExists("CategoriaColor")) {
      console.log("🏷️ Migrando Categorías de Colores...");
      const categoriasColores = sqliteDb
        .prepare("SELECT * FROM CategoriaColor")
        .all() as any[];
      for (const cat of categoriasColores) {
        try {
          await prismaNeon.categoriaColor.create({
            data: {
              id: cat.id,
              nombre: cat.nombre,
              slug: cat.slug,
              descripcion: cat.descripcion || null,
              imagen: cat.imagen || null,
            },
          });
        } catch (error: any) {
          if (!error.message.includes("Unique constraint")) {
            throw error;
          }
        }
      }
      console.log(`✅ ${categoriasColores.length} categorías de colores migradas\n`);
    }

    // 2. Migrar Colores
    if (tableExists("Color")) {
      console.log("🎨 Migrando Colores...");
      const colores = sqliteDb.prepare("SELECT * FROM Color").all() as any[];
      for (const color of colores) {
        try {
          await prismaNeon.color.create({
            data: {
              id: color.id,
              nombre: color.nombre,
              slug: color.slug,
              descripcion: color.descripcion || null,
              especificaciones: color.especificaciones || null,
              imagenColor: color.imagenColor || null,
              imagenReferencia: color.imagenReferencia || null,
              categoriColorId: color.categoriColorId,
            },
          });
        } catch (error: any) {
          if (!error.message.includes("Unique constraint")) {
            throw error;
          }
        }
      }
      console.log(`✅ ${colores.length} colores migrados\n`);
    }

    // 3. Migrar Categorías (si existen)
    if (tableExists("Categoria")) {
      console.log("📂 Migrando Categorías...");
      const categorias = sqliteDb
        .prepare("SELECT * FROM Categoria")
        .all() as any[];
      for (const cat of categorias) {
        try {
          await prismaNeon.categoria.create({
            data: {
              id: cat.id,
              nombre: cat.nombre,
              slug: cat.slug,
              descripcion: cat.descripcion || null,
              imagen: cat.imagen || null,
            },
          });
        } catch (error: any) {
          if (!error.message.includes("Unique constraint")) {
            throw error;
          }
        }
      }
      console.log(`✅ ${categorias.length} categorías migradas\n`);
    }

    // 4. Migrar Productos (si existen)
    if (tableExists("Producto")) {
      console.log("📦 Migrando Productos...");
      const productos = sqliteDb
        .prepare("SELECT * FROM Producto")
        .all() as any[];
      for (const prod of productos) {
        try {
          await prismaNeon.producto.create({
            data: {
              id: prod.id,
              nombre: prod.nombre,
              slug: prod.slug,
              descripcion: prod.descripcion || null,
              precio: prod.precio || null,
              imagen: prod.imagen || null,
              categoriaId: prod.categoriaId || null,
              colorId: prod.colorId || null,
            },
          });
        } catch (error: any) {
          if (!error.message.includes("Unique constraint")) {
            throw error;
          }
        }
      }
      console.log(`✅ ${productos.length} productos migrados\n`);
    }

    // 5. Migrar Admins (si existen)
    if (tableExists("Admin")) {
      console.log("👤 Migrando Admins...");
      const admins = sqliteDb.prepare("SELECT * FROM Admin").all() as any[];
      for (const admin of admins) {
        try {
          await prismaNeon.admin.create({
            data: {
              id: admin.id,
              email: admin.email,
              password: admin.password,
              name: admin.name,
              role: admin.role || "admin",
            },
          });
        } catch (error: any) {
          if (!error.message.includes("Unique constraint")) {
            throw error;
          }
        }
      }
      console.log(`✅ ${admins.length} admins migrados\n`);
    }

    console.log("✅ MIGRACIÓN COMPLETADA!\n");
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
  } finally {
    await prismaNeon.$disconnect();
    sqliteDb.close();
  }
}

migrate();

