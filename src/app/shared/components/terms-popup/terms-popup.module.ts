import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TermsPopupComponent } from './terms-popup.component';

@NgModule({
  declarations: [TermsPopupComponent],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [TermsPopupComponent]
})
export class TermsPopupModule { }
