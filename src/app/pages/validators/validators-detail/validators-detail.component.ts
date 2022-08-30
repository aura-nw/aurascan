import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DecimalPipe } from '@angular/common';
import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { fromBech32, fromHex, toBech32, toHex } from '@cosmjs/encoding';
import { NUM_BLOCK } from 'src/app/core/constants/common.constant';
import { TYPE_TRANSACTION } from 'src/app/core/constants/transaction.constant';
import { CodeTransaction, StatusTransaction, TRANSACTION_TYPE_ENUM } from 'src/app/core/constants/transaction.enum';
import { STATUS_VALIDATOR } from 'src/app/core/constants/validator.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { BlockService } from 'src/app/core/services/block.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ValidatorService } from 'src/app/core/services/validator.service';
import { getAmount, Globals } from 'src/app/global/global';
import { balanceOf } from '../../../core/utils/common/parsing';
import * as _ from 'lodash';
const marked = require('marked');

@Component({
  selector: 'app-validators-detail',
  templateUrl: './validators-detail.component.html',
  styleUrls: ['./validators-detail.component.scss'],
})
export class ValidatorsDetailComponent implements OnInit, AfterViewChecked {
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
  blocksMissDetail: any;
  numberLastBlock = 100;
  timerGetUpTime: any;
  timerGetBlockMiss: any;
  consAddress: string;

  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  prefixConsAdd = this.environmentService.configValue.chain_info.bech32Config.bech32PrefixConsAddr;
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
    this.getListDelegator();
    this.getListPower();
    this.timerGetUpTime = setInterval(() => {
      this.getListUpTime();
    }, 30000);
    this.timerGetBlockMiss = setInterval(() => {
      this.getBlocksMiss(this.consAddress);
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
          up_time: 100,
        };

        //convert to consAddress LCD and find block miss
        if (this.currentValidatorDetail?.cons_address) {
          this.consAddress = toBech32(this.prefixConsAdd, fromHex(this.currentValidatorDetail?.cons_address));
          this.getBlocksMiss(this.consAddress);
        }
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

  async getBlocksMiss(consAddress) {
    //check is active validator
    if (this.currentValidatorDetail?.status === this.statusValidator.Active) {
      const res = await this.blockService.getBlockMissByConsAddress(consAddress);

      //cal percent if exit arr block miss
      if (Number(res.data?.val_signing_info?.missed_blocks_counter) > 0) {
        this.blocksMissDetail = res.data?.val_signing_info;
        this.calculatorUpTime();
      }
    }

    this.getListUpTime();
  }

  calculatorUpTime() {
    let percent = '100.00';
    if (this.blocksMissDetail) {
      percent = (100 - Number(this.blocksMissDetail['missed_blocks_counter']) / NUM_BLOCK)
        ?.toString()
        .match(/^-?\d+(?:\.\d{0,2})?/)[0];
    }
    this.currentValidatorDetail.up_time = percent;
  }

  checkMissed(height) {
    if (Number(this.blocksMissDetail?.index_offset) === Number(height)) {
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
    this.lengthPowerLoading = true;
    this.validatorService
      .validatorsDetailListPowerIndexer(this.pageSize, this.pageIndexPower * this.pageSize, this.currentAddress)
      .subscribe((res) => {
        const { code, data } = res;
        if (code === 200) {
          const txs = _.get(data, 'transactions').map((element) => {
            let isStakeMode = false;

            const tx_hash = _.get(element, 'tx_response.txhash');

            const address = _.get(element, 'tx.body.messages[0].validator_dst_address');

            const _type = _.get(element, 'tx.body.messages[0].@type');
            if (
              _type === TRANSACTION_TYPE_ENUM.Delegate ||
              (_type === TRANSACTION_TYPE_ENUM.Redelegate && address === this.currentAddress) ||
              _type === TRANSACTION_TYPE_ENUM.CreateValidator
            ) {
              isStakeMode = true;
            }
            const amount = getAmount(_.get(element, 'tx.body.messages'), _type, _.get(element, 'tx.body.raw_log'));
            const height = _.get(element, 'tx_response.height');
            const timestamp = _.get(element, 'tx_response.timestamp');

            return { tx_hash, amount, isStakeMode, height, timestamp };
          });
          this.dataSourcePower.data = [];
          if (this.dataSourcePower.data.length > 0) {
            this.dataSourcePower.data = [...this.dataSourcePower.data, ...txs];
          } else {
            this.dataSourcePower.data = [...txs];
          }
          this.lengthPower = res.data?.count;
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
  ngAfterViewChecked(): void {
    const editor = document.getElementById('marked');
    if (editor) {
      editor.innerHTML = marked.parse(this.currentValidatorDetail.details);
      return;
    }
  }
}
