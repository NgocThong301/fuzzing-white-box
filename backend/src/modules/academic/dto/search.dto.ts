import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class SearchAcademicDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class GetMajorsByUniversityDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên ngành' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1, description: 'Lọc theo trường đại học' })
  @IsOptional()
  @IsInt()
  universityId?: number;
}

export class GetCoursesByMajorDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên học phần' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1, description: 'Lọc theo học kỳ' })
  @IsOptional()
  @IsInt()
  semester?: number;

  @ApiPropertyOptional({ example: 1, description: 'Lọc theo ngành học' })
  @IsOptional()
  @IsInt()
  majorId?: number;
}
