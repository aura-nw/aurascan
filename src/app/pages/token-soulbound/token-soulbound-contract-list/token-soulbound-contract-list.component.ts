import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { TableTemplate } from 'src/app/core/models/common.model';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { TokenSoulboundCreatePopupComponent } from '../token-soulbound-create-popup/token-soulbound-create-popup.component';

@Component({
  selector: 'app-token-soulbound-contract-list',
  templateUrl: './token-soulbound-contract-list.component.html',
  styleUrls: ['./token-soulbound-contract-list.component.scss'],
})
export class TokenSoulboundContractListComponent implements OnInit {
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
    { matColumnDef: 'contract_address', headerCellDef: 'contract_address' },
    { matColumnDef: 'total', headerCellDef: 'total' },
    { matColumnDef: 'claimed_qty', headerCellDef: 'claimed_qty' },
    { matColumnDef: 'unclaimed_qty', headerCellDef: 'unclaimed_qty' },
    { matColumnDef: 'action', headerCellDef: 'action' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  loading = true;
  currentAddress = '';

  constructor(
    private soulboundService: SoulboundService,
    public dialog: MatDialog,
    private walletService: WalletService,
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
          this.currentAddress = this.walletService.wallet?.bech32Address;
          this.getListSmartContract();
        } else {
          this.currentAddress = null;
          this.router.navigate(['/']);
        }
      });
  }

  searchToken() {
    this.getListSmartContract(this.textSearch);
  }

  resetSearch() {
    this.textSearch = '';
    this.getListSmartContract();
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getListSmartContract();
  }

  getListSmartContract(keySearch = '') {
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      minterAddress: this.currentAddress,
      keyword: keySearch,
    };

    this.soulboundService.getListSoulbound(payload).subscribe((res) => {
      if (res.data.length > 0) {
        this.dataSource.data = res.data;
        this.pageData.length = res.meta.count;
      } else {
        // this.router.navigate(['/']);
      }
    });
    this.loading = false;
  }

  openDialog(contract_address): void {
    let dialogRef = this.dialog.open(TokenSoulboundCreatePopupComponent, {
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
        }, 2000);
      }
    });
  }
}
