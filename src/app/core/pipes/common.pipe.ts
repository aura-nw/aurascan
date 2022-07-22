import { Pipe, PipeTransform } from '@angular/core';
import { EnvironmentService } from '../data-services/environment.service';

@Pipe({ name: 'calDate' })
export class pipeCalDate implements PipeTransform {
  transform(value: string): string {
    const date = new Date(value);
    const today = new Date();
    const timeAgo = Math.round(Math.abs(today.getTime() - date.getTime()) / 1000) || 0;
    if (timeAgo > 60 * 60 * 24) {
      return Math.round(timeAgo / (60 * 60 * 24)) + ' day';
    }
    if (timeAgo > 60 * 60) {
      return Math.round(timeAgo / (60 * 60)) + 'h';
    }

    if (timeAgo > 60) {
      return Math.round(timeAgo / 60) + 'm';
    }
    return timeAgo + 's';
  }
}

@Pipe({ name: 'cutStringPipe' })
export class PipeCutString implements PipeTransform {
  transform(value: string, start: number, end?: number): string {
    if (value && value.length > start) {
      if (end) {
        const middleText = value.substring(start, value.length - end);
        value = value.replace(middleText, '...');
      } else {
        const middleText = value.substring(0, start);
        value = middleText + '...';
      }
    }
    return value;
  }
}

@Pipe({ name: 'imageS3' })
export class ImageURL implements PipeTransform {
  constructor(private environmentService: EnvironmentService) {
  }
  transform(value: string): string {
    const replacePath = /\..\//gi;
    value = value.replace(replacePath, '');
    const replaceLink = /assets\//gi;
    value = value.replace(replaceLink, this.environmentService.configValue.image_s3);
    return value;
  }
}
