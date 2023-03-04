import { Chain } from 'wagmi'
 
export const scroll = {
  id: 534353,
  name: 'Scroll Alpha Testnet',
  network: 'scroll',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ["https://alpha-rpc.scroll.io/l2"] },
    default: { http: ["https://alpha-rpc.scroll.io/l2"] },
  },
  blockExplorers: {
    default: { name: 'SnowTrace', url: 'https://blockscout.scroll.io' },
  },
}

export const mantle = {
    id: 5001,
    name: 'Mantle',
    network: 'Mantle Testnet',
    nativeCurrency: {
      decimals: 18,
      name: 'BitDAO',
      symbol: 'BIT',
    },
    rpcUrls: {
      public: { http: ['https://rpc.testnet.mantle.xyz'] },
      default: { http: ['https://rpc.testnet.mantle.xyz'] },
    },
    blockExplorers: {
      default: { name: 'SnowTrace', url: 'https://explorer.testnet.mantle.xyz' },
    },
  }