import { Component, Input, SimpleChange } from '@angular/core';
import { checkTypeFile } from 'src/app/core/utils/common/info-common';
import {EnvironmentService} from "src/app/core/data-services/environment.service";

@Component({
  selector: 'app-nft-card',
  templateUrl: './nft-card.component.html',
  styleUrls: ['./nft-card.component.scss'],
})
export class NftCardComponent {
  @Input() nftItem: any;
  nftType: string;
  image_s3 = this.environmentService.configValue.image_s3;
  defaultImgToken = this.image_s3 + 'images/aura__ntf-default-img.png';

  constructor(
      private environmentService: EnvironmentService,
      ) {}

  ngOnChanges(changes: SimpleChange): void {
    console.log(this.nftItem.media_link)
    if (changes['nftItem']?.currentValue) {
      if(this.nftItem?.media_info.length > 0)
      {
        this.nftType = checkTypeFile(this.nftItem?.media_info[0]?.media_link);
      }
    }
  }
}
