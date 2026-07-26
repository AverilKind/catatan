"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { appendToSheet } from "@/lib/google-sheets";

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

    // Get the person details for the sheet (optional but useful)
    const person = await prisma.person.findUnique({ where: { id: data.personId } });

    // Sync to Google Sheets
    // Format: [ID, Tanggal, Nama, Jenis, Jumlah, Kategori, Keterangan, Tanggal Dibuat]
    const sheetData = [
      transaction.id,
      new Date(transaction.date).toLocaleDateString('id-ID'),
      person?.name || data.personId,
      transaction.type === "debt" ? "Hutang" : "Bayar",
      transaction.amount.toString(),
      transaction.category,
      transaction.notes || "",
      new Date(transaction.createdAt).toLocaleString('id-ID')
    ];
    
    // We don't await this so it doesn't block the UI response
    appendToSheet("Transaksi", sheetData);

    return { success: true, data: transaction };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTransaction(id: string, data: { personId: string; type: string; amount: number; category: string; date: string; notes?: string }, password?: string) {
  try {
    if (password !== process.env.ADMIN_PASSWORD) {
      return { success: false, error: "Password salah atau tidak diisi." };
    }

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

export async function deleteTransaction(id: string, password?: string) {
  try {
    if (password !== process.env.ADMIN_PASSWORD) {
      return { success: false, error: "Password salah atau tidak diisi." };
    }

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
