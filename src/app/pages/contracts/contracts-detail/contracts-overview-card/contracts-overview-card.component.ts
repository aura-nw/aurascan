import { Component, Input, OnInit } from '@angular/core';
import { TYPE_ACCOUNT } from 'src/app/core/constants/account.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { Globals } from '../../../../global/global';

@Component({
  selector: 'app-contracts-overview-card',
  templateUrl: './contracts-overview-card.component.html',
  styleUrls: ['./contracts-overview-card.component.scss'],
})
export class ContractsOverviewCardComponent implements OnInit {
  @Input() contractDetail: any;
  selectedToken = '$0.00';
  assetsType = TYPE_ACCOUNT;
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;

  constructor(public global: Globals, private environmentService: EnvironmentService) {}

  ngOnInit(): void {}
}
