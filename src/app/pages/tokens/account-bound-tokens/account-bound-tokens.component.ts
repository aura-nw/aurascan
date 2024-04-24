import { Component, OnInit, ViewChild } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { PAGE_EVENT, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { TableTemplate } from '../../../core/models/common.model';

@Component({
  selector: 'app-account-bound-tokens',
  templateUrl: './account-bound-tokens.component.html',
  styleUrls: ['./account-bound-tokens.component.scss'],
})
export class AccountBoundTokensComponent implements OnInit {
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;
  searchSubject = new Subject();
  destroy$ = new Subject<void>();
  textSearch = '';
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
    pageIndex: 1,
  };
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  errTxt: string;
  isLoading = true;

  constructor(
    public translate: TranslateService,
    private soulboundService: SoulboundService,
    private nameTagService: NameTagService,
  ) {}

  ngOnInit(): void {
    this.getTokenData();

    this.searchSubject
      .asObservable()
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageEvent(0);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onKeyUp() {
    this.searchSubject.next(this.textSearch);
  }

  getTokenData() {
    this.textSearch = this.textSearch?.trim();
    let payload = {
      limit: this.pageData.pageSize,
      offset: (this.pageData.pageIndex - 1) * this.pageData.pageSize,
      keyword: this.textSearch,
    };

    const addressNameTag = this.nameTagService.findAddressByNameTag(this.textSearch);
    if (addressNameTag?.length > 0) {
      payload['keyword'] = addressNameTag;
    }

    this.soulboundService.getListABT(payload).subscribe({
      next: (res) => {
        this.dataSource = new MatTableDataSource<any>(res?.cw721_contract);
        this.pageData.length = res?.cw721_contract_aggregate?.aggregate?.count;
      },
      error: (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxt = e.message;
        } else {
          this.errTxt = e.status + ' ' + e.statusText;
        }
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(pageIndex: number): void {
    // reset page 1 if pageIndex = 0
    if (pageIndex === 0) {
      this.pageData.pageIndex = 1;
    }
    this.getTokenData();
  }

  resetSearch() {
    this.textSearch = '';
    this.pageEvent(0);
  }
}
