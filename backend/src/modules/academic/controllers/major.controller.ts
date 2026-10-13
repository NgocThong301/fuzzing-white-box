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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { MajorService } from '../services';
import { CreateMajorDto, UpdateMajorDto, GetMajorsByUniversityDto } from '../dto';

@ApiTags('Majors')
@Controller('majors')
export class MajorController {
  constructor(private readonly majorService: MajorService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mới ngành học (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 404, description: 'Trường không tồn tại' })
  @ApiResponse({ status: 409, description: 'Mã ngành đã tồn tại' })
  async create(@Body() dto: CreateMajorDto) {
    return this.majorService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách ngành học' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'universityId', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Danh sách ngành học' })
  async findAll(@Query() query: GetMajorsByUniversityDto) {
    return this.majorService.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      universityId: query.universityId,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }

  @Get('university/:universityId')
  @ApiOperation({ summary: 'Lấy danh sách ngành theo trường đại học' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Danh sách ngành học theo trường' })
  async findByUniversity(
    @Param('universityId', ParseIntPipe) universityId: number,
    @Query() query: GetMajorsByUniversityDto,
  ) {
    return this.majorService.findByUniversity(universityId, {
      page: query.page,
      limit: query.limit,
      search: query.search,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin ngành học' })
  @ApiResponse({ status: 200, description: 'Thông tin ngành học' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.majorService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật ngành học (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMajorDto,
  ) {
    return this.majorService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa ngành học (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 204, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  @ApiResponse({ status: 409, description: 'Không thể xóa' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.majorService.remove(id);
  }
}
