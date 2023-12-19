import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'decodeData' })
export class DecodeDataPipe implements PipeTransform {
  transform(value: string): string {
    return atob(value);
  }
}
