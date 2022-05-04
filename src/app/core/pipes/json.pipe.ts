import { Pipe, PipeTransform } from '@angular/core';
import { JsonPrettyPrint } from '../utils/common/json-viewer';

@Pipe({
  name: 'appJson'
})
export class JsonPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): unknown {
    return JsonPrettyPrint(value);
  }

}
