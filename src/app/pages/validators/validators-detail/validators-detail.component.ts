import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { NUM_BLOCK } from 'src/app/core/constants/common.constant';
import { LIMIT_NUM_SBT } from 'src/app/core/constants/soulbound.constant';
import { STATUS_VALIDATOR } from 'src/app/core/constants/validator.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { BlockService } from 'src/app/core/services/block.service';
import { CommonService } from 'src/app/core/services/common.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { ValidatorService } from 'src/app/core/services/validator.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { Globals, convertDataBlock } from 'src/app/global/global';
import { balanceOf } from '../../../core/utils/common/parsing';
const marked = require('marked');
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
  dataSourceDelegatorMob: any[];

  isLoadingBlock = true;
  isLoadingPower = true;
  lastBlockLoading = true;
  numberLastBlock = 100;
  timerGetUpTime: any;
  timerGetBlock: any;
  nextKey = null;
  currentNextKey = null;
  nextKeyBlock = null;

  nextKeyDelegator = null;
  currentNextKeyDelegator = null;

  isOpenDialog = false;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  timeInterval = this.environmentService.configValue.timeInterval;
  soulboundList = [];
  arrBlockUptime = [];
  arrLastBlock = [];
  isLeftPage = false;
  typeActive = 'BOND_STATUS_BONDED';

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
    this.commonService['listNameTag'] = this.global?.listNameTag;
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
      if (this.pageIndexDelegator === 0) {
        this.currentNextKeyDelegator = null;
        this.getListDelegator(null, isInit);
      }
      if (this.pageIndexPower === 0) {
        this.currentNextKey = null;
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
      this.validatorService.getDataValidator(null).subscribe(
        (res) => {
          if (res.status === 404 || res.validator?.length === 0) {
            this.router.navigate(['/']);
            return;
          }

          const arrActive = res.validator.filter((k) => k.status === this.typeActive);
          const arrInactive = res.validator.filter((k) => k.status !== this.typeActive && !k.jailed);
          const arrJail = res.validator.filter((k) => k.status !== this.typeActive && k.jailed);
          const arrRank = [...arrActive, ...arrInactive, ...arrJail];

          const data = res.validator?.find((k) => k.operator_address === this.currentAddress);
          this.currentValidatorDetail = {
            ...data,
            self_bonded: balanceOf(data?.self_delegation_balance),
            power: balanceOf(data?.tokens),
            identity: data.description?.identity,
            up_time: (NUM_BLOCK - +data?.missed_blocks_counter) / 100,
            title: data?.description?.moniker,
            acc_address: data?.account_address,
            commission: (+data?.commission?.commission_rates?.rate || +data?.commission?.rate || 0)?.toFixed(4),
            details: data?.description?.details,
            percent_power: data?.percent_voting_power?.toFixed(2),
            bonded_height: data?.start_height || 1,
            jailed: data.jailed ? 1 : 0,
            status: data.status === this.typeActive ? this.statusValidator.Active : data?.status,
            rank: arrRank?.findIndex((k) => k.operator_address === this.currentAddress) + 1 || 1,
          };

          const percentSelfBonded =
            (this.currentValidatorDetail.self_delegation_balance / this.currentValidatorDetail.tokens) * 100;
          this.currentValidatorDetail.percent_self_bonded = percentSelfBonded.toFixed(2) + '%';

          if (this.currentValidatorDetail?.consensus_hex_address && isInit) {
            this.getUptime();
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
    let payload = {
      limit: 100,
      address: this.currentAddress,
      nextHeight: null,
    };
    if (nextKeyBlock !== null) {
      payload.nextHeight = nextKeyBlock;
    }
    this.blockService.getDataBlock(payload).subscribe(
      (res) => {
        this.nextKeyBlock = res?.block[res?.block?.length - 1]?.height;
        if (res.block.length > 0) {
          const blocks = convertDataBlock(res);
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
        this.isLoadingBlock = false;
      },
    );
  }

  getBlocksMiss(address = null, lastBlock = []) {
    //check is query last block
    let limit = 100;
    let height = null;
    if (lastBlock?.length > 0) {
      limit = 1;
      height = lastBlock[0]?.height;
    }
    this.validatorService.getUptimeIndexer(address, limit, height).subscribe((res) => {
      this.arrBlockUptime = res?.block?.filter((h) => h.block_signatures.length === 0);
      if (lastBlock?.length === 0) {
        if (this.arrBlockUptime?.length > 0 && lastBlock?.length === 0) {
          this.arrLastBlock?.forEach((element) => {
            if (this.arrBlockUptime?.find((k) => k.height === element.height)) {
              element['isSign'] = false;
            }
          });
        }
      } else {
        lastBlock[0]['isSign'] = this.arrBlockUptime?.find((k) => k.height === lastBlock[0]?.height) ? false : true;
        this.arrLastBlock?.unshift(lastBlock[0]);
        this.arrLastBlock?.pop();
      }
    });
  }

  async getListDelegator(nextKey = null, isInit = true) {
    const res = await this.validatorService.delegator(100, this.currentAddress, nextKey);

    if (res.data?.pagination?.next_key) {
      this.nextKeyDelegator = encodeURIComponent(res.data?.pagination?.next_key);
    }

    let data = [];
    res.data?.delegation_responses.forEach((k) => {
      data.push({ delegator_address: k.delegation?.delegator_address, amount: balanceOf(k.balance?.amount) });
    });

    if (this.dataSourceDelegator.data.length > 0 && isInit) {
      this.dataSourceDelegator.data = [...this.dataSourceDelegator.data, ...data];
    } else {
      this.dataSourceDelegator.data = [...data];
    }

    this.dataSourceDelegatorMob = this.dataSourceDelegator?.data.slice(
      this.pageIndexDelegator * this.pageSize,
      this.pageIndexDelegator * this.pageSize + this.pageSize,
    );

    this.lengthDelegator = Number(this.dataSourceDelegator.data?.length);
  }

  getListPower(nextKey = null, isInit = true): void {
    this.validatorService.validatorsDetailListPower(this.currentAddress, 100, nextKey).subscribe(
      (res) => {
        if (res?.power_event?.length > 0) {
          if (res?.power_event?.length >= 100) {
            this.nextKey = res?.power_event[res?.power_event?.length - 1].id;
          }
          const txs = _.get(res, 'power_event').map((element) => {
            let isStakeMode = false;
            const tx_hash = _.get(element, 'transaction.hash');
            const address = _.get(element, 'validatorDst.operator_address');
            const _type = _.get(element, 'type');
            if (
              _type === 'delegate' ||
              _type === 'create_validator' ||
              (_type === 'redelegate' && address === this.currentAddress)
            ) {
              isStakeMode = true;
            }
            let amount = balanceOf(element.amount) || '0';

            if (amount === 0 && element?.transaction?.data?.length > 0) {
              amount = 'More';
            }

            const height = _.get(element, 'height');
            const timestamp = _.get(element, 'time');

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
        if (nextBlock && this.nextKeyBlock) {
          this.getListBlockWithOperator(this.nextKeyBlock);
        }
        this.pageIndexBlock = page.pageIndex;
        break;
      case 'delegator':
        this.dataSourceDelegatorMob = this.dataSourceDelegator.data.slice(
          page.pageIndex * page.pageSize,
          page.pageIndex * page.pageSize + page.pageSize,
        );
        const nextDelegator = page.length <= (page.pageIndex + 2) * page.pageSize;
        if (nextDelegator && this.nextKeyDelegator && this.currentNextKeyDelegator !== this.nextKeyDelegator) {
          this.getListDelegator(this.nextKeyDelegator);
          this.currentNextKeyDelegator = this.nextKeyDelegator;
        }
        this.pageIndexDelegator = page.pageIndex;
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

  ngAfterViewInit(): void {
    setTimeout(() => {
      const editor = document.getElementById('marked');
      if (editor && this.currentValidatorDetail) {
        editor.innerHTML = marked.parse(this.currentValidatorDetail.details);
        return;
      }
    }, 1000);
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

  getUptime() {
    const payload = {
      limit: 100,
    };
    this.blockService.getDataBlock(payload).subscribe(
      (res) => {
        if (res?.block?.length > 0) {
          this.arrLastBlock = res.block;
          this.getBlocksMiss(this.currentValidatorDetail?.consensus_hex_address);
        }
      },
      () => {},
      () => {
        this.lastBlockLoading = false;
      },
    );
  }

  getLastHeight() {
    const payload = {
      limit: 1,
    };
    this.blockService.getDataBlock(payload).subscribe((res) => {
      if (res?.block?.length > 0 && res?.block[0].height !== this.arrLastBlock[0].height) {
        this.getBlocksMiss(this.currentValidatorDetail?.consensus_hex_address, res?.block);
      }
    });
  }
}
