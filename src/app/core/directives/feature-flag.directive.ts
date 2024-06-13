import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { FeatureFlagService } from '../data-services/feature-flag.service';
import { FeatureFlags } from '../constants/feature-flags.enum';

@Directive({
  selector: '[featureFlag]',
  providers: [],
})
export class FeatureFlagDirective implements OnInit {
  @Input() featureFlag: keyof typeof FeatureFlags;
  @Input() flagEnabled: boolean = true;

  constructor(
    private flags: FeatureFlagService,
    private elr: ElementRef<HTMLElement>,
  ) {}

  ngOnInit(): void {
    if (!this.featureFlag) return;

    const actualFlagEnabled = this.flags.isEnabled(FeatureFlags[this.featureFlag]);
    if (this.flagEnabled === actualFlagEnabled) return;

    this.elr.nativeElement.remove();
  }
}
