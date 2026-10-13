import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ListingService } from '../services';
import { CreateListingDto, UpdateListingDto, SearchListingDto, RejectListingDto } from '../dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleType } from '@prisma/client';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Listings')
@Controller('listings')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo mới listing (User)' })
  @ApiResponse({ status: 201, description: 'Tạo thành công (trạng thái DRAFT)' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async create(@Body() dto: CreateListingDto, @CurrentUser() user: any) {
    return this.listingService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách listing công khai' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({ name: 'universityId', required: false, type: Number })
  @ApiQuery({ name: 'majorId', required: false, type: Number })
  @ApiQuery({ name: 'courseId', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'condition', required: false, enum: ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'] })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Danh sách listing' })
  async findAll(@Query() query: SearchListingDto, @Request() req: any) {
    const userId = req.user?.id;
    const userRoles = req.user?.roles || [];
    return this.listingService.findAll(query, userId, userRoles);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách listing của tôi' })
  @ApiResponse({ status: 200, description: 'Danh sách listing' })
  async findMyListings(@Query() query: SearchListingDto, @CurrentUser() user: any) {
    return this.listingService.findMyListings(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin listing' })
  @ApiResponse({ status: 200, description: 'Thông tin listing' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = req.user?.id;
    const userRoles = req.user?.roles || [];
    return this.listingService.findOne(id, userId, userRoles);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật listing (Chỉ owner)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateListingDto,
    @CurrentUser() user: any,
  ) {
    return this.listingService.update(id, dto, user.id, user.roles || []);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa listing (Chỉ owner hoặc Admin)' })
  @ApiResponse({ status: 204, description: 'Xóa thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.listingService.remove(id, user.id, user.roles || []);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gửi listing để duyệt (Chỉ owner)' })
  @ApiResponse({ status: 200, description: 'Gửi thành công (trạng thái PENDING_REVIEW)' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  async submit(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.listingService.submit(id, user.id);
  }

  @Post(':id/hide')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ẩn listing (Chỉ owner hoặc Admin)' })
  @ApiResponse({ status: 200, description: 'Ẩn thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  async hide(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.listingService.hide(id, user.id, user.roles || []);
  }
}
