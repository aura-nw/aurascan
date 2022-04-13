import { Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AccountService } from '../../../app/core/services/account.service';
import { NUMBER_CONVERT, PAGE_SIZE_OPTIONS } from '../../../app/core/constants/common.constant';
import { CommonDataDto, ResponseDto, TableTemplate } from '../../../app/core/models/common.model';
import { CommonService } from '../../../app/core/services/common.service';
import { ValidatorService } from '../../../app/core/services/validator.service';
import { Globals } from '../../../app/global/global';
import { WalletService } from '../../../app/core/services/wallet.service';
import { ChainsInfo, LAST_USED_PROVIDER, SIGNING_MESSAGE_TYPES } from 'src/app/core/constants/wallet.constant';
import { createSignBroadcast } from '../../core/utils/signing/transaction-manager';
import session from '../../core/utils/storage/session';
import { WalletStorage } from '../../../app/core/models/wallet';
import { TYPE_STAKING } from '../../../app/core/constants/validator.constant';
import { STAKING_TYPE_ENUM } from '../../../app/core/constants/validator.enum';
import { forkJoin } from 'rxjs';

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
    { matColumnDef: 'action', headerCellDef: '' }
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any>;
  dataSourceBk: MatTableDataSource<any>;
  length;
  pageIndex = 0;

  templatesWallet: Array<TableTemplate> = [
    { matColumnDef: 'validator_name', headerCellDef: 'Name' },
    { matColumnDef: 'amount_staked', headerCellDef: 'Amount Staked' },
    { matColumnDef: 'pending_reward', headerCellDef: 'Pending Reward' },
    { matColumnDef: 'action', headerCellDef: '' }
  ];
  displayedColumnsWallet: string[] = this.templatesWallet.map((dta) => dta.matColumnDef);
  dataSourceWallet: MatTableDataSource<any>;
  lengthWallet = 0;
  
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
  stakingToken = 0;
  totalDelegator = 0;
  claimReward = 0;
  amountFormat;
  isExceedAmount = false;
  userAddress;
  validatorAddress;
  selected = STAKING_TYPE_ENUM.Undelegate;
  listTypeStake = TYPE_STAKING;
  searchNullData = false;

  constructor(
    private validatorService: ValidatorService,
    public globals: Globals,
    private modalService: NgbModal,
    private accountService: AccountService,
    private commonService: CommonService,
    private walletService: WalletService
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Validators' }, { label: 'List', active: true }];
    this.getList();
    this.getDataWallet();

    setInterval(() => {
      this.getList();
      this.getDataWallet();
    }, 10000);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.walletService.wallet) {
        this.userAddress = this.walletService.wallet.bech32Address;
        this.getDataWallet();
      }
    }, 2000);
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
    this.searchNullData = false;
    let data;
    if (this.textSearch.length > 0 || !this.isActive) {
      data = this.dataSourceBk.data.filter(
        (f) =>
          f.title.toLowerCase().indexOf(this.textSearch.toLowerCase().trim()) > -1 &&
          f.status_validator === this.isActive,
      );
      this.dataSource = this.dataSourceBk;
      this.dataSource = new MatTableDataSource(data);
      if (data === undefined || data?.length === 0) {
        this.searchNullData = true;
      }
    } else {
      this.dataSource = this.dataSourceBk;
    }
  }

  viewPopupDetail(staticDataModal: any, address) {
    const lastProvider = session.getItem<WalletStorage>(LAST_USED_PROVIDER);

    if (lastProvider) {
      const { provider, chainId } = lastProvider;
      this.walletService.connect(provider, chainId);
      this.clicked = true;
      this.getValidatorDetail(address, staticDataModal);
      setTimeout(() => {
        this.clicked = false;
      }, 2000);
    }
  }

  getValidatorDetail(address, modal): void {
    this.validatorService.validatorsDetail(address).subscribe(
      (res) => {
        this.dataModal = res.data;
        this.getListDelegators(address);
        this.modalService.open(modal, {
          keyboard: false,
          centered: true,
          windowClass: 'modal-holder',
        });
      },
      (error) => {},
    );
  }

  //Get data for wallet info and list staking
  getDataWallet() {
    if (this.userAddress) {
      forkJoin({
        dataWallet: this.accountService.getAccoutDetail(this.userAddress),
        dataListDelegator:  this.validatorService.validatorsDetailWallet(this.userAddress),
      }).subscribe(
        res => {
          if (res.dataWallet) {
            this.delegatedToken = res?.dataWallet?.data?.delegated;
            this.availableToken = res?.dataWallet?.data?.available;
            this.stakingToken = res?.dataWallet?.data?.stake_reward;
          }

          if (res.dataListDelegator) {
            if (res?.dataListDelegator?.data?.delegations.length > 0) {
              res?.dataListDelegator?.data?.delegations.forEach((f) => {
                f.amount_staked = f.amount_staked / NUMBER_CONVERT;
                f.pending_reward = f.pending_reward / NUMBER_CONVERT;
              });
              this.dataSourceWallet = new MatTableDataSource(res?.dataListDelegator.data?.delegations);
              this.lengthWallet = res?.dataListDelegator.data?.delegations?.length;
            }
          }
        }
      );
    }
  }

  getListDelegators(address): void {
    //get total delegator
    this.commonService.delegators(5, 0, address).subscribe((res) => {
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
      const excuteStaking = async () => {
        const { hash, error } = await createSignBroadcast({
          messageType: SIGNING_MESSAGE_TYPES.STAKE,
          message: {
            to: [this.dataModal.operator_address],
            amount: {
              amount: Number(this.amountFormat) * Math.pow(10, 6),
              denom: 'uaura',
            },
          },
          senderAddress: this.userAddress,
          network: ChainsInfo[this.walletService.chainId],
          signingType: 'keplr',
          chainId: this.walletService.chainId,
        });

        let element: HTMLElement = document.getElementById('dialog-close-btn') as HTMLElement;
        element.click();
        this.amountFormat = null;
        this.getDataWallet();
      };
      
      excuteStaking();
    }
  }

  closeDialog(modal) {
    modal.close('Close click');
  }

  changePopup(){
    
  }

  getMaxToken(): void{
    this.amountFormat = this.availableToken;
  }
}
