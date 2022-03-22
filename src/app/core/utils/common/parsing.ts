import BigNumber from "bignumber.js";

export function balanceOf(amount: string | number): number {
  return +(new BigNumber(amount).toNumber() / Math.pow(10, 6)).toFixed(6);
}
