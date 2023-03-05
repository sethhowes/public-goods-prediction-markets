import { BaseEventHandler, ContractDetail, EventNameWithHandler, NotificationDetail, ParsedEventData } from "../../model/baseEventHandler";
import { CHAIN } from "../../shared/chains.enum";
import { BetEventData } from "./events";
import { BigNumber} from "@ethersproject/bignumber";

export class BetEventHandler extends BaseEventHandler {
    formatMATICValue(value: BigNumber): string {
        const decimals = 18;
        const divisor = BigNumber.from(10).pow(decimals);
        const humanReadableValue = value.div(divisor);
        return humanReadableValue.toString();
    }

    getContractDetails(): ContractDetail[] {
        return [
            {
                address: process.env.MAIN_CONTRACT_ADDRESS || '0x0',
                chain: CHAIN.POLYGON,
            }
        ]
    }

    getEventsToRegister(): EventNameWithHandler[] {
        return [
            {
                eventName: 'Bet',
                eventHandler: this.eventProcessor
            }
        ]
    }

    eventProcessor = (parsedEventData: ParsedEventData): NotificationDetail[] => {
        const eventData = parsedEventData.eventData as BetEventData;
        const value = BigNumber.from(eventData.betAmount);
        const betAmount = this.formatMATICValue(value);

        return [
            {
                address: eventData._user, // Wallet address to be notified
                title: 'Bet placed on Cognoscenti', // Short title of the event
                message: `You have just placed a bet of ${betAmount} MATIC on Cognoscenti`,
                options: { // Use case specific options which would need updates on the consumer side of notification to handle
                    'url': "https://sci-predict.vercel.app/",
                }
            },
        ]
    }
}