import { Component, OnInit } from '@angular/core';
import {PageEvent} from "@angular/material/paginator";

@Component({
  selector: 'app-token-inventory-tab',
  templateUrl: './token-inventory-tab.component.html',
  styleUrls: ['./token-inventory-tab.component.scss']
})
export class TokenInventoryComponent implements OnInit {
  loading = true;
  pageData: PageEvent;
  nftData = [];
  showedData = [];

  constructor() { }

  ngOnInit(): void {
    this.getNftData();
    this.showedData = this.nftData.slice(0,10);
  }

  getNftData() {
    this.loading = true;
    // call API get nft data -> import data to showedData
    this.nftData = [
      {
        symbol: 'CW - 721',
        name: 'The Picaroons',
        tokenID: '443432324234agbki443432324adw453443',
        link: '#',
        img: 'assets/images/about.png'
      },
      {
        symbol: 'CW - 721',
        name: 'The Picaroons',
        tokenID: '443432324234agbki443432324adw453443',
        link: '#',
        img: null
      },
      {
        symbol: 'CW - 721',
        name: 'The Picaroons',
        tokenID: '443432324234agbki443432324adw453443',
        link: '#',
        img: 'assets/images/about.png'
      },
      {
        symbol: 'CW - 721',
        name: 'The Picaroons',
        tokenID: '443432324234agbki443432324adw453443',
        link: '#',
        img: 'assets/images/about.png'
      },
      {
        symbol: 'CW - 721',
        name: 'The Picaroons',
        tokenID: '443432324234agbki443432324adw453443',
        link: '#',
        img: 'assets/images/about.png'
      },
      {
        symbol: 'CW - 721',
        name: 'The Picaroons',
        tokenID: '443432324234agbki443432324adw453443',
        link: '#',
        img: 'assets/images/about.png'
      },
      {
        symbol: 'CW - 721',
        name: 'The Picaroons',
        tokenID: '443432324234agbki443432324adw453443',
        link: '#',
        img: 'assets/images/about.png'
      },
      {
        symbol: 'CW - 721',
        name: 'The Picaroons',
        tokenID: '443432324234agbki443432324adw453443',
        link: '#',
        img: 'assets/images/about.png'
      },
      {
        symbol: 'CW - 721',
        name: 'The Picaroons',
        tokenID: '443432324234agbki443432324adw453443',
        link: '#',
        img: 'assets/images/about.png'
      },
      {
        symbol: 'CW - 721',
        name: 'The Picaroons',
        tokenID: '443432324234agbki443432324adw453443',
        link: '#',
        img: 'assets/images/about.png'
      },
      {
        symbol: 'CW - 721',
        name: 'The Picaroons',
        tokenID: '443432324234agbki443432324adw453443',
        link: '#',
        img: 'assets/images/about.png'
      },
      {
        symbol: 'CW - 721',
        name: 'The Picaroons',
        tokenID: '443432324234agbki443432324adw453443',
        link: '#',
        img: 'assets/images/about.png'
      },
      {
        symbol: 'CW - 721',
        name: 'The Picaroons',
        tokenID: '443432324234agbki443432324adw453443',
        link: '#',
        img: 'assets/images/about.png'
      },
      {
        symbol: 'CW - 721',
        name: 'The Picaroons',
        tokenID: '443432324234agbki443432324adw453443',
        link: '#',
        img: 'assets/images/about.png'
      },
      {
        symbol: 'CW - 721',
        name: 'The Picaroons',
        tokenID: '443432324234agbki443432324adw453443',
        link: '#',
        img: 'assets/images/about.png'
      },
      {
        symbol: 'CW - 721',
        name: 'The Picaroons',
        tokenID: '443432324234agbki443432324adw453443',
        link: '#',
        img: 'assets/images/about.png'
      },
      {
        symbol: 'CW - 721',
        name: 'The Picaroons',
        tokenID: '443432324234agbki443432324adw453443',
        link: '#',
        img: 'assets/images/about.png'
      },
      {
        symbol: 'CW - 721',
        name: 'The Picaroons',
        tokenID: '443432324234agbki443432324adw453443',
        link: '#',
        img: 'assets/images/about.png'
      },
      {
        symbol: 'CW - 721',
        name: 'The Picaroons',
        tokenID: '443432324234agbki443432324adw453443',
        link: '#',
        img: 'assets/images/about.png'
      },
    ]
    this.pageData = {
      length: this.nftData.length,
      pageSize: 10,
      pageIndex: 1,
    };
    this.loading = false;
  }

  paginatorEmit(event): void {
    // handle paginator with API
    const pageEvent = event;
    this.showedData = this.nftData.slice(10 * pageEvent.pageIndex, 10 * (pageEvent.pageIndex + 1));
  }

}
