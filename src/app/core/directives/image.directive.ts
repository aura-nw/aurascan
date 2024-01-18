import { Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { EnvironmentService } from '../data-services/environment.service';
@Directive({
  selector: '[appImg]img',
})
export class ImageDirective implements OnInit, OnChanges {
  @Input() appImg: string;
  @Input() defaultImage: string = `${this.env.imageUrl}images/icons/token-logo.png`;

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
      this.ref.src = this.appImg;
    }

    this.elr.nativeElement.onerror = () => {
      this.elr.nativeElement.src = this.defaultImage;
    };
  }
}
