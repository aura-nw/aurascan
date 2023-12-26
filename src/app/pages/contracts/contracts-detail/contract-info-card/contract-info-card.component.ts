import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LENGTH_CHARACTER, STORAGE_KEYS } from 'src/app/core/constants/common.constant';
import { IUser } from 'src/app/core/models/auth.models';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import local from 'src/app/core/utils/storage/local';

@Component({
  selector: 'app-contract-info-card',
  templateUrl: './contract-info-card.component.html',
  styleUrls: ['./contract-info-card.component.scss'],
})
export class ContractInfoCardComponent implements OnInit {
  @Input() type: 'information' | 'moreInfo' = 'information';
  @Input() contractDetail: any;
  lengthNormalAddress = LENGTH_CHARACTER.ADDRESS;

  constructor(
    private router: Router,
    private nameTagService: NameTagService,
  ) {}

  ngOnInit(): void {}

  extendLink(url) {
    url = url.match(/^https?:/) ? url : '//' + url;
    return url;
  }

  editPrivateName() {
    const userEmail = local.getItem<IUser>(STORAGE_KEYS.USER_DATA)?.email;
    const dataNameTag = this.nameTagService.listNameTag?.find((k) => k.address === this.contractDetail?.address);
    if (userEmail) {
      if (dataNameTag) {
        local.setItem(STORAGE_KEYS.SET_ADDRESS_NAME_TAG, dataNameTag);
      } else {
        local.setItem(STORAGE_KEYS.SET_ADDRESS_NAME_TAG, JSON.stringify({ address: this.contractDetail?.address }));
      }
      this.router.navigate(['/profile'], { queryParams: { tab: 'private' } });
    } else {
      this.router.navigate(['/login']);
    }
  }
}
