import { Component, Input, OnInit } from '@angular/core';
import { CodeTransaction } from 'src/app/core/constants/transaction.enum';
import { IContractPopoverData } from 'src/app/core/models/contract.model';

@Component({
  selector: 'app-contract-popover',
  templateUrl: './contract-popover.component.html',
  styleUrls: ['./contract-popover.component.scss'],
})
export class ContractPopoverComponent implements OnInit {
  @Input() popoverData: IContractPopoverData = {
    amount: 1000,
    code: 0,
    fee: 0.111,
    from_address: 'aura1tuc47nqcfr426gdynf7yqaz4u0psl5609ccsadp276vgkeykda9s96yv0z',
    to_address: 'aura1h6r78trkk2ewrry7s3lclrqu9a22ca3hpmyqfu',
    price: 0,
    status: 'Success',
    symbol: 'AURA',
    tokenAddress: 'aura1tuc47nqcfr426gdynf7yqaz4u0psl5609ccsadp276vgkeykda9s96yv0z',
    tx_hash: '8B830E4B7339EB68933D40AC62E24E51867F5447D2703F6605672E44E42A8358',
  };

  codeTransaction = CodeTransaction;

  constructor() {}

  ngOnInit(): void {}
}
