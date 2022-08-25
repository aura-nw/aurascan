import { toBinary } from '@cosmjs/cosmwasm-stargate';

function parseValue(item) {
  let value;
  if (item.isBinary) {
    value = toBinary(item.value);
  } else {
    const type = item.type;
    switch (true) {
      case type === 'any':
        try {
          value = JSON.parse(item.value);
        } catch (e) {
          value = item.value;
        }

        break;
      case type === 'integer' || [...type].includes('integer'):
        value = Number(item.value);
        break;
      default:
        value = item.value;
        break;
    }
  }
  return value;
}

function getRef(rootSchemas, ref: string) {
  if (ref) {
    if (rootSchemas && rootSchemas[`/${ref}`]) {
      return rootSchemas[`/${ref}`];
    }
  }

  return null;
}

function getRefType(rootSchema, ref: string): string | string[] {
  if (ref && rootSchema) {
    if (rootSchema && rootSchema[`/${ref}`]) {
      const _ref = rootSchema[`/${ref}`];
      const type = _ref.type;
      if (type === 'object') {
      }
      return rootSchema[`/${ref}`].type;
    }
  }

  return 'any';
}

function getType(rootSchema, schema) {
  const { $ref: ref, type: _type } = schema;
  const isBinary = ref === '#/definitions/Binary';

  const type = ref ? getRefType(rootSchema, ref) : _type;

  return {
    type: type || 'any',
    isBinary,
  };
}

export { parseValue, getType, getRef, getRefType };
