import { Component, Input, OnInit } from '@angular/core';
import {EnvironmentService} from "src/app/core/data-services/environment.service";

export interface CardMobExplainTitle {
  label: string;
  labelLink: string;
  subLabel: string;
}
export interface CardMobContent {
  label: string;
  class?: string;
  info: any;
}
export interface CardMobSimpleAmount {
  amount: string;
  decimal: number;
  isAura: boolean;
}

@Component({
  selector: 'app-card-mob-explain',
  templateUrl: './card-mob-explain.component.html',
  styleUrls: ['./card-mob-explain.component.scss'],
})
export class CardMobExplainComponent implements OnInit {
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  @Input() title: CardMobExplainTitle;
  @Input() status: any;
  @Input() content: CardMobContent[];
  @Input() tokenAmount: any;
  constructor(
    private environmentService: EnvironmentService,) {}

  ngOnInit(): void {
    if(this.tokenAmount) {
      this.content.splice(2, 0, {
        label: 'Amount',
        class: null,
        info: this.tokenAmount.amount
      });
      this.content.join(" ")
    }
    
  }
}
