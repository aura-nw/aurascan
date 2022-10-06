import { Component, Input, OnInit } from '@angular/core';
import '@google/model-viewer';

@Component({
  selector: 'app-model-view',
  templateUrl: './model-view.component.html',
  styleUrls: ['./model-view.component.scss'],
})
export class ModelViewComponent implements OnInit {
  @Input() modelUrl: string;
  @Input() appWidth: number;
  @Input() appHeight: number;

  @Input() disablePan = false;

  camera_orbit = '45deg 55deg 2.5m';
  constructor() {}

  ngOnInit(): void {}
}
