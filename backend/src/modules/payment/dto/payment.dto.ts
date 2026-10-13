import { IsEnum, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

// ============================================
// PAYMENT DTOs
// ============================================

export class CreatePaymentDto {
  @ApiProperty({ example: 1, description: 'Order ID' })
  @IsNumber()
  orderId: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.COD })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}

export class MockPaymentCallbackDto {
  @ApiProperty({ description: 'Transaction status from gateway' })
  @IsEnum(['SUCCESS', 'FAILED', 'CANCELLED'] as const)
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED';

  @ApiPropertyOptional({ description: 'Transaction ID from gateway' })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({ description: 'Failure reason if failed' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  failureReason?: string;

  @ApiPropertyOptional({ description: 'Signature for verification' })
  @IsOptional()
  @IsString()
  signature?: string;
}

export class PaymentResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  orderId: number;

  @ApiProperty({ enum: PaymentMethod })
  method: PaymentMethod;

  @ApiProperty()
  amount: number;

  @ApiProperty({ enum: PaymentStatus })
  status: PaymentStatus;

  @ApiPropertyOptional()
  transactionId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

// ============================================
// MOCK GATEWAY TYPES
// ============================================

export interface MockGatewayRequest {
  orderId: number;
  paymentId: number;
  amount: number;
  callbackUrl: string;
  timestamp: string;
}

export interface MockGatewayResponse {
  gatewayPaymentId: string;
  checkoutUrl: string;
  expiresAt: string;
}

export interface MockGatewayCallback {
  paymentId: number;
  gatewayPaymentId: string;
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED';
  transactionId?: string;
  amount?: number;
  failureReason?: string;
  timestamp: string;
  signature: string;
}
