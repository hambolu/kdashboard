"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card/Card";
import { useEffect, useState } from "react";
import { api } from "@/config";
import { useAuth } from "@/context/AuthContext";
import clsx from "clsx";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  ArrowTrendingUpIcon,
  ChartBarIcon,
  UsersIcon,
  WalletIcon,
  TruckIcon,
  UserGroupIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";


const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount);
};

interface StatsData {
  users: {
    total: number;
    new: number;
    active: number;
  };
  drivers: {
    total: number;
    new: number;
    active: number;
  };
  rides: {
    total: number;
    completed: number;
    cancelled: number;
  };
  transactions: {
    total_revenue: number;
    successful: number;
  };
  dispatches: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    revenue: number;
  };
  dispatchers: {
    total: number;
    active: number;
    new: number;
  };
  charts: {
    revenue_by_day: { [key: string]: number };
    rides_by_day: { [key: string]: number };
    dispatches_by_day: { [key: string]: number };
    dispatch_revenue_by_day: { [key: string]: number };
  };
  period: {
    from: string;
    to: string;
  };
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!isAuthenticated) {
          setLoading(false);
          setError('Please log in to access the dashboard');
          return;
        }

        // Get token directly
        const token = localStorage.getItem('token');
        console.debug('[Dashboard Debug] Fetching stats:', { 
          hasToken: !!token,
          isAuthenticated,
          path: '/api/v1/admin/dashboard'
        });

        if (!token) {
          throw new Error('No auth token found');
        }

        const response = await api.get<{success: boolean; message: string; data: StatsData}>('/api/v1/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        // Log successful response
        console.debug('[Dashboard Debug] Stats response:', {
          success: response.data.success,
          hasData: !!response.data.data
        });

        if (response.data.success && response.data.data) {
          setStats(response.data.data);
          setError(null);
        } else {
          throw new Error(response.data.message || 'Failed to fetch dashboard data');
        }
      } catch (err: any) {
        console.error('[Dashboard Debug] Error details:', {
          status: err.response?.status,
          message: err.message,
          responseData: err.response?.data,
          headers: err.response?.headers
        });

        const errorMessage = err.response?.data?.message || err.message || 'Failed to load dashboard data';
        setError(errorMessage);

        // Only retry on network errors or 5xx server errors
        if (retryCount < maxRetries && (!err.response || err.response.status >= 500)) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            fetchStats();
          }, Math.min(1000 * Math.pow(2, retryCount), 10000));
        }
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated, retryCount]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!stats) {
    return <div className="p-4 text-center text-gray-500">No dashboard statistics available</div>;
  }

  const adminStatCards = [
    {
      title: 'Total Users',
      value: stats.users.total,
      change: ((stats.users.new / stats.users.total) * 100) || 0,
      icon: <UsersIcon className="h-4 w-4" />,
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.transactions.total_revenue),
      change: stats.transactions.successful > 0 ? ((stats.transactions.total_revenue / stats.transactions.successful)) : 0,
      icon: <ArrowTrendingUpIcon className="h-4 w-4" />,
    },
    {
      title: 'Completed Rides',
      value: stats.rides.completed,
      change: ((stats.rides.completed / stats.rides.total) * 100) || 0,
      icon: <ChartBarIcon className="h-4 w-4" />,
    },
    {
      title: 'Total Drivers',
      value: stats.drivers.total,
      change: ((stats.drivers.active / stats.drivers.total) * 100) || 0,
      icon: <UserGroupIcon className="h-4 w-4" />,
    },
    {
      title: 'Total Dispatches',
      value: stats.dispatches.total,
      change: ((stats.dispatches.completed / stats.dispatches.total) * 100) || 0,
      icon: <TruckIcon className="h-4 w-4" />,
    },
    {
      title: 'Dispatch Revenue',
      value: formatCurrency(stats.dispatches.revenue),
      change: stats.dispatches.completed > 0 ? ((stats.dispatches.revenue / stats.dispatches.completed)) : 0,
      icon: <WalletIcon className="h-4 w-4" />,
    },
    {
      title: 'Total Dispatchers',
      value: stats.dispatchers.total,
      change: ((stats.dispatchers.active / stats.dispatchers.total) * 100) || 0,
      icon: <ShoppingBagIcon className="h-4 w-4" />,
    },
    {
      title: 'Active Dispatchers',
      value: stats.dispatchers.active,
      change: ((stats.dispatchers.new / stats.dispatchers.total) * 100) || 0,
      icon: <UserGroupIcon className="h-4 w-4" />,
    },
  ];

  

  const statCards = adminStatCards;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {statCards.map((card, index) => (
        <Card key={index} className="dark:border-gray-800 dark:bg-white/[0.03]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-800 dark:text-white/90">
              {card.title}
            </CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800 dark:text-white/90">{card.value}</div>
            <p className="text-xs text-muted-foreground text-gray-800 dark:text-white/90">
              <span className={clsx(
                "inline-flex items-center ",
                card.change > 0 ? "text-green-600" : "text-red-600"
              )}>
                {card.change > 0 ? "+" : ""}{card.change.toFixed(1)}%
              </span>
              {" "}from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
