import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import { EWalletType } from 'src/app/core/constants/wallet.constant';
import { Router } from '@angular/router';

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

  ngAfterViewInit(): void {
    if (!this.element || !this.activeMenuItem) return;
    let menuClass = '';
    // dash board
    if ((this.router.url === '/' || this.router.url === '/dashboard') && this.activeMenuItem.menuLink === '/') {
      menuClass = 'active';
    }
    // default
    if (this.router.url === this.activeMenuItem.menuLink) {
      menuClass = 'active';
    }

    if (
      this.activeMenuItem.menuDetailLink === 'transaction' &&
      this.router.url.includes('/txs') &&
      !this.router.url.split('/')[2]?.startsWith(EWalletType.EVM)
    ) {
      menuClass = 'active';
    }

    if (
      this.activeMenuItem.menuDetailLink === 'evm-transaction' &&
      this.router.url.includes('/txs') &&
      this.router.url.split('/')[2]?.startsWith(EWalletType.EVM)
    ) {
      menuClass = 'active';
    }

    if (
      this.activeMenuItem.menuLink === '/transactions' &&
      this.router.url.includes('/transaction') &&
      !this.router.url.split('/')[2]?.startsWith(EWalletType.EVM)
    ) {
      menuClass = 'active';
    }

    if (
      this.activeMenuItem.menuLink === '/evm-transactions' &&
      this.router.url.includes('/transaction') &&
      this.router.url.split('/')[2]?.startsWith(EWalletType.EVM)
    ) {
      menuClass = 'active';
    }

    if (
      this.activeMenuItem.menuLink === '/contracts' &&
      this.router.url.includes('/contracts') &&
      !this.router.url.split('/')[2]?.startsWith(EWalletType.EVM)
    ) {
      menuClass = 'active';
    }

    if (this.activeMenuItem.menuLink === '/evm-contracts' && this.router.url.includes('/evm-contracts')) {
      menuClass = 'active';
    }

    if (this.activeMenuItem.menuLink === '/validators' && this.router.url.includes('/validators')) {
      menuClass = 'active';
    }

    if (this.activeMenuItem.menuLink === '/blocks' && this.router.url.includes('/block')) {
      menuClass = 'active';
    }

    if (this.activeMenuItem.menuDetailLink === 'voting' && this.router.url.includes('/votings/')) {
      menuClass = 'active';
    }

    if (this.activeMenuItem.menuDetailLink === 'token' && this.router.url === '/tokens') {
      menuClass = 'active';
    }

    if (
      this.activeMenuItem.menuDetailLink === 'token' &&
      this.router.url.includes('/token/') &&
      this.router.url.split('/').length === 3
    ) {
      menuClass = 'active';
    }

    if (this.activeMenuItem.menuDetailLink === 'nft' && this.router.url === '/tokens/tokens-nft') {
      menuClass = 'active';
    }

    if (
      this.activeMenuItem.menuDetailLink === 'nft' &&
      this.router.url.includes('/token/nft') &&
      this.router.url.split('/').length === 4
    ) {
      menuClass = 'active';
    }

    if (this.activeMenuItem.menuDetailLink === 'abt' && this.router.url === '/tokens/token-abt') {
      menuClass = 'active';
    }

    if (
      this.activeMenuItem.menuDetailLink === 'abt' &&
      this.router.url.includes('/token/abt') &&
      this.router.url.split('/').length === 4
    ) {
      menuClass = 'active';
    }

    if (
      this.activeMenuItem.menuLink === '/statistics/charts-stats' &&
      (this.router.url == '/statistics/charts-stats' || this.router.url.includes('/statistics/chart/'))
    ) {
      menuClass = 'active';
    }

    if (
      this.activeMenuItem.menuLink === '/statistics/top-statistic' &&
      this.router.url == '/statistics/top-statistic'
    ) {
      menuClass = 'active';
    }

    if (
      this.activeMenuItem.menuLink === '/code-ids' &&
      (this.router.url == '/code-ids' ||
        this.router.url.includes('/code-ids/detail/') ||
        this.router.url.includes('/code-ids/verify/'))
    ) {
      menuClass = 'active';
    }

    this.element.classList.add(menuClass);
  }
}
