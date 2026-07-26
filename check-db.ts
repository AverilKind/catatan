import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasourceUrl: "postgresql://neondb_owner:npg_0YbzF2wonNhe@ep-icy-mode-ao2cb4l4-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
});

async function main() {
  console.log('--- Mengecek Database Neon ---');
  
  const peopleCount = await prisma.person.count();
  const txCount = await prisma.transaction.count();
  
  console.log(`Jumlah Data Orang: ${peopleCount}`);
  console.log(`Jumlah Data Transaksi: ${txCount}`);
  
  if (peopleCount > 0) {
    const people = await prisma.person.findMany({ take: 5 });
    console.log('\nContoh Data Orang:', people);
  }
  
  if (txCount > 0) {
    const tx = await prisma.transaction.findMany({ take: 5 });
    console.log('\nContoh Data Transaksi:', tx);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
