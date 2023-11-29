import { Component, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-popup-common',
  templateUrl: './popup-common.component.html',
  styleUrls: ['./popup-common.component.scss'],
})
export class PopupCommonComponent {
  isLoading;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PopupCommonComponent>,
  ) {}

  submitAction(type) {
    this.dialogRef.close(type);
  }

  closeDialog() {
    this.dialogRef.close('canceled');
  }
}
