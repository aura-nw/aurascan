import { Component, Input, OnInit } from '@angular/core';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';

export interface CardMobExplainTitle {
  label: string;
  labelLink: string;
  subLabel: string;
}
export interface CardMobContent {
  label: string;
  class?: string;
  info: any;
  isAmount?: boolean;
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
  constructor(private environmentService: EnvironmentService) {}

  ngOnInit(): void {}
}
