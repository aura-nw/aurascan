import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { LIST_ZEROES } from 'src/app/core/constants/contract.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { WalletService } from 'src/app/core/services/wallet.service';

@Component({
  selector: 'app-popup-add-zero',
  templateUrl: './popup-add-zero.component.html',
  styleUrls: ['./popup-add-zero.component.scss'],
})
export class PopupAddZeroComponent implements OnInit {
  selectedZeroes: string;
  lstZeroes = LIST_ZEROES;
  numberCustom = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {},
    public dialogRef: MatDialogRef<PopupAddZeroComponent>,
    public walletService: WalletService,
    public environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {}

  closeDialog(data = null) {
    this.dialogRef.close(data);
  }

  updateZero() {
    this.closeDialog(this.numberCustom || this.selectedZeroes);
  }

  checkCustomValue() {
    this.numberCustom = this.numberCustom > 18 ? 18 : this.numberCustom;
  }

  validateNumber(event: any) {
    const regex = new RegExp(/[0-9]/g);
    let key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    if (!regex.test(key)) {
      event.preventDefault();
      return;
    }
    this.numberCustom = event.target.value;
  }
}
