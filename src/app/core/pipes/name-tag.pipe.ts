import { CommonService } from 'src/app/core/services/common.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'nameTag' })
export class NameTagPipe implements PipeTransform {
  constructor(public commonService: CommonService) {}
  transform(address, listNameTag = [], getPrivate = true) {
    return this.commonService.setNameTag(address, listNameTag, getPrivate);
  }
}

@Pipe({ name: 'checkPublic' })
export class CheckPublicPipe implements PipeTransform {
  constructor(public commonService: CommonService) {}
  transform(address, listNameTag = []) {
    return this.commonService.checkPublic(address, listNameTag);
  }
}

@Pipe({ name: 'checkPrivate' })
export class CheckPrivatePipe implements PipeTransform {
  constructor(public commonService: CommonService) {}
  transform(address) {
    return this.commonService.checkPrivate(address);
  }
}

@Pipe({ name: 'findUrlNameTag' })
export class FindUrlNameTagPipe implements PipeTransform {
  constructor(public commonService: CommonService) {}
  transform(address) {
    return this.commonService.findUrlNameTag(address);
  }
}
