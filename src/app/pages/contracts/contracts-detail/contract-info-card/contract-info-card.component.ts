import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonService } from 'src/app/core/services/common.service';
import {LENGTH_CHARACTER} from "src/app/core/constants/common.constant";

@Component({
  selector: 'app-contract-info-card',
  templateUrl: './contract-info-card.component.html',
  styleUrls: ['./contract-info-card.component.scss'],
})
export class ContractInfoCardComponent implements OnInit, OnChanges {
  @Input() type: 'information' | 'moreInfo' =  'information';
  @Input() contractDetail: any;
  lengthNormalAddress = LENGTH_CHARACTER.ADDRESS;

  constructor(public commonService: CommonService) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {}

  extendLink(url) {
    url = url.match(/^https?:/) ? url : '//' + url;
    return url;
  }
}
