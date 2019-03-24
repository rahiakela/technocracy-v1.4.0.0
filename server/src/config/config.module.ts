import { Module } from '@nestjs/common';
import { ConfigService } from './services/config.service';
import { MailService } from './mail/mail.service';
import {MAIL_TEMPLATES} from './mail/template';
import {UtilsService} from '../utils/utils.service';
import {CustomLogger} from './log/custom-logger';

@Module({
  providers: [
    {
      provide: ConfigService,
      useValue: new ConfigService(`.env`),
    },
    MailService,
    UtilsService,
    CustomLogger,
    ...MAIL_TEMPLATES,
  ],
  exports: [ConfigService, MailService, UtilsService, CustomLogger],
})
export class ConfigModule {}
