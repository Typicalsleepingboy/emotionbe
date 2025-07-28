const morgan = require('morgan');
const { isDevelopment } = require('../config');

// Gunakan format 'dev' untuk development, dan 'combined' untuk production
const logger = morgan(isDevelopment ? 'dev' : 'combined');

module.exports = logger;