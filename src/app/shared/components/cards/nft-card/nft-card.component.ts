import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MEDIA_TYPE } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { checkTypeFile } from 'src/app/core/utils/common/info-common';

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
  @Input() disableLink: boolean;
  @ViewChild('timeline') timeline!: ElementRef;
  @ViewChild('video') video!: ElementRef;
  image_s3 = this.environmentService.configValue.image_s3;
  defaultImgToken = this.image_s3 + 'images/aura__ntf-default-img.png';
  isError = false;
  MEDIA_TYPE = MEDIA_TYPE;
  paused = true;
  animationUrl: string;
  imageUrl: string;

  constructor(private environmentService: EnvironmentService, private router: Router) {}

  ngOnInit(): void {
    // CW721
    if (this.nftItem.animation && this.nftItem.animation?.content_type) {
      if (this.nftItem.animation?.content_type === 'image/gif') {
        this.imageUrl = this.nftItem.animation?.link_s3 || '';
      } else {
        this.animationUrl = this.nftItem.animation?.link_s3 || '';
      }
    }
    if (this.nftItem.image) {
      this.imageUrl = this.nftItem.image?.link_s3 || '';
    }
    // account bound token
    if (this.nftItem.animation_url && this.nftItem.img_type) {
      if (this.nftItem.img_type === 'image/gif') {
        this.imageUrl = this.replaceImgIpfs(this.nftItem.animation_url) || '';
      } else {
        this.animationUrl = this.replaceImgIpfs(this.nftItem.animation_url) || '';
      }
    }
    if (this.nftItem.token_img) {
      this.imageUrl = this.replaceImgIpfs(this.nftItem.token_img) || '';
    }
  }

  playVideo(element) {
    element.nativeElement.play();
    this.paused = false;
    // Pause all others video
    const cardContain = document.getElementById('nft-cards');
    if (cardContain) {
      for (let i = 0; i < cardContain.children.length; i++) {
        const el: any = document.getElementById('nft#' + i);
        if (el && el.id !== element.nativeElement.id) {
          el.pause();
        }
      }
    }
  }

  pauseVideo(element) {
    element.nativeElement.pause();
    this.paused = true;
  }

  error(): void {
    this.isError = true;
  }

  getTypeFile(nft: any) {
    let nftType = checkTypeFile(nft);
    return nftType;
  }

  goTo(link) {
    if (!this.disableLink) {
      this.router.navigate([link]);
    }
  }

  replaceImgIpfs(value) {
    return 'https://ipfs.io/' + value.replace('://', '/');
  }
}
