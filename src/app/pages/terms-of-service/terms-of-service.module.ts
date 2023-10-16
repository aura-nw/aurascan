import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { TermsRoutingModule } from './terms-of-service-routing.module';
import { TermsComponent } from './terms-of-service.component';
@NgModule({
  declarations: [TermsComponent],
  imports: [
    TermsRoutingModule,
    CommonPipeModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    CommonPipeModule,
  ],
  providers: [],
  exports: [TermsComponent],
})
export class TermsModule {}
