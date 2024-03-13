import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import {from} from 'rxjs';
import {delay, mergeMap} from 'rxjs/operators';
import {EnvironmentService} from 'src/app/core/data-services/environment.service';
import {NotificationsService} from 'src/app/core/services/notifications.service';
import {WalletService} from 'src/app/core/services/wallet.service';
import {MENU_MOB, MenuName} from 'src/app/layouts/horizontaltopbar/menu';
import {MenuItem} from 'src/app/layouts/horizontaltopbar/menu.model';

@Component({
  selector: 'app-menu-bottom-bar',
  templateUrl: './menu-bottom-bar.component.html',
  styleUrls: ['./menu-bottom-bar.component.scss'],
})
export class MenuBottomBarComponent implements OnInit {
  menu: MenuItem[] = MENU_MOB;
  menuName = MenuName;
  menuLink = [];
  overlayPanel = false;
  currentAddress;
  hiddenFooter = false;
  @ViewChild('popover') public popover: NgbPopover;

  constructor(
    public router: Router,
    private walletService: WalletService,
    private notificationsService: NotificationsService,
    private environmentService: EnvironmentService,
  ) {
  }

  ngOnInit(): void {
    this.notificationsService.hiddenFooterSubject.subscribe((res) => {
      this.hiddenFooter = res;
    });

    this.checkFeatures();

    for (let menu of this.menu) {
      if (!menu.subItems) {
        this.menuLink.push(menu.link);
      } else {
        let arr = '';
        for (let subMenu of menu.subItems) {
          arr += subMenu.link;
        }
        this.menuLink.push(arr);
      }
    }
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };

    // check account is in whitelist (Account Bound Token)
    from([1])
      .pipe(
        delay(800),
        mergeMap((_) => this.walletService.walletAccount$),
      )
      .subscribe((wallet) => {
        if (wallet) {
          this.currentAddress = wallet.address;
        } else {
          this.currentAddress = null;
        }
      });
  }

  @HostListener('body:click', ['$event'])
  mouseleave(event) {
    const ids = [
      'blockChainBtn',
      'tokenBtn',
      'resourceBtn',
      'moreBtn',
      'blockChainIcon',
      'blockChainText',
      'resourceIcon',
      'resourceText',
      'tokenIcon',
      'tokenText',
      'moreIcon',
      'moreText',
    ];
    const id = event.target?.id;
    if (this.popover.isOpen()) {
      if (ids.indexOf(id) < 0) {
        const overlay = document.getElementById('popover-overlay');
        if (overlay) {
          overlay.click();
        }
      }
    }
  }

  checkFeatures() {
    const features = this.environmentService.chainConfig.features;

    if (features.length > 0) {
      this.menu.forEach((item) => {
        if (item.subItems) {
          let isEnabledMenu = false;
          item.subItems.forEach((subItem) => {
            const featureName = subItem.featureName;

            const foundIndex = features.findIndex((item) => item === featureName);

            // If have featureName, check disable
            subItem.disabled = featureName ? (foundIndex < 0 ? true : false) : false;

            isEnabledMenu = subItem.disabled ? true : isEnabledMenu;
          });
        } else {
          const featureName = item.featureName;
          const foundIndex = features.findIndex((item) => item === featureName);
          item.disabled = foundIndex < 0 ? true : false;
        }
      });
    }
  }

  overLayClickEvent() {
    this.overlayPanel = false;
  }

  checkMenuActive(menuLink: string) {
    if ((this.router.url === '/' || this.router.url === '/dashboard') && menuLink === '/dashboard') {
      return true;
    }

    if (!menuLink.includes('/tokens')) {
      if (menuLink === '/' + this.router.url.split('/')[1] && this.router.url.includes(menuLink)) {
        return true;
      }
    }

    if (menuLink === '/tokens' && (this.router.url == '/tokens' || this.router.url.includes('/tokens/token/'))) {
      return true;
    }

    if (
      menuLink === '/tokens/tokens-nft' &&
      (this.router.url == '/tokens/tokens-nft' || this.router.url.includes('/tokens/token-nft'))
    ) {
      return true;
    }

    if (
      menuLink === '/tokens/token-abt' &&
      (this.router.url == '/tokens/token-abt' || this.router.url.includes('/tokens/token-abt'))
    ) {
      return true;
    }

    if (menuLink === '/transactions' && this.router.url.includes('/transaction') && !this.router.url.split('/')[2]?.startsWith('0x')) {
      return true;
    }

    if (menuLink === '/evm-transactions' && this.router.url.includes('/transaction') && this.router.url.split('/')[2]?.startsWith('0x')) {
      return true;
    }

    if (
      menuLink === '/statistics/charts-stats' &&
      (this.router.url == '/statistics/charts-stats' || this.router.url.includes('/statistics/chart/'))
    ) {
      return true;
    }

    if (menuLink === '/statistics/top-statistic' && this.router.url == '/statistics/top-statistic') {
      return true;
    }

    if (
      menuLink === '/code-ids' &&
      (this.router.url == '/code-ids' ||
        this.router.url.includes('/code-ids/detail/') ||
        this.router.url.includes('/code-ids/verify/'))
    ) {
      return true;
    }
    return false;
  }
}
