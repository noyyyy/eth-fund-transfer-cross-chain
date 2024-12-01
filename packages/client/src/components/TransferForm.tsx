import { useState } from "react";
import { NativeBalance } from "../types";
import { BASE_URL } from "../App";
import { parseEther, zeroAddress } from "viem";

interface TransferFormProps {
  currentChainId: string;
  address: string;
  availableChains: NativeBalance[];
}

export function TransferForm({
  currentChainId,
  address,
  availableChains,
}: TransferFormProps) {
  const [amount, setAmount] = useState("");
  const [targetChain, setTargetChain] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const handleTransfer = async () => {
    if (!amount || !targetChain) {
      alert("Please enter amount and select destination chain");
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
          fromTokenAddress: zeroAddress, // for sending eth
        }),
      });

      if (!response.ok) {
        throw new Error("Transfer failed");
      }

      const result = await response.json();
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
            {currentChainId == "11155111" ? "ETH" : "MNT"}
          </span>
        </div>
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
