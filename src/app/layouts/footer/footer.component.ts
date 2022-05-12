import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EnvironmentService } from '../../core/data-services/environment.service';
import {MenuItem} from "../horizontaltopbar/menu.model";
import {MENU} from "../horizontaltopbar/menu";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})

/**
 * Footer Component
 */
export class FooterComponent implements OnInit {
  chainId = this.environmentService.apiUrl.value.chainId;

  dashboardURL = 'dashboard';
  blocksURL = 'blocks';
  transactionURL = 'transaction';
  validatorURL = 'validators';
  governanceURL = 'proposal';
  menuItems: MenuItem[] = MENU;

  constructor(private environmentService: EnvironmentService, public router: Router) {}

  ngOnInit(): void {}

  getUrl(url: string): string {
    return this.router.serializeUrl(this.router.createUrlTree([url]));
  }
}
