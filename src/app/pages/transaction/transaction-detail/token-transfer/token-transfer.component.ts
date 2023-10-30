import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnInit } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { LENGTH_CHARACTER, NULL_ADDRESS, PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { TRANSACTION_TYPE_ENUM } from 'src/app/core/constants/transaction.enum';
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
  image_s3 = this.environmentService.imageUrl;
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
    { matColumnDef: 'amount', headerCellDef: 'COMMON.AMOUNT' },
    { matColumnDef: 'transfer', headerCellDef: 'transfer' },
  ];

  templatesNFTs: Array<TableTemplate> = [
    { matColumnDef: 'nft', headerCellDef: 'nft' },
    { matColumnDef: 'transfer', headerCellDef: 'transfer' },
    { matColumnDef: 'action', headerCellDef: 'action' },
  ];
  displayedColumnsFTs: string[] = this.templatesFTs.map((dta) => dta.matColumnDef);
  displayedColumnsNFTs: string[] = this.templatesNFTs.map((dta) => dta.matColumnDef);
  denom = this.environmentService.chainInfo.currencies[0].coinDenom;
  coinDecimals = this.environmentService.chainInfo.currencies[0].coinDecimals;
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

    let coinTransfer = [];
    this.transaction['tx'].events?.forEach((element, index) => {
      //skip case index = 0, tx fee
      if (index === 0) {
        return;
      }

      if (element.type === 'coin_spent') {
        const from = element.attributes?.find((k) => k.key === 'spender')?.value;
        let to;
        if (this.transaction['tx'].events[index + 1]?.type === 'coin_received') {
          to = this.transaction['tx']?.events[index + 1]?.attributes?.find((k) => k.key === 'receiver')?.value;
        }
        let arrAmount;
        if (this.transaction['type'] === TRANSACTION_TYPE_ENUM.MultiSend) {
          this.transaction['messages'][0]?.outputs.forEach((element) => {
            to = element.address;
            let cw20_contract = {};
            let data = this.commonService.mappingNameIBC(element?.coins[0]?.denom);
            let decimal = cw20_contract['decimal'] || data['decimals'] || this.coinDecimals;
            cw20_contract['symbol'] = cw20_contract['symbol'] || data['display'] || this.denom;
            cw20_contract['name'] = cw20_contract['name'] || data['display'] || this.denom;
            let amount = element?.coins[0]?.amount.match(/\d+/g)[0];
            coinTransfer.push({ amount, cw20_contract, from, to, decimal });
          });
        } else {
          arrAmount = element.attributes?.find((k) => k.key === 'amount')?.value?.split(',');
          arrAmount?.forEach((amountTemp) => {
            let cw20_contract = {};
            let decimal = cw20_contract['decimal'] || this.coinDecimals;
            let dataAmount = {};
            cw20_contract['symbol'] = cw20_contract['symbol'] || this.denom;
            cw20_contract['name'] = cw20_contract['name'] || this.denom;
            if (amountTemp.indexOf('ibc') >= 0) {
              dataAmount = this.commonService.mappingNameIBC(amountTemp);
              cw20_contract['name'] = dataAmount['name'];
              cw20_contract['symbol'] = dataAmount['display'];
              decimal = dataAmount['decimal'];
            }
            let amount = +amountTemp.match(/\d+/g)[0];
            coinTransfer.push({ amount, cw20_contract, from, to, decimal });
          });
        }
      }
    });

    this.transactionService.getListTransferFromTx(this.transaction['tx_hash']).subscribe((res) => {
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
