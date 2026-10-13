/**
 * VNPAY UTILITY MODULE
 * ====================
 *
 * Utility functions for VNPAY payment integration
 * Implements HMAC-SHA512 for secure hash generation and verification
 * Following VNPAY Sandbox API v2.1.0 specification
 *
 * @see https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
 */

import * as crypto from 'crypto';

/**
 * VNPAY Hash Algorithm
 */
export const VNPAY_HASH_ALGORITHM = 'sha512';

/**
 * Secure hash parameters that should be excluded from signature verification
 */
export const VNPAY_SECURE_HASH_PARAMS = ['vnp_SecureHash', 'vnp_SecureHashType'];

/**
 * Build a sorted query string from VNPAY parameters
 * Used for creating the hash data string
 *
 * @param params - Object containing VNPAY parameters
 * @returns Sorted query string (key=value&key=value...)
 */
export function buildQueryString(params: Record<string, string | number | undefined>): string {
  // Filter out undefined values and secure hash params
  const filteredParams: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && !VNPAY_SECURE_HASH_PARAMS.includes(key)) {
      filteredParams[key] = String(value);
    }
  }

  // Sort parameters by key
  const sortedKeys = Object.keys(filteredParams).sort();

  // Build query string
  const queryParts: string[] = [];
  for (const key of sortedKeys) {
    queryParts.push(`${key}=${filteredParams[key]}`);
  }

  return queryParts.join('&');
}

/**
 * Create HMAC-SHA512 secure hash for VNPAY parameters
 *
 * @param params - Object containing VNPAY parameters
 * @param secretKey - VNPAY Hash Secret key
 * @returns Uppercase hexadecimal hash string
 */
export function createSecureHash(
  params: Record<string, string | number | undefined>,
  secretKey: string,
): string {
  const hashData = buildQueryString(params);
  const hmac = crypto.createHmac(VNPAY_HASH_ALGORITHM, secretKey);
  hmac.update(hashData);
  return hmac.digest('hex').toUpperCase();
}

/**
 * Verify HMAC-SHA512 secure hash from VNPAY callback
 *
 * @param params - Object containing VNPAY parameters including vnp_SecureHash
 * @param secretKey - VNPAY Hash Secret key
 * @returns true if hash is valid, false otherwise
 */
export function verifySecureHash(
  params: Record<string, string | undefined>,
  secretKey: string,
): boolean {
  const receivedHash = params.vnp_SecureHash;

  if (!receivedHash) {
    return false;
  }

  // Create hash from params (excluding secure hash params)
  const calculatedHash = createSecureHash(params, secretKey);

  // Use timing-safe comparison to prevent timing attacks
  try {
    const receivedBuffer = Buffer.from(receivedHash.toLowerCase(), 'hex');
    const calculatedBuffer = Buffer.from(calculatedHash.toLowerCase(), 'hex');

    if (receivedBuffer.length !== calculatedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(receivedBuffer, calculatedBuffer);
  } catch {
    return false;
  }
}

/**
 * Sort VNPAY parameters alphabetically by key
 * Used for building hash data string
 *
 * @param params - Object containing VNPAY parameters
 * @returns Sorted object by key
 */
export function sortParams<T extends Record<string, string | number | undefined>>(params: T): T {
  const sorted: Record<string, string | number | undefined> = {};

  for (const key of Object.keys(params).sort()) {
    sorted[key] = params[key];
  }

  return sorted as T;
}

/**
 * Format date to VNPAY format (yyyyMMddHHmmss)
 * IMPORTANT: VNPAY yêu cầu timezone UTC+7 (Asia/Ho_Chi_Minh)
 *
 * @param date - Date object
 * @returns Formatted date string
 */
export function formatVnpDate(date: Date): string {
  // Force use Asia/Ho_Chi_Minh timezone (UTC+7) for VNPAY
  const vietnamTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const year = vietnamTime.getFullYear();
  const month = String(vietnamTime.getMonth() + 1).padStart(2, '0');
  const day = String(vietnamTime.getDate()).padStart(2, '0');
  const hours = String(vietnamTime.getHours()).padStart(2, '0');
  const minutes = String(vietnamTime.getMinutes()).padStart(2, '0');
  const seconds = String(vietnamTime.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Generate unique transaction reference for VNPAY
 *
 * @param orderId - Order ID
 * @returns Unique transaction reference string
 */
export function generateTxnRef(orderId: number): string {
  const timestamp = Date.now();
  return `ORD${orderId}-${timestamp}`;
}

/**
 * Convert amount to VNPAY format (multiply by 100)
 * VNPAY requires amount without decimal separator
 *
 * @param amount - Amount in VND (e.g., 100000.00)
 * @returns Amount in VNPAY format (e.g., 10000000)
 */
export function convertAmountToVnpay(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert amount from VNPAY format (divide by 100)
 *
 * @param vnpayAmount - Amount from VNPAY (e.g., 10000000)
 * @returns Amount in VND (e.g., 100000.00)
 */
export function convertAmountFromVnpay(vnpayAmount: number): number {
  return vnpayAmount / 100;
}

/**
 * VNPAY Response Codes
 */
export enum VnpayResponseCode {
  SUCCESS = '00',
  // Error codes
  INVALID_SIGNATURE = '97',
  TRANSACTION_NOT_FOUND = '01',
  CONFIRM_FAILED = '02',
  INVALID_AMOUNT = '04',
  INVALID_TRANSACTION = '05',
  BANK_NOT_SUPPORT = '09',
  TRANSACTION_EXPIRED = '11',
  TRANSACTION_PENDING = '12',
  TRANSACTION_PROCESSING = '13',
  TRANSACTION_CANCELLED = '24',
  TRANSACTION_DECLINED = '51',
  INSUFFICIENT_BALANCE = '65',
  TOO_MANY_REQUESTS = '75',
  MAINTENANCE = '81',
  UNKNOWN_ERROR = '99',
}

/**
 * Map VNPAY response code to human-readable message
 *
 * @param code - VNPAY response code
 * @returns Human-readable message
 */
export function getVnpayResponseMessage(code: string): string {
  const messages: Record<string, string> = {
    '00': 'Giao dịch thành công',
    '01': 'Giao dịch không tồn tại',
    '02': 'Xác nhận giao dịch thất bại',
    '04': 'Số tiền không hợp lệ',
    '05': 'Giao dịch không hợp lệ',
    '09': 'Ngân hàng không hỗ trợ',
    '11': 'Giao dịch đã hết hạn',
    '12': 'Giao dịch đang chờ xử lý',
    '13': 'Giao dịch đang được xử lý',
    '24': 'Giao dịch bị hủy',
    '51': 'Giao dịch bị từ chối',
    '65': 'Tài khoản không đủ số dư',
    '75': 'Quá nhiều yêu cầu',
    '81': 'Hệ thống đang bảo trì',
    '97': 'Chữ ký không hợp lệ',
    '99': 'Lỗi không xác định',
  };

  return messages[code] || `Lỗi không xác định (${code})`;
}

/**
 * Check if VNPAY response code indicates success
 *
 * @param code - VNPAY response code
 * @returns true if code indicates success
 */
export function isVnpaySuccess(code: string): boolean {
  return code === '00';
}

/**
 * Parse VNPAY callback parameters to standard format
 *
 * @param queryString - Raw query string from VNPAY callback
 * @returns Object with parsed parameters
 */
export function parseVnpayCallback(queryString: string): Record<string, string> {
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(queryString);

  for (const [key, value] of searchParams) {
    if (value !== null) {
      params[key] = value;
    }
  }

  return params;
}

/**
 * Remove Vietnamese diacritics from string
 * VNPAY requires OrderInfo without special characters
 *
 * @param text - Text with potential Vietnamese characters
 * @returns Text without Vietnamese diacritics
 */
export function removeVietnameseDiacritics(text: string): string {
  const map: Record<string, string> = {
    'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
    'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
    'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
    'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
    'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
    'đ': 'd',
    'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A',
    'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A',
    'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
    'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E',
    'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O',
    'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O',
    'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U',
    'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
    'Đ': 'D',
  };

  return text.replace(/[^a-zA-Z0-9\s]/g, (char) => map[char] || char);
}
