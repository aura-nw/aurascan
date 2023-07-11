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
import { TooltipCustomizeComponent } from './components/tooltip-customize/tooltip-customize.component';

@NgModule({
  declarations: [PagetitleComponent, LoadingSprintComponent, CardMobExplainComponent, TooltipCustomizeComponent],
  imports: [CommonModule, CardMobSimpleModule, SoulboundFeatureTokensModule, CommonPipeModule, CommonDirectiveModule],
  exports: [
    PagetitleComponent,
    LoadingSprintComponent,
    CardMobSimpleComponent,
    CardMobExplainComponent,
    TooltipCustomizeComponent,
  ],
})
export class SharedModule {}
