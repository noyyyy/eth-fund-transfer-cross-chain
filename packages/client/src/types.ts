export interface NativeBalance {
  id: number;
  balance: string;
  accountAddress: string;
  networkChainId: number;
}

export interface Account {
  address: string;
  NativeBalance: NativeBalance[];
  ERC20Balance: ERC20Balance[];
}

export interface ApiResponse {
  account: Account;
}

export interface ERC20Balance {
  id: number;
  balance: string;
  symbol: string;
  contractAddress: string;
  accountAddress: string;
  networkChainId: number;
}

export interface Account {
  address: string;
  NativeBalance: NativeBalance[];
}

export interface ApiResponse {
  account: Account;
}
