import { Component, Input, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TableTemplate } from 'src/app/core/models/common.model';
import { shortenAddress } from '../../../../core/utils/common/shorten';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';

@Component({
  selector: 'app-contracts-list',
  templateUrl: './contracts-list.component.html',
  styleUrls: ['./contracts-list.component.scss'],
})
export class ContractsListComponent implements OnInit {
  @Input() codeId;
  pageData: PageEvent;
  pageSize = 20;
  pageIndex = 0;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  templates: Array<TableTemplate> = [
    { matColumnDef: 'address', headerCellDef: 'CONTRACT ADDRESS', isUrl: 'contract' },
    { matColumnDef: 'tx_hash', headerCellDef: 'TX HASH', isUrl: 'transaction' },
    { matColumnDef: 'creator_address', headerCellDef: 'Creator', isUrl: 'account' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'instantiates', headerCellDef: 'INSTANTIATES' },
    { matColumnDef: 'contract_verification', headerCellDef: 'Verified at' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  mockData = [
    {
      address: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      tx_hash: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      creator_address: 'aura1v52kz96vjcjzq90jjkwxreqrrve65mx2csd6j0',
      type: 'CW-4973',
      instantiates: '345',
      contract_verification: '2023-02-07T09:35:03.680Z',
    },
    {
      address: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      tx_hash: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      creator_address: 'aura1v52kz96vjcjzq90jjkwxreqrrve65mx2csd6j0',
      type: 'CW-20',
      instantiates: '25',
      contract_verification: '2023-02-07T09:35:03.680Z',
    },
    {
      address: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      tx_hash: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      creator_address: 'aura1v52kz96vjcjzq90jjkwxreqrrve65mx2csd6j0',
      type: 'CW-20',
      instantiates: '10',
      contract_verification: '2023-02-07T09:35:03.680Z',
    },
    {
      address: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      tx_hash: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      creator_address: 'aura1v52kz96vjcjzq90jjkwxreqrrve65mx2csd6j0',
      type: 'CW-721',
      instantiates: '3',
      contract_verification: '2023-02-07T09:35:03.680Z',
    },
    {
      address: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      tx_hash: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      creator_address: 'aura1v52kz96vjcjzq90jjkwxreqrrve65mx2csd6j0',
      type: 'CW-4973',
      instantiates: '345',
      contract_verification: null,
    },
    {
      address: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      tx_hash: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      creator_address: 'aura1v52kz96vjcjzq90jjkwxreqrrve65mx2csd6j0',
      type: 'CW-721',
      instantiates: '15',
      contract_verification: null,
    },
    {
      address: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      tx_hash: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      creator_address: 'aura1v52kz96vjcjzq90jjkwxreqrrve65mx2csd6j0',
      type: 'CW-20',
      instantiates: '3',
      contract_verification: '2023-02-07T09:35:03.680Z',
    },
    {
      address: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      tx_hash: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      creator_address: 'aura1v52kz96vjcjzq90jjkwxreqrrve65mx2csd6j0',
      type: 'CW-20',
      instantiates: '22',
      contract_verification: null,
    },
    {
      address: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      tx_hash: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      creator_address: 'aura1v52kz96vjcjzq90jjkwxreqrrve65mx2csd6j0',
      type: 'CW-4973',
      instantiates: '345',
      contract_verification: '2023-02-07T09:35:03.680Z',
    },
    {
      address: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      tx_hash: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      creator_address: 'aura1v52kz96vjcjzq90jjkwxreqrrve65mx2csd6j0',
      type: 'CW-721',
      instantiates: '345',
      contract_verification: null,
    },
  ];
  constructor() {}

  ngOnInit(): void {
    this.getListContract();
  }
  shortenAddress(address: string): string {
    if (address) {
      return shortenAddress(address, 8);
    }
    return '';
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.getListContract();
  }

  getListContract() {
    this.pageData = {
      length: this.mockData.length,
      pageSize: 20,
      pageIndex: PAGE_EVENT.PAGE_INDEX,
    };
    this.dataSource.data = this.mockData;
  }
}
