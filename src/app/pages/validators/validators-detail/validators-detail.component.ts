import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { fromBech32, toHex } from '@cosmjs/encoding';
import { STATUS_VALIDATOR } from 'src/app/core/constants/validator.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { BlockService } from 'src/app/core/services/block.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ValidatorService } from 'src/app/core/services/validator.service';
import { Globals } from 'src/app/global/global';
import { balanceOf } from '../../../core/utils/common/parsing';

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
  arrBlocksMiss = [];
  numberLastBlock = 100;
  timerGetUpTime: any;
  timerGetBlockMiss: any;

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
    this.getBlocksMiss();
    this.currentAddress = this.route.snapshot.paramMap.get('id');
    this.getDetail();
    this.getListBlockWithOperator();
    this.getListDelegator();
    this.getListPower();
    this.getListUpTime();
    this.timerGetUpTime = setInterval(() => {
      this.getListUpTime();
    }, 30000);
    this.timerGetBlockMiss = setInterval(() => {
      this.getBlocksMiss();
    }, 10000);
  }

  ngOnDestroy() {
    clearInterval(this.timerGetUpTime);
    clearInterval(this.timerGetBlockMiss);
  }

  getDetail(): void {
    this.validatorService.validatorsDetail(this.currentAddress).subscribe(
      (res) => {
        if (res.status === 404) {
          this.router.navigate(['/']);
          return;
        }

        this.currentValidatorDetail = {
          ...res.data,
          self_bonded: balanceOf(res.data.self_bonded),
          power: balanceOf(res.data.power),
          up_time: 0,
        };
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

  async getBlocksMiss() {
    const res = await this.blockService.getBlockMiss(this.numberLastBlock);
    let arrTemp = res.data.info.filter((k) => Number(k.missed_blocks_counter) > 0);
    if (arrTemp?.length > 0) {
      arrTemp.forEach((block) => {
        block.hex_address = toHex(fromBech32(block?.address).data);
      });
      this.arrBlocksMiss = arrTemp?.filter(
        (k) => k.hex_address?.toLowerCase() === this.currentValidatorDetail?.cons_address?.toLowerCase(),
      );
    }
  }

  checkMissed(height) {
    const data = this.arrBlocksMiss?.find((k) => Number(k.index_offset) === Number(height));
    if (data) {
      return true;
    }
    return false;
  }

  async getListDelegator() {
    const res = await this.validatorService.delegators(
      this.pageSize,
      this.pageIndexDelegator * this.pageSize,
      this.currentAddress,
    );
    if (res?.data?.delegation_responses?.length > 0 && res?.data?.pagination?.total) {
      this.lengthDelegator = Number(res?.data?.pagination?.total);

      let data = [];
      res.data?.delegation_responses.forEach((k) => {
        data.push({ delegator_address: k.delegation?.delegator_address, amount: balanceOf(k.balance?.amount) });
      });
      this.dataSourceDelegator = new MatTableDataSource(data);
    }
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
