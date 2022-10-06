import { Component, Input, OnInit } from '@angular/core';
const { userAgent } = navigator
@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
})
export class AudioPlayerComponent implements OnInit {
  @Input() link: string;
  @Input() src: any;
  browserEnv = 'default';
  constructor() {}

  ngOnInit() {
    if (userAgent.includes('Firefox/')) {
      // Firefox
    } else if (userAgent.includes('Edg/')) {
      // Edge (Chromium)
    } else if (userAgent.includes('Chrome/')) {
      // Chrome
    } else if (userAgent.includes('Safari/')) {
      this.browserEnv = 'ios'
    }
  }
}
