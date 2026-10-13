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
import { CourseService } from '../services';
import { CreateCourseDto, UpdateCourseDto, GetCoursesByMajorDto } from '../dto';

@ApiTags('Courses')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mới học phần (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 404, description: 'Ngành không tồn tại' })
  @ApiResponse({ status: 409, description: 'Mã học phần đã tồn tại' })
  async create(@Body() dto: CreateCourseDto) {
    return this.courseService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách học phần' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'majorId', required: false, type: Number })
  @ApiQuery({ name: 'universityId', required: false, type: Number })
  @ApiQuery({ name: 'semester', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Danh sách học phần' })
  async findAll(@Query() query: GetCoursesByMajorDto) {
    return this.courseService.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      majorId: query.majorId,
      semester: query.semester,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }

  @Get('major/:majorId')
  @ApiOperation({ summary: 'Lấy danh sách học phần theo ngành' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'semester', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Danh sách học phần theo ngành' })
  async findByMajor(
    @Param('majorId', ParseIntPipe) majorId: number,
    @Query() query: GetCoursesByMajorDto,
  ) {
    return this.courseService.findByMajor(majorId, {
      page: query.page,
      limit: query.limit,
      search: query.search,
      semester: query.semester,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin học phần' })
  @ApiResponse({ status: 200, description: 'Thông tin học phần' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật học phần (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.courseService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa học phần (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 204, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  @ApiResponse({ status: 409, description: 'Không thể xóa' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.remove(id);
  }
}
