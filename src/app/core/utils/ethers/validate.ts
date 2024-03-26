import { JsonFragmentType } from 'ethers';

export function validateAndParsingInput(type: JsonFragmentType, value: any) {
  switch (type.type) {
    case 'uint256':
    case 'bytes4':
      return value;
    default:
      return value;
  }
}
