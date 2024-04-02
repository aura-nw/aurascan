import { id as keccak256Str } from 'ethers';
import { ABI_CHECK_INTERFACE } from '../constants/transaction.constant';
import { EMethodContract } from '../constants/common.constant';
let listTxEvmMapping: Map<string, string>;

export function getFunctionNameByMethodId(methodId: string) {
  let methodTemp = '';
  if (listTxEvmMapping) {
    methodTemp = listTxEvmMapping.get(methodId);
  } else {
    let arrTxMapping = ABI_CHECK_INTERFACE.map<[string, string]>((k) => {
      let item = keccak256Str(k).slice(2, 10);
      return [item, k];
    });
    arrTxMapping?.unshift([EMethodContract.Creation, 'Create Contract']);
    listTxEvmMapping = new Map(arrTxMapping);
    methodTemp = listTxEvmMapping.get(methodId);
  }

  if (!methodTemp) return methodId?.slice(0, 8) || 'Send';

  methodTemp = methodTemp?.charAt(0).toUpperCase() + methodTemp?.slice(1);
  const indexChar = methodTemp?.indexOf('(');
  if (indexChar > 0) {
    methodTemp = methodTemp?.substring(0, indexChar);
  }
  return methodTemp;
}
