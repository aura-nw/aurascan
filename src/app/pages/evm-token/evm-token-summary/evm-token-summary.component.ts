import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { EModeToken } from 'src/app/core/constants/token.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ProjectDetail } from 'src/app/core/models/project';
import { CommonService } from 'src/app/core/services/common.service';
import { IBCService } from 'src/app/core/services/ibc.service';
import { Globals } from 'src/app/global/global';

@Component({
  selector: 'app-evm-token-summary',
  templateUrl: './evm-token-summary.component.html',
  styleUrls: ['./evm-token-summary.component.scss'],
})
export class EvmTokenSummaryComponent implements OnInit {
  @Input() tokenDetail: any;
  projectDetail: ProjectDetail;
  EModeToken = EModeToken;
  channelId: string;
  channelCounterId: string;
  chainInfo = this.environmentService.chainInfo;

  constructor(
    public commonService: CommonService,
    private ibcService: IBCService,
    private router: ActivatedRoute,
    private environmentService: EnvironmentService,
    public global: Globals,
  ) {}

  ngOnInit(): void {
    // this.getChannelInfoByDenom();
  }

  getChannelInfoByDenom() {
    const denomHash = this.router.snapshot.paramMap.get('contractAddress');
    if (!denomHash?.startsWith(this.chainInfo.bech32Config.bech32PrefixAccAddr)) {
      this.channelId = this.tokenDetail.channelPath?.path?.replace('transfer/', '');
      this.ibcService.getChannelCounter(this.channelId).subscribe((res) => {
        this.channelCounterId = _.get(res, 'ibc_channel[0].counterparty_channel_id');
      });
    }
  }
}
