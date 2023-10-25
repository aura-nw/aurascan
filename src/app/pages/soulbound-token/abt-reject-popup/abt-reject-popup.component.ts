import { Component, Inject, OnInit } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-abt-reject-popup',
  templateUrl: './abt-reject-popup.component.html',
  styleUrls: ['./abt-reject-popup.component.scss'],
})
export class AbtRejectPopupComponent implements OnInit {
  isLoading;
  constructor(
    @Inject(MAT_DIALOG_DATA) public abtDetail: any,
    public dialogRef: MatDialogRef<AbtRejectPopupComponent>,
  ) {}

  ngOnInit(): void {}

  submitAction(type) {
    this.dialogRef.close(type);
  }

  closeDialog() {
    this.dialogRef.close('canceled');
  }
}
