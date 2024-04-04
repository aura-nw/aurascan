import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { MASK_CONFIG } from 'src/app/app.config';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { LoadingImageModule } from 'src/app/shared/components/loading-image/loading-image.module';
import { NameTagModule } from 'src/app/shared/components/name-tag/name-tag.module';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { PopupCommonComponent } from 'src/app/shared/components/popup-common/popup-common.component';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { CustomPipeModule } from '../../core/pipes/custom-pipe.module';
import { MaterialModule } from '../../material.module';
import { SharedModule } from '../../shared/shared.module';
import { PopupNameTagComponent } from './private-name-tag/popup-name-tag/popup-name-tag.component';
import { PrivateNameTagComponent } from './private-name-tag/private-name-tag.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { ProfileComponent } from './profile.component';
import { PopupWatchlistComponent } from './watchlist/popup-watchlist/popup-watchlist.component';
import { WatchListComponent } from './watchlist/watchlist.component';

@NgModule({
  declarations: [
    ProfileComponent,
    ProfileSettingsComponent,
    PrivateNameTagComponent,
    PopupNameTagComponent,
    PopupCommonComponent,
    WatchListComponent,
    PopupWatchlistComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ProfileRoutingModule,
    SharedModule,
    MaterialModule,
    TranslateModule,
    CustomPipeModule,
    NgxMaskDirective,
    NgxMaskPipe,
    LoadingImageModule,
    ReactiveFormsModule,
    NameTagModule,
    NgbNavModule,
    TableNoDataModule,
    PaginatorModule,
    CommonDirectiveModule
  ],
  providers: [UntypedFormBuilder, provideEnvironmentNgxMask(MASK_CONFIG)],
})
export class ProfileModule {}
