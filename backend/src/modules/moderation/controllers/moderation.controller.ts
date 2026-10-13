import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ModerationService } from '../services';
import { SearchModerationDto } from '../dto/moderation.dto';
import { RejectListingDto } from 'src/modules/listing/dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleType } from '@prisma/client';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Moderation')
@Controller('moderation')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get('listings')
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @ApiOperation({ summary: 'Lấy danh sách listing chờ duyệt (Admin/Moderator)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING_REVIEW', 'APPROVED', 'REJECTED'] })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Danh sách listing' })
  async findPendingListings(@Query() query: SearchModerationDto) {
    return this.moderationService.findPendingListings(query);
  }

  @Get('stats')
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @ApiOperation({ summary: 'Lấy thống kê moderation' })
  @ApiResponse({ status: 200, description: 'Thống kê' })
  async getStats() {
    return this.moderationService.getModerationStats();
  }

  @Post('listings/:id/approve')
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @ApiOperation({ summary: 'Phê duyệt listing (Admin/Moderator)' })
  @ApiResponse({ status: 200, description: 'Phê duyệt thành công' })
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.moderationService.approveListing(id, user.id);
  }

  @Post('listings/:id/reject')
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @ApiOperation({ summary: 'Từ chối listing (Admin/Moderator)' })
  @ApiResponse({ status: 200, description: 'Từ chối thành công' })
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectListingDto,
    @CurrentUser() user: any,
  ) {
    return this.moderationService.rejectListing(id, user.id, dto.rejectionReason);
  }
}
