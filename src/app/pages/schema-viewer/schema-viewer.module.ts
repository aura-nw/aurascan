import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchemaViewerRoutingModule } from './schema-viewer-routing.module';
import { SchemaViewerComponent } from './schema-viewer.component';

@NgModule({
  declarations: [SchemaViewerComponent],
  imports: [CommonModule, SchemaViewerRoutingModule],
})
export class SchemaViewerModule {}
