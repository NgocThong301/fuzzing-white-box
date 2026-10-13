import { Module } from '@nestjs/common';
import { UniversityController, MajorController, CourseController } from './controllers';
import { UniversityService, MajorService, CourseService } from './services';

@Module({
  controllers: [UniversityController, MajorController, CourseController],
  providers: [UniversityService, MajorService, CourseService],
  exports: [UniversityService, MajorService, CourseService],
})
export class AcademicModule {}
