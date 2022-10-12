import { Component, Input } from '@angular/core';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';

@Component({
  selector: 'app-nft-card',
  templateUrl: './nft-card.component.html',
  styleUrls: ['./nft-card.component.scss'],
})
export class NftCardComponent {
  @Input() nftItem: any;
  @Input() nftType: string;
  @Input() nftLink: string;
  @Input() nftId: string;
  image_s3 = this.environmentService.configValue.image_s3;
  defaultImgToken = this.image_s3 + 'images/aura__ntf-default-img.png';
  isError = false;

  constructor(private environmentService: EnvironmentService) {}

  error(): void {
    this.isError = true;
  }
}
