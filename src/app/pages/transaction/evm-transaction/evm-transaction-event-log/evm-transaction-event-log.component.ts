import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-evm-transaction-event-log',
  templateUrl: './evm-transaction-event-log.component.html',
  styleUrls: ['./evm-transaction-event-log.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvmTransactionEventLogComponent implements OnInit {
  @Input() eventLog: {
    id: number;
    contractName?: string;
    contract?: string;
    topics?: unknown[];
    data?: unknown;
  } = {
    id: 1,
    contractName: 'XEN Crypto',
    contract: '0x2ab0e9e4ee70fff1fb9d67031e44f6410170d00e',
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
  };
  ngOnInit(): void {}
}
