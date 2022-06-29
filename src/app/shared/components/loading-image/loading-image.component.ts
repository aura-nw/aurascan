import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { VALIDATOR_AVATAR_DF } from 'src/app/core/constants/common.constant';

@Component({
  selector: 'app-loading-image',
  templateUrl: './loading-image.component.html',
  styleUrls: ['./loading-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingImageComponent {
  @Input() srcImg = '';
  @Input() appClass = '';

  df = VALIDATOR_AVATAR_DF;

  isError = false;

  isLoading = true;

  load(): void {
    this.isLoading = false;
  }

  error(): void {
    this.isError = true;
    this.isLoading = false;
  }
}
