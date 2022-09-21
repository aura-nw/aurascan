import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { pipeTypeData } from 'src/app/core/constants/transaction.enum';
import { Globals } from 'src/app/global/global';

@Component({
  selector: 'app-messages-item',
  templateUrl: './messages-item.component.html',
  styleUrls: ['./messages-item.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MessagesItemComponent implements OnInit {
  @Input() label: string;
  @Input() value: any;
  @Input() dataLink: any;
  @Input() pipeType: string = '';

  pipeTypeData = pipeTypeData;
  
  constructor(
    public global: Globals,
  ) {}

  ngOnInit(): void {
  }
}
