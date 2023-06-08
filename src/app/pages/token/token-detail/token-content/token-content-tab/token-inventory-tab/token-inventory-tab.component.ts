import { Component, Input, OnInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { LENGTH_CHARACTER, PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
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
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  nftData: MatTableDataSource<any> = new MatTableDataSource();
  contractAddress = '';
  keyWord = '';
  dataSourceMobile: any[];
  prefixAdd = this.environmentService.configValue.chain_info.bech32Config.bech32PrefixAccAddr;
  isMoreTx = false;
  linkToken = 'token-nft';
  nextKey = null;
  currentNextKey = null;
  nextKeyId = null;

  constructor(
    private route: ActivatedRoute,
    private tokenService: TokenService,
    private environmentService: EnvironmentService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.contractAddress = params?.contractAddress;
    });

    this.route.queryParams.subscribe((params) => {
      this.keyWord = params?.a || '';
    });

    if (this.typeContract === ContractRegisterType.CW4973) {
      this.linkToken = 'token-abt';
    }
    this.getNftData();
  }

  getNftData(nextKey = null, nextKeyId = null) {
    let payload = {
      limit: 100,
      nextKey: nextKey,
      nextKeyId: nextKeyId,
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

    this.tokenService.getListTokenNFTFromIndexerV2(payload).subscribe(
      (res) => {
        const asset = _.get(res, `cw721_token`);
        if (asset?.length >= 100) {
          this.isMoreTx = true;
          this.nextKey = asset[asset?.length - 1]?.last_updated_height;
          this.nextKeyId = asset[asset?.length - 1]?.id;
        } else {
          this.isMoreTx = false;
        }

        asset.forEach((element) => {
          element.contract_address = this.contractAddress;
        });

        if (this.nftData.data.length > 0) {
          this.nftData.data = [...this.nftData.data, ...asset];
        } else {
          this.nftData.data = [...asset];
        }
        this.pageData.length = this.nftData.data?.length;

        this.dataSourceMobile = this.nftData.data.slice(
          this.pageData.pageIndex * this.pageData.pageSize,
          this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
        );
      },
      () => {},
      () => {
        this.loading = false;
      },
    );
  }

  pageEvent(e: PageEvent): void {
    const { length, pageIndex, pageSize } = e;
    const next = length <= (pageIndex + 2) * pageSize;
    if (next && this.nextKey && this.nextKey !== this.currentNextKey) {
      this.getNftData(this.nextKey, this.nextKeyId);
      this.currentNextKey = this.nextKey;
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
