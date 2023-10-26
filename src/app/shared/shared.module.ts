import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { CommonDirectiveModule } from '../core/directives/common-directive.module';
import { CardMobExplainComponent } from './components/cards/card-mob-explain/card-mob-explain.component';
import { CardMobSimpleComponent } from './components/cards/card-mob-simple/card-mob-simple.component';
import { CardMobSimpleModule } from './components/cards/card-mob-simple/card-mob-simple.module';
import { LoadingSprintComponent } from './components/loading-sprint/loading-sprint.component';
import { PagetitleComponent } from './components/pagetitle/pagetitle.component';
import { SoulboundFeatureTokensModule } from './components/soulbound-feature-tokens/soulbound-feature-tokens.module';
import { CardMobAccountModule } from './components/cards/card-mob-account/card-mob-account.module';
import { CardMobAccountComponent } from './components/cards/card-mob-account/card-mob-account.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [PagetitleComponent, LoadingSprintComponent, CardMobExplainComponent],
  imports: [
    CommonModule,
    CardMobSimpleModule,
    SoulboundFeatureTokensModule,
    CommonPipeModule,
    CommonDirectiveModule,
    CardMobAccountModule,
    TranslateModule,
  ],
  exports: [
    PagetitleComponent,
    LoadingSprintComponent,
    CardMobSimpleComponent,
    CardMobExplainComponent,
    CardMobAccountComponent,
  ],
})
export class SharedModule {}
