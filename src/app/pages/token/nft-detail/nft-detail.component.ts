import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { LENGTH_CHARACTER, LIST_TYPE_CONTRACT_ADDRESS, PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { ContractRegisterType, ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { TYPE_TRANSACTION } from 'src/app/core/constants/transaction.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { Globals } from 'src/app/global/global';
import { IContractPopoverData } from 'src/app/core/models/contract.model';
import { TokenService } from 'src/app/core/services/token.service';
import { checkTypeFile, parseDataTransaction } from 'src/app/core/utils/common/info-common';
import { ModeExecuteTransaction } from 'src/app/core/constants/transaction.enum';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { getKeplr } from 'src/app/core/utils/keplr';
import { WalletService } from 'src/app/core/services/wallet.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { MESSAGES_CODE } from 'src/app/core/constants/messages.constant';
import { ContractService } from 'src/app/core/services/contract.service';

@Component({
  selector: 'app-nft-detail',
  templateUrl: './nft-detail.component.html',
  styleUrls: ['./nft-detail.component.scss'],
})
export class NFTDetailComponent implements OnInit {
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  templates: Array<TableTemplate> = [
    // { matColumnDef: 'popover', headerCellDef: '' },
    { matColumnDef: 'tx_hash', headerCellDef: 'Txn Hash' },
    { matColumnDef: 'type', headerCellDef: 'Method' },
    { matColumnDef: 'status', headerCellDef: 'Result' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
    { matColumnDef: 'from_address', headerCellDef: 'From' },
    { matColumnDef: 'to_address', headerCellDef: 'To' },
    { matColumnDef: 'price', headerCellDef: 'Price' },
  ];

  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  isSoulBound = false;
  loading = false;
  nftId = '';
  contractAddress = '';
  nftDetail: any;
  typeTransaction = TYPE_TRANSACTION;

  contractVerifyType = ContractVerifyType;
  modeExecuteTransaction = ModeExecuteTransaction;
  nextKey = null;
  currentKey: string;
  nftType: string;
  isError = false;
  nftUrl = '';

  image_s3 = this.environmentService.configValue.image_s3;
  defaultImgToken = this.image_s3 + 'images/aura__ntf-default-img.png';
  defaultLogoToken = this.image_s3 + 'images/icons/token-logo.png';
  lengthNormalAddress = LENGTH_CHARACTER.ADDRESS;

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  coinMinimalDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;
  network = this.environmentService.configValue.chain_info;

  constructor(
    public commonService: CommonService,
    public global: Globals,
    public route: Router,
    private environmentService: EnvironmentService,
    private tokenService: TokenService,
    private router: ActivatedRoute,
    private soulboundService: SoulboundService,
    private walletService: WalletService,
    private toastr: NgxToastrService,
    private contractService: ContractService,
  ) {}

  ngOnInit(): void {
    this.contractAddress = this.router.snapshot.paramMap.get('contractAddress');
    this.nftId = this.router.snapshot.paramMap.get('nftId');
    this.getNFTDetail();
    // this.getSBTDetail();
    this.getDataTable();
  }

  error(): void {
    this.isError = true;
  }

  getNFTDetail() {
    this.loading = true;
    const encoded = encodeURIComponent(this.nftId);
    this.contractService.getNFTDetail(this.contractAddress, encoded).subscribe((res) => {
      this.nftDetail = res.data;
      if (this.nftDetail.type === ContractRegisterType.CW721) {
        if (this.nftDetail?.asset_info?.data?.info?.extension?.image?.indexOf('twilight') > 1) {
          this.nftDetail['isDisplayName'] = true;
          this.nftDetail['nftName'] = this.nftDetail?.asset_info?.data?.info?.extension?.name || '';
        }

        this.nftType = checkTypeFile(this.nftDetail);
        if (this.nftDetail.animation && this.nftDetail.animation?.content_type) {
          this.nftUrl = this.nftDetail.animation?.link_s3 || '';
        }
        if (this.nftDetail.image && this.nftUrl == '') {
          this.nftUrl = this.nftDetail.image?.link_s3 || '';
        }
      } else if (this.nftDetail.type === ContractRegisterType.CW4973) {
        this.isSoulBound = true;
      }

      this.loading = false;
    });
  }

  // async getSBTDetail() {
  //   this.loading = true;
  //   const encoded = encodeURIComponent(this.nftId);
  //   this.soulboundService.getSBTDetail(encoded).subscribe((res) => {
  //     this.nftDetail = res;
  //     this.isSoulBound = true;
  //     this.loading = false;
  //   });
  // }

  async getDataTable(nextKey = null) {
    let filterData = {};
    filterData['keyWord'] = this.nftId;

    const res = await this.tokenService.getListTokenTransferIndexer(100, this.contractAddress, filterData, nextKey);
    if (res?.data?.code === 200) {
      res?.data?.data?.transactions.forEach((trans) => {
        trans = parseDataTransaction(trans, this.coinMinimalDenom, this.contractAddress);
      });
      let txs = [];
      res.data?.data?.transactions.forEach((element, index) => {
        txs.push(element);
        if (element.type === 'buy') {
          let txTransfer = { ...element };
          txTransfer['type'] = 'transfer';
          txTransfer['price'] = 0;
          txs.push(txTransfer);
        }
      });
      this.dataSource.data = txs;
      this.pageData.length = txs?.length;
    }
    this.loading = false;
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  handlePageEvent(e: any) {
    const { length, pageIndex, pageSize } = e;
    const next = length <= (pageIndex + 2) * pageSize;
    this.pageData = e;
    if (next && this.nextKey && this.currentKey !== this.nextKey) {
      this.getDataTable(this.nextKey);
      this.currentKey = this.nextKey;
    }
  }

  copyData(text: string) {
    const dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    // fake event click out side copy button
    // this event for hidden tooltip
    setTimeout(function () {
      document.getElementById('popupCopy').click();
    }, 800);
  }

  getPopoverData(data): IContractPopoverData {
    return {
      amount: data?.value || 0,
      code: Number(data?.tx_response?.code),
      fee: data?.fee || 0,
      from_address: data?.from_address || '',
      to_address: data?.to_address || '',
      price: 0,
      status: data?.status,
      symbol: this.denom,
      // tokenAddress: this.contractInfo?.contractsAddress,
      tokenAddress: '',
      tx_hash: data?.tx_hash || '',
      gas_used: data?.tx_response?.gas_used,
      gas_wanted: data?.tx_response?.gas_wanted,
      nftDetail: this.nftDetail,
      modeExecute: data?.modeExecute,
    };
  }

  isContractAddress(type, address) {
    if (LIST_TYPE_CONTRACT_ADDRESS.includes(type) && address?.length > LENGTH_CHARACTER.ADDRESS) {
      return true;
    }
    return false;
  }

  async updatePickSBT(isPick) {
    const minter = this.walletService.wallet?.bech32Address;
    const keplr = await getKeplr();
    let dataKeplr = await keplr.signArbitrary(this.network.chainId, minter, isPick);

    const payload = {
      signature: dataKeplr.signature,
      msg: isPick,
      pubKey: dataKeplr.pub_key.value,
      id: this.nftDetail?.token_id,
    };

    this.soulboundService.updatePickSBToken(payload).subscribe((res) => {
      if (res?.code) {
        let msgError = res?.message.toString() || 'Error';
        this.toastr.error(msgError);
      } else {
        this.toastr.success(MESSAGES_CODE.SUCCESSFUL.Message);
      }
    });
  }
}
