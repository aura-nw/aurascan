import { Component, OnInit } from '@angular/core';
import { STORAGE_KEYS } from 'src/app/core/constants/common.constant';
import local from 'src/app/core/utils/storage/local';

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
    this.data = local.getItem(STORAGE_KEYS.CONTRACT_RAW_DATA);
    if (this.data?.type === 'json') {
      this.content = JSON.stringify(this.data.content).split(' ').join('').split('\\n').join('');
    } else {
      this.content = this.data.content;
    }
  }
}
