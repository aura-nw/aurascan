import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { VALIDATOR_AVATAR_DF } from 'src/app/core/constants/common.constant';
import { CommonService } from 'src/app/core/services/common.service';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';

@Component({
  selector: 'app-loading-image',
  templateUrl: './loading-image.component.html',
  styleUrls: ['./loading-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingImageComponent implements OnInit, OnChanges, OnDestroy {
  @Input() srcImg = '';
  @Input() identity = '';
  @Input() appClass = '';
  df = VALIDATOR_AVATAR_DF;
  isError = false;
  isLoading = true;
  observer!: IntersectionObserver;
  isReady = false;

  constructor(
    private commonService: CommonService,
    private environmentService: EnvironmentService,
    private cdr: ChangeDetectorRef,
    private el: ElementRef<HTMLElement>,
    private ngZone: NgZone,
  ) {}

  load(): void {
    this.isLoading = false;
  }

  error(): void {
    this.isLoading = false;
  }

  async ngOnInit() {}

  async ngOnChanges(changes: SimpleChanges) {
    // this.ngZone.runOutsideAngular(() => {
    //   this.observer = new IntersectionObserver((entries) => {
    //     entries.forEach((e) => {
    //       if (!this.isReady) {
    //         if (e.isIntersecting) {
    //           this.isReady = true;
    //           this.getImage();
    //         }
    //       }
    //     });
    //   });
    //   this.observer.observe(this.el.nativeElement);
    // });
  }

  async getImage() {
    this.isError = false;
    // if (!this.identity || (this.identity && this.identity === '')) {
    //   this.srcImg = this.environmentService.configValue.validator_s3 + '/' + this.srcImg;
    // }
    this.cdr.markForCheck();
    this.isLoading = false;
  }

  ngOnDestroy(): void {
    this.observer.disconnect();
  }
}
