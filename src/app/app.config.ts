import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IConfig } from 'ngx-mask';
import { NgProgressConfig } from 'ngx-progressbar';

// provideEnvironmentNgxMask(MASK_CONFIG)
export const MASK_CONFIG: Partial<IConfig> = {
  validation: false,
  thousandSeparator: ',',
};

export const MAT_DATE_FORMATS_VALUE = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'YYYY-MM-DD',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json?v=' + Date.now());
}

export const NG_PROGRESS_MODULE_CONFIG: NgProgressConfig = {
  spinnerPosition: 'left',
  color: 'blue',
};

export const TRANSLATE_MODULE_CONFIG = {
  defaultLanguage: 'en',
  loader: {
    provide: TranslateLoader,
    useFactory: HttpLoaderFactory,
    deps: [HttpClient],
  },
};
