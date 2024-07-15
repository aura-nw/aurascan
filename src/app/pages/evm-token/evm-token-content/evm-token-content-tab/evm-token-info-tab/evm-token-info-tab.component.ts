import { Component, Input, OnInit } from '@angular/core';
import { FeatureFlagService } from '../../../../../core/data-services/feature-flag.service';

@Component({
  selector: 'app-evm-token-info-tab',
  templateUrl: './evm-token-info-tab.component.html',
  styleUrls: ['./evm-token-info-tab.component.scss'],
})
export class EvmTokenInfoTabComponent implements OnInit {
  constructor() {}
  @Input() overviewInfo?: string;
  ngOnInit(): void {}
}
