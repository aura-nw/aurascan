import {Directive, ElementRef, Input} from '@angular/core';

@Directive({
  selector: 'copyBtn, [copyBtn]',
})
export class CopyButtonDirective {
  @Input() copyBtn: string;
  @Input() isDisableCopy: boolean = false;
  button;
  tooltip;

  constructor(private elRef: ElementRef) {
  }

  ngOnInit(): void {
    if (this.isDisableCopy || !this.copyBtn) {
      return;
    }

    const element: HTMLElement = this.elRef.nativeElement;
    if (!element) return;
    const content = this.copyBtn;
    const parent = element.parentNode;
    const contain = document.createElement('div');
    this.button = document.createElement('button');

    const icon = document.createElement('i');
    this.button.classList.add('button', 'button--xxs', 'position-relative', 'pr-0');
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

    // click show tooltip
    this.button.addEventListener('click', () => {
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
