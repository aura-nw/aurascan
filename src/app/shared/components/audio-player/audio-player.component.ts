import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
const { userAgent } = navigator;
@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
})
export class AudioPlayerComponent implements OnInit, AfterViewInit {
  @Input() link: string;
  @Input() src: any;
  @Input() nftId;
  @Input() disableLink: boolean;
  @ViewChild('audio') audio!: ElementRef;
  browserEnv = 'default';
  showCustomControl = false;
  paused = true;
  image_s3 = this.environmentService.configValue.image_s3;
  defaultImgToken = this.image_s3 + 'images/aura__ntf-default-img.png';
  constructor(private cdr: ChangeDetectorRef, private environmentService: EnvironmentService) {}

  ngAfterViewInit(): void {
    const isSafari = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);
    this.browserEnv = isSafari ? 'ios' : 'notIos';
    if (this.audio) {
      this.audio.nativeElement.onpause = () => {
        this.paused = this.audio.nativeElement.paused;
      };
    }
    setTimeout(() => {
      this.showCustomControl = true;
    }, 200);
  }

  ngOnInit() {}
  playAudio(element) {
    element.play();
    this.paused = false;
    // Pause all others video
    const cardContain = document.getElementById('nft-cards');
    if (cardContain) {
      for (let i = 0; i < cardContain.children.length; i++) {
        const el: any = document.getElementById('nft#' + i);
        if (el && el.id !== element.id) {
          el.pause();
        }
      }
    }
  }
  pauseAudio(element) {
    element.pause();
    this.paused = true;
  }
}
