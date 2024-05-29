import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import {
  MatLegacyDialog as MatDialog,
  MatLegacyDialogConfig as MatDialogConfig,
} from '@angular/material/legacy-dialog';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import {
  LENGTH_CHARACTER,
  MEDIA_TYPE,
  NULL_ADDRESS,
  PAGE_EVENT,
  TIMEOUT_ERROR,
} from 'src/app/core/constants/common.constant';
import { ContractVerifyType, EvmContractRegisterType } from 'src/app/core/constants/contract.enum';
import { MESSAGES_CODE_CONTRACT } from 'src/app/core/constants/messages.constant';
import { SB_TYPE } from 'src/app/core/constants/soulbound.constant';
import { CodeTransaction, ModeExecuteTransaction, StatusTransaction } from 'src/app/core/constants/transaction.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { TokenService } from 'src/app/core/services/token.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { checkTypeFile, getTypeTx } from 'src/app/core/utils/common/info-common';
import { parseError } from 'src/app/core/utils/cosmoskit/helpers/errors';
import { MediaExpandComponent } from 'src/app/shared/components/media-expand/media-expand.component';
import { EvmPopupShareComponent } from './evm-popup-share/evm-popup-share.component';
import { map, switchMap } from 'rxjs';
import { mappingMethodName } from '../../../global/global';
import { TransactionService } from '../../../core/services/transaction.service';

@Component({
  selector: 'app-nft-detail',
  templateUrl: './evm-nft-detail.component.html',
  styleUrls: ['./evm-nft-detail.component.scss'],
})
export class EvmNFTDetailComponent implements OnInit {
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  templates: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'Txn Hash' },
    { matColumnDef: 'type', headerCellDef: 'Method' },
    { matColumnDef: 'status', headerCellDef: 'Result' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
    { matColumnDef: 'from_address', headerCellDef: 'From' },
    { matColumnDef: 'to_address', headerCellDef: 'To' },
    { matColumnDef: 'price', headerCellDef: 'Price', cssClass: 'pl-5 pl-lg-0' },
  ];

  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  isSoulBound = false;
  loading = true;
  loadingTable = true;
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
  contractType = EvmContractRegisterType;

  animationUrl: string;
  imageUrl: string;
  isCW4973 = false;
  errTxt: string;
  errTxtActivity: string;
  nftType: string;

  image_s3 = this.environmentService.imageUrl;
  defaultImgToken = this.image_s3 + 'images/aura__ntf-default-img.png';
  lengthNormalAddress = LENGTH_CHARACTER.ADDRESS;
  userAddress = '';
  ContractVerifyType = ContractVerifyType;

  denom = this.environmentService.chainInfo.currencies[0].coinDenom;
  coinMinimalDenom = this.environmentService.chainInfo.currencies[0].coinMinimalDenom;
  network = this.environmentService.chainInfo;
  coinInfo = this.environmentService.chainInfo.currencies[0];
  smartContractList = [];

  constructor(
    public commonService: CommonService,
    private route: Router,
    private environmentService: EnvironmentService,
    private router: ActivatedRoute,
    private soulboundService: SoulboundService,
    private walletService: WalletService,
    private toastr: NgxToastrService,
    private contractService: ContractService,
    private dialog: MatDialog,
    public translate: TranslateService,
    private layout: BreakpointObserver,
    private tokenService: TokenService,
    private transactionService: TransactionService,
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
    this.walletService.walletAccount$.subscribe((wallet) => {
      if (wallet) {
        this.userAddress = wallet.address;
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
    this.contractService.getNFTErc721Detail(this.contractAddress, this.decodeData(this.nftId)).subscribe({
      next: (res) => {
        res = res.data[0];

        if (!res || res === null) {
          this.toastr.error('Token invalid');
          this.loading = false;
          return;
        }

        res['type'] = _.get(res, 'erc721_contract.evm_smart_contract.type') || EvmContractRegisterType.ERC721;

        this.getDataTable();

        this.nftDetail = {
          ...res,
          contract_address: res.erc721_contract?.address,
          name: _.get(res, 'erc721_contract.name'),
          owner: res.owner,
          creator: res.erc721_contract?.evm_smart_contract?.creator,
          burned: res.owner?.startsWith('0x000000000'),
          token_id: res.token_id,
          media_info: res.media_info,
          verification_status: _.get(res, 'erc721_contract.evm_smart_contract.evm_contract_verifications[0].status'),
        };
        this.nftType = checkTypeFile(this.nftDetail);

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
          } else if (this.nftType !== MEDIA_TYPE.IMG) {
            this.animationUrl = this.nftDetail?.media_info?.offchain?.animation?.url;
          } else {
            this.imageUrl = this.nftDetail?.media_info?.offchain.image?.url;
          }
        }
        if (!this.imageUrl) {
          this.imageUrl = this.nftDetail?.media_info?.onchain?.metadata?.image;
        }
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

  async getDataTable() {
    let payload = {
      contractAddr: this.contractAddress,
      tokenId: this.decodeData(this.nftId),
      isNFTDetail: true,
    };

    // this.tokenService.getERC721Transfer(payload)
    this.tokenService
      .getERC721Transfer(payload)
      .pipe(
        switchMap((res) => {
          const erc721Activities = res?.erc721_activity;
          const listTemp = erc721Activities
            ?.filter((j) => j.evm_transaction?.data?.length > 0)
            ?.map((k) => k.evm_transaction?.data?.substring(0, 8));
          const listMethodId = _.uniq(listTemp);
          return this.transactionService.getListMappingName(listMethodId).pipe(
            map((element) => {
              if (erc721Activities?.length > 0) {
                return erc721Activities.map((tx) => {
                  const methodId = _.get(tx, 'evm_transaction.data')?.substring(0, 8);
                  return {
                    ...tx,
                    type: mappingMethodName(element, methodId),
                  };
                });
              }
              return [];
            }),
          );
        }),
      )
      .pipe(
        switchMap((res) => {
          let listAddr = [];
          res.forEach((element) => {
            if (element.from) {
              listAddr.push(element.from);
            }
            if (element.to) {
              listAddr.push(element.to);
            }
          });
          const listAddrUnique = _.uniq(listAddr);
          return this.contractService.findEvmContractList(listAddrUnique).pipe(
            map((r) => {
              this.smartContractList = _.uniq((r?.evm_smart_contract || []).map((i) => i?.address));
              return res;
            }),
          );
        }),
      )
      .subscribe({
        next: (res) => {
          if (res) {
            let txs = res;
            txs.forEach((element) => {
              element['tx_hash'] = element.evm_transaction.hash;
              element['from_address'] = element.from || NULL_ADDRESS;
              element['to_address'] = element.to || NULL_ADDRESS;
              element['token_id'] = element.erc721_token.token_id;
              element['timestamp'] = element.evm_transaction.transaction.timestamp;
              element['status'] =
                element.evm_transaction.transaction.code == CodeTransaction.Success
                  ? StatusTransaction.Success
                  : StatusTransaction.Fail;
              element['type'] = element?.type;
              // if (
              //   element['action'] === ModeExecuteTransaction.Approve ||
              //   element['action'] === ModeExecuteTransaction.Revoke
              // ) {
              //   let msg = element?.tx.transaction_messages[0]?.content?.msg;
              //   if (typeof msg === 'string') {
              //     try {
              //       msg = JSON.parse(msg);
              //     } catch (e) { }
              //   }
              //   element['to_address'] = msg[Object.keys(msg)[0]]?.spender;
              // }
              // if (element.tx.transaction_messages[0].content?.funds?.length > 0) {
              //   let dataDenom = this.commonService.mappingNameIBC(
              //     element.tx.transaction_messages[0].content?.funds[0]?.denom,
              //   );
              //   element['price'] = balanceOf(
              //     element.tx.transaction_messages[0].content.funds[0]?.amount,
              //     dataDenom['decimals'],
              //   );
              //   element['denom'] = dataDenom['display'];
              // }
            });
            this.dataSource.data = txs;
            this.pageData.length = txs?.length;
          }
        },
        error: (e) => {
          if (e.name === TIMEOUT_ERROR) {
            this.errTxtActivity = e.message;
          } else {
            this.errTxtActivity = e.status + ' ' + e.statusText;
          }
          this.loadingTable = false;
        },
        complete: () => {
          this.loadingTable = false;
        },
      });
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
    const user = this.walletService.walletAccount?.address;
    let msgError = MESSAGES_CODE_CONTRACT[5].Message;
    msgError = msgError ? msgError.charAt(0).toUpperCase() + msgError.slice(1) : 'Error';
    let signResult = await this.walletService.signArbitrary(user, this.nftDetail.token_id);

    const payload = {
      signature: signResult['signature'],
      msg: true,
      pubKey: signResult['pub_key'].value,
      id: this.nftDetail?.token_id,
      status: this.sbType.PENDING,
      contractAddress: this.nftDetail?.contract_address,
    };

    try {
      this.walletService
        .executeContract(user, this.nftDetail.contract_address, data)
        .then((result) => {
          if (result?.transactionHash) {
            this.toastr.loading(result?.transactionHash);

            setTimeout(() => {
              this.toastr.success(this.translate.instant('NOTICE.SUCCESS_TRANSACTION'));
              this.updateStatusSBT(payload, user);
            }, 4000);
          }
        })
        .catch((error) => {
          const _error = parseError(error);
          if (_error?.code !== undefined) {
            this.toastr.error(msgError);
          }
        });
    } catch (error) {
      this.toastr.error(`Error: ${msgError}`);
    }
  }

  async updateStatusSBT(payload: any, address) {
    this.soulboundService.updatePickSBToken(payload).subscribe((res) => {
      this.route.navigate(['/address/', address]);
    });
  }

  shareNFT() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'grant-overlay-panel';
    this.dialog.open(EvmPopupShareComponent, dialogConfig);
  }

  isObject(data) {
    return typeof data === 'object' && data !== null;
  }

  expandMedia(): void {
    let content;
    if (this.nftType === MEDIA_TYPE.IMG) {
      content = this.imageUrl;
    } else {
      content = this.animationUrl;
    }

    if (!this.isMobileMatched) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = false;
      dialogConfig.panelClass = 'transparent-dialog';
      dialogConfig.data = {
        mediaType: this.nftType,
        mediaSrc: content,
        mediaPoster: this.imageUrl,
      };
      this.dialog.open(MediaExpandComponent, dialogConfig);
    }
  }

  decodeData(data) {
    return decodeURIComponent(data);
  }

  isEvmSmartContract(addr) {
    return this.smartContractList.filter((i) => i === addr).length > 0;
  }
}
