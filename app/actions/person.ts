"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { appendToSheet } from "@/lib/google-sheets";

export async function getPeople() {
  try {
    const people = await prisma.person.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: people };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPersonById(id: string) {
  try {
    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" }
        }
      }
    });
    return { success: true, data: person };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addPerson(data: { name: string; phone?: string; address?: string; notes?: string }) {
  try {
    const person = await prisma.person.create({ data });
    revalidatePath("/orang");

    // Sync to Google Sheets
    // Format: [ID, Nama, No HP, Alamat, Keterangan, Tanggal Dibuat]
    const sheetData = [
      person.id,
      person.name,
      person.phone || "-",
      person.address || "-",
      person.notes || "-",
      new Date(person.createdAt).toLocaleString('id-ID')
    ];
    
    // We don't await this so it doesn't block the UI response
    appendToSheet("Orang", sheetData);

    return { success: true, data: person };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePerson(id: string, data: { name: string; phone?: string; address?: string; notes?: string }, password?: string) {
  try {
    if (password !== process.env.ADMIN_PASSWORD) {
      return { success: false, error: "Password salah atau tidak diisi." };
    }
    
    const person = await prisma.person.update({
      where: { id },
      data,
    });
    revalidatePath("/orang");
    revalidatePath(`/orang/${id}`);
    return { success: true, data: person };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deletePerson(id: string, password?: string) {
  try {
    if (password !== process.env.ADMIN_PASSWORD) {
      return { success: false, error: "Password salah atau tidak diisi." };
    }

    await prisma.person.delete({
      where: { id },
    });
    revalidatePath("/orang");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
