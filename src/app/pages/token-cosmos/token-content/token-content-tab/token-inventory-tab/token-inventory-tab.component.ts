import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnInit } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { LENGTH_CHARACTER, PAGE_EVENT, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TokenService } from 'src/app/core/services/token.service';
import { checkTypeFile } from 'src/app/core/utils/common/info-common';

@Component({
  selector: 'app-token-inventory-tab',
  templateUrl: './token-inventory-tab.component.html',
  styleUrls: ['./token-inventory-tab.component.scss'],
})
export class TokenInventoryComponent implements OnInit {
  @Input() typeContract: string;
  loading = true;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: 1,
  };
  nftData = new MatTableDataSource<any>();
  contractAddress = '';
  keyWord = '';
  prefixAdd = this.environmentService.chainInfo.bech32Config.bech32PrefixAccAddr;
  errTxt: string;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  constructor(
    private route: ActivatedRoute,
    private tokenService: TokenService,
    private environmentService: EnvironmentService,
    private router: Router,
    private layout: BreakpointObserver,
  ) {}

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
    let payload = {
      limit: this.pageData.pageSize,
      offset: (this.pageData.pageIndex - 1) * this.pageData.pageSize,
      contractAddress: this.contractAddress,
      owner: null,
      token_id: null,
    };

    if (this.keyWord) {
      if (this.keyWord?.length >= LENGTH_CHARACTER.ADDRESS && this.keyWord?.startsWith(this.prefixAdd)) {
        payload.owner = this.keyWord;
      } else if (
        !(this.keyWord?.length === LENGTH_CHARACTER.TRANSACTION && this.keyWord == this.keyWord?.toUpperCase())
      ) {
        payload.token_id = this.keyWord;
      }
    }

    this.tokenService.getListTokenNFTFromIndexer(payload).subscribe({
      next: (res) => {
        const asset = _.get(res, `cw721_token`);
        if (asset.length > 0) {
          asset.forEach((element) => {
            element.contract_address = this.contractAddress;
          });
          this.nftData.data = asset;
        }
        this.pageData.length = res?.cw721_token_aggregate?.aggregate?.count;
      },
      error: (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxt = e.message;
        } else {
          this.errTxt = e.status + ' ' + e.statusText;
        }
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  pageEvent(pageIndex: number): void {
    // reset page 1 if pageIndex = 0
    if (pageIndex === 0) {
      this.pageData.pageIndex = 1;
    }
    this.getNftData();
  }

  handleRouterLink(e: Event, link, params?): void {
    this.router.navigate(link, {
      queryParams: params,
    });
    e.preventDefault();
  }

  getTypeFile(nft: any) {
    let nftType = checkTypeFile(nft);
    return nftType;
  }

  encodeData(data) {
    return encodeURIComponent(data);
  }
}
