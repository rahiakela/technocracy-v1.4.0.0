import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';
import {UserSchema} from './schema/user.schema';
import { UserService } from './services/user.service';
import {JwtStrategy} from './strategy/jwt.strategy';
import { AuthController } from './controllers/auth.controller';
import {SubscriptionSchema} from './schema/subscription.schema';
import {ENV} from '../config/environment-variables';
import {ConfigModule} from '../config/config.module';

@Module({
  imports: [
    MongooseModule.forFeature([
        {name: 'User', schema: UserSchema},
        {name: 'Subscription', schema: SubscriptionSchema},
    ]),
    PassportModule.register({ defaultStrategy: 'jwt'}),
    JwtModule.register({
      secretOrPrivateKey: ENV.JWT_SECRET,
      signOptions: {expiresIn: 259200000}, // 3 days
    }),
    ConfigModule,
  ],
  providers: [AuthService, UserService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, UserService],
})
export class AuthModule {}
