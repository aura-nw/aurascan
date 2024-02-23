import {Directive, ElementRef, Input} from '@angular/core';

@Directive({
  selector: '[appTooltip]'
})
export class TooltipCustomizeDirective {
  @Input() appTooltip: string;
  @Input() classTooltip: string;
  @Input() disableTooltipHover: boolean = false;
  @Input() getTooltipPosition: boolean = true;

  constructor(private elRef: ElementRef) {
  }

  ngOnInit(): void {
    // check show up conditional
    if (!this.appTooltip) return;
    const element: HTMLElement = this.elRef.nativeElement;
    if (!element) return;
    // get element
    const contain = document.createElement('div');
    const tooltipParent = document.createElement('div');
    const tooltip = document.createElement('div');
    // set class
    const parent = element.parentNode;
    contain.classList.add('aura-tooltip-contain');
    element.classList.add('aura-tooltip-object');
    tooltipParent.classList.add('app-tooltip-customize');
    tooltip.classList.add('aura-tooltip');
    if (this.classTooltip) {
      tooltip.classList.add(this.classTooltip);
    }
    // set tooltip content
    tooltip.innerHTML = this.appTooltip;
    // set elements to DOM
    parent.replaceChild(contain, element);
    tooltipParent.appendChild(tooltip);
    contain.appendChild(element);
    contain.appendChild(tooltipParent);
    // set position for tooltip
    if (!this.disableTooltipHover) {
      element.addEventListener("mouseenter", (_) => {
        let elementObj = element.getBoundingClientRect();
        let tooltipObj = tooltipParent.getBoundingClientRect();
        let tooltipY = elementObj.top - (tooltipObj.height + 16);

        tooltipParent.style.position = 'fixed';
        tooltipParent.style.top = tooltipY + 'px';
        tooltipParent.style.zIndex = '9999999';
        switch (tooltipParent.className) {
          case 'tooltip--left':
            tooltipParent.style.left = elementObj.right + 'px';
            tooltipParent.style.transform = 'translate(calc(-100% - 32px), -2px)';
            break;
          case 'tooltip--right':
            tooltipParent.style.left = elementObj.left + 'px';
            tooltipParent.style.transform = 'translate(0, -2px)';
            break;
          default :
            tooltipParent.style.left = (elementObj.left + (elementObj.width / 2)) + 'px';
            tooltipParent.style.transform = 'translate(-50%, -2px)';
            break;
        }
      });
    }
  }
}