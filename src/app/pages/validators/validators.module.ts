import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule, DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskModule } from 'ngx-mask';
import { SimplebarAngularModule } from 'simplebar-angular';
import { LoadingImageModule } from 'src/app/shared/components/loading-image/loading-image.module';
import { MaterialModule } from '../../../app/app.module';
import { CommonPipeModule } from '../../../app/core/pipes/common-pipe.module';
import { AccountService } from '../../../app/core/services/account.service';
import { BlockService } from '../../../app/core/services/block.service';
import { CommonService } from '../../../app/core/services/common.service';
import { MappingErrorService } from '../../../app/core/services/mapping-error.service';
import { TransactionService } from '../../../app/core/services/transaction.service';
import { SharedModule } from '../../../app/shared/shared.module';
import { PaginatorModule } from '../../shared/components/paginator/paginator.module';
import { TableNoDataModule } from '../../shared/components/table-no-data/table-no-data.module';
import { PopupDelegateModule } from './popup-delegate/popup-delegate.module';
import { UserWalletInfoComponent } from './user-wallet-info/user-wallet-info.component';
import { ValidatorsDetailComponent } from './validators-detail/validators-detail.component';
import { ValidatorsRoutingModule } from './validators-routing.module';
import { ValidatorsComponent } from './validators.component';

@NgModule({
  declarations: [ValidatorsComponent, ValidatorsDetailComponent, UserWalletInfoComponent],
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
    PopupDelegateModule,
    PaginatorModule,
    LayoutModule,
    MatTooltipModule,
    LoadingImageModule,
    NgbNavModule,
  ],
  providers: [CommonService, BlockService, TransactionService, AccountService, MappingErrorService, DecimalPipe],
})
export class ValidatorsModule {}
