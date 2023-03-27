import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DecimalPipe } from '@angular/common';
import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { fromBase64 } from '@cosmjs/encoding';
import * as _ from 'lodash';
import { NUM_BLOCK } from 'src/app/core/constants/common.constant';
import { LIMIT_NUM_SBT } from 'src/app/core/constants/soulbound.constant';
import { TRANSACTION_TYPE_ENUM } from 'src/app/core/constants/transaction.enum';
import { STATUS_VALIDATOR } from 'src/app/core/constants/validator.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { BlockService } from 'src/app/core/services/block.service';
import { CommonService } from 'src/app/core/services/common.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { ValidatorService } from 'src/app/core/services/validator.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { convertDataBlock, getAmount, Globals } from 'src/app/global/global';
import { balanceOf } from '../../../core/utils/common/parsing';
import { encodeSecp256k1Pubkey, pubkeyToAddress, serializeSignDoc } from '@cosmjs/amino';
const marked = require('marked');
const encode = require('@cosmjs/encoding');
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
  dataSourcePowerMob: any[];
  dataSourceBlockMob: any[];

  lengthBlockLoading = true;
  isLoadingPower = true;
  lastBlockLoading = true;
  blocksMissDetail: any;
  numberLastBlock = 100;
  timerGetUpTime: any;
  timeGetLastBlock: any;
  nextKey = null;
  currentNextKey = null;
  nextKeyBlock = null;
  currentNextKeyBlock = null;
  isOpenDialog = false;
  totalSBT = 0;

  arrayUpTime = new Array(this.numberLastBlock);
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  chainInfo = this.environmentService.configValue.chain_info;

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  prefixConsAdd = this.environmentService.configValue.chain_info.bech32Config.bech32PrefixConsAddr;
  coinMinimalDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;
  soulboundList = [];
  arrBlockUptime = [];
  arrLastHeight = 0;
  lastedHeight = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private validatorService: ValidatorService,
    private blockService: BlockService,
    public commonService: CommonService,
    public global: Globals,
    private layout: BreakpointObserver,
    private environmentService: EnvironmentService,
    private soulboundService: SoulboundService,
    private walletService: WalletService,
  ) {}

  ngOnInit(): void {
    this.currentAddress = this.route.snapshot.paramMap.get('id');
    this.loadData();
    // this.timerGetUpTime = setInterval(() => {
    //   this.getListUpTime();
    // }, 30000);
    this.timeGetLastBlock = setInterval(() => {
      this.getLastBlock();
    }, 500);
  }

  loadData() {
    this.getDetail();
    this.getListBlockWithOperator();
    this.getListDelegator();
    this.getListPower();
  }

  ngOnDestroy() {
    clearInterval(this.timerGetUpTime);
    clearInterval(this.timeGetLastBlock);
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
          identity: res?.data?.identity,
          up_time: 100,
        };

        this.getTotalSBT(this.currentValidatorDetail.acc_address);
        this.getBlocksMiss();
      },
      (error) => {
        this.router.navigate(['/']);
      },
    );
  }

  getListBlockWithOperator(nextKeyBlock = null): void {
    this.blockService.blockWithOperator(100, this.currentAddress, nextKeyBlock).subscribe((res) => {
      const { code, data } = res;
      this.nextKeyBlock = data.nextKey || null;
      if (code === 200) {
        const blocks = convertDataBlock(data);
        if (this.dataSourceBlock.data.length > 0) {
          this.dataSourceBlock.data = [...this.dataSourceBlock.data, ...blocks];
        } else {
          this.dataSourceBlock.data = [...blocks];
        }

        this.dataSourceBlockMob = this.dataSourceBlock?.data.slice(
          this.pageIndexPower * this.pageSize,
          this.pageIndexPower * this.pageSize + this.pageSize,
        );

        this.lengthBlock = this.dataSourceBlock.data.length;
        this.isLoadingPower = false;
      }
      this.lengthBlockLoading = false;
    });
  }

  // getListUpTime(): void {
  //   this.blockService.blocksIndexer(this.numberLastBlock).subscribe((res) => {
  //     const { code, data } = res;
  //     if (code === 200) {
  //       const block = _.get(data, 'blocks').map((element) => {
  //         const height = _.get(element, 'block.header.height');
  //         this.lastHeight = height;
  //         const block_hash = _.get(element, 'block_id.hash');
  //         const isMissed = 0;
  //         return { height, block_hash, isMissed };
  //       });

  //       this.arrayUpTime = block;
  //       // console.log(this.arrayUpTime);
  //     }
  //     this.lastBlockLoading = false;
  //   });
  // }

  async getBlocksMiss(height = null) {
    //check is active validator
    if (this.currentValidatorDetail?.status !== this.statusValidator.Active) {
      return;
    }

    // this.arrBlockUptime && this.arrBlockUptime[0] < this.global?.dataHeader?.block_height
    // console.log(this.arrBlockUptime[0]);
    console.log('height', height);
    console.log('lastedHeight', this.lastedHeight);

    if (height + 1 < this.lastedHeight) {
      height = this.lastedHeight;
    }
    const res = await this.validatorService.getUptimeLCD(height);
    const listBlock = _.get(res, 'data.block.last_commit.signatures');
    let currentHeight;
    if (listBlock) {
      listBlock.forEach((temp) => {
        let address = encode.toHex(encode.fromBase64(temp.validator_address));
        if (address === this.currentValidatorDetail.cons_address.toLowerCase()) {
          this.arrLastHeight = _.get(res, 'data.block.header.height');
          height = this.arrLastHeight || 0;
          temp['height'] = this.arrLastHeight || 0;
          currentHeight = _.get(res, 'data.block.header.height');
          let element = [temp];
          // console.log('element ne', element);

          // if (this.arrBlockUptime?.length < 10) {
          if (this.arrBlockUptime && this.arrBlockUptime?.length > 0) {
            // const firstItem = this.arrBlockUptime[0];
            // const lastItem = this.arrBlockUptime[this.arrBlockUptime.length - 1];
            let temp = this.arrBlockUptime.find((k) => k.height === currentHeight);
            if (!temp) {
              console.log('current element', element);
              console.log('arrBlockUptime', this.arrBlockUptime);
              // this.arrBlockUptime[1] = element;
              // .splice(1, 0, element);
              console.log(this.arrBlockUptime);
              // this.arrBlockUptime = [...element, ...this.arrBlockUptime];
              if (this.arrBlockUptime.length > 1) {
                // this.arrBlockUptime[1] = element[0];
                // const isLargeNumber = (element) => element > 13;
                const index = this.arrBlockUptime.findIndex((element) => element.height < currentHeight);
                console.log(index);

                this.arrBlockUptime.splice(index, 0, element[0]);
              } else {
                this.arrBlockUptime = [...this.arrBlockUptime, ...element];
              }

              currentHeight = this.arrBlockUptime[this.arrBlockUptime.length - 1]?.height;

              // if (+firstItem?.height < +currentHeight) {
              //   this.arrBlockUptime = [...element, ...this.arrBlockUptime];
              //   currentHeight = +firstItem?.height;
              // } else if (+lastItem?.height < +currentHeight) {
              //   this.arrBlockUptime = [...this.arrBlockUptime, ...element];
              //   currentHeight = +lastItem?.height;
              // }
            }
          } else {
            this.arrBlockUptime = [...element];
          }
          // else {
          //   this.getBlocksMiss(this.lastHeight - 1);
          // }
          // }
        }
        // console.log(this.arrBlockUptime);
      });
      // const resNew = await this.validatorService.getUptimeLCD(+this.lastHeight - 1);
      // console.log('res2', resNew);
    }

    let timerGetUpTime = setInterval(() => {
      this.getBlocksMiss(height - 1);
      clearInterval(timerGetUpTime);
    }, 500);

    this.lastBlockLoading = false;
    // this.getListUpTime();
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
      this.dataSourceDelegator.data = data;
    }
  }

  getListPower(nextKey = null): void {
    if (!this.dataSourcePower.data) {
      this.isLoadingPower = true;
    }
    this.validatorService.validatorsDetailListPower(this.currentAddress, 100, nextKey).subscribe((res) => {
      const { code, data } = res;
      this.nextKey = data.nextKey || null;

      if (code === 200) {
        const txs = _.get(data, 'transactions').map((element) => {
          let isStakeMode = false;
          const tx_hash = _.get(element, 'tx_response.txhash');
          const address = _.get(element, 'tx_response.tx.body.messages[0].validator_dst_address');
          const _type = _.get(element, 'tx_response.tx.body.messages[0].@type');
          if (
            _type === TRANSACTION_TYPE_ENUM.Delegate ||
            (_type === TRANSACTION_TYPE_ENUM.Redelegate && address === this.currentAddress) ||
            _type === TRANSACTION_TYPE_ENUM.CreateValidator
          ) {
            isStakeMode = true;
          }
          const amount = getAmount(
            _.get(element, 'tx_response.tx.body.messages'),
            _type,
            _.get(element, 'tx_response.tx.body.raw_log'),
          );
          const height = _.get(element, 'tx_response.height');
          const timestamp = _.get(element, 'tx_response.timestamp');

          return { tx_hash, amount, isStakeMode, height, timestamp };
        });
        if (this.dataSourcePower.data.length > 0 && this.pageIndexPower != 0) {
          this.dataSourcePower.data = [...this.dataSourcePower.data, ...txs];
        } else {
          this.dataSourcePower.data = [...txs];
        }

        this.dataSourcePowerMob = this.dataSourcePower?.data.slice(
          this.pageIndexPower * this.pageSize,
          this.pageIndexPower * this.pageSize + this.pageSize,
        );

        this.lengthPower = this.dataSourcePower.data.length;
        this.isLoadingPower = false;
      }
    });
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
        this.dataSourceBlockMob = this.dataSourceBlock.data.slice(
          page.pageIndex * page.pageSize,
          page.pageIndex * page.pageSize + page.pageSize,
        );
        const nextBlock = page.length <= (page.pageIndex + 2) * page.pageSize;
        if (nextBlock && this.nextKeyBlock && this.currentNextKeyBlock !== this.nextKeyBlock) {
          this.getListBlockWithOperator(this.nextKeyBlock);
          this.currentNextKeyBlock = this.nextKeyBlock;
        }
        this.pageIndexPower = page.pageIndex;
        break;
      case 'delegator':
        this.pageIndexDelegator = page.pageIndex;
        this.getListDelegator();
        break;
      case 'power':
        this.dataSourcePowerMob = this.dataSourcePower.data.slice(
          page.pageIndex * page.pageSize,
          page.pageIndex * page.pageSize + page.pageSize,
        );
        const { length, pageIndex, pageSize } = page;
        const next = length <= (pageIndex + 2) * pageSize;
        if (next && this.nextKey && this.currentNextKey !== this.nextKey) {
          this.getListPower(this.nextKey);
          this.currentNextKey = this.nextKey;
        }
        this.pageIndexPower = page.pageIndex;
        break;
      default:
        break;
    }
  }

  getValidatorAvatar(validatorAddress: string): string {
    return this.validatorService.getValidatorAvatar(validatorAddress);
  }

  ngAfterViewChecked(): void {
    const editor = document.getElementById('marked');
    if (editor && this.currentValidatorDetail) {
      editor.innerHTML = marked.parse(this.currentValidatorDetail.details);
      return;
    }
  }

  openDialog() {
    const view = async () => {
      const account = this.walletService.getAccount();
      if (account && account.bech32Address) {
        this.isOpenDialog = true;
      }
    };
    view();
  }

  updateStatus(event) {
    this.isOpenDialog = event;
  }

  getTotalSBT(address) {
    const payload = {
      receiverAddress: address,
      limit: LIMIT_NUM_SBT,
    };

    this.soulboundService.getSBTPick(payload).subscribe((res) => {
      this.soulboundList = res.data.filter((k) => k.picked);
    });
  }

  getLastBlock(): void {
    this.blockService.blocksIndexer(1).subscribe((res) => {
      this.lastedHeight = _.get(res, 'data.blocks[0].block.header.height') || this.global?.dataHeader?.block_height;
      console.log('lastedHeight', this.lastedHeight);
      
    });
  }
}
