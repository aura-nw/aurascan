import { Component, Input, OnInit } from '@angular/core';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';

interface IDecodeData {
  name: string;
  decode: string;
  isLink: boolean;
}
@Component({
  selector: 'app-decode-message',
  templateUrl: './decode-message.component.html',
  styleUrls: ['./decode-message.component.scss'],
})
export class DecodeMessageComponent implements OnInit {
  @Input() index: number | string;
  @Input() isLink?: boolean;
  @Input() name?: string;
  @Input() isAllowSwitchDecode?: boolean;
  @Input() value: string;
  @Input() decode: string;
  @Input() decodeData: IDecodeData[] = [];
  @Input() isHighlight?: boolean;

  data = '';
  type: 'Decode' | 'Hex' = 'Hex';
  isMobile = false;

  constructor(private environmentService: EnvironmentService) {}

  ngOnInit(): void {
    this.isMobile = this.environmentService.isMobile;
    this.data = this.value;
  }
  onDecode() {
    this.type = 'Decode';
    this.data = this.decode;
  }

  onHex() {
    this.type = 'Hex';
    this.data = this.value;
  }
}
