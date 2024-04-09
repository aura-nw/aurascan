import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NUMBER_2_DIGIT } from 'src/app/core/constants/common.constant';
import { pipeTypeData } from 'src/app/core/constants/transaction.enum';

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
  @Input() denom: any = { display: null, decimal: 6 };
  @Input() pipeType: string = '';

  pipeTypeData = pipeTypeData;
  number2Digit = NUMBER_2_DIGIT;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  executeLink(linkUrl, data) {
    if (linkUrl.indexOf('http') > -1) {
      this.router.navigate([linkUrl, data]);
    } else {
      window.open(linkUrl, '_blank');
    }
  }
}
