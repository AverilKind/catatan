"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function resetAllData(password: string) {
  try {
    if (password !== process.env.ADMIN_PASSWORD) {
      return { success: false, error: "Password salah." };
    }

    // Delete all transactions and people
    // Prisma will delete all if where is empty or just use deleteMany
    await prisma.transaction.deleteMany({});
    await prisma.person.deleteMany({});

    revalidatePath("/");
    revalidatePath("/orang");
    revalidatePath("/transaksi");
    revalidatePath("/laporan");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function migrateLocalData(data: { people: any[], transactions: any[] }, password: string) {
  try {
    if (password !== process.env.ADMIN_PASSWORD) {
      return { success: false, error: "Password salah." };
    }

    if (!data.people || !data.transactions) {
      return { success: false, error: "Format data tidak valid" };
    }

    await prisma.person.createMany({
      data: data.people.map(p => ({
        id: p.id,
        name: p.name,
        phone: p.phone || null,
        address: p.address || null,
        notes: p.notes || null,
        createdAt: new Date(p.createdAt || Date.now())
      })),
      skipDuplicates: true
    });

    await prisma.transaction.createMany({
      data: data.transactions.map(t => ({
        id: t.id,
        personId: t.personId,
        type: t.type,
        amount: t.amount,
        category: t.category,
        date: new Date(t.date || Date.now()),
        notes: t.notes || null,
        createdAt: new Date(t.createdAt || Date.now())
      })),
      skipDuplicates: true
    });

    revalidatePath("/");
    revalidatePath("/orang");
    revalidatePath("/transaksi");
    revalidatePath("/laporan");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
