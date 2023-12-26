import { Pipe, PipeTransform } from '@angular/core';
import { NameTagService } from '../services/name-tag.service';

@Pipe({ name: 'nameTagTooltipPipe' })
export class NameTagTooltipPipe implements PipeTransform {
  constructor(public nameTagService: NameTagService) {}
  transform(address: string) {
    return this.nameTagService.checkDisplayTooltip(address);
  }
}
