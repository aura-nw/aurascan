import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-popup-revoke',
  templateUrl: './popup-revoke.component.html',
  styleUrls: ['./popup-revoke.component.scss']
})
export class PopupRevokeComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {granterAddress: string, granteeAddress: string},
    public dialogRef: MatDialogRef<PopupRevokeComponent>
  ) { }

  ngOnInit(): void {}

  closeDialog() {
    this.dialogRef.close('');
  }

}
