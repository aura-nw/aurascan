import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit
} from '@angular/core';
import { VALIDATOR_AVATAR_DF } from 'src/app/core/constants/common.constant';

@Component({
  selector: 'app-loading-image',
  templateUrl: './loading-image.component.html',
  styleUrls: ['./loading-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingImageComponent implements OnInit, OnChanges {
  @Input() srcImg = '';
  @Input() identity = '';
  @Input() appClass = '';
  df = VALIDATOR_AVATAR_DF;
  isError = false;
  isLoading = true;
  observer!: IntersectionObserver;
  isReady = false;

  constructor(private cdr: ChangeDetectorRef) {}

  load(): void {
    this.isLoading = false;
  }

  error(): void {
    this.isLoading = false;
  }

  async ngOnInit() {}

  ngOnChanges(): void {
    this.isError = false;
    if (!this.identity) {
      this.srcImg = this.df;
    }
    this.cdr.markForCheck();
  }
}
