/**
 * REVIEW CONTROLLER
 */

import {
  Controller, Get, Post, Patch, Body, Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewService } from '../services/review.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleType } from '@prisma/client';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo review cho seller' })
  async createReview(
    @Body() body: { orderId: number; rating: number; comment?: string },
    @CurrentUser() user: any,
  ) {
    return this.reviewService.createReview(user.id, body);
  }

  @Get('me/rating')
  @ApiOperation({ summary: 'Lấy rating của mình (seller)' })
  async getMyRating(@CurrentUser() user: any) {
    return this.reviewService.getSellerRating(user.id);
  }

  @Get('me/reviews')
  @ApiOperation({ summary: 'Lấy reviews về mình (seller)' })
  async getMyReviews(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reviewService.getReviewsByUser(user.id, page || 1, limit || 10);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Lấy reviews của một user' })
  async getUserReviews(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reviewService.getReviewsByUser(userId, page || 1, limit || 10);
  }

  @Get('user/:userId/rating')
  @ApiOperation({ summary: 'Lấy rating của một user' })
  async getUserRating(@Param('userId', ParseIntPipe) userId: number) {
    return this.reviewService.getSellerRating(userId);
  }

  @Post(':id/respond')
  @ApiOperation({ summary: 'Seller phản hồi review' })
  async respondToReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { response: string },
    @CurrentUser() user: any,
  ) {
    return this.reviewService.respondToReview(id, user.id, body.response);
  }
}

@ApiTags('Moderation - Reviews')
@Controller('moderation/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ModerationReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @ApiOperation({ summary: 'Lấy tất cả reviews (Moderator)' })
  async getAllReviews(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.reviewService.getAllReviews(page || 1, limit || 10, status as any);
  }

  @Post(':id/moderate')
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @ApiOperation({ summary: 'Duyệt/từ chối review' })
  async moderateReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { action: 'APPROVE' | 'REJECT' | 'HIDE' },
    @CurrentUser() user: any,
  ) {
    return this.reviewService.moderateReview(id, body.action, user.id);
  }
}
