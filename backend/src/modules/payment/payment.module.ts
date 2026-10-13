import { Module } from '@nestjs/common';
import { PaymentController, AdminPaymentController, VnpayController, BankingController } from './controllers';
import { PaymentService } from './services';
import { MockPaymentGateway, VnpayGateway, BankingPaymentGateway } from './gateway';
import { AuditLogService } from 'src/common/services/audit-log.service';

@Module({
  controllers: [PaymentController, AdminPaymentController, VnpayController, BankingController],
  providers: [PaymentService, MockPaymentGateway, VnpayGateway, BankingPaymentGateway, AuditLogService],
  exports: [PaymentService, VnpayGateway, BankingPaymentGateway],
})
export class PaymentModule {}
