// File ini berfungsi untuk endpoint tes kesehatan server.
// Endpoint: GET /api/health
// Gunanya untuk memastikan server Next.js hidup dan response standar bekerja.

import { successResponse } from '@/lib/api-response';

// GET mengembalikan status OK.
// Input : tidak ada.
// Output: response standar { success: true, data: { status: 'OK', ... }, error: null }.
export async function GET() {
  return successResponse({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
}
