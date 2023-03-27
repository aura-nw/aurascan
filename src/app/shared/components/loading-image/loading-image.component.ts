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
  SimpleChanges
} from '@angular/core';
import { VALIDATOR_AVATAR_DF } from 'src/app/core/constants/common.constant';
import { CommonService } from 'src/app/core/services/common.service';

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
  imgByIdentity = '';
  df = VALIDATOR_AVATAR_DF;
  isError = false;
  isLoading = true;
  observer!: IntersectionObserver;

  constructor(
    private commonService: CommonService,
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
    this.ngZone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            this.getImage();
          }
        });
      });
      this.observer.observe(this.el.nativeElement);
    });
  }

  async getImage() {
    if (this.identity && this.identity !== '') {
      const req = await this.commonService.getValidatorImg(this.identity);
      if (req?.data['them'] && req?.data['them'][0]?.pictures?.primary?.url) {
        this.imgByIdentity = req.data['them'][0]?.pictures?.primary?.url;
        this.isError = false;
      } else {
        this.isError = true;
      }
    } else {
      this.isError = true;
    }
    this.cdr.markForCheck();
    this.isLoading = false;
  }
  
  ngOnDestroy(): void {
    this.observer.disconnect();
  }
}
