import {HTTP_SERVER_REF, NestFactory} from '@nestjs/core';
import { AppModule } from './app.module';
import {CustomExceptionFilter} from './config/exception/CustomExceptionFilter';
import {CustomLogger} from './config/log/custom-logger';
import {ValidationPipe} from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {logger: new CustomLogger()});
  const httpRef = app.get(HTTP_SERVER_REF);
  app.useGlobalFilters(new CustomExceptionFilter(httpRef));
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
