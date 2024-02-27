import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { NULL_ADDRESS } from '../constants/common.constant';

@Directive({
  selector: 'copyBtn, [copyBtn]',
})
export class CopyButtonDirective {
  @Input() copyBtn: string;
  @Input() isDisableCopy: boolean = false;
  @Input() btnClass: string[];
  button;
  tooltip;

  constructor(private elRef: ElementRef) {}

  @HostListener('window:scroll', ['$event']) onScroll(event) {
    if (this.tooltip?.classList.contains('show')) {
      this.tooltip?.classList.remove('show');
    }
  }

  ngOnInit(): void {
    if (this.isDisableCopy || !this.copyBtn || this.copyBtn === NULL_ADDRESS) {
      return;
    }

    const element: HTMLElement = this.elRef.nativeElement;
    if (!element) return;
    const content = this.copyBtn;
    const parent = element.parentNode;
    const contain = document.createElement('div');
    this.button = document.createElement('button');

    const icon = document.createElement('i');
    this.button.classList.add('button', 'button--xxs', 'position-relative', 'px-0', 'ml-3');
    if (this.btnClass?.length > 0) {
      this.btnClass.forEach((c) => {
        this.button.classList.add(c);
      });
    }
    icon.classList.add('ph', 'ph-copy', 'text--white', 'body-01');
    contain.classList.add('d-inline-flex', 'align-items-center');
    parent.replaceChild(contain, element);
    this.button.appendChild(icon);
    contain.appendChild(element);
    // tooltip
    this.tooltip = document.createElement('div');
    this.tooltip.innerHTML = 'Copied!';
    this.tooltip.classList.add('tooltip-copy');
    this.button.appendChild(this.tooltip);
    contain.appendChild(this.button);
    // set position
    const getOffset = (el) => {
      const rect = el.getBoundingClientRect();
      return {
        left: rect.left + window.scrollX + rect.width / 2,
        top: rect.top,
      };
    };

    // click show tooltip
    this.button.addEventListener('click', () => {
      if (this.tooltip) {
        this.tooltip.style.top = getOffset(this.button).top + 'px';
        this.tooltip.style.left = getOffset(this.button).left + 'px';
      }
      this.tooltip.classList.add('show');
      this.copyMessage(content);

      setTimeout(() => {
        this.tooltip.classList.remove('show');
      }, 1000);
    });
  }

  copyMessage(text: string) {
    const dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
  }
}
