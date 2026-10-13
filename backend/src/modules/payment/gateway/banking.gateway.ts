/**
 * BANKING PAYMENT GATEWAY
 * =======================
 *
 * Handles manual bank transfer payment flow:
 * 1. Generate unique transaction reference for user to use when transferring
 * 2. Validate bank transfer reference when user submits
 * 3. Process confirmation (Admin approves)
 *
 * This is for manual bank transfer where user copies the transaction ID
 * and transfers money to the seller's bank account, then enters the
 * transfer reference to confirm payment.
 */

import { Injectable } from '@nestjs/common';

export interface BankingTransactionRequest {
  orderId: number;
  amount: number;
  orderNumber: string;
}

export interface BankingTransactionResponse {
  transactionRef: string;
  amount: number;
  orderNumber: string;
  expiresAt: Date;
}

export interface BankingConfirmationData {
  transactionRef: string;
  bankTransferRef: string;
  transferAmount: number;
  transferDate: Date;
}

export interface BankingConfirmationResult {
  valid: boolean;
  message: string;
  transactionRef?: string;
}

/**
 * Bank account information for receiving payments
 * In production, this should come from a database or config
 */
const BANK_ACCOUNTS = [
  {
    bankName: 'Vietcombank',
    bankCode: 'VCB',
    accountNumber: '1234567890',
    accountName: 'CONG TY TNHH SACH GIA RE',
    branch: 'TP.HCM',
  },
  {
    bankName: 'MB Bank',
    bankCode: 'MB',
    accountNumber: '0987654321',
    accountName: 'CONG TY TNHH SACH GIA RE',
    branch: 'Ha Noi',
  },
];

@Injectable()
export class BankingPaymentGateway {
  /**
   * Generate a unique transaction reference for bank transfer
   *
   * Format: SGR-{ORDER_ID}-{TIMESTAMP}-{RANDOM}
   * Example: SGR-123-1699999999-5678
   */
  generateTransactionRef(request: BankingTransactionRequest): BankingTransactionResponse {
    const { orderId, amount, orderNumber } = request;

    // Generate unique reference
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');

    const transactionRef = `SGR${orderId}-${timestamp}-${random}`;

    // Expire after 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return {
      transactionRef,
      amount,
      orderNumber,
      expiresAt,
    };
  }

  /**
   * Validate bank transfer reference format
   *
   * @param bankTransferRef - The reference user enters after making transfer
   * @returns Validation result
   */
  validateBankTransferRef(bankTransferRef: string): BankingConfirmationResult {
    // Basic validation
    if (!bankTransferRef || bankTransferRef.trim().length === 0) {
      return {
        valid: false,
        message: 'Vui lòng nhập mã giao dịch chuyển khoản',
      };
    }

    // Trim and normalize
    const normalizedRef = bankTransferRef.trim().toUpperCase();

    // Check length (most bank transfer refs are 6-20 characters)
    if (normalizedRef.length < 6 || normalizedRef.length > 30) {
      return {
        valid: false,
        message: 'Mã giao dịch không hợp lệ. Vui lòng kiểm tra lại.',
      };
    }

    // Check format (alphanumeric and some common characters)
    const validFormat = /^[A-Z0-9\-_]+$/;
    if (!validFormat.test(normalizedRef)) {
      return {
        valid: false,
        message: 'Mã giao dịch chỉ được chứa chữ cái và số',
      };
    }

    return {
      valid: true,
      message: 'Mã giao dịch hợp lệ',
      transactionRef: normalizedRef,
    };
  }

  /**
   * Verify transfer amount matches expected amount
   *
   * @param transferredAmount - Amount from bank transfer
   * @param expectedAmount - Expected amount from order
   * @returns true if amounts match
   */
  verifyAmount(transferredAmount: number, expectedAmount: number): boolean {
    // Allow small difference due to potential rounding or fees
    const tolerance = 1000; // 1,000 VND tolerance
    return Math.abs(transferredAmount - expectedAmount) <= tolerance;
  }

  /**
   * Get bank account information for display
   * In production, this should come from a secure source
   */
  getBankAccounts(): typeof BANK_ACCOUNTS {
    return BANK_ACCOUNTS.map((account) => ({
      ...account,
      // Don't expose full account number in frontend
      maskedAccountNumber: this.maskAccountNumber(account.accountNumber),
    }));
  }

  /**
   * Mask account number for display (show first and last 4 digits)
   */
  private maskAccountNumber(accountNumber: string): string {
    if (accountNumber.length <= 8) {
      return accountNumber;
    }
    const first = accountNumber.substring(0, 4);
    const last = accountNumber.substring(accountNumber.length - 4);
    const masked = '*'.repeat(accountNumber.length - 8);
    return `${first}${masked}${last}`;
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Generate payment description for bank transfer
   */
  generatePaymentDescription(orderNumber: string, transactionRef: string): string {
    return `SGR ${orderNumber} - ${transactionRef}`;
  }
}
