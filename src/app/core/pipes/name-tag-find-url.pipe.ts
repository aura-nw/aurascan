import { CommonService } from 'src/app/core/services/common.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'findUrlNameTag' })
export class FindUrlNameTag implements PipeTransform {
  constructor(public commonService: CommonService) {}
  transform(address) {
    return this.commonService.findUrlNameTag(address);
  }
}
