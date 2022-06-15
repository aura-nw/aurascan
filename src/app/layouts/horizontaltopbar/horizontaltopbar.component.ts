import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { first } from 'rxjs/operators';
import { NETWORK, VALIDATOR_ADDRESS_PREFIX } from '../../../app/core/constants/common.constant';
import { CommonService } from '../../../app/core/services/common.service';
import { ResponseDto } from '../../core/models/common.model';
import { AuthenticationService } from '../../core/services/auth.service';
import { EventService } from '../../core/services/event.service';
import { LanguageService } from '../../core/services/language.service';
import { TransactionService } from '../../core/services/transaction.service';
import { WalletService } from '../../core/services/wallet.service';
import { LAYOUT_MODE } from '../layouts.model';
import { MENU } from './menu';
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
  listChannel;
  currentNetwork = JSON.parse(localStorage.getItem('currentNetwork')) || NETWORK[1];
  currentChanel = JSON.parse(localStorage.getItem('currentChanel')) || null;
  searchValue = null;

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

  constructor(
    public router: Router,
    public translate: TranslateService,
    public languageService: LanguageService,
    public _cookiesService: CookieService,
    private eventService: EventService,
    private authService: AuthenticationService,
    private commonService: CommonService,
    private walletService: WalletService,
    private transactionService: TransactionService,
  ) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.activateMenu();
      }
    });
    // if (this.currentChanel?.channel_genesis_hash) {
    //   this.authService.change({ channel_genesis_hash: this.currentChanel.channel_genesis_hash });
    // }

    this.walletService.wallet$.subscribe((wallet) => {
      if (wallet) {
        this.menuItems.forEach((item) => {
          if (item.id === 7) {
            // check if item is account
            item.link = `/account/${wallet.bech32Address}`;
          }
        });
      } else {
        this.menuItems.forEach((item) => {
          if (item.id === 7) {
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
    this.element = document.documentElement;
    this.layoutMode = LAYOUT_MODE;
    this.initialize();
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

  /**
   * Initialize
   */
  initialize(): void {
    // this.menuItems = MENU;
    // this.getList();
  }

  getList(): void {
    this.commonService.channels(1000, 0).subscribe((res) => {
      this.listChannel = res.data;
      if (!this.currentChanel) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
          this.currentChanel = this.listChannel.find(
            (i) => i.channel_genesis_hash === currentUser.data.channel_genesis_hash,
          );
        }
      }
    });
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

  /**
   * Logout the user
   */
  logout() {
    this.authService.logout();
  }

  onSelectNetwork(item) {
    this.currentNetwork = item;
    localStorage.setItem('currentNetwork', JSON.stringify(item));
    this.commonService.setNetwork = item.value;
    window.location.reload();
  }

  onSelectChanel(item) {
    this.currentChanel = item;
    localStorage.setItem('currentChanel', JSON.stringify(item));
    this.authService
      .change({ channel_genesis_hash: this.currentChanel.channel_genesis_hash })
      .pipe(first())
      .subscribe(
        (data) => {
          window.location.reload();
        },
        (error) => {},
      );
  }

  handleSearch() {
    const VALIDATORS = {
      HASHRULE: /^[A-Za-z0-9]/,
    };
    const regexRule = VALIDATORS.HASHRULE;
    this.searchValue = this.searchValue.trim();

    if (regexRule.test(this.searchValue)) {
      if (this.searchValue.length > 60) {
        if (this.searchValue.toLowerCase() === this.searchValue) {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['contracts', this.searchValue]);
          });
        } else {
          this.getTxhDetail(this.searchValue);
        }
      } else if (this.searchValue.length > 40) {
        let urlLink = this.searchValue.startsWith(VALIDATOR_ADDRESS_PREFIX) ? 'validators' : 'account';
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([urlLink, this.searchValue]);
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

  getTxhDetail(value): void {
    this.transactionService.txsDetail(decodeURI(value)).subscribe(
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
}
