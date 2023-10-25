import { Component, OnInit, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { from } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { SoulboundTokenCreatePopupComponent } from '../soulbound-token-create-popup/soulbound-token-create-popup.component';
import { Router } from '@angular/router';

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

  constructor(
    private soulboundService: SoulboundService,
    public dialog: MatDialog,
    private walletService: WalletService,
    public commonService: CommonService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    from([1])
      .pipe(
        delay(800),
        mergeMap((_) => this.walletService.wallet$),
      )
      .subscribe((wallet) => {
        if (wallet) {
          window.addEventListener('keplr_keystorechange', () => {
            this.isNoData = true;
            const currentRoute = this.router.url;
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate([currentRoute]); // navigate to same route
            });
          });
          this.currentAddress = this.walletService.wallet?.bech32Address;
          this.isNoData = false;
          this.getListSmartContract();
        } else {
          this.currentAddress = null;
          this.pageChange?.selectPage(0);
          this.dataSource.data = [];
          this.loading = false;
        }
      });
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

    const addressNameTag = this.commonService.findNameTag(this.textSearch);
    if (addressNameTag?.length > 0) {
      payload['keyword'] = addressNameTag;
    }

    this.soulboundService.getListSoulbound(payload).subscribe((res) => {
      this.dataSource.data = res.data;
      this.pageData.length = res.meta.count;
      if (res.data.length === 0 && this.isSearchData === false) {
        this.isNoData = true;
      }
      this.loading = false;
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
