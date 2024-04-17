import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {EWalletType} from 'src/app/core/constants/wallet.constant';
import {EnvironmentService} from 'src/app/core/data-services/environment.service';
import {NameTagService} from 'src/app/core/services/name-tag.service';
import {NgxToastrService} from 'src/app/core/services/ngx-toastr.service';
import {WatchListService} from 'src/app/core/services/watch-list.service';
import {transferAddress} from 'src/app/core/utils/common/address-converter';
import {isSafari} from 'src/app/core/utils/common/validation';
import {LENGTH_CHARACTER} from 'src/app/core/constants/common.constant';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-popup-watchlist',
  templateUrl: './popup-watchlist.component.html',
  styleUrls: ['./popup-watchlist.component.scss'],
})
export class PopupWatchlistComponent implements OnInit {
  watchlistForm;
  isSubmit = false;
  formValid = true;
  isAccount;
  isContract = false;
  maxLengthNote = 200;
  publicNameTag = '-';
  privateNameTag = '-';
  isError = false;
  isEditMode = false;
  reStakeSent = true;
  reStakeReceiver = true;
  lstTrackingName = {
    transactionExecuted: 'transactionExecuted',
    tokenSent: 'tokenSent',
    tokenReceived: 'tokenReceived',
    nftSent: 'nftSent',
    nftReceived: 'nftReceived',
    nativeCoinSent: 'nativeCoinSent',
    nativeCoinReceived: 'nativeCoinReceived',
  };
  isTracking = true;
  eWalletType = EWalletType;

  listTracking = [
    {
      key: this.lstTrackingName.transactionExecuted,
      value: 'Transaction Executed',
    },
    {
      key: this.lstTrackingName.tokenSent,
      value: 'Token Sent',
    },
    {
      key: this.lstTrackingName.tokenReceived,
      value: 'Token Received',
    },
    {
      key: this.lstTrackingName.nftSent,
      value: 'NFT Sent',
    },
    {
      key: this.lstTrackingName.nftReceived,
      value: 'NFT Received',
    },
    {
      key: this.lstTrackingName.nativeCoinSent,
      value: 'Native Coin Sent (Aura coin, ibc)',
    },
    {
      key: this.lstTrackingName.nativeCoinReceived,
      value: ' Native Coin Received (Aura coin, ibc)',
    },
  ];
  isSafari = false;

  settingObj = {
    transactionExecuted: false,
    tokenSent: false,
    tokenReceived: false,
    nftSent: false,
    nftReceived: false,
    nativeCoinSent: false,
    nativeCoinReceived: false,
  };

  quota = this.environmentService.chainConfig.quotaSetWatchList;
  chainName = this.environmentService.chainName?.toLowerCase();
  chainInfo = this.environmentService.chainInfo;
  prefix = this.environmentService.chainInfo.bech32Config.bech32PrefixAccAddr?.toLowerCase();
  prefixAccAddr = this.environmentService.chainInfo.bech32Config.bech32PrefixAccAddr;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PopupWatchlistComponent>,
    private fb: FormBuilder,
    public translate: TranslateService,
    private environmentService: EnvironmentService,
    private toastr: NgxToastrService,
    private watchListService: WatchListService,
    private nameTagService: NameTagService,
  ) {
  }

  ngOnInit(): void {
    this.isSafari = isSafari();
    this.formInit();
    if (this.data?.address) {
      if (this.data.id) {
        this.getDetailWatchList(this.data.id);
      } else {
        this.setDataFrom(this.data);
      }
    }

    if (!this.isEditMode) {
      this.isTracking = true;
      this.formValid = false;
    }

    // override cdk-overlay-container z-index
    const overlay = document.getElementsByClassName('cdk-overlay-container');
    if (overlay) {
      overlay[0].classList.add('__grant');
    }
  }

  get getAddress() {
    return this.watchlistForm.get('address');
  }

  get getFavorite() {
    return this.watchlistForm.get('favorite');
  }

  get getTracking() {
    return this.watchlistForm.get('tracking');
  }

  formInit() {
    this.watchlistForm = this.fb.group({
      favorite: false,
      tracking: true,
      isAccount: [null, [Validators.required]],
      address: [''],
      evmAddress: ['', [Validators.required]],
      note: ['', [Validators.maxLength(200)]],
      id: '',
    });
  }

  setDataFrom(data, isEditMode = false) {
    this.isEditMode = isEditMode;
    const isAccount = data.type !== 'contract';

    this.watchlistForm.controls['isAccount'].setValue(isAccount);
    this.isAccount = isAccount;
    this.isContract = this.isAccount !== undefined ? !this.isAccount : undefined;
    this.watchlistForm.controls['favorite'].setValue(data.favorite);
    this.isTracking = isEditMode ? data.tracking : true;
    this.watchlistForm.controls['tracking'].setValue(isEditMode ? data.tracking : true);
    this.watchlistForm.controls['note'].setValue(data.note);
    this.watchlistForm.controls['id'].setValue(data.id || '');
    this.handleSetAddress(data['address']);

    //set data group tracking
    if (data.settings) {
      this.reStakeSent = data.settings.nativeCoinSent.inactiveAutoRestake;
      this.reStakeReceiver = data.settings.nativeCoinReceived.inactiveAutoRestake;

      this.settingObj = data.settings;
      this.settingObj.nativeCoinSent = data.settings.nativeCoinSent.turnOn;
      this.settingObj.nativeCoinReceived = data.settings.nativeCoinReceived.turnOn;
    }

    this.checkNameTag();
  }

  handleSetAddress(address, controlName?: string) {
    let {accountAddress, accountEvmAddress} = transferAddress(
      this.chainInfo.bech32Config.bech32PrefixAccAddr,
      address,
    );
    // inValid address
    if (accountAddress.length > 0 && !accountEvmAddress) {
      // check if address is contract and start with bench32Add -> true/ else false
      if (address.length === LENGTH_CHARACTER.CONTRACT && address.startsWith(this.prefixAccAddr)) {
        accountEvmAddress = null;
      } else {
        if (controlName === 'address') {
          // this.toastr.error('Invalid ' + this.chainName + ' address format');
          this.watchlistForm.get('evmAddress').disable();
          // this.watchlistForm.get('address').setErrors({ incorrect: true });
        }
        if (controlName === 'evmAddress') {
          // this.toastr.error('Invalid EVM address format');
          this.watchlistForm.get('address').disable();
          // this.watchlistForm.get('evmAddress').setErrors({ incorrect: true });
        }
        return;
      }
    }
    // valid address
    this.watchlistForm.controls['address'].setValue(accountAddress);
    if (accountEvmAddress) {
      this.watchlistForm.controls['evmAddress'].setValue(accountEvmAddress);
    } else {
      this.watchlistForm.controls['evmAddress'].setValue('');
    }
    this.watchlistForm.get('address').disable();
    this.watchlistForm.get('evmAddress').disable();
    if (address == accountEvmAddress?.trim()) {
      this.watchlistForm.get('evmAddress').enable();
    } else {
      this.watchlistForm.get('address').enable();
    }
  }

  changeTracking() {
    this.isTracking = !this.isTracking;
    this.checkFormValid();
  }

  closeDialog(status = null) {
    this.dialogRef.close(status);
  }

  checkFormValid(): boolean {
    this.formValid = false;
    this.getAddress.value = this.getAddress?.value.trim();

    if (!this.getAddress.value) {
      return false;
    }

    if (this.watchlistForm.value.isAccount == undefined) {
      return false;
    }

    //check setting noti
    try {
      if (!JSON.stringify(this.settingObj)?.includes('true') && this.isTracking) {
        return false;
      }
    } catch {
    }

    this.formValid = true;
    return true;
  }

  onSubmit() {
    this.isSubmit = true;
    const {favorite, address, evmAddress, note, id} = this.watchlistForm.getRawValue();

    let payload = {
      address: address?.toLowerCase(),
      evmAddress: evmAddress?.toLowerCase(),
      type: this.isAccount ? 'account' : 'contract',
      favorite: favorite,
      tracking: this.isTracking,
      note: note,
      id: id,
      settings: {
        transactionExecuted: this.settingObj.transactionExecuted,
        tokenSent: this.settingObj.tokenSent,
        tokenReceived: this.settingObj.tokenReceived,
        nftSent: this.settingObj.nftSent,
        nftReceived: this.settingObj.nftReceived,
        nativeCoinSent: {
          turnOn: this.settingObj.nativeCoinSent,
          inactiveAutoRestake: this.reStakeSent,
        },
        nativeCoinReceived: {
          turnOn: this.settingObj.nativeCoinReceived,
          inactiveAutoRestake: this.reStakeReceiver,
        },
      },
    };

    if (this.isEditMode) {
      this.editAddressInWatchlist(payload);
    } else {
      this.addAddressToWatchlist(payload);
    }
  }

  addAddressToWatchlist(payload) {
    if (this.data.currentLength >= this.quota) {
      this.isError = true;
      this.toastr.error('You have reached out of ' + this.quota + ' max limitation of address');
      return;
    }
    this.watchListService.createWatchList(payload).subscribe({
      next: (res) => {
        if (res.code && res.code !== 200) {
          this.isError = true;
          this.toastr.error(res.message || 'Error');
          return;
        }
        this.closeDialog(true);
        this.toastr.successWithTitle('Address added to watchlist!', 'Success');
      },
      error: (error) => {
        this.isError = true;
        this.toastr.error(error?.error?.error.message || 'Error');
      },
    });
  }

  editAddressInWatchlist(payload) {
    this.watchListService.updateWatchList(payload).subscribe({
      next: (res) => {
        if (res?.code && res?.code !== 200) {
          this.isError = true;
          this.toastr.error(res.message || 'Error');
          return;
        }
        this.closeDialog(true);
        this.toastr.successWithTitle('Address edited in watchlist!', 'Success');
      },
      error: (error) => {
        this.isError = true;
        this.toastr.error(error?.error?.error.message || 'Error');
      },
    });
  }

  changeFavorite() {
    this.watchlistForm.value.favorite = !this.watchlistForm.value.favorite;
    this.checkFormValid();
  }

  changeType(type) {
    this.isAccount = type;
    this.isContract = !this.isAccount;
    this.isError = false;
    this.watchlistForm.value.isAccount = this.isAccount;
    this.checkFormValid();
  }

  checkNameTag() {
    this.getAddress.value = this.getAddress.value.trim();
    this.publicNameTag = '-';
    this.privateNameTag = '-';
    const nameTag = this.nameTagService.findNameTag(this.getAddress.value);
    if (nameTag) {
      this.publicNameTag = nameTag['name_tag'] || '-';
      this.privateNameTag = nameTag['name_tag_private'] || '-';
    }
  }

  getDetailWatchList(id = null) {
    this.watchListService.getDetailWatchList(id).subscribe((res) => {
      this.setDataFrom(res, true);
    });
  }

  onChangeTnxFilterType(event, type: any) {
    if (type === 'nativeCoinSent' && event.target.checked) {
      this.reStakeSent = true;
    } else if (type === 'nativeCoinReceived' && event.target.checked) {
      this.reStakeReceiver = true;
    }
    this.settingObj[type] = event.target.checked;

    this.checkFormValid();
  }

  changeAddress(controlName: string) {
    const address = this.watchlistForm.get(controlName).value;
    if (address.length === 0) {
      this.resetAddress();
    } else {
      this.handleSetAddress(address, controlName);
      this.checkNameTag();
      this.watchlistForm.value.isAccount = this.isAccount;
    }
    this.checkFormValid();
  }

  resetAddress() {
    this.watchlistForm.get('address').setValue('');
    this.watchlistForm.get('evmAddress').setValue('');
    this.watchlistForm.get('evmAddress').enable();
    this.watchlistForm.get('address').enable();
    this.publicNameTag = '-';
    this.privateNameTag = '-';
    this.checkFormValid();
  }
}
