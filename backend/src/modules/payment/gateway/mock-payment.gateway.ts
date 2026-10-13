/**
 * MOCK PAYMENT GATEWAY
 * ====================
 * 
 * ⚠️  CẢNH BÁO: ĐÂY LÀ HỆ THỐNG MÔ PHỎNG DÀNH CHO MỤC ĐÍCH HỌC TẬP
 * 
 * - KHÔNG sử dụng thẻ thật, số thẻ thật, CVV thật
 * - KHÔNG sử dụng tài khoản ngân hàng thật
 * - KHÔNG có tiền thật được chuyển
 * - Tất cả giao dịch đều là MOCK/SANDBOX
 * 
 * Mục đích: Học cách tích hợp payment gateway trong môi trường an toàn
 * 
 * 🚀 Trong môi trường production, thay thế bằng:
 * - Stripe, PayPal, VNPay, MoMo, ZaloPay, v.v.
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MockGatewayRequest,
  MockGatewayResponse,
  MockGatewayCallback,
} from '../dto';

@Injectable()
export class MockPaymentGateway {
  private readonly gatewayId: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    // Mock gateway credentials - chỉ dùng cho môi trường development
    this.gatewayId = this.configService.get<string>('MOCK_GATEWAY_ID', 'MOCK_GW_001');
    this.apiKey = this.configService.get<string>('MOCK_GATEWAY_KEY', 'mock-secret-key-do-not-use-in-production');
  }

  /**
   * Tạo payment session với mock gateway
   * Trong thực tế, đây sẽ gọi API của Stripe/PayPal/v.v.
   */
  async createPaymentSession(
    request: MockGatewayRequest,
  ): Promise<MockGatewayResponse> {
    const gatewayPaymentId = this.generateGatewayPaymentId();
    const baseUrl = this.configService.get<string>('APP_URL', 'http://localhost:5173');
    
    return {
      gatewayPaymentId,
      checkoutUrl: `${baseUrl}/payment/mock/${request.paymentId}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 phút
    };
  }

  /**
   * Xử lý callback từ mock gateway
   * Trong thực tế, đây sẽ verify webhook từ Stripe/PayPal/v.v.
   */
  async processCallback(
    callback: MockGatewayCallback,
  ): Promise<{ verified: boolean; error?: string }> {
    // 1. Verify signature
    if (!this.verifySignature(callback)) {
      return { verified: false, error: 'Invalid signature' };
    }

    // 2. Verify gateway payment ID format
    if (!callback.gatewayPaymentId.startsWith(this.gatewayId)) {
      return { verified: false, error: 'Invalid gateway payment ID' };
    }

    // 3. Verify timestamp (callback không quá 5 phút)
    const callbackTime = new Date(callback.timestamp).getTime();
    const now = Date.now();
    if (now - callbackTime > 5 * 60 * 1000) {
      return { verified: false, error: 'Callback expired' };
    }

    return { verified: true };
  }

  /**
   * Verify transaction với gateway
   * Trong thực tế, gọi API của Stripe/PayPal/v.v. để verify
   */
  async verifyTransaction(
    gatewayPaymentId: string,
    expectedAmount: number,
  ): Promise<{ valid: boolean; status?: string; error?: string }> {
    // Mock: Kiểm tra format gateway payment ID
    if (!gatewayPaymentId.startsWith(this.gatewayId)) {
      return { valid: false, error: 'Invalid gateway payment ID' };
    }

    // Mock: Giả lập verify thành công
    return { valid: true, status: 'COMPLETED' };
  }

  /**
   * Tạo transaction ID duy nhất
   */
  generateTransactionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `TXN-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Generate gateway payment ID
   */
  private generateGatewayPaymentId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `${this.gatewayId}-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Verify callback signature
   * Trong thực tế, dùng HMAC-SHA256 với secret key
   */
  private verifySignature(callback: MockGatewayCallback): boolean {
    // Mock implementation - trong thực tế sẽ verify HMAC
    // Đảm bảo callback có đầy đủ thông tin cần thiết
    return !!(
      callback.paymentId &&
      callback.gatewayPaymentId &&
      callback.status &&
      callback.timestamp &&
      callback.signature
    );
  }

  /**
   * Tạo callback với signature (để mock frontend callback)
   */
  createMockCallback(
    paymentId: number,
    gatewayPaymentId: string,
    status: 'SUCCESS' | 'FAILED' | 'CANCELLED',
    failureReason?: string,
  ): MockGatewayCallback {
    return {
      paymentId,
      gatewayPaymentId,
      status,
      transactionId: status === 'SUCCESS' ? this.generateTransactionId() : undefined,
      failureReason,
      timestamp: new Date().toISOString(),
      signature: this.generateSignature(paymentId, gatewayPaymentId, status),
    };
  }

  /**
   * Generate HMAC signature (mock)
   */
  private generateSignature(
    paymentId: number,
    gatewayPaymentId: string,
    status: string,
  ): string {
    // Mock: Trong thực tế dùng HMAC-SHA256
    const data = `${paymentId}:${gatewayPaymentId}:${status}:${this.apiKey}`;
    return Buffer.from(data).toString('base64');
  }
}
