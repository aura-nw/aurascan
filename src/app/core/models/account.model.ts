export interface IAccountDetail {
  acc_address: string;
  available: string;
  balances: { name: string; denom: string; amount: string; price: number; total_price: number }[];
  amount: string;
  denom: string;
  name: string;
  price: number;
  total_price: number;
  commission: string;
  delegatable_vesting: string;
  delegated: string[];
  delegations: string[];
  redelegations: string;
  total: string;
  unbonding: string;
  unbonding_delegations: string[];
  vesting: {
    type: string;
    amount: string;
    vesting_schedule: string;
  };
}
