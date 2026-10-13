import { Module } from '@nestjs/common';
import { SitemapController } from './controllers/sitemap.controller';

@Module({
  controllers: [SitemapController],
})
export class SEOModule {}
