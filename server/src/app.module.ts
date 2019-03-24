import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogModule } from './blog/blog.module';
import { QuestionModule } from './question/question.module';
import { ProfileModule } from './profile/profile.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { CommentModule } from './comment/comment.module';
import {ENV} from './config/environment-variables';
import { UtilsService } from './utils/utils.service';

// defining MongoDB URL based on environment context
const MONGO_URI = ENV.NODE_ENV.match('prod') ? ENV.PROD_DO_MONGODB_URI : ENV.DEV_AWS_MONGODB_URI;

@Module({
  imports: [
      MongooseModule.forRoot(MONGO_URI),
      BlogModule,
      QuestionModule,
      ProfileModule,
      AuthModule,
      ConfigModule,
      CommentModule,
  ],
  controllers: [AppController],
  providers: [AppService, UtilsService],
})
export class AppModule {}
