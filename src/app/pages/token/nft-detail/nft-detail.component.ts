import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LENGTH_CHARACTER, MEDIA_TYPE, PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { TYPE_CW4973 } from 'src/app/core/constants/contract.constant';
import { ContractRegisterType, ContractVerifyType } from 'src/app/core/constants/contract.enum';
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
import { Globals, convertDataAccountTransaction } from 'src/app/global/global';
import { MediaExpandComponent } from 'src/app/shared/components/media-expand/media-expand.component';
import { PopupShareComponent } from './popup-share/popup-share.component';
import * as _ from 'lodash';
import { UserService } from 'src/app/core/services/user.service';
import { TabsAccountLink } from 'src/app/core/constants/account.enum';

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
  isCW4973 = false;

  image_s3 = this.environmentService.configValue.image_s3;
  defaultImgToken = this.image_s3 + 'images/aura__ntf-default-img.png';
  lengthNormalAddress = LENGTH_CHARACTER.ADDRESS;
  userAddress = '';
  ContractVerifyType = ContractVerifyType;

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  coinMinimalDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;
  network = this.environmentService.configValue.chain_info;
  coinInfo = this.environmentService.configValue.chain_info.currencies[0];

  constructor(
    public commonService: CommonService,
    public global: Globals,
    public route: Router,
    private environmentService: EnvironmentService,
    private router: ActivatedRoute,
    private soulboundService: SoulboundService,
    private walletService: WalletService,
    private toastr: NgxToastrService,
    private contractService: ContractService,
    private dialog: MatDialog,
    public translate: TranslateService,
    private layout: BreakpointObserver,
    private userService: UserService,
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
          if (res.name === TYPE_CW4973 && res.cw721_contract?.cw721_tokens[0]?.burned === false) {
            res['type'] = ContractRegisterType.CW4973;
            this.isSoulBound = true;
            this.linkToken = 'token-abt';
            this.isCW4973 = true;
          } else {
            this.toastr.error('Token invalid');
            this.loading = false;
            return;
          }
        }

        this.getDataTable();

        this.nftDetail = {
          ...res,
          contract_address: res.address,
          name: _.get(res.cw721_contract, 'name'),
          owner: _.get(res.cw721_contract, 'cw721_tokens[0].owner'),
          burned: _.get(res.cw721_contract, 'cw721_tokens[0].burned'),
          token_id: _.get(res.cw721_contract, 'cw721_tokens[0].token_id'),
          media_info: _.get(res.cw721_contract, 'cw721_tokens[0].media_info'),
          verification_status: _.get(res.code, 'code_id_verifications[0].verification_status'),
        };
        if (this.nftDetail?.media_info?.offchain?.image?.url) {
          this.imageUrl = this.nftDetail?.media_info?.offchain?.image?.url;
        }
        if (this.nftDetail?.media_info?.offchain?.animation?.url) {
          if (!this.nftDetail?.media_info?.offchain?.image?.url) {
            if (this.nftDetail?.media_info?.offchain?.animation?.content_type === 'image/gif') {
              this.imageUrl = this.nftDetail?.media_info?.offchain.animation?.url;
            } else {
              this.animationUrl = this.nftDetail?.media_info?.offchain?.animation?.url;
            }
          } else if (this.getTypeFile(this.nftDetail) !== MEDIA_TYPE.IMG) {
            this.animationUrl = this.nftDetail?.media_info?.offchain?.animation?.url;
          } else {
            this.imageUrl = this.nftDetail?.media_info?.offchain.image?.url;
          }
        }

        if (res.type === ContractRegisterType.CW4973) {
          this.nftDetail['isDisplayName'] = true;
          this.nftDetail['nftName'] = this.nftDetail?.media_info?.onchain?.metadata?.name || '';
        }
      },
      () => {},
      () => {
        this.loading = false;
      },
    );
  }

  async getDataTable(nextKey = null) {
    let payload = {
      limit: 200,
      heightLT: nextKey,
      contractAddr: this.contractAddress,
      isTransferTab: false,
      tokenId: this.nftId,
      isCW4973: this.isCW4973 ? true : false,
      isNFTDetail: true,
    };

    this.userService.getListNFTByAddress(payload).subscribe(
      (res) => {
        if (res) {
          let txs = convertDataAccountTransaction(res, this.coinInfo, TabsAccountLink.NftTxs, false, null);
          txs.forEach((element, index) => {
            element['token_id'] = element.tokenId;
            element['type'] = element.arrEvent[0]?.type?.replace('Contract: ', '');
            element['from_address'] = element.fromAddress;
            element['to_address'] = element.toAddress;
            if (element['type'] === 'approve' || element['type'] === 'revoke') {
              element['to_address'] =
                element.eventAttr?.find((k) => k.composite_key === 'wasm.spender')?.value || element['to_address'];
            }
            if (this.isCW4973) {
              if (element['type'] === 'mint') {
                element['type'] = 'take';
              } else if (element['type'] === 'burn') {
                element['type'] = 'unequip';
              }
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
