import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { from } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { SOUL_BOUND_TYPE } from 'src/app/core/constants/soulbound.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { TableTemplate } from 'src/app/core/models/common.model';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { TokenSoulboundCreatePopupComponent } from 'src/app/pages/token-soulbound/token-soulbound-create-popup/token-soulbound-create-popup.component';

@Component({
  selector: 'app-token-soulbound-contract-tokens',
  templateUrl: './token-soulbound-contract-tokens.component.html',
  styleUrls: ['./token-soulbound-contract-tokens.component.scss'],
})
export class TokenSoulboundContractTokensComponent implements OnInit {
  textSearch = '';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private soulboundService: SoulboundService,
    private walletService: WalletService,
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
          if (!this.contractAddress || (this.contractAddress && this.contractAddress.trim().length === 0)) {
            this.router.navigate(['/']);
          }
          this.getListToken();
        } else {
          this.currentAddress = null;
          this.router.navigate(['/']);
        }
      });
  }

  searchToken() {
    this.pageData.pageIndex = 0;
    this.getListToken(this.textSearch);
  }

  resetSearch() {
    this.textSearch = '';
    this.pageData.pageIndex = 0;
    this.getListToken();
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getListToken();
  }

  getListToken(keySearch = '') {
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      minterAddress: this.currentAddress,
      contractAddress: this.contractAddress,
      keyword: keySearch ? encodeURIComponent(keySearch) : '',
      // keyword: keySearch?.trim(),
      status: this.selectedType,
    };

    this.soulboundService.getSBContractDetail(payload).subscribe((res) => {
      this.dataSource.data = res.data;
      this.pageData.length = res.meta.count;
    });
    this.loading = false;
  }

  openDialog(): void {
    let dialogRef = this.dialog.open(TokenSoulboundCreatePopupComponent, {
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
        }, 2000);
      }
    });
  }

  checkInput() {}
}
