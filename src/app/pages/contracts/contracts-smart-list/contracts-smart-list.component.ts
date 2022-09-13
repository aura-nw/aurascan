import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { from } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import { DATEFORMAT, PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { ContractMainnetStatus } from 'src/app/core/constants/contract.enum';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { Globals } from 'src/app/global/global';

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
    { matColumnDef: 'height', headerCellDef: 'Type Contract' },
    { matColumnDef: 'compiler_version', headerCellDef: 'Version' },
    { matColumnDef: 'contract_verification', headerCellDef: 'Verified' },
    { matColumnDef: 'status', headerCellDef: 'Status' },
    { matColumnDef: 'mainnet_code_id', headerCellDef: 'Code ID On Mainnet' },
    { matColumnDef: 'tx_hash', headerCellDef: 'Contract On Mainnet' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  dataBk: any[];
  filterSearchData: any;
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  userAddress = '';
  walletAccount: any;
  loading = true;
  isHideSearch = false;
  currentType = '';
  ContractMainnetStatus = ContractMainnetStatus;
  currentStatus: any;

  statusColor = {
    TBD: '#2CB1F5',
    'Not Registered': '#F5B73C',
    Unverified: '#E5E7EA',
    Deployed: '#67C091',
    Rejected: '#D5625E',
  };

  constructor(
    public translate: TranslateService,
    public global: Globals,
    private router: Router,
    private contractService: ContractService,
    private datePipe: DatePipe,
    private layout: BreakpointObserver,
    public walletService: WalletService,
    public commonService: CommonService
  ) {
  }

  ngOnInit(): void {
    from([1])
      .pipe(
        delay(600),
        mergeMap((_) => this.walletService.wallet$),
      )
      .subscribe(async (wallet) => {
        if (wallet) {
          this.userAddress = wallet.bech32Address;
          await this.getListContract();
        } else {
          this.userAddress = null;
          this.router.navigate(['/']);
        }
      });
  }

  async getListContract() {
    this.loading = true;
    let payload = {
      account_address: this.userAddress,
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      keyword: this.textSearch,
    };
    const listSmartContract = await this.contractService.getListSmartContract(payload.account_address, payload.limit, payload.offset);
    if(listSmartContract) {
      this.pageData = {
        length: listSmartContract.data['meta'].count,
        pageSize: this.pageData.pageSize,
        pageIndex: PAGE_EVENT.PAGE_INDEX,
      };
      // listSmartContract.data['data'].forEach((item) => {
      //   item.updated_at = this.datePipe.transform(item.updated_at, DATEFORMAT.DATETIME_UTC);
      // });
      this.dataSource = new MatTableDataSource<any>(listSmartContract.data['data']);
      this.dataBk = listSmartContract.data;
      this.loading = false;
    }
  }

  searchContract(): void {
    this.filterSearchData = null;
    this.isHideSearch = false;
    if (this.textSearch.length > 0) {
      let payload = {
        account_address: this.userAddress,
        limit: 0,
        offset: 0,
        keyword: this.textSearch,
      };
      this.filterSearchData = [];
      this.contractService.getListTypeContract(payload).subscribe((res) => {
        if (res?.data?.length > 0) {
          res.data.forEach((item) => {
            item.updated_at = this.datePipe.transform(item.updated_at, DATEFORMAT.DATETIME_UTC);
          });
          this.filterSearchData = res.data;
        }
      });
    } else {
      this.clearSearch();
    }
  }

  clearSearch(): void {
    this.filterSearchData = null;
    this.dataSource = new MatTableDataSource<any>(this.dataBk);
    this.pageData.length = this.dataBk['data'].length;
  }

  replacePageList(item: any): void {
    this.textSearch = item.code_id;
    this.dataSource = new MatTableDataSource<any>([item]);
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
    this.getListContract();
  }

  connectWallet(): void {
    this.walletAccount = this.walletService.getAccount();
  }

  validateCurrentCodeID(event: any) {
    // const regex = new RegExp(/[0-9]/g);
    // let key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    // if (!regex.test(key)) {
    //   event.preventDefault();
    //   return;
    // }
    // this.currentCodeID = event.target.value;
  }
}
