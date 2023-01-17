
export enum SB_TYPE {
  UNCLAIMED = 'Unclaimed',
  EQUIPPED = 'Equipped',
  UNEQUIPPED = 'Unequipped',
  PENDING = 'Pending'
}

export const SOUL_BOUND_TYPE = [
  {
    key: '',
    value: 'All',
  },
  {
    key: SB_TYPE.UNCLAIMED,
    value: SB_TYPE.UNCLAIMED,
  },
  {
    key: SB_TYPE.EQUIPPED,
    value: SB_TYPE.EQUIPPED,
  },
  {
    key: SB_TYPE.UNEQUIPPED,
    value: SB_TYPE.UNEQUIPPED,
  },
];

export const LIMIT_NUM_SBT = 5;