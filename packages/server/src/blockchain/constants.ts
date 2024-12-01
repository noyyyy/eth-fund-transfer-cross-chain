import { Address } from "viem";
import { mantleSepoliaTestnet, sepolia } from "viem/chains";

export const BridgeAddresses: Record<number, Address> = {
  [sepolia.id]: "0x21F308067241B2028503c07bd7cB3751FFab0Fb2",
  [mantleSepoliaTestnet.id]: "0x4200000000000000000000000000000000000010",
};

export const FinalizedBlockNumber: Record<number, bigint> = {
  [sepolia.id]: 35n,
  [mantleSepoliaTestnet.id]: 10n,
};

export const ChainMap = {
  11155111: sepolia,
  5003: mantleSepoliaTestnet,
};

// export const tokenMap = {
//   [mantleSepoliaTestnet.id]: ["0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111"],
// };

export const BridgeAbi = [
  {
    inputs: [
      { internalType: "uint32", name: "_minGasLimit", type: "uint32" },
      { internalType: "bytes", name: "_extraData", type: "bytes" },
    ],
    name: "depositETH",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "extraData",
        type: "bytes",
      },
    ],
    name: "ETHDepositInitiated",
    type: "event",
  },
] as const;
