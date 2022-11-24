import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-soulbound-feature-tokens',
  templateUrl: './soulbound-feature-tokens.component.html',
  styleUrls: ['./soulbound-feature-tokens.component.scss']
})
export class SoulboundFeatureTokensComponent implements OnInit {
  @Input() soulboundList;
  @Input() extend = true;
  @Input() accountAddress;

  constructor() { }

  ngOnInit(): void {
  }

}
