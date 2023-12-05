import { Pipe, PipeTransform } from '@angular/core';
import { NameTagService } from '../services/name-tag.service';

@Pipe({ name: 'checkDisplayTooltip' })
export class CheckDisplayTooltip implements PipeTransform {
  constructor(public nameTagService: NameTagService) {}
  transform(address) {
    return this.nameTagService.checkDisplayTooltip(address);
  }
}
