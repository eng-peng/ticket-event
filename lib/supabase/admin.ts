// File ini berfungsi untuk membuat client Supabase dengan hak SERVICE ROLE.
//
// Kapan dipakai (HANYA di kode server):
// - Untuk pekerjaan sistem yang harus berjalan dalam satu transaksi/atomik,
//   misalnya RPC reserve_tickets, konfirmasi pembayaran, penerbitan tiket,
//   mengubah role user, dan menulis audit log.
//
// PENTING / ATURAN KEAMANAN:
// - Client ini MEMBYPASS Row Level Security (RLS). Karena itu hanya boleh dipakai
//   lewat kode server yang kita tulis sendiri.
// - JANGAN pernah mengimpor file ini di komponen React / kode browser.
// - SUPABASE_SERVICE_ROLE_KEY tidak boleh muncul di NEXT_PUBLIC_* dan tidak boleh
//   dikirim ke frontend.

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// createAdminClient membuat client Supabase dengan service role key.
// Input : tidak ada (membaca URL + service role key dari env server).
// Output: instance Supabase client ber-hak penuh (melewati RLS).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        // Tidak menyimpan & tidak menyegarkan sesi: client ini bukan untuk login user,
        // melainkan untuk operasi sistem dengan service role.
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
