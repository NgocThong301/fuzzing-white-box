import { Module } from '@nestjs/common';
import { CouponController, AdminCouponController } from './controllers/coupon.controller';
import { CouponService } from './services/coupon.service';
import { AuditLogService } from 'src/common/services/audit-log.service';

@Module({
  controllers: [CouponController, AdminCouponController],
  providers: [CouponService, AuditLogService],
  exports: [CouponService],
})
export class CouponModule {}
