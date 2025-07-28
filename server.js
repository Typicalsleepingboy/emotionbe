// backend/server.js
import app from './src/app.js';
import config from './src/config/index.js';

const PORT = config.port || 3000; // Fallback jika config.port tidak ada

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
  console.log(`MongoDB URI: ${config.mongodbUri ? 'Loaded' : 'NOT LOADED - Check .env'}`);
  console.log(`JWT Secret: ${config.jwtSecret ? 'Loaded' : 'NOT LOADED - Check .env'}`);
  console.log(`API Key Secret: ${config.apiKeySecret ? 'Loaded' : 'NOT LOADED - Check .env'}`);
  console.log(`Access API at http://localhost:${PORT}/api`);
});