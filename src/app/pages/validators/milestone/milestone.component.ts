import { Component, OnInit } from '@angular/core';
import {VALIDATOR_AVATAR_DF} from "src/app/core/constants/common.constant";

@Component({
  selector: 'app-milestone',
  templateUrl: './milestone.component.html',
  styleUrls: ['./milestone.component.scss']
})
export class MilestoneComponent implements OnInit {
  mileStoneData = [
    {
      imgUrl: '',
      title: 'Euphoria Companion'
    },
    {
      imgUrl: '',
      title: '1 year Companion'
    },
    {
      imgUrl: '',
      title: '10 millons block commit'
    },
    {
      imgUrl: '',
      title: '3 year Companion'
    },
    {
      imgUrl: '',
      title: '5 year Companion'
    }
  ]
  VALIDATOR_AVATAR_DF;
  constructor() { }

  ngOnInit(): void {
  }

}
