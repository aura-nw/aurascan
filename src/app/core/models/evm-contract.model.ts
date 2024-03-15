import { JsonFragment } from 'ethers';

export type JsonAbiType = 'constructor' | 'function' | 'event' | 'fallback';
export type StateMutabilityType = 'pure' | 'view' | 'nonpayable' | 'payable'; // pure (specified to not read blockchain state), view (same as constant above), nonpayable and payable (same as payable above);

export const READ_STATE_MUTABILITY: string[] = ['view'];
export const WRITE_STATE_MUTABILITY: string[] = ['nonpayable', 'payable'];

export interface JsonAbi extends JsonFragment {
  /*   
  type: JsonAbiType;
  stateMutability: StateMutabilityType;
  name: string;
  constant?: boolean; // true if function is specified to not modify the blockchain state;
  payable?: boolean; // true if function accepts ether, defaults to false;
  inputs: {
    name: string;
    type: string;
    indexed?: boolean; // true if the field is part of the log’s topics, false if it one of the log’s data segment.
  }[];
  outputs: {
    name: string;
    type: string;
  }[];
  anonymous?: boolean; // true if the event was declared as anonymous. 
  */
}
