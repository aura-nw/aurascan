import { CommonService } from 'src/app/core/services/common.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'checkPrivate' })
export class CheckPrivate implements PipeTransform {
  constructor(public commonService: CommonService) {}
  transform(address) {
    return this.commonService.checkPrivate(address);
  }
}
