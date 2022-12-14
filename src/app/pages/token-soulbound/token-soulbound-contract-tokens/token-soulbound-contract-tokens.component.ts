import { Component, OnInit } from '@angular/core';
import {MAX_LENGTH_SEARCH_TOKEN} from "src/app/core/constants/token.constant";
import {PageEvent} from "@angular/material/paginator";
import {PAGE_EVENT} from "src/app/core/constants/common.constant";
import {MatTableDataSource} from "@angular/material/table";
import {TableTemplate} from "src/app/core/models/common.model";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {
  TokenSoulboundCreatePopupComponent
} from "src/app/pages/token-soulbound/token-soulbound-create-popup/token-soulbound-create-popup.component";
import { SoulboundService } from 'src/app/core/services/soulbound.service';

@Component({
  selector: 'app-token-soulbound-contract-tokens',
  templateUrl: './token-soulbound-contract-tokens.component.html',
  styleUrls: ['./token-soulbound-contract-tokens.component.scss']
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
    { matColumnDef: 'status', headerCellDef: 'status' }
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  loading = true;
  contractAddress;
  soulboundList = [
    {
      img: 'assets/images/soulboundToken.png',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0yta22'
    },
    {
      img: 'assets/images/soulboundToken.png',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0yta22'
    },
    {
      img: 'assets/images/soulboundToken.png',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0yta22'
    },
    {
      img: 'assets/images/soulboundToken.png',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0yta22'
    },
    {
      img: 'assets/images/soulboundToken.png',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0yta22'
    }
  ]
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private soulboundService: SoulboundService
  ) { }

  ngOnInit(): void {
    this.contractAddress = this.route.snapshot.paramMap.get('address');
    if(!this.contractAddress || (this.contractAddress && this.contractAddress.trim().length === 0)) {
      this.router.navigate(['/']);
    }
    this.getListToken();
  }

  searchToken() {}

  resetSearch() {
    this.textSearch = '';
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getListToken();
  }

  getListToken(keySearch = '') {
    this.loading = true;
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      keyword: keySearch,
    };

    this.soulboundService.getSBContractDetail(payload).subscribe((res) => {
      this.loading = true;

      if (res.data.length > 0) {
        this.dataSource.data = res.data;
        this.pageData.length = res.meta.count;
      }
    });
    this.loading = false;
  }


  openDialog(): void {
    let dialogRef = this.dialog.open(TokenSoulboundCreatePopupComponent, {
      panelClass: 'TokenSoulboundCreatePopup',
      data: {
        attestorAddress: 'auralluwyzsc5pnygennjOufyquqfue@nqxvqmaskko',
        contractAddress: this.contractAddress,
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
