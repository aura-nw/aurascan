import { Component, Input, OnInit } from '@angular/core';
import { TabsAccountLink } from 'src/app/core/constants/account.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
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
  name: string;
  class?: string;
  info?: any;
}

export interface CardMobSimpleAmount {
  amount: string;
  decimal: number;
  isNative: boolean;
}

@Component({
  selector: 'app-card-mob-channel',
  templateUrl: './card-mob-channel.component.html',
  styleUrls: ['./card-mob-channel.component.scss'],
})
export class CardMobChannelComponent implements OnInit {
  @Input() link: string;
  @Input() title: CardMobSimpleTitle;
  @Input() validatorData: CardMobSimpleValidatorAddress;
  @Input() content: CardMobSimpleContent[];
  @Input() tokenData: CardMobSimpleToken;
  @Input() tokenAmount: CardMobSimpleAmount;
  @Input() dataCard: any;
  @Input() modeQuery: string;
  @Input() currentAddress: string;
  @Input() currentType: string;

  tabsData = TabsAccountLink;
  statusTransaction = CodeTransaction;

  denom = this.environmentService.chainInfo.currencies[0].coinDenom;
  constructor(public commonService: CommonService, private environmentService: EnvironmentService) {}

  ngOnInit(): void {}
}
