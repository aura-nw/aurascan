import * as _ from 'lodash';

export const ACCOUNT_TEMPLATE = _.template(
  'query Account($address: String) { ${chain}  { account(where: {address: {_eq: $address}}) { type sequence spendable_balances pubkey id balances account_number address } } }',
);

export const VALIDATORS_TEMPLATE = _.template(
  'query Validators { ${chain} { validator { jailed image_url description account_address operator_address } } }',
);

export const VALIDATOR_ACCOUNT_TEMPLATE = _.template(`
  query VALIDATOR_ACCOUNT_TEMPLATE($account_address: String = "") {
    <%= chain %> {
      validator {
        jailed
        image_url
        description
        account_address
        operator_address
        delegators(where: {delegator_address: {_eq: $account_address}}) {
          amount
          delegator_address
          id
        }
      }
      account(where: {address: {_eq: $account_address}}) {
        spendable_balances
        balances
      }
    }
  }
`);
