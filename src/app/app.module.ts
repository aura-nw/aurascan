import { DatePipe } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule, NgbNavModule, NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { initializeApp } from 'firebase/app';
import { NgProgressModule } from 'ngx-progressbar';
import { ToastrModule } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MAT_DATE_FORMATS_VALUE, NG_PROGRESS_MODULE_CONFIG, TRANSLATE_MODULE_CONFIG } from './app.config';
import { EnvironmentService } from './core/data-services/environment.service';
import { ErrorInterceptor } from './core/helpers/error.interceptor';
import { GlobalErrorHandler } from './core/helpers/global-error';
import { JwtInterceptor } from './core/helpers/jwt.interceptor';
import { DEFAULT_TIMEOUT, RequestTimeoutHttpInterceptor } from './core/helpers/timeout.interceptor';
import { LoadingInterceptor } from './core/interceptors/loading.interceptor';
import { Globals } from './global/global';
import { LayoutsModule } from './layouts/layouts.module';
import { SchemaViewerModule } from './pages/schema-viewer/schema-viewer.module';
import { MediaExpandModule } from './shared/components/media-expand/media-expand.module';
import { NgHttpCachingLocalStorage, NgHttpCachingModule, NgHttpCachingStrategy } from 'ng-http-caching';
import { CommonDirectiveModule } from './core/directives/common-directive.module';
import { ChainInfoInterceptor } from './core/helpers/chain-info.interceptor';
import { FeatureFlagService } from './core/data-services/feature-flag.service';
import { TermsPopupModule } from './shared/components/terms-popup/terms-popup.module';

initializeApp(environment.firebaseConfig);

@NgModule({
  declarations: [AppComponent],
  imports: [
    TranslateModule.forRoot(TRANSLATE_MODULE_CONFIG),
    NgProgressModule.withConfig(NG_PROGRESS_MODULE_CONFIG),
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    LayoutsModule,
    BrowserAnimationsModule,
    NgbModule,
    NgbTooltipModule,
    NgbPopoverModule,
    NgbNavModule,
    ToastrModule.forRoot({ positionClass: 'inline', maxOpened: 2 }),
    ReactiveFormsModule,
    FormsModule,
    MediaExpandModule,
    SchemaViewerModule,
    CommonDirectiveModule,
    TermsPopupModule,
    NgHttpCachingModule.forRoot({
      cacheStrategy: NgHttpCachingStrategy.DISALLOW_ALL,
      lifetime: 1000 * 60 * 5, // 5 minutes,
      allowedMethod: ['GET'],
      store: new NgHttpCachingLocalStorage(),
    }),
  ],
  providers: [
    EnvironmentService,
    {
      provide: APP_INITIALIZER,
      useFactory: (environmentService: EnvironmentService) => () => environmentService.load(),
      multi: true,
      deps: [EnvironmentService],
    },
    FeatureFlagService,
    {
      provide: APP_INITIALIZER,
      useFactory: (featureFlagService: FeatureFlagService) => () => featureFlagService.load(),
      multi: true,
      deps: [FeatureFlagService],
    },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: RequestTimeoutHttpInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ChainInfoInterceptor, multi: true },
    { provide: DEFAULT_TIMEOUT, useValue: 10000 },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    DatePipe,
    Globals,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MAT_DATE_FORMATS_VALUE },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
