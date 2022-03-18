import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../app/core/services/auth.service';
import { CommonDataDto } from './core/models/common.model';
import { CommonService } from './core/services/common.service';
import { Globals } from './global/global';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = '';
  constructor(
    private authService: AuthenticationService,
    private commonService: CommonService,
    private globals: Globals
  ) {
  }
  ngOnInit(): void {
    this.getInfoCommon();

    setInterval(() => {
      this.getInfoCommon();
    }, 60000);
  }

  getInfoCommon(): void {
    this.commonService
      .status()
      .subscribe(res => {
        this.globals.dataHeader = res.data;
        this.globals.dataHeader.bonded_tokens_format = this.formatNumber(this.globals.dataHeader.bonded_tokens);
        this.globals.dataHeader.community_pool_format = this.formatNumber(this.globals.dataHeader.community_pool);
      }
      );
  }

  formatNumber(number: number, args?: any): any {
    if (isNaN(number)) return null; // will only work value is a number
    if (number === null) return null;
    if (number === 0) return null;
    let abs = Math.abs(number);
    const rounder = Math.pow(10, 1);
    const isNegative = number < 0; // will also work for Negetive numbers
    let key = '';

    const powers = [
      { key: 'Q', value: Math.pow(10, 15) },
      { key: 'T', value: Math.pow(10, 12) },
      { key: 'B', value: Math.pow(10, 9) },
      { key: 'M', value: Math.pow(10, 6) },
      { key: 'K', value: 1000 }
    ];

    for (let i = 0; i < powers.length; i++) {
      let reduced = abs / powers[i].value;
      reduced = Math.round(reduced * rounder) / rounder;
      if (reduced >= 1) {
        abs = reduced;
        key = powers[i].key;
        break;
      }
    }
    return (isNegative ? '-' : '') + abs + key;
  }
}
