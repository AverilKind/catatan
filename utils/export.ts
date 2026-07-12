import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { formatCurrency } from "./format";
import { format } from "date-fns";

export const exportToPDF = (transactions: any[], people: any[], filename = "laporan-transaksi") => {
  const doc = new jsPDF();
  
  doc.text("Laporan Transaksi", 14, 15);
  doc.setFontSize(10);
  doc.text(`Dicetak pada: ${format(new Date(), "dd MMM yyyy HH:mm")}`, 14, 22);

  const tableData = transactions.map((tx) => {
    const person = people.find((p) => p.id === tx.personId);
    return [
      format(new Date(tx.date), "dd/MM/yyyy"),
      person?.name || "Tidak Diketahui",
      tx.type === "hutang" ? "Hutang" : "Pembayaran",
      tx.category,
      formatCurrency(tx.amount),
    ];
  });

  autoTable(doc, {
    head: [["Tanggal", "Nama", "Jenis", "Kategori", "Nominal"]],
    body: tableData,
    startY: 30,
    theme: "striped",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [22, 163, 74] }, // Green-600
  });

  doc.save(`${filename}.pdf`);
};

export const exportToExcel = (transactions: any[], people: any[], filename = "laporan-transaksi") => {
  const data = transactions.map((tx) => {
    const person = people.find((p) => p.id === tx.personId);
    return {
      Tanggal: format(new Date(tx.date), "dd/MM/yyyy"),
      Nama: person?.name || "Tidak Diketahui",
      Jenis: tx.type === "hutang" ? "Hutang" : "Pembayaran",
      Kategori: tx.category,
      Nominal: tx.amount,
      Catatan: tx.notes || "",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");

  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
