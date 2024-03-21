import {Component, Inject, OnInit} from '@angular/core';
import {UntypedFormBuilder, Validators} from '@angular/forms';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';
import {TranslateService} from '@ngx-translate/core';
import {LENGTH_CHARACTER, MAX_LENGTH_NAME_TAG} from 'src/app/core/constants/common.constant';
import {EnvironmentService} from 'src/app/core/data-services/environment.service';
import {CommonService} from 'src/app/core/services/common.service';
import {NameTagService} from 'src/app/core/services/name-tag.service';
import {NgxToastrService} from 'src/app/core/services/ngx-toastr.service';
import {EWalletType} from 'src/app/core/constants/wallet.constant';
import {isValidBench32Address} from 'src/app/core/utils/common/validation';

@Component({
  selector: 'app-popup-name-tag',
  templateUrl: './popup-name-tag.component.html',
  styleUrls: ['./popup-name-tag.component.scss'],
})
export class PopupNameTagComponent implements OnInit {
  privateNameForm;
  isSubmit = false;
  formValid = true;
  isAccount = false;
  isContract = false;
  maxLengthNameTag = MAX_LENGTH_NAME_TAG;
  maxLengthNote = 200;
  publicNameTag = '-';
  isError = false;
  isEditMode = false;
  idEdit = null;
  eWalletType = EWalletType;

  nameTagType = {
    Account: 'account',
    Contract: 'contract',
  };
  quota = this.environmentService.chainConfig.quotaSetPrivateName;
  chainName = this.environmentService.chainName.toLowerCase();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PopupNameTagComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    private environmentService: EnvironmentService,
    private commonService: CommonService,
    private nameTagService: NameTagService,
    private toastr: NgxToastrService,
  ) {
  }

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
    return this.privateNameForm.get('address');
  }

  get getFavorite() {
    return this.privateNameForm.get('isFavorite');
  }

  formInit() {
    this.privateNameForm = this.fb.group({
      isFavorite: [0],
      isAccount: [false, [Validators.required]],
      address: ['', [Validators.required]],
      evmAddress: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.maxLength(this.maxLengthNameTag)]],
      note: ['', [Validators.maxLength(200)]],
    });
  }

  setDataFrom(data) {
    if (data.nameTag || data.name_tag_private) {
      this.isEditMode = true;
      this.idEdit = this.data.id || data.id;
    }

    const isAccount = data.type === 'account' || this.commonService.isValidAddress(data.address);
    this.privateNameForm.controls['isAccount'].setValue(isAccount);
    this.isAccount = isAccount;
    this.isContract = !this.isAccount;
    this.privateNameForm.controls['isFavorite'].setValue(data.isFavorite || false);
    this.privateNameForm.controls['address'].setValue(data.address);
    this.privateNameForm.controls['name'].setValue(data.nameTag || data.name_tag_private);
    this.privateNameForm.controls['note'].setValue(data.note);
    this.checkPublicNameTag();
  }

  closeDialog(status = null) {
    this.dialogRef.close(status);
  }

  onSubmit() {
    this.isSubmit = true;
    const {isFavorite, address, name, note} = this.privateNameForm.value;
    let payload = {
      isFavorite: isFavorite == 1,
      type: this.isAccount ? 'account' : 'contract',
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
        this.toastr.error(error?.error?.error?.details?.details.message[0] || 'Error');
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
        this.toastr.error(error?.error?.error?.details?.details.message[0] || 'Error');
      },
    });
  }

  changeFavorite() {
    this.privateNameForm.value.isFavorite = !this.privateNameForm.value.isFavorite;
  }

  changeType(type) {
    this.isAccount = type;
    this.isContract = !this.isAccount;
    this.isError = false;
    this.privateNameForm.value.isAccount = type;
  }

  checkValidNameTag(event) {
    const regex = new RegExp('^[A-Za-z0-9._ -]+$');
    let key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    if (!regex.test(key)) {
      event.preventDefault();
      return;
    }
    this.privateNameForm.value.name = event.target.value;
  }

  checkPublicNameTag() {
    this.publicNameTag = '-';
    this.getAddress.value = this.getAddress.value.trim();
    if (this.getAddress.status === 'VALID') {
      const temp = this.nameTagService.findNameTagByAddress(this.getAddress.value, false);
      if (temp !== this.getAddress.value) {
        this.publicNameTag = temp;
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

  changeAddress(controlName: string) {
    if (controlName === 'address') {
      this.privateNameForm.get('evmAddress').disable();
    } else {
      this.privateNameForm.get('address').disable();
    }
    this.checkPublicNameTag();
  }

  resetAddress(controlName: string) {
    this.privateNameForm.get(controlName).setValue('');
    if (controlName === 'address') {
      this.privateNameForm.get('evmAddress').enable();
    } else {
      this.privateNameForm.get('address').enable();
    }
  }
}
