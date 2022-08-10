import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-token-inventory-tab',
  templateUrl: './token-inventory-tab.component.html',
  styleUrls: ['./token-inventory-tab.component.scss'],
})
export class TokenInventoryComponent implements OnInit {
  loading = true;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  nftData = [];
  contractAddress = '';
  keyWord = '';
  constructor(private route: ActivatedRoute, private tokenService: TokenService) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.contractAddress = params?.contractAddress;
    });

    this.route.queryParams.subscribe((params) => {
      this.keyWord = params?.a || '';
    });
    this.getNftData();
  }

  getNftData() {
    this.loading = true;
    let payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      token_id: this.keyWord || '',
      owner: '',
    };
    this.tokenService.getListTokenNFT(this.contractAddress, payload).subscribe((res) => {
      if (res && res.data?.length > 0) {
        this.nftData = res.data;
        this.pageData.length = res.meta?.count;
      }
      this.loading = false;
    });
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getNftData();
  }
}
