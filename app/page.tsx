"use client";

import { useStore } from "@/store/useStore";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, CreditCard, Users, Wallet } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function Dashboard() {
  const { people, transactions } = useStore();

  const totalHutang = transactions
    .filter((t) => t.type === "hutang")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPembayaran = transactions
    .filter((t) => t.type === "pembayaran")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const sisaHutang = totalHutang - totalPembayaran;

  // Chart Data preparation (Last 30 Days mock logic or simple grouping by date)
  const chartData = transactions.reduce((acc: any[], curr) => {
    const date = new Date(curr.date).toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
    });
    
    const existingDate = acc.find((item) => item.date === date);
    if (existingDate) {
      if (curr.type === "hutang") existingDate.hutang += curr.amount;
      if (curr.type === "pembayaran") existingDate.pembayaran += curr.amount;
    } else {
      acc.push({
        date,
        hutang: curr.type === "hutang" ? curr.amount : 0,
        pembayaran: curr.type === "pembayaran" ? curr.amount : 0,
      });
    }
    return acc;
  }, []).slice(-30);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Ringkasan catatan hutang dan pembayaran Anda.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sisa Hutang
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                {formatCurrency(sisaHutang)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Hutang
              </CardTitle>
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalHutang)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pembayaran
              </CardTitle>
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalPembayaran)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Statistik
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{people.length} Orang</div>
              <p className="text-xs text-muted-foreground">
                {transactions.length} Transaksi
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Grafik Transaksi</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={chartData}>
                    <XAxis
                      dataKey="date"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `Rp ${value / 1000}k`}
                    />
                    <Tooltip
                      formatter={(value: any) => formatCurrency(value)}
                    />
                    <Bar dataKey="hutang" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pembayaran" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[350px] items-center justify-center text-muted-foreground">
                  Belum ada data transaksi
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Transaksi Terakhir</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {transactions
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .slice(0, 5)
                  .map((transaction) => {
                    const person = people.find(
                      (p) => p.id === transaction.personId
                    );
                    return (
                      <div key={transaction.id} className="flex items-center">
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {person?.name || "Tidak Diketahui"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                        <div
                          className={`ml-auto font-medium ${
                            transaction.type === "hutang"
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          {transaction.type === "hutang" ? "-" : "+"}
                          {formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    );
                  })}
                {transactions.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-4">
                    Belum ada transaksi
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
