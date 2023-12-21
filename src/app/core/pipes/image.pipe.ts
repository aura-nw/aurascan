import { Pipe, PipeTransform } from '@angular/core';
import { EnvironmentService } from '../data-services/environment.service';

@Pipe({ name: 'imageS3' })
export class ImageURLPipe implements PipeTransform {
  constructor(private environmentService: EnvironmentService) {}

  transform(value: string): string {
    const replacePath = /\..\//gi;
    value = value.replace(replacePath, '');
    const replaceLink = /assets\//gi;
    value = value.replace(replaceLink, this.environmentService.imageUrl);
    return value;
  }
}

@Pipe({ name: 'replaceIpfs' })
export class ReplaceIpfsPipe implements PipeTransform {
  constructor(private environmentService: EnvironmentService) {}

  transform(value: string): string {
    return this.environmentService.ipfsDomain + value.replace('://', '/');
  }
}
