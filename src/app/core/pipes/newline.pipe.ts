import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'newline' })
export class NewlinePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(value: string) {
    if (!value) return null;
    let replacedValue = value;
    replacedValue = replacedValue?.replace(/\n/gi, '<br/>');
    replacedValue = replacedValue?.replace(/ /gi, '&nbsp;');

    return this.sanitizer.bypassSecurityTrustHtml(replacedValue);
  }
}

