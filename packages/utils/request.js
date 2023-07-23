const axios = require('axios');
const BASE_URL = 'https://api.github.com';

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

request.interceptors.response.use((response) => {
  return response.data;
}, (err) => {
  return Promise.reject(err);
});

module.exports = request;