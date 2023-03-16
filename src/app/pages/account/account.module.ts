import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../shared/shared.module';
import { AccountRoutingModule } from './account-routing.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, NgbCarouselModule, ReactiveFormsModule, FormsModule, AccountRoutingModule, SharedModule],
})
export class AccountModule {}
