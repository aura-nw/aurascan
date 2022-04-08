import { Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AccountService } from '../../../app/core/services/account.service';
import { PAGE_SIZE_OPTIONS } from '../../../app/core/constants/common.constant';
import { CommonDataDto, ResponseDto, TableTemplate } from '../../../app/core/models/common.model';
import { CommonService } from '../../../app/core/services/common.service';
import { ValidatorService } from '../../../app/core/services/validator.service';
import { Globals } from '../../../app/global/global';
import { WalletService } from '../../../app/core/services/wallet.service';
import { ChainsInfo, KEPLR_ERRORS, SIGNING_MESSAGE_TYPES } from 'src/app/core/constants/wallet.constant';
import { getSigner } from '../../core/utils/signing/signer';
import { DeliverTxResponse, SigningStargateClient } from '@cosmjs/stargate';
import { messageCreators } from '../../core/utils/signing/messages';
import { createSignBroadcast } from '../../core/utils/signing/transaction-manager';

@Component({
  selector: 'app-validators',
  templateUrl: './validators.component.html',
  styleUrls: ['./validators.component.scss'],
})
export class ValidatorsComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  templates: Array<TableTemplate> = [
    { matColumnDef: 'rank', headerCellDef: 'Rank' },
    { matColumnDef: 'title', headerCellDef: 'Validator' },
    { matColumnDef: 'power', headerCellDef: 'Voting Power' },
    { matColumnDef: 'percent_power', headerCellDef: 'Cumulative Share %' },
    { matColumnDef: 'participation', headerCellDef: 'Participation' },
    { matColumnDef: 'up_time', headerCellDef: 'Uptime' },
    { matColumnDef: 'commission', headerCellDef: 'Commission' },
    { matColumnDef: 'action', headerCellDef: 'Action' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any>;
  dataSourceBk: MatTableDataSource<any>;
  length;
  pageIndex = 0;
  pageSizeOptions = PAGE_SIZE_OPTIONS;
  isActive = true;
  textSearch = '';
  rawData;
  sortedData;
  dataHeader = new CommonDataDto();
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  isPartiDown = true;
  dataModal;
  clicked = false;
  delegatedToken = 0;
  availableToken = 0;
  totalDelegator = 0;
  amountFormat;
  isExceedAmount = false;
  userAddress = 'aura1992zh99p5qdcgfs27hnysgy2sr2vupu39a72r5';
  validatorAddress;

  constructor(
    private validatorService: ValidatorService,
    public globals: Globals,
    private modalService: NgbModal,
    private accountService: AccountService,
    private commonService: CommonService,
    private walletService: WalletService,
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Validators' }, { label: 'List', active: true }];
    this.getList();
    this.getAccountDetail();

    setInterval(() => {
      this.getList();
    }, 20000);
  }

  changePage(page: PageEvent): void {
    this.dataSource = null;
    this.pageIndex = page.pageIndex;
    this.getList();
  }

  getList(): void {
    this.validatorService.validators().subscribe((res: ResponseDto) => {
      this.rawData = res.data;
      res.data.forEach((val) => {
        if (val.target_count > 0 && val.vote_count / val.target_count > 0.5) {
          this.isPartiDown = false;
        }
        val.participation = val.vote_count + '/ ' + val.target_count;
      });

      let dataFilter = res.data.filter((event) => event.status_validator === this.isActive);
      //sort and calculator cumulative
      let dataSort = this.calculatorCumulative(dataFilter);
      this.dataSource = new MatTableDataSource(dataSort);
      this.dataSourceBk = this.dataSource;
      this.dataSource.sort = this.sort;
      this.searchValidator();
    });
  }

  changeType(type: boolean): void {
    this.isActive = type;
    let data = this.rawData.filter((event) => event.status_validator === this.isActive);
    this.dataSource = new MatTableDataSource(data);
    this.dataSourceBk = this.dataSource;
    this.searchValidator();
  }

  sortData(sort: Sort) {
    let data = this.rawData.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'title':
          return this.compare(a.title, b.title, isAsc);
        case 'power':
          return this.compare(a.power, b.power, isAsc);
        case 'participation':
          return this.compare(a.participation, b.participation, isAsc);
        case 'uptime':
          return this.compare(a.uptime, b.uptime, isAsc);
        case 'commission':
          return this.compare(a.commission, b.commission, isAsc);
        default:
          return 0;
      }
    });

    let dataFilter = this.sortedData.filter((event) => event.status_validator === this.isActive);
    //sort and calculator cumulative
    let dataSort = this.calculatorCumulative(dataFilter);
    this.dataSource = new MatTableDataSource(dataSort);
    this.dataSource.sort = this.sort;
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  calculatorCumulative(dataFilter) {
    for (const key in dataFilter) {
      const dataOrigin = dataFilter[key];
      const dataBefore = dataFilter[parseInt(key) - 1];
      if (dataOrigin?.title) {
        if (parseInt(key) === 0) {
          dataOrigin.cumulative_share_before = '0.00';
          dataOrigin.cumulative_share = dataOrigin.percent_power;
          dataOrigin.cumulative_share_after = dataOrigin.percent_power;
        } else {
          dataOrigin.cumulative_share_before = dataBefore?.cumulative_share_after || 0;
          dataOrigin.cumulative_share = dataOrigin?.percent_power;
          const cumulative = parseFloat(dataOrigin?.cumulative_share_before) + parseFloat(dataOrigin?.percent_power);
          dataOrigin.cumulative_share_after = cumulative.toFixed(2);
        }
        dataFilter.cumulative_share_before = dataOrigin.cumulative_share_before;
        dataFilter.cumulative_share = dataOrigin.cumulative_share;
        dataFilter.cumulative_share_after = dataOrigin.cumulative_share_after;
      }
    }
    return dataFilter;
  }

  searchValidator(): void {
    if (this.textSearch.length > 0) {
      const data = this.dataSourceBk.data.filter(
        (f) =>
          f.title.toLowerCase().indexOf(this.textSearch.toLowerCase().trim()) > -1 &&
          f.status_validator === this.isActive,
      );
      this.dataSource = this.dataSourceBk;
      this.dataSource = new MatTableDataSource(data);
    } else {
      this.dataSource = this.dataSourceBk;
    }
  }

  viewDelegate(staticDataModal: any, address) {
    this.clicked = true;
    this.validatorAddress = address.operator_address;

    console.log(this.walletService.wallet);
    this.getDetail(this.validatorAddress, staticDataModal);
  }

  getDetail(address, staticDataModal): void {
    this.validatorService.validatorsDetail(address).subscribe(
      (res) => {
        this.dataModal = res.data;
        this.getListDelegators();
        this.modalService.open(staticDataModal, {
          backdrop: 'static',
          keyboard: false,
          centered: true,
          windowClass: 'modal-holder',
        });
      },
      (error) => {},
    );
  }

  getAccountDetail(): void {
    this.accountService.getAccoutDetail(this.userAddress).subscribe((res) => {
      this.delegatedToken = res?.data?.delegated;
      this.availableToken = res?.data?.available;
    });
  }

  getListDelegators(): void {
    this.commonService.delegators(5, 0, this.dataModal.operator_address).subscribe((res) => {
      this.totalDelegator = res?.meta?.count;
    });
  }

  checkAmountStaking(): void {
    // this.amountFormat = val?.target?.value || 0;
    this.isExceedAmount = false;
    if (this.amountFormat > this.availableToken) {
      this.isExceedAmount = true;
    }
  }

  resetCheck() {
    this.isExceedAmount = false;
  }

  handleStaking() {
    this.checkAmountStaking();
    if (!this.isExceedAmount) {
      // let dataStake = JSON.parse(`{
      //   "messageType": "StakeTx",
      //   "message": {
      //     "delegatorAddress": [this.userAddress],
      //     "validatorAddress": [this.validatorAddress],
      //     "amount": 4
      //   },
      //   "senderAddress": this.userAddress,
      //   "network": {
      //     "id": "aura-testnet",
      //     "name": "Aura",
      //     "description": "Cosmos is a network of independent parallel blockchains, powered by BFT consensus algorithms like Tendermint.",
      //     "logo": "logo.svg",
      //     "website": "https://aura.network",
      //     "api": "https://rpc-testnet.aura.network",
      //     "rpc": "https://rpc-testnet.aura.network/",
      //     "stakingDenom": "AURA",
      //     "coinLookup": [
      //       {
      //         "viewDenom": "AURA",
      //         "chainDenom": "uaura",
      //         "chainToViewConversionFactor": 0.000001,
      //         "icon": "currencies/muon.png"
      //       }
      //     ],
      //   },
      //   "signingType": "keplr",
      //   "chainId": "aura-testnet"
      // }`);

      const xxx = async () => {
        const { hash, error } = await createSignBroadcast({
          messageType: SIGNING_MESSAGE_TYPES.STAKE,
          message: {
            to: ['auravaloper1jawldvd82kkw736c96s4jhcg8wz2ewwrnauhna'],
            amount: {
              amount: 20 * Math.pow(10, 6),
              denom: 'uaura',
            },
          },
          senderAddress: this.userAddress,
          network: ChainsInfo['aura-devnet'],
          signingType: 'keplr',
          chainId: 'aura-devnet',
        });

        let element: HTMLElement = document.getElementById('dialog-close-btn') as HTMLElement;
        element.click();
        this.getAccountDetail();

        console.log({ hash, error } )
      };
      xxx();
    }
  }

  closeDialog(modal) {
    this.clicked = false;
    modal.close('Close click');
  }

  // async createSignBroadcast({ messageType, message, senderAddress, network, signingType, chainId }): Promise<any> {
  //   let error: KEPLR_ERRORS;
  //   let broadcastResult: DeliverTxResponse;
  //   if (signingType === 'extension') {
  //   } else {
  //     const signer = await getSigner(signingType, chainId);

  //     const client = await SigningStargateClient.connectWithSigner(network.rpc, signer);

  //     // success
  //     const messagesSend = messageCreators[messageType](senderAddress, message, network);

  //     const fee: any = {
  //       amount: [
  //         {
  //           denom: 'uaura',
  //           amount: '1',
  //         },
  //       ],
  //       gas: '200000',
  //     };

  //     try {
  //       console.log(messagesSend);

  //       broadcastResult = await client.signAndBroadcast(senderAddress, [messagesSend], fee);

  //       this.assertIsBroadcastTxSuccess(broadcastResult);
  //     } catch (e: any) {
  //       error = e.message;
  //     }

  //     return {
  //       hash: broadcastResult?.transactionHash || null,
  //       error,
  //     };
  //   }
  // }

  // assertIsBroadcastTxSuccess(res): DeliverTxResponse {
  //   if (!res) throw new Error(`Error sending transaction`);
  //   if (Array.isArray(res)) {
  //     if (res.length === 0) throw new Error(`Error sending transaction`);

  //     res.forEach(this.assertIsBroadcastTxSuccess);
  //   }

  //   if (res.error) {
  //     throw new Error(res.error);
  //   }

  //   // Sometimes we get back failed transactions, which shows only by them having a `code` property
  //   if (res.code) {
  //     const message = res.raw_log?.message ? JSON.parse(res.raw_log).message : res.raw_log;
  //     throw new Error(message);
  //   }

  //   if (!res.transactionHash) {
  //     const message = res.message;
  //     throw new Error(message);
  //   }

  //   return res;
  // }
}
