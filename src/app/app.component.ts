import { Component, OnInit } from '@angular/core';
import { TOKEN_ID_GET_PRICE } from './core/constants/common.constant';
import { CommonService } from './core/services/common.service';
import { TokenService } from './core/services/token.service';
import { getInfo } from './core/utils/common/info-common';
import { Globals } from './global/global';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private commonService: CommonService, private globals: Globals, private tokenService: TokenService) {}
  ngOnInit(): void {
    this.getInfoCommon();
    this.getPriceToken();

    setInterval(() => {
      this.getInfoCommon();
      this.getPriceToken();
    }, 60000);
  }

  getInfoCommon(): void {
    this.commonService.status().subscribe((res) => {
      getInfo(this.globals, res.data);
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
}
