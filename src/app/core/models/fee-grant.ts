export interface Grantee {
  txhash: string;
  address: string;
  type: string;
  time?: string;
  limit?: string;
  expiration?: string;
  spendable?: number;
  reason?: string;
}
