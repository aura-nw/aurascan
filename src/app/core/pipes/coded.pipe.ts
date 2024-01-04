import { Pipe, PipeTransform } from '@angular/core';
import { gte } from 'lodash';
import { EnvironmentService } from '../data-services/environment.service';

@Pipe({ name: 'decodeData' })
export class DecodeDataPipe implements PipeTransform {
  constructor(private environmentService: EnvironmentService) {}
  transform(value: string): string {
    const cosmos_sdk_version = this.environmentService?.chainConfig?.cosmos_sdk_version || 'v0.47.4';
    return gte(cosmos_sdk_version, 'v0.47.4') ? value : atob(value);
  }
}
