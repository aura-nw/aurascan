import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
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
  destroy$ = new Subject();

  prefixValAdd = this.environmentService.chainInfo.bech32Config.bech32PrefixValAddr;
  prefixNormalAdd = this.environmentService.chainInfo.bech32Config.bech32PrefixAccAddr;

  constructor(
    public router: Router,
    public translate: TranslateService,
    private transactionService: TransactionService,
    private contractService: ContractService,
    private environmentService: EnvironmentService,
    private nameTagService: NameTagService,
    private userService: UserService,
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

  handleSearch() {
    this.searchValue = this.searchValue?.trim();
    if (!this.searchValue) return;

    const VALIDATORS = {
      HASHRULE: /^[A-Za-z0-9]/,
    };

    if (!VALIDATORS.HASHRULE.test(this.searchValue)) return;

    let addressNameTag = this.nameTagService.findAddressByNameTag(this.searchValue);

    if (!addressNameTag && this.contractService.isValidAddress(this.searchValue)) {
      if (this.searchValue.startsWith(this.prefixValAdd)) {
        return this.redirectPage('validators', this.searchValue);
      } else if (this.searchValue?.length === LENGTH_CHARACTER.CONTRACT) {
        // case cosmos contract
        return this.redirectPage('contracts', this.searchValue);
      } else {
        addressNameTag = this.searchValue;
      }
    }

    if (!addressNameTag && this.contractService.isValidContract(this.searchValue)) {
      addressNameTag = this.searchValue;
    }

    if (
      !addressNameTag &&
      this.searchValue.startsWith(EWalletType.EVM) &&
      this.searchValue.length === LENGTH_CHARACTER.EVM_ADDRESS
    ) {
      addressNameTag = this.searchValue;
    }

    if (addressNameTag) {
      return this.searchAddressByNameTag(addressNameTag);
    } else {
      if (
        this.searchValue.startsWith(EWalletType.EVM) &&
        this.searchValue.length === LENGTH_CHARACTER.EVM_TRANSACTION
      ) {
        return this.getEvmTxnDetail(this.searchValue);
      } else if (this.searchValue.length === LENGTH_CHARACTER.TRANSACTION) {
        return this.getTxhDetail(this.searchValue);
      } else if (this.isBlock(this.searchValue)) {
        return this.redirectPage('block', this.searchValue);
      }
    }
  }

  searchAddressByNameTag(nametag) {
    // get address by nameTag
    const address = transferAddress(this.prefixNormalAdd, nametag);
    return this.contractService.searchAddress(address).subscribe({
      next: (res) => {
        if (res?.account?.length > 0 || res.validator?.length > 0) {
          this.redirectPage('address', address.accountEvmAddress);
        } else if (res.evm_smart_contract?.length > 0) {
          this.redirectPage('evm-contracts', address.accountEvmAddress);
        }
      },
      error: (e) => {
        this.searchValue = '';
      },
    });
  }

  isBlock(value) {
    return /^\d+$/.test(value);
  }

  redirectPage(urlLink: string, value: string | number) {
    this.router.navigate([urlLink, value]);

    this.searchValue = '';
  }

  getEvmTxnDetail(value): void {
    const payload = {
      limit: 1,
      hash: decodeURI(value),
    };
    this.transactionService.queryTransactionByEvmHash(payload).subscribe({
      next: (res) => {
        if (res?.transaction?.length > 0) {
          this.redirectPage('tx', value);
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
          this.redirectPage('tx', value);
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
