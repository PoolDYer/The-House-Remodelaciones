import Database from "better-sqlite3";

const sqliteDb = new Database("./prisma/prisma/dev.db");

console.log("🔍 Verificando datos en SQLite local...\n");

// Listar todas las tablas
const tables = sqliteDb
  .prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
  )
  .all() as any[];

console.log("📋 Tablas encontradas:");
for (const table of tables) {
  const count = sqliteDb.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get() as any;
  console.log(`   - ${table.name}: ${count.count} registros`);
}

console.log("\n📊 Detalles de datos:\n");

// Detalles de cada tabla
for (const table of tables) {
  const count = sqliteDb.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get() as any;
  if (count.count > 0) {
    console.log(`\n${table.name}:`);
    const rows = sqliteDb.prepare(`SELECT * FROM ${table.name} LIMIT 3`).all();
    console.log(JSON.stringify(rows, null, 2));
  }
}

sqliteDb.close();
console.log("\n✅ Verificación completada");
