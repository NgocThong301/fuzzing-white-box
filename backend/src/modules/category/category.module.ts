import { Module } from '@nestjs/common';
import { CategoryController } from './controllers';
import { CategoryService } from './services';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
