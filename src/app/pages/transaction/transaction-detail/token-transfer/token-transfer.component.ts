import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { LENGTH_CHARACTER, NULL_ADDRESS, PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { TransactionService } from 'src/app/core/services/transaction.service';

@Component({
  selector: 'app-token-transfer',
  templateUrl: './token-transfer.component.html',
  styleUrls: ['./token-transfer.component.scss'],
})
export class TokenTransferComponent implements OnInit {
  @Input() transaction: Number;
  image_s3 = this.environmentService.configValue.image_s3;
  defaultLogoToken = this.image_s3 + 'images/icons/token-logo.png';
  nullAddress = NULL_ADDRESS;
  dataSourceFTs = new MatTableDataSource<any>([]);
  dataSourceNFTs = new MatTableDataSource<any>([]);
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 10,
    pageIndex: 1,
  };
  templatesFTs: Array<TableTemplate> = [
    { matColumnDef: 'assets', headerCellDef: 'assets' },
    { matColumnDef: 'amount', headerCellDef: 'amount' },
    { matColumnDef: 'transfer', headerCellDef: 'transfer' },
  ];

  templatesNFTs: Array<TableTemplate> = [
    { matColumnDef: 'nft', headerCellDef: 'nft' },
    { matColumnDef: 'transfer', headerCellDef: 'transfer' },
    { matColumnDef: 'action', headerCellDef: 'action' },
  ];
  displayedColumnsFTs: string[] = this.templatesFTs.map((dta) => dta.matColumnDef);
  displayedColumnsNFTs: string[] = this.templatesNFTs.map((dta) => dta.matColumnDef);
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  coinDecimals = this.environmentService.configValue.chain_info.currencies[0].coinDecimals;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  constructor(
    private environmentService: EnvironmentService,
    public router: Router,
    private transactionService: TransactionService,
    private layout: BreakpointObserver,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    if (this.transaction['status'] == 'Fail') {
      return;
    }

    this.transactionService.getListTransferFromTx(this.transaction['tx_hash']).subscribe((res) => {
      // res.cw20_activity = [];
      let coinTransfer = res.coin_transfer?.map((element) => {
        let cw20_contract = {};
        cw20_contract['symbol'] = cw20_contract['symbol'] || this.denom;
        cw20_contract['name'] = cw20_contract['name'] || this.denom;
        const amountTemp = element.event_attributes.find((k) => k.composite_key === 'transfer.amount')?.value;
        let decimal = cw20_contract['decimal'] || this.coinDecimals;
        if (amountTemp.indexOf('ibc') >= 0) {
          let dataAmount = this.commonService.mappingNameIBC(amountTemp);
          cw20_contract['name'] = dataAmount['name'];
          cw20_contract['symbol'] = dataAmount['display'];
          decimal = dataAmount['decimal'];
        }
        let amount = +amountTemp.match(/\d+/g)[0];
        const from = element.event_attributes.find((k) => k.composite_key === 'transfer.sender')?.value;
        const to = element.event_attributes.find((k) => k.composite_key === 'transfer.recipient')?.value;
        return { amount, cw20_contract, from, to, decimal };
      });

      if (res?.cw721_activity?.length > 0) {
        // remove record approve && revoke
        const arrCW721 = res.cw721_activity?.filter((k) => k.action !== 'approve' && k.action !== 'revoke');
        this.dataSourceNFTs.data = arrCW721;
      }
      if (res.cw20_activity?.length > 0 || coinTransfer?.length > 0) {
        this.dataSourceFTs.data = [...coinTransfer, ...(res.cw20_activity || [])];

        res.cw20_activity.forEach((element) => {
          element.decimal = element.decimal || element.cw20_contract?.decimal || 6;
        });
      }
    });
  }

  navigateToNFTDetail(address: string, tokenId: number): void {
    this.router.navigate([`/tokens/token-nft/${address}/${tokenId}`]);
  }

  isContractAddress(address) {
    if (address?.startsWith('aura') && address?.length === LENGTH_CHARACTER.CONTRACT) {
      return true;
    }
    return false;
  }
}
