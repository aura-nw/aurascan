import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TYPE_CW4973 } from 'src/app/core/constants/contract.constant';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';

@Component({
  selector: 'app-contract-info-card',
  templateUrl: './contract-info-card.component.html',
  styleUrls: ['./contract-info-card.component.scss'],
})
export class ContractInfoCardComponent implements OnInit, OnChanges {
  @Input() contractDetail: any;
  contractRegisterType = ContractRegisterType;
  linkNft = 'token-nft';
  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      this.contractDetail?.code?.type === ContractRegisterType.CW4973 ||
      this.contractDetail?.cw721_contract.smart_contract.name === TYPE_CW4973
    ) {
      this.linkNft = 'token-abt';
    }
  }
}
