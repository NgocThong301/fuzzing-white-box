/**
 * VNPAY SANDBOX GATEWAY
 * =====================
 *
 * VNPAY Sandbox payment gateway integration
 *
 * ⚠️  IMPORTANT: This is a SANDBOX/TEST environment
 * - DO NOT use real credit cards
 * - DO NOT use real bank accounts
 * - All transactions are MOCK
 *
 * @see https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
 */

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import {
  createSecureHash,
  verifySecureHash,
  formatVnpDate,
  generateTxnRef,
  convertAmountToVnpay,
  convertAmountFromVnpay,
  isVnpaySuccess,
  getVnpayResponseMessage,
  removeVietnameseDiacritics,
  buildQueryString,
} from './vnpay.utils';

export interface VnpayPaymentRequest {
  orderId: number;
  amount: number;
  orderInfo: string;
  ipAddress: string;
  returnUrl: string;
  ipnUrl: string;
}

export interface VnpayPaymentResponse {
  paymentUrl: string;
  txnRef: string;
  amount: number;
  expiresAt: Date;
}

export interface VnpayCallbackData {
  vnp_Amount: string;
  vnp_BankCode?: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
  vnp_SecureHashType?: string;
  [key: string]: string | undefined;
}

export interface VnpayVerificationResult {
  verified: boolean;
  error?: string;
  data?: VnpayCallbackData;
}

export interface VnpayPaymentResult {
  success: boolean;
  responseCode: string;
  message: string;
  amount?: number;
  transactionNo?: string;
  payDate?: string;
}

@Injectable()
export class VnpayGateway {
  private readonly tmnCode: string;
  private readonly hashSecret: string;
  private readonly paymentUrl: string;
  private readonly apiUrl: string;
  private readonly version: string;
  private readonly command: string;
  private readonly currencyCode: string;
  private readonly locale: string;
  private readonly orderType: string;
  private enabled: boolean = true;

  constructor(private readonly configService: NestConfigService) {
    // Load VNPAY configuration from environment, use sandbox defaults if not set
    this.tmnCode = this.configService.get<string>('VNPAY_TMN_CODE') || 'SANDBOX_TMN';
    this.hashSecret = this.configService.get<string>('VNPAY_HASH_SECRET') || 'SANDBOX_SECRET_HASH_MIN_10_CHARS';
    this.paymentUrl = this.configService.get<string>(
      'VNPAY_PAYMENT_URL',
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    );
    this.apiUrl = this.configService.get<string>(
      'VNPAY_API_URL',
      'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
    );
    this.version = this.configService.get<string>('VNPAY_VERSION', '2.1.0');
    this.command = this.configService.get<string>('VNPAY_COMMAND', 'pay');
    this.currencyCode = this.configService.get<string>('VNPAY_CURR_CODE', 'VND');
    this.locale = this.configService.get<string>('VNPAY_LOCALE', 'vn');
    this.orderType = this.configService.get<string>('VNPAY_ORDER_TYPE', 'other');

    // Validate required configuration
    this.validateConfiguration();
  }

  /**
   * Validate VNPAY configuration
   * Uses sandbox defaults if not configured
   */
  private validateConfiguration(): void {
    const errors: string[] = [];

    if (!this.tmnCode) {
      errors.push('VNPAY_TMN_CODE');
    }

    if (!this.hashSecret || this.hashSecret.length < 10) {
      errors.push('VNPAY_HASH_SECRET');
    }

    if (errors.length > 0) {
      console.warn(`[VNPAY] Warning: Missing configuration: ${errors.join(', ')}. Using sandbox defaults.`);
      this.enabled = false;
    } else {
      this.enabled = true;
      console.log(`[VNPAY] Gateway initialized (sandbox mode)`);
    }
  }

  /**
   * Create payment URL for VNPAY
   *
   * @param request - Payment request data
   * @returns Payment URL and transaction details
   */
  createPaymentUrl(request: VnpayPaymentRequest): VnpayPaymentResponse {
    const { orderId, amount, orderInfo, ipAddress, returnUrl } = request;

    // Generate unique transaction reference
    const txnRef = generateTxnRef(orderId);

    // Convert amount to VNPAY format (multiply by 100)
    const vnpayAmount = convertAmountToVnpay(amount);

    // Current timestamp
    const createDate = formatVnpDate(new Date());

    // Expire time (24 hours for sandbox compatibility)
    const expireDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const expireDateStr = formatVnpDate(expireDate);

    // Clean order info (remove Vietnamese diacritics as per VNPAY requirement)
    const cleanOrderInfo = removeVietnameseDiacritics(orderInfo).substring(0, 255);

    // Build parameters object
    const params: Record<string, string> = {
      vnp_Version: this.version,
      vnp_Command: this.command,
      vnp_TmnCode: this.tmnCode,
      vnp_Amount: String(vnpayAmount),
      vnp_CurrCode: this.currencyCode,
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: cleanOrderInfo,
      vnp_OrderType: this.orderType,
      vnp_Locale: this.locale,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddress,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDateStr,
    };

    // Create secure hash
    const secureHash = createSecureHash(params, this.hashSecret);

    // Build payment URL
    const queryString = buildQueryString(params);
    const paymentUrl = `${this.paymentUrl}?${queryString}&vnp_SecureHash=${secureHash}`;

    return {
      paymentUrl,
      txnRef,
      amount,
      expiresAt: expireDate,
    };
  }

  /**
   * Verify callback data from VNPAY
   *
   * @param callbackData - Raw callback data from VNPAY
   * @returns Verification result
   */
  verifyCallback(callbackData: Record<string, string>): VnpayVerificationResult {
    // Verify signature first
    const isValidSignature = verifySecureHash(callbackData, this.hashSecret);

    if (!isValidSignature) {
      return {
        verified: false,
        error: 'Invalid signature',
      };
    }

    // Parse callback data
    const data: VnpayCallbackData = {
      vnp_Amount: callbackData.vnp_Amount || '',
      vnp_BankCode: callbackData.vnp_BankCode,
      vnp_BankTranNo: callbackData.vnp_BankTranNo,
      vnp_CardType: callbackData.vnp_CardType,
      vnp_OrderInfo: callbackData.vnp_OrderInfo || '',
      vnp_PayDate: callbackData.vnp_PayDate || '',
      vnp_ResponseCode: callbackData.vnp_ResponseCode || '',
      vnp_TmnCode: callbackData.vnp_TmnCode || '',
      vnp_TransactionNo: callbackData.vnp_TransactionNo || '',
      vnp_TxnRef: callbackData.vnp_TxnRef || '',
      vnp_SecureHash: callbackData.vnp_SecureHash || '',
      vnp_SecureHashType: callbackData.vnp_SecureHashType,
    };

    // Verify TmnCode matches
    if (data.vnp_TmnCode !== this.tmnCode) {
      return {
        verified: false,
        error: 'TmnCode mismatch',
      };
    }

    return {
      verified: true,
      data,
    };
  }

  /**
   * Process payment result from VNPAY callback
   *
   * @param callbackData - Verified callback data
   * @returns Payment result
   */
  processPaymentResult(callbackData: VnpayCallbackData): VnpayPaymentResult {
    const { vnp_ResponseCode, vnp_Amount, vnp_TransactionNo, vnp_PayDate } = callbackData;

    const success = isVnpaySuccess(vnp_ResponseCode);
    const message = getVnpayResponseMessage(vnp_ResponseCode);

    return {
      success,
      responseCode: vnp_ResponseCode,
      message,
      amount: convertAmountFromVnpay(Number(vnp_Amount)),
      transactionNo: vnp_TransactionNo,
      payDate: vnp_PayDate,
    };
  }

  /**
   * Get payment status from response code
   *
   * @param responseCode - VNPAY response code
   * @returns Payment status string
   */
  getPaymentStatus(responseCode: string): 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'PENDING' {
    if (isVnpaySuccess(responseCode)) {
      return 'SUCCESS';
    }

    // Cancelled by user
    if (responseCode === '24') {
      return 'CANCELLED';
    }

    // Pending or processing
    if (responseCode === '12' || responseCode === '13') {
      return 'PENDING';
    }

    // Failed
    return 'FAILED';
  }

  /**
   * Get gateway configuration info (safe for logging)
   */
  getGatewayInfo(): { tmnCode: string; version: string; currencyCode: string } {
    return {
      tmnCode: this.tmnCode.substring(0, 4) + '****', // Masked
      version: this.version,
      currencyCode: this.currencyCode,
    };
  }
}
