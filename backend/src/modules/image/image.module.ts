import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { AppConfigModule } from 'src/modules/config/app-config.module';

@Module({
  imports: [AppConfigModule],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
