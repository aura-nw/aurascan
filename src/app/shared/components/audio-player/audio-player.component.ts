import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
})
export class AudioPlayerComponent implements OnInit {
  @Input() link: string;
  @Input() src: any;
  constructor() {}

  ngOnInit() {
    console.log(this.link)
  }
}
