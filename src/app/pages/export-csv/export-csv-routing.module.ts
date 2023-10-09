import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExportCsvComponent } from './export-csv.component';

const routes: Routes = [
  {
    path: '',
    component: ExportCsvComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExportCsvRoutingModule {}
