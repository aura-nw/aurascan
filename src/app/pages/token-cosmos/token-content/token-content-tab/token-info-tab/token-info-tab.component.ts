import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-token-info-tab',
  templateUrl: './token-info-tab.component.html',
  styleUrls: ['./token-info-tab.component.scss'],
})
export class TokenInfoTabComponent implements OnInit {
  constructor() {}
  @Input() overviewInfo?: string;
  ngOnInit(): void {}
}

