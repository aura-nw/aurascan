import { Pipe, PipeTransform } from '@angular/core';
import { CommonService } from '../services/common.service';

@Pipe({ name: 'isContract' })
export class IsContractPipe implements PipeTransform {
  constructor(private commonService: CommonService) {}
  transform(address: string): boolean {
    return this.commonService.isValidContract(address);
  }
}
