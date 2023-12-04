import { CommonService } from 'src/app/core/services/common.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'checkDisplayTooltip' })
export class CheckDisplayTooltip implements PipeTransform {
  constructor(public commonService: CommonService) {}
  transform(address) {
    return this.commonService.checkDisplayTooltip(address);
  }
}
