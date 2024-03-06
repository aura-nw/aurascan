import { Component, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-popup-notice',
  templateUrl: './popup-notice.component.html',
  styleUrls: ['./popup-notice.component.scss'],
})
export class PopupNoticeComponent implements OnInit {
  isLoading = false;
  walletAccount: any;

  constructor(public dialogRef: MatDialogRef<PopupNoticeComponent>) {}

  ngOnInit(): void {}

  closeDialog(isConfirm = false) {
    this.dialogRef.close(isConfirm);
  }
}
