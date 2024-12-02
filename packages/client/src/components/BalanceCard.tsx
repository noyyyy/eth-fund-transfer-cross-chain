import { formatEther } from "viem";
import { TransferForm } from "./TransferForm";
import { NativeBalance, ERC20Balance } from "../types";

interface BalanceCardProps {
  nativeBalances?: NativeBalance[];
  erc20Balances?: ERC20Balance[];
  address: string;
  chainId?: number;
  availableChains: NativeBalance[];
}

export function BalanceCard({
  nativeBalances,
  erc20Balances,
  address,
  chainId,
  availableChains,
}: BalanceCardProps) {
  const nativeBalance = nativeBalances?.find(
    (b) => b.networkChainId == chainId,
  );
  const chainErc20Balances =
    erc20Balances?.filter((b) => b.networkChainId == chainId) ?? [];

  return (
    <div className="p-4 rounded-lg shadow-md border hover:shadow-lg transition-shadow">
      <p className="font-semibold mb-2">Chain ID: {chainId}</p>
      {nativeBalance && (
        <p className="font-mono">
          Native Balance: {formatEther(BigInt(nativeBalance.balance))}{" "}
          {chainId === 11155111 ? "ETH" : "MNT"}
        </p>
      )}
      {chainErc20Balances.map((token) => (
        <p key={token.id} className="font-mono">
          {token.symbol} Balance: {formatEther(BigInt(token.balance))}
        </p>
      ))}
      <TransferForm
        currentChainId={chainId ?? 11155111}
        address={address}
        availableChains={availableChains}
        nativeBalance={nativeBalance}
        erc20Balances={chainErc20Balances}
      />
    </div>
  );
}
