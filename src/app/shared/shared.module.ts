import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CardMobSimpleComponent } from './components/cards/card-mob-simple/card-mob-simple.component';
import { CardMobSimpleModule } from './components/cards/card-mob-simple/card-mob-simple.module';
import { LoadingSprintComponent } from './components/loading-sprint/loading-sprint.component';
import { PagetitleComponent } from './components/pagetitle/pagetitle.component';
import { SoulboundFeatureTokensModule } from './components/soulbound-feature-tokens/soulbound-feature-tokens.module';
import { CardMobExplainComponent } from './components/cards/card-mob-explain/card-mob-explain.component';
import {CommonPipeModule} from "src/app/core/pipes/common-pipe.module";

@NgModule({
  declarations: [PagetitleComponent, LoadingSprintComponent, CardMobExplainComponent],
  imports: [CommonModule, CardMobSimpleModule, SoulboundFeatureTokensModule, CommonPipeModule],
  exports: [PagetitleComponent, LoadingSprintComponent, CardMobSimpleComponent, CardMobExplainComponent],
})
export class SharedModule {}
