import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CONTRACT_RESULT } from 'src/app/core/constants/contract.constant';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { DATEFORMAT, PAGE_EVENT } from '../../../core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from '../../../core/constants/token.constant';
import { TableTemplate } from '../../../core/models/common.model';
import { ContractService } from '../../../core/services/contract.service';
import { shortenAddress } from '../../../core/utils/common/shorten';
import { Globals } from '../../../global/global';

@Component({
  selector: 'app-contracts-list',
  templateUrl: './contracts-list.component.html',
  styleUrls: ['./contracts-list.component.scss'],
})
export class ContractsListComponent implements OnInit {
  textSearch = '';
  templates: Array<TableTemplate> = [
    { matColumnDef: 'contract_address', headerCellDef: 'Address', isUrl: '/contracts', isShort: true },
    { matColumnDef: 'contract_name', headerCellDef: 'Contract Name' },
    { matColumnDef: 'code_id', headerCellDef: 'Code ID' },
    { matColumnDef: 'type', headerCellDef: 'Type Contract' },
    { matColumnDef: 'compiler_version', headerCellDef: 'Version' },
    { matColumnDef: 'contract_verification', headerCellDef: 'Verified' },
    { matColumnDef: 'creator_address', headerCellDef: 'Creator', isUrl: '/account', isShort: true },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent;
  pageSize = 20;
  pageIndex = 0;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  dataSearch: any;
  filterSearchData = [];
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  contractVerifyType = ContractVerifyType;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  constructor(
    public translate: TranslateService,
    public global: Globals,
    private router: Router,
    private contractService: ContractService,
    private datePipe: DatePipe,
    private layout: BreakpointObserver,
  ) {}

  ngOnInit(): void {
    this.getListContract();
  }

  getListContract() {
    let payload = {
      limit: this.pageSize,
      offset: this.pageIndex * this.pageSize,
      keyword: this.textSearch,
    };

    this.contractService.getListContract(payload).subscribe((res) => {
      this.pageData = {
        length: res?.meta?.count,
        pageSize: 20,
        pageIndex: PAGE_EVENT.PAGE_INDEX,
      };
      if (res?.data?.length > 0) {
        res.data.forEach((item) => {
          item.updated_at = this.datePipe.transform(item.updated_at, DATEFORMAT.DATETIME_UTC);
          if (item.type === CONTRACT_RESULT.INCORRECT || !item.type) {
            item.type = '-';
          }
        });
        this.dataSource = res.data;
        this.dataSearch = res.data;
      }
    });
  }

  searchToken(): void {
    this.filterSearchData = null;
    if (this.textSearch.length > 0) {
      let payload = {
        limit: 0,
        offset: 0,
        keyword: this.textSearch,
      };

      this.contractService.getListContract(payload).subscribe((res) => {
        if (res?.data?.length > 0) {
          res.data.forEach((item) => {
            item.updated_at = this.datePipe.transform(item.updated_at, DATEFORMAT.DATETIME_UTC);
          });
          this.dataSearch = res.data;
        }
      });
      let keyWord = this.textSearch.toLowerCase();
      this.filterSearchData = this.dataSearch.filter((data) => data.contract_name.toLowerCase().includes(keyWord));
    }
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.getListContract();
  }

  handleLink(): void {
    this.router.navigate(['/contracts/', this.filterSearchData[0]?.contract_address]);
  }

  shortenAddress(address: string): string {
    if (address) {
      return shortenAddress(address, 8);
    }
    return '';
  }
}
