import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MEDIA_TYPE } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { checkTypeFile } from 'src/app/core/utils/common/info-common';

@Component({
  selector: 'app-nft-card',
  templateUrl: './nft-card.component.html',
  styleUrls: ['./nft-card.component.scss'],
})
export class NftCardComponent implements OnInit, AfterViewInit {
  @Input() nftItem: any;
  @Input() nftType: string;
  @Input() nftLink: string;
  @Input() nftId: string;
  @Input() disableLink: boolean;
  @ViewChild('timeline') timeline!: ElementRef;
  @ViewChild('video') video!: ElementRef;
  image_s3 = this.environmentService.imageUrl;
  defaultImgToken = this.image_s3 + 'images/aura__ntf-default-img.png';
  isError = false;
  MEDIA_TYPE = MEDIA_TYPE;
  paused = true;
  animationUrl: string;
  imageUrl: string;
  dataType: string;

  constructor(
    private environmentService: EnvironmentService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private commonService: CommonService,
  ) {}

  ngAfterViewInit(): void {
    if (this.video) {
      this.video.nativeElement.onpause = () => {
        this.paused = this.video.nativeElement.paused;
      };
    }
  }

  ngOnInit(): void {
    this.dataType = checkTypeFile(this.nftItem);
    // CW721
    if (this.nftItem?.media_info?.offchain?.image?.url) {
      this.imageUrl = this.nftItem?.media_info?.offchain?.image?.url;
    }
    if (this.nftItem?.media_info?.offchain?.animation?.url) {
      if (!this.nftItem?.media_info?.offchain?.image?.url) {
        if (this.nftItem?.media_info?.offchain?.animation?.content_type === 'image/gif') {
          this.imageUrl = this.nftItem?.media_info?.offchain?.animation?.url;
        } else {
          this.animationUrl = this.nftItem?.media_info?.offchain?.animation?.url;
        }
      } else if (this.dataType !== MEDIA_TYPE.IMG) {
        this.animationUrl = this.nftItem?.media_info?.offchain?.animation?.url;
      } else {
        this.imageUrl = this.nftItem?.media_info?.offchain?.image?.url;
      }
    }
    if (!this.imageUrl) {
      this.imageUrl = this.nftItem?.media_info?.onchain?.metadata?.image;
    }

    // account bound token
    if (this.nftItem?.token_img) {
      this.imageUrl = this.commonService.replaceImgIpfs(this.nftItem?.token_img);
    }
    if (this.nftItem?.animation_url) {
      if (!this.nftItem?.token_img) {
        if (this.nftItem.img_type === 'image/gif') {
          this.imageUrl = this.commonService.replaceImgIpfs(this.nftItem?.animation_url);
        } else {
          this.animationUrl = this.commonService.replaceImgIpfs(this.nftItem?.animation_url);
        }
      } else if (this.dataType !== MEDIA_TYPE.IMG) {
        this.animationUrl = this.commonService.replaceImgIpfs(this.nftItem?.animation_url);
      } else {
        this.imageUrl = this.commonService.replaceImgIpfs(this.nftItem?.token_img);
      }
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
    this.cdr.markForCheck();
  }

  pauseVideo(element) {
    element.nativeElement.pause();
    this.paused = true;
  }

  error(): void {
    this.isError = true;
  }

  goTo(link) {
    if (!this.disableLink) {
      this.router.navigate([link]);
    }
  }
}
