// File ini berfungsi untuk membentuk response standar { success, data, error }
// sesuai perjanjian di docs/api-contract.md bagian 1 & 2.
//
// Semua endpoint (Route Handler) sebaiknya memakai helper ini supaya bentuk
// response-nya konsisten: sukses selalu { success: true, data, error: null },
// gagal selalu { success: false, data: null, error: { code, message } }.

import { NextResponse } from 'next/server';

// Daftar kode error yang diizinkan beserta HTTP status default-nya.
// Sumber: docs/api-contract.md bagian 2.
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'EMAIL_ALREADY_REGISTERED'
  | 'OUT_OF_STOCK'
  | 'ORDER_EXPIRED'
  | 'TICKET_NOT_FOUND'
  | 'TICKET_ALREADY_USED'
  | 'PAYMENT_FAILED'
  | 'ORDER_NOT_PAYABLE'
  | 'RATE_LIMITED'
  | 'METHOD_NOT_ALLOWED'
  | 'INTERNAL_ERROR';

// Pemetaan kode error -> HTTP status.
// Kenapa dipisah: supaya pemanggil tidak perlu mengingat status HTTP tiap error;
// cukup sebut kodenya, status otomatis terisi dengan benar.
const HTTP_STATUS_BY_CODE: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  EMAIL_ALREADY_REGISTERED: 409,
  OUT_OF_STOCK: 409,
  ORDER_EXPIRED: 409,
  TICKET_NOT_FOUND: 404,
  TICKET_ALREADY_USED: 409,
  PAYMENT_FAILED: 400,
  ORDER_NOT_PAYABLE: 409,
  RATE_LIMITED: 429,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_ERROR: 500,
};

// successResponse membentuk response sukses standar.
// Input : data (isi response) dan status HTTP opsional (default 200).
// Output: NextResponse JSON { success: true, data, error: null }.
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data, error: null }, { status });
}

// errorResponse membentuk response gagal standar.
// Input : code (kode error dari daftar), message (Bahasa Indonesia untuk pengguna),
//         dan status HTTP opsional (biasanya null agar diambil dari kode).
// Output: NextResponse JSON { success: false, data: null, error: { code, message } }.
export function errorResponse(
  code: ErrorCode,
  message: string,
  status?: number,
): NextResponse {
  return NextResponse.json(
    { success: false, data: null, error: { code, message } },
    { status: status ?? HTTP_STATUS_BY_CODE[code] },
  );
}
