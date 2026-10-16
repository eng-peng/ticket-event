// File ini berfungsi untuk membuat client Supabase khusus BROWSER (sisi React).
//
// Kapan dipakai:
// - HANYA di komponen React yang berjalan di browser (Client Component, 'use client').
// - Kegunaannya terbatas untuk hal yang butuh anon key di browser, misalnya:
//   membaca status sesi untuk keputusan tampilan (tombol mana yang muncul) dan
//   proses auth (login/logout) lewat Supabase Auth.
//
// JANGAN dipakai untuk mengakses data bisnis (order, payment, tiket, audit log).
// Data sensitif WAJIB lewat Route Handler di server.
// File ini memakai NEXT_PUBLIC_SUPABASE_ANON_KEY yang aman tampil di browser
// karena dilindungi Row Level Security (RLS).

import { createBrowserClient } from '@supabase/ssr';

// createClient membuat client Supabase untuk browser.
// Input : tidak ada (membaca konfigurasi dari environment variable publik).
// Output: instance Supabase client yang dipakai di komponen React browser.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
