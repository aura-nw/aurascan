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

  showAll = false;
}
