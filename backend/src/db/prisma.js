const { PrismaClient } = require('@prisma/client');
const config = require('../config/config');

const prisma = new PrismaClient({
  log: config.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

module.exports = prisma;
