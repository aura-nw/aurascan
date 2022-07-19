import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NUMBER_CONVERT } from 'src/app/core/constants/common.constant';
import { STATUS_VALIDATOR } from 'src/app/core/constants/validator.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { BlockService } from 'src/app/core/services/block.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ValidatorService } from 'src/app/core/services/validator.service';
import { balanceOf } from 'src/app/core/utils/common/parsing';
import { Globals } from 'src/app/global/global';

@Component({
  selector: 'app-validators-detail',
  templateUrl: './validators-detail.component.html',
  styleUrls: ['./validators-detail.component.scss'],
})
export class ValidatorsDetailComponent implements OnInit {
  currentAddress: string;
  currentValidatorDetail: any;

  lengthBlock: number;
  lengthDelegator: number;
  lengthPower: number;

  pageSize = 5;
  pageIndexBlock = 0;
  pageIndexDelegator = 0;
  pageIndexPower = 0;

  arrayUpTime = new Array(100);
  statusValidator = STATUS_VALIDATOR;

  dataSourceBlock: MatTableDataSource<any> = new MatTableDataSource();
  templatesBlock: Array<TableTemplate> = [
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'block_hash', headerCellDef: 'Block Hash' },
    { matColumnDef: 'num_txs', headerCellDef: 'Txs' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
  ];

  displayedColumnsBlock: string[] = this.templatesBlock.map((dta) => dta.matColumnDef);

  dataSourceDelegator: MatTableDataSource<any> = new MatTableDataSource();
  templatesDelegator: Array<TableTemplate> = [
    { matColumnDef: 'delegator_address', headerCellDef: 'Delegator Address' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
  ];
  displayedColumnsDelegator: string[] = this.templatesDelegator.map((dta) => dta.matColumnDef);

  dataSourcePower: MatTableDataSource<any> = new MatTableDataSource();
  templatesPower: Array<TableTemplate> = [
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'tx_hash', headerCellDef: 'TxHash' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
  ];
  displayedColumnsPower: string[] = this.templatesPower.map((dta) => dta.matColumnDef);

  lengthBlockLoading = true;
  lengthPowerLoading = true;
  lastBlockLoading = true;

  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private validatorService: ValidatorService,
    private blockService: BlockService,
    public commonService: CommonService,
    public global: Globals,
    private layout: BreakpointObserver,
    private numberPipe: DecimalPipe,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.currentAddress = this.route.snapshot.paramMap.get('id');
    this.getDetail();
    this.getListBlockWithOperator();
    this.getListUpTime();
    this.getListDelegator();
    this.getListPower();
  }

  getDetail(): void {
    this.validatorService.validatorsDetail(this.currentAddress).subscribe(
      (res) => {
        if (res.status === 404) {
          this.router.navigate(['/']);
          return;
        }
        this.currentValidatorDetail = res.data;
        this.currentValidatorDetail = Object.assign(res.data, {
          self_bonded: this.currentValidatorDetail.self_bonded / NUMBER_CONVERT,
          power: this.currentValidatorDetail.power / NUMBER_CONVERT,
          up_time:
            this.currentValidatorDetail.status === this.statusValidator.Active
              ? this.currentValidatorDetail.up_time
              : '0%',
        });
      },
      (error) => {
        this.router.navigate(['/']);
      },
    );
  }

  getListBlockWithOperator(): void {
    this.blockService
      .blockWithOperator(this.pageSize, this.pageIndexBlock * this.pageSize, this.currentAddress)
      .subscribe((res) => {
        this.lengthBlockLoading = true;
        if (res?.data?.length > 0 && res?.meta) {
          this.lengthBlock = res.meta?.count;
          this.dataSourceBlock.data = res.data;
        }
        this.lengthBlockLoading = false;
      });
  }

  getListUpTime(): void {
    this.blockService.getLastBlock(this.currentAddress).subscribe((res) => {
      this.lastBlockLoading = true;
      if (res?.data?.length > 0) {
        this.arrayUpTime = res.data;
      }
      this.lastBlockLoading = false;
    });
  }

  getListDelegator(): void {
    this.validatorService
      .delegators(this.pageSize, this.pageIndexDelegator * this.pageSize, this.currentAddress)
      .subscribe((res) => {
        console.log(res);
        if (Number(res?.pagination?.total) > 0 && res?.delegation_responses) {
          this.lengthDelegator = Number(res?.pagination?.total);
          let data = [];
          res.delegation_responses.forEach((k) => {
            data.push({ delegator_address: k.delegation?.delegator_address, amount: balanceOf(k.balance?.amount) });
          });
          this.dataSourceDelegator = new MatTableDataSource(data);
        }
      });
  }

  getListPower(): void {
    this.validatorService
      .validatorsDetailListPower(this.pageSize, this.pageIndexPower * this.pageSize, this.currentAddress)
      .subscribe((res) => {
        this.lengthPowerLoading = true;
        if (res.data?.length > 0) {
          res.data.forEach((power) => {
            power.isStakeMode = false;
            if (
              power.type === 'delegate' ||
              (power.type === 'redelegate' && power?.messages[0]?.validator_dst_address === this.currentAddress) ||
              power.type === 'create_validator'
            ) {
              power.isStakeMode = true;
            }
          });
          this.dataSourcePower = res;
          this.lengthPower = res.meta?.count;
        }
        this.lengthPowerLoading = false;
      });
  }

  changePage(page: PageEvent, type: 'block' | 'delegator' | 'power'): void {
    switch (type) {
      case 'block':
        this.pageIndexBlock = page.pageIndex;
        this.getListBlockWithOperator();
        break;
      case 'delegator':
        this.pageIndexDelegator = page.pageIndex;
        this.getListDelegator();
        break;
      case 'power':
        this.pageIndexPower = page.pageIndex;
        this.getListPower();
        break;
      default:
        break;
    }
  }

  paginatorEmit(event, type: 'block' | 'delegator' | 'power'): void {
    switch (type) {
      case 'block':
        this.dataSourceBlock.paginator = event;
        break;
      case 'delegator':
        this.dataSourceDelegator.paginator = event;
        break;
      case 'power':
        this.dataSourcePower.paginator = event;
        break;
      default:
        break;
    }
  }
  pageEvent(page: PageEvent, type: 'block' | 'delegator' | 'power'): void {
    switch (type) {
      case 'block':
        this.pageIndexBlock = page.pageIndex;
        this.getListBlockWithOperator();
        break;
      case 'delegator':
        this.pageIndexDelegator = page.pageIndex;
        this.getListDelegator();
        break;
      case 'power':
        this.pageIndexPower = page.pageIndex;
        this.getListPower();
        break;
      default:
        break;
    }
  }
  checkAmountStaking(amount, isStakeMode) {
    if (isStakeMode) {
      return (
        '<span class=text--info>' + '+ ' + this.numberPipe.transform(amount, this.global.formatNumberToken) + '</span>'
      );
    } else {
      return (
        '<span class=text--danger>' +
        '- ' +
        this.numberPipe.transform(amount, this.global.formatNumberToken) +
        '</span>'
      );
    }
  }

  getValidatorAvatar(validatorAddress: string): string {
    return this.validatorService.getValidatorAvatar(validatorAddress);
  }
}
