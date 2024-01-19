import {Directive, ElementRef, Input} from '@angular/core';

@Directive({
  selector: 'copyBtn, [copyBtn]',
})
export class CopyButtonDirective {
  @Input() copyBtn: string;


  constructor(private elRef: ElementRef) {
  }

  ngOnInit(): void {
    const element: HTMLElement = this.elRef.nativeElement;
    if (!element) return;
    const content = this.copyBtn;
    const parent = element.parentNode;
    const contain = document.createElement('div');
    const button = document.createElement('button');

    const icon = document.createElement('i');
    button.classList.add('button', 'button--xxs', 'button--sm-mob', 'button-circle', 'ml-2');
    icon.classList.add('ph', 'ph-copy', 'text--white', 'body-01');
    contain.classList.add('d-flex', 'align-items-center');
    parent.replaceChild(contain, element);
    button.appendChild(icon);
    contain.appendChild(element);
    contain.appendChild(button);

    button.onclick = function () {
      if (content?.length > 0) {
        console.log(content)
      }
    };
  }
}
