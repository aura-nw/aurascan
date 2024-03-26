import { Pipe, PipeTransform } from '@angular/core';
import { getFunctionNameByMethodId } from '../helpers/chain';

@Pipe({ name: 'convertEvmTx' })
export class ConvertEvmTxPipe implements PipeTransform {
  constructor() {}
  transform(methodId: string): string {
    return getFunctionNameByMethodId(methodId);
  }
}
