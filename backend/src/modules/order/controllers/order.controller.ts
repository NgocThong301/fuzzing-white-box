import {
  Controller,
  Get,
  Post,
  Put,
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
import { OrderService } from '../services';
import { CreateOrderDto, UpdateOrderStatusDto } from '../dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleType } from '@prisma/client';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đơn hàng từ giỏ hàng' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  async createOrder(@Body() dto: CreateOrderDto, @CurrentUser() user: any) {
    return this.orderService.createOrder(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng của tôi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Danh sách đơn hàng' })
  async getMyOrders(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.orderService.getMyOrders(user.id, page || 1, limit || 10);
  }

  @Get('seller')
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng (Seller)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Danh sách đơn hàng' })
  async getSellerOrders(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.orderService.getSellerOrders(user.id, page || 1, limit || 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết đơn hàng' })
  @ApiResponse({ status: 200, description: 'Chi tiết đơn hàng' })
  async getOrderById(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.orderService.getOrderById(id, user.id, user.roles || []);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  async updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.orderService.updateOrderStatus(id, dto, user.id, user.roles || []);
  }
}

@ApiTags('Admin - Orders')
@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminOrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Lấy tất cả đơn hàng (Admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Danh sách đơn hàng' })
  async getAllOrders(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.orderService.getAllOrders(page || 1, limit || 20);
  }
}
