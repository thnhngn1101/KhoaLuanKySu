import { useEffect, useState } from "react";
import { dashboardService } from "../../services/dashboardService";
import TimeFilter from "./TimeFilter";
import { formatVND } from "../../utils/formatCurrency";

interface Metrics {
  total_passengers: number;
  today_trips: number;
  successful_payments: number;
  today_revenue: number;
}

export default function BusMetrics() {
  const [metrics, setMetrics] = useState<Metrics>({
    total_passengers: 0,
    today_trips: 0,
    successful_payments: 0,
    today_revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('today');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getMetrics(timeFilter);
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [timeFilter]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2 md:mb-0">Tổng quan hệ thống</h2>
        <TimeFilter selectedFilter={timeFilter} onFilterChange={setTimeFilter} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-100 to-blue-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Tổng hành khách</div>
          <div className="mt-2 text-2xl font-bold text-blue-700 dark:text-white">
            {metrics.total_passengers.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-green-100 to-green-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Số chuyến</div>
          <div className="mt-2 text-2xl font-bold text-green-700 dark:text-white">
            {metrics.today_trips.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-yellow-100 to-yellow-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Thanh toán thành công</div>
          <div className="mt-2 text-2xl font-bold text-yellow-700 dark:text-white">
            {metrics.successful_payments.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-pink-100 to-pink-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Doanh thu</div>
          <div className="mt-2 text-2xl font-bold text-pink-700 dark:text-white">
            {formatVND(metrics.today_revenue)}
          </div>
        </div>
      </div>
    </div>
  );
}
