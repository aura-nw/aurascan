import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DIALOG_STAKE_MODE } from 'src/app/core/constants/validator.enum';
import { DataDelegateDto, TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { ValidatorService } from 'src/app/core/services/validator.service';
import { Globals } from 'src/app/global/global';

@Component({
  selector: 'app-user-wallet-info',
  templateUrl: './user-wallet-info.component.html',
  styleUrls: ['./user-wallet-info.component.scss'],
})
export class UserWalletInfoComponent implements OnInit {
  @Input() breakpoint: any;
  @Input() userAddress: string;
  @Input() arrayDelegate: any[];
  @Input() dataDelegate: DataDelegateDto;
  @Input() lstUndelegate: any[];
  @Input() modalManage: any;
  @Output() onViewDialog: EventEmitter<any> = new EventEmitter();

  dataSourceWallet: MatTableDataSource<any>;
  templatesWallet: Array<TableTemplate> = [
    { matColumnDef: 'validator_name', headerCellDef: 'Name', desktopOnly: true },
    { matColumnDef: 'amount_staked', headerCellDef: 'Amount Staked' },
    { matColumnDef: 'pending_reward', headerCellDef: 'Pending Reward' },
    { matColumnDef: 'action', headerCellDef: '' },
  ];
  displayedColumnsWallet: string[] = this.templatesWallet.map((dta) => dta.matColumnDef);
  clicked = false;
  dialogMode = DIALOG_STAKE_MODE;
  isDisableClaim = true;
  constructor(
    public globals: Globals,
    public commonService: CommonService,
    private validatorService: ValidatorService,
  ) {}

  ngOnInit(): void {
    this.dataSourceWallet = new MatTableDataSource(this.arrayDelegate);
    if (Number(this.dataDelegate.delegatedToken) > 0) {
      this.isDisableClaim = false;
    }
  }

  getValidatorAvatar(validatorAddress: string): string {
    return this.validatorService.getValidatorAvatar(validatorAddress);
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
