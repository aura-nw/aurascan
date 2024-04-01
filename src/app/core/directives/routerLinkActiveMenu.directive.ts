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
    if (this.router.url === this.routerLinkActiveMenu.link) {
      this.toogleActive();
      return;
    }

    if (this.routerLinkActiveMenu?.activeString) {
      const isActive = this.isActive(this.routerLinkActiveMenu?.activeString);

      if (isActive) {
        this.toogleActive();
      }
    }
  }
}
