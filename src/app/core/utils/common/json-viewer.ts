function JsonReplacer(match?: string, pIndent?: string, pKey?: string, pVal?: string, pEnd?: string): string {
  const key = '<span class=json-key> "';
  const val = '<span class=json-value>';
  const strShort = '<span class=json-string>';
  const strLong = '<span class="json-string string-long">';
  const str = pVal?.length >= 200 ? strLong : strShort;
  let r = pIndent || '';
  if (pKey) r = r + key + pKey.replace(/[": ]/g, '') + '"</span>: ';
  if (pVal) r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
  return r + (pEnd || '');
}

export function JsonPrettyPrint(obj: unknown): string {
  const jsonLine = /^( *)("[\w@]+": )?("[^"]*"|[\w.+-]*|\[\])?([,[{])?$/gm;

  return JSON.stringify(obj, null, 3)
    .replace(/&/g, '&amp;')
    .replace(/\\"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(jsonLine, JsonReplacer);
}
