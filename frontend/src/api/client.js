import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s timeout for quantum simulation tasks
});

export const checkHealth = async () => {
  const rootUrl = API_BASE_URL.replace('/api/v1', '');
  const response = await axios.get(`${rootUrl}/health`, { timeout: 5000 });
  return response.data;
};

export const fetchSupportedTickers = async () => {
  const response = await apiClient.get('/supported-tickers');
  return response.data;
};

export const analyzeBCTC = async (ticker) => {
  const response = await apiClient.post('/analyze-report', { ticker });
  return response.data;
};

export const uploadAndAnalyzePDF = async (ticker, file) => {
  const formData = new FormData();
  formData.append('ticker', ticker);
  formData.append('file', file);
  const response = await apiClient.post('/analyze-pdf', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const runOptimization = async (params) => {
  const response = await apiClient.post('/optimize', params);
  return response.data;
};

export const fetchBacktest = async (params) => {
  const response = await apiClient.post('/backtest', params);
  return response.data;
};

export default apiClient;
