import BusMetrics from "./BusMetrics";
import MonthlySalesChart from "./MonthlySalesChart";
import RevenueByRoutePieChart from "./RevenueByRoutePieChart";
import PassengerStats from "./PassengerStats";

export default function Dashboard() {
    return (
        <div className="space-y-8 p-4 md:p-8 bg-gray-50 min-h-screen">
            <BusMetrics />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <MonthlySalesChart />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <RevenueByRoutePieChart />
                <PassengerStats />
            </div>
        </div>
    );
} 