import "./App.css";
import useSWR from "swr";
import { BalanceCard } from "./components/BalanceCard";
import { TransferTasks } from "./components/TransferTasks";
import { ApiResponse } from "./types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export const BASE_URL = `http://localhost:5001`;

function App() {
  const { data, error, isLoading } = useSWR<ApiResponse>(
    `${BASE_URL}/api/account`,
    fetcher,
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  if (!data) return <div>No data</div>;

  return (
    <>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Account Details</h2>
        <p className="mb-4">
          Address: <span className="font-mono">{data.account.address}</span>
        </p>
        <h3 className="text-xl font-semibold mb-4">Native Balances:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {data.account.NativeBalance.map((balance) => (
            <BalanceCard
              key={balance.id}
              balance={balance}
              address={data.account.address}
              availableChains={data.account.NativeBalance}
            />
          ))}
        </div>
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Transfer Tasks:</h3>
          <TransferTasks />
        </div>
      </div>
    </>
  );
}

export default App;
