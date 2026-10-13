import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, OrderStatus } from '@prisma/client';

export class CreateOrderDto {
  @ApiPropertyOptional({ example: 'COD', enum: PaymentMethod, description: 'Phương thức thanh toán' })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({ example: '123 Nguyễn Trãi, Q.1, TP.HCM', description: 'Địa chỉ giao hàng' })
  @IsString()
  @MaxLength(500)
  shippingAddress: string;

  @ApiProperty({ example: '0909123456', description: 'Số điện thoại giao hàng' })
  @IsString()
  @MaxLength(20)
  shippingPhone: string;

  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Tên người nhận' })
  @IsString()
  @MaxLength(100)
  shippingName: string;

  @ApiPropertyOptional({ example: 'Giao giờ hành chính', description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ example: 'DISCOUNT10', description: 'Mã coupon' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  // Legal compliance fields
  @ApiPropertyOptional({ example: '1.0', description: 'Phiên bản điều khoản đã chấp nhận' })
  @IsOptional()
  @IsString()
  acceptedTermsVersion?: string;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z', description: 'Thời điểm chấp nhận điều khoản' })
  @IsOptional()
  @IsString()
  acceptedTermsAt?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, description: 'Trạng thái mới' })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiPropertyOptional({ example: 'Khách hủy đơn', description: 'Lý do' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class ConfirmOrderDto {
  @ApiPropertyOptional({ example: 'Vui lòng giao giờ hành chính', description: 'Ghi chú cho seller' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
