import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EnvironmentService } from '../../core/data-services/environment.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})

/**
 * Footer Component
 */
export class FooterComponent {
  chainId = this.environmentService.chainId;

  dashboardURL = 'dashboard';
  blocksURL = 'blocks';
  transactionURL = 'transactions';
  validatorURL = 'validators';
  governanceURL = 'votings';

  constructor(private environmentService: EnvironmentService, public router: Router) {}

  getUrl(url: string): string {
    return this.router.serializeUrl(this.router.createUrlTree([url]));
  }
}
