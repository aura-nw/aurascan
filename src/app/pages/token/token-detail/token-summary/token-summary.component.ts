import { Component, Input, OnInit } from '@angular/core';
import { EModeToken } from 'src/app/core/constants/token.enum';
import { ProjectDetail } from 'src/app/core/models/project';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-token-summary',
  templateUrl: './token-summary.component.html',
  styleUrls: ['./token-summary.component.scss'],
})
export class TokenSummaryComponent implements OnInit {
  @Input() tokenDetail: any;
  projectDetail: ProjectDetail;
  EModeToken = EModeToken;

  constructor(public commonService: CommonService) {}

  ngOnInit(): void {
  }
}
