"use client";

import { Card } from "@/components/ui/card/Card";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import axios from "axios";
import { API_URL } from "@/config";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DashboardData {
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
  charts: {
    revenue_by_day: { [key: string]: number };
    rides_by_day: { [key: string]: number };
  };
  period: {
    from: string;
    to: string;
  };
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: DashboardData;
}

type PeriodType = 'today' | 'yesterday' | 'week' | 'month' | 'custom';

export function PerformanceChart() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const params = new URLSearchParams({
          period: selectedPeriod
        });
        
        if (selectedPeriod === 'custom' && dateRange) {
          params.append('from', dateRange.from);
          params.append('to', dateRange.to);
        }

        const response = await axios.get<ApiResponse>(
          `${API_URL}/api/v1/admin/dashboard?${params.toString()}`, 
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (response.data.status) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedPeriod, dateRange]);

  const handleCustomDateSelect = (from: string, to: string) => {
    setSelectedPeriod('custom');
    setDateRange({ from, to });
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }

  const currentRevenue = dashboardData?.transactions.total_revenue || 0;
  // Set target to 20% more than current revenue for demo purposes
  const targetRevenue = currentRevenue * 1.2;
  const percentage = currentRevenue > 0 ? (currentRevenue / targetRevenue) * 100 : 0;

  // Prepare chart data
  const revenueData = dashboardData?.charts.revenue_by_day || {};
  const dates = Object.keys(revenueData);
  const revenues = Object.values(revenueData);

  const series = [{
    name: 'Revenue',
    data: revenues
  }];
  
  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      height: 330,
      sparkline: {
        enabled: false,
      },
      toolbar: {
        show: false
      }
    },
    xaxis: {
      type: 'category',
      categories: dates,
      labels: {
        show: true,
        rotate: -45,
        style: {
          colors: '#718096',
          fontSize: '12px',
        }
      },
    },
    yaxis: {
      labels: {
        formatter: (value) => `₦${value.toLocaleString()}`,
        style: {
          colors: '#718096',
          fontSize: '12px',
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    tooltip: {
      y: {
        formatter: (value) => `₦${value.toLocaleString()}`
      }
    },
    grid: {
      borderColor: '#E2E8F0',
      strokeDashArray: 4,
    },
  };

  return (
    <Card className="h-full dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 pb-5">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Revenue Performance
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {dashboardData?.period.from} to {dashboardData?.period.to}
            </p>
          </div>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as PeriodType)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>

        <div className="relative">
          <div className="max-h-[330px]">
            <ReactApexChart
              options={options}
              series={series}
              type="area"
              height={330}
            />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
              Target Revenue
            </p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
              ₦{targetRevenue.toLocaleString()}
            </p>
          </div>

          <div className="text-center">
            <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
              Current Revenue
            </p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
              ₦{currentRevenue.toLocaleString()}
            </p>
          </div>

          <div className="text-center">
            <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
              Achievement
            </p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {percentage.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
