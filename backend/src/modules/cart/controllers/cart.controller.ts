import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CartService } from '../services';
import { AddToCartDto, UpdateCartItemDto } from '../dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  private readonly logger = new Logger(CartController.name);

  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy giỏ hàng của user' })
  @ApiResponse({ status: 200, description: 'Giỏ hàng' })
  async getCart(@CurrentUser() user: any) {
    this.logger.log(`Getting cart for userId: ${user.id}, email: ${user.email}`);
    return this.cartService.getCart(user.id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Thêm item vào giỏ hàng' })
  @ApiResponse({ status: 201, description: 'Thêm thành công' })
  async addToCart(@Body() dto: AddToCartDto, @CurrentUser() user: any) {
    this.logger.log(`Adding to cart for userId: ${user.id}`);
    return this.cartService.addToCart(user.id, dto);
  }

  @Put('items/:listingId')
  @ApiOperation({ summary: 'Cập nhật số lượng item trong giỏ hàng' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  async updateCartItem(
    @Param('listingId', ParseIntPipe) listingId: number,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Updating cart item ${listingId} for userId: ${user.id}`);
    return this.cartService.updateCartItem(user.id, listingId, dto);
  }

  @Delete('items/:listingId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa item khỏi giỏ hàng' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  async removeFromCart(
    @Param('listingId', ParseIntPipe) listingId: number,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Removing item ${listingId} from cart for userId: ${user.id}`);
    return this.cartService.removeFromCart(user.id, listingId);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa toàn bộ giỏ hàng' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  async clearCart(@CurrentUser() user: any) {
    this.logger.log(`Clearing cart for userId: ${user.id}`);
    return this.cartService.clearCart(user.id);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Kiểm tra tính hợp lệ của giỏ hàng' })
  @ApiResponse({ status: 200, description: 'Kết quả validation' })
  async validateCart(@CurrentUser() user: any) {
    this.logger.log(`Validating cart for userId: ${user.id}`);
    return this.cartService.validateCart(user.id);
  }
}
