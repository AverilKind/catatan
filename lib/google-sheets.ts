import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

function getAuth() {
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error("Kredensial Google belum disetel di Environment Variables");
  }

  // Handle newline characters in the private key
  const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: privateKey,
    },
    scopes: SCOPES,
  });
}

export async function appendToSheet(sheetName: string, values: any[]) {
  try {
    const spreadsheetId = process.env.SPREADSHEET_ID;
    if (!spreadsheetId) {
      console.warn("SPREADSHEET_ID tidak ditemukan. Lewati sinkronisasi Google Sheets.");
      return;
    }

    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`, // Append to the first empty row in this sheet
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [values],
      },
    });
    
    console.log(`Berhasil mengirim data ke Google Sheet: ${sheetName}`);
  } catch (error) {
    console.error("Gagal mengirim data ke Google Sheets:", error);
    // Kita tidak ingin melempar error agar tidak mengganggu transaksi utama
  }
}
