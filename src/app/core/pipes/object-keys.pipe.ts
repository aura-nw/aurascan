import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'appObjectKeys',
})
export class ObjectKeysPipe implements PipeTransform {
  transform(value: unknown): { key: string; value: string; callable?: boolean }[] {
    if (value && typeof value != 'string') {
      return Object.keys(value).map((key) => ({
        key,
        value: typeof value[key] == 'string' ? value[key] : value[key].toString(),
        callable: typeof value[key] == 'function',
      }));
    }

    return [];
  }
}
