import { Pipe, PipeTransform } from '@angular/core';
import { NameTagService } from '../services/name-tag.service';

@Pipe({ name: 'nameTag' })
export class NameTagPipe implements PipeTransform {
  constructor(private nameTagService: NameTagService) {}
  transform(address, listNameTag = [], getPrivate = true) {
    return this.nameTagService.setNameTag(address, listNameTag, getPrivate);
  }
}

@Pipe({ name: 'checkPublic' })
export class CheckPublicPipe implements PipeTransform {
  constructor(private nameTagService: NameTagService) {}
  transform(address, listNameTag = []) {
    return this.nameTagService.checkPublic(address, listNameTag);
  }
}

@Pipe({ name: 'checkPrivate' })
export class CheckPrivatePipe implements PipeTransform {
  constructor(private nameTagService: NameTagService) {}
  transform(address) {
    return this.nameTagService.checkPrivate(address);
  }
}

@Pipe({ name: 'findUrlNameTag' })
export class FindUrlNameTagPipe implements PipeTransform {
  constructor(private nameTagService: NameTagService) {}
  transform(address) {
    return this.nameTagService.findUrlNameTag(address);
  }
}
