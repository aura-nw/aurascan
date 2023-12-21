import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'ellipsis' })
export class EllipsisPipe implements PipeTransform {
  transform(value: string, start: number, end: number = 0): string {
    const length = value?.length;

    if (length > start) {
      const firstPart = start ? value.slice(0, start) : '';
      const lastPart = end && length > start + end ? value.slice(length - end, length) : '';

      const middleText = start != 0 ? '...' : '';

      return `${firstPart}${middleText}${lastPart}`;
    }

    return value;
  }
}
