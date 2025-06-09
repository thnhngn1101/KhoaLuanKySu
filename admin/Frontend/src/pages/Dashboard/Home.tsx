import BusMetrics from "../../components/Dashboard/BusMetrics";
import MonthlySalesChart from "../../components/Dashboard/MonthlySalesChart";
import RevenueByRoutePieChart from "../../components/Dashboard/RevenueByRoutePieChart";
import PassengerStats from "../../components/Dashboard/PassengerStats";
// import MonthlyTarget from "../../components/Dashboard/MonthlyTarget";

export default function Home() {
  return (
    <div className="space-y-8 p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Dòng 1: Tổng quan */}
      <BusMetrics />
      {/* Dòng 2: Doanh thu theo tháng full width */}
      <div className="grid grid-cols-1 gap-8">
        <MonthlySalesChart />
      </div>
      {/* Dòng 3: Pie chart + thống kê chi tiết */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <RevenueByRoutePieChart />
        <PassengerStats />
      </div>
    </div>
  );
}
