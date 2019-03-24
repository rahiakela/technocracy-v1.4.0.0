import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import {QuestionSchema} from './schemas/question.schema';
import { QuestionController } from './controllers/question.controller';
import { QuestionService } from './services/question.service';
import {AuthModule} from '../auth/auth.module';
import {ConfigModule} from '../config/config.module';

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'Question', schema: QuestionSchema}]),
        AuthModule,
        ConfigModule,
        PassportModule.register({ defaultStrategy: 'jwt'}),
    ],
    controllers: [QuestionController],
    providers: [QuestionService],
    exports: [QuestionService],
})
export class QuestionModule {}
