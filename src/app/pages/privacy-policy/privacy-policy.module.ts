import { NgModule } from '@angular/core';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { TermsRoutingModule } from './privacy-policy-routing.module';
import { PrivacyComponent } from './privacy-policy.component';
@NgModule({
  declarations: [PrivacyComponent],
  imports: [
    TermsRoutingModule,
    CommonPipeModule,
  ],
  providers: [],
  exports: [PrivacyComponent],
})
export class PrivacyModule {}
