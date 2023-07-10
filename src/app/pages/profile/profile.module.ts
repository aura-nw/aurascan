import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskModule } from 'ngx-mask';
import { LoadingImageModule } from 'src/app/shared/components/loading-image/loading-image.module';
import { NameTagModule } from 'src/app/shared/components/name-tag/name-tag.module';
import { MaterialModule } from '../../app.module';
import { CommonPipeModule } from '../../core/pipes/common-pipe.module';
import { SharedModule } from '../../shared/shared.module';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { ProfileComponent } from './profile.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [ProfileComponent, ProfileSettingsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ProfileRoutingModule,
    SharedModule,
    MaterialModule,
    TranslateModule,
    CommonPipeModule,
    NgxMaskModule,
    LoadingImageModule,
    ReactiveFormsModule,
    NameTagModule,
    MatIconModule,
  ],
  providers: [FormBuilder],
})
export class ProfileModule {}
