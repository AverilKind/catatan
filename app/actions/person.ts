"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

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
    return { success: true, data: person };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePerson(id: string, data: { name: string; phone?: string; address?: string; notes?: string }) {
  try {
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

export async function deletePerson(id: string) {
  try {
    await prisma.person.delete({
      where: { id },
    });
    revalidatePath("/orang");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
