import { useState } from "react";
import { NativeBalance, ERC20Balance } from "../types";
import { BASE_URL } from "../App";
import { formatEther, parseEther, zeroAddress } from "viem";

interface Token {
  address: string;
  symbol: string;
  balance: string;
}

interface TransferFormProps {
  currentChainId: number;
  address: string;
  availableChains: NativeBalance[];
  nativeBalance?: NativeBalance;
  erc20Balances?: ERC20Balance[];
}

export function TransferForm({
  currentChainId,
  availableChains,
  nativeBalance,
  erc20Balances,
}: TransferFormProps) {
  const [amount, setAmount] = useState("");
  const [targetChain, setTargetChain] = useState("");
  const [selectedToken, setSelectedToken] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  // 组合所有可用的代币
  const availableTokens: Token[] = [
    // Native token
    ...(nativeBalance
      ? [
          {
            address: zeroAddress,
            symbol: currentChainId === 11155111 ? "ETH" : "MNT",
            balance: nativeBalance.balance,
          },
        ]
      : []),
    // ERC20 tokens
    ...(erc20Balances?.map((token) => ({
      address: token.contractAddress,
      symbol: token.symbol,
      balance: token.balance,
    })) || []),
  ];

  const handleTransfer = async () => {
    if (!amount || !targetChain || !selectedToken) {
      alert("Please enter amount, select token and destination chain");
      return;
    }

    try {
      setIsTransferring(true);
      const response = await fetch(`${BASE_URL}/api/transfer/task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromChainId: currentChainId,
          toChainId: targetChain,
          amount: parseEther(amount).toString(),
          fromTokenAddress: selectedToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Transfer failed");
      }

      await response.json();
      alert("Transfer initiated successfully!");
      setAmount("");
      setTargetChain("");
    } catch (error) {
      console.error("Transfer error:", error);
      alert("Failed to transfer. Please try again.");
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <input
            type="number"
            placeholder="Amount"
            className="p-2 rounded border w-full pr-16"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm opacity-70">
            {availableTokens.find((t) => t.address === selectedToken)?.symbol ||
              ""}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <select
          className="p-2 rounded border w-full"
          value={selectedToken}
          onChange={(e) => setSelectedToken(e.target.value)}
        >
          <option value="" disabled>
            Select token
          </option>
          {availableTokens.map((token) => (
            <option key={token.address} value={token.address}>
              {token.symbol} ({formatEther(BigInt(token.balance))} available)
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <select
          className="p-2 rounded border w-full"
          value={targetChain}
          onChange={(e) => setTargetChain(e.target.value)}
        >
          <option value="" disabled>
            Select destination chain
          </option>
          {availableChains
            .filter((b) => b.networkChainId !== currentChainId)
            .map((b) => (
              <option key={b.networkChainId} value={b.networkChainId}>
                Chain {b.networkChainId}
              </option>
            ))}
        </select>
        <button
          className="px-4 py-2 rounded border hover:bg-gray-100 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleTransfer}
          disabled={isTransferring || !amount || !targetChain}
        >
          {isTransferring ? "Transferring..." : "Transfer"}
        </button>
      </div>
    </div>
  );
}
