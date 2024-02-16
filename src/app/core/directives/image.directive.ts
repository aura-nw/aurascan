import { Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { EnvironmentService } from '../data-services/environment.service';
import { TITLE_LOGO } from '../constants/common.constant';
@Directive({
  selector: '[appImg]img',
})
export class ImageDirective implements OnInit, OnChanges {
  @Input() appImg: string;
  @Input() defaultImage: string = `assets/images/logo/title-logo.png`;

  get ref() {
    return this.elr.nativeElement;
  }

  constructor(
    private env: EnvironmentService,
    private elr: ElementRef<HTMLImageElement>,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.appImg) {
      this.ref.src = this.appImg;
    }
  }

  ngOnInit(): void {
    if (!this.ref.src && this.appImg) {
      this.ref.src = this.appImg || this.defaultImage;
    }

    this.elr.nativeElement.onerror = () => {
      this.elr.nativeElement.src = this.defaultImage;
    };
  }
}
