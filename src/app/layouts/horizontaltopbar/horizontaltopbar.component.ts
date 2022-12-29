import { AfterViewInit, Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ContractService } from 'src/app/core/services/contract.service';
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
    private contractService: ContractService,
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
  }

  checkEnv() {
    this.env = this.environmentService.configValue.env;
    this.innerWidth = window.innerWidth;
    switch (this.env) {
      case 'serenity':
        this.pageTitle = this.innerWidth > 992 ? 'Serenity Testnet Network' : 'Serenity Testnet';
        break;
      case 'halo':
        this.pageTitle = this.innerWidth > 992 ? 'Halo Testnet Network' : 'Halo Testnet';
        break;
      case 'euphoria':
        this.pageTitle = this.innerWidth > 992 ? 'Euphoria Testnet Network' : 'Euphoria Testnet';
        break;
      default:
        this.pageTitle = this.innerWidth > 992 ? 'Develop Testnet Network' : 'Develop Testnet';
        break;
    }
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
      if (regexRule.test(this.searchValue)) {
        if (this.searchValue.length === LENGTH_CHARACTER.TRANSACTION) {
          if (this.searchValue.toLowerCase() === this.searchValue) {
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['contracts', this.searchValue]);
            });
          } else {
            this.getTxhDetail(this.searchValue);
          }
        } else if (this.searchValue.length >= LENGTH_CHARACTER.ADDRESS) {
          this.contractService.getContractDetail(this.searchValue).subscribe((res) => {
            if (res.data) {
              this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this.router.navigate(['contracts', this.searchValue]);
              });
            } else {
              let urlLink = this.searchValue.startsWith(this.prefixValAdd) ? 'validators' : 'account';
              this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this.router.navigate([urlLink, this.searchValue]);
              });
            }
          });
        } else {
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
        this.lengthSBT = res.meta;
      }
    });
  }
}
