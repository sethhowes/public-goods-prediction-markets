import { CHAIN } from "../../shared/chains.enum";
import { BaseEventHandler, ContractDetail, EventNameWithHandler, NotificationDetail, ParsedEventData } from "../../model/baseEventHandler";

export class Winner extends BaseEventHandler {

    //ERC20 token data needed, 1. Symbol, 2. Decimals
    // contractToSymbolMap: Map<string, string> = new Map(
    //     [
    //         '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', 'USDC'
    //     ]
    // );

    getContractDetails(): ContractDetail[] {
        return [
            {
                chain: CHAIN.POLYGON,
                address: '0xcf6030BDEaB4E503D186426510aD88C1DA7125A3'
            }
        ];
    }

    getEventsToRegister(): EventNameWithHandler[] {
        return [
            {
                eventName: 'PrizeDistributionSet',
                eventHandler: this.eventProcessor
            }
        ];
    }

    eventProcessor = (parsedEventData: ParsedEventData): NotificationDetail[] => {
        // Can be returning multiple notification message. Or same message to multiple addresses
        return [
            {
                address: '0x1', // Wallet address to be notified
                title: 'Pool Together Prize!', // Short title of the event
                message: `You have won a prize on PoolTogether.`,
                options: { // Use case specific options which would need updates on the consumer side of notification to handle
                    'url': "www.cypherwallet.io",
                }
            }
        ]
    }
}