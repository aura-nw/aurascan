import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'cutStringPipe' })
export class CutStringPipe implements PipeTransform {
  transform(value: string, start: number, end?: number): string {
    let endChar = end || 0;
    if (value && value.length > start + endChar) {
      if (end) {
        const firstChar = value.substring(0, start);
        const lastChar = value.substring(value.length - end);
        value = firstChar + '...' + lastChar;
      } else {
        const middleText = value.substring(0, start);
        value = middleText + '...';
      }
    }
    return value;
  }
}

@Pipe({ name: 'stringEllipsis' })
export class StringEllipsisPipe implements PipeTransform {
  transform(value: string, limit: number): string {
    if (value && value.length > limit) {
      let firstChar = limit ? value.substring(0, limit) : value.substring(0, 16);
      value = firstChar + '...';
    }
    return value;
  }
}

@Pipe({ name: 'ellipsis' })
export class EllipsisPipe implements PipeTransform {
  transform(value: string, start: number, end?: number): string {
    let endChar = end || 0;

    if (value && value.length > start + endChar) {
      if (end) {
        const firstChar = value.substring(0, start);
        const lastChar = value.substring(value.length - end);
        value = firstChar + '...' + lastChar;
      } else {
        const middleText = value.substring(0, start);
        value = middleText + '...';
      }
    }

    return value;
  }
}
