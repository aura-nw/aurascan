import { Component, Input, OnInit } from '@angular/core';
import { CodeTransaction } from '../../../../core/constants/transaction.enum';
import { CommonService } from 'src/app/core/services/common.service';

export interface CardMobSimpleValidatorAddress {
  imgUrl: string;
  validatorName: string;
  validatorAddress: string;
  validatorNumber: string;
  validatorIdentity: string;
}

export interface CardMobSimpleTitle {
  size: 'sm' | 'md' | 'lg';
  label: string;
  titleClass?: string;
  subLabelContent: string;
  subLabelClass?: string;
  rankNum?: number;
  status?: number;
  isFail?: boolean;
}
export interface CardMobSimpleContent {
  label: string;
  class?: string;
  info: any;
}

export interface CardMobSimpleToken {
  logo: string;
  name: string
  class?: string;
  info?: any;
}

export interface CardMobSimpleAmount{
  amount: string;
  decimal: number;
  isAura: boolean;
}

@Component({
  selector: 'app-card-mob-account',
  templateUrl: './card-mob-account.component.html',
  styleUrls: ['./card-mob-account.component.scss'],
})
export class CardMobAccountComponent implements OnInit {
  @Input() link: string;
  @Input() title: CardMobSimpleTitle;
  @Input() validatorData: CardMobSimpleValidatorAddress;
  @Input() content: CardMobSimpleContent[];
  @Input() tokenData: CardMobSimpleToken;
  @Input() tokenAmount: CardMobSimpleAmount;
  @Input() data: any;

  statusTransaction = CodeTransaction;

  constructor(public commonService: CommonService) {}

  ngOnInit(): void {
    console.log(this.data);
    
  }
}
