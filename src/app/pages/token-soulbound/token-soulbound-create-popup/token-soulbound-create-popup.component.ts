import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-token-soulbound-create-popup',
  templateUrl: './token-soulbound-create-popup.component.html',
  styleUrls: ['./token-soulbound-create-popup.component.scss']
})

export class TokenSoulboundCreatePopupComponent implements OnInit {
  createSBTokenForm: FormGroup;
  isSubmit = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<TokenSoulboundCreatePopupComponent>,
  ) {}

  ngOnInit() {
    this.formInit();
  }

  formInit() {
    this.createSBTokenForm = new FormGroup({
      soulboundTokenURI: new FormControl('', Validators.required),
      receiverAddress: new FormControl('', Validators.required),
    });
  }

  closeDialog() {
    this.dialogRef.close('canceled');
  }

  onSubmit() {
    this.dialogRef.close(this.createSBTokenForm.value);
  }

  checkFormValid(): boolean {
    return true;
  }
}
