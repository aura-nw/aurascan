import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { LENGTH_CHARACTER } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';

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
  isValidAddress = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { data: any },
    public dialogRef: MatDialogRef<PopupNameTagComponent>,
    private fb: FormBuilder,
    public environmentService: EnvironmentService,
    public translate: TranslateService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.formInit();
  }

  get getAddress() {
    return this.privateNameForm.get('address');
  }

  formInit() {
    this.privateNameForm = this.fb.group({
      favorite: [''],
      isAccount: [true, [Validators.required]],
      address: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.maxLength(this.maxLengthNameTag)]],
      note: ['', [Validators.maxLength(200)]],
    });
  }

  closeDialog(hash = null) {
    this.dialogRef.close(hash);
  }

  checkFormValid() {
    this.isValidAddress = false;
    if (this.getAddress.value?.length > 0 && this.getAddress?.value?.trim().startsWith('aura')) {
      if (
        (this.getAddress.value?.length === LENGTH_CHARACTER.ADDRESS && this.isAccount) ||
        (this.getAddress.value?.length === LENGTH_CHARACTER.CONTRACT && !this.isAccount)
      ) {
        this.isValidAddress = true;
      }
    }
  }

  async onSubmit() {
    this.isSubmit = true;
    console.log(this.privateNameForm);
  }

  changeFavorite() {
    this.privateNameForm.value.favorite = !this.privateNameForm.value.favorite;
  }

  changeType(type) {
    this.isAccount = type;
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
      const temp = this.commonService.setNameTag(this.getAddress.value);
      if (temp !== this.getAddress.value) {
        this.publicNameTag = temp;
      }
    }
  }
}
