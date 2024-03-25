import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { MASK_CONFIG } from 'src/app/app.config';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { MaterialModule } from 'src/app/material.module';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { CardMobChannelComponent } from './channel-detail/card-mob-channel/card-mob-channel.component';
import { ChannelDetailComponent } from './channel-detail/channel-detail.component';
import { TransferAssetsComponent } from './channel-detail/transfer-assets/transfer-assets.component';
import { IBCRoutingModule } from './ibc-routing.module';
import { IBCComponent } from './ibc.component';
import { PopupIBCDetailModule } from './popup-ibc-detail/popup-ibc-detail.module';

@NgModule({
  declarations: [IBCComponent, ChannelDetailComponent, TransferAssetsComponent, CardMobChannelComponent],
  imports: [
    IBCRoutingModule,
    SharedModule,
    CustomPipeModule,
    CommonModule,
    FormsModule,
    TableNoDataModule,
    PaginatorModule,
    TranslateModule,
    MaterialModule,
    NgbNavModule,
    NgxMaskDirective,
    NgxMaskPipe,
    PopupIBCDetailModule,
    CommonDirectiveModule,
  ],
  providers: [provideEnvironmentNgxMask(MASK_CONFIG)],
})
export class IBCModule {}
