import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-blank',
  templateUrl: './blank.component.html',
  styleUrls: ['./blank.component.scss'],
})
export class BlankComponent implements OnInit {
  data;
  content;
  constructor() {}

  ngOnInit(): void {
    this.data = JSON.parse(localStorage.getItem('contractRawData'));
    if (this.data.type === 'json') {
      this.content = JSON.stringify(this.data.content).split(' ').join('').split('\\n').join('');
    } else {
      this.content = this.data.content;
    }
  }
}
