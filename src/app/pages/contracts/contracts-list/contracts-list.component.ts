import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PAGE_EVENT } from '../../../core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from '../../../core/constants/smart-contract.constant';
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
    { matColumnDef: 'contract_address', headerCellDef: 'Address', isUrl: '/account', isShort: true },
    { matColumnDef: 'contract_name', headerCellDef: 'Contract Name' },
    { matColumnDef: 'compiler_version', headerCellDef: 'Version' },
    { matColumnDef: 'contract_verification', headerCellDef: 'Verified' },
    { matColumnDef: 'creator_address', headerCellDef: 'Creator', isUrl: '/account', isShort: true },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  sortedData: any;
  sort: MatSort;
  filterSearchData = [];
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;

  constructor(
    public translate: TranslateService,
    public global: Globals,
    private router: Router,
    private contractService: ContractService,
  ) {}

  ngOnInit(): void {
    this.getListContract();
  }

  filterData(keyWord: string) {
    keyWord = keyWord.toLowerCase();
    // this.filterSearchData = this.mockData.filter(
    //   (data) => data.name.toLowerCase().includes(keyWord) || data.hashCode.toLowerCase().includes(keyWord),
    // );
  }

  getListContract() {
    let payload = {
      limit: 20,
      offset: 0,
      keyword: '',
    };

    this.contractService.getListContract(payload).subscribe((res) => {
      this.pageData = {
        length: res?.meta?.count,
        pageSize: PAGE_EVENT.PAGE_SIZE,
        pageIndex: PAGE_EVENT.PAGE_INDEX,
      };
      if (res?.data?.length > 0) {
        this.dataSource = res.data;
      }
    });
  }

  searchToken(): void {
    this.filterSearchData = null;
    if (this.textSearch.length > 0) {
      this.filterData(this.textSearch);
    }
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }
  
  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  handleLink(): void {
    this.router.navigate(['/token/token', this.filterSearchData[0]?.hashCode]);
  }

  shortenAddress(address: string): string {
    if (address) {
      return shortenAddress(address, 8);
    }
    return '';
  }
}
