import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { CommonDirectiveModule } from '../core/directives/common-directive.module';
import { CardMobAccountComponent } from './components/cards/card-mob-account/card-mob-account.component';
import { CardMobAccountModule } from './components/cards/card-mob-account/card-mob-account.module';
import { CardMobExplainComponent } from './components/cards/card-mob-explain/card-mob-explain.component';
import { CardMobSimpleComponent } from './components/cards/card-mob-simple/card-mob-simple.component';
import { CardMobSimpleModule } from './components/cards/card-mob-simple/card-mob-simple.module';
import { LoadingSprintComponent } from './components/loading-sprint/loading-sprint.component';
import { PagetitleComponent } from './components/pagetitle/pagetitle.component';
import { SoulboundFeatureTokensModule } from './components/soulbound-feature-tokens/soulbound-feature-tokens.module';
import { CardMobExecutedEvmModule } from './components/cards/card-mob-executed-evm/card-mob-executed-evm.module';

@NgModule({
  declarations: [PagetitleComponent, LoadingSprintComponent, CardMobExplainComponent],
  imports: [
    CommonModule,
    CardMobSimpleModule,
    SoulboundFeatureTokensModule,
    CustomPipeModule,
    CommonDirectiveModule,
    CardMobAccountModule,
    CardMobExecutedEvmModule
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
