import { Component, Input, OnInit } from '@angular/core';
import { EModeToken } from 'src/app/core/constants/token.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ProjectDetail } from 'src/app/core/models/project';
import { CommonService } from 'src/app/core/services/common.service';
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
  chainInfo = this.environmentService.chainInfo;

  constructor(
    public commonService: CommonService,
    private environmentService: EnvironmentService,
    public global: Globals,
  ) {}

  ngOnInit(): void {}
}

