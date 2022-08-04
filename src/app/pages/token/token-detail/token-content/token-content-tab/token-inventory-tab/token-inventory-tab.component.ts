import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { TokenService } from 'src/app/core/services/token.service';

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
  contractAddress = '';
  constructor(private route: ActivatedRoute, private tokenService: TokenService) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.contractAddress = params?.tokenId;
      this.getNftData();
    });
  }

  getNftData() {
    this.loading = true;
    let payload = {
      limit: 20,
      offset: 0,
      token_id: '',
      owner: '',
    };
    this.tokenService.getListTokenNFT(this.contractAddress, payload).subscribe((res) => {
      if (res && res.data?.length > 0) {
        this.nftData = res.data;
        this.showedData = this.nftData.slice(0, 20);
        this.pageData = {
          length: res.data?.length,
          pageSize: 20,
          pageIndex: 1,
        };
      }
      this.loading = false;
    });
    this.loading = false;
  }

  paginatorEmit(event): void {
    // handle paginator with API
    const pageEvent = event;
    this.showedData = this.nftData.slice(10 * pageEvent.pageIndex, 10 * (pageEvent.pageIndex + 1));
  }
}
