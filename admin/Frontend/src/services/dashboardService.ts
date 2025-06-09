import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const dashboardService = {
    getMetrics: async (timeFilter: string = 'today') => {
        const response = await axios.get(`${API_URL}/dashboard/metrics?time_filter=${timeFilter}`);
        return response.data;
    },

    getMonthlySales: async (timeFilter: string = 'month') => {
        const response = await axios.get(`${API_URL}/dashboard/monthly-sales?time_filter=${timeFilter}`);
        return response.data;
    },

    getStatistics: async (timeFilter: string = 'month') => {
        const response = await axios.get(`${API_URL}/dashboard/statistics?time_filter=${timeFilter}`);
        return response.data;
    },

    login: async (email: string, password: string) => {
        const response = await axios.post(`${API_URL}/login_user_account/login`, { email, password });
        return response.data;
    }
}; 