import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-evm-message',
  templateUrl: './evm-message.component.html',
  styleUrls: ['./evm-message.component.scss'],
})
export class EvmMessageComponent {
  @Input() title: string;
  @Input() type: string;
  @Input() inputData: {
    hexSignature?: string;
    call?: string;
    [key: string]: unknown;
  };
  @Input() eventLog: {
    id: number;
    contractName?: string;
    contract?: string;
    topics?: {
      address: string;
      data: string;
    }[];
    data?: {
      value: string;
      hexValue: string;
    };
  }[];

  showAll = false;
}
