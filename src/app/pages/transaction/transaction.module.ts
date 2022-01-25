import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionComponent } from './transaction.component';
import { TransactionRoutingModule } from './transaction-routing.module';
import { MaterialModule } from 'src/app/app.module';
import { NgxMaskModule } from 'ngx-mask';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonService } from 'src/app/core/services/common.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { TxsDetailComponent } from './txs-detail/txs-detail.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';


@NgModule({
  declarations: [
    TransactionComponent,
    TxsDetailComponent
  ],
  imports: [
    CommonModule,
    TransactionRoutingModule,
    MaterialModule,
    NgxMaskModule,
    CommonPipeModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    SharedModule,
    NgxJsonViewerModule
  ],
  providers: [CommonService]
})
export class TransactionModule { }
