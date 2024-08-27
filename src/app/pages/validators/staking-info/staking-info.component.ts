import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { TableTemplate } from 'src/app/core/models/common.model';
import { WalletService } from 'src/app/core/services/wallet.service';

@Component({
  selector: 'app-staking-info',
  templateUrl: './staking-info.component.html',
  styleUrls: ['./staking-info.component.scss'],
})
export class StakingInfoComponent implements OnChanges {
  @Input() breakpoint: any;
  @Input() userAddress: string;
  @Input() dataDelegate: any;
  @Input() lstUndelegate: any[] = [];
  @Input() dataUserDelegate: any;
  @Input() modalManage: any;
  @Input() denom: any;
  @Output() onViewDialog: EventEmitter<any> = new EventEmitter();
  @Input() isLoading: boolean;
  validatorImgArr;

  dataSourceWallet = new MatTableDataSource<any>();
  dataStakeInfo = {};
  templatesWallet: Array<TableTemplate> = [
    { matColumnDef: 'validator_name', headerCellDef: 'Name', desktopOnly: true },
    { matColumnDef: 'amount_staked', headerCellDef: 'Amount Staked' },
    { matColumnDef: 'pending_reward', headerCellDef: 'Pending Reward' },
    { matColumnDef: 'action', headerCellDef: '', desktopOnly: true },
  ];
  displayedColumnsWallet: string[] = this.templatesWallet.map((dta) => dta.matColumnDef);
  clicked = false;
  isDisableClaim = true;
  isEvmAccount = false;

  constructor(private walletService: WalletService) {
    this.walletService.walletAccount$.subscribe({
      next: (wallet) => {
        this.isEvmAccount = !!wallet.evmAccount;
      },
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.dataSourceWallet = new MatTableDataSource(this.dataUserDelegate?.delegations);

    if (changes.dataDelegate) {
      if (Number(this.dataDelegate?.stakingToken) > 0) {
        this.isDisableClaim = false;
      }
      this.dataStakeInfo = changes.dataDelegate.currentValue;
    }

    if (changes.lstUndelegate) {
      let lstUndelegateTemp = [];
      const now = new Date();
      this.lstUndelegate?.forEach((data) => {
        let timeConvert = new Date(data.completion_time);
        if (now < timeConvert) {
          lstUndelegateTemp.push(data);
        }
      });
      this.lstUndelegate = lstUndelegateTemp;
    }
  }

  viewDialog(isClaimMode = false, modal: any = '', address: any = ''): void {
    setTimeout(() => {
      this.clicked = false;
    }, 1000);

    const dataModal = {
      modal: modal,
      address: address,
      isClaimMode: isClaimMode,
    };
    this.onViewDialog.emit(dataModal);
  }
}
