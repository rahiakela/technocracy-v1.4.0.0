import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import {ProfileSchema} from './schema/profile.schema';
import { ProfileService } from './services/profile.service';
import { ProfileController } from './controllers/profile.controller';
import {ConfigModule} from '../config/config.module';
import {AuthModule} from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'Profile', schema: ProfileSchema}]),
        ConfigModule,
        AuthModule,
        PassportModule.register({ defaultStrategy: 'jwt'}),
    ],
    controllers: [ProfileController],
    providers: [ProfileService],
})
export class ProfileModule {}
