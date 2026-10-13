import { Module, forwardRef } from '@nestjs/common';
import { ModerationController } from './controllers';
import { ModerationService } from './services';
import { ListingModule } from 'src/modules/listing/listing.module';
import { AuditLogService } from 'src/common/services/audit-log.service';

@Module({
  imports: [forwardRef(() => ListingModule)],
  controllers: [ModerationController],
  providers: [ModerationService, AuditLogService],
  exports: [ModerationService],
})
export class ModerationModule {}
