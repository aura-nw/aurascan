import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-decode-message',
  templateUrl: './decode-message.component.html',
  styleUrls: ['./decode-message.component.scss'],
})
export class DecodeMessageComponent implements OnInit {
  @Input() index: number | string;
  @Input() name?: string;
  @Input() isAllowSwitchDecode?: boolean;
  @Input() value: string;
  @Input() decode: string;
  @Input() isHighlight?: boolean;
  
  data = '';
  type: 'Decode' | 'Hex' = 'Hex';

  ngOnInit(): void {
    this.data = this.value
  }
  onDecode() {
    this.type = 'Decode';
    this.data = this.decode
  }

  onHex() {
    this.type = 'Hex';
    this.data = this.value
  }
}
