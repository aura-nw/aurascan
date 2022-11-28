import { Component, OnInit } from '@angular/core';
import {MAX_LENGTH_SEARCH_TOKEN} from "src/app/core/constants/token.constant";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {PAGE_EVENT} from "src/app/core/constants/common.constant";
import {MatTableDataSource} from "@angular/material/table";
import {MatDialog} from "@angular/material/dialog";
import {
  TokenSoulboundDetailPopupComponent
} from "src/app/pages/token-soulbound/token-soulbound-detail-popup/token-soulbound-detail-popup.component";

@Component({
  selector: 'app-token-soulbound-unequipped',
  templateUrl: './token-soulbound-unequipped.component.html',
  styleUrls: ['./token-soulbound-unequipped.component.scss']
})
export class TokenSoulboundUnequippedComponent implements OnInit {
  textSearch = '';
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  tokenList = [
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: false
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: false
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: false
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: false
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: false
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: false
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true
    },
  ]
  countSelected = 0;
  loading = false;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  // nftData param use for paginator
  nftData: MatTableDataSource<any> = new MatTableDataSource();
  showData: any[];
  nextKey = null;
  currentKey = null;

  constructor(
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getTokenData();
  }
  searchToken() {}
  resetSearch() {
    this.textSearch = '';
  }
  getTokenData() {
    this.loading = true;
    // params call API
    // let payload = {
    //   pageLimit: 100,
    //   token_id: '',
    //   owner: '',
    //   contractAddress: this.contractAddress,
    //   nextKey: this.nextKey,
    // };
    this.nftData.data = this.tokenList;
    this.tokenList.filter((token)=> {
      if(token.isClaimed) {
        this.countSelected++;
      }
    })
    this.showData = this.nftData.data.slice(
      this.pageData.pageIndex * this.pageData.pageSize,
      this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
    );
    this.pageData.length = this.nftData.data.length;
    this.loading = false;
  }

  pageEvent(e: PageEvent): void {
    const { length, pageIndex, pageSize } = e;
    const next = length <= (pageIndex + 2) * pageSize;
    this.pageData = e;
    this.showData = this.nftData.data.slice(
      this.pageData.pageIndex * this.pageData.pageSize,
      this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
    );

    if (next && this.nextKey && this.currentKey !== this.nextKey) {
      this.getTokenData();
      this.currentKey = this.nextKey;
    }
  }

  paginatorEmit(e: MatPaginator): void {
    if (this.nftData.paginator) {
      e.page.next({
        length: this.nftData.paginator.length,
        pageIndex: 0,
        pageSize: this.nftData.paginator.pageSize,
        previousPageIndex: this.nftData.paginator.pageIndex,
      });
      this.nftData.paginator = e;
    } else this.nftData.paginator = e;
  }

  xpaginatorEmit(e): void {
    this.nftData.paginator = e;
  }

  openDialogDetail() {
    const tokenData = {
      name: 'The Picaroons',
      img: 'assets/images/soulboundToken.png',
      desc: 'Soulbound Token given to the validators in accompany with Aura Network throughout Euphoria Testnet duration. We appreciate your contribution and hope we will come alongside together in long term. Soulbound Token given to the validators in accompany with Aura Network throughout Euphoria Testnet duration. We appreciate your contribution and hope we will come alongside together in long term.Soulbound Token given to the validators in accompany with Aura Network throughout Euphoria Testnet duration.',
      properties: [
        {
          label: 'Style',
          detail: 'Vintage'
        },
        {
          label: 'Goal',
          detail: 'Sale'
        },
        {
          label: 'Size',
          detail: '3x4'
        },
        {
          label: 'Time',
          detail: '2022'
        },
        {
          label: 'Serie',
          detail: 'A'
        },
        {
          label: 'Function',
          detail: 'Test'
        }
      ]
    };
    let dialogRef = this.dialog.open(TokenSoulboundDetailPopupComponent, {
      panelClass: 'TokenSoulboundDetailPopup',
      data: tokenData,
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
