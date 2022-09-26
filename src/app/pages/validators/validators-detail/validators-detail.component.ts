import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DecimalPipe } from '@angular/common';
import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { fromBech32, fromHex, toBech32, toHex } from '@cosmjs/encoding';
import { NUMBER_CONVERT, NUM_BLOCK, TIME_OUT_CALL_API } from 'src/app/core/constants/common.constant';
import { TYPE_TRANSACTION } from 'src/app/core/constants/transaction.constant';
import { CodeTransaction, StatusTransaction, TRANSACTION_TYPE_ENUM } from 'src/app/core/constants/transaction.enum';
import { DIALOG_STAKE_MODE, STATUS_VALIDATOR } from 'src/app/core/constants/validator.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { BlockService } from 'src/app/core/services/block.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ValidatorService } from 'src/app/core/services/validator.service';
import { convertDataBlock, getAmount, Globals } from 'src/app/global/global';
import { balanceOf } from '../../../core/utils/common/parsing';
import * as _ from 'lodash';
import { WalletService } from 'src/app/core/services/wallet.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { getFee } from 'src/app/core/utils/signing/fee';
import { ESigningType, SIGNING_MESSAGE_TYPES } from 'src/app/core/constants/wallet.constant';
import { forkJoin } from 'rxjs';
import { AccountService } from 'src/app/core/services/account.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { MappingErrorService } from 'src/app/core/services/mapping-error.service';
import { createSignBroadcast } from 'src/app/core/utils/signing/transaction-manager';
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
  timerGetBlockMiss: any;
  consAddress: string;
  nextKey = null;
  currentNextKey = null;
  nextKeyBlock = null;
  currentNextKeyBlock = null;
  modalReference: any;
  isExceedAmount = false;
  amountFormat = null;
  errorExceedAmount = false;
  dataDelegate = null;
  userAddress = null;
  isHandleStake = false;
  isLoading = false;

  arrayUpTime = new Array(this.numberLastBlock);
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  chainInfo = this.environmentService.configValue.chain_info;

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  prefixConsAdd = this.environmentService.configValue.chain_info.bech32Config.bech32PrefixConsAddr;
  coinMinimalDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;

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
    private walletService: WalletService,
    private modalService: NgbModal,
    private accountService: AccountService,
    private toastr: NgxToastrService,
    private transactionService: TransactionService,
    private mappingErrorService: MappingErrorService,
  ) {}

  ngOnInit(): void {
    this.currentAddress = this.route.snapshot.paramMap.get('id');

    this.walletService.wallet$.subscribe((wallet) => {
      if (wallet) {
        this.dataDelegate = null;
        this.userAddress = wallet.bech32Address;
        this.getDataWallet();
      } else {
        this.userAddress = null;
      }
    });

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
          identity: res?.data?.identity,
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

  getListUpTime(): void {
    this.blockService.blocksIndexer(this.numberLastBlock).subscribe((res) => {
      const { code, data } = res;
      if (code === 200) {
        const block = _.get(data, 'blocks').map((element) => {
          const height = _.get(element, 'block.header.height');
          const block_hash = _.get(element, 'block_id.hash');
          const isMissed = 0;
          return { height, block_hash, isMissed };
        });
        this.arrayUpTime = block;
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
        if (this.dataSourcePower.data.length > 0) {
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

  viewPopupDetail(staticDataModal: any) {
    // this.currentValidatorDialog = address;
    const view = async () => {
      const account = this.walletService.getAccount();
      if (account && account.bech32Address) {
        // this.amountFormat = null;
        // this.isHandleStake = false;
        // this.getValidatorDetail(address, staticDataModal);
        this.modalReference = this.modalService.open(staticDataModal, {
          keyboard: false,
          centered: true,
          size: 'lg',
          windowClass: 'modal-holder validator-modal',
        });
      }
    };
    view();
    // this.dataDelegate = this.dataDelegate || {};
    // this.isClaimRewardLoading = false;
  }

  //Get data for wallet info and list staking
  getDataWallet() {
    if (this.userAddress) {
      forkJoin({
        dataWallet: this.accountService.getAccountDetail(this.userAddress),
        listDelegator: this.validatorService.validatorsDetailWallet(this.userAddress),
      }).subscribe(({ dataWallet, listDelegator }) => {
        if (dataWallet) {
          this.dataDelegate = {
            ...this.dataDelegate,
            delegableVesting: dataWallet?.data?.delegable_vesting,
            delegatedToken: dataWallet?.data?.delegated,
            availableToken: dataWallet?.data?.available,
            stakingToken: dataWallet?.data?.stake_reward,
            historyTotalReward: listDelegator?.data?.claim_reward / NUMBER_CONVERT || 0,
            identity: listDelegator?.data?.identity,
            dialogMode: DIALOG_STAKE_MODE.Delegate,
          };
        }

        // if (listDelegator) {
        //   this.listStakingValidator = listDelegator?.data?.delegations;

        //   if (this.currentValidatorDialog) {
        //     this.dataDelegate.validatorDetail = this.listStakingValidator?.find(
        //       (f) => f.validator_address === this.currentValidatorDialog,
        //     );
        //   }
        //   if (listDelegator?.data?.delegations.length > 0) {
        //     listDelegator?.data?.delegations.forEach((f) => {
        //       f.identity = f.identity;
        //       f.amount_staked = f.amount_staked / NUMBER_CONVERT;
        //       f.pending_reward = f.pending_reward / NUMBER_CONVERT;
        //       f.reward = f.reward / NUMBER_CONVERT;
        //     });
        //     //check amount staked > 0
        //     this.arrayDelegate = listDelegator?.data?.delegations.filter((x) => x.amount_staked > 0);
        //     dataInfoWallet['arrayDelegate'] = JSON.stringify(this.arrayDelegate);
        //   } else {
        //     this.arrayDelegate = null;
        //     this.lstUndelegate = null;
        //   }
        // }

        // if (listUnDelegator) {
        //   this.lstUndelegate = [];
        //   const now = new Date();
        //   listUnDelegator.data.account_unbonding.forEach((data) => {
        //     data.entries.forEach((f) => {
        //       f['validator_identity'] = data.validator_description.identity;
        //       f.balance = f.balance / NUMBER_CONVERT;
        //       f.validator_address = data.validator_address;
        //       f.validator_name = this.lstValidatorOrigin.find(
        //         (i) => i.operator_address === f.validator_address,
        //       )?.title;
        //       let timeConvert = new Date(f.completion_time);
        //       if (now < timeConvert) {
        //         this.lstUndelegate.push(f);
        //       }
        //     });
        //   });

        //   this.lstUndelegate = this.lstUndelegate.sort((a, b) => {
        //     return this.compare(a.completion_time, b.completion_time, true);
        //   });
        // }
      });
    }
  }

  resetCheck() {
    this.isExceedAmount = false;
    this.errorExceedAmount = false;
  }

  getMaxToken(): void {
    //check amout for high fee
    let amountCheck = (
      Number(this.currentValidatorDetail.availableToken) +
      Number(this.currentValidatorDetail.delegableVesting) -
      (Number(getFee(SIGNING_MESSAGE_TYPES.STAKE)) * this.chainInfo.gasPriceStep.high) / NUMBER_CONVERT
    ).toFixed(6);
    if (Number(amountCheck) < 0) {
      this.isExceedAmount = true;
      this.errorExceedAmount = true;
      amountCheck = '0';
    }
    this.amountFormat = amountCheck || 0;
  }

  closeDialog(modal) {
    modal.close('Close click');
    // this.scrollToTop();
  }

  handleStaking() {
    this.checkAmountDelegate();
    if (!this.isExceedAmount && this.amountFormat > 0) {
      const executeStaking = async () => {
        this.isLoading = true;
        const { hash, error } = await createSignBroadcast({
          messageType: SIGNING_MESSAGE_TYPES.STAKE,
          message: {
            to: [this.currentValidatorDetail?.operator_address],
            amount: {
              amount: (this.amountFormat * Math.pow(10, 6)).toFixed(0),
              denom: this.coinMinimalDenom,
            },
          },
          senderAddress: this.userAddress,
          network: this.chainInfo,
          signingType: ESigningType.Keplr,
          chainId: this.walletService.chainId,
        });

        // this.modalReference.close();
        this.checkStatusExecuteBlock(hash, error, '');
      };

      executeStaking();
    }
  }

  checkAmountDelegate(): void {
    let amountCheck;
    amountCheck = (
      +this.dataDelegate.availableToken +
        +this.dataDelegate.delegableVesting -
        (Number(getFee(SIGNING_MESSAGE_TYPES.STAKE)) * this.chainInfo.gasPriceStep.high) / NUMBER_CONVERT || 0
    ).toFixed(6);
    this.isExceedAmount = false;
    if (this.amountFormat > amountCheck) {
      this.isExceedAmount = true;
    } else {
      this.isHandleStake = true;
    }
  }

  checkStatusExecuteBlock(hash, error, msg) {
    if (error) {
      if (error != 'Request rejected') {
        this.toastr.error(error);
      }
      this.resetData();
    } else {
      setTimeout(() => {
        this.checkDetailTx(hash, msg);
        this.resetData();
      }, TIME_OUT_CALL_API);
    }
  }

  resetData() {
    this.isLoading = false;
    this.modalReference?.close();
    this.isHandleStake = false;
  }

  async checkDetailTx(id, message) {
    const res = await this.transactionService.txsDetailLcd(id);
    let numberCode = res?.data?.tx_response?.code;
    message = res?.data?.tx_response?.raw_log || message;
    message = this.mappingErrorService.checkMappingError(message, numberCode);
    if (numberCode !== undefined) {
      if (!!!numberCode && numberCode === CodeTransaction.Success) {
        // setTimeout(() => {
        //   this.getDataWallet();
        // }, TIME_OUT_CALL_API);
        this.toastr.success(message);
      } else {
        this.toastr.error(message);
      }
    }
  }
}
