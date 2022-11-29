import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-custom-video-player',
  templateUrl: './custom-video-player.component.html',
  styleUrls: ['./custom-video-player.component.scss'],
})
export class CustomVideoPlayerComponent implements OnInit, AfterViewInit {
  @Input() videoSrc: string = '';
  @ViewChild('timeline') timeline!: ElementRef;
  @ViewChild('video') video!: ElementRef;
  @Input() appWidth = 'auto';
  @Input() appHeight = '100%';
  @Input() link;
  @Input() showControl = true;
  @Input() isMuted = false;
  @Input() isDetail = false;
  @Input() nftId;
  isFullScreen = false;
  showCustomControl = false
  paused = true;
  constructor(
      private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.video) {
      this.video.nativeElement.ontimeupdate = () => {
        if (this.timeline) {
          const percentagePosition =
            (100 * this.video?.nativeElement?.currentTime) / this.video?.nativeElement?.duration;
          this.timeline.nativeElement.style.backgroundSize = `${percentagePosition}% 100%`;
          this.timeline.nativeElement.value = percentagePosition;
        }
      };
      this.video.nativeElement.onpause = () => {
        this.paused = this.video.nativeElement.paused;
      };
      setTimeout(()=> {
        this.showCustomControl = true;
        this.video.nativeElement.setAttribute("poster", this.createPoster());
      }, 200);
    }
    this.cdr.markForCheck();
  }

  createPoster() {
    this.video.nativeElement.currentTime = 1;
    const canvas = document.createElement("canvas");
    canvas.width = 350;
    canvas.height = 200;
    canvas.getContext("2d").drawImage(this.video.nativeElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg");
  }

  playVideo(element) {
    if(this.isDetail) return;
    element.nativeElement.play();
    this.paused = false;
    // Pause all others video
    const cardContain = document.getElementById('nft-cards');
    if(cardContain) {
      for (let i = 0; i < cardContain.children.length; i++) {
        const el: any = document.getElementById('nft#'+i)
        if(el && el.id !== element.nativeElement.id) {
          el.pause();
        }
      }
    }
  }
  pauseVideo(element) {
    if(this.isDetail) return;
    element.nativeElement.pause();
    this.paused = true;
  }

  onTimelineChange(): void {
    const time = (this.timeline?.nativeElement.value * this.video?.nativeElement?.duration) / 100;
    this.video.nativeElement.currentTime = time;
  }

  onFullscreen(): void {
    const videoContainer = document.querySelector('.video-player') as any;
    // if (tgtEle?.requestFullscreen) {
    //   tgtEle?.requestFullscreen();
    // }

    // if (tgtEle.exitFullscreen) {
    //   tgtEle.exitFullscreen();
    // }

    if (!this.isFullScreen) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      } else if (videoContainer.webkitRequestFullscreen) {
        /* Safari */
        videoContainer.webkitRequestFullscreen();
      } else if (videoContainer.msRequestFullscreen) {
        /* IE11 */
        videoContainer.msRequestFullscreen();
      }
      this.isFullScreen = true;
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        /* Safari */
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        /* IE11 */
        (document as any).msExitFullscreen();
      }

      this.isFullScreen = false;
    }
  }
}
