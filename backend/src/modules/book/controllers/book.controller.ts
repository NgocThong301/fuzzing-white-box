import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { BookService } from '../services';
import { CreateBookDto, UpdateBookDto, SearchBookDto } from '../dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Books')
@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo mới sách (User)' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 409, description: 'ISBN đã tồn tại' })
  async create(@Body() dto: CreateBookDto) {
    return this.bookService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Tìm kiếm và lọc sách' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Tìm kiếm toàn phần' })
  @ApiQuery({ name: 'isbn', required: false, type: String })
  @ApiQuery({ name: 'title', required: false, type: String })
  @ApiQuery({ name: 'author', required: false, type: String })
  @ApiQuery({ name: 'publisher', required: false, type: String })
  @ApiQuery({ name: 'universityId', required: false, type: Number })
  @ApiQuery({ name: 'majorId', required: false, type: Number })
  @ApiQuery({ name: 'courseId', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'condition', required: false, enum: ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'] })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Danh sách sách' })
  async findAll(@Query() query: SearchBookDto) {
    return this.bookService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê sách' })
  @ApiResponse({ status: 200, description: 'Thống kê sách' })
  async getStats() {
    return this.bookService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin sách' })
  @ApiResponse({ status: 200, description: 'Thông tin sách' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật sách (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookDto,
  ) {
    return this.bookService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa sách (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 204, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.remove(id);
  }
}
