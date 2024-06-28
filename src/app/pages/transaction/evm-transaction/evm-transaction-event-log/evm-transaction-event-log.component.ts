import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-evm-transaction-event-log',
  templateUrl: './evm-transaction-event-log.component.html',
  styleUrls: ['./evm-transaction-event-log.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvmTransactionEventLogComponent {
  @Input() arrTopicDecode;
  @Input() topicsDecoded;
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
}
