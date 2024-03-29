import { Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, pipe, Subscription } from 'rxjs';
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

  ngOnChanges(changes: SimpleChanges): void {
    if (this.router.url === this.routerLinkActiveMenu.link) {
      this.toogleActive();
    }

    // const reg = /\/token\/([\w]+)\/([\w\d]+)/;
    // const result = reg.exec(this.router.url);

    // switch (result[1]) {
    //   case 'cosmos':
    //     break;
    //   case 'evm':
    //     break;

    //   default:
    //     break;
    // }

    // if (this.tokenRE.test(this.router.url)) {
    //   this.toogleActive();
    // }
  }
}
