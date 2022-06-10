import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { MY_FORMATS } from 'src/app/core/constants/common.constant';
import { CodeTransaction } from 'src/app/core/constants/transaction.enum';
import { IContractPopoverData } from 'src/app/core/models/contract.model';

@Component({
  selector: 'app-contract-popover',
  templateUrl: './contract-popover.component.html',
  styleUrls: ['./contract-popover.component.scss'],
})
export class ContractPopoverComponent implements OnInit, OnChanges {
  @Input() popoverData: IContractPopoverData = null;

  FORMAT = MY_FORMATS;

  loading = true;

  codeTransaction = CodeTransaction;

  constructor() {}

  ngOnChanges(): void {
    if (this.popoverData) {
      this.loading = false;
    }
  }

  ngOnInit(): void {}
}
