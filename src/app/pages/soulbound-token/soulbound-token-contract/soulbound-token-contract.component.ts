import { Component, OnInit, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ActivatedRoute, Router } from '@angular/router';
import { from } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { SB_TYPE, SOUL_BOUND_TYPE } from 'src/app/core/constants/soulbound.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { TableTemplate } from 'src/app/core/models/common.model';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { SoulboundTokenCreatePopupComponent } from '../soulbound-token-create-popup/soulbound-token-create-popup.component';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-soulbound-token-contract',
  templateUrl: './soulbound-token-contract.component.html',
  styleUrls: ['./soulbound-token-contract.component.scss'],
})
export class SoulboundTokenContractComponent implements OnInit {
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
    { matColumnDef: 'token_uri', headerCellDef: 'token_uri' },
    { matColumnDef: 'receiver_address', headerCellDef: 'receiver_address' },
    { matColumnDef: 'token_id', headerCellDef: 'token_id' },
    { matColumnDef: 'status', headerCellDef: 'status' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  loading = true;
  contractAddress = '';
  currentAddress = '';
  selectedType = '';
  lstTypeSB = SOUL_BOUND_TYPE;
  sbType = SB_TYPE;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private soulboundService: SoulboundService,
    private walletService: WalletService,
    public commonService: CommonService
  ) {}

  ngOnInit(): void {
    from([1])
      .pipe(
        delay(800),
        mergeMap((_) => this.walletService.wallet$),
      )
      .subscribe((wallet) => {
        if (wallet) {
          this.contractAddress = this.route.snapshot.paramMap.get('address');
          this.currentAddress = this.walletService.wallet?.bech32Address;
          this.getListToken();
        } else {
          this.currentAddress = null;
        }
      });
  }

  searchToken() {
    this.pageData.pageIndex = 0;
    if (this.pageChange) {
      this.pageChange?.selectPage(0);
    } else {
      this.getListToken();
    }
  }

  resetSearch() {
    this.textSearch = '';
    this.searchValue = '';
    this.pageData.pageIndex = 0;
    if (this.pageChange) {
      this.pageChange?.selectPage(0);
    } else {
      this.getListToken();
    }
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getListToken();
  }

  getSearchValue() {
    this.pageData.pageIndex = 0;
    this.textSearch = this.searchValue = this.searchValue.trim();
    if (this.pageChange) {
      this.pageChange?.selectPage(0);
    } 
    this.getListToken();
  }

  getListToken() {
    this.textSearch = this.textSearch?.trim();
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      minterAddress: this.currentAddress,
      contractAddress: this.contractAddress,
      keyword: this.textSearch,
      status: this.selectedType,
    };

    const addressNameTag = this.commonService.findNameTag(this.textSearch);
    if (addressNameTag?.length > 0) {
      payload['keyword'] = addressNameTag;
    }

    this.soulboundService.getSBContractDetail(payload).subscribe((res) => {
      this.dataSource.data = res.data;
      this.pageData.length = res.meta.count;
    });
    this.loading = false;
  }

  openDialog(): void {
    let dialogRef = this.dialog.open(SoulboundTokenCreatePopupComponent, {
      panelClass: 'TokenSoulboundCreatePopup',
      data: {
        currentAddress: this.currentAddress,
        contractAddress: this.contractAddress,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result !== 'canceled') {
        setTimeout(() => {
          this.getListToken();
        }, 4000);
      }
    });
  }
}
