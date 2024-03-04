import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-evm-message',
  templateUrl: './evm-message.component.html',
  styleUrls: ['./evm-message.component.scss'],
})
export class EvmMessageComponent {
  @Input() title: string;
  @Input() type: string;
  @Input() inputData: { [key: string]: unknown };
  @Input() eventLog: { [key: string]: unknown };

  logs = [
    {
      id: 1,
      contract: 'XEN Crypto (0x2ab0e9e4ee70fff1fb9d67031e44f6410170d00e)',
      topics: [
        {
          address: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
          data: '> Transfer(address indexed from,address indexed to,uint256 value)',
        },
        {
          address: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
          data: '> Transfer(address indexed from,address indexed to,uint256 value)',
        },
        {
          address: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
          data: '> Transfer(address indexed from,address indexed to,uint256 value)',
        },
      ],
      data: {
        value: '0 COXEN',
        hexValue: '0000000000000000000000000000000000000000000000000000000000000000',
      },
    },
    {
      id: 2,
      contract: 'XEN Crypto (0x2ab0e9e4ee70fff1fb9d67031e44f6410170d00e)',
      topics: [
        {
          address: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
          data: '> Transfer(address indexed from,address indexed to,uint256 value)',
        },
        {
          address: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
          data: '> Transfer(address indexed from,address indexed to,uint256 value)',
        },
        {
          address: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
          data: '> Transfer(address indexed from,address indexed to,uint256 value)',
        },
      ],
      data: {
        value: '0 COXEN',
        hexValue: '0000000000000000000000000000000000000000000000000000000000000000',
      },
    },
    {
      id: 3,
      contract: 'XEN Crypto (0x2ab0e9e4ee70fff1fb9d67031e44f6410170d00e)',
      topics: [
        {
          address: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
          data: '> Transfer(address indexed from,address indexed to,uint256 value)',
        },
        {
          address: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
          data: '> Transfer(address indexed from,address indexed to,uint256 value)',
        },
        {
          address: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
          data: '> Transfer(address indexed from,address indexed to,uint256 value)',
        },
      ],
      data: {
        value: '0 COXEN',
        hexValue: '0000000000000000000000000000000000000000000000000000000000000000',
      },
    },
  ];

  showAll = false;
}
