"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getTransactions() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: { person: true },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: transactions };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addTransaction(data: { personId: string; type: string; amount: number; category: string; date: string; notes?: string }) {
  try {
    const transaction = await prisma.transaction.create({ data });
    revalidatePath("/transaksi");
    revalidatePath("/laporan");
    revalidatePath("/");
    revalidatePath(`/orang/${data.personId}`);
    return { success: true, data: transaction };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTransaction(id: string, data: { personId: string; type: string; amount: number; category: string; date: string; notes?: string }) {
  try {
    const transaction = await prisma.transaction.update({
      where: { id },
      data,
    });
    revalidatePath("/transaksi");
    revalidatePath("/laporan");
    revalidatePath("/");
    revalidatePath(`/orang/${data.personId}`);
    return { success: true, data: transaction };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTransaction(id: string) {
  try {
    const transaction = await prisma.transaction.delete({
      where: { id },
    });
    revalidatePath("/transaksi");
    revalidatePath("/laporan");
    revalidatePath("/");
    revalidatePath(`/orang/${transaction.personId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
