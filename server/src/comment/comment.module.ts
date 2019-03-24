import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import {CommentSchema, ReplySchema} from './schema/comment.schema';
import { CommentController } from './controllers/comment.controller';
import { CommentService } from './services/comment.service';
import {ConfigModule} from '../config/config.module';
import {AuthModule} from '../auth/auth.module';
import {BlogModule} from '../blog/blog.module';
import {QuestionModule} from '../question/question.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: 'Comment', schema: CommentSchema},
            {name: 'Reply', schema: ReplySchema},
        ]),
        ConfigModule,
        AuthModule,
        BlogModule,
        QuestionModule,
        PassportModule.register({ defaultStrategy: 'jwt'}),
    ],
    controllers: [CommentController],
    providers: [CommentService],
})
export class CommentModule {}
