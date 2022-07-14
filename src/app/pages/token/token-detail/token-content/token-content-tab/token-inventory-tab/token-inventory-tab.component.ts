import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-token-inventory-tab',
  templateUrl: './token-inventory-tab.component.html',
  styleUrls: ['./token-inventory-tab.component.scss'],
})
export class TokenInventoryComponent implements OnInit {
  loading = true;
  pageData: PageEvent;
  nftData = [];
  showedData = [];
  tokenId = 'abc';
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.tokenId = params?.tokenId || 'abc';
      this.getNftData();
      this.showedData = this.nftData.slice(0, 10);
    });
  }

  getNftData() {
    this.loading = true;
    // call API get nft data -> import data to showedData
    this.nftData = [
      {
        symbol: 'CW - 721',
        name: '443432324234agbki443432324adw453443',
        tokenID: '12345',
        link: '/tokens/token/' + this.tokenId + '/1',
        img: 'assets/images/about.png',
      },
      {
        symbol: 'CW - 721',
        name: '443432324234agbki443432324adw453443',
        tokenID: '12345',
        link: '/tokens/token/' + this.tokenId + '/1',
        img: null,
      },
      {
        symbol: 'CW - 721',
        name: '443432324234agbki443432324adw453443',
        tokenID: '12345',
        link: '/tokens/token/' + this.tokenId + '/1',
        img: 'assets/images/about.png',
      },
      {
        symbol: 'CW - 721',
        name: '443432324234agbki443432324adw453443',
        tokenID: '12345',
        link: '/tokens/token/' + this.tokenId + '/1',
        img: 'assets/images/about.png',
      },
      {
        symbol: 'CW - 721',
        name: '443432324234agbki443432324adw453443',
        tokenID: '12345',
        link: '/tokens/token/' + this.tokenId + '/1',
        img: 'assets/images/about.png',
      },
      {
        symbol: 'CW - 721',
        name: '443432324234agbki443432324adw453443',
        tokenID: '12345',
        link: '/tokens/token/' + this.tokenId + '/1',
        img: 'assets/images/about.png',
      },
      {
        symbol: 'CW - 721',
        name: '443432324234agbki443432324adw453443',
        tokenID: '12345',
        link: '/tokens/token/' + this.tokenId + '/1',
        img: 'assets/images/about.png',
      },
      {
        symbol: 'CW - 721',
        name: '443432324234agbki443432324adw453443',
        tokenID: '12345',
        link: '/tokens/token/' + this.tokenId + '/1',
        img: 'assets/images/about.png',
      },
      {
        symbol: 'CW - 721',
        name: '443432324234agbki443432324adw453443',
        tokenID: '12345',
        link: '/tokens/token/' + this.tokenId + '/1',
        img: 'assets/images/about.png',
      },
      {
        symbol: 'CW - 721',
        name: '443432324234agbki443432324adw453443',
        tokenID: '12345',
        link: '/tokens/token/' + this.tokenId + '/1',
        img: 'assets/images/about.png',
      },
      {
        symbol: 'CW - 721',
        name: '443432324234agbki443432324adw453443',
        tokenID: '12345',
        link: '/tokens/token/' + this.tokenId + '/1',
        img: 'assets/images/about.png',
      },
      {
        symbol: 'CW - 721',
        name: '443432324234agbki443432324adw453443',
        tokenID: '12345',
        link: '/tokens/token/' + this.tokenId + '/1',
        img: 'assets/images/about.png',
      },
      {
        symbol: 'CW - 721',
        name: '443432324234agbki443432324adw453443',
        tokenID: '12345',
        link: '/tokens/token/' + this.tokenId + '/1',
        img: 'assets/images/about.png',
      },
      {
        symbol: 'CW - 721',
        name: '443432324234agbki443432324adw453443',
        tokenID: '12345',
        link: '/tokens/token/' + this.tokenId + '/1',
        img: 'assets/images/about.png',
      },
      {
        symbol: 'CW - 721',
        name: '443432324234agbki443432324adw453443',
        tokenID: '12345',
        link: '/tokens/token/' + this.tokenId + '/1',
        img: 'assets/images/about.png',
      },
      {
        symbol: 'CW - 721',
        name: '443432324234agbki443432324adw453443',
        tokenID: '12345',
        link: '/tokens/token/' + this.tokenId + '/1',
        img: 'assets/images/about.png',
      },
      {
        symbol: 'CW - 721',
        name: '443432324234agbki443432324adw453443',
        tokenID: '12345',
        link: '/tokens/token/' + this.tokenId + '/1',
        img: 'assets/images/about.png',
      },
      {
        symbol: 'CW - 721',
        name: '443432324234agbki443432324adw453443',
        tokenID: '12345',
        link: '/tokens/token/' + this.tokenId + '/1',
        img: 'assets/images/about.png',
      },
      {
        symbol: 'CW - 721',
        name: '443432324234agbki443432324adw453443',
        tokenID: '12345',
        link: '/tokens/token/' + this.tokenId + '/1',
        img: 'assets/images/about.png',
      },
    ];
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
