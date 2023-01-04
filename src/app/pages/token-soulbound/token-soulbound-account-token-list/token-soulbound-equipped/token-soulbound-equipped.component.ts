import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MatTableDataSource } from '@angular/material/table';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { ActivatedRoute } from '@angular/router';
import { SB_TYPE } from 'src/app/core/constants/soulbound.constant';
import { getKeplr } from 'src/app/core/utils/keplr';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';

@Component({
  selector: 'app-token-soulbound-equipped',
  templateUrl: './token-soulbound-equipped.component.html',
  styleUrls: ['./token-soulbound-equipped.component.scss'],
})
export class TokenSoulboundEquippedComponent implements OnInit {
  @Output() totalSBT = new EventEmitter<number>();

  textSearch = '';
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  tokenList = [];
  countSelected = 0;
  loading = false;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  // soulboundData param use for paginator
  soulboundData: MatTableDataSource<any> = new MatTableDataSource();
  showData: any[];
  nextKey = null;
  currentKey = null;
  userAddress = '';
  sbType = SB_TYPE;
  network = this.environmentService.configValue.chain_info;

  constructor(
    private soulboundService: SoulboundService,
    private route: ActivatedRoute,
    private environmentService: EnvironmentService,
    private walletService: WalletService,
    public commonService: CommonService,
    private contractService: ContractService,
    private toastr: NgxToastrService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params?.address) {
        this.userAddress = params?.address;
        this.getListSB();
      }
    });
  }

  searchToken() {
    this.getListSB(this.textSearch);
  }

  resetSearch() {
    this.textSearch = '';
    this.getListSB();
  }

  getListSB(keySearch = '') {
    this.loading = true;
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      receiverAddress: this.userAddress,
      isEquipToken: true,
      keyword: keySearch?.trim(),
    };

    this.soulboundService.getListSoulboundByAddress(payload).subscribe((res) => {
      console.log(res);

      this.countSelected = res.data.filter((k) => k.picked)?.length || 0;
      this.soulboundData.data = res.data;
      this.pageData.length = res.meta.count;
      this.totalSBT.emit(this.pageData.length);
    });
    this.loading = false;
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
    this.contractService.getNFTDetail(contractAddress, tokenID).subscribe((res) => {
      if (res?.data) {
        this.updatePick(res.data, pick);
      }
    });
  }

  async updatePick(data, pick = true) {
    const currentAddress = this.walletService.wallet?.bech32Address;
    // const keplr = await getKeplr();
    // let dataKeplr = await keplr.signArbitrary(this.network.chainId, currentAddress, data.token_id.toString());

    const payload = {
      signature: data.signature,
      msg: data.token_id.toString(),
      pubKey: data.pub_key,
      id: data.token_id,
      picked: true || pick,
    };

    this.soulboundService.pickSBToken(payload).subscribe((res) => {
      console.log(res);
      if (res.code) {
        this.toastr.error(res.message);
      } else {
        setTimeout(() => {
          this.getListSB();
        }, 4000);
      }
    });
  }

  encodeURI(tokenID) {
    return encodeURIComponent(tokenID);
  }
}
