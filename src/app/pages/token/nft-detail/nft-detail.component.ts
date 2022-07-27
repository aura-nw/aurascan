import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { TYPE_TRANSACTION } from 'src/app/core/constants/transaction.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { Globals } from 'src/app/global/global';
import {IContractPopoverData} from "src/app/core/models/contract.model";

@Component({
  selector: 'app-nft-detail',
  templateUrl: './nft-detail.component.html',
  styleUrls: ['./nft-detail.component.scss'],
})
export class NFTDetailComponent implements OnInit {
  mockData = [
    {
      tx_hash: '53A07DF09A57D2EE56C32D8C6DCC8FEE84069BC1F2F7676698D91BD435614E40',
      type: '/cosmos.bank.v1beta1.MsgSend',
      timestamp: '2022-05-20T03:44:57.000Z',
      from_address: 'aura1fceaesaz0fpckeeyt4dt6l6cd7nk7f7gsjpk8f',
      to_address: 'aura1kqmvuhlyj68l37vf7k7f6umvq400u5q88kx5wq',
      amount: '1000',
      code: '1',
    },
    {
      tx_hash: '53A07DF09A57D2EE56C32D8C6DCC8FEE84069BC1F2F7676698D91BD435614E41',
      type: '/ibc.applications.transfer.v1.MsgTransfer',
      timestamp: '2022-05-20T03:44:57.000Z',
      from_address: 'aura1kqmvuhlyj68l37vf7k7f6umvq400u5q88kx5wq',
      to_address: 'aura1fceaesaz0fpckeeyt4dt6l6cd7nk7f7gsjpk8f',
      amount: '100',
      code: '0',
    },
    {
      tx_hash: '53A07DF09A57D2EE56C32D8C6DCC8FEE84069BC1F2F7676698D91BD435614E42',
      type: '/cosmos.bank.v1beta1.MsgMultiSend',
      timestamp: '2022-05-20T03:44:57.000Z',
      from_address: 'aura1fceaesaz0fpckeeyt4dt6l6cd7nk7f7gsjpk8k',
      to_address: 'aura1kqmvuhlyj68l37vf7k7f6umvq400u5q88kx5wq',
      amount: '10',
      code: '0',
    },
    {
      tx_hash: '53A07DF09A57D2EE56C32D8C6DCC8FEE84069BC1F2F7676698D91BD435614E43',
      type: '/cosmos.slashing.v1beta1.MsgUnjail',
      timestamp: '2022-05-20T03:44:57.000Z',
      from_address: 'aura1kqmvuhlyj68l37vf7k7f6umvq400u5q88kx5wq',
      to_address: 'aura1fceaesaz0fpckeeyt4dt6l6cd7nk7f7gsjpk8k',
      amount: '1',
      code: '0',
    },
    {
      tx_hash: '53A07DF09A57D2EE56C32D8C6DCC8FEE84069BC1F2F7676698D91BD435614E40',
      type: '/cosmos.bank.v1beta1.MsgSend',
      timestamp: '2022-05-20T03:44:57.000Z',
      from_address: 'aura1fceaesaz0fpckeeyt4dt6l6cd7nk7f7gsjpk8k',
      to_address: 'aura1kqmvuhlyj68l37vf7k7f6umvq400u5q88kx5wq',
      amount: '1000',
      code: '0',
    },
    {
      tx_hash: '53A07DF09A57D2EE56C32D8C6DCC8FEE84069BC1F2F7676698D91BD435614E40',
      type: '/ibc.applications.transfer.v1.MsgTransfer',
      timestamp: '2022-05-20T03:44:57.000Z',
      from_address: 'aura1kqmvuhlyj68l37vf7k7f6umvq400u5q88kx5wq',
      to_address: 'aura1fceaesaz0fpckeeyt4dt6l6cd7nk7f7gsjpk8k',
      amount: '100',
      code: '0',
    },
    {
      tx_hash: '53A07DF09A57D2EE56C32D8C6DCC8FEE84069BC1F2F7676698D91BD435614E40',
      type: '/ibc.applications.transfer.v1.MsgTransfer',
      timestamp: '2022-05-20T03:44:57.000Z',
      from_address: 'aura1kqmvuhlyj68l37vf7k7f6umvq400u5q88kx5wq',
      to_address: 'aura1fceaesaz0fpckeeyt4dt6l6cd7nk7f7gsjpk8k',
      amount: '100',
      code: '1',
    },
    {
      tx_hash: '53A07DF09A57D2EE56C32D8C6DCC8FEE84069BC1F2F7676698D91BD435614E40',
      type: '/cosmos.bank.v1beta1.MsgMultiSend',
      timestamp: '2022-05-20T03:44:57.000Z',
      from_address: 'aura1fceaesaz0fpckeeyt4dt6l6cd7nk7f7gsjpk8k',
      to_address: 'aura1kqmvuhlyj68l37vf7k7f6umvq400u5q88kx5wq',
      amount: '10',
      code: '0',
    },
    {
      tx_hash: '53A07DF09A57D2EE56C32D8C6DCC8FEE84069BC1F2F7676698D91BD435614E40',
      type: '/cosmos.slashing.v1beta1.MsgUnjail',
      timestamp: '2022-05-20T03:44:57.000Z',
      from_address: 'aura1kqmvuhlyj68l37vf7k7f6umvq400u5q88kx5wq',
      to_address: 'aura1fceaesaz0fpckeeyt4dt6l6cd7nk7f7gsjpk8k',
      amount: '1',
      code: '0',
    },
    {
      tx_hash: '53A07DF09A57D2EE56C32D8C6DCC8FEE84069BC1F2F7676698D91BD435614E40',
      type: '/cosmos.bank.v1beta1.MsgSend',
      timestamp: '2022-05-20T03:44:57.000Z',
      from_address: 'aura1fceaesaz0fpckeeyt4dt6l6cd7nk7f7gsjpk8k',
      to_address: 'aura1kqmvuhlyj68l37vf7k7f6umvq400u5q88kx5wq',
      amount: '1000',
      code: '0',
    },
    {
      tx_hash: '53A07DF09A57D2EE56C32D8C6DCC8FEE84069BC1F2F7676698D91BD435614E40',
      type: '/ibc.applications.transfer.v1.MsgTransfer',
      timestamp: '2022-05-20T03:44:57.000Z',
      from_address: 'aura1kqmvuhlyj68l37vf7k7f6umvq400u5q88kx5wq',
      to_address: 'aura1fceaesaz0fpckeeyt4dt6l6cd7nk7f7gsjpk8k',
      amount: '100',
      code: '0',
    },
    {
      tx_hash: '53A07DF09A57D2EE56C32D8C6DCC8FEE84069BC1F2F7676698D91BD435614E40',
      type: '/cosmos.bank.v1beta1.MsgMultiSend',
      timestamp: '2022-05-20T03:44:57.000Z',
      from_address: 'aura1fceaesaz0fpckeeyt4dt6l6cd7nk7f7gsjpk8k',
      to_address: 'aura1kqmvuhlyj68l37vf7k7f6umvq400u5q88kx5wq',
      amount: '10',
      code: '0',
    },
    {
      tx_hash: '53A07DF09A57D2EE56C32D8C6DCC8FEE84069BC1F2F7676698D91BD435614E40',
      type: '/cosmos.slashing.v1beta1.MsgUnjail',
      timestamp: '2022-05-20T03:44:57.000Z',
      from_address: 'aura1kqmvuhlyj68l37vf7k7f6umvq400u5q88kx5wq',
      to_address: 'aura1fceaesaz0fpckeeyt4dt6l6cd7nk7f7gsjpk8k',
      amount: '1',
      code: '0',
    },
    {
      tx_hash: '53A07DF09A57D2EE56C32D8C6DCC8FEE84069BC1F2F7676698D91BD435614E40',
      type: '/cosmos.bank.v1beta1.MsgSend',
      timestamp: '2022-05-20T03:44:57.000Z',
      from_address: 'aura1fceaesaz0fpckeeyt4dt6l6cd7nk7f7gsjpk8k',
      to_address: 'aura1kqmvuhlyj68l37vf7k7f6umvq400u5q88kx5wq',
      amount: '1000',
      code: '0',
    },
    {
      tx_hash: '53A07DF09A57D2EE56C32D8C6DCC8FEE84069BC1F2F7676698D91BD435614E40',
      type: '/ibc.applications.transfer.v1.MsgTransfer',
      timestamp: '2022-05-20T03:44:57.000Z',
      from_address: 'aura1kqmvuhlyj68l37vf7k7f6umvq400u5q88kx5wq',
      to_address: 'aura1fceaesaz0fpckeeyt4dt6l6cd7nk7f7gsjpk8k',
      amount: '100',
      code: '0',
    },
    {
      tx_hash: '53A07DF09A57D2EE56C32D8C6DCC8FEE84069BC1F2F7676698D91BD435614E40',
      type: '/cosmos.bank.v1beta1.MsgMultiSend',
      timestamp: '2022-05-20T03:44:57.000Z',
      from_address: 'aura1fceaesaz0fpckeeyt4dt6l6cd7nk7f7gsjpk8k',
      to_address: 'aura1kqmvuhlyj68l37vf7k7f6umvq400u5q88kx5wq',
      amount: '10',
      code: '1',
    },
    {
      tx_hash: '53A07DF09A57D2EE56C32D8C6DCC8FEE84069BC1F2F7676698D91BD435614E40',
      type: '/cosmos.slashing.v1beta1.MsgUnjail',
      timestamp: '2022-05-20T03:44:57.000Z',
      from_address: 'aura1kqmvuhlyj68l37vf7k7f6umvq400u5q88kx5wq',
      to_address: 'aura1fceaesaz0fpckeeyt4dt6l6cd7nk7f7gsjpk8k',
      amount: '1',
      code: '1',
    },
    {
      tx_hash: '53A07DF09A57D2EE56C32D8C6DCC8FEE84069BC1F2F7676698D91BD435614E40',
      type: '/cosmos.bank.v1beta1.MsgSend',
      timestamp: '2022-05-20T03:44:57.000Z',
      from_address: 'aura1fceaesaz0fpckeeyt4dt6l6cd7nk7f7gsjpk8k',
      to_address: 'aura1kqmvuhlyj68l37vf7k7f6umvq400u5q88kx5wq',
      amount: '1000',
      code: '0',
    },
    {
      tx_hash: '53A07DF09A57D2EE56C32D8C6DCC8FEE84069BC1F2F7676698D91BD435614E40',
      type: '/ibc.applications.transfer.v1.MsgTransfer',
      timestamp: '2022-05-20T03:44:57.000Z',
      from_address: 'aura1kqmvuhlyj68l37vf7k7f6umvq400u5q88kx5wq',
      to_address: 'aura1fceaesaz0fpckeeyt4dt6l6cd7nk7f7gsjpk8k',
      amount: '100',
      code: '0',
    },
    {
      tx_hash: '53A07DF09A57D2EE56C32D8C6DCC8FEE84069BC1F2F7676698D91BD435614E40',
      type: '/cosmos.bank.v1beta1.MsgMultiSend',
      timestamp: '2022-05-20T03:44:57.000Z',
      from_address: 'aura1fceaesaz0fpckeeyt4dt6l6cd7nk7f7gsjpk8k',
      to_address: 'aura1kqmvuhlyj68l37vf7k7f6umvq400u5q88kx5wq',
      amount: '10',
      code: '1',
    },
    {
      tx_hash: '53A07DF09A57D2EE56C32D8C6DCC8FEE84069BC1F2F7676698D91BD435614E40',
      type: '/cosmos.slashing.v1beta1.MsgUnjail',
      timestamp: '2022-05-20T03:44:57.000Z',
      from_address: 'aura1kqmvuhlyj68l37vf7k7f6umvq400u5q88kx5wq',
      to_address: 'aura1fceaesaz0fpckeeyt4dt6l6cd7nk7f7gsjpk8k',
      amount: '1',
      code: '1',
    },
    {
      tx_hash: '53A07DF09A57D2EE56C32D8C6DCC8FEE84069BC1F2F7676698D91BD435614E40',
      type: '/cosmos.bank.v1beta1.MsgSend',
      timestamp: '2022-05-20T03:44:57.000Z',
      from_address: 'aura1fceaesaz0fpckeeyt4dt6l6cd7nk7f7gsjpk8k',
      to_address: 'aura1kqmvuhlyj68l37vf7k7f6umvq400u5q88kx5wq',
      amount: '1000',
      code: '0',
    },
    {
      tx_hash: '53A07DF09A57D2EE56C32D8C6DCC8FEE84069BC1F2F7676698D91BD435614E40',
      type: '/ibc.applications.transfer.v1.MsgTransfer',
      timestamp: '2022-05-20T03:44:57.000Z',
      from_address: 'aura1kqmvuhlyj68l37vf7k7f6umvq400u5q88kx5wq',
      to_address: 'aura1fceaesaz0fpckeeyt4dt6l6cd7nk7f7gsjpk8k',
      amount: '100',
      code: '0',
    },
    {
      tx_hash: '53A07DF09A57D2EE56C32D8C6DCC8FEE84069BC1F2F7676698D91BD435614E40',
      type: '/cosmos.bank.v1beta1.MsgMultiSend',
      timestamp: '2022-05-20T03:44:57.000Z',
      from_address: 'aura1fceaesaz0fpckeeyt4dt6l6cd7nk7f7gsjpk8k',
      to_address: 'aura1kqmvuhlyj68l37vf7k7f6umvq400u5q88kx5wq',
      amount: '10',
      code: '1',
    },
    {
      tx_hash: '53A07DF09A57D2EE56C32D8C6DCC8FEE84069BC1F2F7676698D91BD435614E40',
      type: '/cosmos.slashing.v1beta1.MsgUnjail',
      timestamp: '2022-05-20T03:44:57.000Z',
      from_address: 'aura1kqmvuhlyj68l37vf7k7f6umvq400u5q88kx5wq',
      to_address: 'aura1fceaesaz0fpckeeyt4dt6l6cd7nk7f7gsjpk8k',
      amount: '1',
      code: '1',
    },
  ];

  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  templates: Array<TableTemplate> = [
    { matColumnDef: 'popover', headerCellDef: '' },
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
  typeTransaction = TYPE_TRANSACTION;
  contractType = ContractVerifyType.Exact_Match;
  contractVerifyType = ContractVerifyType;

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;

  constructor(
    public commonService: CommonService,
    public global: Globals,
    public router: Router,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.getDataTable();
  }

  getDataTable(): void {
    this.pageData = {
      length: this.mockData.length,
      pageSize: this.pageData.pageSize,
      pageIndex: PAGE_EVENT.PAGE_INDEX,
    };

    let data = this.mockData.slice();

    data.forEach((token) => {
      token['price'] = Number(token.amount) * 1;
      const typeTrans = this.typeTransaction.find((f) => f.label.toLowerCase() === token.type.toLowerCase());
      token.type = typeTrans?.value;
    });
    this.dataSource = new MatTableDataSource<any>(data);
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  handlePageEvent(e: any) {
    this.pageData = e;
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
      code: 0,
      fee: data?.fee || 0,
      from_address: data?.from || '-',
      to_address: data?.to || '-',
      price: 0,
      status: 'Success',
      symbol: 'AURA',
      // tokenAddress: this.contractInfo?.contractsAddress,
      tokenAddress: 'demo',
      tx_hash: data?.txHash || '-',
      gas_used: data.gas_used,
      gas_wanted: data.gas_wanted,
    };
  }
}
