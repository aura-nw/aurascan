import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
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
  pageIndexDelegator = 0;
  pageIndexPower = 0;
  pageIndexBlock = 0;
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
  numberLastBlock = 100;
  timerGetUpTime: any;
  timerGetBlock: any;
  nextKey = null;
  currentNextKey = null;
  nextKeyBlock = null;
  currentNextKeyBlock = null;
  isOpenDialog = false;

  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  chainInfo = this.environmentService.configValue.chain_info;

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  timeInterval = this.environmentService.configValue.timeInterval;
  soulboundList = [];
  arrBlockUptime = [];
  isLeftPage = false;
  addressBase64 = null;

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
    this.getDetail(true);
    this.timerGetBlock = setInterval(() => {
      this.getLastHeight();
    }, this.timeInterval);

    this.timerGetUpTime = setInterval(() => {
      this.getDetail();
      this.loadData(false);
    }, 5000);
  }

  loadData(isInit = true) {
    if (!this.isLeftPage) {
      if (this.pageIndexBlock === 0) {
        this.getListBlockWithOperator(null, isInit);
      }
      this.getListDelegator();
      if (this.pageIndexPower === 0) {
        this.getListPower(null, isInit);
      }
    }
  }

  ngOnDestroy() {
    this.isLeftPage = true;
    clearInterval(this.timerGetUpTime);
    clearInterval(this.timerGetBlock);
  }

  getDetail(isInit = false): void {
    if (!this.isLeftPage) {
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
          };
          this.addressBase64 = encode.toBase64(encode.fromHex(this.currentValidatorDetail.cons_address));
          this.getDetailValidatorIndexer();
          if (isInit) {
            if (this.currentValidatorDetail?.status === this.statusValidator.Active) {
              this.getLastHeight();
            } else {
              this.getListUpTime();
            }
          }

          this.getTotalSBT(this.currentValidatorDetail.acc_address);
        },
        (error) => {
          this.router.navigate(['/']);
        },
      );
    }
  }

  getListBlockWithOperator(nextKeyBlock = null, isInit = true): void {
    this.blockService.blockWithOperator(100, this.currentAddress, nextKeyBlock).subscribe(
      (res) => {
        const { code, data } = res;
        this.nextKeyBlock = data.nextKey || null;
        if (code === 200) {
          const blocks = convertDataBlock(data);
          if (this.dataSourceBlock.data.length > 0 && isInit) {
            this.dataSourceBlock.data = [...this.dataSourceBlock.data, ...blocks];
          } else {
            this.dataSourceBlock.data = [...blocks];
          }

          this.dataSourceBlockMob = this.dataSourceBlock?.data.slice(
            this.pageIndexBlock * this.pageSize,
            this.pageIndexBlock * this.pageSize + this.pageSize,
          );

          this.lengthBlock = this.dataSourceBlock.data.length;
        }
      },
      () => {},
      () => {
        this.lengthBlockLoading = false;
      },
    );
  }

  async getBlocksMiss(height = null) {
    if (this.arrBlockUptime && this.arrBlockUptime?.length >= 100) {
      return;
    }

    const res = await this.validatorService.getUptimeLCD(height);
    const currentHeight = Number(_.get(res, 'data.block.header.height')) || 0;
    const temp = this.arrBlockUptime.find((k) => k.height === currentHeight);
    if (!temp) {
      const listBlock = _.get(res, 'data.block.last_commit.signatures');
      if (listBlock) {
        let height = Number(_.get(res, 'data.block.header.height')) || 0;
        let isSyncFail = false;
        const address = listBlock.find((k) => k.validator_address === this.addressBase64);
        if (!address) {
          isSyncFail = true;
        }

        let element = [{ height, isSyncFail }];
        if (this.arrBlockUptime && this.arrBlockUptime?.length > 0) {
          this.arrBlockUptime = [...this.arrBlockUptime, ...element];
        }
      }
    }

    this.timerGetUpTime = setInterval(() => {
      this.getBlocksMiss(height - 1);
      clearInterval(this.timerGetUpTime);
    }, 500);
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

  getListPower(nextKey = null, isInit = true): void {
    this.validatorService.validatorsDetailListPower(this.currentAddress, 100, nextKey).subscribe(
      (res) => {
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
              _type === TRANSACTION_TYPE_ENUM.CreateValidator ||
              _type === TRANSACTION_TYPE_ENUM.ExecuteAuthz
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
          if (this.dataSourcePower.data.length > 0 && isInit) {
            this.dataSourcePower.data = [...this.dataSourcePower.data, ...txs];
          } else {
            this.dataSourcePower.data = [...txs];
          }

          this.dataSourcePowerMob = this.dataSourcePower?.data.slice(
            this.pageIndexPower * this.pageSize,
            this.pageIndexPower * this.pageSize + this.pageSize,
          );

          this.lengthPower = this.dataSourcePower.data.length;
        }
      },
      () => {},
      () => {
        this.isLoadingPower = false;
      },
    );
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
        this.pageIndexBlock = page.pageIndex;
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

  async getLastHeight() {
    if (!this.isLeftPage) {
      const res = await this.validatorService.getUptimeLCD();
      const listBlock = _.get(res, 'data.block.last_commit.signatures');
      if (listBlock) {
        let height = Number(_.get(res, 'data.block.header.height')) || 0;
        let isSyncFail = false;
        const address = listBlock.find((k) => k.validator_address === this.addressBase64);
        if (!address) {
          isSyncFail = true;
        }
        let element = [{ height, isSyncFail }];
        if (this.arrBlockUptime && this.arrBlockUptime?.length > 0) {
          const temp = this.arrBlockUptime.find((k) => k.height === height);
          if (!temp) {
            this.arrBlockUptime = [...element, ...this.arrBlockUptime];
          }
        } else {
          this.arrBlockUptime = [...element];
          this.getBlocksMiss(height);
        }
      }
      this.lastBlockLoading = false;
    }
  }

  getDetailValidatorIndexer() {
    this.validatorService.validatorsFromIndexer(this.currentValidatorDetail.operator_address).subscribe((res) => {
      this.currentValidatorDetail['up_time'] =
        (NUM_BLOCK - +res.data.validators[0].val_signing_info.missed_blocks_counter) / 100;
    });
  }

  getListUpTime(): void {
    this.blockService.blocksIndexer(this.numberLastBlock).subscribe(
      (res) => {
        const { code, data } = res;
        if (code === 200) {
          const block = _.get(data, 'blocks').map((element) => {
            const height = _.get(element, 'block.header.height');
            const isSyncFail = true;
            return { height, isSyncFail };
          });
          this.arrBlockUptime = block;
        }
      },
      () => {},
      () => {
        this.lastBlockLoading = false;
      },
    );
  }
}
