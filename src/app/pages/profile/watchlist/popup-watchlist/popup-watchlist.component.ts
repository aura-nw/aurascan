import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';
import {TranslateService} from '@ngx-translate/core';
import {LENGTH_CHARACTER} from 'src/app/core/constants/common.constant';
import {EnvironmentService} from 'src/app/core/data-services/environment.service';
import {CommonService} from 'src/app/core/services/common.service';
import {NameTagService} from 'src/app/core/services/name-tag.service';
import {NgxToastrService} from 'src/app/core/services/ngx-toastr.service';
import {WatchListService} from 'src/app/core/services/watch-list.service';
import {isSafari} from 'src/app/core/utils/common/validation';
import {EWalletType} from 'src/app/core/constants/wallet.constant';
import {transferAddress} from 'src/app/core/utils/common/address-converter';

@Component({
  selector: 'app-popup-watchlist',
  templateUrl: './popup-watchlist.component.html',
  styleUrls: ['./popup-watchlist.component.scss'],
})
export class PopupWatchlistComponent implements OnInit {
  watchlistForm;
  isSubmit = false;
  formValid = true;
  isAccount = false;
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
  chainName = this.environmentService.chainName.toLowerCase();
  chainInfo = this.environmentService.chainInfo;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PopupWatchlistComponent>,
    private fb: FormBuilder,
    public translate: TranslateService,
    private environmentService: EnvironmentService,
    private commonService: CommonService,
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
      isAccount: [false, [Validators.required]],
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
    this.watchlistForm.controls['address'].setValue(data.address);
    this.watchlistForm.controls['evmAddress'].setValue(data.evmAddress);
    this.watchlistForm.controls['note'].setValue(data.note);
    this.watchlistForm.controls['id'].setValue(data.id || '');

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
      address,
      evmAddress,
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
    this.watchlistForm.value.isAccount = type;
    this.checkFormValid();
  }

  checkNameTag() {
    this.publicNameTag = '-';
    this.privateNameTag = '-';
    this.getAddress.value = this.getAddress.value.trim();
    const tempPublic = this.nameTagService.findNameTagByAddress(this.getAddress.value, false);
    const tempPrivate = this.nameTagService.findNameTagByAddress(this.getAddress.value);
    if (tempPublic !== this.getAddress.value) {
      this.publicNameTag = tempPublic;
    }
    if (this.nameTagService.isPrivate(this.getAddress.value) && tempPrivate !== this.getAddress.value) {
      this.privateNameTag = tempPrivate;
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
    if (address.length === 0) return;
    if (controlName === 'address' && address.length > 0) {
      this.watchlistForm.get('evmAddress').disable();
    } else {
      this.watchlistForm.get('address').disable();
    }
    if (!this.commonService.isValidContract(address)) {
      const {accountAddress, accountEvmAddress} = transferAddress(
        this.chainInfo.bech32Config.bech32PrefixAccAddr,
        address,
      );
      this.watchlistForm.get('address').setValue(accountAddress);
      this.watchlistForm.get('evmAddress').setValue(accountEvmAddress);

      if (address.trim() == accountEvmAddress.trim()) {
        this.watchlistForm.get('evmAddress').enable();
      }
    }
    this.checkNameTag();
  }

  resetAddress() {
    this.watchlistForm.get('address').setValue('');
    this.watchlistForm.get('evmAddress').setValue('');
    this.watchlistForm.get('evmAddress').enable();
    this.watchlistForm.get('address').enable();
  }
}
