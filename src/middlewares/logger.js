const morgan = require('morgan');
const config = require('../config/config.js');

// Gunakan format 'dev' untuk development, dan 'combined' untuk production
const logger = morgan(isDevelopment ? 'dev' : 'combined');

module.exports = logger;