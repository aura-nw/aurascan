import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { IResponsesTemplates, TableTemplate } from 'src/app/core/models/common.model';
import { IContractsResponse, ITableContract } from 'src/app/core/models/contract.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { isContract } from 'src/app/core/utils/common/validation';
import { TableData } from 'src/app/shared/components/table/table.component';

@Component({
  selector: 'app-contracts-transactions',
  templateUrl: './contracts-transactions.component.html',
  styleUrls: ['./contracts-transactions.component.scss'],
})
export class ContractsTransactionsComponent implements OnInit {
  templates: Array<TableTemplate> = [
    { matColumnDef: 'txHash', headerCellDef: 'Txn Hash', type: 'hash-url', isUrl: '/transaction' },
    { matColumnDef: 'method', headerCellDef: 'Method', type: 'status', headerWidth: 10 },
    { matColumnDef: 'blockHeight', headerCellDef: 'Blocks', type: 'hash-url', headerWidth: 8, isUrl: '/blocks/id', paramField: 'blockId'  },
    { matColumnDef: 'time', headerCellDef: 'Time', type: 'time-distance', headerWidth: 10, suffix: 'ago' },
    { matColumnDef: 'from', headerCellDef: 'From', type: 'hash-url', headerWidth: 15, isUrl: '/account' },
    { matColumnDef: 'label', headerCellDef: '', type: 'status', headerWidth: 8, justify: 'center' },
    { matColumnDef: 'to', headerCellDef: 'To', type: 'hash-url', headerWidth: 15, isUrl: '/account' },
    { matColumnDef: 'value', headerCellDef: 'Value', type: 'numb', suffix: 'Aura', headerWidth: 10 },
    { matColumnDef: 'fee', headerCellDef: 'Fee', type: 'numb', headerWidth: 10 },
  ];

  contractInfo: ITableContract = {
    contractsAddress: '',
    count: 0,
  };

  contract$ = this.activeRouter.params.pipe(
    mergeMap((e) => {
      if (isContract(e?.addressId)) {
        this.contractInfo.contractsAddress = e?.addressId;
        return this.contractService.getTransactions(e.addressId);
      }
      this.router.navigate(['']);
      return of(null);
    }),
    map((dta: IResponsesTemplates<IContractsResponse[]>) => {
      if (dta?.data && Array.isArray(dta.data)) {
        this.contractInfo.count = dta.meta?.count || 0;

        const ret = dta.data.map((contract) => {
          const method = Object.keys(contract.messages[0].msg)[0];
          const value = +contract.messages[0].funds[0]?.amount || 0;

          const label = contract.messages[0].sender === this.contractInfo.contractsAddress ? 'OUT' : 'TO';

          const tableDta: TableData = {
            txHash: contract.tx_hash,
            method,
            blockHeight: contract.height,
            blockId: contract.blockId,
            time: new Date(contract.timestamp),
            from: contract.messages[0].sender,
            label,
            to: contract.messages[0].contract,
            value,
            fee: +contract.fee,
          };

          return tableDta;
        });

        return ret;
      }

      this.router.navigate(['']);

      return null;
    }),
  );

  constructor(
    public translate: TranslateService,
    private router: Router,
    private contractService: ContractService,
    private activeRouter: ActivatedRoute,
  ) {}

  ngOnInit(): void {}

  filterData(keyWord: string) {
    // keyWord = keyWord.toLowerCase();
    // this.filterSearchData = this.mockData.filter(
    //   (data) => data.method.toLowerCase().includes(keyWord) || data.fee.toLowerCase().includes(keyWord),
    // );
  }
}
