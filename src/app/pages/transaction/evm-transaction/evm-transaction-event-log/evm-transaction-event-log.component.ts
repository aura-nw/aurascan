import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-evm-transaction-event-log',
  templateUrl: './evm-transaction-event-log.component.html',
  styleUrls: ['./evm-transaction-event-log.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvmTransactionEventLogComponent implements OnInit {
  @Input() arrTopicDecode;
  @Input() eventLog: {
    id: number;
    contractName?: string;
    address?: string;
    topics?: {
      address: string;
      data: string;
    }[];
    data: string;
  };
  @Input() index;

  ngOnInit(): void {
    if (this.eventLog?.data) {
      this.eventLog['data'] = this.eventLog?.data.replace('\\x', '');
    }
  }
}
