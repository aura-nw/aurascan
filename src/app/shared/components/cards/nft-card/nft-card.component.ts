import { Component, Input, OnInit } from '@angular/core';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';

@Component({
  selector: 'app-nft-card',
  templateUrl: './nft-card.component.html',
  styleUrls: ['./nft-card.component.scss'],
})
export class NftCardComponent implements OnInit {
  @Input() nftItem: any;
  @Input() nftType: string;
  @Input() nftLink: string;
  @Input() nftId: string;
  image_s3 = this.environmentService.configValue.image_s3;
  defaultImgToken = this.image_s3 + 'images/aura__ntf-default-img.png';
  isError = false;
  nftUrl = '';

  constructor(private environmentService: EnvironmentService) {}

  ngOnInit(): void {
    if (this.nftItem.animation && this.nftItem.animation?.content_type) {
      this.nftUrl = this.nftItem.animation?.link_s3 || '';
    }
    if (this.nftItem.image && this.nftUrl == '') {
      this.nftUrl = this.nftItem.image?.link_s3 || '';
    }
  }

  error(): void {
    this.isError = true;
  }
}
