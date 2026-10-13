import { Module } from '@nestjs/common';
import { ListingController } from './controllers';
import { ListingService } from './services';
import { AuditLogService } from 'src/common/services/audit-log.service';

@Module({
  controllers: [ListingController],
  providers: [ListingService, AuditLogService],
  exports: [ListingService],
})
export class ListingModule {}
