import { NgModule } from '@angular/core';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { TermsRoutingModule } from './terms-of-service-routing.module';
import { TermsComponent } from './terms-of-service.component';
@NgModule({
  declarations: [TermsComponent],
  imports: [
    TermsRoutingModule,
    CommonPipeModule,
  ],
  providers: [],
  exports: [TermsComponent],
})
export class TermsModule {}
