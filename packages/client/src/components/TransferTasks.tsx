import useSWR from "swr";
import { BASE_URL } from "../App";
import { formatEther } from "viem";

interface TransferTask {
  id: number;
  status: string;
  fromChain: string;
  toChain: string;
  fromTokenAddress: string;
  toTokenAddress: string;
  fromTokenAmount: string;
  createdAt: string;
}

interface ApiResponse {
  tasks: TransferTask[];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function TransferTasks() {
  const { data, error, isLoading } = useSWR<ApiResponse>(
    `${BASE_URL}/api/transfer/task`,
    fetcher,
  );

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error loading tasks</div>;
  if (!data) return <div>No tasks found</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              From Chain
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              To Chain
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created At
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.tasks.map((task) => (
            <tr key={task.id}>
              <td className="px-6 py-4 whitespace-nowrap">{task.fromChain}</td>
              <td className="px-6 py-4 whitespace-nowrap">{task.toChain}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {formatEther(BigInt(task.fromTokenAmount))} ETH
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    task.status === "Success"
                      ? "text-green-800"
                      : task.status === "Queue"
                        ? "text-yellow-800"
                        : "text-red-800"
                  }`}
                >
                  {task.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(task.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
