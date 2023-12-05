import { Pipe, PipeTransform } from '@angular/core';
import { NameTagService } from '../services/name-tag.service';

@Pipe({ name: 'nameTag' })
export class NameTagPipe implements PipeTransform {
  constructor(private nameTagService: NameTagService) {}
  transform(address, getPrivate = true, type = 'name') {
    if (type === 'name') {
      return this.nameTagService.getNameTag(address, getPrivate);
    } else {
      return this.nameTagService.findUrlNameTag(address);
    }
  }
}

@Pipe({ name: 'isPublicNameTag' })
export class IsPublicNameTagPipe implements PipeTransform {
  constructor(private nameTagService: NameTagService) {}
  transform(address) {
    return this.nameTagService.checkPublic(address);
  }
}

@Pipe({ name: 'isPrivateNameTag' })
export class IsPrivateNameTagPipe implements PipeTransform {
  constructor(private nameTagService: NameTagService) {}
  transform(address) {
    return this.nameTagService.checkPrivate(address);
  }
}
