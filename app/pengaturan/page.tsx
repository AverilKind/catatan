"use client";

import { useRef } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Download, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PasswordPrompt } from "@/components/password-prompt";
import { resetAllData, migrateLocalData } from "@/app/actions/settings";
import { verifyPassword } from "@/app/actions/auth";
import { useState, useEffect } from "react";

export default function PengaturanPage() {
  const { theme, setTheme } = useTheme();
  const { people, transactions } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showMigratePrompt, setShowMigratePrompt] = useState(false);



  const handleExportData = () => {
    const data = {
      people,
      transactions,
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `backup-catatan-hutang-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Berhasil mendownload backup data");
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (!data.people || !data.transactions) {
          throw new Error("Format data tidak valid");
        }

        if (confirm("Data saat ini akan ditimpa dengan data dari file backup. Lanjutkan?")) {
          importData(data);
          toast.success("Data berhasil di-restore");
        }
      } catch (error) {
        toast.error("Gagal membaca file backup. Pastikan formatnya benar.");
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleResetDataClick = () => {
    setShowPasswordPrompt(true);
  };

  const handlePasswordSubmit = async (password: string) => {
    const isValid = await verifyPassword(password);
    if (!isValid) {
      toast.error("Password salah");
      return;
    }

    if (confirm("PERINGATAN: Semua data orang dan transaksi akan dihapus secara permanen. Apakah Anda yakin?")) {
      const res = await resetAllData(password);
      if (res.success) {
        toast.success("Seluruh data berhasil direset");
        setShowPasswordPrompt(false);
        window.location.reload();
      } else {
        toast.error(res.error || "Gagal mereset data");
      }
    } else {
      setShowPasswordPrompt(false);
    }
  };

  const handleMigrateData = async (password: string) => {
    const isValid = await verifyPassword(password);
    if (!isValid) {
      toast.error("Password salah");
      return;
    }

    const localData = localStorage.getItem("catatan-hutang-storage");
    if (!localData) {
      toast.error("Data lokal tidak ditemukan");
      setShowMigratePrompt(false);
      return;
    }

    try {
      const parsed = JSON.parse(localData);
      const dataToMigrate = {
        people: parsed.state?.people || [],
        transactions: parsed.state?.transactions || []
      };

      const res = await migrateLocalData(dataToMigrate, password);
      if (res.success) {
        toast.success("Data lokal berhasil dimigrasi ke database online!");
        setShowMigratePrompt(false);
        setHasLocalData(false);
        // Optional: clear local storage so they don't migrate again?
        // localStorage.removeItem("catatan-hutang-storage");
        window.location.reload();
      } else {
        toast.error(res.error || "Gagal memigrasi data");
      }
    } catch (e) {
      toast.error("Gagal membaca data lokal");
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
          <p className="text-muted-foreground">Kelola preferensi aplikasi dan data Anda.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tema Aplikasi</CardTitle>
            <CardDescription>Pilih tema visual untuk aplikasi.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              defaultValue={theme}
              onValueChange={(value) => setTheme(value)}
              className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              <div>
                <RadioGroupItem value="light" id="theme-light" className="peer sr-only" />
                <Label
                  htmlFor="theme-light"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Sun className="mb-3 h-6 w-6" />
                  Terang
                </Label>
              </div>
              <div>
                <RadioGroupItem value="dark" id="theme-dark" className="peer sr-only" />
                <Label
                  htmlFor="theme-dark"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Moon className="mb-3 h-6 w-6" />
                  Gelap
                </Label>
              </div>
              <div>
                <RadioGroupItem value="system" id="theme-system" className="peer sr-only" />
                <Label
                  htmlFor="theme-system"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Monitor className="mb-3 h-6 w-6" />
                  Sistem
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manajemen Data</CardTitle>
            <CardDescription>
              Seluruh data Anda saat ini tersimpan aman di Database Online (Neon). Namun Anda tetap bisa mengunduh salinannya.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">Export Data (Backup)</p>
                <p className="text-sm text-muted-foreground">
                  Download semua data (Orang dan Transaksi) ke dalam file JSON.
                </p>
              </div>
              <Button onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" /> Export JSON
              </Button>
            </div>


            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Reset Data</p>
                  <p className="text-sm text-muted-foreground">
                    Hapus seluruh data dari aplikasi ini secara permanen.
                  </p>
                </div>
                <Button variant="destructive" onClick={handleResetDataClick}>
                  <Trash2 className="mr-2 h-4 w-4" /> Reset Semua Data
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-6 border-t">
              <div>
                <p className="font-medium text-blue-600 dark:text-blue-400">Migrasi Data Lokal</p>
                <p className="text-sm text-muted-foreground">
                  Klik tombol ini untuk menyedot data lama yang masih tersimpan di memori browser ini ke Database Online.
                </p>
              </div>
              <Button onClick={() => setShowMigratePrompt(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Upload className="mr-2 h-4 w-4" /> Migrasi ke Database
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <PasswordPrompt
        isOpen={showPasswordPrompt}
        onClose={() => setShowPasswordPrompt(false)}
        onSubmit={handlePasswordSubmit}
      />
      <PasswordPrompt
        isOpen={showMigratePrompt}
        onClose={() => setShowMigratePrompt(false)}
        onSubmit={handleMigrateData}
      />
    </AppLayout>
  );
}
