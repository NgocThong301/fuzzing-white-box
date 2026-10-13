import { Module } from '@nestjs/common';
import { WalletController, AdminDisputeController } from './controllers/wallet.controller';
import { WalletService } from './services/wallet.service';
import { AuditLogService } from 'src/common/services/audit-log.service';

@Module({
  controllers: [WalletController, AdminDisputeController],
  providers: [WalletService, AuditLogService],
  exports: [WalletService],
})
export class WalletModule {}
