import {enableProdMode} from '@angular/core';
import {NestFactory} from '@nestjs/core';
import {Logger} from '@nestjs/common';
import {ApplicationModule} from './app.module';
import 'localstorage-polyfill';

// Define the constants that we will use in the server
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

// Enable Angular production mode, as the server-side app will only run in production
enableProdMode();

// ref: https://blog.khophi.co/localstorage-undefined-angular-server-side-rendering/
global['localStorage'] = localStorage;

/*
Define the bootstrap function. This function creates a new instance of Nest based on our
ApplicationModule, and starts the server by listening on the HOST and PORT
*/
async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  await app.listen(PORT, HOST);
}

/*
The last step is to call the bootstrap() method we just defined. This returns a Promise, and in the
then() block, we will log a friendly message with the URL where the server listens.
We use the catch() block to log any errors
*/
bootstrap()
  .then(() => Logger.log(`Server listening on http://${HOST}:${PORT}`))
  .catch(err => console.log(err));

