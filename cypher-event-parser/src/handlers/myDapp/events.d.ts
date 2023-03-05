import { BigNumber } from '@ethersproject/bignumber'



export interface BetEventData {
    _user: string;
    betAmount: BigNumber;
}

export interface PoolingEventData {
    _user: string;
    betAmount: BigNumber;
}