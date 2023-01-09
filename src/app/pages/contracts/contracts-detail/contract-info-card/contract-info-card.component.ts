import { Component, Input, OnInit } from '@angular/core';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';

@Component({
  selector: 'app-contract-info-card',
  templateUrl: './contract-info-card.component.html',
  styleUrls: ['./contract-info-card.component.scss'],
})
export class ContractInfoCardComponent implements OnInit {
  @Input() contractDetail: any;
  contractRegisterType = ContractRegisterType;
  constructor() {}

  ngOnInit(): void {}
}
