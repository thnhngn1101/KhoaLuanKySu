
interface TimeFilterProps {
    selectedFilter: string;
    onFilterChange: (filter: string) => void;
}

export default function TimeFilter({ selectedFilter, onFilterChange }: TimeFilterProps) {
    return (
        <div className="flex items-center space-x-2 mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Thời gian:</span>
            <select
                value={selectedFilter}
                onChange={(e) => onFilterChange(e.target.value)}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            >
                <option value="today">Hôm nay</option>
                <option value="month">Tháng này</option>
                <option value="year">Năm nay</option>
            </select>
        </div>
    );
} 