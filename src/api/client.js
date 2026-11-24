import axios from 'axios';

const API_BASE = (import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL || 'https://smartsort.ezzar.my.id'
).replace(/\/+$/, '');

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'X-API-Key': import.meta.env.VITE_API_KEY || ''
  }
});

export { API_BASE };
