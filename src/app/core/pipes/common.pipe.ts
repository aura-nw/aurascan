import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';
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
    let endChar = end || 0;
    if (value && value.length > (start + endChar)) {
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
export class StringEllipsis implements PipeTransform {
  transform(value: string, limit: number): string {
    if (value && value.length > limit) {
      let firstChar = limit ? value.substring(0, limit) : value.substring(0, 16);
      value = firstChar + '...';
    }
    return value;
  }
}

@Pipe({ name: 'imageS3' })
export class ImageURL implements PipeTransform {
  constructor(private environmentService: EnvironmentService) {}
  transform(value: string): string {
    const replacePath = /\..\//gi;
    value = value.replace(replacePath, '');
    const replaceLink = /assets\//gi;
    value = value.replace(replaceLink, this.environmentService.configValue.image_s3);
    return value;
  }
}

@Pipe({ name: 'customDate' })
export class CustomDate implements PipeTransform {
  transform(value: string, format: string) {
    const date = new Date(value);
    value = formatDate(date, format, 'en-US');
    return value;
  }
}

@Pipe({ name: 'balanceOf' })
export class BalanceOf implements PipeTransform {
  transform(amount: string | number, decimal = 6) {
    return +(new BigNumber(amount).toNumber() / Math.pow(10, 6)).toFixed(decimal);
  }
}

@Pipe({ name: 'replaceIpfs' })
export class ReplaceIpfs implements PipeTransform {
  constructor(private environmentService: EnvironmentService) {}
  transform(value: string): string {
    return this.environmentService.configValue.ipfsDomain + value.replace('://', '/');
  }
}

@Pipe({ name: 'convertUauraToAura' })
export class ConvertUauraToAura implements PipeTransform {
  transform(value: number, powNum?: number): number {
    return value / Math.pow(10, powNum);
  }
}
