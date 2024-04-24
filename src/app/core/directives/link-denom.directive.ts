import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';
import { EnvironmentService } from '../data-services/environment.service';

@Directive({
  selector: 'appLinkDenom, [appLinkDenom]',
})
export class LinkDenomDirective {
  coinInfo = this.environmentService.chainInfo.currencies[0];
  linkItem = '';

  @Input() appLinkDenom: string;
  @Input() isDisable: boolean = false;

  @HostListener('click', ['$event'])
  linkEvent(event) {
    if (this.linkItem?.length > 0) {
      this.router.navigate([this.linkItem]);
    }
  }

  constructor(
    private environmentService: EnvironmentService,
    public router: Router,
    private elRef: ElementRef,
  ) {}

  ngOnInit(): void {
    if (!this.isDisable) {
      this.addLink();
    }
  }

  addLink() {
    this.appLinkDenom = this.appLinkDenom || this.coinInfo.coinMinimalDenom;
    // check link of denom
    const linkToken = this.appLinkDenom.replace('ibc/', '');
    this.linkItem = `/token/${linkToken}`;

    //create parent a with link
    const element: HTMLElement = this.elRef.nativeElement;
    const parent = element.parentNode;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', this.linkItem);
    linkElement.setAttribute('onclick', 'return false');
    linkElement.classList.add('text--primary');
    parent.replaceChild(linkElement, element);
    linkElement.appendChild(element);
  }
}
