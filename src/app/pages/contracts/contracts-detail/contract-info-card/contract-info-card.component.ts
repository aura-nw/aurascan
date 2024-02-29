import { Component, Input, OnInit } from '@angular/core';
import { ENameTag, EScreen } from 'src/app/core/constants/account.enum';
import { LENGTH_CHARACTER } from 'src/app/core/constants/common.constant';

@Component({
  selector: 'app-contract-info-card',
  templateUrl: './contract-info-card.component.html',
  styleUrls: ['./contract-info-card.component.scss'],
})
export class ContractInfoCardComponent implements OnInit {
  @Input() type: 'information' | 'moreInfo' = 'information';
  @Input() contractDetail: any;
  lengthNormalAddress = LENGTH_CHARACTER.ADDRESS;
  ENameTag = ENameTag;
  EScreen = EScreen;

  constructor() {}

  ngOnInit(): void {}
}
