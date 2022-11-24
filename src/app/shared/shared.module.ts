import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CardMobSimpleComponent } from './components/cards/card-mob-simple/card-mob-simple.component';
import { CardMobSimpleModule } from './components/cards/card-mob-simple/card-mob-simple.module';
import { LoadingSprintComponent } from './components/loading-sprint/loading-sprint.component';
import { PagetitleComponent } from './components/pagetitle/pagetitle.component';
import { SoulboundFeatureTokensComponent } from './components/soulbound-feature-tokens/soulbound-feature-tokens.component';

@NgModule({
  declarations: [
    PagetitleComponent,
    LoadingSprintComponent,
    SoulboundFeatureTokensComponent
  ],
  imports: [
    CommonModule,
    CardMobSimpleModule
  ],
  exports: [PagetitleComponent, LoadingSprintComponent, CardMobSimpleComponent, SoulboundFeatureTokensComponent]
})
export class SharedModule { }
