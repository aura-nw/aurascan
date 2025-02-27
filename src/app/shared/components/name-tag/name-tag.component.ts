import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/core/services/common.service';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import { MAX_LENGTH_NAME_TAG, NULL_ADDRESS, STORAGE_KEYS } from 'src/app/core/constants/common.constant';
import { ENameTag, EScreen } from 'src/app/core/constants/account.enum';
import { UserService } from 'src/app/core/services/user.service';
import local from 'src/app/core/utils/storage/local';
import { Params, Router } from '@angular/router';
import { ContractService } from 'src/app/core/services/contract.service';
import { transferAddress } from 'src/app/core/utils/common/address-converter';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';

@Component({
  selector: 'app-name-tag',
  templateUrl: './name-tag.component.html',
  styleUrls: ['./name-tag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NameTagComponent implements OnInit {
  nullAddress = NULL_ADDRESS;
  @Input() value = '';
  @Input() addressOnly = '';
  @Input() linkRouter: string | any[];
  @Input() linkParams: Params;
  @Input() isEnableRouter = true;
  @Input() fullText = false;
  @Input() fullTextMob = false;
  @Input() param = '';
  @Input() iconContract = false;
  @Input() isVerified = false;
  @Input() widthAuto = false;
  @Input() maxCharacter = 12;
  @Input() isShorterText = false;
  @Input() mode = ENameTag.Normal;
  @Input() screen = EScreen.Account;
  @Input() tooltipPosition: 'tooltip--left' | 'tooltip--right' | 'tooltip--below' | null = null;
  @Input() nameTagDark = false;
  @Input() showCopyBtn = true;

  ENameTag = ENameTag;
  EScreen = EScreen;
  maxLengthNameTag = MAX_LENGTH_NAME_TAG;
  isContractAddress = false;

  chainInfo = this.env.chainInfo;

  get routerLinks() {
    return this.linkRouter ? this.linkRouter : ['/address', this.addressOnly || this.value];
  }

  constructor(
    public commonService: CommonService,
    public nameTagService: NameTagService,
    private userService: UserService,
    private router: Router,
    private contractService: ContractService,
    private env: EnvironmentService,
  ) {}

  ngOnInit(): void {
    if (this.isShorterText) {
      this.maxCharacter = 6;
    }

    if (this.mode === ENameTag.Private) {
      this.checkIsContract();
    }
  }

  extendLink(url) {
    url = url.match(/^https?:/) ? url : '//' + url;
    return url;
  }

  displayContent(value) {
    let result = value;
    if (this.nameTagService.isPublic(value)) {
      result += '<br>' + 'Public name: ' + this.nameTagService.findNameTagByAddress(value, false);
    }
    if (this.nameTagService.isPrivate(value)) {
      result += '<br>' + 'Private name: ' + this.nameTagService.findNameTagByAddress(value);
    }
    return result;
  }

  checkIsContract() {
    const { accountAddress, accountEvmAddress } = transferAddress(
      this.chainInfo.bech32Config.bech32PrefixAccAddr,
      this.value,
    );

    if (this.commonService.isValidContract(accountAddress)) {
      this.isContractAddress = true;
    } else {
      this.checkEvmContract(accountEvmAddress);
    }
  }

  checkEvmContract(evmAddress) {
    this.contractService.findEvmContract(evmAddress).subscribe({
      next: (res) => {
        if (res?.evm_smart_contract?.length > 0) {
          this.isContractAddress = true;
        }
      },
    });
  }

  editPrivateName() {
    const userEmail = this.userService.getCurrentUser()?.email;
    let dataNameTag = this.nameTagService.findNameTag(this.value);
    if (userEmail) {
      const type = this.isContractAddress ? 'contract' : 'account';
      if (dataNameTag) {
        dataNameTag['type'] = type;
        local.setItem(STORAGE_KEYS.SET_ADDRESS_NAME_TAG, dataNameTag);
      } else {
        local.setItem(STORAGE_KEYS.SET_ADDRESS_NAME_TAG, {
          address: this.value,
          type,
        });
      }
      this.router.navigate(['/profile'], { queryParams: { tab: 'private' } });
    } else {
      this.router.navigate(['/login']);
    }
  }
}
