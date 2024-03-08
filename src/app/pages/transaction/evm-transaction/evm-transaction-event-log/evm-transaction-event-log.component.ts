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
    address?: string;
    topics?: {
      address: string;
      data: string;
    }[];
    data?: {
      value: string;
      hexValue: string;
    };
  };
  @Input() index;

  ngOnInit(): void {}
}
