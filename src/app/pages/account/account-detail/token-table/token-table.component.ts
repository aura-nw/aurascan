import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import * as _ from 'lodash';
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
  @Output() totalAssets = new EventEmitter<number>();

  textSearch = '';
  searchValue = '';
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
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  assetsLoading = true;
  total = 0;
  pageEvent: any;
  paginator: MatPaginator;
  dataTable = [];

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  coinMiniDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;
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
    const payload = {
      account_address: this.address,
      limit: this.pageData.pageSize,
      offset: this.pageData.pageSize * this.pageData.pageIndex,
      keyword: this.textSearch?.trim(),
    };
    if (this.dataTable.length > 0) {
      let result = this.dataTable.slice(payload?.offset, payload?.offset + payload?.limit);
      // Search with text search
      if (payload?.keyword) {
        result = this.dataTable.filter(
          (item) =>
            item.name.toLowerCase().includes(this.textSearch.toLowerCase()) ||
            item.contract_address == payload?.keyword,
        );

        const data = result.slice(payload?.offset, payload?.offset + payload?.limit);
        this.dataSource = new MatTableDataSource<any>(data);
        this.pageData.length = result?.length;
      } else {
        this.dataSource = new MatTableDataSource<any>(result);
        this.pageData.length = this.dataTable?.length;
      }
    } else {
      this.accountService.getAssetCW20ByOwner(payload).subscribe(
        (res: ResponseDto) => {
          let data: any;
          if (res?.data?.length > 0) {
            let lstToken = _.get(res, 'data').map((element) => {
              data = element;
              if (data) {
                data.change = data.price_change_percentage_24h;
                data.isValueUp = true;
                data['balance'] = data['balance'] || 0;
                if (data.change !== '-' && data.change < 0) {
                  data.isValueUp = false;
                  data.change = Number(data.change.toString().substring(1));
                }
              }
              return data;
            });

            lstToken = lstToken.filter((k) => k?.symbol);
            // store datatable
            this.dataTable = lstToken;
            // Sort and slice 20 frist record.
            const result = lstToken.slice(payload?.offset, payload?.offset + payload?.limit);
            this.dataSource = new MatTableDataSource<any>(result);
            this.pageData.length = res.meta.count;
          } else {
            this.pageData.length = 0;
            this.dataSource.data = [];
          }
          this.totalAssets.emit(this.pageData.length);
        },
        () => {},
        () => {
          this.assetsLoading = false;
        },
      );
    }
  }

  convertValue(value: any, decimal: number) {
    return balanceOf(value, decimal);
  }

  paginatorEmit(event): void {
    this.paginator = event;
  }

  handlePageEvent(e: any) {
    this.pageData.pageIndex = e.pageIndex;
    this.getListToken();
  }

  searchToken(): void {
    this.searchValue = this.searchValue?.trim();
    this.textSearch = this.searchValue?.trim();
    if (this.paginator.pageIndex !== 0) {
      this.paginator.firstPage();
    } else {
      this.getListToken();
    }
  }

  resetSearch(): void {
    this.textSearch = '';
    this.searchValue = '';
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
