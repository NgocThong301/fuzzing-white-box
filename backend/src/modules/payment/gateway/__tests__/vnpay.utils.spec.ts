/**
 * VNPAY UTILITIES UNIT TESTS
 */

import {
  buildQueryString,
  createSecureHash,
  verifySecureHash,
  sortParams,
  formatVnpDate,
  generateTxnRef,
  convertAmountToVnpay,
  convertAmountFromVnpay,
  VnpayResponseCode,
  getVnpayResponseMessage,
  isVnpaySuccess,
  removeVietnameseDiacritics,
} from '../vnpay.utils';

describe('VNPAY Utilities', () => {
  const testSecretKey = 'test-secret-key-for-hmac-testing';

  describe('buildQueryString', () => {
    it('should build a sorted query string from params', () => {
      const params = {
        vnp_Amount: '1000000',
        vnp_Command: 'pay',
        vnp_CreateDate: '20210901153333',
        vnp_CurrCode: 'VND',
      };

      const result = buildQueryString(params);
      expect(result).toBe('vnp_Amount=1000000&vnp_Command=pay&vnp_CreateDate=20210901153333&vnp_CurrCode=VND');
    });

    it('should exclude undefined values', () => {
      const params = {
        vnp_Amount: '1000000',
        vnp_Command: 'pay',
        vnp_BankCode: undefined,
      };

      const result = buildQueryString(params);
      expect(result).toBe('vnp_Amount=1000000&vnp_Command=pay');
      expect(result).not.toContain('vnp_BankCode');
    });

    it('should exclude secure hash params', () => {
      const params = {
        vnp_Amount: '1000000',
        vnp_SecureHash: 'somehash',
        vnp_SecureHashType: 'SHA512',
      };

      const result = buildQueryString(params);
      expect(result).toBe('vnp_Amount=1000000');
      expect(result).not.toContain('vnp_SecureHash');
      expect(result).not.toContain('vnp_SecureHashType');
    });

    it('should handle empty params', () => {
      const result = buildQueryString({});
      expect(result).toBe('');
    });
  });

  describe('createSecureHash', () => {
    it('should create consistent hash for same input', () => {
      const params = {
        vnp_Amount: '1000000',
        vnp_Command: 'pay',
        vnp_CurrCode: 'VND',
      };

      const hash1 = createSecureHash(params, testSecretKey);
      const hash2 = createSecureHash(params, testSecretKey);

      expect(hash1).toBe(hash2);
    });

    it('should create different hash for different params', () => {
      const params1 = {
        vnp_Amount: '1000000',
        vnp_Command: 'pay',
      };

      const params2 = {
        vnp_Amount: '2000000',
        vnp_Command: 'pay',
      };

      const hash1 = createSecureHash(params1, testSecretKey);
      const hash2 = createSecureHash(params2, testSecretKey);

      expect(hash1).not.toBe(hash2);
    });

    it('should create different hash for different secret keys', () => {
      const params = {
        vnp_Amount: '1000000',
        vnp_Command: 'pay',
      };

      const hash1 = createSecureHash(params, 'secret1');
      const hash2 = createSecureHash(params, 'secret2');

      expect(hash1).not.toBe(hash2);
    });

    it('should return uppercase hexadecimal string', () => {
      const params = {
        vnp_Amount: '1000000',
        vnp_Command: 'pay',
      };

      const hash = createSecureHash(params, testSecretKey);
      expect(hash).toMatch(/^[A-F0-9]+$/);
    });

    it('should produce 128-character hash (SHA512)', () => {
      const params = {
        vnp_Amount: '1000000',
        vnp_Command: 'pay',
      };

      const hash = createSecureHash(params, testSecretKey);
      expect(hash.length).toBe(128);
    });
  });

  describe('verifySecureHash', () => {
    it('should verify valid signature', () => {
      const params = {
        vnp_Amount: '1000000',
        vnp_Command: 'pay',
        vnp_SecureHash: '',
      };

      const hash = createSecureHash(params, testSecretKey);
      params.vnp_SecureHash = hash;

      const result = verifySecureHash(params, testSecretKey);
      expect(result).toBe(true);
    });

    it('should reject invalid signature', () => {
      const params = {
        vnp_Amount: '1000000',
        vnp_Command: 'pay',
        vnp_SecureHash: 'invalidhash123456789012345678901234567890123456789012345678901234',
      };

      const result = verifySecureHash(params, testSecretKey);
      expect(result).toBe(false);
    });

    it('should reject missing signature', () => {
      const params = {
        vnp_Amount: '1000000',
        vnp_Command: 'pay',
      };

      const result = verifySecureHash(params, testSecretKey);
      expect(result).toBe(false);
    });

    it('should reject tampered params', () => {
      const params = {
        vnp_Amount: '1000000',
        vnp_Command: 'pay',
        vnp_SecureHash: '',
      };

      const hash = createSecureHash(params, testSecretKey);
      params.vnp_SecureHash = hash;

      // Tamper with amount
      params.vnp_Amount = '2000000';

      const result = verifySecureHash(params, testSecretKey);
      expect(result).toBe(false);
    });

    it('should reject wrong secret key', () => {
      const params = {
        vnp_Amount: '1000000',
        vnp_Command: 'pay',
        vnp_SecureHash: '',
      };

      const hash = createSecureHash(params, testSecretKey);
      params.vnp_SecureHash = hash;

      const result = verifySecureHash(params, 'different-secret-key');
      expect(result).toBe(false);
    });
  });

  describe('sortParams', () => {
    it('should sort params alphabetically by key', () => {
      const params = {
        zebra: 1,
        apple: 2,
        mango: 3,
      };

      const sorted = sortParams(params);
      const keys = Object.keys(sorted);

      expect(keys).toEqual(['apple', 'mango', 'zebra']);
    });
  });

  describe('formatVnpDate', () => {
    it('should format date to yyyyMMddHHmmss', () => {
      const date = new Date('2021-09-01T15:33:33');
      const result = formatVnpDate(date);
      expect(result).toBe('20210901153333');
    });

    it('should pad single digit month and day', () => {
      const date = new Date('2021-01-05T08:05:09');
      const result = formatVnpDate(date);
      expect(result).toBe('20210105080509');
    });
  });

  describe('generateTxnRef', () => {
    it('should generate transaction references with order ID', () => {
      const ref = generateTxnRef(123);
      expect(ref).toContain('ORD123');
    });

    it('should generate references in expected format', () => {
      const ref = generateTxnRef(456);
      expect(ref).toMatch(/^ORD456-\d+$/);
    });
  });

  describe('convertAmountToVnpay', () => {
    it('should multiply amount by 100', () => {
      expect(convertAmountToVnpay(100000)).toBe(10000000);
      expect(convertAmountToVnpay(1000.50)).toBe(100050);
      expect(convertAmountToVnpay(100)).toBe(10000);
    });

    it('should round the result', () => {
      expect(convertAmountToVnpay(1000.999)).toBe(100100);
    });
  });

  describe('convertAmountFromVnpay', () => {
    it('should divide amount by 100', () => {
      expect(convertAmountFromVnpay(10000000)).toBe(100000);
      expect(convertAmountFromVnpay(100050)).toBe(1000.5);
    });
  });

  describe('VnpayResponseCode', () => {
    it('should have correct success code', () => {
      expect(VnpayResponseCode.SUCCESS).toBe('00');
    });

    it('should have all expected codes', () => {
      expect(VnpayResponseCode.SUCCESS).toBe('00');
      expect(VnpayResponseCode.INVALID_SIGNATURE).toBe('97');
      expect(VnpayResponseCode.TRANSACTION_NOT_FOUND).toBe('01');
      expect(VnpayResponseCode.TRANSACTION_CANCELLED).toBe('24');
    });
  });

  describe('getVnpayResponseMessage', () => {
    it('should return success message for code 00', () => {
      expect(getVnpayResponseMessage('00')).toBe('Giao dịch thành công');
    });

    it('should return cancelled message for code 24', () => {
      expect(getVnpayResponseMessage('24')).toBe('Giao dịch bị hủy');
    });

    it('should return default message for unknown code', () => {
      expect(getVnpayResponseMessage('99')).toBe('Lỗi không xác định');
      expect(getVnpayResponseMessage('UNKNOWN')).toBe('Lỗi không xác định (UNKNOWN)');
    });
  });

  describe('isVnpaySuccess', () => {
    it('should return true for code 00', () => {
      expect(isVnpaySuccess('00')).toBe(true);
    });

    it('should return false for other codes', () => {
      expect(isVnpaySuccess('24')).toBe(false);
      expect(isVnpaySuccess('99')).toBe(false);
      expect(isVnpaySuccess('97')).toBe(false);
    });
  });

  describe('removeVietnameseDiacritics', () => {
    it('should remove diacritics from Vietnamese characters', () => {
      expect(removeVietnameseDiacritics('Nguyễn Văn A')).toBe('Nguyen Van A');
      expect(removeVietnameseDiacritics('Đặng')).toBe('Dang');
    });

    it('should keep non-Vietnamese characters unchanged', () => {
      expect(removeVietnameseDiacritics('ABC123')).toBe('ABC123');
    });

    it('should handle empty string', () => {
      expect(removeVietnameseDiacritics('')).toBe('');
    });
  });
});
