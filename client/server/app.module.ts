import {Module} from '@nestjs/common';
import {AngularUniversalModule, applyDomino} from '@nestjs/ng-universal';
import {join} from 'path';

@Module({
  imports: [
    AngularUniversalModule.forRoot({
      viewsPath: join(process.cwd(), 'dist/client'),
      bundle: require('../dist/client-server/main.js')
    })
  ]
})
export class ApplicationModule {
}
