import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  LENGTH_CHARACTER,
  LIST_TYPE_CONTRACT_ADDRESS,
  MEDIA_TYPE,
  PAGE_EVENT,
} from 'src/app/core/constants/common.constant';
import { TYPE_CW4973 } from 'src/app/core/constants/contract.constant';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { MESSAGES_CODE_CONTRACT } from 'src/app/core/constants/messages.constant';
import { SB_TYPE } from 'src/app/core/constants/soulbound.constant';
import { ModeExecuteTransaction } from 'src/app/core/constants/transaction.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { IContractPopoverData } from 'src/app/core/models/contract.model';
import { CommonService } from 'src/app/core/services/common.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { checkTypeFile, parseDataTransaction } from 'src/app/core/utils/common/info-common';
import { Globals } from 'src/app/global/global';
import { MediaExpandComponent } from 'src/app/shared/components/media-expand/media-expand.component';
import { PopupShareComponent } from './popup-share/popup-share.component';

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
  loading = true;
  nftId = '';
  contractAddress = '';
  nftDetail: any;
  MEDIA_TYPE = MEDIA_TYPE;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  isMobileMatched = false;

  modeExecuteTransaction = ModeExecuteTransaction;
  nextKey = null;
  currentKey: string;
  isError = false;
  sbType = SB_TYPE;
  contractType = ContractRegisterType;
  linkToken = 'token-nft';
  animationUrl: string;
  imageUrl: string;

  image_s3 = this.environmentService.configValue.image_s3;
  defaultImgToken = this.image_s3 + 'images/aura__ntf-default-img.png';
  lengthNormalAddress = LENGTH_CHARACTER.ADDRESS;
  userAddress = '';

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  coinMinimalDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;
  network = this.environmentService.configValue.chain_info;

  constructor(
    public commonService: CommonService,
    public global: Globals,
    public route: Router,
    private environmentService: EnvironmentService,
    private transactionService: TransactionService,
    private router: ActivatedRoute,
    private soulboundService: SoulboundService,
    private walletService: WalletService,
    private toastr: NgxToastrService,
    private contractService: ContractService,
    private dialog: MatDialog,
    public translate: TranslateService,
    private layout: BreakpointObserver,
  ) {
    this.breakpoint$.subscribe((state) => {
      if (state) {
        this.isMobileMatched = state.matches;
      }
    });
  }

  ngOnInit(): void {
    this.contractAddress = this.router.snapshot.paramMap.get('contractAddress');
    this.nftId = this.router.snapshot.paramMap.get('nftId');
    this.getDataTable();
    this.walletService.wallet$.subscribe((wallet) => {
      if (wallet) {
        this.userAddress = wallet.bech32Address;
      } else {
        this.userAddress = null;
      }
    });
    this.getNFTDetail();
  }

  error(): void {
    this.isError = true;
  }

  getNFTDetail() {
    const encoded = encodeURIComponent(this.nftId);
    this.contractService.getNFTDetail(this.contractAddress, encoded).subscribe(
      (res) => {
        res = res.data[0];

        if (!res || res === null) {
          this.toastr.error('Token invalid');
          this.loading = false;
          return;
        }

        res['type'] = res['type'] || ContractRegisterType.CW721;
        if (this.router.snapshot.url[0]?.path === 'token-abt') {
          if (res.cw721_contract?.smart_contract?.name === TYPE_CW4973 && res.burned === false) {
            res['type'] = ContractRegisterType.CW4973;
            this.isSoulBound = true;
            this.linkToken = 'token-abt';
          } else {
            this.toastr.error('Token invalid');
            this.loading = false;
            return;
          }
        }

        this.nftDetail = {
          ...res,
          contract_address: res.data?.contract_address || res?.cw721_contract?.smart_contract?.address,
          creator: res.data?.creator || res?.cw721_contract?.smart_contract?.creator,
          name: res.name || res?.cw721_contract?.name,
        };

        if (res.type !== ContractRegisterType.CW4973) {
          if (this.nftDetail?.asset_info?.data?.info?.extension?.image?.indexOf('twilight') > 1) {
            this.nftDetail['isDisplayName'] = true;
            this.nftDetail['nftName'] = this.nftDetail?.asset_info?.data?.info?.extension?.name || '';
          }
          if (this.nftDetail?.image?.link_s3 || this.nftDetail?.media_info?.offchain?.image?.url) {
            this.imageUrl = this.nftDetail.image?.link_s3 || this.nftDetail?.media_info?.offchain?.image?.url;
          }
          if (this.nftDetail.animation?.link_s3 || this.nftDetail?.media_info?.offchain?.animation?.url) {
            if (!this.nftDetail?.image?.link_s3) {
              if (
                (this.nftDetail.animation?.content_type ||
                  this.nftDetail?.media_info?.offchain?.animation?.content_type) === 'image/gif'
              ) {
                this.imageUrl =
                  this.nftDetail.animation?.link_s3 || this.nftDetail?.media_info?.offchain.animation?.url;
              } else {
                this.animationUrl =
                  this.nftDetail.animation?.link_s3 || this.nftDetail?.media_info?.offchain?.animation?.url;
              }
            } else if (this.getTypeFile(this.nftDetail) !== MEDIA_TYPE.IMG) {
              this.animationUrl =
                this.nftDetail.animation?.link_s3 || this.nftDetail?.media_info?.offchain?.animation?.url;
            } else {
              this.imageUrl = this.nftDetail?.image?.link_s3 || this.nftDetail?.media_info?.offchain.image?.url;
            }
          }
        }

        if (res.type === ContractRegisterType.CW4973) {
          if (this.nftDetail?.media_info?.offchain?.image?.url) {
            this.imageUrl = this.nftDetail?.media_info?.offchain?.image?.url;
          }
          if (this.nftDetail?.media_info?.offchain.animation?.url) {
            if (!this.nftDetail?.media_info?.offchain?.image?.url) {
              if (this.nftDetail.img_type === 'image/gif') {
                this.imageUrl = this.nftDetail?.media_info?.offchain.animation?.url;
              } else {
                this.animationUrl = this.nftDetail?.media_info?.offchain.animation?.url;
              }
            } else if (this.getTypeFile(this.nftDetail) !== MEDIA_TYPE.IMG) {
              this.animationUrl = this.nftDetail?.media_info?.offchain.animation?.url;
            } else {
              this.imageUrl = this.nftDetail?.media_info?.offchain?.image?.url;
            }
          }

          if (this.nftDetail?.media_info?.onchain?.metadata?.name) {
            this.nftDetail['isDisplayName'] = true;
            this.nftDetail['nftName'] = this.nftDetail?.media_info?.onchain?.metadata?.name || '';
          }
        }
      },
      () => {},
      () => {
        this.loading = false;
      },
    );
  }

  async getDataTable(nextKey = null) {
    const payload = {
      limit: 100,
      value: this.contractAddress,
      compositeKey: 'execute._contract_address',
      key2: 'token_id',
      value2: this.nftId,
      heightLT: nextKey,
    };

    this.transactionService.getListTxMultiCondition(payload).subscribe(
      (res) => {
        if (res) {
          this.nextKey = null;
          if (res.transaction.length >= 100) {
            this.nextKey = res?.transaction[res.transaction.length - 1].height;
          }
          res?.transaction.forEach((trans) => {
            trans = parseDataTransaction(trans, this.coinMinimalDenom, this.contractAddress);
          });
          let txs = [];
          res?.transaction.forEach((element, index) => {
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
      },
      () => {},
      () => {
        this.loading = false;
      },
    );
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

  async unEquipSBT() {
    const executeUnEquipMsg = {
      unequip: {
        token_id: this.nftDetail.token_id,
      },
    };
    this.execute(executeUnEquipMsg);
  }

  async execute(data) {
    const user = this.walletService.wallet?.bech32Address;
    let msgError = MESSAGES_CODE_CONTRACT[5].Message;
    msgError = msgError ? msgError.charAt(0).toUpperCase() + msgError.slice(1) : 'Error';
    let dataWallet = await this.walletService.getWalletSign(user, this.nftDetail.token_id);

    const payload = {
      signature: dataWallet['signature'],
      msg: true,
      pubKey: dataWallet['pub_key'].value,
      id: this.nftDetail?.token_id,
      status: this.sbType.PENDING,
      contractAddress: this.nftDetail?.contract_address,
    };

    let feeGas = {
      amount: [
        {
          amount: (this.network.gasPriceStep?.average || 0.0025).toString(),
          denom: this.network.currencies[0].coinMinimalDenom,
        },
      ],
      gas: '200000',
    };

    try {
      this.walletService
        .execute(user, this.nftDetail.contract_address, data, feeGas)
        .then((e) => {
          if ((e as any).result?.error) {
            this.toastr.error(msgError);
          } else {
            if ((e as any)?.transactionHash) {
              this.toastr.loading((e as any)?.transactionHash);
              setTimeout(() => {
                this.toastr.success(this.translate.instant('NOTICE.SUCCESS_TRANSACTION'));
                this.updateStatusSBT(payload, user);
              }, 4000);
            }
          }
        })
        .catch((error) => {
          if (!error.toString().includes('Request rejected')) {
            this.toastr.error(msgError);
          }
        });
    } catch (error) {
      this.toastr.error(`Error: ${msgError}`);
    }
  }

  async updateStatusSBT(payload: any, address) {
    this.soulboundService.updatePickSBToken(payload).subscribe((res) => {
      this.route.navigate(['/account/', address]);
    });
  }

  shareNFT() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'grant-overlay-panel';
    this.dialog.open(PopupShareComponent, dialogConfig);
  }

  isObject(data) {
    return typeof data === 'object' && data !== null;
  }

  replaceImgIpfs(value) {
    return this.environmentService.configValue.ipfsDomain + value.replace('://', '/');
  }

  expandMedia(): void {
    let content;
    if (this.getTypeFile(this.nftDetail) === MEDIA_TYPE.IMG) {
      content = this.imageUrl;
    } else {
      content = this.animationUrl;
    }

    if (!this.isMobileMatched) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = false;
      dialogConfig.panelClass = 'transparent-dialog';
      dialogConfig.data = {
        mediaType: this.getTypeFile(this.nftDetail),
        mediaSrc: content,
        mediaPoster: this.imageUrl,
      };
      this.dialog.open(MediaExpandComponent, dialogConfig);
    }
  }

  getTypeFile(nft: any) {
    let nftType = checkTypeFile(nft);
    return nftType;
  }
}
