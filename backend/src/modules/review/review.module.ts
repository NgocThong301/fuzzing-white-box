import { Module, forwardRef } from '@nestjs/common';
import { ReviewController, ModerationReviewController } from './controllers/review.controller';
import { ReviewService } from './services/review.service';
import { NotificationModule } from 'src/modules/notification/notification.module';
import { AuditLogService } from 'src/common/services/audit-log.service';

@Module({
  imports: [forwardRef(() => NotificationModule)],
  controllers: [ReviewController, ModerationReviewController],
  providers: [ReviewService, AuditLogService],
  exports: [ReviewService],
})
export class ReviewModule {}
