"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import { toast } from "sonner";

import { useStore } from "@/store/useStore";
import { AppLayout } from "@/components/layout/app-layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nama wajib diisi" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export default function OrangPage() {
  const { people, addPerson, updatePerson, deletePerson } = useStore();
  const [globalFilter, setGlobalFilter] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      notes: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingId) {
      updatePerson(editingId, values);
      toast.success("Data berhasil diubah");
    } else {
      addPerson({
        name: values.name,
        phone: values.phone || "",
        address: values.address || "",
        notes: values.notes || "",
      });
      toast.success("Data berhasil ditambahkan");
    }
    setIsOpen(false);
    setEditingId(null);
    form.reset();
  };

  const openEdit = (person: any) => {
    setEditingId(person.id);
    form.reset({
      name: person.name,
      phone: person.phone,
      address: person.address,
      notes: person.notes,
    });
    setIsOpen(true);
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Nama",
      cell: ({ row }: any) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "phone",
      header: "No HP",
    },
    {
      accessorKey: "address",
      header: "Alamat",
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }: any) => {
        const person = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: "h-8 w-8 p-0" })}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem>
                <Link href={`/orang/${person.id}`} className="cursor-pointer flex items-center">
                  <Eye className="mr-2 h-4 w-4" /> Detail
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openEdit(person)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (confirm("Yakin ingin menghapus orang ini?")) {
                    deletePerson(person.id);
                    toast.success("Data berhasil dihapus");
                  }
                }}
                className="text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" /> Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: people,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Daftar Orang</h1>
            <p className="text-muted-foreground">Kelola data orang yang berhutang atau dihutangi.</p>
          </div>
          <Dialog
            open={isOpen}
            onOpenChange={(open) => {
              setIsOpen(open);
              if (!open) {
                setEditingId(null);
                form.reset();
              }
            }}
          >
            <DialogTrigger className={buttonVariants()}>
                <Plus className="mr-2 h-4 w-4" /> Tambah Orang
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Orang" : "Tambah Orang Baru"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Nomor HP (Opsional)</FormLabel>
                        <FormControl>
                          <Input placeholder="0812..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Alamat (Opsional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Jl. Sudirman..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Catatan (Opsional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Teman kantor..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit">Simpan</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center mb-4">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama..."
              className="pl-8"
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
            />
          </div>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Tidak ada data.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
