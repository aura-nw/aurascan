import {AfterViewInit, Directive, ElementRef, Input} from '@angular/core';
import {EWalletType} from 'src/app/core/constants/wallet.constant';
import {Router} from '@angular/router';

@Directive({
  selector: '[activeMenuItem]',
})
export class MenuActiveDirective implements AfterViewInit {
  @Input() activeMenuItem: { menuLink: string; menuDetailLink?: string };
  element: HTMLElement;

  constructor(
    private elRef: ElementRef,
    public router: Router,
  ) {
    this.element = this.elRef.nativeElement;
  }

  urlCompare(link: string) {
    return this.router.url === link;
  }

  urlContain(link: string) {
    return this.router.url.includes(link);
  }

  urlCheckEVM() {
    return this.router.url.split('/')[2]?.startsWith(EWalletType.EVM);
  }

  addActiveClass() {
    return this.element.classList.add('active');
  }

  checkMenuLink(link: string) {
    return this.activeMenuItem.menuLink === link;
  }

  checkMenuDetailLink(link: string) {
    return this.activeMenuItem.menuDetailLink === link;
  }

  ngAfterViewInit(): void {
    if (!this.element || !this.activeMenuItem) return;
    // dash board
    if ((this.urlCompare('/') || this.urlCompare('/dashboard')) && this.activeMenuItem.menuLink === '/') {
      this.addActiveClass();
    }
    // default
    if (this.urlCompare(this.activeMenuItem.menuLink)) {
      this.addActiveClass();
    }
    // transaction
    if (this.checkMenuLink('/transactions') && this.urlContain('/tx') && !this.urlCheckEVM()) {
      this.addActiveClass();
    }
    // evm-transaction
    if (
      this.checkMenuLink('/evm-transactions') &&
      this.urlContain('/tx') && this.urlCheckEVM()
    ) {
      this.addActiveClass();
    }
    // contract
    if (
      this.checkMenuLink('/contracts') &&
      this.urlContain('/contracts') && !this.urlCheckEVM()
    ) {
      this.addActiveClass();
    }
    // evm-contract
    if (this.checkMenuLink('/evm-contracts') && this.urlContain('/evm-contracts')) {
      this.addActiveClass();
    }
    // validate
    if (this.checkMenuLink('/validators') && this.urlContain('/validators')) {
      this.addActiveClass();
    }
    // block
    if (this.checkMenuLink('/blocks') && this.urlContain('/block')) {
      this.addActiveClass();
    }
    // voting
    if (this.checkMenuDetailLink('voting') && this.urlContain('/votings/')) {
      this.addActiveClass();
    }
    // token
    if (this.checkMenuDetailLink('token') && this.urlCompare('/tokens')) {
      this.addActiveClass();
    }
    // token-detail
    if (
      this.checkMenuDetailLink('token') &&
      this.urlContain('/token/') &&
      this.router.url.split('/').length === 3
    ) {
      this.addActiveClass();
    }
    // nft
    if (this.checkMenuDetailLink('nft') && this.urlCompare('/tokens/tokens-nft')) {
      this.addActiveClass();
    }
    // nft-detail
    if (
      this.checkMenuDetailLink('nft') &&
      this.urlContain('/token/nft') &&
      this.router.url.split('/').length === 4
    ) {
      this.addActiveClass();
    }
    // abt
    if (this.checkMenuDetailLink('abt') && this.urlCompare('/tokens/token-abt')) {
      this.addActiveClass();
    }
    // abt-detail
    if (
      this.checkMenuDetailLink('abt') &&
      this.urlContain('/token/abt') &&
      this.router.url.split('/').length === 4
    ) {
      this.addActiveClass();
    }
    // statistics
    if (
      this.checkMenuLink('/statistics/charts-stats') &&
      (this.urlCompare('/statistics/charts-stats') || this.urlContain('/statistics/chart/'))
    ) {
      this.addActiveClass();
    }
    // statistics-detail
    if (
      this.checkMenuLink('/statistics/top-statistic') &&
      this.urlCompare('/statistics/top-statistic')
    ) {
      this.addActiveClass();
    }
    // code-ids
    if (
      this.checkMenuLink('/code-ids') &&
      (this.urlCompare('/code-ids') ||
        this.urlContain('/code-ids/detail/') ||
        this.urlContain('/code-ids/verify/'))
    ) {
      this.addActiveClass();
    }
  }
}
