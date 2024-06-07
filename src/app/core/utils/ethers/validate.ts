import { JsonFragmentType } from 'ethers';

export function validateAndParsingInput(type: JsonFragmentType, value: any) {
  switch (type.type) {
    case 'uint256':
    case 'bytes4':
      return { value };
    case 'bool':
      if (value?.toLowerCase() !== 'true' && value?.toLowerCase() !== 'false') {
        return { value, error: `"${value}" is an invalid parameter, please use true/false.` };
      }
      return { value: value?.toLowerCase() === 'true' ? true : false };
    default:
      return { value };
  }
}
