import { Directive, ElementRef, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonService } from 'src/app/core/services/common.service';
import { NULL_ADDRESS } from '../constants/common.constant';

@Directive({
  selector: 'copyBtn, [copyBtn]',
})
export class CopyButtonDirective implements OnChanges {
  @Input() copyBtn: string;
  @Input() copyText: string | null = null;
  @Input() isDisableCopy: boolean = false;
  @Input() btnClass: string[];
  @Input() iconClass: string[];
  @Input() iconHeight: string = '24px';
  button;
  tooltip;

  @HostListener('window:scroll', ['$event']) onScroll(event) {
    if (this.tooltip?.classList.contains('show')) {
      this.tooltip?.classList.remove('show');
    }
  }

  constructor(
    private elRef: ElementRef,
    private commonService: CommonService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isDisableCopy || !this.copyBtn || this.copyBtn === NULL_ADDRESS || this.button) {
      return;
    }
    const element: HTMLElement = this.elRef.nativeElement;
    if (!element) return;
    const parent = element.parentNode;
    const contain = document.createElement('div');
    this.button = document.createElement('button');
    this.button.classList.add('button', 'position-relative');
    this.button.style.height = this.iconHeight;
    // add class btn
    if (this.btnClass?.length > 0) {
      this.btnClass.forEach((c) => {
        this.button.classList.add(c);
      });
    } else {
      this.button.classList.add('px-0', 'ml-3', 'button--xxs');
    }
    contain.classList.add('d-inline-flex', 'align-items-center', 'tooltip-contain');
    parent.replaceChild(contain, element);
    contain.appendChild(element);
    // tooltip
    this.tooltip = document.createElement('div');
    this.tooltip.innerHTML = 'Copied!';
    this.tooltip.classList.add('tooltip-copy');
    if (!this.copyText) {
      const icon = document.createElement('i');
      // add class icon
      if (this.iconClass?.length > 0) {
        this.iconClass.forEach((c) => {
          icon.classList.add(c);
        });
      } else {
        icon.classList.add('ph', 'ph-copy', 'text--white', 'body-01');
      }
      this.button.appendChild(icon);
    } else {
      const span = document.createElement('span');
      span.innerText = this.copyText;
      this.button.appendChild(span);
    }
    this.button.appendChild(this.tooltip);
    contain.appendChild(this.button);
    // click show tooltip
    this.button.addEventListener('click', () => {
      if (this.tooltip) {
        // set position
        this.tooltip.style.top = this.commonService.getOffSet(this.button).top - 8 + 'px';
        this.tooltip.style.left = this.commonService.getOffSet(this.button).left + 'px';
      }
      this.tooltip.classList.add('show');
      this.copyMessage();
      setTimeout(() => {
        this.tooltip.classList.remove('show');
      }, 1000);
    });
  }

  copyMessage() {
    const content = this.copyBtn;
    const dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.value = content;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
  }
}
