import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { TokenService } from 'src/app/core/services/token.service';
import { ResponseDto, TableTemplate } from '../../../../core/models/common.model';
import { Globals } from '../../../../global/global';

@Component({
  selector: 'app-token-cw4973',
  templateUrl: './token-cw4973.component.html',
  styleUrls: ['./token-cw4973.component.scss'],
})
export class TokenCw4973Component implements OnInit {
  textSearch = '';
  filterSearchData = [];
  dataSearch: any;
  templates: Array<TableTemplate> = [
    { matColumnDef: 'id', headerCellDef: 'id' },
    { matColumnDef: 'token', headerCellDef: 'name' },
    { matColumnDef: 'tokenContract', headerCellDef: 'tokenContract' },
    { matColumnDef: 'attestor', headerCellDef: 'attestor' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  enterSearch = '';

  image_s3 = this.environmentService.configValue.image_s3;
  defaultLogoToken = this.image_s3 + 'images/icons/token-logo.png';
  searchSubject = new Subject();
  destroy$ = new Subject();

  constructor(
    public translate: TranslateService,
    public global: Globals,
    public tokenService: TokenService,
    public soulboundService: SoulboundService,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.getTokenData();

    this.searchSubject
      .asObservable()
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.getTokenData();
      });
  }

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
    this.destroy$.next();
    this.destroy$.complete();
  }

  onKeyUp() {
    this.searchSubject.next(this.textSearch);
  }

  getTokenData() {
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      keyword: this.textSearch,
    };
    this.soulboundService.getListABT(payload).subscribe((res: ResponseDto) => {
      this.dataSource = new MatTableDataSource<any>(res.data);
      this.pageData.length = res.meta.count;
    });
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getTokenData();
  }

  resetSearch() {
    this.textSearch = '';
    this.onKeyUp();
    this.getTokenData();
  }
}
