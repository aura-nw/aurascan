import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { MatTableDataSource } from '@angular/material/table';
import { TableTemplate } from 'src/app/core/models/common.model';
import { shortenAddress } from '../../../core/utils/common/shorten';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { ContractService } from 'src/app/core/services/contract.service';

@Component({
  selector: 'app-code-list',
  templateUrl: './code-list.component.html',
  styleUrls: ['./code-list.component.scss'],
})
export class CodeListComponent implements OnInit {
  pageData: PageEvent;
  pageSize = 20;
  pageIndex = 0;
  textSearch = '';
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  showBoxSearch = false;
  searchMobVisible = false;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  templates: Array<TableTemplate> = [
    { matColumnDef: 'code_id', headerCellDef: 'Code ID', isUrl: '/code-ids/detail' },
    { matColumnDef: 'tx_hash', headerCellDef: 'TX HASH', isUrl: '/transaction' },
    { matColumnDef: 'creator_address', headerCellDef: 'Creator', isUrl: '/account' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'instantiates', headerCellDef: 'INSTANTIATES' },
    { matColumnDef: 'created_at', headerCellDef: 'created at' },
    { matColumnDef: 'contract_verification', headerCellDef: 'Verified at' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  mockData = [
    {
      code_id: 1,
      tx_hash: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      creator_address: 'aura1v52kz96vjcjzq90jjkwxreqrrve65mx2csd6j0',
      type: 'CW-4973',
      instantiates: '345',
      created_at: '2023-01-07T09:35:03.680Z',
      contract_verification: '2023-02-07T09:35:03.680Z',
    },
    {
      code_id: 2,
      tx_hash: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      creator_address: 'aura1v52kz96vjcjzq90jjkwxreqrrve65mx2csd6j0',
      type: 'CW-20',
      instantiates: '25',
      created_at: '2023-01-07T09:35:03.680Z',
      contract_verification: '2023-02-07T09:35:03.680Z',
    },
    {
      code_id: 3,
      tx_hash: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      creator_address: 'aura1v52kz96vjcjzq90jjkwxreqrrve65mx2csd6j0',
      type: 'CW-20',
      instantiates: '10',
      created_at: '2023-01-07T09:35:03.680Z',
      contract_verification: '2023-02-07T09:35:03.680Z',
    },
    {
      code_id: 4,
      tx_hash: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      creator_address: 'aura1v52kz96vjcjzq90jjkwxreqrrve65mx2csd6j0',
      type: 'CW-721',
      instantiates: '3',
      created_at: '2023-01-07T09:35:03.680Z',
      contract_verification: '2023-02-07T09:35:03.680Z',
    },
    {
      code_id: 5,
      tx_hash: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      creator_address: 'aura1v52kz96vjcjzq90jjkwxreqrrve65mx2csd6j0',
      type: 'CW-4973',
      instantiates: '345',
      created_at: '2023-01-07T09:35:03.680Z',
      contract_verification: null,
    },
    {
      code_id: 6,
      tx_hash: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      creator_address: 'aura1v52kz96vjcjzq90jjkwxreqrrve65mx2csd6j0',
      type: 'CW-721',
      instantiates: '15',
      created_at: '2023-01-07T09:35:03.680Z',
      contract_verification: null,
    },
    {
      code_id: 7,
      tx_hash: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      creator_address: 'aura1v52kz96vjcjzq90jjkwxreqrrve65mx2csd6j0',
      type: 'CW-20',
      instantiates: '3',
      created_at: '2023-01-07T09:35:03.680Z',
      contract_verification: '2023-02-07T09:35:03.680Z',
    },
    {
      code_id: 8,
      tx_hash: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      creator_address: 'aura1v52kz96vjcjzq90jjkwxreqrrve65mx2csd6j0',
      type: 'CW-20',
      instantiates: '22',
      created_at: '2023-01-07T09:35:03.680Z',
      contract_verification: null,
    },
    {
      code_id: 9,
      tx_hash: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      creator_address: 'aura1v52kz96vjcjzq90jjkwxreqrrve65mx2csd6j0',
      type: 'CW-4973',
      instantiates: '345',
      created_at: '2023-01-07T09:35:03.680Z',
      contract_verification: '2023-02-07T09:35:03.680Z',
    },
    {
      code_id: 10,
      tx_hash: '3246114066CF3FC4225EFDC6DE1B818B262B56A54163184B7FB89B42D16D385F',
      creator_address: 'aura1v52kz96vjcjzq90jjkwxreqrrve65mx2csd6j0',
      type: 'CW-721',
      instantiates: '345',
      created_at: '2023-01-07T09:35:03.680Z',
      contract_verification: null,
    },
  ];

  constructor(private contractService: ContractService) {}

  ngOnInit(): void {
    this.getListCodeIds();
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.getListCodeIds();
  }

  getListCodeIds() {
    this.pageData = {
      length: this.mockData.length,
      pageSize: 20,
      pageIndex: PAGE_EVENT.PAGE_INDEX,
    };
    // this.contractService.getListContractById().subscribe((res) => {
    //   console.log(res.data);
    // });

    this.dataSource.data = this.mockData;
  }

  resetFilterSearch() {
    this.textSearch = '';
    this.showBoxSearch = false;
  }

  shortenAddress(address: string): string {
    if (address) {
      return shortenAddress(address, 8);
    }
    return '';
  }
}
