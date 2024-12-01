import { formatEther } from "viem";
import { TransferForm } from "./TransferForm";
import { NativeBalance } from "../types";

interface BalanceCardProps {
  balance: NativeBalance;
  address: string;
  availableChains: NativeBalance[];
}

export function BalanceCard({
  balance,
  address,
  availableChains,
}: BalanceCardProps) {
  return (
    <div className="p-4 rounded-lg shadow-md border hover:shadow-lg transition-shadow">
      <p className="font-semibold mb-2">Chain ID: {balance.networkChainId}</p>
      <p className="font-mono">
        Native Balance: {formatEther(BigInt(balance.balance))}{" "}
        {balance.networkChainId == "11155111" ? "ETH" : "MNT"}
      </p>
      <TransferForm
        currentChainId={balance.networkChainId}
        address={address}
        availableChains={availableChains}
      />
    </div>
  );
}
