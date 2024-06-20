import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'highlight_function' })
export class HighlightFunctionPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(value: string) {
    if (!value) return null;
    let replacedValue = value;

    const parametersPattern = /\([^)]+\)/g;
    const matches = value.match(parametersPattern);

    if (!matches) {
      return [];
    }
    const parameters = matches
      .map((match) => match.replace(/[()]/g, '').trim())
      ?.join(', ')
      ?.split(',');

    parameters.forEach((item) => {
      const params = item?.trim();
      const [dataType, modifier, name] = params?.split(' ') || [];

      const dataTypeHTML = dataType
        ? `<span style="color: var(--aura-green-3); font-family: inherit">${dataType}</span>`
        : '';
      const modifierHTML = modifier
        ? `<span style="color: ${
            !name ? 'var(--aura-red-3)' : 'var(--aura-gray-3)'
          }; font-family: inherit">${modifier}</span>`
        : '';
      const nameHTML = name ? `<span style="color: var(--aura-red-3); font-family: inherit">${name}</span>` : '';

      let html = '';
      if (dataTypeHTML) html += `${dataTypeHTML}`;
      if (modifierHTML) html += ` ${modifierHTML}`;
      if (nameHTML) html += `${name ? ' ' : ''}${nameHTML}`;
      if (!html) return null;

      replacedValue = replacedValue?.replace(new RegExp(`\\b${params}\\b`), html);
    });
    return this.sanitizer.bypassSecurityTrustHtml(replacedValue);
  }
}
