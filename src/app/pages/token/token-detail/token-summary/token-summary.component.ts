import { Component, Input, OnInit } from '@angular/core';
import { ProjectDetail } from 'src/app/core/models/project';

@Component({
  selector: 'app-token-summary',
  templateUrl: './token-summary.component.html',
  styleUrls: ['./token-summary.component.scss'],
})
export class TokenSummaryComponent implements OnInit {
  @Input() tokenDetail: any;
  projectDetail: ProjectDetail;

  constructor() {}

  ngOnInit(): void {}
}
