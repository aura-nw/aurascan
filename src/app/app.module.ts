import { DatePipe } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule, NgbNavModule, NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgProgressModule } from 'ngx-progressbar';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MAT_DATE_FORMATS_VALUE, NG_PROGRESS_MODULE_CONFIG, TRANSLATE_MODULE_CONFIG } from './app.config';
import { EnvironmentService } from './core/data-services/environment.service';
import { ErrorInterceptor } from './core/helpers/error.interceptor';
import { GlobalErrorHandler } from './core/helpers/global-error';
import { JwtInterceptor } from './core/helpers/jwt.interceptor';
import { DEFAULT_TIMEOUT, RequestTimeoutHttpInterceptor } from './core/helpers/timeout.interceptor';
import { LoadingInterceptor } from './core/interceptors/loading.interceptor';
import { CommonService } from './core/services/common.service';
import { FeeGrantService } from './core/services/feegrant.service';
import { MappingErrorService } from './core/services/mapping-error.service';
import { NameTagService } from './core/services/name-tag.service';
import { SoulboundService } from './core/services/soulbound.service';
import { TokenService } from './core/services/token.service';
import { UserService } from './core/services/user.service';
import { Globals } from './global/global';
import { LayoutsModule } from './layouts/layouts.module';
import { SchemaViewerModule } from './pages/schema-viewer/schema-viewer.module';
import { MediaExpandModule } from './shared/components/media-expand/media-expand.module';

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
    // NgxMaskDirective,
    // NgxMaskPipe,
    ReactiveFormsModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MediaExpandModule,
    SchemaViewerModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: RequestTimeoutHttpInterceptor, multi: true },
    { provide: DEFAULT_TIMEOUT, useValue: 60000 },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    EnvironmentService,
    DatePipe,
    Globals,
    {
      provide: APP_INITIALIZER,
      useFactory: (environmentService: EnvironmentService) => () => environmentService.load(),
      multi: true,
      deps: [EnvironmentService],
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
    CommonService,
    TokenService,
    FeeGrantService,
    SoulboundService,
    MappingErrorService,
    NameTagService,
    UserService,
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
