import { STAKING_TYPE_ENUM } from "./validator.enum";

export const TYPE_STAKING = [
  { label: STAKING_TYPE_ENUM.Redelegate, value: STAKING_TYPE_ENUM.Redelegate },
  { label: STAKING_TYPE_ENUM.Undelegate, value: STAKING_TYPE_ENUM.Undelegate },
]
export enum VOTING_POWER_STATUS {
  VOTING_POWER_NORMAL = "1",
  VOTING_POWER_MEDIUM = "2",
  VOTING_POWER_HIGH = "3",
}
