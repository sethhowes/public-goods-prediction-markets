import { CHAIN } from "../../shared/chains.enum";
import { BaseEventHandler, ContractDetail, EventNameWithHandler, NotificationDetail, ParsedEventData } from "../../model/baseEventHandler";
import { TransferEventData } from "./events";
import { BigNumber} from "@ethersproject/bignumber";



export class TrasnferEventHandelr extends BaseEventHandler {

    formatUSDCValue(value: BigNumber): string {
        const decimals = 6;
        const divisor = BigNumber.from(10).pow(decimals);
        const humanReadableValue = value.div(divisor);
        return humanReadableValue.toString();
    }

    tokenSymbol = 'USDC';

    getContractDetails(): ContractDetail[] {
        return [
            {
                chain: CHAIN.POLYGON,
                address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
            }
        ];
    }

    getEventsToRegister(): EventNameWithHandler[] {
        return [
            {
                eventName: 'Transfer',
                eventHandler: this.eventProcessor
            }
        ];
    }

    eventProcessor = (parsedEventData: ParsedEventData): NotificationDetail[] => {
        const eventData = parsedEventData.eventData as TransferEventData;
        const value = BigNumber.from(eventData.value);
        if (value.isZero()) return [];
        const tokenValue = this.formatUSDCValue(value);
        const tokenSymbol = this.tokenSymbol;
        return [
            {
                address: eventData.to, // Wallet address to be notified
                title: `${tokenSymbol} trasnfer`, // Short title of the event
                message: `You have received ${tokenValue} ${tokenSymbol} token from ${eventData.from}.`,
                options: { // Use case specific options which would need updates on the consumer side of notification to handle
                    'url': "www.cypherwallet.io",
                }
            },
            {
                address: eventData.from, // Wallet address to be notified
                title: `${tokenSymbol} trasnfer`, // Short title of the event
                message: `You have transferred ${tokenValue} ${tokenSymbol} token from ${eventData.from} to ${eventData.to}.`,
                options: { // Use case specific options which would need updates on the consumer side of notification to handle
                    'url': "www.cypherwallet.io",
                }
            },
        ]
    }
}