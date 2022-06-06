import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { CONTRACT_TABLE_TEMPLATES } from 'src/app/core/constants/contract.constant';
import { ContractTransactionType } from 'src/app/core/constants/contract.enum';
import { IResponsesTemplates, TableTemplate } from 'src/app/core/models/common.model';
import { IContractsResponse, ITableContract } from 'src/app/core/models/contract.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { isContract } from 'src/app/core/utils/common/validation';
import { TableData } from 'src/app/shared/components/contract-table/contract-table.component';

@Component({
  selector: 'app-contracts-transactions',
  templateUrl: './contracts-transactions.component.html',
  styleUrls: ['./contracts-transactions.component.scss'],
})
export class ContractsTransactionsComponent implements OnInit {
  templates: Array<TableTemplate> = CONTRACT_TABLE_TEMPLATES;

  contractInfo: ITableContract = {
    contractsAddress: '',
    count: 0,
    popover: true,
    tableData: []
  };
  contractTransactionType = ContractTransactionType;
  textSearch = '';

  contract$ = this.activeRouter.params.pipe(
    mergeMap((e) => {
      if (isContract(e?.addressId)) {
        this.contractInfo.contractsAddress = e?.addressId;
        // let payload = {
        //   //limit: this.pageSize,
        //   limit: 25,
        //   //offset: this.pageIndex * this.pageSize,
        //   offset: 0,
        //   label: this.textSearch,
        //   contract_address: e.addressId,
        // };
        // return this.contractService.getTransactions(payload);
        
        this.getListTransaction();
      }
      //this.router.navigate(['']);
      return of(null);
    })
  );

  constructor(
    public translate: TranslateService,
    private router: Router,
    private contractService: ContractService,
    private activeRouter: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.contract$.subscribe()
    // this.getListTransaction();
  }

  getListTransaction(): void {
    console.log(this.contractInfo);
    
    if (isContract(this.contractInfo.contractsAddress)) {
      let payload = {
        //limit: this.pageSize,
        limit: 25,
        //offset: this.pageIndex * this.pageSize,
        offset: 0,
        label: this.textSearch,
        contract_address: this.contractInfo.contractsAddress,
      };
      this.contractService.getTransactions(payload).subscribe((res) => {
        if (res.data && Array.isArray(res.data)) {
          this.contractInfo.count = res.meta.count || 0;
          this.contractInfo.tableData = res.data.map((contract) => {
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

          // this.contractTransaction = ret;
          // if (this.contractTypeData !== this.contractVerifyType.Unverifed) {
          //   this.isVerifyContract = true;
          // }
        }
      });
    }
  }

  filterData(keyWord: string) {
    // keyWord = keyWord.toLowerCase();
    // this.filterSearchData = this.mockData.filter(
    //   (data) => data.method.toLowerCase().includes(keyWord) || data.fee.toLowerCase().includes(keyWord),
    // );
  }

  filterTransaction(event): void {
    if (event.key === 1) {
      this.textSearch = this.contractTransactionType.IN;
    } else if (event.key === 2) {
      this.textSearch = this.contractTransactionType.CREATION;
    } else {
      this.textSearch = '';
    }
    this.getListTransaction();
  }
}
