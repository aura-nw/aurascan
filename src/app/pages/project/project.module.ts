import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectRoutingModule } from './project-routing.module';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import {SharedModule} from "src/app/shared/shared.module";
import {TableNoDataModule} from "src/app/shared/components/table-no-data/table-no-data.module";


@NgModule({
  declarations: [
    ProjectDetailComponent
  ],
  imports: [
    CommonModule,
    ProjectRoutingModule,
    SharedModule,
    TableNoDataModule
  ]
})
export class ProjectModule { }
