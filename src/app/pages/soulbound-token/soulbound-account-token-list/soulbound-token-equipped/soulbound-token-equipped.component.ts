import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ActivatedRoute } from '@angular/router';
import { MEDIA_TYPE, PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MESSAGES_CODE } from 'src/app/core/constants/messages.constant';
import { SB_TYPE } from 'src/app/core/constants/soulbound.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { CommonService } from 'src/app/core/services/common.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { checkTypeFile } from 'src/app/core/utils/common/info-common';

@Component({
  selector: 'app-soulbound-token-equipped',
  templateUrl: './soulbound-token-equipped.component.html',
  styleUrls: ['./soulbound-token-equipped.component.scss'],
})
export class SoulboundTokenEquippedComponent implements OnInit {
  @Input() reloadAPI: boolean = false;
  @Output() totalSBT = new EventEmitter<number>();
  MEDIA_TYPE = MEDIA_TYPE;
  textSearch = '';
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  countSelected = 0;
  loading = true;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  // soulboundData param use for paginator
  soulboundData: MatTableDataSource<any> = new MatTableDataSource();
  userAddress = '';
  sbType = SB_TYPE;
  walletAddress = null;
  searchValue = '';
  isError = false;

  constructor(
    private soulboundService: SoulboundService,
    private route: ActivatedRoute,
    private walletService: WalletService,
    public commonService: CommonService,
    private contractService: ContractService,
    private toastr: NgxToastrService,
  ) {}

  ngOnInit(): void {
    this.walletService.wallet$.subscribe((wallet) => {
      this.walletAddress = this.walletService.wallet?.bech32Address;
    });

    this.route.params.subscribe((params) => {
      if (params?.address) {
        this.userAddress = params?.address;
        this.getListSB();
      }
    });
  }

  ngOnChanges(): void {
    if (this.reloadAPI) {
      setTimeout(() => {
        this.getListSB();
      }, 4000);
    }
  }

  searchToken() {
    this.textSearch = this.searchValue;
    this.getListSB();
  }

  resetSearch() {
    this.textSearch = '';
    this.searchValue = '';
    this.getListSB();
  }

  getListSB() {
    this.textSearch = this.searchValue = this.textSearch?.trim();
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      receiverAddress: this.userAddress,
      isEquipToken: true,
      keyword: this.textSearch,
    };

    this.soulboundService.getListSoulboundByAddress(payload).subscribe(
      (res) => {
        this.countSelected = res.data.filter((k) => k.picked)?.length || 0;
        this.soulboundData.data = res.data;
        this.pageData.length = res.meta.count;
        this.totalSBT.emit(this.pageData.length);
      },
      () => {},
      () => {
        this.loading = false;
      },
    );
  }

  paginatorEmit(event): void {
    if (this.soulboundData) {
      this.soulboundData.paginator = event;
    }
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getListSB();
  }

  getSBTDetail(contractAddress, tokenID, pick = true) {
    this.contractService.getDetailCW4973(contractAddress, tokenID).subscribe((res) => {
      if (res?.data) {
        this.updatePick(res.data, pick);
      }
    });
  }

  async updatePick(data, pick = true) {
    let dataWallet = await this.walletService.getWalletSign(this.walletAddress, data.token_id);
    const payload = {
      signature: dataWallet['signature'],
      msg: data.token_id.toString(),
      pubKey: dataWallet['pub_key']?.value,
      id: data.token_id,
      picked: pick,
      contractAddress: data.contract_address,
    };

    this.soulboundService.pickSBToken(payload).subscribe((res) => {
      if (res.code && res.code !== 200) {
        this.toastr.error(res.message);
      } else {
        setTimeout(() => {
          this.toastr.success(MESSAGES_CODE.SUCCESSFUL.Message);
          this.getListSB();
        }, 4000);
      }
    });
  }

  getTypeFile(nft: any) {
    let nftType = checkTypeFile(nft);
    return nftType;
  }

  handleRouterLink(link): void {
    window.location.href = link;
  }

  error(): void {
    this.isError = true;
  }
}
