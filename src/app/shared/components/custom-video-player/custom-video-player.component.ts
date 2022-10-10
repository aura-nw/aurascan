import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

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
  @Input() showControl = true;
  @Input() isMuted = false;
  isFullScreen = false;
  constructor() {}

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
    }
  }
  playVideo(element) {
    element.play();
  }
  pauseVideo(element) {
    element.pause();

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
