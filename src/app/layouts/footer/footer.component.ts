import { Component, OnInit } from '@angular/core';
import { EnvironmentService } from '../../core/data-services/environment.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})

/**
 * Footer Component
 */
export class FooterComponent implements OnInit {
  DEV_ENV = {
    DASHBOARD: 'https://explorer.dev.aura.network/dashboard',
    BLOCKS: 'https://explorer.dev.aura.network/blocks',
    TRANSACTIONS: 'https://explorer.dev.aura.network/transaction',
    VALIDATORS: 'https://explorer.dev.aura.network/validators',
    GOVERNANCE: 'https://explorer.dev.aura.network/proposal',
  };

  TEST_ENV = {
    DASHBOARD: 'https://explorer.test.aura.network/dashboard',
    BLOCKS: 'https://explorer.test.aura.network/blocks',
    TRANSACTIONS: 'https://explorer.test.aura.network/transaction',
    VALIDATORS: 'https://explorer.test.aura.network/validators',
    GOVERNANCE: 'https://explorer.test.aura.network/proposal',
  };

  MAIN_ENV = {
    DASHBOARD: 'https://explorer.aura.network/dashboard',
    BLOCKS: 'https://explorer.aura.network/blocks',
    TRANSACTIONS: 'https://explorer.aura.network/transaction',
    VALIDATORS: 'https://explorer.aura.network/validators',
    GOVERNANCE: 'https://explorer.aura.network/proposal',
  };

  chainId = this.environmentService.apiUrl.value.chainId;

  dashboardURL = this.MAIN_ENV.DASHBOARD;
  blocksURL = this.MAIN_ENV.BLOCKS;
  transactionURL = this.MAIN_ENV.TRANSACTIONS;
  validatorURL = this.MAIN_ENV.VALIDATORS;
  governanceURL = this.MAIN_ENV.GOVERNANCE;

  constructor(private environmentService: EnvironmentService) {}

  ngOnInit(): void {
    if (this.chainId === 'aura-devnet') {
      this.dashboardURL = this.DEV_ENV.DASHBOARD;
      this.blocksURL = this.DEV_ENV.BLOCKS;
      this.transactionURL = this.DEV_ENV.TRANSACTIONS;
      this.validatorURL = this.DEV_ENV.VALIDATORS;
      this.governanceURL = this.DEV_ENV.GOVERNANCE;
    } else if (this.chainId === 'aura-testnet') {
      this.dashboardURL = this.TEST_ENV.DASHBOARD;
      this.blocksURL = this.TEST_ENV.BLOCKS;
      this.transactionURL = this.TEST_ENV.TRANSACTIONS;
      this.validatorURL = this.TEST_ENV.VALIDATORS;
      this.governanceURL = this.TEST_ENV.GOVERNANCE;
    }
  }
}
