export interface NativeBalance {
  id: number;
  balance: string;
  accountAddress: string;
  networkChainId: string;
}

export interface Account {
  address: string;
  NativeBalance: NativeBalance[];
}

export interface ApiResponse {
  account: Account;
}
export interface NativeBalance {
  id: number;
  balance: string;
  accountAddress: string;
  networkChainId: string;
}

export interface Account {
  address: string;
  NativeBalance: NativeBalance[];
}

export interface ApiResponse {
  account: Account;
}
