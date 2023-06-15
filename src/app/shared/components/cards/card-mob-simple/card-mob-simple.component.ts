import { Component, Input, OnInit } from '@angular/core';
import { CodeTransaction } from '../../../../core/constants/transaction.enum';

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
  selector: 'app-card-mob-simple',
  templateUrl: './card-mob-simple.component.html',
  styleUrls: ['./card-mob-simple.component.scss'],
})
export class CardMobSimpleComponent implements OnInit {
  @Input() link: string;
  @Input() title: CardMobSimpleTitle;
  @Input() validatorData: CardMobSimpleValidatorAddress;
  @Input() content: CardMobSimpleContent[];
  @Input() tokenData: CardMobSimpleToken;
  @Input() tokenAmount: CardMobSimpleAmount;

  statusTransaction = CodeTransaction;

  constructor() {}

  ngOnInit(): void {}
}
