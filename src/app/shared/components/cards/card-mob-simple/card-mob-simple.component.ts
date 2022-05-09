import {Component, Input, OnInit} from '@angular/core';

export interface CardMobSimpleTitle {
  size: 'sm' | 'md' | 'lg',
  label: string,
  subLabelContent: string,
  subLabelClass?: string,
  rankNum?: number,
  isFail?: boolean,
}
export interface CardMobSimpleContent {
  label: string,
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

  constructor() { }

  ngOnInit(): void {
  }

}
