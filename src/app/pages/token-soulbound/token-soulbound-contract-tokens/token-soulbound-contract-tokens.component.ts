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
    { matColumnDef: 'tokenURI', headerCellDef: 'tokenURI' },
    { matColumnDef: 'receiver', headerCellDef: 'receiver' },
    { matColumnDef: 'tokenID', headerCellDef: 'tokenID' },
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

  getListToken() {
    this.loading = true;
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      keyword: this.textSearch,
    };

    // call API
    // this.dataSource = new MatTableDataSource<any>(res.data);
    // this.pageData.length = res.meta.count;

    //mockData
    this.dataSource.data = [
      {
        id: 1,
        tokenURI: 'http://192.168.20.213:5000/',
        receiver: 'aura12sfanz3wvw8gmeh5fc9sg9hkp399n9qk7jr3yjywyru27ga7kynsz2xsy7',
        tokenID: 6690,
        status: 'Unclaimed'
      },
      {
        id: 2,
        tokenURI: 'http://192.168.20.213:5000/',
        receiver: 'aura12sfanz3wvw8gmeh5fc9sg9hkp399n9qk7jr3yjywyru27ga7kynsz2xsy7',
        tokenID: 7190,
        status: 'Unequipped'
      },
      {
        id: 3,
        tokenURI: 'http://192.168.20.213:5000/',
        receiver: 'aura12sfanz3wvw8gmeh5fc9sg9hkp399n9qk7jr3yjywyru27ga7kynsz2xsy7',
        tokenID: 4590,
        status: 'Equipped'
      },
      {
        id: 4,
        tokenURI: 'http://192.168.20.213:5000/',
        receiver: 'aura12sfanz3wvw8gmeh5fc9sg9hkp399n9qk7jr3yjywyru27ga7kynsz2xsy7',
        tokenID: 2190,
        status: 'Equipped'
      }
    ]
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
        console.log(result)
        // call API post data here
          // then check response, if response message is successfull -> load dataTable again
          // setTimeout(() => {
          // this.getListToken();
          // }, 3000);
      }
    });
  }
}
