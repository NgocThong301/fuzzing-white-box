import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';
import { AuditLogService } from 'src/common/services/audit-log.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AuditLogService],
  exports: [AdminService],
})
export class AdminModule {}
