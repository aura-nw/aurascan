import { Component, Input, OnInit } from '@angular/core';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';

@Component({
  selector: 'app-sb-img',
  templateUrl: './sb-img.component.html',
  styleUrls: ['./sb-img.component.scss'],
})
export class SbImgComponent implements OnInit {
  image_s3 = this.environmentService.configValue.image_s3;
  defaultImgToken = this.image_s3 + 'images/aura__ntf-default-img.png';
  isError = false;
  @Input() url;

  constructor(private environmentService: EnvironmentService) {}

  ngOnInit(): void {}

  error(): void {
    this.isError = true;
  }
}
