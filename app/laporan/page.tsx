"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Download, Printer, FileSpreadsheet } from "lucide-react";
import { useStore } from "@/store/useStore";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/format";
import { exportToExcel, exportToPDF } from "@/utils/export";
import { toast } from "sonner";

export default function LaporanPage() {
  const { transactions, people } = useStore();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [personFilter, setPersonFilter] = useState("all");

  const filteredTransactions = transactions.filter((tx) => {
    let matches = true;

    if (startDate && new Date(tx.date) < new Date(startDate)) matches = false;
    if (endDate && new Date(tx.date) > new Date(endDate)) matches = false;
    if (typeFilter !== "all" && tx.type !== typeFilter) matches = false;
    if (personFilter !== "all" && tx.personId !== personFilter) matches = false;

    return matches;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalHutang = filteredTransactions
    .filter((t) => t.type === "hutang")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPembayaran = filteredTransactions
    .filter((t) => t.type === "pembayaran")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleExportPDF = () => {
    if (filteredTransactions.length === 0) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }
    exportToPDF(filteredTransactions, people);
    toast.success("Berhasil export PDF");
  };

  const handleExportExcel = () => {
    if (filteredTransactions.length === 0) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }
    exportToExcel(filteredTransactions, people);
    toast.success("Berhasil export Excel");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Laporan</h1>
            <p className="text-muted-foreground">Filter dan export laporan transaksi.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" /> Excel
            </Button>
            <Button onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
          </div>
        </div>

        <Card className="print:hidden">
          <CardHeader>
            <CardTitle>Filter Laporan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Mulai Tanggal</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Sampai Tanggal</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Jenis Transaksi</Label>
                <Select value={typeFilter} onValueChange={(val: string) => setTypeFilter(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis</SelectItem>
                    <SelectItem value="hutang">Hutang</SelectItem>
                    <SelectItem value="pembayaran">Pembayaran</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Orang</Label>
                <Select value={personFilter} onValueChange={(val: string) => setPersonFilter(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Orang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Orang</SelectItem>
                    {people.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setTypeFilter("all");
                  setPersonFilter("all");
                }}
              >
                Reset Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Hutang (Filtered)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {formatCurrency(totalHutang)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pembayaran (Filtered)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {formatCurrency(totalPembayaran)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Data Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Nominal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => {
                      const person = people.find((p) => p.id === tx.personId);
                      return (
                        <TableRow key={tx.id}>
                          <TableCell>{format(new Date(tx.date), "dd/MM/yyyy")}</TableCell>
                          <TableCell className="font-medium">
                            {person?.name || "Tidak Diketahui"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`capitalize font-semibold ${
                                tx.type === "hutang" ? "text-red-500" : "text-green-500"
                              }`}
                            >
                              {tx.type}
                            </span>
                          </TableCell>
                          <TableCell>{tx.category}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(tx.amount)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Tidak ada data yang cocok dengan filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
