import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'copyBtn, [copyBtn]',
})
export class CopyButtonDirective {
  @Input() copyBtn: string;
  topPos;
  leftPos;
  button;
  tooltip;

  // @HostListener('window:scroll', ['$event']) onScroll(event) {
  //   if (this.button && this.tooltip) {
  //     this.topPos = this.button.getBoundingClientRect().top;
  //     this.leftPos = this.button.getBoundingClientRect().left;
  //   }
  // }

  constructor(private elRef: ElementRef) {}

  ngOnInit(): void {
    const element: HTMLElement = this.elRef.nativeElement;
    if (!element) return;
    const content = this.copyBtn;
    const parent = element.parentNode;
    const contain = document.createElement('div');
    this.button = document.createElement('button');

    const icon = document.createElement('i');
    this.button.classList.add('button', 'button--xxs', 'position-relative');
    icon.classList.add('ph', 'ph-copy', 'text--white', 'body-01');
    contain.classList.add('d-flex', 'align-items-center');
    parent.replaceChild(contain, element);
    this.button.appendChild(icon);
    contain.appendChild(element);
    // tooltip
    this.tooltip = document.createElement('div');
    this.tooltip.innerHTML = 'Copied!';
    this.tooltip.classList.add('tooltip-copy');
    this.button.appendChild(this.tooltip);
    contain.appendChild(this.button);

    // click show tooltip
    this.button.addEventListener('click', () => {
      this.tooltip.classList.add('show');
      navigator.clipboard.writeText(content);
      setTimeout(() => {
        this.tooltip.classList.remove('show');
      }, 1000);
    });
  }
}
