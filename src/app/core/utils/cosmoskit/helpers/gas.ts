import { Decimal } from '@cosmjs/math';
import { GasPrice } from '@cosmjs/stargate';
import { Chain } from '@chain-registry/types';

function getGasPriceByChain(chain: Chain) {
  const { average_gas_price, denom } = chain.fees.fee_tokens[0];

  //convert gasPrice to Decimal
  let gasStep = average_gas_price;
  let pow = 1;

  while (!Number.isInteger(gasStep)) {
    gasStep = gasStep * Math.pow(10, pow);
    pow++;
  }

  return new GasPrice(Decimal.fromAtomics(gasStep.toString(), pow) as any, denom);
}

export { getGasPriceByChain };
