// File ini berfungsi untuk membuat client Supabase khusus SERVER.
//
// Kapan dipakai:
// - Di Route Handlers (app/api/*/route.ts), Server Components, dan Server Actions.
// - Untuk membaca sesi login lewat cookie (auth.getUser()) dan query data
//   dengan RLS tetap aktif (memakai anon key + cookie sesi user).
//
// JANGAN dipakai di komponen React yang berjalan di browser.
// Client ini memakai NEXT_PUBLIC_SUPABASE_ANON_KEY + cookie sesi, jadi hak aksesnya
// tetap mengikuti RLS seperti user tersebut.

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// createClient membuat client Supabase untuk server.
// Input : tidak ada (membaca URL/anon key dari env, cookie dari request).
// Output: Promise<Supabase client> yang dipakai di kode server.
//
// Catatan: fungsi ini async karena Next.js 16 membuat cookies() menjadi async.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // getAll: mengirim seluruh cookie request ke Supabase (dipakai baca sesi).
        getAll() {
          return cookieStore.getAll();
        },
        // setAll: menyimpan kembali cookie sesi yang diperbarui Supabase.
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Kenapa diabaikan: di Server Component cookie bersifat read-only,
            // jadi set() bisa gagal. Itu wajar; refresh sesi tetap ditangani
            // oleh middleware / Route Handler tempat cookie boleh ditulis.
          }
        },
      },
    },
  );
}
