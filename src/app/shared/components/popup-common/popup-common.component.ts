import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-popup-common',
  templateUrl: './popup-common.component.html',
  styleUrls: ['./popup-common.component.scss'],
})
export class PopupCommonComponent implements OnInit {
  isLoading;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PopupCommonComponent>,
  ) {}

  ngOnInit(): void {
  }

  submitAction(type) {
    this.dialogRef.close(type);
  }

  closeDialog() {
    this.dialogRef.close('canceled');
  }
}
