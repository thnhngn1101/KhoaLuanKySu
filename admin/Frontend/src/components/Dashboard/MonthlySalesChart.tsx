import { useEffect, useState, useRef } from "react";
import { dashboardService } from "../../services/dashboardService";
// import TimeFilter from "./TimeFilter";
import { formatVND } from "../../utils/formatCurrency";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface MonthlySale {
  month: string;
  total: number;
}

const MONTHS = [
  'T1', 'T2', 'T3', 'T4', 'T5', 'T6',
  'T7', 'T8', 'T9', 'T10', 'T11', 'T12'
];

export default function MonthlySalesChart() {
  const [salesData, setSalesData] = useState<MonthlySale[]>([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef<any>(null);
  // const [timeFilter, setTimeFilter] = useState('year');

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getMonthlySales('year');
        setSalesData(data);
      } catch (error) {
        console.error('Error fetching sales:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  // Map dữ liệu vào 12 tháng
  const salesByMonth: Record<string, number> = {};
  salesData.forEach(item => {
    const idx = new Date(Date.parse(item.month + ' 1, 2000')).getMonth();
    salesByMonth[MONTHS[idx]] = item.total;
  });

  // Gradient fill
  const getGradient = (ctx: CanvasRenderingContext2D, chartArea: any) => {
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, 'rgba(236, 72, 153, 0.4)'); // hồng đậm
    gradient.addColorStop(1, 'rgba(236, 72, 153, 0.05)'); // hồng nhạt
    return gradient;
  };

  const chartData = {
    labels: MONTHS,
    datasets: [
      {
        label: "Doanh thu",
        data: MONTHS.map(m => salesByMonth[m] || 0),
        borderColor: (ctx: any) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return '#ec4899';
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, '#ec4899');
          gradient.addColorStop(1, '#fbcfe8');
          return gradient;
        },
        backgroundColor: (ctx: any) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return 'rgba(236, 72, 153, 0.1)';
          return getGradient(canvasCtx, chartArea);
        },
        tension: 0.5,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHitRadius: 16,
        pointBackgroundColor: '#ec4899',
        borderWidth: 3,
        pointBorderWidth: 2,
        pointHoverBorderColor: '#be185d',
        pointHoverBackgroundColor: '#fff',
        clip: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#fff',
        titleColor: '#be185d',
        bodyColor: '#be185d',
        borderColor: '#ec4899',
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => formatVND(context.parsed.y),
        },
      },
    },
    scales: {
      y: {
        display: false,
        beginAtZero: true,
        min: 0,
        ticks: {},
        grid: { display: false },
      },
      x: {
        display: false,
        ticks: {},
        grid: { display: false },
      },
    },
    elements: {
      line: {
        borderJoinStyle: 'round' as const,
        borderCapStyle: 'round' as const,
      },
    },
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2 md:mb-0">Doanh thu theo tháng</h2>
      </div>
      <div className="relative">
        <Line ref={chartRef} data={chartData} options={{
          ...options,
          scales: {
            ...options.scales,
            x: {
              display: true,
              ticks: {
                color: '#be185d',
                font: { weight: 'bold' as const, size: 10 },
                padding: 2,
              },
              grid: { display: false },
            },
          },
        }} height={70} />
      </div>
    </div>
  );
}
