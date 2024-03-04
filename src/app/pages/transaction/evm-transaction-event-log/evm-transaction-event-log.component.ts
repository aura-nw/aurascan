import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-evm-transaction-event-log',
  templateUrl: './evm-transaction-event-log.component.html',
  styleUrls: ['./evm-transaction-event-log.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvmTransactionEventLogComponent {}
