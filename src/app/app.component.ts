import { Component, OnInit } from '@angular/core';
import { CommonService } from './core/services/common.service';
import { getInfo } from './core/utils/common/info-common';
import { Globals } from './global/global';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private commonService: CommonService, private globals: Globals) {}
  ngOnInit(): void {
    this.getInfoCommon();

    setInterval(() => {
      this.getInfoCommon();
    }, 60000);
  }

  getInfoCommon(): void {
    this.commonService.status().subscribe((res) => {
      getInfo(this.globals, res.data);
    });
  }
}
