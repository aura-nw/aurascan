import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { LENGTH_CHARACTER } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';

@Component({
  selector: 'app-popup-name-tag',
  templateUrl: './popup-name-tag.component.html',
  styleUrls: ['./popup-name-tag.component.scss'],
})
export class PopupNameTagComponent implements OnInit {
  privateNameForm;
  isSubmit = false;
  errorSpendLimit = '';
  formValid = true;
  isAccount = true;
  maxLengthNameTag = 35;
  maxLengthNote = 200;
  currentCodeID;
  publicNameTag = '-';
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
    public dialogRef: MatDialogRef<PopupNameTagComponent>,
    private fb: FormBuilder,
    public environmentService: EnvironmentService,
    public translate: TranslateService,
    private commonService: CommonService,
    private nameTagService: NameTagService,
    private toastr: NgxToastrService,
  ) {}

  ngOnInit(): void {
    //set temp quota = 100
    this.quota = 100;
    this.formInit();
    if (this.data?.address) {
      this.setDataFrom(this.data);
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
      isAccount: [true, [Validators.required]],
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

    const isAccount = data.address?.length === LENGTH_CHARACTER.ADDRESS ? true : false;
    this.privateNameForm.controls['isAccount'].setValue(isAccount);
    this.isAccount = isAccount;
    this.privateNameForm.controls['isFavorite'].setValue(data.isFavorite || false);
    this.privateNameForm.controls['address'].setValue(data.address);
    this.privateNameForm.controls['name'].setValue(data.nameTag || data.name_tag_private);
    this.privateNameForm.controls['note'].setValue(data.note);
    this.checkPublicNameTag();
  }

  closeDialog(hash = null) {
    this.dialogRef.close(hash);
  }

  checkFormValid() {
    this.getAddress['value'] = this.getAddress?.value.trim();

    if (this.getAddress.value?.length > 0 && this.getAddress?.value?.startsWith('aura')) {
      if (
        (this.getAddress.value.trim()?.length === LENGTH_CHARACTER.ADDRESS && this.isAccount) ||
        (this.getAddress.value.trim()?.length === LENGTH_CHARACTER.CONTRACT && !this.isAccount)
      ) {
        this.isValidAddress = true;
      } else {
        this.isValidAddress = false;
      }
    } else {
      this.isValidAddress = false;
    }
  }

  onSubmit() {
    this.isSubmit = true;
    const { isFavorite, isAccount, address, name, note } = this.privateNameForm.value;

    let payload = {
      isFavorite: isFavorite,
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
    if (this.data.currentLength > this.quota) {
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

        this.closeDialog();
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
        this.toastr.successWithTitle('Private name tag edited!', 'Success');
      },
      error: (error) => {
        this.isError = true;
        this.toastr.error(error?.details.message[0] || 'Error');
      },
    });
  }

  changeFavorite() {
    this.privateNameForm.value.isFavorite = !this.privateNameForm.value.isFavorite;
  }

  changeType(type) {
    this.isAccount = type;
    this.isValidAddress = false;
    this.isError = false;
    this.privateNameForm.value.isAccount = type;
    this.checkFormValid();
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
      const temp = this.commonService.setNameTag(this.getAddress.value, null, false);
      if (temp !== this.getAddress.value) {
        this.publicNameTag = temp;
      }
    }
  }
}
