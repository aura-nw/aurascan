import {AfterViewInit, Component, ElementRef, Input, OnInit, Renderer2} from '@angular/core';

@Component({
  selector: 'app-tooltip-customize',
  templateUrl: './tooltip-customize.component.html',
  styleUrls: ['./tooltip-customize.component.scss'],
})
export class TooltipCustomizeComponent implements OnInit, AfterViewInit {
  @Input() content: string;
  @Input() class: string;
  @Input() requestGetPosition: boolean = true;
  constructor(private renderer: Renderer2, private el: ElementRef) {
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if(!this.requestGetPosition) return;
    let parent = this.renderer.parentNode(this.el.nativeElement);
    if(!parent) return;
    let sibling = parent.querySelector('.aura-tooltip-object:not(.disabled-hover)');
    if(!sibling) return;
    sibling.addEventListener("mouseenter", (_) => {
      let siblingObj = sibling.getBoundingClientRect();
      let tooltipObj = this.el.nativeElement.getBoundingClientRect();
      let tooltipY = siblingObj.top - (tooltipObj.height + 16);

      this.el.nativeElement.style.position = 'fixed';
      this.el.nativeElement.style.top = tooltipY + 'px';
      this.el.nativeElement.style.index = 9999999;
      switch (this.el.nativeElement.className) {
        case 'tooltip--left':
          this.el.nativeElement.style.left = siblingObj.right + 'px';
          this.el.nativeElement.style.transform = 'translate(calc(-100% - 32px), -2px)';
          break;
        case 'tooltip--right':
          this.el.nativeElement.style.left = siblingObj.left + 'px';
          this.el.nativeElement.style.transform = 'translate(0, -2px)';
          break;
        default :
          this.el.nativeElement.style.left = (siblingObj.left + (siblingObj.width /2)) + 'px';
          this.el.nativeElement.style.transform = 'translate(-50%, -2px)';
          break;
      }
    });
  }
}
