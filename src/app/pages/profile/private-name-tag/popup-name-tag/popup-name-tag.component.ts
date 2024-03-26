import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { MAX_LENGTH_NAME_TAG } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { EWalletType } from 'src/app/core/constants/wallet.constant';
import { transferAddress } from 'src/app/core/utils/common/address-converter';

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
  chainInfo = this.environmentService.chainInfo;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PopupNameTagComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    private environmentService: EnvironmentService,
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
    return this.privateNameForm.get('cosmosAddress');
  }

  get getFavorite() {
    return this.privateNameForm.get('isFavorite');
  }

  formInit() {
    this.privateNameForm = this.fb.group({
      isFavorite: [0],
      isAccount: [false, [Validators.required]],
      address: [''],
      cosmosAddress: ['', [Validators.required]],
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
    this.privateNameForm.controls['cosmosAddress'].setValue(data.cosmosAddress);
    this.privateNameForm.controls['evmAddress'].setValue(data.evmAddress);
    this.privateNameForm.controls['name'].setValue(data.nameTag || data.name_tag_private);
    this.privateNameForm.controls['note'].setValue(data.note);
    this.checkPublicNameTag();
  }

  closeDialog(status = null) {
    this.dialogRef.close(status);
  }

  onSubmit() {
    this.isSubmit = true;
    const { isFavorite, address, cosmosAddress, evmAddress, name, note } = this.privateNameForm.getRawValue();
    let payload = {
      isFavorite: isFavorite == 1,
      type: this.isAccount ? 'account' : 'contract',
      address: cosmosAddress,
      evmAddress,
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
    const address = this.privateNameForm.get(controlName).value;
    if (address.length === 0) return;
    if (!this.commonService.isValidContract(address)) {
      const { accountAddress, accountEvmAddress } = transferAddress(
        this.chainInfo.bech32Config.bech32PrefixAccAddr,
        address,
      );
      this.privateNameForm.get('cosmosAddress').setValue(accountAddress);
      this.privateNameForm.get('evmAddress').setValue(accountEvmAddress);

      if (address.trim() == accountEvmAddress.trim()) {
        this.privateNameForm.get('evmAddress').enable();
      }
    }
    if (controlName === 'cosmosAddress' && address.length > 0) {
      this.privateNameForm.get('evmAddress').disable();
    } else {
      this.privateNameForm.get('cosmosAddress').disable();
    }
    this.checkPublicNameTag();
  }

  resetAddress() {
    this.privateNameForm.get('cosmosAddress').setValue('');
    this.privateNameForm.get('evmAddress').setValue('');
    this.privateNameForm.get('evmAddress').enable();
    this.privateNameForm.get('cosmosAddress').enable();
  }
}
