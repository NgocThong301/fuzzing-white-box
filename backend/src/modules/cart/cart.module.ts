import { Module } from '@nestjs/common';
import { CartController } from './controllers';
import { CartService } from './services';
import { AuditLogService } from 'src/common/services/audit-log.service';

@Module({
  controllers: [CartController],
  providers: [CartService, AuditLogService],
  exports: [CartService],
})
export class CartModule {}
