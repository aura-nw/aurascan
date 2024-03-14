import { Component, Input, OnInit } from '@angular/core';
import { TabsAccountLink } from 'src/app/core/constants/account.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CodeTransaction } from '../../../../core/constants/transaction.enum';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-card-mob-executed-evm',
  templateUrl: './card-mob-executed-evm.component.html',
  styleUrls: ['./card-mob-executed-evm.component.scss'],
})
export class CardMobExecutedEvmComponent implements OnInit {
  @Input() dataSource: any;
  tabsData = TabsAccountLink;
  statusTransaction = CodeTransaction;
  currentAddress = '';

  coinInfo = this.environmentService.chainInfo.currencies[0];
  decimal = this.environmentService.chainInfo.currencies[0].coinDecimals;
  denom = this.environmentService.chainInfo.currencies[0].coinDenom;

  constructor(
    private environmentService: EnvironmentService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params?.address) {
        this.currentAddress = params?.address;
      }
    });
  }

  expandData(data) {
    data.expand = true;
  }
}
