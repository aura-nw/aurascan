import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonService } from 'src/app/core/services/common.service';
import { LENGTH_CHARACTER } from 'src/app/core/constants/common.constant';
import { Globals } from 'src/app/global/global';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contract-info-card',
  templateUrl: './contract-info-card.component.html',
  styleUrls: ['./contract-info-card.component.scss'],
})
export class ContractInfoCardComponent implements OnInit, OnChanges {
  @Input() type: 'information' | 'moreInfo' = 'information';
  @Input() contractDetail: any;
  lengthNormalAddress = LENGTH_CHARACTER.ADDRESS;

  constructor(public commonService: CommonService, private global: Globals, private router: Router) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {}

  extendLink(url) {
    url = url.match(/^https?:/) ? url : '//' + url;
    return url;
  }

  editPrivateName() {
    const userEmail = localStorage.getItem('userEmail');
    const dataNameTag = this.global.listNameTag?.find((k) => k.address === this.contractDetail?.address);
    if (userEmail) {
      if (dataNameTag) {
        localStorage.setItem('setAddressNameTag', JSON.stringify(dataNameTag));
      } else {
        localStorage.setItem('setAddressNameTag', JSON.stringify({ address: this.contractDetail?.address }));
      }
      this.router.navigate(['/profile'], { queryParams: { tab: 'private' } });
    } else {
      this.router.navigate(['/login']);
    }
  }
}
