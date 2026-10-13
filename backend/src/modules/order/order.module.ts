import { Module } from '@nestjs/common';
import { OrderController, AdminOrderController } from './controllers';
import { OrderService } from './services';
import { AuditLogService } from 'src/common/services/audit-log.service';

@Module({
  controllers: [OrderController, AdminOrderController],
  providers: [OrderService, AuditLogService],
  exports: [OrderService],
})
export class OrderModule {}
