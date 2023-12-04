import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import '@google/model-viewer';

@Component({
  selector: 'app-model-view',
  templateUrl: './model-view.component.html',
  styleUrls: ['./model-view.component.scss'],
})
export class ModelViewComponent {
  @Input() modelUrl: string;
  @Input() appWidth: number;
  @Input() appHeight: number;
  @Input() link;
  @Input() previewImg: string;
  @Input() disablePan = false;

  constructor(private router: Router) {}

  goTo(link) {
    this.router.navigate([link]);
  }
}
