import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeeGrantRoutingModule } from './fee-grant-routing.module';
import { FeeGrantComponent } from './fee-grant.component';
import { MyGranteesComponent } from './my-grantees/my-grantees.component';
import { MyGrantersComponent } from './my-granters/my-granters.component';
import { PopupAddGrantComponent } from './popup-add-grant/popup-add-grant.component';
import {NgbNavModule} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule} from "@angular/forms";
import {CommonPipeModule} from "src/app/core/pipes/common-pipe.module";
import {MatTableModule} from "@angular/material/table";
import {PaginatorModule} from "src/app/shared/components/paginator/paginator.module";
import {TableNoDataModule} from "src/app/shared/components/table-no-data/table-no-data.module";
import {TranslateModule} from "@ngx-translate/core";


@NgModule({
  declarations: [
    FeeGrantComponent,
    MyGranteesComponent,
    MyGrantersComponent,
    PopupAddGrantComponent
  ],
  imports: [
    CommonModule,
    FeeGrantRoutingModule,
    NgbNavModule,
    FormsModule,
    CommonPipeModule,
    MatTableModule,
    PaginatorModule,
    TableNoDataModule,
    TranslateModule
  ]
})
export class FeeGrantModule { }
