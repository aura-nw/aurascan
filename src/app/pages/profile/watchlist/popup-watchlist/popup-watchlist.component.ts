import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { LENGTH_CHARACTER } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { isAddress, isContract } from 'src/app/core/utils/common/validation';

@Component({
  selector: 'app-popup-watchlist',
  templateUrl: './popup-watchlist.component.html',
  styleUrls: ['./popup-watchlist.component.scss'],
})
export class PopupWatchlistComponent implements OnInit {
  watchlistForm;
  isSubmit = false;
  errorSpendLimit = '';
  formValid = true;
  isAccount = false;
  isContract = false;
  maxLengthNameTag = 35;
  maxLengthNote = 200;
  currentCodeID;
  publicNameTag = '-';
  privateNameTag = '-';
  isValidAddress = true;
  isError = false;
  isEditMode = false;
  idEdit = null;

  nameTagType = {
    Account: 'account',
    Contract: 'contract',
  };
  quota = this.environmentService.configValue.quotaSetPrivateName;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PopupWatchlistComponent>,
    private fb: FormBuilder,
    public environmentService: EnvironmentService,
    public translate: TranslateService,
    private commonService: CommonService,
    private nameTagService: NameTagService,
    private toastr: NgxToastrService,
  ) {}

  ngOnInit(): void {
    this.formInit();
    if (this.data?.address) {
      if (this.data.isGetDetail) {
        this.getDetailNameTag(this.data?.address);
      } else {
        this.setDataFrom(this.data);
      }
    }
  }

  get getAddress() {
    return this.watchlistForm.get('address');
  }

  get getFavorite() {
    return this.watchlistForm.get('isFavorite');
  }

  formInit() {
    this.watchlistForm = this.fb.group({
      isFavorite: [0],
      isAccount: [false, [Validators.required]],
      address: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.maxLength(this.maxLengthNameTag)]],
      note: ['', [Validators.maxLength(200)]],
    });
  }

  setDataFrom(data) {
    this.isValidAddress = true;
    if (data.nameTag || data.name_tag_private) {
      this.isEditMode = true;
      this.idEdit = this.data.id || data.id;
    }

    const isAccount = data.address?.length === LENGTH_CHARACTER.ADDRESS;

    this.watchlistForm.controls['isAccount'].setValue(isAccount);
    this.isAccount = isAccount;
    this.isContract = !this.isAccount;
    this.watchlistForm.controls['isFavorite'].setValue(data.isFavorite || false);
    this.watchlistForm.controls['address'].setValue(data.address);
    this.watchlistForm.controls['name'].setValue(data.nameTag || data.name_tag_private);
    this.watchlistForm.controls['note'].setValue(data.note);
    this.checkPublicNameTag();
    this.checkPrivateNameTag();
  }

  closeDialog(status = null) {
    this.dialogRef.close(status);
  }

  checkFormValid() {
    this.getAddress['value'] = this.getAddress?.value.trim();

    if (this.getAddress.value?.length > 0 && this.getAddress?.value?.startsWith('aura')) {
      this.isValidAddress =
        (isAddress(this.getAddress.value) && this.isAccount) || (isContract(this.getAddress.value) && !this.isAccount);
    } else {
      this.isValidAddress = false;
    }
  }

  onSubmit() {
    this.isSubmit = true;
    const { isFavorite, isAccount, address, name, note } = this.watchlistForm.value;
    let payload = {
      isFavorite: isFavorite == 1,
      type: isAccount ? this.nameTagType.Account : this.nameTagType.Contract,
      address: address,
      nameTag: name,
      note: note,
      id: this.idEdit,
    };
    if (this.isEditMode) {
      this.editPrivateName(payload);
    } else {
      this.createPrivateName(payload);
    }
  }

  createPrivateName(payload) {
    if (this.data.currentLength >= this.quota) {
      this.isError = true;
      this.toastr.error('You have reached out of ' + this.quota + ' max limitation of private name tag');
      return;
    }

    this.nameTagService.createPrivateName(payload).subscribe({
      next: (res) => {
        if (res.code && res.code !== 200) {
          this.isError = true;
          this.toastr.error(res.message || 'Error');
          return;
        }

        this.closeDialog(true);
        this.toastr.successWithTitle('Private name tag created!', 'Success');
      },
      error: (error) => {
        this.isError = true;
        this.toastr.error(error?.details.message[0] || 'Error');
      },
    });
  }

  editPrivateName(payload) {
    this.nameTagService.updatePrivateNameTag(payload).subscribe({
      next: (res) => {
        if (res.code && res.code !== 200) {
          this.isError = true;
          this.toastr.error(res.message || 'Error');
          return;
        }

        this.closeDialog(true);
        this.toastr.successWithTitle('Private name tag updated!', 'Success');
      },
      error: (error) => {
        this.isError = true;
        this.toastr.error(error?.details.message[0] || 'Error');
      },
    });
  }

  changeFavorite() {
    this.watchlistForm.value.isFavorite = !this.watchlistForm.value.isFavorite;
  }

  changeType(type) {
    this.isAccount = type;
    this.isContract = !this.isAccount;
    this.isValidAddress = false;
    this.isError = false;
    this.watchlistForm.value.isAccount = type;
    this.checkFormValid();
  }

  checkValidNameTag(event) {
    const regex = new RegExp('^[A-Za-z0-9._ -]+$');
    let key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    if (!regex.test(key)) {
      event.preventDefault();
      return;
    }
    this.watchlistForm.value.name = event.target.value;
  }

  checkPublicNameTag() {
    this.publicNameTag = '-';
    this.getAddress.value = this.getAddress.value.trim();
    if (this.getAddress.status === 'VALID') {
      const temp = this.commonService.setNameTag(this.getAddress.value, null, false);
      if (temp !== this.getAddress.value) {
        this.publicNameTag = temp;
      }
    }
  }

  checkPrivateNameTag() {
    this.privateNameTag = '-';
    this.getAddress.value = this.getAddress.value.trim();
    if (this.getAddress.status === 'VALID') {
      const temp = this.commonService.setNameTag(this.getAddress.value, null, true);
      if (temp !== this.getAddress.value) {
        this.privateNameTag = temp;
      }
    }
  }

  getDetailNameTag(address = null) {
    const payload = {
      limit: 1,
      keyword: address || '',
      offset: 0,
    };

    this.nameTagService.getListPrivateNameTag(payload).subscribe((res) => {
      this.setDataFrom(res?.data[0] || this.data);
    });
  }
}
