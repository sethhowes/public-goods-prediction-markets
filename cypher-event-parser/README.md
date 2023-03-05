**Note:** This is an evolving SDK, if you have any suggestions are recommendation feel free to propose improvements by publishing a PR updating Improvements section below.
# Cypher Wallet Push SDK

## Context
A blockchain user interested to know latest earnings or updates to their wallet intertactions through a decentralized application (dApp) must first vist the dApp through a web-3 enabled browser and connect the wallet. Once connected, the user can navigate to the section of the dApp that displays information of their interest. The dApp will then interact with the blockchain to retrieve the user's wallet data, such as the current balance and transaction history. The dApp will display this information to the user in a user-friendly format, allowing them to see their updated wallet information. The user can then use this information to make informed decisions about their cryptocurrency transactions.  dApp developers have to rely on events form the smart contracts or poll for updates so the latest data can be shown to the user. 

A push notification alerting the users is helpful instead of regularly checking for updates as mentioned above.

## Notifying dApp users

This documentation is targeted at dApp developers to implement logic transforming the on-chain events to user-friendly readable notification messages. 
Developers can focus on transformation logic and leverage the Cypher Wallet Push SDK to handle notifying the users on their preferred channel linked to the Wallet address.

# How it works?
A dApp developer would contribute to this package by writing the transformation logic as a simple TypeScript class adhering to the format defined below:

1. Create a new folder under [handlers](https://github.com/CypherD-IO/web3-event-parser/tree/main/src/handlers) directory for your dapp.
1. Create a new class which ```extends BaseEventHandler```
1. Implement following two abstract methods
   1. ```getContractDetails(): ContractDetail[]``` should return Chain and Contract Address of interest for your handler
   1. ```getEventsToRegister(): EventNameWithHandler[];``` should return events and corresponding handler methods to be invoked.
1. ```handler``` methods for each event should adhere to following return format:
    
    https://github.com/CypherD-IO/web3-event-parser/blob/main/src/model/baseEventHandler.ts#L44-L52
    
    Note: You can return an array of ```NotificationDetail``` if you intend to send different messages for different user.
1. Your handler input parameters will be of format defined below:
   https://github.com/CypherD-IO/web3-event-parser/blob/main/src/model/baseEventHandler.ts#L54-L59
   Note: ```eventData``` field will be mathcing the ABI event signature defined.
1. Testing of your handler can be done by manually triggering as show in sample below:
https://github.com/CypherD-IO/web3-event-parser/blob/main/src/core/Web3EventEmitter.ts#L8-L18

### How to get the test event data to trigger?

To get the event signature data for testing purposes from a blockchain event emitted by a contract, you can follow these steps:

1. Determine the name of the event that you want to test. This information should be available in the contract code.
1. Find the event signature data by hashing the event's name and its input parameter types using the keccak-256 hashing algorithm. You can use an online tool such as Remix to do this.
1. In Remix, go to the "Compile" tab and select your contract. Then, click on the event that you want to test to see its signature data.
1. Copy the event signature data and use it in your testing framework to listen for the event.
1. Once you have the event signature data, use the provided script.

```typescript
import { ethers } from 'ethers';

const provider = ethers.getDefaultProvider('mainnet');

const contractAddress = '0x123...'; // Replace with your contract address
const contractAbi = [...] // Replace with your contract ABI
const eventSignature = '0x123...'; // Replace with your event signature data

const contract = new ethers.Contract(contractAddress, contractAbi, provider);

const filter = {
    fromBlock: 0,
    topics: [eventSignature]
};

contract.on('MyEvent', filter, (event) => {
    console.log(event);
});
```

### Example

For a USDC Transfer event it looks like

```typescript
  { 
    contract: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    eventName: 'Transfer',
    eventData: {
      from: string,
      to: string,
      value: BigNumber
      }
  }
```

The output of this function would be of the following format:

```typescript
[
  {
    address: '0x2',
    title: 'USDC trasnfer',
    message: 'You have received 19 USDC token from 0x1.',
    options: { url: 'www.cypherwallet.io' }
  },
  {
    address: '0x1',
    title: 'USDC trasnfer',
    message: 'You have transferred 19 USDC token from 0x1 to 0x2.',
    options: { url: 'www.cypherwallet.io' }
  }
]
```

## Event types
### Direct user transfer events
A wallet address deposited or withdrawn a specific token. 
Ex: A LP token issued(transferred) to User's wallet address for providing liquidity.

**Notificatoin Address:** Present in the event data.

### Protocol token holder events
A Protocol token representing some underlying tokens could change which doesnt involve Users wallet address.
Ex: A LP Token generated yield which can only be fetched by interacting with Smart Contract(read) by the User's wallet address.

**Notificatoin Address:** User's wallet address needs to be determined based on the Protocol token holders.

### DApp notifications (NOT SUPPORTED YET)
Updates or promotions from the dApp to notify interested users.
Ex: Updates on APY changes for a Liquidity Protocol

**Notificatoin Address:** User's wallet address determined by Push SDK based on user subscription preference.

## Testing
### Unit testing using Jest
Unit testing involves testing individual modules or functions in isolation. In the case of the Event Handler package, each module can be tested individually by providing mock event data and ensuring that the function produces the expected output.

### Integration testing (TBD)
Integration testing can be done by passing in a real event data to the SDK which invokes the dApp custom event handler. The output of notification message will be seen as the response to validate. This will not be sending any notification to users.

# Architecture:

The application is built using an event-driven architecture, where events are received from an external system and then processed by the application. The application is divided into two packages to separate the Core logic from the Event Handler logic. This allows for easy maintenance and scalability of the application.

The Core package is responsible for parsing the event data and invoking the corresponding event handler. The event handler is then invoked with the parsed event data, and it processes the event as required. The input format of the event handler is defined based on the event type.
For a USDC Transfer event it looks like

```typescript
  { 
    contract: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    eventName: 'Transfer',
    eventData: {
      from: string,
      to: string,
      value: BigNumber
      }
  }
```

The Event Handler package contains the implementation of all the event handlers. Each event handler is a separate module that exports a function that processes the event data. When a new event handler is added, it needs to be registered by specifying the event type that it can handle which requires following inputs
1. Chain - Ex: POLYGON
1. Contract - Ex: 0x2791bca1f2de4661ed88a30c99a7a9449aa84174
1. Event name: as emitted by the event contract or its delegator.

Event handler functions are expected to parse the event and perform necessary data ingestion, tranformation to return the human readable notification message. The expected output of the function should follow the following format:

```typescript
{
    'address':<Address> // Wallet address to be notified
    'title': <string>, // Short title of the event
    'message': <string>, // Message to be shown on the notification
    'options': { // Use case specific options which would need updates on the consumer side of notification to handle
        'url': <string>,
    }
}
```

## Implementation:

The application is built using Typescript, which provides type safety and helps catch errors during compilation. The application runs on Node, which provides a lightweight and scalable runtime environment for the application.

The Core package uses the aws-lambda library to handle Lambda events. This library provides a Handler type that can be used to define the event handler function signature. The Core package defines a processEvent function that takes the event data and invokes the corresponding event handler based on the event type. The processEvent function uses a Map to store the registered event handlers and their corresponding event types.

The Event Handler package contains separate modules for each event handler. Each module exports a function that takes the parsed event data and processes it as required. The exported function is of the Handler type, which allows it to be registered with the Core package.

# Improvements
1. Add testing and validation steps
