import {Directive, ElementRef, Input} from '@angular/core';
import BigNumber from 'bignumber.js';

@Directive({
  selector: '[appTooltip]',
})
export class TooltipCustomizeDirective {
  @Input() appTooltip: string | { priceAmount: any; multipliedBy?: number; decimal?: number; lt?: number };

  @Input() classTooltip: string;
  @Input() disableTooltipHover: boolean = false;
  @Input() getTooltipPosition: boolean = true;

  constructor(private elRef: ElementRef) {
  }

  ngOnInit(): void {
    const element: HTMLElement = this.elRef.nativeElement;
    if (!element || !this.appTooltip) return;
    // check show up conditional
    let tooltipValue: any = '';
    if (typeof this.appTooltip === 'string') {
      // check if tooltip is string
      tooltipValue = this.appTooltip;
    } else if (this.appTooltip.priceAmount) {
      // check if tooltip is price
      this.appTooltip.decimal = this.appTooltip.decimal ?? 0;
      if (this.appTooltip.decimal > 0) {
        this.appTooltip.priceAmount = BigNumber(this.appTooltip.priceAmount).dividedBy(
          BigNumber(10).pow(this.appTooltip.decimal),
        );
      }
      const gte = BigNumber(+this.appTooltip.priceAmount)
        .multipliedBy(this.appTooltip.multipliedBy ?? 1).gte(1000000);
      const lt = BigNumber(+this.appTooltip.priceAmount)
        .multipliedBy(this.appTooltip.multipliedBy ?? 1).lt(this.appTooltip.lt ?? 0.001);
      if ((gte || lt) && this.appTooltip.priceAmount != 0) {
        tooltipValue = BigNumber(this.appTooltip.priceAmount)
          .multipliedBy(this.appTooltip.multipliedBy ?? 1)
          .toFormat();
      } else {
        tooltipValue = null;
      }
    }
    if (!tooltipValue || tooltipValue == '0') return;
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
    tooltip.innerHTML = tooltipValue;
    // set elements to DOM
    parent.replaceChild(contain, element);
    tooltipParent.appendChild(tooltip);
    contain.appendChild(element);
    contain.appendChild(tooltipParent);
    // set position for tooltip
    if (!this.disableTooltipHover) {
      element.addEventListener('mouseenter', (_) => {
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
          default:
            tooltipParent.style.left = elementObj.left + elementObj.width / 2 + 'px';
            tooltipParent.style.transform = 'translate(-50%, -2px)';
            break;
        }
      });
    }
  }
}
