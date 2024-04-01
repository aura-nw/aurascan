import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IsActiveMatchOptions, Router } from '@angular/router';
import { MenuItem } from 'src/app/layouts/horizontaltopbar/menu.model';

@Directive({
  selector: '[routerLinkActiveMenu]',
})
export class RouterLinkActiveMenuDirective implements OnChanges {
  @Input() routerLinkActiveMenu: MenuItem;

  element: HTMLElement = this.elRef.nativeElement;

  tokenRE = new RegExp(/\/token\/[0-9a-zA-z]+/);

  constructor(
    private elRef: ElementRef,
    public router: Router,
  ) {}

  toogleActive() {
    this.element.classList.add('active');
  }

  isActive(link: string) {
    const matchOptions: IsActiveMatchOptions = {
      paths: 'subset',
      queryParams: 'ignored',
      fragment: 'exact',
      matrixParams: 'exact',
    };

    return this.router.isActive(link, matchOptions);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const url = this.router.url;

    if (url === this.routerLinkActiveMenu.link) {
      this.toogleActive();
      return;
    }

    if (this.routerLinkActiveMenu?.activeString) {
      let isActive = false;
      if (typeof this.routerLinkActiveMenu?.activeString == 'string') {
        isActive = this.isActive(this.routerLinkActiveMenu?.activeString);
      } else {
        this.routerLinkActiveMenu?.activeString.forEach((element) => {
          isActive = this.isActive(element) || isActive;
        });
      }

      // Special case for cosmos tx detail
      if (this.routerLinkActiveMenu.link == '/transactions' && url.startsWith('/tx/0x')) {
        isActive = false;
      }

      // Special case for Evm tx detail
      if (this.routerLinkActiveMenu.link == '/evm-transactions' && !url.startsWith('/tx/0x')) {
        isActive = false;
      }

      if (isActive) {
        this.toogleActive();
        return;
      }
    }
  }
}
