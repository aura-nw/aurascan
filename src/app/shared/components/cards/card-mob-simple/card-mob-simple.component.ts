import {Component, Input, OnInit} from '@angular/core';
import { CodeTransaction } from '../../../../core/constants/transaction.enum';
import {VALIDATOR_AVATAR_DF} from "src/app/core/constants/common.constant";

export interface CardMobSimpleValidatorAddress {
  imgUrl: string;
  validatorName: string;
  validatorAddress: string;
  validatorNumber: string;
}

export interface CardMobSimpleTitle {
  size: 'sm' | 'md' | 'lg',
  label: string,
  titleClass?: string,
  subLabelContent: string,
  subLabelClass?: string,
  rankNum?: number,
  status?: number,
  isFail?: boolean,
}
export interface CardMobSimpleContent {
  label: string,
  class?: string,
  info: any,
}

@Component({
  selector: 'app-card-mob-simple',
  templateUrl: './card-mob-simple.component.html',
  styleUrls: ['./card-mob-simple.component.scss']
})
export class CardMobSimpleComponent implements OnInit {
  @Input() link: string;
  @Input() title: CardMobSimpleTitle;
  @Input() validatorData: CardMobSimpleValidatorAddress;
  @Input() content: CardMobSimpleContent[];

  statusTransaction = CodeTransaction;
  img_df = 'https://validator-logos.s3.ap-southeast-1.amazonaws.com/validator-default.svg';

  constructor() { }

  ngOnInit(): void {}
}
