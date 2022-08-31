import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { TYPE_TRANSACTION } from 'src/app/core/constants/transaction.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { Globals } from 'src/app/global/global';
import { IContractPopoverData } from 'src/app/core/models/contract.model';
import { TokenService } from 'src/app/core/services/token.service';
import { parseDataTransaction } from 'src/app/core/utils/common/info-common';
import { ModeExecuteTransaction } from 'src/app/core/constants/transaction.enum';

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
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
    { matColumnDef: 'from_address', headerCellDef: 'From' },
    { matColumnDef: 'to_address', headerCellDef: 'To' },
    { matColumnDef: 'price', headerCellDef: 'Price' },
  ];

  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);

  loading = false;
  nftId = '';
  contractAddress = '';
  nftDetail: any;
  typeTransaction = TYPE_TRANSACTION;
  contractType = ContractVerifyType.Exact_Match;
  contractVerifyType = ContractVerifyType;
  modeExecuteTransaction = ModeExecuteTransaction;

  image_s3 = this.environmentService.configValue.image_s3;
  defaultImgToken = this.image_s3 + 'images/aura__ntf-default-img.png';
  defaultLogoToken = this.image_s3 + 'images/icons/token-logo.png';

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  coinMinimalDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;

  constructor(
    public commonService: CommonService,
    public global: Globals,
    public route: Router,
    private environmentService: EnvironmentService,
    private tokenService: TokenService,
    private router: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.contractAddress = this.router.snapshot.paramMap.get('contractAddress');
    this.nftId = this.router.snapshot.paramMap.get('nftId');
    this.getNFTDetail();
    this.getDataTable();
  }

  getNFTDetail() {
    this.loading = true;
    this.tokenService.getNFTDetail(this.contractAddress, this.nftId).subscribe((res) => {
      this.nftDetail = res.data;
      this.loading = false;
    });
  }

  getDataTable(): void {
    this.tokenService
      .getListNFTDetail(
        this.contractAddress,
        this.nftId,
        this.pageData.pageSize,
        this.pageData.pageIndex * this.pageData.pageSize,
      )
      .subscribe((res) => {
        if (res && res.meta?.count > 0) {
          res.data.forEach((trans) => {
            trans['tx_response'] = JSON.parse(trans.tx);
            trans = parseDataTransaction(trans, this.coinMinimalDenom, this.contractAddress);
            this.dataSource.data = res.data;
            this.pageData.length = res.meta?.count || 0;
          });
        }
        this.loading = false;
      });
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  handlePageEvent(e: any) {
    this.pageData = e;
    this.getDataTable();
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
}
