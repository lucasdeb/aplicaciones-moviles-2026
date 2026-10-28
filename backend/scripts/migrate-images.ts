import '../src/config';
import { prisma } from '../src/prisma';
import { storeImage } from '../src/services/uploads';
import { backupDatabase } from './backup-db';
async function main() {
  console.log('Backup previo:', await backupDatabase());
  let converted = 0;
  for (const row of await prisma.review.findMany({ where: { photo: { startsWith: 'data:image/' } } })) {
    const photo = await storeImage(row.authorId, row.photo);
    await prisma.review.updateMany({ where: { id: row.id, photo: row.photo }, data: { photo } }); converted++;
  }
  for (const row of await prisma.movie.findMany({ where: { OR: [{ posterPath: { startsWith: 'data:image/' } }, { backdropPath: { startsWith: 'data:image/' } }] } })) {
    for (const field of ['posterPath', 'backdropPath'] as const) if (row[field]?.startsWith('data:image/')) {
      const url = await storeImage(0, row[field]);
      await prisma.movie.updateMany({ where: { id: row.id, [field]: row[field] }, data: { [field]: url } }); converted++;
    }
  }
  console.log('Imágenes migradas:', converted);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
