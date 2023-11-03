import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
  reStakeSent = false;
  reStakeReceiver = false;
  lstTrackingName = {
    transactionExecuted: 'transactionExecuted',
    tokenSent: 'tokenSent',
    tokenReceived: 'tokenReceived',
    nftSent: 'nftSent',
    nftReceived: 'nftReceived',
    nativeCoinSent: 'nativeCoinSentBoolean',
    nativeCoinReceived: 'nativeCoinReceivedBoolean',
  };

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
  countCheck = 0;

  quota = this.environmentService.chainConfig.quotaSetPrivateName;

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
    console.log('data ne', this.data);

    if (this.data?.address) {
      // if (this.data.isEditMode) {
      this.setDataFrom(this.data);
      // }
    }

    // override cdk-overlay-container z-index
    const overlay = document.getElementsByClassName('cdk-overlay-container');
    if (overlay) {
      overlay[0].classList.add('__grant');
    }
  }

  updateFunc(e) {
    const someCondition = true;
    if (someCondition) {
    }
  }

  get getAddress() {
    return this.watchlistForm.get('address');
  }

  get getFavorite() {
    return this.watchlistForm.get('isFavorite');
  }

  get getNotiMode() {
    return this.watchlistForm.get('isNotiMode');
  }

  formInit() {
    this.watchlistForm = this.fb.group({
      favorite: false,
      tracking: true,
      settings: new FormGroup({
        transactionExecuted: new FormControl(false),
        tokenSent: new FormControl(false),
        tokenReceived: new FormControl(false),
        nftSent: new FormControl(false),
        nftReceived: new FormControl(false),
        nativeCoinSentBoolean: new FormControl(false),
        nativeCoinReceivedBoolean: new FormControl(false),
        nativeCoinSent: new FormGroup({
          turnOn: new FormControl(false),
          inactiveAutoRestake: new FormControl(false),
        }),
        nativeCoinReceived: new FormGroup({
          turnOn: new FormControl(false),
          inactiveAutoRestake: new FormControl(false),
        }),
      }),
      isAccount: [false, [Validators.required]],
      address: ['', [Validators.required]],
      note: ['', [Validators.maxLength(200)]],
      id: '',
    });
  }

  setDataFrom(data) {
    this.isValidAddress = true;
    this.isEditMode = data.isEditMode;
    const isAccount = data.address?.length === LENGTH_CHARACTER.ADDRESS;

    this.watchlistForm.controls['isAccount'].setValue(isAccount);
    this.isAccount = isAccount;
    this.isContract = !this.isAccount;
    this.watchlistForm.controls['favorite'].setValue(data.favorite || false);
    this.watchlistForm.controls['tracking'].setValue(data.tracking || false);
    this.watchlistForm.controls['address'].setValue(data.address);
    this.watchlistForm.controls['note'].setValue(data.note);
    this.watchlistForm.controls['id'].setValue(data.id || '');

    //set data group tracking
    if (data.settings) {
      this.watchlistForm.controls['settings'].controls['nftReceived'].setValue(data.settings.nftReceived);
      this.watchlistForm.controls['settings'].controls['nftSent'].setValue(data.settings.nftSent);
      this.watchlistForm.controls['settings'].controls['tokenReceived'].setValue(data.settings.tokenReceived);
      this.watchlistForm.controls['settings'].controls['tokenSent'].setValue(data.settings.tokenSent);
      this.watchlistForm.controls['settings'].controls['transactionExecuted'].setValue(
        data.settings.transactionExecuted,
      );
      this.watchlistForm.controls['settings'].controls['nativeCoinSentBoolean'].setValue(
        data.settings.nativeCoinSent.turnOn,
      );
      this.reStakeSent = data.settings.nativeCoinSent.inactiveAutoRestake;
      this.watchlistForm.controls['settings'].controls['nativeCoinReceivedBoolean'].setValue(
        data.settings.nativeCoinReceived.turnOn,
      );
      this.reStakeReceiver = data.settings.nativeCoinReceived.inactiveAutoRestake;
    }

    this.checkNameTag();
  }

  closeDialog(status = null) {
    this.dialogRef.close(status);
  }

  checkFormValid(): boolean {
    this.formValid = false;
    this.getAddress['value'] = this.getAddress?.value.trim();

    if (this.getAddress.value?.length > 0 && this.getAddress?.value?.startsWith('aura')) {
      this.isValidAddress =
        (isAddress(this.getAddress.value) && this.isAccount) || (isContract(this.getAddress.value) && !this.isAccount);
    } else {
      this.isValidAddress = false;
      return false;
    }

    console.log('this.watchlistForm.value', this.watchlistForm.value);
    //check setting noti
    if (this.countCheck === 0) {
      return false;
    }
    this.formValid = true;
    return true;
  }

  onSubmit() {
    this.isSubmit = true;
    let payload = this.watchlistForm.value;

    // let payload = {
    //   address: 'aura16pvug5gs8enxmga4v3avpyk5t5s702vu3nzszp',
    //   type: 'account',
    //   favorite: true,
    //   tracking: true,
    //   note: 'string',
    //   settings: {
    //     transactionExecuted: true,
    //     tokenSent: true,
    //     tokenReceived: true,
    //     nftSent: true,
    //     nftReceived: true,
    //     // nativeCoinSent: {
    //     //   turnOn: true,
    //     //   inactiveAutoRestake: true,
    //     // },
    //     // nativeCoinReceived: {
    //     //   turnOn: true,
    //     //   inactiveAutoRestake: true,
    //     // },
    //   },
    // };
    if (payload.settings.nativeCoinSentBoolean) {
      payload['settings']['nativeCoinSent']['turnOn'] = true;
      payload['settings']['nativeCoinSent']['inactiveAutoRestake'] = this.reStakeSent;
    }
    if (payload.settings.nativeCoinReceivedBoolean) {
      payload['settings']['nativeCoinReceived']['turnOn'] = true;
      payload['settings']['nativeCoinReceived']['inactiveAutoRestake'] = this.reStakeReceiver;
    }
    delete payload.settings['nativeCoinSentBoolean'];
    delete payload.settings['nativeCoinReceivedBoolean'];
    payload['type'] = payload.isAccount ? 'account' : 'contract';
    console.log(payload);

    if (this.isEditMode) {
      this.editAddressInWatchlist(payload);
    } else {
      this.addAddressToWatchlist(payload);
    }
  }

  addAddressToWatchlist(payload) {
    if (this.data.currentLength >= this.quota) {
      this.isError = true;
      this.toastr.error('You have reached out of ' + this.quota + ' max limitation of private name tag');
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
    this.watchlistForm.value.isFavorite = !this.watchlistForm.value.isFavorite;
  }

  changeNotiMode() {
    this.watchlistForm.value.isNotiMode = !this.watchlistForm.value.isNotiMode;
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
      this.setDataFrom(res?.data[0] || this.data);
    });
  }

  onChangeTnxFilterType(event, type: any) {
    // if(event.target.checked){
    //   this.countCheck++;
    // } else
    this.countCheck = event.target.checked ? this.countCheck + 1 : this.countCheck - 1;
    console.log(this.countCheck);

    if (type === 'nativeCoinSentBoolean' && !event.target.checked) {
      this.reStakeSent = false;
    } else if (type === 'nativeCoinReceivedBoolean' && !event.target.checked) {
      this.reStakeReceiver = false;
    }
  }
}
