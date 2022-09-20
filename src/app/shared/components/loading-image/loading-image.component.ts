import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { VALIDATOR_AVATAR_DF } from 'src/app/core/constants/common.constant';
import { CommonService } from 'src/app/core/services/common.service';

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
  imgByIdentity = '';
  df = VALIDATOR_AVATAR_DF;

  isError = false;

  isLoading = true;

  constructor(
    private commonService: CommonService,
    private  cdr: ChangeDetectorRef
  ){

  }

  load(): void {
    this.isLoading = false;
  }

  error(): void {
    this.isLoading = false;
  }

  async ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges) {
    if(this.identity && this.identity !== '') {
      const req = await this.commonService.getValidatorImg(this.identity);
      this.imgByIdentity = req.data['them'][0]?.pictures?.primary?.url;
      this.cdr.markForCheck();
      this.isError = false;
    } else {
      this.isError = true;
    }
    this.isLoading = false;
  }
}
