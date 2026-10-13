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
import { UniversityService } from '../services';
import { CreateUniversityDto, UpdateUniversityDto, SearchAcademicDto } from '../dto';

@ApiTags('Universities')
@Controller('universities')
export class UniversityController {
  constructor(private readonly universityService: UniversityService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mới trường đại học (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 409, description: 'Trường đã tồn tại' })
  async create(@Body() dto: CreateUniversityDto) {
    return this.universityService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách trường đại học' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Danh sách trường đại học' })
  async findAll(@Query() query: SearchAcademicDto) {
    return this.universityService.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin trường đại học' })
  @ApiResponse({ status: 200, description: 'Thông tin trường đại học' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.universityService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật trường đại học (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUniversityDto,
  ) {
    return this.universityService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa trường đại học (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 204, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  @ApiResponse({ status: 409, description: 'Không thể xóa' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.universityService.remove(id);
  }
}
