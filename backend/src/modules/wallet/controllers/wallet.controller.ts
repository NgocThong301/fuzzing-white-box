/**
 * WALLET CONTROLLER
 * =================
 * 
 * API endpoints cho ví và escrow
 */

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
import { WalletService } from '../services/wallet.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleType } from '@prisma/client';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy thông tin ví của user' })
  @ApiResponse({ status: 200, description: 'Thông tin ví' })
  async getWallet(@CurrentUser() user: any) {
    return this.walletService.getWallet(user.id);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Lấy lịch sử giao dịch' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Danh sách giao dịch' })
  async getTransactions(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.walletService.getTransactions(user.id, page || 1, limit || 20);
  }

  @Get('escrows')
  @ApiOperation({ summary: 'Lấy danh sách escrow của user (seller)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ status: 200, description: 'Danh sách escrow' })
  async getEscrows(
    @CurrentUser() user: any,
    @Query('status') status?: string,
  ) {
    return this.walletService.getEscrowTransactions(
      user.id,
      status as any
    );
  }

  @Get('escrows/:id')
  @ApiOperation({ summary: 'Lấy chi tiết escrow' })
  @ApiResponse({ status: 200, description: 'Chi tiết escrow' })
  async getEscrowById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.walletService.getEscrowById(id, user.id);
  }

  @Post('escrows/:id/dispute')
  @ApiOperation({ summary: 'Khiếu nại escrow' })
  @ApiResponse({ status: 200, description: 'Đã khiếu nại' })
  async disputeEscrow(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { reason: string },
    @CurrentUser() user: any,
  ) {
    return this.walletService.disputeEscrow(id, user.id, body.reason);
  }
}

@ApiTags('Admin - Disputes')
@Controller('admin/disputes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminDisputeController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @ApiOperation({ summary: 'Lấy danh sách disputed escrows' })
  @ApiResponse({ status: 200, description: 'Danh sách dispute' })
  async getDisputedEscrows() {
    return this.walletService.getDisputedEscrows();
  }

  @Post('escrows/:id/resolve')
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @ApiOperation({ summary: 'Xử lý dispute (Admin/Moderator)' })
  @ApiResponse({ status: 200, description: 'Đã xử lý' })
  async resolveDispute(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { resolution: 'RELEASE' | 'REFUND'; note?: string },
    @CurrentUser() user: any,
  ) {
    return this.walletService.resolveDispute(
      id,
      user.id,
      body.resolution,
      body.note
    );
  }
}
