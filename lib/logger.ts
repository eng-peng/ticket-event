// File ini berfungsi untuk mencatat APPLICATION LOG (untuk developer/debugging)
// dalam format JSON satu baris, sesuai docs/logging.md.
//
// Perbedaan penting:
// - File ini = application log (console, dibaca developer di Vercel/lokal).
// - Audit log = ditulis ke tabel `audit_logs` (bukan tugas file ini).
//
// Level yang dipakai: info | warn | error.
// JANGAN mencatat data sensitif (password, token sesi, qr_token, email lengkap,
// service role key, data kartu). Kalau ragu, jangan dicatat.

export type LogLevel = 'info' | 'warn' | 'error';

// Metadata opsional yang aman untuk ikut dicatat.
export interface LogMeta {
  requestId?: string; // id unik per request (opsional)
  userId?: string; // id user yang login (opsional, JANGAN email)
  context?: Record<string, unknown>; // info tambahan yang aman (id, status, angka)
}

// write menulis satu baris log JSON ke console.
// Input : level, message (deskripsi singkat), dan meta opsional.
// Output: tidak ada (efek samping: menulis ke console.log/warn/error).
function write(level: LogLevel, message: string, meta?: LogMeta): void {
  const entry = {
    timestamp: new Date().toISOString(), // ISO8601 UTC
    level,
    message,
    // Field opsional hanya dimasukkan bila ada isinya, agar log tetap ringkas.
    ...(meta?.requestId ? { requestId: meta.requestId } : {}),
    ...(meta?.userId ? { userId: meta.userId } : {}),
    ...(meta?.context ? { context: meta.context } : {}),
  };

  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

// newRequestId membuat id request sederhana untuk keperluan trace di log.
// Input : tidak ada.
// Output: string id unik (mis. dipakai sebagai meta.requestId).
export function newRequestId(): string {
  return `req_${crypto.randomUUID()}`;
}

// logger adalah objek utama yang dipakai di seluruh aplikasi.
export const logger = {
  // info: kejadian normal yang berguna (request masuk, tiket terbit, cron selesai).
  info: (message: string, meta?: LogMeta) => write('info', message, meta),
  // warn: situasi mencurigakan tapi belum fatal (login gagal, signature invalid).
  warn: (message: string, meta?: LogMeta) => write('warn', message, meta),
  // error: terjadi exception/error (query gagal, RPC gagal).
  error: (message: string, meta?: LogMeta) => write('error', message, meta),
};
