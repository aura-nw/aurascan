import { Component, OnInit } from '@angular/core';
import { CodeTransaction } from '../../../../app/core/constants/transaction.enum';
import { TYPE_TRANSACTION } from '../../../../app/core/constants/transaction.constant';

@Component({
  selector: 'app-smart-contract-detail',
  templateUrl: './smart-contract-detail.component.html',
  styleUrls: ['./smart-contract-detail.component.scss'],
})
export class SmartContractDetailComponent implements OnInit {
  countCurrent: string = '';
  tokenTransferList: any[];
  token: string = '';
  loading = true;
  typeTransaction = TYPE_TRANSACTION;
  textSearch: string = '';
  codeTransaction = CodeTransaction;
  tokenType = 'Aura';

  constructor() {}

  ngOnInit(): void {
  }
  
  searchTokenTable(): void {}
}
