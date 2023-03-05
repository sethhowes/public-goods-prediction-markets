import { TrasnferEventHandelr } from "../../src/handlers/ERC20/transfer";
import { CHAIN } from "../../src/shared/chains.enum";

describe("TransferEvent", () => {
  it("is parsing the right Transfer event", () => {
    const transferEventHandler = new TrasnferEventHandelr();
    const result =  transferEventHandler.getEventsToRegister()[0].eventHandler(CHAIN.POLYGON, '0x1', 'Transfer', { from: 'ABC', to: 'DEF', value: 12345})
    expect(
        result[0].address
    ).toBe(
        'DEF'
    );
  });
});