import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ResponseDto, TableTemplate } from 'src/app/core/models/common.model';
import { AccountService } from 'src/app/core/services/account.service';
import { balanceOf } from 'src/app/core/utils/common/parsing';
import { Globals } from 'src/app/global/global';

@Component({
  selector: 'app-token-table',
  templateUrl: './token-table.component.html',
  styleUrls: ['./token-table.component.scss'],
})
export class TokenTableComponent implements OnChanges {
  @Input() address: string;
  @Output() totalValue = new EventEmitter<number>();

  math = Math;
  textSearch = '';
  searchTemp: string = '';
  templates: Array<TableTemplate> = [
    { matColumnDef: 'asset', headerCellDef: 'asset' },
    { matColumnDef: 'symbol', headerCellDef: 'symbol' },
    { matColumnDef: 'contractAddress', headerCellDef: 'contractAddress' },
    { matColumnDef: 'amount', headerCellDef: 'amount' },
    { matColumnDef: 'price', headerCellDef: 'price' },
    { matColumnDef: 'chance', headerCellDef: 'chance' },
    { matColumnDef: 'value', headerCellDef: 'value' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);

  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 10,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  sortedData: any;
  sort: MatSort;
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  currentBalance = 0;
  assetsLoading = true;
  total = 0;
  stableTokenName = 'Aura';
  pageEvent: any;
  paginator: MatPaginator;

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  coinInfo = this.environmentService.configValue.chain_info.currencies[0];
  image_s3 = this.environmentService.configValue.image_s3;
  defaultLogoAura = this.image_s3 + 'images/icons/aura.svg';
  constructor(
    public global: Globals,
    private accountService: AccountService,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.getTotalAssets();
  }

  ngOnChanges(): void {
    this.getListToken();
  }

  getListToken() {
    this.assetsLoading = true;
    const payload = {
      account_address: this.address,
      limit: this.pageData.pageSize,
      offset: this.pageData.pageSize * this.pageData.pageIndex,
      keyword: this.textSearch,
    };
    this.accountService.getAssetCW20ByOwner(payload).subscribe((res: ResponseDto) => {
      if (res?.data?.length > 0) {
        res?.data.forEach((element) => {
          if (element.name.toLowerCase() === this.denom?.toLowerCase()) {
            element.balance = balanceOf(element.balance);
            element.contract_address = '';
            element.name = this.stableTokenName;
            element.symbol = this.denom;
          }

          element['change'] = element.price_change_percentage_24h;
          element['isValueUp'] = true;
          if (element.change < 0) {
            element['isValueUp'] = false;
            element.change = Number(element.change.toString().substring(1));
          }
        });

        this.dataSource = new MatTableDataSource<any>(res?.data);
        this.pageData.length = res.meta.count;
      } else {
        this.pageData.length = 0;
        this.dataSource.data = [];
      }
      this.assetsLoading = false;
    });
  }

  convertValue(value: any, decimal: number) {
    return balanceOf(value, decimal);
  }

  sortData(sort: Sort) {}

  paginatorEmit(event): void {
    this.paginator = event;
  }

  handlePageEvent(e: any) {
    this.pageData.pageIndex = e.pageIndex;
    this.getKeySearch();
  }

  getKeySearch() {
    this.textSearch = this.textSearch?.trim();
    this.getListToken();
  }

  searchToken(): void {
    if (this.paginator.pageIndex !== 0) {
      this.paginator.firstPage();
    } else {
      this.getKeySearch();
    }
  }

  checkSearch(): void {
    if (this.textSearch.length === 0) {
      this.searchToken();
    }
  }

  resetSearch(): void {
    this.textSearch = '';
    this.pageData.pageIndex = 0;
    this.searchToken();
  }

  getTotalAssets(): void {
    this.accountService.getTotalAssets(this.address).subscribe((res: ResponseDto) => {
      this.total = res.data || 0;
      this.totalValue.emit(this.total);
    });
  }
}
