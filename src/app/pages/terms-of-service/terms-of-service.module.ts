import { NgModule } from '@angular/core';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { TermsRoutingModule } from './terms-of-service-routing.module';
import { TermsComponent } from './terms-of-service.component';
@NgModule({
  declarations: [TermsComponent],
  imports: [TermsRoutingModule, CustomPipeModule],
  providers: [],
  exports: [TermsComponent],
})
export class TermsModule {}
