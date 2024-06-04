import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'highlight_function' })
export class HighlightFunctionPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(value: string) {
    if (!value) return null;
    let replacedValue = value;
    const parametersPattern = /\(([^)]+)\)/;
    const parametersMatch = value.match(parametersPattern);
    const parameters = parametersMatch ? parametersMatch[1]?.split(',')?.map((param) => param?.trim()) : [];

    parameters.map((item) => {
      const [dataType, modifier, name] = item?.split(' ') || [];
      const dataTypeHTML = dataType ? `<span style="color: var(--aura-green-3)">${dataType}</span>` : '';
      const modifierHTML = modifier
        ? `<span style="color: ${!name ? 'var(--aura-red-3)' : 'var(--aura-gray-3)'}">${modifier}</span>`
        : '';
      const nameHTML = name ? `<span style="color: var(--aura-red-3)">${name}</span>` : '';

      replacedValue = replacedValue?.replace(item, `${dataTypeHTML} ${modifierHTML} ${nameHTML}`);
    });
    return this.sanitizer.bypassSecurityTrustHtml(replacedValue);
  }
}
