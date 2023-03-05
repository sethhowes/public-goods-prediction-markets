import { BaseEventHandler, ContractDetail, EventNameWithHandler, NotificationDetail, ParsedEventData } from "../../model/baseEventHandler";
import { CHAIN } from "../../shared/chains.enum";
import { PoolingEventData } from "./events";
import { BigNumber} from "@ethersproject/bignumber";

export class PoolingEventHandler extends BaseEventHandler {
    formatMATICValue(value: BigNumber): string {
        const decimals = 18;
        const divisor = BigNumber.from(10).pow(decimals);
        const humanReadableValue = value.div(divisor);
        return humanReadableValue.toString();
    }

    getContractDetails(): ContractDetail[] {
        console.log(process.env.POOLING_CONTRACT_ADDRESS)
        return [
            {
                address: process.env.POOLING_CONTRACT_ADDRESS || '0x0',
                chain: CHAIN.POLYGON,
            }
        ]
    }

    getEventsToRegister(): EventNameWithHandler[] {
        return [
            {
                eventName: 'Pooling',
                eventHandler: this.eventProcessor
            }
        ]
    }

    eventProcessor = (parsedEventData: ParsedEventData): NotificationDetail[] => {
        const eventData = parsedEventData.eventData as PoolingEventData;
        const value = BigNumber.from(eventData.betAmount);
        const betAmount = this.formatMATICValue(value);

        return [
            {
                address: eventData._user, // Wallet address to be notified
                title: 'Bet placed on a Pool on Cognoscenti', // Short title of the event
                message: `You have just placed a bet of ${betAmount} MATIC on Cognoscenti`,
                options: { // Use case specific options which would need updates on the consumer side of notification to handle
                    'url': "https://sci-predict.vercel.app/",
                }
            },
        ]
    }

}