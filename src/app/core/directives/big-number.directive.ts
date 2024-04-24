import { AfterViewInit, Directive, ElementRef, Input, SimpleChanges } from '@angular/core';
import BigNumber from 'bignumber.js';
import { NgxMaskPipe } from 'ngx-mask';
import { Globals } from 'src/app/global/global';
import { IntlFormat } from '../utils/common/parsing';
import { TokenService } from '../services/token.service';

@Directive({
  selector: 'span[appBigNumber],div[appBigNumber]',
  providers: [NgxMaskPipe],
})
export class BigNumberDirective implements AfterViewInit {
  @Input() decimal: number = 6;
  @Input() appBigNumber: any;
  @Input() tokenPrice: any;
  @Input() auraValue: boolean = false;
  @Input() votingPower: boolean = false;
  @Input() numberDecimal = 6;
  element: HTMLElement;

  constructor(
    private mask: NgxMaskPipe,
    private tokenService: TokenService,
    private elRef: ElementRef,
  ) {
    this.element = elRef.nativeElement;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.appBigNumber.currentValue !== changes.appBigNumber.previousValue) {
      this.convertNumber();
    }
  }

  ngAfterViewInit(): void {}

  convertNumber() {
    const newAmount = new BigNumber(this.appBigNumber);
    const powValue = new BigNumber(10).pow(this.decimal);
    let amountValue = newAmount.dividedBy(powValue);

    //value
    if (this.tokenPrice) {
      amountValue = amountValue.multipliedBy(this.tokenPrice);
    }

    // price with Aura
    if (this.auraValue) {
      amountValue = amountValue.dividedBy(this.tokenService.nativePrice);
    }

    if (amountValue.lt(0.000001)) {
      if (this.tokenPrice && this.auraValue !== true) {
        this.element.textContent = '$' + '0.00';
      } else {
        this.element.textContent = '0';
      }
      return;
    } else {
      const powNum = new BigNumber(10).pow(15);
      if (amountValue.gt(powNum)) {
        if (!this.tokenPrice || this.auraValue) {
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
      ];

      for (let i = 0; i < powers.length; i++) {
        let reduced = amountValue.dividedBy(powers[i].value).precision(3);
        if (reduced.gte(1)) {
          abs = reduced.toFixed(2, 1);
          key = powers[i].key;
          break;
        }
      }

      if (key === '') {
        if (this.tokenPrice && this.auraValue !== true) {
          this.element.textContent =
            '$' + (IntlFormat(amountValue.toString(), 2) === '0' ? '0.00' : IntlFormat(amountValue.toString(), 2));
        } else if (this.votingPower) {
          this.element.textContent =
            IntlFormat(amountValue.toString(), 2) === '0' ? '0.00' : IntlFormat(amountValue.toString(), 2);
        } else {
          this.element.textContent = IntlFormat(amountValue.toString(), this.numberDecimal);
        }
        return;
      }

      this.element.textContent =
        (this.tokenPrice && this.auraValue !== true ? '$' : '') + this.mask.transform(abs, 'separator.2') + key;
      return;
    }
  }
}
