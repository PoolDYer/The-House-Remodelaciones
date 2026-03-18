import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const pubs = await prisma.publicacion.findMany({ include: { media: true }});
  console.log("Total publicaciones:", pubs.length);
  if (pubs.length > 0) {
    const p = pubs[0];
    console.log("Attempting to delete publication manually:", p.id);
    try {
      await prisma.publicacion.delete({ where: { id: p.id } });
      console.log("Successfully deleted!");
    } catch(e: any) {
      console.error("Delete failed with error:");
      console.error(e.message);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
