"use client";

import { Card } from "@/components/ui/card/Card";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/config";

// Individual transaction interfaces
interface BaseTransaction {
  id: number;
  amount: number;
  status: string;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
}

interface RideTransaction extends BaseTransaction {
  type: 'ride';
  driver: {
    name: string;
    email: string;
  };
  pickup_address: string;
  dropoff_address: string;
}

interface DispatchTransaction extends BaseTransaction {
  type: 'dispatch';
  tracking_id: string;
  dispatcher: {
    name: string;
    email: string;
  };
  pickup_location: string;
  delivery_location: string;
}

type TransactionType = RideTransaction | DispatchTransaction;

interface ApiResponse<T> {
  success: boolean;
  data: T[];
}

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Fetch 10 transactions from each type
        const [ridesResponse, dispatchesResponse] = await Promise.all([
          axios.get<ApiResponse<RideTransaction>>(`${API_URL}/api/v1/admin/rides`, {
            params: {
              per_page: 10,
              order_by: 'created_at',
              order: 'desc'
            },
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }),
          axios.get<ApiResponse<DispatchTransaction>>(`${API_URL}/api/v1/admin/dispatches`, {
            params: {
              per_page: 10,
              order_by: 'created_at',
              order: 'desc'
            },
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          })
        ]);

        const rides: RideTransaction[] = ridesResponse.data.data.map(ride => ({
          ...ride,
          type: 'ride',
        }));

        const dispatches: DispatchTransaction[] = dispatchesResponse.data.data.map(dispatch => ({
          ...dispatch,
          type: 'dispatch',
        }));

        // Combine and sort all transactions by date
        const combined = [...rides, ...dispatches]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 10); // Only show 10 most recent transactions

        setTransactions(combined);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'pending':
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card className="border-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : transactions.length === 0 ? (
        <div>No transactions found</div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={`${transaction.type}-${transaction.id}`}
              className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{transaction.type === 'ride' ? '🚗' : '📦'}</span>
                  <div>
                    <p className="font-medium">
                      {transaction.type === 'ride' 
                        ? `${transaction.user.name} - ${transaction.driver.name}`
                        : `${transaction.user.name} - ${transaction.dispatcher.name}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {transaction.type === 'ride'
                        ? `${transaction.pickup_address} → ${transaction.dropoff_address}`
                        : `${transaction.pickup_location} → ${transaction.delivery_location}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium">{formatAmount(transaction.amount)}</p>
                  <p className="text-sm text-gray-500">{formatDate(transaction.created_at)}</p>
                </div>
                <div>
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      transaction.status
                    )}`}
                  >
                    {transaction.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
