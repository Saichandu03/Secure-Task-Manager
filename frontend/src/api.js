import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

export default api;
