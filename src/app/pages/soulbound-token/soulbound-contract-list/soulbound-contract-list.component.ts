import { Component, OnInit, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PAGE_EVENT, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { TableTemplate } from 'src/app/core/models/common.model';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { SoulboundTokenCreatePopupComponent } from '../soulbound-token-create-popup/soulbound-token-create-popup.component';

@Component({
  selector: 'app-soulbound-contract-list',
  templateUrl: './soulbound-contract-list.component.html',
  styleUrls: ['./soulbound-contract-list.component.scss'],
})
export class SoulboundContractListComponent implements OnInit {
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;
  textSearch = '';
  searchValue = '';
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  templates: Array<TableTemplate> = [
    { matColumnDef: 'id', headerCellDef: 'id' },
    { matColumnDef: 'contract_address', headerCellDef: 'contract_address' },
    { matColumnDef: 'total', headerCellDef: 'total' },
    { matColumnDef: 'claimed_qty', headerCellDef: 'claimed_qty' },
    { matColumnDef: 'unclaimed_qty', headerCellDef: 'unclaimed_qty' },
    { matColumnDef: 'action', headerCellDef: 'action' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  loading = true;
  currentAddress = '';
  isNoData = true;
  isSearchData = false;
  errTxt: string;
  destroyed$ = new Subject<void>();

  constructor(
    private soulboundService: SoulboundService,
    public dialog: MatDialog,
    private walletService: WalletService,
    private router: Router,
    private nameTagService: NameTagService,
  ) {}

  ngOnInit(): void {
    this.walletService.walletAccount$.pipe(takeUntil(this.destroyed$)).subscribe((wallet) => {
      if (wallet) {
        this.currentAddress = wallet.address;
        this.getListSmartContract();
      } else {
        this.currentAddress = null;
        this.pageChange?.selectPage(0);
        this.dataSource.data = [];
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  searchToken() {
    this.isSearchData = true;
    this.pageData.pageIndex = 0;
    this.textSearch = this.searchValue;
    this.getListSmartContract();
  }

  resetSearch() {
    this.textSearch = '';
    this.searchValue = '';
    this.pageChange?.selectPage(0);
    this.getListSmartContract();
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getListSmartContract();
  }

  getListSmartContract() {
    this.loading = true;
    if (this.currentAddress === null) {
      return;
    }
    this.textSearch = this.searchValue = this.textSearch?.trim();
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      minterAddress: this.currentAddress,
      keyword: this.textSearch,
    };

    const addressNameTag = this.nameTagService.findAddressByNameTag(this.textSearch);
    if (addressNameTag?.length > 0) {
      payload['keyword'] = addressNameTag;
    }

    this.soulboundService.getListSoulbound(payload).subscribe({
      next: (res) => {
        this.dataSource.data = res.data;
        this.pageData.length = res.meta.count;
        if (res.data.length === 0 && this.isSearchData === false) {
          this.isNoData = true;
        }
      },
      error: (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxt = e.message;
        } else {
          this.errTxt = e.error.error.statusCode + ' ' + e.error.error.message;
        }
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  openDialog(contract_address): void {
    let dialogRef = this.dialog.open(SoulboundTokenCreatePopupComponent, {
      panelClass: 'TokenSoulboundCreatePopup',
      data: {
        currentAddress: this.currentAddress,
        contractAddress: contract_address,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result !== 'canceled') {
        setTimeout(() => {
          this.getListSmartContract();
        }, 4000);
      }
    });
  }
}
