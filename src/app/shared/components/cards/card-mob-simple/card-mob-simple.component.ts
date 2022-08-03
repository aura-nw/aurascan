import {Component, Input, OnInit} from '@angular/core';
import { CodeTransaction } from '../../../../core/constants/transaction.enum';

export interface CardMobSimpleTitle {
  size: 'sm' | 'md' | 'lg',
  label: string,
  subLabelContent: string,
  subLabelClass?: string,
  rankNum?: number,
  status?: number,
  isFail?: boolean,
}
export interface CardMobSimpleContent {
  label: string,
  class?: string,
  info: any,
}

@Component({
  selector: 'app-card-mob-simple',
  templateUrl: './card-mob-simple.component.html',
  styleUrls: ['./card-mob-simple.component.scss']
})
export class CardMobSimpleComponent implements OnInit {
  @Input() link: string;
  @Input() title: CardMobSimpleTitle;
  @Input() content: CardMobSimpleContent[];

  statusTransaction = CodeTransaction;

  constructor() { }

  ngOnInit(): void {
  }
}
