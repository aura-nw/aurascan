import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelViewComponent } from './model-view.component';

@NgModule({
  declarations: [ModelViewComponent],
  exports: [ModelViewComponent],
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ModelViewModule {}
