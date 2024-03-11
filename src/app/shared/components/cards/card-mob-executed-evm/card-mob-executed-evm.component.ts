import { Component, Input, OnInit } from '@angular/core';
import { TabsAccountLink } from 'src/app/core/constants/account.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CodeTransaction } from '../../../../core/constants/transaction.enum';

@Component({
  selector: 'app-card-mob-executed-evm',
  templateUrl: './card-mob-executed-evm.component.html',
  styleUrls: ['./card-mob-executed-evm.component.scss'],
})
export class CardMobExecutedEvmComponent implements OnInit {
  @Input() dataSource: any;
  tabsData = TabsAccountLink;
  statusTransaction = CodeTransaction;

  coinInfo = this.environmentService.chainInfo.currencies[0];
  decimal = this.environmentService.chainInfo.currencies[0].coinDecimals;
  denom = this.environmentService.chainInfo.currencies[0].coinDenom;

  constructor(private environmentService: EnvironmentService) {}

  ngOnInit(): void {}

  expandData(data) {
    data.expand = true;
  }
}
