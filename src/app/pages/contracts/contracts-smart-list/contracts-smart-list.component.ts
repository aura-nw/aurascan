import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { from, Subscription } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import { DATEFORMAT, PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { Globals } from 'src/app/global/global';
import { SmartContractListReq, SmartContractStatus } from '../../../core/models/contract.model';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';

@Component({
  selector: 'app-contracts-smart-list',
  templateUrl: './contracts-smart-list.component.html',
  styleUrls: ['./contracts-smart-list.component.scss'],
})
export class ContractsSmartListComponent implements OnInit {
  textSearch = '';
  templates: Array<TableTemplate> = [
    { matColumnDef: 'contract_address', headerCellDef: 'Address' },
    { matColumnDef: 'contract_name', headerCellDef: 'Contract Name' },
    { matColumnDef: 'code_id', headerCellDef: 'Code ID' },
    { matColumnDef: 'type', headerCellDef: 'Type Contract' },
    { matColumnDef: 'compiler_version', headerCellDef: 'Version' },
    { matColumnDef: 'verified_at', headerCellDef: 'Verified' },
    { matColumnDef: 'status', headerCellDef: 'Status' },
    { matColumnDef: 'mainnet_code_id', headerCellDef: 'Code ID On Mainnet' },
    { matColumnDef: 'tx_hash', headerCellDef: 'Contract On Mainnet' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageLimit = 20;
  contractVerifyType = ContractVerifyType;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: this.pageLimit,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  preIndex = 0;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  filterSearchData: any;
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  userAddress = '';
  walletAccount: any;
  loading = true;
  isHideSearch = false;
  contractMainnetStatus: SmartContractStatus[] = [];
  currentStatus: SmartContractStatus;
  subscription: Subscription

  statusColor = {
    "UNVERIFIED": "#E5E7EA",
    "NOT REGISTERD": "#F5B73C",
    "TBD": "#2CB1F5",
    "DEPLOYED": "#67C091",
    "REJECTED": "#D5625E",
  };

  constructor(
    public translate: TranslateService,
    public global: Globals,
    private router: Router,
    private contractService: ContractService,
    private datePipe: DatePipe,
    private layout: BreakpointObserver,
    public walletService: WalletService,
    public commonService: CommonService,
  ) {
  }

  ngOnInit() {
    from([1])
      .pipe(
        delay(600),
        mergeMap((_) => this.walletService.wallet$),
      )
      .subscribe(async (wallet) => {
        if (!wallet) {
          this.userAddress = null;
          this.router.navigate(['/']);
        } else {
          await this.getContractStatus();
          this.userAddress = wallet.bech32Address;
          await this.getListContract();
        }
      });
  }

  getListContract(status?: SmartContractStatus) {
    this.currentStatus = status;
    this.loading = true;
    const payload: SmartContractListReq = {
      creatorAddress: this.userAddress,
      codeId: this.textSearch ? this.textSearch : '',
      status: (this.currentStatus && this.currentStatus.key !== 'ALL') && this.currentStatus.label ? this.currentStatus.label : '',
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
    };
    this.subscription = this.contractService.getListSmartContract(payload).subscribe(res => {
      this.pageData = {
        length: res.meta.count,
        pageSize: this.pageData.pageSize,
        pageIndex: this.pageData.pageIndex,
      };
      this.preIndex = this.pageData.pageIndex;
      this.dataSource.data = res.data;
      this.loading = false;
    });
  }

  resetPageEvent() {
    this.dataSource.paginator.page.next({
      length: this.dataSource.paginator.length,
      pageIndex: 0,
      pageSize: this.dataSource.paginator.pageSize,
      previousPageIndex: -1,
    })
  }

  searchContract(): void {
      this.getListContract();
      this.resetPageEvent();
  }

  clearSearch(): void {
    this.textSearch = '';
    this.filterSearchData = null;
    this.getListContract();
    this.resetPageEvent();
  }

  replacePageList(item: any): void {
    this.textSearch = item.code_id;
    this.dataSource.data = item;
    this.isHideSearch = true;
    this.pageData.length = 1;
  }

  paginatorEmit(event): void {
    if (this.dataSource) {
      this.dataSource.paginator = event;
    }
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    if(e.pageIndex !== this.preIndex) {
      this.getListContract(this.currentStatus);
    }
  }

  async getContractStatus() {
    const req = await this.contractService.getSmartContractStatus();
    if(req) {
      this.contractMainnetStatus = req.data['data'];
      this.contractMainnetStatus.unshift({
        key: 'ALL',
        label: 'All'
      })
      // remove EXACT_MATCH
      this.removeStatusItem('EXACT_MATCH');
      // remove SIMILAR_MATCH
      this.removeStatusItem('SIMILAR_MATCH');
    }
  }

  removeStatusItem(status: string) {
    const indexOfObject = this.contractMainnetStatus.findIndex((object) => {
      return object.key === status;
    });
    if (indexOfObject !== -1) {
      this.contractMainnetStatus.splice(indexOfObject, 1);
    }
  }
}
