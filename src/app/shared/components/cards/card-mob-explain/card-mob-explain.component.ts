import { Component, Input, OnInit } from '@angular/core';

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
  @Input() title: CardMobExplainTitle;
  @Input() status: any;
  @Input() content: CardMobContent[];
  @Input() tokenAmount: any;
  constructor() {}

  ngOnInit(): void {
    console.log(this.tokenAmount);
    
  }
}
