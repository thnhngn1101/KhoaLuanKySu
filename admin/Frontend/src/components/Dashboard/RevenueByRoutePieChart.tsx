import { useEffect, useState } from "react";
import { dashboardService } from "../../services/dashboardService";
import TimeFilter from "./TimeFilter";
import { Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    Title,
} from "chart.js";
import { formatVND } from "../../utils/formatCurrency";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const COLORS = [
    '#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#facc15', '#4ade80', '#38bdf8', '#818cf8', '#f472b6', '#fcd34d'
];

export default function RevenueByRoutePieChart() {
    const [data, setData] = useState<{ bus: string, revenue: number }[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('year');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const stats = await dashboardService.getStatistics(timeFilter);
                setData(stats.revenue_by_bus || []);
                setTotal(stats.total_revenue || 0);
            } catch (e) {
                setData([]);
                setTotal(0);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [timeFilter]);

    const chartData = {
        labels: data.map(item => item.bus),
        datasets: [
            {
                data: data.map(item => item.revenue),
                backgroundColor: COLORS,
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: { color: '#374151', font: { weight: 'bold' as const } },
            },
            title: {
                display: true,
                text: 'Tỷ lệ doanh thu theo xe',
                color: '#f87171',
                font: { size: 20, weight: 'bold' as const },
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => `${context.label}: ${formatVND(context.parsed)}`,
                },
            },
        },
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2 md:mb-0">Tổng doanh thu & theo xe</h2>
                <TimeFilter selectedFilter={timeFilter} onFilterChange={setTimeFilter} />
            </div>
            <div className="mb-4 text-2xl font-bold text-pink-600">Tổng doanh thu: {formatVND(total)}</div>
            <Pie data={chartData} options={options} />
        </div>
    );
} 