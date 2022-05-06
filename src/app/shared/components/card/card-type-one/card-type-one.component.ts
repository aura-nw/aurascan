import { Component, OnInit, Input } from '@angular/core';
import { CommonService } from '../../../../../app/core/services/common.service';
import { Globals } from '../../../../../app/global/global';

@Component({
  selector: 'app-card-type-one',
  templateUrl: './card-type-one.component.html',
  styleUrls: ['./card-type-one.component.scss']
})

/**
 * Card Type One Component
 */
export class CardTypeOneComponent implements OnInit {
  @Input() data: any[];
  constructor(public global: Globals, public commonService: CommonService) { }

  ngOnInit(): void {
  }
}
