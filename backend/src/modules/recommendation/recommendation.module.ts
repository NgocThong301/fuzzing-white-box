import { Module } from '@nestjs/common';
import { RecommendationController } from './controllers/recommendation.controller';
import { RecommendationService } from './services/recommendation.service';

@Module({
  controllers: [RecommendationController],
  providers: [RecommendationService],
  exports: [RecommendationService],
})
export class RecommendationModule {}
