import { useEffect, useState } from "react";
import { dashboardService } from "../../services/dashboardService";
import TimeFilter from "./TimeFilter";

export default function PassengerStats() {
    const [data, setData] = useState<{ bus: string, count: number }[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('year');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const stats = await dashboardService.getStatistics(timeFilter);
                setData(stats.count_by_bus || []);
                setTotal((stats.count_by_bus || []).reduce((sum: number, item: { bus: string, count: number }) => sum + item.count, 0));
            } catch (e) {
                setData([]);
                setTotal(0);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [timeFilter]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2 md:mb-0">Số lượng giao dịch theo xe</h2>
                <TimeFilter selectedFilter={timeFilter} onFilterChange={setTimeFilter} />
            </div>
            <div className="mb-4 text-2xl font-bold text-blue-600">Tổng giao dịch: {total}</div>
            <table className="min-w-full divide-y divide-gray-200">
                <thead>
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Biển số xe</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số giao dịch</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, idx) => (
                        <tr key={idx} className="odd:bg-blue-50 even:bg-white">
                            <td className="px-4 py-2 font-semibold text-gray-700">{item.bus}</td>
                            <td className="px-4 py-2 text-blue-700 font-bold">{item.count}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
} 