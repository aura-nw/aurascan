import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgClickOutsideDirective } from 'ng-click-outside2';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { AccountService } from 'src/app/core/services/account.service';
import { FeeGrantService } from 'src/app/core/services/feegrant.service';
import { MappingErrorService } from 'src/app/core/services/mapping-error.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { APaginatorModule } from 'src/app/shared/components/a-paginator/a-paginator.module';
import { NameTagModule } from 'src/app/shared/components/name-tag/name-tag.module';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FeeGrantRoutingModule } from './fee-grant-routing.module';
import { FeeGrantComponent } from './fee-grant.component';
import { MyGranteesComponent } from './my-grantees/my-grantees.component';
import { MyGrantersComponent } from './my-granters/my-granters.component';
import { PopupAddGrantComponent } from './popup-add-grant/popup-add-grant.component';
import { PopupNoticeComponent } from './popup-notice/popup-notice.component';
import { PopupRevokeComponent } from './popup-revoke/popup-revoke.component';
import { MASK_CONFIG } from 'src/app/app.config';

@NgModule({
  declarations: [
    FeeGrantComponent,
    MyGranteesComponent,
    MyGrantersComponent,
    PopupAddGrantComponent,
    PopupRevokeComponent,
    PopupNoticeComponent,
  ],
  imports: [
    CommonModule,
    FeeGrantRoutingModule,
    NgbNavModule,
    FormsModule,
    CommonPipeModule,
    MatTableModule,
    TableNoDataModule,
    TranslateModule,
    SharedModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    NgClickOutsideDirective,
    NgxMaskDirective,
    NgxMaskPipe,
    APaginatorModule,
    NameTagModule,
  ],
  providers: [
    UntypedFormBuilder,
    FeeGrantService,
    TransactionService,
    MappingErrorService,
    AccountService,
    provideEnvironmentNgxMask(MASK_CONFIG),
  ],
})
export class FeeGrantModule {}
