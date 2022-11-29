import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ClickOutsideModule } from 'ng-click-outside';
import { SimplebarAngularModule } from 'simplebar-angular';
import { CommonPipeModule } from '../core/pipes/common-pipe.module';
import { CommonService } from '../core/services/common.service';
import { LanguageService } from '../core/services/language.service';
import { TransactionService } from '../core/services/transaction.service';
import { WalletConnectModule } from '../shared/components/wallet-connect/wallet-connect.module';
import { DialogComponent } from './dialog/dialog.component';
import { FooterComponent } from './footer/footer.component';
import { HorizontalComponent } from './horizontal/horizontal.component';
import { HorizontaltopbarComponent } from './horizontaltopbar/horizontaltopbar.component';
import { LayoutComponent } from './layout.component';
import {ContractService} from "src/app/core/services/contract.service";
import { MenuBottomBarComponent } from './menu-bottom-bar/menu-bottom-bar.component';

@NgModule({
  declarations: [LayoutComponent, FooterComponent, HorizontalComponent, HorizontaltopbarComponent, DialogComponent, MenuBottomBarComponent],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    NgbDropdownModule,
    SimplebarAngularModule,
    ClickOutsideModule,
    FormsModule,
    WalletConnectModule,
    NgbPopoverModule,
    CommonPipeModule,
  ],
  providers: [LanguageService, CommonService, TransactionService, ContractService],
  exports: [],
})
export class LayoutsModule {}
