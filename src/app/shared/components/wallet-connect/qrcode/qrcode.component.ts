import { Component, Input, ViewEncapsulation } from '@angular/core';
import { WalletBase } from '@cosmos-kit/core';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-qrcode',
  templateUrl: './qrcode.component.html',
  styleUrls: ['./qrcode.component.scss'],
})
export class QrcodeComponent {
  @Input() qrdata: WalletBase['qrUrl'];
  @Input() imageSrc: string;

  constructor(public commonService: CommonService) {}
}
