import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/app.module';
import { NgxMaskModule } from 'ngx-mask';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonService } from 'src/app/core/services/common.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { validatorsComponent } from './validators.component';
import { ValidatorsDetailComponent } from './validators-detail/validators-detail.component';
import { ValidatorsRoutingModule } from './validators-routing.module';

@NgModule({
  declarations: [
    validatorsComponent,
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
    SharedModule
  ],
  providers: [CommonService]
})
export class ValidatorsModule { }
