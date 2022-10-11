import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DataDelegateDto, TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { ValidatorService } from 'src/app/core/services/validator.service';
import { Globals } from 'src/app/global/global';

@Component({
  selector: 'app-user-wallet-info',
  templateUrl: './user-wallet-info.component.html',
  styleUrls: ['./user-wallet-info.component.scss'],
})
export class UserWalletInfoComponent implements OnInit, OnChanges {
  @Input() breakpoint: any;
  @Input() userAddress: string;
  @Input() arrayDelegate: any[];
  @Input() dataDelegate: DataDelegateDto;
  @Input() lstUndelegate: any[];
  @Input() modalManage: any;
  @Input() denom: any;
  @Output() onViewDialog: EventEmitter<any> = new EventEmitter();
  @Input() isLoading: boolean;

  dataSourceWallet: MatTableDataSource<any>;
  templatesWallet: Array<TableTemplate> = [
    { matColumnDef: 'validator_name', headerCellDef: 'Name', desktopOnly: true },
    { matColumnDef: 'amount_staked', headerCellDef: 'Amount Staked' },
    { matColumnDef: 'pending_reward', headerCellDef: 'Pending Reward' },
    { matColumnDef: 'action', headerCellDef: '' },
  ];
  displayedColumnsWallet: string[] = this.templatesWallet.map((dta) => dta.matColumnDef);
  clicked = false;
  isDisableClaim = true;
  constructor(
    public globals: Globals,
    public commonService: CommonService,
    private validatorService: ValidatorService,
    private  cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.arrayDelegate) {
      this.dataSourceWallet = new MatTableDataSource(this.arrayDelegate);
    }

    if (changes.dataDelegate) {
      if (Number(this.dataDelegate?.stakingToken) > 0) {
        this.isDisableClaim = false;
      }
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
    this.cdr.markForCheck();
  }

  ngOnInit(): void {}

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
