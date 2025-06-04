import type { Metadata } from "next";
import React from "react";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { PerformanceChart } from "@/components/admin/PerformanceChart";
import { RecentTransactions } from "@/components/admin/RecentTransactions";

export const metadata: Metadata = {
  title:
    "kaaafika Dashboard",
  description: "Fintech",
};

export default function AdminDashboard() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
      <div className="col-span-12">
        <DashboardStats />
      </div>

      <div className="col-span-12 xl:col-span-8">
        <PerformanceChart />
      </div>

      <div className="col-span-12 xl:col-span-4">
        <RecentTransactions />
      </div>
    </div>
  );
}
