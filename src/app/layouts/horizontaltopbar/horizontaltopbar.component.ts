import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Route, Router, UrlSegment } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { delay, filter, map, Subject, takeUntil, tap } from 'rxjs';
import { EWalletType } from 'src/app/core/constants/wallet.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import { UserService } from 'src/app/core/services/user.service';
import { transferAddress } from 'src/app/core/utils/common/address-converter';
import local from 'src/app/core/utils/storage/local';
import { LENGTH_CHARACTER, STORAGE_KEYS } from '../../../app/core/constants/common.constant';
import { TransactionService } from '../../core/services/transaction.service';
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
export class HorizontaltopbarComponent implements OnInit, OnDestroy {
  menuItems: MenuItem[] = MENU;

  searchValue = null;
  pageTitle = null;
  menuName = MenuName;
  menuLink = [];
  currentAddress = null;
  userEmail: string;

  prefixValAdd = this.environmentService.chainInfo.bech32Config.bech32PrefixValAddr;
  prefixNormalAdd = this.environmentService.chainInfo.bech32Config.bech32PrefixAccAddr;

  destroy$ = new Subject();

  constructor(
    public router: Router,
    public translate: TranslateService,
    private transactionService: TransactionService,
    private contractService: ContractService,
    private environmentService: EnvironmentService,
    private nameTagService: NameTagService,
    private userService: UserService,
    private aRoute: ActivatedRoute,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.getMenuLink();
    this.checkEnv();
    this.checkFeatures();

    this.userService.user$?.pipe(takeUntil(this.destroy$)).subscribe((currentUser) => {
      this.userEmail = currentUser ? currentUser.email : null;
    });
  }

  checkFeatures() {
    const features = this.environmentService.chainConfig.features;

    if (features.length > 0) {
      this.menuItems.forEach((item) => {
        if (item.subItems) {
          let isEnabledMenu = false;
          item.subItems.forEach((subItem) => {
            const featureName = subItem.featureName;
            const foundIndex = features.findIndex((item) => item === featureName);

            // If have featureName, check disable
            subItem.disabled = featureName ? foundIndex < 0 : false;
            isEnabledMenu = subItem.disabled ? true : isEnabledMenu;
          });
        } else {
          const featureName = item.featureName;
          const foundIndex = features.findIndex((item) => item === featureName);
          item.disabled = foundIndex < 0;
        }
      });
    }
  }

  checkEnv() {
    this.pageTitle = this.environmentService.isMobile
      ? this.environmentService.environment.label.mobile
      : this.environmentService.environment.label.desktop;
  }

  async handleSearch() {
    if (!this.searchValue) return;
    this.searchValue = this.searchValue.trim();
    let urlLink = '';
    const VALIDATORS = {
      HASHRULE: /^[A-Za-z0-9]/,
    };
    const regexRule = VALIDATORS.HASHRULE;
    if (!regexRule.test(this.searchValue)) return;
    const isNumber = /^\d+$/.test(this.searchValue);
    const addressNameTag = this.nameTagService.findAddressByNameTag(this.searchValue);
    // get address by nameTag
    if (addressNameTag?.length > 0) {
      this.searchValue = addressNameTag;
    }

    // check is EVM address
    if (this.searchValue.startsWith(EWalletType.EVM)) {
      if (this.searchValue.length === LENGTH_CHARACTER.EVM_TRANSACTION) {
        // case EVM transaction
        this.getEvmTxnDetail(this.searchValue);
      } else {
        // check if address EVM contract or account
        this.contractService.findEvmContract(this.searchValue).subscribe({
          next: (res) => {
            urlLink = res?.evm_smart_contract?.length > 0 ? 'evm-contracts' : 'address';
            this.redirectPage(urlLink);
          },
          error: (e) => {
            return;
          },
        });
      }
    } else {
      if (this.searchValue.length === LENGTH_CHARACTER.TRANSACTION) {
        // case cosmoms transaction
        this.getTxhDetail(this.searchValue);
      } else if (this.searchValue.length === LENGTH_CHARACTER.CONTRACT) {
        // case cosmos contract
        urlLink = 'contracts';
        this.redirectPage(urlLink);
      } else if (this.searchValue.length >= LENGTH_CHARACTER.ADDRESS) {
        // case cosmos address or validator address
        if (this.searchValue.length === LENGTH_CHARACTER.ADDRESS) {
          urlLink = 'address';
        } else if (this.searchValue.startsWith(this.prefixValAdd)) {
          urlLink = 'validators';
        } else {
          return;
        }
        this.redirectPage(urlLink);
      } else if (isNumber) {
        // case block
        urlLink = 'block';
        this.redirectPage(urlLink);
      }
    }
  }

  redirectPage(urlLink: string) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([urlLink, this.searchValue]).then((r) => {});
    });
  }

  getEvmTxnDetail(value): void {
    const payload = {
      limit: 1,
      hash: decodeURI(value),
    };
    this.transactionService.queryTransactionByEvmHash(payload).subscribe({
      next: (res) => {
        if (res?.transaction?.length > 0) {
          this.redirectPage('tx');
        } else {
          this.searchValue = '';
        }
      },
      error: (e) => {
        this.searchValue = '';
      },
    });
  }

  getTxhDetail(value): void {
    const payload = {
      limit: 1,
      hash: decodeURI(value),
    };
    this.transactionService.getListTx(payload).subscribe(
      (res) => {
        if (res?.transaction?.length > 0) {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['tx', this.searchValue]);
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

  removeConfigCSV(data) {
    if (data.link === '/export-csv') {
      local.removeItem(STORAGE_KEYS.SET_DATA_EXPORT);
    }
  }
}
