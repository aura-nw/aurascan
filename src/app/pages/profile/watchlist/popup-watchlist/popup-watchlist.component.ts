import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { LENGTH_CHARACTER } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { WatchListService } from 'src/app/core/services/watch-list.service';
import { isAddress, isContract } from 'src/app/core/utils/common/validation';

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
  isValidAddress = true;
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
  isTracking = false;

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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PopupWatchlistComponent>,
    private fb: FormBuilder,
    public environmentService: EnvironmentService,
    public translate: TranslateService,
    private commonService: CommonService,
    private toastr: NgxToastrService,
    private watchListService: WatchListService,
  ) {}

  ngOnInit(): void {
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
      address: ['', [Validators.required]],
      note: ['', [Validators.maxLength(200)]],
      id: '',
    });
  }

  setDataFrom(data, isEditMode = false) {
    this.isValidAddress = true;
    this.isEditMode = isEditMode;
    const isAccount = data.address?.length === LENGTH_CHARACTER.ADDRESS;

    this.watchlistForm.controls['isAccount'].setValue(isAccount);
    this.isAccount = isAccount;
    this.isContract = this.isAccount !== undefined ? !this.isAccount : undefined;
    this.watchlistForm.controls['favorite'].setValue(data.favorite);
    this.isTracking = data.tracking;
    this.watchlistForm.controls['tracking'].setValue(data.tracking);
    this.watchlistForm.controls['address'].setValue(data.address);
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

    if (this.getAddress.value?.length > 0 && this.getAddress?.value?.startsWith('aura')) {
      this.isValidAddress =
        (isAddress(this.getAddress.value) && this.isAccount) || (isContract(this.getAddress.value) && !this.isAccount);
    }

    if (!this.isValidAddress) {
      return false;
    }

    //check setting noti
    try {
      if (!JSON.stringify(this.settingObj)?.includes('true') && this.isTracking) {
        return false;
      }
    } catch {}

    this.formValid = true;
    return true;
  }

  onSubmit() {
    this.isSubmit = true;
    const { favorite, address, note, id } = this.watchlistForm.value;

    let payload = {
      address: address,
      type: isAddress(address) ? 'account' : 'contract',
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
    this.isValidAddress = false;
    this.isError = false;
    this.watchlistForm.value.isAccount = type;
    this.checkFormValid();
  }

  checkNameTag() {
    this.publicNameTag = '-';
    this.privateNameTag = '-';
    this.getAddress.value = this.getAddress.value.trim();
    if (this.getAddress.status === 'VALID') {
      const tempPublic = this.commonService.setNameTag(this.getAddress.value, null, false);
      const tempPrivate = this.commonService.setNameTag(this.getAddress.value);
      if (tempPublic !== this.getAddress.value) {
        this.publicNameTag = tempPublic;
      }
      if (this.commonService.checkPrivate(this.getAddress.value) && tempPrivate !== this.getAddress.value) {
        this.privateNameTag = tempPrivate;
      }
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
}
