import {Component, OnInit} from '@angular/core';
import { Router} from '@angular/router';
import {EnvironmentService} from '../../core/data-services/environment.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})

/**
 * Footer Component
 */
export class FooterComponent implements OnInit {
  chainId = this.environmentService.configValue.chainId;

  dashboardURL = 'dashboard';
  blocksURL = 'blocks';
  transactionURL = 'transaction';
  validatorURL = 'validators';
  governanceURL = 'proposal';

  constructor(
      private environmentService: EnvironmentService,
      public router: Router,
  ) { }

  ngOnInit(): void {}

  getUrl(url: string): string {
    return this.router.serializeUrl(this.router.createUrlTree([url]));
  }
}
