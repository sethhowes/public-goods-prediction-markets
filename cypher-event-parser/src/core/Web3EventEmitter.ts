import { EventEmitter } from 'node:events';
import { BaseEventHandler, ParsedEventData } from '../model/baseEventHandler';
import { Web3EventQueue } from './SQSClient';

export class Web3EventEmitter extends EventEmitter {
    static startApp(eventListeners: BaseEventHandler[]) {
        const INSTANCE = new Web3EventEmitter(eventListeners);

        INSTANCE.emit(`POLYGON:${process.env.MAIN_CONTRACT_ADDRESS}:Bet`,
            {
                chain: 'POLYGON',
                contractAddress: process.env.MAIN_CONTRACT_ADDRESS,
                eventData: {
                    _user: '0x0000000000000000000000000000000000001',
                    betAmount: { type: 'BigNumber', hex: '0x010f0cf064dd59200000'}
                }
            }
        );

        INSTANCE.emit(`POLYGON:${process.env.POOLING_CONTRACT_ADDRESS}:Pooling`,
            {
                chain: 'POLYGON',
                contractAddress: process.env.POOLING_CONTRACT_ADDRESS,
                eventData: {
                    _user: '0x0000000000000000000000000000000000002',
                    betAmount: { type: 'BigNumber', hex: '0x0ad78ebc5ac6200000'}
                }
            }
        );
        // INSTANCE.listenToEventMesssage(new Web3EventQueue());
    }

    constructor(eventListeners: BaseEventHandler[]) {
        super();
        eventListeners.forEach(eventListener => {
            eventListener.registerOnEvents(this);
        })
    }

    listenToEventMesssage(sqs: Web3EventQueue) {
        // eslint-disable-next-line no-console
        console.log('Started pollling messages!');
        setInterval(() => {
            sqs.pollQueue((parsedEventData: ParsedEventData) => {
                // eslint-disable-next-line no-console
                console.log(`Event triggered on ${parsedEventData.chain}:${parsedEventData.contractAddress}:${parsedEventData.eventName}`);
                this.emit(
                    `${parsedEventData.chain}:${parsedEventData.contractAddress}:${parsedEventData.eventName}`,
                    parsedEventData
                );
            })
        }, 10000); // Poll every 10 seconds (adjust as needed)
    }
}

