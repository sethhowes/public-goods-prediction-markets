import dotenv from "dotenv";
import { BaseEventHandler } from './model/baseEventHandler';
import { Web3EventEmitter } from './core/Web3EventEmitter';
import { BetEventHandler } from "./handlers/myDapp/betEvent";
import { PoolingEventHandler } from "./handlers/myDapp/poolingEvent";

dotenv.config();
const eventListeners: BaseEventHandler[] =
    [
        // Register your event handler here.
        new BetEventHandler(),
        new PoolingEventHandler(),
    ];

Web3EventEmitter.startApp(eventListeners);