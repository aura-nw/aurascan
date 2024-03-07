import {Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import BigNumber from 'bignumber.js';

@Directive({
  selector: '[appTooltip]',
})
export class TooltipCustomizeDirective implements OnDestroy, OnChanges, OnInit {
  @Input() appTooltip: string | { priceAmount: any; multipliedBy?: number; decimal?: number; lt?: number };
  @Input() classTooltip: string;
  @Input() decimalLengthTooltip: number = 6;
  @Input() disableTooltipHover: boolean = false;
  @Input() getTooltipPosition: boolean = true;
  element: HTMLElement;

  constructor(private elRef: ElementRef) {
    this.element = this.elRef.nativeElement;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.element || !this.appTooltip) {
      // remove app-tooltip-customize when data is null and component not reload
      if (this.element.parentNode?.children[1]?.className.includes('app-tooltip-customize')) {
        this.element.parentNode.removeChild(this.element.parentNode.children[1])
      }
    } else {
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
        const gte = BigNumber(this.appTooltip.priceAmount)
          .multipliedBy(this.appTooltip.multipliedBy ?? 1)
          .gte(1000000);
        const lt = BigNumber(this.appTooltip.priceAmount)
          .multipliedBy(this.appTooltip.multipliedBy ?? 1)
          .lt(this.appTooltip.lt ?? 0.001);
        if ((gte || lt) && this.appTooltip.priceAmount != 0) {
          const amountTemp = BigNumber(this.appTooltip.priceAmount).multipliedBy(this.appTooltip.multipliedBy ?? 1);
          const amountCondition = BigNumber(1).dividedBy(BigNumber(10).pow(this.decimalLengthTooltip)).toFixed();

          // fixed if value less than 0.000001
          if (amountTemp.toFixed() < amountCondition) {
            tooltipValue = amountTemp.toFixed().replace(/\.?0+$/, '');
          } else {
            tooltipValue = amountTemp.toFormat(this.decimalLengthTooltip).replace(/\.?0+$/, '');
          }
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
      const parent = this.element.parentNode;
      contain.classList.add('aura-tooltip-contain');
      this.element.classList.add('aura-tooltip-object');
      tooltipParent.classList.add('app-tooltip-customize');
      tooltip.classList.add('aura-tooltip');
      if (this.classTooltip) {
        tooltipParent.classList.add(this.classTooltip);
      }
      // set tooltip content
      tooltip.innerHTML = tooltipValue;
      // set elements to DOM
      parent.replaceChild(contain, this.element);
      tooltipParent.appendChild(tooltip);
      contain.appendChild(this.element);
      contain.appendChild(tooltipParent);
      // set position for tooltip
      if (!this.disableTooltipHover) {
        this.element.addEventListener('mouseenter', () => this.hoverAction(this.element, tooltipParent));
      }
    }
  }

  ngOnDestroy(): void {
    this.element.removeEventListener('mouseenter', () => {
    });
  }

  hoverAction(element, tooltipParent) {
    const offset = 16;
    let elementBounding = element.getBoundingClientRect();
    let tooltipBounding = tooltipParent.getBoundingClientRect();
    // set tooltip position top
    let marginTopValue = elementBounding.top - (tooltipBounding.height + offset);

    tooltipParent.style.position = 'fixed';
    tooltipParent.style.top = marginTopValue + 'px';
    tooltipParent.style.zIndex = '9999999';
    switch (this.classTooltip) {
      case 'tooltip--left':
        tooltipParent.style.left = elementBounding.right + 'px';
        tooltipParent.style.transform = 'translate(calc(-100% - 12px), 0)';
        break;
      case 'tooltip--right':
        tooltipParent.style.left = elementBounding.left + 'px';
        tooltipParent.style.transform = 'translate(0, 0)';
        break;
      default:
        tooltipParent.style.left = elementBounding.left + elementBounding.width / 2 + 'px';
        tooltipParent.style.transform = 'translate(-50%, 0)';
        break;
    }
  }

  ngOnInit(): void {
  }
}
