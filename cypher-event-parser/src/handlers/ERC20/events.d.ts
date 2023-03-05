import { BigNumber } from '@ethersproject/bignumber'
export interface TransferEventData {
    from: string;
    to: string;
    value: BigNumber;
}