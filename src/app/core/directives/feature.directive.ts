import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { NgxMaskPipe } from 'ngx-mask';
import { EnvironmentService } from '../data-services/environment.service';
@Directive({
  selector: '[appFeature]',
  providers: [NgxMaskPipe],
})
export class FeatureDirective implements OnInit {
  @Input() appFeature: string;

  private features = this.env.chainConfig.features;

  constructor(private env: EnvironmentService, private elr: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    console.log('OK', this.appFeature, this.features);
    if (this.appFeature && this.features?.length > 0) {
      const it = this.features.findIndex((feat) => feat === this.appFeature);

      if (it < 0) {
        this.elr.nativeElement.remove();
      }
    }
  }
}
