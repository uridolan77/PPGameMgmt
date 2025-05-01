const config = {
  apiUrl: process.env.NODE_ENV === 'production'
    ? '/api'
    : 'https://localhost:7210/api'  // Keep the /api suffix
};

export default config;