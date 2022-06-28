import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-image',
  templateUrl: './loading-image.component.html',
  styleUrls: ['./loading-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingImageComponent {
  @Input() srcImg = '';
  @Input() appClass = '';

  isLoading = true;

  load(): void {
    this.isLoading = false;
  }
}
