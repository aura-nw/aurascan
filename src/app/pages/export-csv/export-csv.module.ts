import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { UserService } from 'src/app/core/services/user.service';
import { ExportCsvComponent } from './export-csv.component';
import { ExportCsvRoutingModule } from './export-csv-routing.module';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
@NgModule({
  declarations: [ExportCsvComponent],
  imports: [
    ExportCsvRoutingModule,
    CommonPipeModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    CommonPipeModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [UserService],
  exports: [ExportCsvComponent],
})
export class ExportCsvModule {}
