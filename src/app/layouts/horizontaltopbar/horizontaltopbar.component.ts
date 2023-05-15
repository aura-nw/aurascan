import { AfterViewInit, Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { LENGTH_CHARACTER, NETWORK } from '../../../app/core/constants/common.constant';
import { ResponseDto } from '../../core/models/common.model';
import { EventService } from '../../core/services/event.service';
import { LanguageService } from '../../core/services/language.service';
import { TransactionService } from '../../core/services/transaction.service';
import { WalletService } from '../../core/services/wallet.service';
import { LAYOUT_MODE } from '../layouts.model';
import { MENU, MenuName } from './menu';
import { MenuItem } from './menu.model';
import { from } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-horizontaltopbar',
  templateUrl: './horizontaltopbar.component.html',
  styleUrls: ['./horizontaltopbar.component.scss'],
})

/**
 * Horizontal-Topbar Component
 */
export class HorizontaltopbarComponent implements OnInit, AfterViewInit {
  mode: string | undefined;
  layoutMode!: string;
  menuItems: MenuItem[] = MENU;
  element: any;
  flagvalue: any;
  cookieValue: any;
  countryName: any;
  valueset: any;
  networks = NETWORK;
  currentNetwork = JSON.parse(localStorage.getItem('currentNetwork')) || NETWORK[1];
  currentChanel = JSON.parse(localStorage.getItem('currentChanel')) || null;
  searchValue = null;
  env = null;
  pageTitle = null;
  innerWidth;
  menuName = MenuName;
  menuLink = [];
  wallet = null;
  lengthSBT = 0;
  prefixValAdd = this.environmentService.configValue.chain_info.bech32Config.bech32PrefixValAddr;
  prefixNormalAdd = this.environmentService.configValue.chain_info.bech32Config.bech32PrefixAccAddr;
  currentAddress;
  isAllowInABTWhiteList = true;

  /**
   * Language Listing
   */
  listLang = [
    { text: 'English', flag: 'assets/images/flags/us.jpg', lang: 'en' },
    { text: 'Spanish', flag: 'assets/images/flags/spain.jpg', lang: 'es' },
    { text: 'German', flag: 'assets/images/flags/germany.jpg', lang: 'de' },
    { text: 'Italian', flag: 'assets/images/flags/italy.jpg', lang: 'it' },
    { text: 'Russian', flag: 'assets/images/flags/russia.jpg', lang: 'ru' },
  ];

  @Output() settingsButtonClicked = new EventEmitter();
  @Output() mobileMenuButtonClicked = new EventEmitter();

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.checkEnv();
  }

  constructor(
    public router: Router,
    public translate: TranslateService,
    public languageService: LanguageService,
    public _cookiesService: CookieService,
    private eventService: EventService,
    private walletService: WalletService,
    private transactionService: TransactionService,
    private environmentService: EnvironmentService,
    private soulboundService: SoulboundService,
  ) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.activateMenu();
      }
    });

    this.walletService.wallet$.subscribe((wallet) => {
      this.wallet = wallet;
      if (wallet) {
        this.getListSmartContract(wallet.bech32Address);
        this.menuItems.forEach((item) => {
          if (item.name === this.menuName.Account) {
            // check if item is account
            item.link = `/account/${wallet.bech32Address}`;
          }
        });
      } else {
        this.menuItems.forEach((item) => {
          if (item.name === this.menuName.Account) {
            item.link = null;
          }
        });
      }
    });
  }

  /***
   * Language Value Set
   */
  setLanguage(text: string, lang: string, flag: string) {
    this.countryName = text;
    this.flagvalue = flag;
    this.cookieValue = lang;
    this.languageService.setLanguage(lang);
  }

  ngOnInit(): void {
    this.getMenuLink();
    this.element = document.documentElement;
    this.layoutMode = LAYOUT_MODE;
    this.checkEnv();
    /***
     * Language value cookies wise set
     */
    this.cookieValue = this._cookiesService.get('lang');
    const val = this.listLang.filter((x) => x.lang === this.cookieValue);
    this.countryName = val.map((element) => element.text);
    if (val.length === 0) {
      if (this.flagvalue === undefined) {
        this.valueset = 'assets/images/flags/us.jpg';
      }
    } else {
      this.flagvalue = val.map((element) => element.flag);
    }

    // check account is in whitelist (Account Bound Token)
    from([1])
      .pipe(
        delay(800),
        mergeMap((_) => this.walletService.wallet$),
      )
      .subscribe((wallet) => {
        if (wallet) {
          this.currentAddress = this.walletService.wallet?.bech32Address;
          this.checkWL();
        } else {
          this.currentAddress = null;
          this.isAllowInABTWhiteList = false;
        }
      });
  }

  checkWL() {
    this.soulboundService.getListWL().subscribe((res) => {
      if (!res?.data?.find((k) => k.account_address === this.currentAddress)) {
        this.isAllowInABTWhiteList = false;
      }
    });
  }

  checkEnv() {
    this.innerWidth = window.innerWidth;
    this.pageTitle =
      this.innerWidth > 992
        ? this.environmentService.configValue.evnLabel.desktop
        : this.environmentService.configValue.evnLabel.mobile;
  }

  /**
   * Returns true or false if given menu item has child or not
   * @param item menuItem
   */
  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }

  /**
   * on settings button clicked from topbar
   */
  onSettingsButtonClicked() {
    document.body.classList.toggle('right-bar-enabled');
  }

  /**
   * On menu click
   */
  onMenuClick(event: any) {
    const nextEl = event.target.nextElementSibling;
    if (nextEl) {
      const parentEl = event.target.parentNode;
      if (parentEl) {
        parentEl.classList.remove('show');
      }
      nextEl.classList.toggle('show');
    }
    return false;
  }

  ngAfterViewInit() {
    this.activateMenu();
  }

  /**
   * remove active and mm-active class
   */
  _removeAllClass(className: any) {
    const els = document.getElementsByClassName(className);
    while (els[0]) {
      els[0].classList.remove(className);
    }
  }

  /**
   * Topbar Light-Dark Mode Change
   */
  changeMode(mode: string) {
    this.mode = mode;
    this.layoutMode = mode;
    this.eventService.broadcast('changeMode', mode);
  }

  /**
   * Toggle the menu bar when having mobile screen
   */
  toggleMobileMenu(event: any) {
    event.preventDefault();
    this.mobileMenuButtonClicked.emit();
  }

  /**
   * Toggles the right sidebar
   */
  toggleRightSidebar() {
    this.settingsButtonClicked.emit();
  }

  /**
   * Activates the menu
   */
  private activateMenu() {
    const resetParent = (el: any) => {
      const parent = el.parentElement;
      if (parent) {
        parent.classList.remove('active');
        const parent2 = parent.parentElement;
        this._removeAllClass('mm-active');
        this._removeAllClass('mm-show');
        if (parent2) {
          parent2.classList.remove('active');
          const parent3 = parent2.parentElement;
          if (parent3) {
            parent3.classList.remove('active');
            const parent4 = parent3.parentElement;
            if (parent4) {
              parent4.classList.remove('active');
              const parent5 = parent4.parentElement;
              if (parent5) {
                parent5.classList.remove('active');
                const menuelement = document.getElementById('topnav-menu-content');
                if (menuelement !== null)
                  if (menuelement.classList.contains('show'))
                    document.getElementById('topnav-menu-content')!.classList.remove('show');
              }
            }
          }
        }
      }
    };

    // activate menu item based on location
    const links: any = document.getElementsByClassName('side-nav-link-ref');
    let matchingMenuItem = null;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < links.length; i++) {
      // reset menu
      resetParent(links[i]);
    }
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < links.length; i++) {
      // tslint:disable-next-line: no-string-literal
      if (location.pathname === links[i]['pathname']) {
        matchingMenuItem = links[i];
        break;
      }
    }

    if (matchingMenuItem) {
      const parent = matchingMenuItem.parentElement;
      /**
       * TODO: This is hard coded way of expading/activating parent menu dropdown and working till level 3.
       * We should come up with non hard coded approach
       */
      if (parent) {
        parent.classList.add('active');
        const parent2 = parent.parentElement;
        if (parent2) {
          parent2.classList.add('active');
          const parent3 = parent2.parentElement;
          if (parent3) {
            parent3.classList.add('active');
            const parent4 = parent3.parentElement;
            if (parent4) {
              parent4.classList.add('active');
              const parent5 = parent4.parentElement;
              if (parent5) {
                parent5.classList.add('active');
              }
            }
          }
        }
      }
    }
  }

  async handleSearch() {
    const VALIDATORS = {
      HASHRULE: /^[A-Za-z0-9]/,
    };
    const regexRule = VALIDATORS.HASHRULE;
    if (this.searchValue) {
      this.searchValue = this.searchValue.trim();
      let isNumber = /^\d+$/.test(this.searchValue);
      if (regexRule.test(this.searchValue)) {
        //check is start with 'aura' and length >= normal address
        if (this.searchValue.startsWith(this.prefixNormalAdd) && this.searchValue.length >= LENGTH_CHARACTER.ADDRESS) {
          if (this.searchValue.length === LENGTH_CHARACTER.CONTRACT) {
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['contracts', this.searchValue]);
            });
          } else {
            let urlLink = this.searchValue.startsWith(this.prefixValAdd) ? 'validators' : 'account';
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate([urlLink, this.searchValue]);
            });
          }
        } else if (this.searchValue.length === LENGTH_CHARACTER.TRANSACTION) {
          this.getTxhDetail(this.searchValue);
        } else if (isNumber) {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['blocks', this.searchValue]);
          });
        }
      } else {
        this.searchValue = '';
      }
    }
  }

  getTxhDetail(value): void {
    this.transactionService.txsIndexer(1, 0, decodeURI(value)).subscribe(
      (res: ResponseDto) => {
        if (res.data) {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['transaction', this.searchValue]);
          });
        } else {
          this.searchValue = '';
        }
      },
      (error) => {
        this.searchValue = '';
      },
    );
  }

  getMenuLink() {
    for (let menu of this.menuItems) {
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
  }

  getListSmartContract(currentAddress) {
    const payload = {
      limit: 10,
      offset: 0,
      minterAddress: currentAddress,
    };

    this.lengthSBT = 0;
    this.soulboundService.getListSoulbound(payload).subscribe((res) => {
      if (res.data.length > 0) {
        this.lengthSBT = res.meta.count;
      }
    });
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
      menuLink === '/code-ids/list' &&
      (this.router.url == '/code-ids/list' ||
        this.router.url.includes('/code-ids/detail/') ||
        this.router.url.includes('/code-ids/verify/'))
    ) {
      return true;
    }

    return false;
  }
}
