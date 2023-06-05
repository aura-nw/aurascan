import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';


export interface CardMobExplainTitle {
  label: string;
  labelLink: string;
  subLabel: string;
}
export interface CardMobContent {
  label: string;
  class?: string;
  info: any;
}
@Component({
  selector: 'app-card-mob-explain',
  templateUrl: './card-mob-explain.component.html',
  styleUrls: ['./card-mob-explain.component.scss']
})

export class CardMobExplainComponent implements OnInit, OnChanges {
  @Input() title: CardMobExplainTitle;
  @Input() status: any;
  @Input() content: CardMobContent[];
  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

}
