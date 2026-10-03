import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  // Verifikasi Authorization header untuk keamanan Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 1. Ambil semua data dari database
    const persons = await prisma.person.findMany();
    const transactions = await prisma.transaction.findMany();

    const data = {
      persons,
      transactions,
      timestamp: new Date().toISOString()
    };

    // 2. Buat file JSON di memory
    const fileContent = JSON.stringify(data, null, 2);
    
    // Gunakan zona waktu lokal untuk nama file
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `backup_catatan_${dateStr}.json`;
    
    const fileBlob = new Blob([fileContent], { type: 'application/json' });

    // 3. Siapkan form data untuk dikirim ke Telegram
    const formData = new FormData();
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!chatId) {
        throw new Error('TELEGRAM_CHAT_ID is not set in environment variables');
    }

    formData.append('chat_id', chatId);
    formData.append('document', fileBlob, fileName);
    formData.append('caption', `📦 Daily Database Backup\nDate: ${new Date().toLocaleDateString('id-ID')}\nTotal Persons: ${persons.length}\nTotal Transactions: ${transactions.length}`);

    // 4. Kirim ke Telegram API
    const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendDocument`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Telegram API Error: ${JSON.stringify(error)}`);
    }

    return NextResponse.json({ success: true, message: 'Backup sent to Telegram' });
  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
