import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-schema-viewer',
  templateUrl: './schema-viewer.component.html',
  styleUrls: ['./schema-viewer.component.scss'],
})
export class SchemaViewerComponent implements OnInit {
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
