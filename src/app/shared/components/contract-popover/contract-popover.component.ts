import { Component, Input, OnInit } from '@angular/core';
import { CodeTransaction } from 'src/app/core/constants/transaction.enum';
import { IContractPopoverData } from 'src/app/core/models/contract.model';


@Component({
  selector: 'app-contract-popover',
  templateUrl: './contract-popover.component.html',
  styleUrls: ['./contract-popover.component.scss'],
})
export class ContractPopoverComponent implements OnInit {
  @Input() tokenDetail: IContractPopoverData = null;

  codeTransaction = CodeTransaction;

  constructor() {}

  ngOnInit(): void {}
}
