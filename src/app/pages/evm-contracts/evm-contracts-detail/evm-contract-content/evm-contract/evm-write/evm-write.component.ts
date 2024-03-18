import { Component, Input, OnInit } from '@angular/core';
import {
  MatLegacyDialog as MatDialog,
  MatLegacyDialogConfig as MatDialogConfig,
} from '@angular/material/legacy-dialog';
import { WalletAccount } from '@cosmos-kit/core';
import { TranslateService } from '@ngx-translate/core';
import _ from 'lodash';
import { JsonAbi, WRITE_STATE_MUTABILITY } from 'src/app/core/models/evm-contract.model';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { PopupAddZeroComponent } from 'src/app/shared/components/popup-add-zero/popup-add-zero.component';

@Component({
  selector: 'app-evm-write',
  templateUrl: './evm-write.component.html',
  styleUrls: ['./evm-write.component.scss'],
})
export class EvmWriteComponent implements OnInit {
  @Input() abi: JsonAbi[];

  isExpand = false;
  userAddress = '';
  walletAccount: WalletAccount;

  get writeAbi() {
    return (
      this.abi?.filter(
        (abi: JsonAbi) => WRITE_STATE_MUTABILITY.includes(abi.stateMutability) && abi.type == 'function',
      ) || []
    );
  }

  constructor(
    private walletService: WalletService,
    private toastr: NgxToastrService,
    private translate: TranslateService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.walletService.walletAccount$.subscribe((wallet) => {
      if (wallet) {
        this.userAddress = wallet.address;
      } else {
        this.userAddress = null;
      }
    });
  }

  expandMenu(closeAll = false): void {
    for (let i = 0; i < document.getElementsByClassName('content-contract').length; i++) {
      let element: HTMLElement = document.getElementsByClassName('content-contract')[i] as HTMLElement;
      let expand = element.getAttribute('aria-expanded');
      if (closeAll) {
        if (expand == 'true') {
          element.click();
        }
      } else {
        if (expand === this.isExpand.toString()) {
          element.click();
        }
      }
    }
    if (!closeAll) {
      this.isExpand = !this.isExpand;
    }
  }

  reloadData() {
    this.expandMenu(true);
    this.clearAllError(true);
    this.isExpand = false;
  }

  clearAllError(all = false) {
    // this.root?.forEach((msg) => {
    //   this.resetError(msg, all);
    //   if (msg.fieldList && msg.fieldList.length && all) msg.dataResponse = '';
    // });
  }

  connectWallet(): void {
    this.walletAccount = this.walletService.getAccount();
  }

  handleExecute(msg) {}

  execute(data, msg) {}

  resetError(msg, all = false) {
    if (msg) {
      const { fieldList } = msg;
      fieldList.forEach((item) => {
        _.assign(
          item,
          all
            ? {
                isError: false,
                value: '',
              }
            : {
                isError: false,
              },
        );
      });
    }
  }

  showAddZero(msg) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'grant-overlay-panel';
    dialogConfig.data = {};
    let dialogRef = this.dialog.open(PopupAddZeroComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        result = result === 'custom' ? 0 : result;
        let amount = msg['fieldList']?.find((k) => k.fieldName === 'amount')?.value || '';
        //check amount is exit
        const numPow = amount.toString()
          ? Math.pow(10, result)?.toString().substring(1)
          : Math.pow(10, result)?.toString();
        amount = amount?.toString() + numPow;
        msg['fieldList'].find((k) => k.fieldName === 'amount').value = amount.toString();
      }
    });
  }
}
