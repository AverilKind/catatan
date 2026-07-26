"use server";

import prisma from "@/lib/prisma";
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
