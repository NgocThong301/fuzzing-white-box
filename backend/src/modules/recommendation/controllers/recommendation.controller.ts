/**
 * RECOMMENDATION CONTROLLER
 */

import {
  Controller, Get, Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecommendationService } from '../services/recommendation.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Recommendations')
@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy gợi ý cá nhân hóa cho user' })
  async getRecommendations(
    @CurrentUser() user: any,
    @Query('limit') limit?: number,
  ) {
    return this.recommendationService.getRecommendations(user.id, limit || 10);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Lấy sách đang thịnh hành' })
  async getTrending(@Query('limit') limit?: number) {
    return this.recommendationService.getTrending(limit || 10);
  }

  @Get('similar/:listingId')
  @ApiOperation({ summary: 'Lấy sách tương tự' })
  async getSimilar(
    @Param('listingId', ParseIntPipe) listingId: number,
    @Query('limit') limit?: number,
  ) {
    return this.recommendationService.getSimilarListings(listingId, limit || 5);
  }
}
