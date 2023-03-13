import { Component, Input, OnInit } from '@angular/core';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';

@Component({
  selector: 'app-sb-img',
  templateUrl: './sb-img.component.html',
  styleUrls: ['./sb-img.component.scss'],
})
export class SbImgComponent implements OnInit {
  @Input() token;
  image_s3 = this.environmentService.configValue.image_s3;
  defaultImgToken = this.image_s3 + 'images/aura__ntf-default-img.png';
  isError = false;
  previewImg = '';

  constructor(private environmentService: EnvironmentService) {}

  ngOnInit(): void {
    if (this.token.token_img) {
      this.previewImg = this.replaceImgIpfs(this.token.token_img);
    } else if (this.token.animation_url) {
      if (this.token.img_type === 'image/gif') {
        this.previewImg = this.replaceImgIpfs(this.token.animation_url);
      }
    }
  }

  replaceImgIpfs(value) {
    return 'https://ipfs.io/' + value.replace('://', '/');
  }

  error(): void {
    this.isError = true;
  }
}
