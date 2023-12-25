import { Component, Input, OnInit } from '@angular/core';
import { TabsAccountLink } from 'src/app/core/constants/account.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
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
  @Input() dataCard: any;
  @Input() modeQuery: string;
  @Input() currentAddress: string;
  @Input() currentType: string;
  @Input() expand: boolean = false;

  tabsData = TabsAccountLink;
  statusTransaction = CodeTransaction;

  denom = this.environmentService.chainInfo.currencies[0].coinDenom;
  constructor(private environmentService: EnvironmentService) {}

  ngOnInit(): void {
    if (this.modeQuery !== this.tabsData.ExecutedTxs) {
      this.content[this.content.length - 1].label = 'Expand';
    }

    this.dataCard?.arrEvent?.forEach((element) => {
      element.address = element.fromAddress;
      element.isFromAddress = true;
      if (element.toAddress !== this.currentAddress) {
        element.address = element.toAddress;
        element.isFromAddress = false;
      }
    });
    this.dataCard.expand = this.expand;
  }

  expandData(data) {
    data.expand = true;
  }
}
