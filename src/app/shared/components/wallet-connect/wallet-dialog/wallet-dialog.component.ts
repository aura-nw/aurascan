import { Component } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-wallet-dialog',
  templateUrl: './wallet-dialog.component.html',
})
export class WalletDialogComponent {
  constructor(public dialogRef: MatDialogRef<WalletDialogComponent>) {}

  close(): void {
    this.dialogRef.close();
  }
}
