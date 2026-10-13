/**
 * FAVORITE CONTROLLER
 */

import {
  Controller, Get, Post, Delete, Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FavoriteService } from '../services/favorite.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách yêu thích' })
  async getFavorites(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.favoriteService.getFavorites(user.id, page || 1, limit || 20);
  }

  @Post(':listingId')
  @ApiOperation({ summary: 'Thêm vào yêu thích' })
  async addFavorite(
    @Param('listingId', ParseIntPipe) listingId: number,
    @CurrentUser() user: any,
  ) {
    return this.favoriteService.addFavorite(user.id, listingId);
  }

  @Delete(':listingId')
  @ApiOperation({ summary: 'Xóa khỏi yêu thích' })
  async removeFavorite(
    @Param('listingId', ParseIntPipe) listingId: number,
    @CurrentUser() user: any,
  ) {
    return this.favoriteService.removeFavorite(user.id, listingId);
  }

  @Post(':listingId/toggle')
  @ApiOperation({ summary: 'Toggle favorite' })
  async toggleFavorite(
    @Param('listingId', ParseIntPipe) listingId: number,
    @CurrentUser() user: any,
  ) {
    return this.favoriteService.toggleFavorite(user.id, listingId);
  }

  @Get(':listingId/check')
  @ApiOperation({ summary: 'Kiểm tra đã yêu thích chưa' })
  async checkFavorite(
    @Param('listingId', ParseIntPipe) listingId: number,
    @CurrentUser() user: any,
  ) {
    const isFavorited = await this.favoriteService.isFavorited(user.id, listingId);
    return { isFavorited };
  }
}
