import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'highlight_function' })
export class HighlightFunctionPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(value: string) {
    if (!value) return null;
    let replacedValueHtml = value;
      
  let paramsString = value.replace(/^.*?\((.*)\)$/, '$1');

  let paramsArray = [];
  let nestedCount = 0;
  let currentParam = '';
  for (let char of paramsString) {
      if (char === '(') nestedCount++;
      if (char === ')') nestedCount--;
      if (char === ',' && nestedCount === 0) {
          paramsArray.push(currentParam.trim());
          currentParam = '';
      } else {
          currentParam += char;
      }
  }
  paramsArray.push(currentParam.trim());

  let params = paramsArray.map(param => {
      let paramParts = param.match(/^(.*?)(indexed\s+)?(\w+)$/);
      return {
          dataType: paramParts?.[1]?.trim(),
          modifier: paramParts[2]?.trim(),
          name: paramParts?.[3]?.trim()
      };
  });
    
  params.map((item) => {
      const {dataType, modifier, name} = item;
      
      const dataTypeHTML = dataType
        ? `<span style="color: var(--aura-green-3); font-family: inherit">${dataType}</span>`
        : '';
      const modifierHTML = modifier
        ? `<span style="color: ${
            !name ? 'var(--aura-red-3)' : 'var(--aura-gray-3)'
          }; font-family: inherit">${modifier}</span>`
        : '';
      const nameHTML = name ? `<span style="color: var(--aura-red-3); font-family: inherit">${name}</span>` : '';
   
      const replaceValue = Object.values(item)?.filter(Boolean)?.join(" ");
      replacedValueHtml = replacedValueHtml?.replace(replaceValue, `${dataTypeHTML} ${modifierHTML} ${nameHTML}`);
    });
    return this.sanitizer.bypassSecurityTrustHtml(replacedValueHtml);
  }
}

