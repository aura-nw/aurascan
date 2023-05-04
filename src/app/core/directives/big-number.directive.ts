import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import BigNumber from 'bignumber.js';
import { MaskPipe } from 'ngx-mask';
@Directive({
  selector: 'div[appBigNumber]',
  providers: [MaskPipe],
})
export class BigNumberDirective implements AfterViewInit {
  @Input() decimal: number = 6;
  @Input() appBigNumber: any;
  @Input() tokenPrice: any;

  element: HTMLElement;
  constructor(private mask: MaskPipe, public elRef: ElementRef) {
    this.element = elRef.nativeElement;
  }

  ngAfterViewInit(): void {
    this.calc();
  }

  calc() {
    const newAmount = new BigNumber(this.appBigNumber);
    const powValue = new BigNumber(10).pow(this.decimal);
    let amountValue = newAmount.dividedBy(powValue);

    if (this.tokenPrice) {
      amountValue = amountValue.multipliedBy(this.tokenPrice);
    }

    if (amountValue.lt(0.000001)) {
      this.element.textContent = '0';
      return;
    } else {
      const powNum = new BigNumber(10).pow(15);
      if (amountValue.gte(powNum)) {
        if (!this.tokenPrice) {
          this.element.textContent = '> 1,000T';
        } else {
          this.element.textContent = '> $1,000T';
        }
        return;
      }

      let abs;
      let key = '';
      const powers = [
        { key: 'T', value: new BigNumber(10).pow(12) },
        { key: 'B', value: new BigNumber(10).pow(9) },
        { key: 'M', value: new BigNumber(10).pow(6) },
        { key: 'K', value: new BigNumber(10).pow(3) },
      ];

      for (let i = 0; i < powers.length; i++) {
        let reduced = amountValue.dividedBy(powers[i].value);
        if (reduced.gte(1)) {
          abs = reduced.toFixed(2);
          key = powers[i].key;
          break;
        }
      }

      if (key === '') {
        this.element.textContent =
          (this.tokenPrice ? '$' : '') + this.mask.transform(amountValue.toString(), 'separator.6');
        return;
      }

      this.element.textContent =
        (this.tokenPrice ? '$' : '') + this.mask.transform(abs.toString(), 'separator.2') + key;
      return;
    }
  }
}
