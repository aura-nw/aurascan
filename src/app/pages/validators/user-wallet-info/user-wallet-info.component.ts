import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
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
  @Input() arrayDelegate: any[] = [];
  @Input() dataDelegate: DataDelegateDto;
  @Input() lstUndelegate: any[] = [];
  @Input() modalManage: any;
  @Input() denom: any;
  @Output() onViewDialog: EventEmitter<any> = new EventEmitter();
  @Input() isLoading: boolean;
  validatorImgArr;

  dataSourceWallet = new MatTableDataSource<any>();
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
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.arrayDelegate) {
      if (changes.arrayDelegate.currentValue?.length !== changes.arrayDelegate.previousValue?.length) {
        this.dataSourceWallet = new MatTableDataSource(this.arrayDelegate);
      } else {
        Object.keys(this.arrayDelegate).forEach((key) => {
          if (this.dataSourceWallet.data[key]) {
            Object.assign(this.dataSourceWallet.data[key], this.arrayDelegate[key]);
          } else {
            this.dataSourceWallet.data[key] = this.arrayDelegate[key];
          }
        });
      }
      if (changes.arrayDelegate.currentValue?.length > 0) {
        // get ValidatorAddressArr
        this.getValidatorAvatar(changes.arrayDelegate.currentValue);
      }
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

      if (this.lstUndelegate?.length > 0) {
        // get ValidatorAddressArr
        this.getValidatorAvatar(this.lstUndelegate);
      }
    }
  }

  ngOnInit(): void {}

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

  getValidatorAvatar(validatorArr) {
    if (validatorArr.length > 0) {
      const operatorAddArr = [];
      // get ValidatorAddressArr
      validatorArr.forEach((d) => {
        operatorAddArr.push(d.validator_address);
      });
      // get validator logo
      this.validatorService.getValidatorInfoByList(operatorAddArr).subscribe((res) => {
        if (res?.data) {
          this.validatorImgArr = res?.data;
          // push image into validator array
          validatorArr.forEach((item) => {
            this.validatorImgArr.forEach((imgObj) => {
              if (imgObj.operator_address == item.validator_address) {
                item['image_url'] = imgObj.image_url;
              }
            });
          });
          this.cdr.markForCheck();
        }
      });
    }
  }
}
