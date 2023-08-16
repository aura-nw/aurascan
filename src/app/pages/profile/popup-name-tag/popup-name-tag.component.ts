import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';

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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { data: any },
    public dialogRef: MatDialogRef<PopupNameTagComponent>,
    private fb: FormBuilder,
    public environmentService: EnvironmentService,
    public translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.formInit();
  }

  formInit() {
    this.privateNameForm = this.fb.group({
      favorite: [''],
      type: ['', [Validators.required]],
      address: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      note: ['', [Validators.maxLength(200)]],
    });
  }

  closeDialog(hash = null) {
    this.dialogRef.close(hash);
  }

  checkFormValid() {}

  async onSubmit() {
    this.isSubmit = true;
    console.log(this.privateNameForm.value);
  }

  changeFavorite() {
    this.privateNameForm.value.favorite = !this.privateNameForm.value.favorite;
  }
}
