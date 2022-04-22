interface Balance {
  name: string;
  denom: string;
  amount: string;
  price: number;
  total_price: number;
  token_amount?: string;
  token_name?: string;
  total_value?: number;
}

interface Delegation {
  reward: string;
  validator_name: string;
  validator_address: string;
  amount: string;
}

interface UnbondingDelegation {
  validator_name: string;
  validator_address: string;
  amount: string;
  completion_time: string;
}

interface Redelegations {
  validator_src_name: string;
  validator_src_address: string;
  validator_dst_name: string;
  validator_dst_address: string;
  amount: string;
  completion_time: Date;
}
export interface IAccountDetail {
  acc_address: string;
  available: string;
  balances: Balance[];
  amount: string;
  denom: string;
  name: string;
  price: number;
  total_price: number;
  commission: string;
  delegatable_vesting: string;
  delegated: string;
  delegations: Delegation[];
  redelegations: Redelegations[];
  total: string;
  unbonding: string;
  unbonding_delegations: UnbondingDelegation[];
  vesting: {
    type: string;
    amount: string;
    vesting_schedule: string;
  };
  stake_reward: string;
}
