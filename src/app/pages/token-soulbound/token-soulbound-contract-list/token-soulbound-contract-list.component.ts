import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { TableTemplate } from 'src/app/core/models/common.model';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
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
  constructor(private soulboundService: SoulboundService, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.getListSmartContract();
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
      minterAddress: 'aura1uh24g2lc8hvvkaaf7awz25lrh5fptthu2dhq0n',
      keyword: keySearch,
    };

    this.soulboundService.getListSoulbound(payload).subscribe((res) => {
      // if (res.data.length > 0) {
      this.dataSource.data = res.data;
      this.pageData.length = res.meta.count;
    });
    this.loading = false;
  }

  openDialog(contract_address): void {
    let dialogRef = this.dialog.open(TokenSoulboundCreatePopupComponent, {
      panelClass: 'TokenSoulboundCreatePopup',
      data: {
        attestorAddress: 'auralluwyzsc5pnygennjOufyquqfue@nqxvqmaskko',
        contractAddress: contract_address,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result !== 'canceled') {
        // call API post data here
        // then check response, if response message is successfull -> load dataTable again
        // setTimeout(() => {
        // this.getListToken();
        // }, 3000);
      }
    });
  }
}
