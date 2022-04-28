import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../app/app.module';
import { NgxMaskModule } from 'ngx-mask';
import { CommonPipeModule } from '../../../app/core/pipes/common-pipe.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonService } from '../../../app/core/services/common.service';
import { SharedModule } from '../../../app/shared/shared.module';
import { ValidatorsComponent } from './validators.component';
import { ValidatorsDetailComponent } from './validators-detail/validators-detail.component';
import { ValidatorsRoutingModule } from './validators-routing.module';
import { ValidatorService } from '../../../app/core/services/validator.service';
import { SimplebarAngularModule } from 'simplebar-angular';
import { BlockService } from '../../../app/core/services/block.service';
import { TransactionService } from '../../../app/core/services/transaction.service';
import { AccountService } from '../../../app/core/services/account.service';
import { TableNoDataModule } from '../../shared/components/table-no-data/table-no-data.module';
import { DetailPopupDelegateModule } from './detail-popup-delegate/detail-popup-delegate.module';
import { PaginatorModule } from '../../shared/components/paginator/paginator.module';
import { MappingErrorService } from '../../../app/core/services/mapping-error.service';

@NgModule({
  declarations: [
    ValidatorsComponent,
    ValidatorsDetailComponent
  ],
  imports: [
    CommonModule,
    ValidatorsRoutingModule,
    MaterialModule,
    NgxMaskModule,
    CommonPipeModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    SharedModule,
    SimplebarAngularModule,
    TableNoDataModule,
    DetailPopupDelegateModule,
    PaginatorModule
  ],
  providers: [CommonService, ValidatorService, BlockService, TransactionService, AccountService, MappingErrorService]
})
export class ValidatorsModule { }
