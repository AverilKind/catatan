"use client";

import { useState } from "react";
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
import { Plus, Search, MoreHorizontal, Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/utils/format";
import { PasswordPrompt } from "@/components/password-prompt";

const formSchema = z.object({
  personId: z.string().min(1, { message: "Orang wajib dipilih" }),
  type: z.enum(["hutang", "pembayaran"]),
  amount: z.coerce.number().min(1, { message: "Nominal harus lebih dari 0" }),
  category: z.string().min(1, { message: "Kategori wajib diisi" }),
  date: z.string().min(1, { message: "Tanggal wajib diisi" }),
  notes: z.string().optional(),
});

export default function TransaksiPage() {
  const { transactions, people, addTransaction, updateTransaction, deleteTransaction } = useStore();
  const [globalFilter, setGlobalFilter] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personId: "",
      type: "hutang",
      amount: 0,
      category: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  const [pendingAction, setPendingAction] = useState<{ type: "edit" | "delete", data?: any, id?: string } | null>(null);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (editingId) {
      setPendingAction({ type: "edit", data: values, id: editingId });
    } else {
      const res = await addTransaction({
        ...values,
        notes: values.notes || "",
      });
      if (res?.success) {
        toast.success("Transaksi berhasil ditambahkan");
        setIsOpen(false);
        form.reset();
      } else {
        toast.error(res?.error || "Gagal menambahkan transaksi");
      }
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    if (!pendingAction) return;

    if (pendingAction.type === "edit" && pendingAction.id) {
      const res = await updateTransaction(pendingAction.id, pendingAction.data, password);
      if (res?.success) {
        toast.success("Transaksi berhasil diubah");
        setIsOpen(false);
        setEditingId(null);
        form.reset();
        setPendingAction(null);
      } else {
        toast.error(res?.error || "Gagal mengubah transaksi");
      }
    } else if (pendingAction.type === "delete" && pendingAction.id) {
      const res = await deleteTransaction(pendingAction.id, password);
      if (res?.success) {
        toast.success("Transaksi berhasil dihapus");
        setPendingAction(null);
      } else {
        toast.error(res?.error || "Gagal menghapus transaksi");
      }
    }
  };

  const openEdit = (transaction: any) => {
    setEditingId(transaction.id);
    form.reset({
      personId: transaction.personId,
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date.split("T")[0],
      notes: transaction.notes,
    });
    setIsOpen(true);
  };

  const columns = [
    {
      accessorKey: "date",
      header: "Tanggal",
      cell: ({ row }: any) => {
        const date = new Date(row.getValue("date"));
        return <div>{format(date, "dd MMM yyyy")}</div>;
      },
    },
    {
      accessorKey: "personId",
      header: "Orang",
      cell: ({ row }: any) => {
        const person = people.find((p) => p.id === row.getValue("personId"));
        return <div className="font-medium">{person?.name || "Tidak Diketahui"}</div>;
      },
    },
    {
      accessorKey: "type",
      header: "Jenis",
      cell: ({ row }: any) => {
        const type = row.getValue("type");
        return (
          <div
            className={`capitalize font-semibold ${
              type === "hutang" ? "text-red-500" : "text-green-500"
            }`}
          >
            {type}
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Kategori",
    },
    {
      accessorKey: "amount",
      header: "Nominal",
      cell: ({ row }: any) => {
        const amount = parseFloat(row.getValue("amount"));
        return <div className="font-medium">{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: "notes",
      header: "Catatan",
      cell: ({ row }: any) => {
        return <div className="text-muted-foreground">{row.getValue("notes") || "-"}</div>;
      }
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }: any) => {
        const transaction = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => openEdit(transaction)} title="Edit">
              <Edit className="h-4 w-4 text-blue-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setPendingAction({ type: "delete", id: transaction.id });
              }}
              title="Hapus"
            >
              <Trash className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: transactions,
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
            <h1 className="text-3xl font-bold tracking-tight">Daftar Transaksi</h1>
            <p className="text-muted-foreground">Catat setiap pengeluaran dan pembayaran hutang.</p>
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
                <Plus className="mr-2 h-4 w-4" /> Tambah Transaksi
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Transaksi" : "Tambah Transaksi Baru"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="personId"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Pilih Orang</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Orang" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {people.map((person) => (
                              <SelectItem key={person.id} value={person.id}>
                                {person.name}
                              </SelectItem>
                            ))}
                            {people.length === 0 && (
                              <SelectItem value="none" disabled>
                                Belum ada data orang
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel>Jenis Transaksi</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih Jenis" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hutang">Hutang (-)</SelectItem>
                              <SelectItem value="pembayaran">Pembayaran (+)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel>Tanggal</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Nominal (Rp)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="50000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Kategori / Keterangan Singkat</FormLabel>
                        <FormControl>
                          <Input placeholder="Makan siang, bensin..." {...field} />
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
                          <Textarea placeholder="Detail tambahan..." {...field} />
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
              placeholder="Cari transaksi..."
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
                    Tidak ada data transaksi.
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
      <PasswordPrompt
        isOpen={!!pendingAction}
        onClose={() => setPendingAction(null)}
        onSubmit={handlePasswordSubmit}
      />
    </AppLayout>
  );
}
