import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import {BlogSchema} from './schema/blog.schema';
import { BlogService } from './services/blog.service';
import { BlogController } from './controllers/blog.controller';
import {ConfigModule} from '../config/config.module';
import {AuthModule} from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'Blog', schema: BlogSchema}]),
        ConfigModule,
        AuthModule,
        PassportModule.register({ defaultStrategy: 'jwt'}),
    ],
    providers: [BlogService],
    controllers: [BlogController],
    exports: [BlogService],
})
export class BlogModule {}
