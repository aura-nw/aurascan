import { NgModule } from '@angular/core';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { TermsRoutingModule } from './privacy-policy-routing.module';
import { PrivacyComponent } from './privacy-policy.component';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  declarations: [PrivacyComponent],
  imports: [TermsRoutingModule, CustomPipeModule, TranslateModule],
  providers: [],
  exports: [PrivacyComponent],
})
export class PrivacyModule {}
