import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FeatureFlagService } from '../../../../core/data-services/feature-flag.service';
import { FeatureFlags } from '../../../../core/constants/feature-flags.enum';

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
    dataDecoded?: string;
    isAllowSwitchDecodeDataField?: boolean;
  };
  @Input() index;

  constructor(private featureFlag: FeatureFlagService) {}

  ngOnInit(): void {
    if (!this.featureFlag.isEnabled(FeatureFlags.EnhanceEventLog)) {
      if (this.eventLog?.data) {
        this.eventLog['data'] = this.eventLog?.data.replace('\\x', '');
      }
    }
  }
}
