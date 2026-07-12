"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Phone, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useStore } from "@/store/useStore";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/badge";

export default function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const { people, transactions } = useStore();
  const person = people.find((p) => p.id === id);

  if (!person) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <h2 className="text-2xl font-bold">Orang Tidak Ditemukan</h2>
          <Button onClick={() => router.push("/orang")}>Kembali</Button>
        </div>
      </AppLayout>
    );
  }

  const personTransactions = transactions.filter((t) => t.personId === id);
  const totalHutang = personTransactions
    .filter((t) => t.type === "hutang")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalBayar = personTransactions
    .filter((t) => t.type === "pembayaran")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const sisaHutang = totalHutang - totalBayar;
  
  const isLunas = sisaHutang <= 0;

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link href="/orang">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Detail Orang</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${person.name}`} />
                  <AvatarFallback>{person.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl">{person.name}</CardTitle>
              <div className="mt-2">
                {isLunas ? (
                  <Badge className="bg-green-500 hover:bg-green-600">Lunas</Badge>
                ) : (
                  <Badge variant="destructive">Belum Lunas</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{person.phone || "-"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{person.address || "-"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Dibuat: {format(new Date(person.createdAt), "dd MMM yyyy")}</span>
              </div>
              {person.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground font-medium mb-1">Catatan:</p>
                  <p className="text-sm">{person.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Hutang</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">{formatCurrency(totalHutang)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Dibayar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">{formatCurrency(totalBayar)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Sisa Hutang</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${isLunas ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(sisaHutang)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Riwayat Transaksi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {personTransactions.length > 0 ? (
                    personTransactions
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((tx) => (
                        <div key={tx.id} className="flex items-center">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-full border ${tx.type === 'hutang' ? 'bg-red-100 border-red-200 dark:bg-red-900/20' : 'bg-green-100 border-green-200 dark:bg-green-900/20'}`}>
                            {tx.type === "hutang" ? (
                              <ArrowLeft className="h-4 w-4 text-red-600 dark:text-red-400" />
                            ) : (
                              <ArrowLeft className="h-4 w-4 text-green-600 dark:text-green-400 rotate-180" />
                            )}
                          </div>
                          <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">{tx.category}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(tx.date), "dd MMM yyyy")} {tx.notes ? `- ${tx.notes}` : ""}
                            </p>
                          </div>
                          <div className={`ml-auto font-medium ${tx.type === "hutang" ? "text-red-500" : "text-green-500"}`}>
                            {tx.type === "hutang" ? "-" : "+"}{formatCurrency(tx.amount)}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Belum ada riwayat transaksi.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
