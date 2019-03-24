import { BrowserModule } from '@angular/platform-browser';
import { AppMaterialModule } from './app-material.module';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FlexLayoutModule} from '@angular/flex-layout';
import {APP_ID, Inject, NgModule, PLATFORM_ID} from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import {AppComponent, SubscriptionDialogComponent} from './app.component';
import {isPlatformBrowser} from '@angular/common';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';
import { RootStoreModule } from './root-store';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TransferHttpCacheModule} from '@nguniversal/common';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import {CookieModule} from 'ngx-cookie';

@NgModule({
  declarations: [
    AppComponent,
    SubscriptionDialogComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    TransferHttpCacheModule,
    CookieModule.forRoot(),
    HttpClientModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    RootStoreModule,
    SharedModule,
    CoreModule,
    AppMaterialModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  entryComponents: [
    SubscriptionDialogComponent
  ],
  providers: [
    // httpInterceptorProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(@Inject(PLATFORM_ID) private platformId: Object,
              @Inject(APP_ID) private appId: string) {
    const platform = isPlatformBrowser(platformId) ? 'in the browser' : 'on the server';
    console.log(`Running ${platform} with appId=${appId}`);
  }
}
