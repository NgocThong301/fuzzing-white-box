import { Module } from '@nestjs/common';
import { BookController } from './controllers';
import { BookService } from './services';

@Module({
  controllers: [BookController],
  providers: [BookService],
  exports: [BookService],
})
export class BookModule {}
