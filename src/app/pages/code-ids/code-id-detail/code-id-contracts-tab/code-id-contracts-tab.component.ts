import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DATEFORMAT, PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { CONTRACT_RESULT } from 'src/app/core/constants/contract.constant';
import { TableTemplate } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { shortenAddress } from '../../../../core/utils/common/shorten';

@Component({
  selector: 'app-code-id-contracts-tab',
  templateUrl: './code-id-contracts-tab.component.html',
  styleUrls: ['./code-id-contracts-tab.component.scss'],
})
export class CodeIdContractsTabComponent implements OnInit {
  @Input() codeId: string;
  pageData: PageEvent;
  pageSize = 20;
  pageIndex = 0;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  templates: Array<TableTemplate> = [
    { matColumnDef: 'contract_address', headerCellDef: 'CONTRACT ADDRESS', isUrl: '/contracts' },
    { matColumnDef: 'tx_hash', headerCellDef: 'TX HASH', isUrl: '/transaction' },
    { matColumnDef: 'creator_address', headerCellDef: 'Creator', isUrl: '/account' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'created_at', headerCellDef: 'INSTANTIATED at' },
    { matColumnDef: 'verified_at', headerCellDef: 'Verified at' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  constructor(private contractService: ContractService, private datePipe: DatePipe) {}

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
    let payload = {
      limit: this.pageSize,
      offset: this.pageIndex * this.pageSize,
      keyword: this.codeId.toString(),
      contractType: [],
    };

    this.contractService.getListContract(payload).subscribe((res) => {
      this.pageData = {
        length: res?.meta?.count,
        pageSize: 20,
        pageIndex: PAGE_EVENT.PAGE_INDEX,
      };
      console.log(res);
      
      if (res?.data?.length > 0) {
        res.data.forEach((item) => {
          item.updated_at = this.datePipe.transform(item.updated_at, DATEFORMAT.DATETIME_UTC);
          if (item.result === CONTRACT_RESULT.INCORRECT || !item.type) {
            item.type = '-';
          } else if (item.result === CONTRACT_RESULT.TBD) {
            item.type = CONTRACT_RESULT.TBD;
          }
        });
        this.dataSource = res.data;
      }
    });
  }
}
