function JsonReplacer(match?: string, pIndent?: string, pKey?: string, pVal?: string, pEnd?: string): string {
  var key = '<span class=json-key> "';
  var val = '<span class=json-value>';
  var str = '<span class=json-string>';
  var r = pIndent || '\t';
  if (pKey) r = r + key + pKey.replace(/[": ]/g, '') + '"</span>: ';
  if (pVal) r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
  return r + (pEnd || '');
}

export function JsonPrettyPrint(obj: unknown): string {
  var jsonLine = /^( *)("[\w@]+": )?("[^"]*"|[\w.+-]*|\[\])?([,[{])?$/gm;

  return JSON.stringify(obj, null, 3)
    .replace(/&/g, '&amp;')
    .replace(/\\"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(jsonLine, JsonReplacer);
}
