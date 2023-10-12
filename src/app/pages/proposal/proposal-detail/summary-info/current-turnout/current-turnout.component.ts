import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NUMBER_ONLY_DECIMAL } from 'src/app/core/constants/common.constant';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-current-turnout',
  templateUrl: './current-turnout.component.html',
  styleUrls: ['./current-turnout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentTurnoutComponent implements OnInit {
  @Input() proposalDetail;
  @Input() isNotReached;
  @Input() quorumStatus;

  constructor(
    public dialog: MatDialog,
    public commonService: CommonService,
    private numberPipe: DecimalPipe,
  ) {}

  ngOnInit(): void {}
  formatNumber(number: number, args?: any): any {
    if (isNaN(number)) return null; // will only work value is a number
    if (number === null) return null;
    if (number === 0) return null;
    let abs = Math.abs(number);
    const rounder = Math.pow(10, 1);
    const isNegative = number < 0; // will also work for Negetive numbers
    let key = '';

    const powers = [
      { key: 'Q', value: Math.pow(10, 15) },
      { key: 'T', value: Math.pow(10, 12) },
      { key: 'B', value: Math.pow(10, 9) },
      { key: 'M', value: Math.pow(10, 6) },
      { key: 'K', value: 1000 },
    ];

    for (let i = 0; i < powers.length; i++) {
      let reduced = abs / powers[i].value;
      reduced = Math.round(reduced * rounder) / rounder;
      if (reduced >= 1) {
        abs = reduced;
        key = powers[i].key;
        break;
      }
    }

    if (key === '') {
      let numberVote: string;
      numberVote = this.numberPipe.transform(abs, NUMBER_ONLY_DECIMAL);
      return (isNegative ? '-' : '') + numberVote + key;
    }
    return (isNegative ? '-' : '') + abs + key;
  }
}
