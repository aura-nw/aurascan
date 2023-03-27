import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SchemaViewerComponent } from './schema-viewer.component';

const routes: Routes = [{ path: '', component: SchemaViewerComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SchemaViewerRoutingModule {}
