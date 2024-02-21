import { Component } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-wallet-bottom-sheet',
  templateUrl: './wallet-bottom-sheet.component.html',
  styleUrls: ['./wallet-bottom-sheet.component.scss'],
})
export class WalletBottomSheetComponent {
  constructor(public bottomSheetRef: MatBottomSheetRef<WalletBottomSheetComponent>) {}
}
