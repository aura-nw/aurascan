import { Component, OnInit } from '@angular/core';
import { TOKEN_ID_GET_PRICE } from './core/constants/common.constant';
import { CommonService } from './core/services/common.service';
import { TokenService } from './core/services/token.service';
import { getInfo } from './core/utils/common/info-common';
import { Globals } from './global/global';
// import eruda from 'eruda';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  // chainInfo = this.env.configValue.chain_info;
  // TESTNET = ['aura-testnet-2', 'serenity-testnet-001'];
  // isTestnet = this.TESTNET.includes(
  //   this.chainInfo?.chainId || ''
  // );
  constructor(
    private commonService: CommonService,
    private globals: Globals,
    private tokenService: TokenService, // private env: EnvironmentService
  ) {}
  ngOnInit(): void {
    this.getListNameTag();
    this.getInfoCommon();
    this.getPriceToken();

    setInterval(() => {
      this.getListNameTag();
      this.getInfoCommon();
      this.getPriceToken();
    }, 60000);

    // if (this.isTestnet) {
    //   let el = document.createElement('div');
    //   document.body.appendChild(el);
    //
    //   eruda.init({
    //     container: el,
    //     tool: ['console', 'elements', 'resources', 'network'],
    //   });
    // }
  }

  getInfoCommon(): void {
    this.commonService.status().subscribe((res) => {
      getInfo(this.globals, res);
    });
  }

  getPriceToken(): void {
    this.tokenService.getPriceToken(TOKEN_ID_GET_PRICE.AURA).subscribe((res) => {
      this.globals.price.aura = res.data || 0;
    });

    this.tokenService.getPriceToken(TOKEN_ID_GET_PRICE.BTC).subscribe((res) => {
      this.globals.price.btc = res.data || 0;
    });
  }

  getListNameTag(): void {
    const payload = {
      limit: 500,
      nextKey: 0,
    };
    this.commonService.getListNameTag(payload).subscribe((res) => {
      this.globals.listNameTag = this.commonService.listNameTag = res.data?.nameTags;
    });
  }
}
