import { PostController } from '@core-modules/forum/post/post.controller';
import { PostService } from '@core-modules/forum/post/post.service';
import { UsersModule } from '@core-modules/user/user.module';
import { UtilityModule } from '@helper-modules/services/utility.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [UtilityModule, UsersModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
