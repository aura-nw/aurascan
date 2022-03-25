import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { SimplebarAngularModule } from 'simplebar-angular';
import { LanguageService } from '../core/services/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { ClickOutsideModule } from 'ng-click-outside';

import { VerticalComponent } from './vertical/vertical.component';
import { TopbarComponent } from './topbar/topbar.component';
import { LayoutComponent } from './layout.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
import { RightsidebarComponent } from './rightsidebar/rightsidebar.component';
import { HorizontalComponent } from './horizontal/horizontal.component';
import { HorizontaltopbarComponent } from './horizontaltopbar/horizontaltopbar.component';
import { CommonService } from '../core/services/common.service';
import { FormsModule } from '@angular/forms';
import { WalletConnectModule } from '../shared/components/wallet-connect/wallet-connect.module';

@NgModule({
  declarations: [
    VerticalComponent,
    TopbarComponent,
    LayoutComponent,
    SidebarComponent,
    FooterComponent,
    RightsidebarComponent,
    HorizontalComponent,
    HorizontaltopbarComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    FeatherModule.pick(allIcons),
    NgbDropdownModule,
    SimplebarAngularModule,
    ClickOutsideModule,
    FormsModule,
    WalletConnectModule
  ],
  providers: [LanguageService, CommonService],
  exports: [VerticalComponent]
})
export class LayoutsModule { }
