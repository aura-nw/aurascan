import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';
import { EnvironmentService } from '../data-services/environment.service';

@Directive({
  selector: '[appLinkDenom]',
  providers: [],
})
export class LinkDenomDirective {
  coinInfo = this.environmentService.chainInfo.currencies[0];
  linkItem = '';
  element: HTMLElement;

  @Input() appLinkDenom: string;

  @HostListener('click', ['$event'])
  linkEvent(event) {
    this.router.navigate([this.linkItem]);
  }

  constructor(
    private environmentService: EnvironmentService,
    public router: Router,
    elRef: ElementRef,
  ) {
    this.element = elRef.nativeElement;
  }

  ngOnInit(): void {
    this.addLink();
  }

  addLink() {
    this.appLinkDenom = this.appLinkDenom || this.coinInfo.coinMinimalDenom;
    // check link of denom
    const linkToken = this.appLinkDenom.replace('ibc/', '');
    this.linkItem = `/tokens/token/${linkToken}`;

    //create parent a with link
    let parent = this.element.parentNode;
    const linkElement = document.createElement('a');
    parent.replaceChild(linkElement, this.element);
    linkElement.setAttribute('href', this.linkItem);
    linkElement.setAttribute('onclick', 'return false');
    linkElement.classList.add('text--primary');
    this.element.classList.remove('text--white');
    linkElement.appendChild(this.element);
    return;
  }
}
